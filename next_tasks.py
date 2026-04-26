"""next_tasks.py — 次回タスク忘却の構造処方（層A）

Nao_u 2026-04-26 #human-steering 14:24「ほんとに漏れはない？フォーマットを LLM が
正しく出せなくなった途端に破綻しそう」への構造的応答。

LLM 出力フォーマットを単一ソースから外す。タスクの実体を JSONL に置き、
書く・読む・終わりにするを CLI 経由に固定。書式の揺れ＝ファイル状態の揺れに
ならないようにする。

ファイル: memory/next_tasks_<instance>.jsonl (append-only)
1行1イベント: {ts, instance, cycle, action, task_id, task?, reason?}
action: add / done / skip / viewed / cycle_check

Mir C126 設計合意 (2026-04-26):
- インスタンス引数で Log/Mir/Ash 別 jsonl
- pending 出力に「連続pendingサイクル数」付記（L6 対策）
- cycle_check で add=0 検出 → Slack 通知（warning がログに埋もれない）

CLI:
  next_tasks.py add "<task>" [--instance log|mir|ash] [--cycle CXXX]
  next_tasks.py done <task_id>  [--instance ...] [--cycle ...]
  next_tasks.py skip <task_id> --reason "..." [--instance ...] [--cycle ...]
  next_tasks.py pending [--instance ...] [--cycle ...] [--quiet]
  next_tasks.py list [--instance ...] [--limit N]
  next_tasks.py check_cycle [--instance ...] [--cycle ...] [--no-slack]
"""

import argparse
import io
import json
import os
import socket
import sys
import uuid
from datetime import datetime
from pathlib import Path

# Windows cp932 クラッシュ防止
if sys.platform == "win32" and not os.environ.get("PYTHONUTF8"):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

REPO_DIR = Path(__file__).parent
MEMORY_DIR = REPO_DIR / "memory"

INSTANCE_CHANNELS = {"log": "log", "mir": "mir-log", "ash": "ash"}


def detect_instance() -> str:
    if sys.platform == "darwin":
        return "mir"
    if (REPO_DIR / ".scheduler_ash.pid").exists():
        return "ash"
    if (REPO_DIR / ".scheduler_log.lock").exists():
        return "log"
    hostname = socket.gethostname().lower()
    if "win2" in hostname or "ash" in hostname:
        return "ash"
    return "log"


def jsonl_path(instance: str) -> Path:
    return MEMORY_DIR / f"next_tasks_{instance}.jsonl"


def default_cycle() -> str:
    return datetime.now().strftime("%Y-%m-%d")


def new_task_id() -> str:
    return "t-" + datetime.now().strftime("%y%m%d%H%M%S") + "-" + uuid.uuid4().hex[:4]


def append_event(instance: str, event: dict) -> None:
    path = jsonl_path(instance)
    path.parent.mkdir(parents=True, exist_ok=True)
    event = {"ts": datetime.now().isoformat(timespec="seconds"), "instance": instance, **event}
    with path.open("a", encoding="utf-8") as f:
        f.write(json.dumps(event, ensure_ascii=False) + "\n")


def read_events(instance: str) -> list:
    path = jsonl_path(instance)
    if not path.exists():
        return []
    events = []
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            events.append(json.loads(line))
        except json.JSONDecodeError:
            continue
    return events


def cycle_order(events: list) -> dict:
    """jsonl 内に登場した cycle 文字列を、初出 ts 順に並べた {cycle: index} を返す"""
    order = {}
    for ev in events:
        c = ev.get("cycle")
        if c and c not in order:
            order[c] = len(order)
    return order


def cycle_count_since(events: list, add_cycle: str, current_cycle: str) -> int:
    """add_cycle から current_cycle までに登場した cycle の数（current 含む、add 除く）"""
    order = cycle_order(events)
    if current_cycle not in order:
        # current cycle がまだ jsonl に出ていない場合、+1 として扱う
        return max(0, len(order) - order.get(add_cycle, len(order)))
    if add_cycle not in order:
        return 0
    return order[current_cycle] - order[add_cycle]


