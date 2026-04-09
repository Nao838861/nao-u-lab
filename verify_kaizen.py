"""
verify_kaizen.py — 改善の検証を自動実行し、メタ検証も行う

check_kaizen_due.py が「リマインド」なら、verify_kaizen.py は「実行」。

モード:
  python verify_kaizen.py              # 期限到来の検証コマンドを実行し結果を報告
  python verify_kaizen.py --meta       # メタ検証（検証システム自体の健全性チェック）
  python verify_kaizen.py --update     # 検証結果をkaizen_tracker.mdに書き戻す
  python verify_kaizen.py --crosscheck Log  # Log未チェックの改善を一覧表示
  python verify_kaizen.py --nag        # 未チェックのインスタンスにinboxメッセージを書く
  python verify_kaizen.py --slack-status  # クロスチェック状況を#kaizen-logにSlack投稿

Nao_uの指摘（2026-03-23 21:04）への対策:
  問題1: 検証予定を書いてるが検証できてない → コマンドを自動実行する
  問題2: 検証する手段がセットで用意されてない → 検証手段からコマンドを抽出して実行する仕組み
  問題3: メタ的な対策がない → --meta で検証システム自体をチェック

Nao_uの指示（2026-03-23 22:49）:
  3人全員でクロスチェック。チェックしてない人には突っ込みを入れて必ずチェックされる状況を作る。
  → --crosscheck / --nag で実装
"""

import io
import os
import re
import sys
import subprocess
from datetime import date, datetime

# Windows cp932環境でのUnicodeError対策
if sys.stdout.encoding != "utf-8":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")
os.environ["PYTHONIOENCODING"] = "utf-8"
from pathlib import Path

REPO_DIR = Path(__file__).parent
TRACKER_FILE = REPO_DIR / "memory" / "kaizen_tracker.md"
SCHEDULER_LOG = REPO_DIR / "log" / "scheduler_log.log"
KAIZEN_LOG = REPO_DIR / "log" / "slack_archive" / "kaizen-log.jsonl"

# 3インスタンス（Nao_uの2026-03-23 22:49指示: 全員でクロスチェック）
INSTANCES = ["Log", "Mir", "Ash"]
INBOX_FILES = {
    "Log": REPO_DIR / "inbox_win.md",
    "Mir": REPO_DIR / "inbox_mac.md",
    "Ash": REPO_DIR / "inbox_win2.md",
}


def parse_tracker():
    """Parse kaizen_tracker.md and return list of entries with all fields."""
    if not TRACKER_FILE.exists():
        return []

    text = TRACKER_FILE.read_text(encoding="utf-8")
    entries = []
    current = None

    for line in text.split("\n"):
        m = re.match(r"^###\s+#(\d+):\s+(.+)", line)
        if m:
            if current:
                entries.append(current)
            current = {
                "id": m.group(1),
                "summary": m.group(2).strip(),
                "proposer": "",
                "applied": None,
                "due": None,
                "method": "",
                "assignee": "",
                "status": "未検証",
                "result": "",
                "crosscheck": {},  # {"Log": "未", "Mir": "未", "Ash": "未"}
            }
            continue

        if current is None:
            continue

        if line.startswith("- 提案者:"):
            current["proposer"] = line.split(":", 1)[1].strip()
        elif line.startswith("- 適用日:"):
            ds = line.split(":", 1)[1].strip()
            try:
                current["applied"] = date.fromisoformat(ds)
            except ValueError:
                pass
        elif line.startswith("- 検証期限:"):
            ds = line.split(":", 1)[1].strip()
            try:
                current["due"] = date.fromisoformat(ds)
            except ValueError:
                pass
        elif line.startswith("- 検証手段:"):
            current["method"] = line.split(":", 1)[1].strip()
        elif line.startswith("- 検証担当:"):
            current["assignee"] = line.split(":", 1)[1].strip()
        elif line.startswith("- 状態:"):
            raw_status = line.split(":", 1)[1].strip()
            # "検証済み（Ash代行 2026-03-24）" や "検証済み 2026-03-24" も正しくパース
            # 装飾プレフィクス（✅/📦/⚠️/❌ + 半角/全角空白）を剥がしてから判定する
            stripped = re.sub(r"^[✅📦⚠️❌🟡🔴🟢]+\s*", "", raw_status)
            if stripped.startswith("検証済み"):
                current["status"] = "検証済み"
            elif stripped.startswith("クローズ") or "クローズ" in stripped or "部分達成" in stripped:
                # 部分達成でクローズされたエントリは「検証完了」扱い（再オープン時は明示的に状態を戻す）
                current["status"] = "検証済み"
            else:
                current["status"] = stripped or raw_status
        elif line.startswith("- 検証結果:"):
            current["result"] = line.split(":", 1)[1].strip()
        elif line.startswith("- クロスチェック:"):
            cc_text = line.split(":", 1)[1].strip()
            current["crosscheck"] = _parse_crosscheck(cc_text)

    if current:
        entries.append(current)

    return entries