def derive_state(events: list) -> dict:
    """task_id → {task, status, added_cycle, added_ts, closed_cycle?, closed_ts?, reason?} を返す"""
    state = {}
    for ev in events:
        action = ev.get("action")
        tid = ev.get("task_id")
        if action == "add" and tid:
            state[tid] = {
                "task_id": tid,
                "task": ev.get("task", ""),
                "status": "pending",
                "added_cycle": ev.get("cycle", ""),
                "added_ts": ev.get("ts", ""),
            }
        elif action in ("done", "skip") and tid and tid in state:
            state[tid]["status"] = action
            state[tid]["closed_cycle"] = ev.get("cycle", "")
            state[tid]["closed_ts"] = ev.get("ts", "")
            if action == "skip":
                state[tid]["reason"] = ev.get("reason", "")
    return state


def cmd_add(args) -> int:
    cycle = args.cycle or default_cycle()
    tid = new_task_id()
    append_event(args.instance, {
        "cycle": cycle, "action": "add", "task_id": tid, "task": args.task,
    })
    print(f"added {tid}: {args.task}")
    return 0


def cmd_done(args) -> int:
    cycle = args.cycle or default_cycle()
    events = read_events(args.instance)
    state = derive_state(events)
    if args.task_id not in state:
        print(f"ERROR: task_id {args.task_id} not found in {args.instance}", file=sys.stderr)
        return 2
    if state[args.task_id]["status"] != "pending":
        print(f"WARN: task {args.task_id} already {state[args.task_id]['status']}", file=sys.stderr)
    append_event(args.instance, {"cycle": cycle, "action": "done", "task_id": args.task_id})
    print(f"done {args.task_id}")
    return 0


def cmd_skip(args) -> int:
    cycle = args.cycle or default_cycle()
    events = read_events(args.instance)
    state = derive_state(events)
    if args.task_id not in state:
        print(f"ERROR: task_id {args.task_id} not found in {args.instance}", file=sys.stderr)
        return 2
    append_event(args.instance, {
        "cycle": cycle, "action": "skip", "task_id": args.task_id, "reason": args.reason,
    })
    print(f"skipped {args.task_id}: {args.reason}")
    return 0


def cmd_pending(args) -> int:
    cycle = args.cycle or default_cycle()
    events = read_events(args.instance)
    state = derive_state(events)
    pending = [t for t in state.values() if t["status"] == "pending"]
    pending.sort(key=lambda t: t["added_ts"])

    # viewed イベントを記録（cycle 順序で「このサイクルで pending 一覧を見た」を保存）
    if not args.quiet:
        append_event(args.instance, {"cycle": cycle, "action": "viewed", "task_id": None})

    # cycle 順序を再計算（viewed 追加後）
    events_after = read_events(args.instance)

    if not pending:
        print(f"# {args.instance} pending: なし (cycle={cycle})")
        return 0

    print(f"# {args.instance} pending: {len(pending)}件 (cycle={cycle})")
    for t in pending:
        n = cycle_count_since(events_after, t["added_cycle"], cycle)
        marker = " [⚠連続3+]" if n >= 3 else ""
        print(f"- {t['task_id']} (連続{n}サイクル{marker}) [{t['added_cycle']}] {t['task']}")
    return 0


def cmd_list(args) -> int:
    events = read_events(args.instance)
    state = derive_state(events)
    items = list(state.values())
    items.sort(key=lambda t: t["added_ts"], reverse=True)
    if args.limit:
        items = items[:args.limit]
    for t in items:
        status = t["status"]
        marker = {"pending": "[ ]", "done": "[x]", "skip": "[-]"}.get(status, "[?]")
        extra = ""
        if status == "skip":
            extra = f" (skip理由: {t.get('reason', '')})"
        elif status == "done":
            extra = f" (closed: {t.get('closed_cycle', '')})"
        print(f"{marker} {t['task_id']} [{t['added_cycle']}] {t['task']}{extra}")
    return 0


def cmd_check_cycle(args) -> int:
    """Phase 4 / Stop hook 用: 当該サイクルで add イベントが0件なら Slack に警告"""
    cycle = args.cycle or default_cycle()
    events = read_events(args.instance)

    cycle_events = [e for e in events if e.get("cycle") == cycle]
    add_count = sum(1 for e in cycle_events if e.get("action") == "add")
    done_count = sum(1 for e in cycle_events if e.get("action") == "done")
    skip_count = sum(1 for e in cycle_events if e.get("action") == "skip")
    pending_now = [t for t in derive_state(events).values() if t["status"] == "pending"]

    # cycle_check イベントを記録
    append_event(args.instance, {
        "cycle": cycle, "action": "cycle_check", "task_id": None,
        "add_count": add_count, "done_count": done_count, "skip_count": skip_count,
        "pending_total": len(pending_now),
    })

    # 警告条件: このサイクルで add が0 かつ done/skip もなく pending が残っている
    warn = (add_count == 0 and done_count == 0 and skip_count == 0 and len(pending_now) > 0)
    long_pending = [t for t in pending_now
                    if cycle_count_since(events, t["added_cycle"], cycle) >= 3]

    # 5+サイクル持ち越し → #human-steering エスカレーション（初回のみ）
    # 2026-04-27 Nao_u指示: dropするかescalateするか判断を促す
    for t in pending_now:
        n = cycle_count_since(events, t["added_cycle"], cycle)
        if n >= 5:
            already_escalated = any(
                e.get("action") == "escalated" and e.get("task_id") == t["task_id"]
                for e in events
            )
            if not already_escalated:
                append_event(args.instance, {
                    "cycle": cycle, "action": "escalated", "task_id": t["task_id"],
                })
                esc_msg = (
                    f"[{args.instance} 5+サイクル持ち越しエスカレーション]\n"
                    f"- {t['task_id']} ({n}サイクル) {t['task'][:80]}\n"
                    f"dropするかescalateするか判断してください。"
                )
                print(esc_msg)
                if not args.no_slack:
                    try:
                        from slack_bot import post_message
                        post_message("human-steering", esc_msg)
                        print(f"  → #human-steering エスカレーション済: {t['task_id']}")
                    except Exception as e:
                        print(f"  #human-steering 送信失敗: {e}", file=sys.stderr)

    if warn or long_pending:
        msg_parts = [f"[next_tasks {args.instance} cycle={cycle} 警告]"]
        if warn:
            msg_parts.append(f"このサイクルで add/done/skip が0件、pending {len(pending_now)}件残り")
        if long_pending:
            msg_parts.append(f"3+サイクル滞留 {len(long_pending)}件:")
            for t in long_pending[:5]:
                n = cycle_count_since(events, t["added_cycle"], cycle)
                msg_parts.append(f"  - {t['task_id']} ({n}サイクル) {t['task'][:60]}")
        msg = "\n".join(msg_parts)
        print(msg)
        if not args.no_slack:
            try:
                from slack_bot import post_message
                channel = INSTANCE_CHANNELS.get(args.instance, "log")
                post_message(channel, msg)
            except Exception as e:
                print(f"  Slack送信失敗: {e}", file=sys.stderr)
        return 1

    print(f"[next_tasks {args.instance} cycle={cycle}] add={add_count} done={done_count} skip={skip_count} pending残={len(pending_now)} OK")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description="次回タスク管理 CLI（層A）")
    ap.add_argument("--instance", default=detect_instance().lower(),
                    choices=["log", "mir", "ash"], help="インスタンス名")
    sub = ap.add_subparsers(dest="cmd", required=True)

    p_add = sub.add_parser("add", help="タスクを追加")
    p_add.add_argument("task", help="タスク内容")
    p_add.add_argument("--cycle", help="サイクル識別子（既定: 今日の日付）")
    p_add.set_defaults(func=cmd_add)

    p_done = sub.add_parser("done", help="タスクを完了")
    p_done.add_argument("task_id")
    p_done.add_argument("--cycle")
    p_done.set_defaults(func=cmd_done)

    p_skip = sub.add_parser("skip", help="タスクをスキップ")
    p_skip.add_argument("task_id")
    p_skip.add_argument("--reason", required=True)
    p_skip.add_argument("--cycle")
    p_skip.set_defaults(func=cmd_skip)

    p_pending = sub.add_parser("pending", help="未完タスク一覧（連続サイクル数付き）")
    p_pending.add_argument("--cycle")
    p_pending.add_argument("--quiet", action="store_true", help="viewed イベントを記録しない")
    p_pending.set_defaults(func=cmd_pending)

    p_list = sub.add_parser("list", help="全タスク一覧")
    p_list.add_argument("--limit", type=int, default=20)
    p_list.set_defaults(func=cmd_list)

    p_check = sub.add_parser("check_cycle", help="サイクル末尾チェック（Phase 4 / Stop hook）")
    p_check.add_argument("--cycle")
    p_check.add_argument("--no-slack", action="store_true")
    p_check.set_defaults(func=cmd_check_cycle)

    args = ap.parse_args()
    return args.func(args)


if __name__ == "__main__":
    sys.exit(main())