def _parse_crosscheck(text):
    """Parse crosscheck field like 'Log=未 / Mir=OK(2026-03-24) / Ash=未'"""
    result = {}
    for part in text.split("/"):
        part = part.strip()
        m = re.match(r"(Log|Mir|Ash)\s*=\s*(.+)", part)
        if m:
            result[m.group(1)] = m.group(2).strip()
    return result


def _format_crosscheck(cc_dict):
    """Format crosscheck dict back to string."""
    parts = []
    for inst in INSTANCES:
        status = cc_dict.get(inst, "未")
        parts.append(f"{inst}={status}")
    return " / ".join(parts)


def extract_commands(method_text):
    """Extract shell commands from backtick-enclosed sections in 検証手段."""
    commands = re.findall(r'`([^`]+)`', method_text)
    # Filter out things that look like commands (contain space or path-like)
    executable = []
    for cmd in commands:
        # Skip things that are clearly not commands (e.g., single words that are labels)
        if any(c in cmd for c in ['/', '\\', ' ', '--', '.py', '.md', '.log']):
            executable.append(cmd)
    return executable


def run_verification_commands(entry):
    """Execute verification commands for a kaizen entry. Return results."""
    commands = extract_commands(entry["method"])
    if not commands:
        return {
            "id": entry["id"],
            "summary": entry["summary"],
            "commands_found": 0,
            "results": [],
            "verdict": "NO_COMMANDS",
            "message": f"検証手段にコマンドが見つからない: {entry['method'][:100]}",
        }

    results = []
    all_ok = True
    for cmd in commands:
        # 自己参照防止: verify_kaizen.py自身を呼ぶコマンドはスキップ
        if "verify_kaizen.py" in cmd:
            results.append({
                "command": "(self-ref: verify_kaizen.py — skipped)",
                "exit_code": 0,
                "output": "self-referential command skipped",
                "success": True,
            })
            continue
        # プラットフォームに応じてpythonコマンドを正規化
        import platform
        if platform.system() == "Darwin":
            # Mac環境では 'python' が存在しないため 'python3' に変換
            if cmd.startswith("python ") and not cmd.startswith("python3"):
                cmd = "python3" + cmd[6:]
        elif platform.system() == "Windows":
            # Windows環境では 'python3' が存在しないため 'python' に変換
            if cmd.startswith("python3 "):
                cmd = "python" + cmd[7:]
        try:
            r = subprocess.run(
                cmd,
                shell=True,
                capture_output=True,
                text=True,
                timeout=30,
                cwd=str(REPO_DIR),
                encoding="utf-8",
                errors="replace",
            )
            output = r.stdout.strip() or r.stderr.strip()
            success = r.returncode == 0
            if not success:
                all_ok = False
            results.append({
                "command": cmd,
                "exit_code": r.returncode,
                "output": output[:500],
                "success": success,
            })
        except subprocess.TimeoutExpired:
            all_ok = False
            results.append({
                "command": cmd,
                "exit_code": -1,
                "output": "TIMEOUT (30s)",
                "success": False,
            })
        except Exception as e:
            all_ok = False
            results.append({
                "command": cmd,
                "exit_code": -1,
                "output": str(e)[:200],
                "success": False,
            })

    return {
        "id": entry["id"],
        "summary": entry["summary"],
        "commands_found": len(commands),
        "results": results,
        "verdict": "PASS" if all_ok else "CHECK_NEEDED",
        "method_text": entry["method"],
    }


def run_verifications(show_all=False):
    """Run verification commands for due/overdue entries."""
    entries = parse_tracker()
    today = date.today()
    output_lines = []

    targets = []
    for e in entries:
        if e["status"] == "検証済み":
            continue
        if e["due"] is None:
            continue
        if show_all or e["due"] <= today:
            targets.append(e)

    if not targets:
        output_lines.append("✅ 検証対象なし（期限到来の未検証エントリなし）")
        return "\n".join(output_lines)

    output_lines.append(f"🔍 検証実行: {len(targets)}件")
    output_lines.append("")

    for entry in targets:
        result = run_verification_commands(entry)
        overdue = entry["due"] < today
        status_icon = "⚠" if overdue else "📋"
        output_lines.append(f"{status_icon} #{result['id']}: {result['summary']}")
        output_lines.append(f"  期限: {entry['due']} {'(超過!)' if overdue else '(本日)'}")
        # 検証手段テキストの表示: 自己参照バグ防止のためコマンド部分をマスク
        safe_method = re.sub(r'`[^`]*verify_kaizen[^`]*`', '`(self-ref masked)`', entry['method'][:120])
        output_lines.append(f"  検証手段: {safe_method}")

        if result["verdict"] == "NO_COMMANDS":
            output_lines.append(f"  ❌ {result['message']}")
            output_lines.append(f"  → 検証手段にバッククォートで囲んだ実行可能コマンドを追加してください")
        else:
            for r in result["results"]:
                icon = "✅" if r["success"] else "❌"
                output_lines.append(f"  {icon} `{r['command']}`")
                output_lines.append(f"     exit={r['exit_code']}, output: {r['output'][:200]}")

        output_lines.append("")

    return "\n".join(output_lines)


def update_tracker_results():
    """Run verifications and write results back to kaizen_tracker.md."""
    entries = parse_tracker()
    today = date.today()
    updated = False
    updates = []

    for entry in entries:
        if entry["status"] == "検証済み":
            continue
        if entry["due"] is None or entry["due"] > today:
            continue
        if entry["result"]:  # Already has a result
            continue

        result = run_verification_commands(entry)
        if result["verdict"] == "NO_COMMANDS":
            result_text = f"自動検証不可（コマンド未定義）。手動確認が必要。({today})"
        else:
            parts = []
            for r in result["results"]:
                status = "OK" if r["success"] else "NG"
                parts.append(f"`{r['command']}` → {status} (出力: {r['output'][:100]})")
            result_text = f"自動検証実行({today}): " + "; ".join(parts)

        updates.append((entry["id"], result_text))

    if not updates:
        print("更新対象なし")
        return

    # Read and update the file
    text = TRACKER_FILE.read_text(encoding="utf-8")
    for entry_id, result_text in updates:
        # Find the result line for this entry and fill it
        pattern = rf"(### #{entry_id}:.*?- 検証結果:)\s*$"
        replacement = rf"\1 {result_text}"
        new_text = re.sub(pattern, replacement, text, flags=re.MULTILINE)
        if new_text != text:
            text = new_text
            updated = True
            print(f"  #{entry_id}: 検証結果を記入")

    if updated:
        TRACKER_FILE.write_text(text, encoding="utf-8")
        print(f"kaizen_tracker.md を更新しました")
    else:
        print("パターン不一致で更新できず（手動確認が必要）")


def meta_verification():
    """メタ検証: 検証システム自体が機能しているかチェック."""
    entries = parse_tracker()
    today = date.today()

    lines = []
    lines.append("=" * 50)
    lines.append("📊 メタ検証レポート: 検証システムの健全性")
    lines.append(f"   実行日時: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    lines.append("=" * 50)

    # --- 指標1: 検証完了率 ---
    total = len(entries)
    verified = sum(1 for e in entries if e["status"] == "検証済み")
    unverified = sum(1 for e in entries if e["status"] != "検証済み")
    overdue = sum(1 for e in entries if e["status"] != "検証済み" and e["due"] and e["due"] < today)

    lines.append("")
    lines.append("## 1. 検証完了率")
    lines.append(f"   総エントリ数: {total}")
    lines.append(f"   検証済み: {verified} ({verified/total*100:.0f}%)" if total > 0 else "   検証済み: 0")
    lines.append(f"   未検証: {unverified}")
    lines.append(f"   期限超過: {overdue}")
    if total > 0:
        rate = verified / total * 100
        if rate >= 80:
            lines.append(f"   → ✅ 健全 (完了率{rate:.0f}%)")
        elif rate >= 50:
            lines.append(f"   → ⚠ 注意 (完了率{rate:.0f}%)")
        else:
            lines.append(f"   → ❌ 危険 (完了率{rate:.0f}%) — 検証が回っていない")

    # --- 指標2: 検証手段の品質 ---
    has_method = sum(1 for e in entries if e["method"])
    has_commands = sum(1 for e in entries if extract_commands(e["method"]))
    no_method = sum(1 for e in entries if not e["method"])

    lines.append("")
    lines.append("## 2. 検証手段の品質")
    lines.append(f"   検証手段あり: {has_method}/{total}")
    lines.append(f"   実行可能コマンド含む: {has_commands}/{total}")
    lines.append(f"   検証手段なし: {no_method}")
    if has_commands < has_method:
        lines.append(f"   → ⚠ {has_method - has_commands}件が文章のみ（自動検証不可）")
        lines.append(f"     対策: バッククォートで囲んだコマンドを検証手段に追加する")
    if no_method > 0:
        lines.append(f"   → ❌ {no_method}件に検証手段が未定義")

    # --- 指標3: アラートシステム + スケジューラ生存確認 (Dead Man's Switch) ---
    lines.append("")
    lines.append("## 3. アラートシステム + スケジューラ生存確認")
    alert_count = 0
    scheduler_alive = False
    scheduler_last_ts = None
    if SCHEDULER_LOG.exists():
        try:
            log_text = SCHEDULER_LOG.read_text(encoding="utf-8", errors="replace")
            alert_count = log_text.count("Kaizen alert")
            # Dead Man's Switch: schedulerが最近動いているか
            import re as _re
            timestamps = _re.findall(r'\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\]', log_text[-5000:])
            if timestamps:
                scheduler_last_ts = datetime.strptime(timestamps[-1], '%Y-%m-%d %H:%M:%S')
                age_minutes = (datetime.now() - scheduler_last_ts).total_seconds() / 60
                scheduler_alive = age_minutes < 60  # 1時間以内なら生存
        except Exception:
            pass

    if scheduler_alive:
        lines.append(f"   スケジューラ最終動作: {scheduler_last_ts.strftime('%H:%M')} ✅ (生存確認)")
    elif scheduler_last_ts:
        age = (datetime.now() - scheduler_last_ts).total_seconds() / 60
        lines.append(f"   ⚠ スケジューラ最終動作: {scheduler_last_ts.strftime('%H:%M')} ({age:.0f}分前)")
        lines.append(f"     → Dead Man's Switch発動: スケジューラが停止している可能性")
    else:
        lines.append(f"   スケジューラログなし、または読み取り不可")

    if alert_count > 0:
        lines.append(f"   Kaizen alert記録: {alert_count}件 ✅")
    else:
        lines.append(f"   Kaizen alert記録: なし")
        lines.append(f"   → 期限超過エントリがないか、auto_cycleが未実行")

    # --- 指標4: 検証→行動の変換率 ---
    lines.append("")
    lines.append("## 4. 検証→行動の変換率")
    alerted_but_not_verified = sum(
        1 for e in entries
        if e["status"] != "検証済み" and e["due"] and e["due"] < today
    )
    if alerted_but_not_verified > 0:
        lines.append(f"   期限超過かつ未検証: {alerted_but_not_verified}件")
        lines.append(f"   → ❌ アラートが出ても検証が実行されていない")
        lines.append(f"     対策: verify_kaizen.py --update で自動検証を実行する")
    else:
        lines.append(f"   期限超過かつ未検証: 0件 ✅")

    # --- 指標5: 提案→検証のサイクル時間 ---
    lines.append("")
    lines.append("## 5. 構造的問題の診断")
    problems = []
    if overdue > 0:
        problems.append(f"期限超過{overdue}件: 検証コマンドの自動実行が必要")
    if has_method - has_commands > 0:
        problems.append(f"自動検証不可{has_method - has_commands}件: 検証手段にコマンドを追加")
    if no_method > 0:
        problems.append(f"検証手段未定義{no_method}件: 改善の定義が曖昧")

    if problems:
        lines.append("   検出された問題:")
        for p in problems:
            lines.append(f"   - {p}")
    else:
        lines.append("   構造的問題なし ✅")

    # --- 総合判定 ---
    lines.append("")
    lines.append("=" * 50)
    score = 0
    max_score = 5
    if total > 0 and verified / total >= 0.5:
        score += 1
    if has_commands >= has_method * 0.8:
        score += 1
    if overdue == 0:
        score += 1
    if alert_count > 0 or overdue == 0:  # アラートなし＝超過なしも正常
        score += 1
    if scheduler_alive:
        score += 1

    if score >= 4:
        lines.append(f"総合: ✅ 検証システムは概ね機能している ({score}/{max_score})")
    elif score >= 3:
        lines.append(f"総合: ⚠ 検証システムに改善の余地あり ({score}/{max_score})")
    else:
        lines.append(f"総合: ❌ 検証システムが機能していない ({score}/{max_score})")
        lines.append("  → verify_kaizen.pyをscheduler_log.pyに統合して自動実行を開始してください")
    lines.append("=" * 50)

    return "\n".join(lines)


def crosscheck_report(instance):
    """指定インスタンスが未チェックの改善を一覧表示。"""
    if instance not in INSTANCES:
        return f"❌ 不明なインスタンス: {instance}（{', '.join(INSTANCES)} のいずれかを指定）"

    entries = parse_tracker()
    lines = []
    needs_check = []

    for e in entries:
        # 完了済みかつクロスチェック済み → スキップ
        if e["status"] == "検証済み":
            cc = e.get("crosscheck", {})
            if cc.get(instance, "未") != "未":
                continue
            # 検証済みだがクロスチェック未のものは対象
        # クロスチェックフィールドがない or 未のもの
        cc = e.get("crosscheck", {})
        status = cc.get(instance, "未")
        if status == "未":
            needs_check.append(e)

    if not needs_check:
        lines.append(f"✅ {instance}: クロスチェック対象なし（全て確認済み）")
        return "\n".join(lines)

    lines.append(f"📋 {instance}の未クロスチェック: {len(needs_check)}件")
    lines.append("")

    for e in needs_check:
        proposer = e.get("proposer", "不明")
        cc = e.get("crosscheck", {})
        other_status = []
        for inst in INSTANCES:
            if inst != instance:
                s = cc.get(inst, "未")
                other_status.append(f"{inst}={s}")

        lines.append(f"  #{e['id']}: {e['summary']}")
        lines.append(f"    提案者: {proposer} / 状態: {e['status']}")
        lines.append(f"    他インスタンス: {', '.join(other_status)}")
        lines.append(f"    検証手段: {e['method'][:120]}")
        lines.append("")

    lines.append("→ 各改善を確認し、クロスチェック欄を更新してください")
    return "\n".join(lines)


def nag_unchecked():
    """未チェックのインスタンスにinboxメッセージを書く。

    Nao_uの指示: 「チェックしてない人がいたら、その人に突っ込みを入れて
    必ずチェックされる状況を作る」
    """
    entries = parse_tracker()
    today = date.today()
    nag_targets = {}  # {instance: [entry_list]}

    for e in entries:
        # 適用日がない or まだ適用されたばかり（1日未満） → スキップ
        if not e.get("applied"):
            continue
        if e["applied"] >= today:
            continue

        cc = e.get("crosscheck", {})
        for inst in INSTANCES:
            status = cc.get(inst, "未")
            if status == "未":
                if inst not in nag_targets:
                    nag_targets[inst] = []
                nag_targets[inst].append(e)

    if not nag_targets:
        print("✅ 全インスタンスのクロスチェック完了（nag不要）")
        return

    lines_out = []
    for inst, entries_list in nag_targets.items():
        inbox_path = INBOX_FILES.get(inst)
        if not inbox_path:
            continue

        # inboxメッセージを組み立て
        msg_lines = []
        msg_lines.append(f"\n## クロスチェック督促 ({today})")
        msg_lines.append("")
        msg_lines.append(f"{inst}、以下の改善のクロスチェックが未完了です:")
        msg_lines.append("")
        for e in entries_list:
            msg_lines.append(f"- **#{e['id']}**: {e['summary']}（提案者: {e.get('proposer', '不明')}）")
        msg_lines.append("")
        msg_lines.append("確認して `kaizen_tracker.md` のクロスチェック欄を更新してください。")
        msg_lines.append("")
        msg_lines.append("— verify_kaizen.py --nag (自動生成)")
        msg_lines.append("")

        msg_text = "\n".join(msg_lines)

        # 既に同じ日付のnagがあればスキップ（重複防止）
        existing = ""
        if inbox_path.exists():
            existing = inbox_path.read_text(encoding="utf-8")
        if f"クロスチェック督促 ({today})" in existing:
            lines_out.append(f"  {inst}: 本日分の督促は既に送信済み（スキップ）")
            continue

        # inboxに追記
        with open(inbox_path, "a", encoding="utf-8") as f:
            f.write(msg_text)

        lines_out.append(f"  📨 {inst}: {len(entries_list)}件の督促をinboxに送信")

    if lines_out:
        print("クロスチェック督促:")
        for line in lines_out:
            print(line)
    else:
        print("✅ 督促の送信対象なし")


def _resolve_review_channel():
    """#kaizen-review のチャンネルIDを解決。なければNone。"""
    try:
        sys.path.insert(0, str(REPO_DIR))
        import slack_bot
        return slack_bot._resolve_channel("kaizen-review")
    except Exception:
        return None


def _post_to_review(msg):
    """#kaizen-review に投稿。チャンネルがなければフォールバック表示。"""
    sys.path.insert(0, str(REPO_DIR))
    import slack_bot
    channel_id = _resolve_review_channel()
    if channel_id == "kaizen-review":
        # チャンネル名がそのまま返った = 未作成
        print("⚠ #kaizen-review チャンネルが未作成。Nao_uに作成を依頼してください。")
        print("--- 以下を手動投稿してください ---")
        print(msg)
        return False
    try:
        result = slack_bot.post_message(channel_id, msg)
        if result.get("ok"):
            print(f"✅ #kaizen-review にステータス投稿完了")
            return True
        else:
            print(f"❌ Slack投稿失敗: {result.get('error', 'unknown')}")
            return False
    except Exception as ex:
        print(f"❌ Slack投稿エラー: {ex}")
        return False


def slack_status():
    """クロスチェック状況を #kaizen-review にSlack投稿。

    Nao_uの裁定(2026-03-23 23:15):
      kaizen-log = 提案と実装、kaizen-review = 評価とフィードバックサイクル。
    """
    entries = parse_tracker()
    today = date.today()

    # アクティブなエントリのみ
    active = [e for e in entries if e["status"] != "検証済み" or
              any(v == "未" for v in e.get("crosscheck", {}).values())]

    if not active:
        msg = f"📋 改善チェックリスト ({today})\n\n✅ 全改善のクロスチェック完了！"
    else:
        lines = [f"📋 改善チェックリスト ({today})", ""]
        for e in active:
            cc = e.get("crosscheck", {})
            checks = []
            for inst in INSTANCES:
                status = cc.get(inst, "未")
                if status == "未":
                    checks.append(f"⬜ {inst}")
                else:
                    checks.append(f"✅ {inst}")

            all_done = all(cc.get(inst, "未") != "未" for inst in INSTANCES)
            prefix = "✅" if all_done else "🔲"

            lines.append(f"{prefix} #{e['id']}: {e['summary']}")
            lines.append(f"   提案者: {e.get('proposer', '?')} / 状態: {e['status']}")
            lines.append(f"   チェック: {' / '.join(checks)}")
            if e.get("due"):
                overdue = e["due"] < today
                lines.append(f"   検証期限: {e['due']}{' ⚠超過' if overdue else ''}")
            lines.append("")

        pending_count = sum(1 for e in active
                          if any(cc.get(inst, "未") == "未"
                                for inst in INSTANCES
                                for cc in [e.get("crosscheck", {})]))
        lines.append(f"---\n未チェック残: {pending_count}件。各自確認して #kaizen-review に所見を投稿してください。")
        msg = "\n".join(lines)

    _post_to_review(msg)


def post_review(instance, entry_id, comment):
    """個別レビュー結果を #kaizen-review に投稿。

    manage_review_queue.pyから呼ばれる。
    """
    msg = f"📝 レビュー: #{entry_id} — {instance}\n{comment}"
    _post_to_review(msg)


if __name__ == "__main__":
    if "--meta" in sys.argv:
        print(meta_verification())
    elif "--update" in sys.argv:
        update_tracker_results()
    elif "--crosscheck" in sys.argv:
        idx = sys.argv.index("--crosscheck")
        if idx + 1 < len(sys.argv):
            instance = sys.argv[idx + 1]
        else:
            instance = "Log"  # デフォルト
        print(crosscheck_report(instance))
    elif "--nag" in sys.argv:
        nag_unchecked()
    elif "--slack-status" in sys.argv:
        slack_status()
    elif "--run" in sys.argv or len(sys.argv) == 1:
        show_all = "--all" in sys.argv
        print(run_verifications(show_all))
    else:
        print(__doc__)
