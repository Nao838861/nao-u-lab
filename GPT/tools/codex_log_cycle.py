#!/usr/bin/env python3
"""
Codex-side 90-minute deterministic maintenance cycle.

Refreshes the shared-reads memory index, checks new Slack posts, ingests game
feedback, and runs the discussion router (which posts to #all-nao-u-lab with an
LLM-generated body). 自身では LLM セッションを起動しない。

2026-05-13 Nao_u 指示で **Slack #log への compact status 投稿は廃止**。
status は `log/codex_log_cycle_status.md` に local 保存するだけにし、
#log への日記投稿は `codex_phases_cycle.py` Phase 5 (LLM 駆動) に一本化する。
"""
from __future__ import annotations

import argparse
import json
import subprocess
import sys
from datetime import datetime
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
TOOLS_DIR = ROOT / "tools"
MEMORY_DIR = ROOT / "memory"
LOG_DIR = ROOT / "log"
STATE_PATH = MEMORY_DIR / "codex_log_cycle_state.json"
RUN_LOG_PATH = LOG_DIR / "codex_log_cycle.log"
DEFAULT_INTERVAL_SEC = 90 * 60
DEFAULT_CHANNEL = "log"


if sys.stdout.encoding and sys.stdout.encoding.lower().startswith("cp"):
    sys.stdout = open(sys.stdout.fileno(), mode="w", encoding="utf-8", errors="replace", closefd=False)


def now_iso() -> str:
    return datetime.now().isoformat(timespec="seconds")


def log(line: str) -> None:
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    with RUN_LOG_PATH.open("a", encoding="utf-8", newline="\n") as f:
        f.write(f"{now_iso()} {line}\n")


def load_json(path: Path, default: Any) -> Any:
    if not path.exists():
        return default
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return default


def save_state(state: dict[str, Any]) -> None:
    MEMORY_DIR.mkdir(parents=True, exist_ok=True)
    STATE_PATH.write_text(json.dumps(state, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def should_run(interval_sec: int, force: bool) -> tuple[bool, str, dict[str, Any]]:
    state = load_json(STATE_PATH, {})
    if force:
        return True, "forced", state
    last_success = state.get("last_success")
    if not last_success:
        return True, "no previous success", state
    try:
        last_ts = datetime.fromisoformat(last_success)
    except ValueError:
        return True, "unreadable last_success", state
    elapsed = (datetime.now() - last_ts).total_seconds()
    if elapsed >= interval_sec:
        return True, f"elapsed {elapsed / 60:.0f}min >= {interval_sec / 60:.0f}min", state
    return False, f"skipped: elapsed {elapsed / 60:.0f}min < {interval_sec / 60:.0f}min", state


def run_command(args: list[str], timeout: int) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        args,
        cwd=str(ROOT),
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        timeout=timeout,
    )


def run_git_sync(message: str) -> dict[str, Any]:
    """Commit and push GPT-owned outputs produced by the cycle."""
    repo_root = ROOT.parent
    git_base = ["git", "-c", "safe.directory=D:/AI/Nao_u_BOT", "-C", str(repo_root)]

    add = subprocess.run(
        [*git_base, "add", "--", "GPT"],
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        timeout=120,
    )
    if add.returncode != 0:
        raise RuntimeError(f"git add failed: {(add.stderr or add.stdout).strip()[:800]}")

    staged = subprocess.run(
        [*git_base, "diff", "--cached", "--name-only"],
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        timeout=60,
    )
    if staged.returncode != 0:
        raise RuntimeError(f"git diff --cached failed: {(staged.stderr or staged.stdout).strip()[:800]}")
    staged_files = [line for line in staged.stdout.splitlines() if line.strip()]
    if not staged_files:
        return {"ok": True, "committed": False, "pushed": False, "staged_files": 0}

    commit = subprocess.run(
        [*git_base, "commit", "-m", message],
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        timeout=180,
    )
    if commit.returncode != 0:
        raise RuntimeError(f"git commit failed: {(commit.stderr or commit.stdout).strip()[:1200]}")

    rev = subprocess.run(
        [*git_base, "rev-parse", "--short", "HEAD"],
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        timeout=60,
    )
    commit_hash = rev.stdout.strip() if rev.returncode == 0 else ""

    push = subprocess.run(
        [*git_base, "push", "--no-verify"],
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        timeout=300,
    )
    if push.returncode != 0:
        raise RuntimeError(f"git push failed after commit {commit_hash}: {(push.stderr or push.stdout).strip()[:1200]}")
    return {"ok": True, "committed": True, "pushed": True, "staged_files": len(staged_files), "commit": commit_hash}


def run_ingest() -> dict[str, Any]:
    result = run_command([sys.executable, str(TOOLS_DIR / "memory_ingest.py")], timeout=120)
    out = result.stdout.strip()
    err = result.stderr.strip()
    if result.returncode != 0:
        raise RuntimeError(f"memory_ingest.py failed exit={result.returncode}: {err[:500]}")

    parsed: dict[str, Any] = {"raw": out}
    for line in out.splitlines():
        if ":" not in line:
            continue
        key, value = line.split(":", 1)
        key = key.strip().replace(" ", "_")
        value = value.strip()
        parsed[key] = int(value) if value.isdigit() else value
    return parsed


def run_slack_ingest() -> dict[str, Any]:
    result = run_command([sys.executable, str(TOOLS_DIR / "slack_memory_ingest.py")], timeout=120)
    if result.returncode != 0:
        raise RuntimeError(f"slack_memory_ingest.py failed exit={result.returncode}: {result.stderr[:500]}")
    try:
        return json.loads(result.stdout)
    except json.JSONDecodeError as exc:
        raise RuntimeError(f"slack_memory_ingest.py returned non-json: {result.stdout[:500]}") from exc


def run_slack_directives(dry_run: bool) -> dict[str, Any]:
    cmd = [sys.executable, str(TOOLS_DIR / "codex_slack_directives.py")]
    if dry_run:
        cmd.append("--dry-run")
    result = run_command(cmd, timeout=180)
    if result.returncode != 0:
        return {
            "ok": False,
            "error": (result.stderr.strip() or result.stdout.strip())[:800],
        }
    try:
        data = json.loads(result.stdout)
    except json.JSONDecodeError:
        return {"ok": False, "error": f"codex_slack_directives.py returned non-json: {result.stdout[:500]}"}
    data["ok"] = True
    return data


def run_game_feedback_ingest(dry_run: bool) -> dict[str, Any]:
    cmd = [sys.executable, str(TOOLS_DIR / "ingest_game_rights_feedback.py")]
    if dry_run:
        cmd.append("--dry-run")
    result = run_command(cmd, timeout=180)
    if result.returncode != 0:
        return {
            "ok": False,
            "error": (result.stderr.strip() or result.stdout.strip())[:800],
        }
    try:
        data = json.loads(result.stdout)
    except json.JSONDecodeError:
        return {"ok": False, "error": f"ingest_game_rights_feedback.py returned non-json: {result.stdout[:500]}"}
    data["ok"] = True
    return data


def run_external_research(dry_run: bool) -> dict[str, Any]:
    cmd = [sys.executable, str(TOOLS_DIR / "external_research_cycle.py")]
    if dry_run:
        cmd.append("--dry-run")
    result = run_command(cmd, timeout=180)
    if result.returncode != 0:
        return {
            "ok": False,
            "error": (result.stderr.strip() or result.stdout.strip())[:800],
        }
    try:
        data = json.loads(result.stdout)
    except json.JSONDecodeError:
        return {"ok": False, "error": f"external_research_cycle.py returned non-json: {result.stdout[:500]}"}
    data["ok"] = True
    return data


def run_shared_reads_deep_repost(dry_run: bool) -> dict[str, Any]:
    cmd = [sys.executable, str(TOOLS_DIR / "shared_reads_deep_repost_cycle.py"), "--limit", "2"]
    if dry_run:
        cmd.append("--dry-run")
    result = run_command(cmd, timeout=120)
    if result.returncode != 0:
        return {
            "ok": False,
            "error": (result.stderr.strip() or result.stdout.strip())[:800],
        }
    try:
        data = json.loads(result.stdout)
    except json.JSONDecodeError:
        return {"ok": False, "error": f"shared_reads_deep_repost_cycle.py returned non-json: {result.stdout[:500]}"}
    data["ok"] = True
    return data


def run_discussion_router(dry_run: bool) -> dict[str, Any]:
    cmd = [sys.executable, str(TOOLS_DIR / "slack_discussion_router.py")]
    if dry_run:
        cmd.append("--dry-run")
    result = run_command(cmd, timeout=120)
    if result.returncode != 0:
        return {
            "ok": False,
            "error": (result.stderr.strip() or result.stdout.strip())[:800],
        }
    try:
        data = json.loads(result.stdout)
    except json.JSONDecodeError:
        return {"ok": False, "error": f"slack_discussion_router.py returned non-json: {result.stdout[:500]}"}
    data["ok"] = True
    return data


def run_memory_health() -> str:
    result = run_command([sys.executable, str(TOOLS_DIR / "memory_health.py"), "--compact"], timeout=60)
    text = result.stdout.strip() or result.stderr.strip()
    if result.returncode not in (0, 1):
        return f"memory_health=unknown error={text[:160]}"
    return text[:500]


def load_atoms(limit: int = 2000) -> list[dict[str, Any]]:
    atoms_path = MEMORY_DIR / "atoms.jsonl"
    if not atoms_path.exists():
        return []
    atoms: list[dict[str, Any]] = []
    with atoms_path.open("r", encoding="utf-8") as f:
        for line in f:
            if not line.strip():
                continue
            atoms.append(json.loads(line))
            if len(atoms) >= limit:
                break
    return atoms


def select_recent_atoms(atoms: list[dict[str, Any]], count: int = 3) -> list[dict[str, Any]]:
    return sorted(atoms, key=lambda a: str(a.get("datetime", "")), reverse=True)[:count]


def atom_analysis(atom: dict[str, Any]) -> list[str]:
    tags = set(atom.get("tags", []))
    title = atom.get("title", "(untitled)")
    lines = [f"- `{atom.get('id')}` {title}"]

    if "memory" in tags and "harness" in tags:
        lines.append("  - 読み: 記憶を保存場所ではなく、判断を変える観測装置として扱う話。")
    elif "memory" in tags:
        lines.append("  - 読み: 次回の想起条件を残す価値がある。要約よりも、いつ引くべきかが重要。")
    elif "game-design" in tags:
        lines.append("  - 読み: ゲーム設計単体ではなく、評価軸やプレイヤープロファイルの固定に効く。")
    else:
        lines.append("  - 読み: shared-reads 由来の外部知見として、後で検索できる状態にしておく価値がある。")

    if "operation" in tags or "agent" in tags:
        lines.append("  - 運用への戻し: 自動化で見えなくなる部分を、ログ・状態ファイル・source_ts で観測可能にする。")
    if "evaluation" in tags:
        lines.append("  - 判断への戻し: 「面白い・正しい」と言う前に、誰の評価軸で何を測っているかを明示する。")
    if atom.get("links"):
        lines.append(f"  - 原文アンカー: {', '.join(atom.get('links', [])[:2])}")
    return lines


def build_message(ingest: dict[str, Any], state: dict[str, Any], reason: str) -> str:
    atoms = load_atoms()
    recent = select_recent_atoms(atoms)
    added = ingest.get("added_atoms", 0)
    total = ingest.get("total_atoms", len(atoms))
    source_rows = ingest.get("source_rows", "?")

    slack_info = ingest.get("slack", {})
    directive_info = ingest.get("slack_directives", {})
    external_info = ingest.get("external_research", {})
    deep_repost_info = ingest.get("shared_reads_deep_repost", {})
    game_feedback_info = ingest.get("game_feedback", {})
    discussion_info = ingest.get("discussion_router", {})
    interesting = slack_info.get("interesting", [])
    analysis_atoms = interesting[:3] if interesting else recent[:3]

    lines = [
        "[Codex][90分サイクル] 記憶更新とSlack新規投稿チェック",
        f"- 時刻: {now_iso()}",
        f"- 実行理由: {reason}",
        f"- archive取り込み: 追加={added}, total_atoms={total}, source_rows={source_rows}",
        f"- Slack新規確認: seen={slack_info.get('seen_messages', 0)}, atom追加={slack_info.get('added_atoms', 0)}",
        f"- Nao_u→log_cdx指示: scanned={directive_info.get('scanned_messages', 0)}, found={directive_info.get('directives_found', 0)}",
        f"- 外部検索: fetched={external_info.get('fetched', 0)}, selected={external_info.get('selected', 0)}, posted={external_info.get('posted', False)}",
        f"- shared-reads深掘り再投稿: ready={deep_repost_info.get('ready_count', 0)}, posted={len(deep_repost_info.get('posted', []))}, target_chars={deep_repost_info.get('target_chars', 4000)}",
        f"- game-rights教師化: seen={game_feedback_info.get('seen_messages', 0)}, feedback={game_feedback_info.get('feedback_atoms', 0)}, atom追加={game_feedback_info.get('added_atoms', 0)}",
        f"- all-nao-u-lab議論投入: selected={discussion_info.get('selected', False)}, posted={discussion_info.get('posted', False)}",
        f"- 健全性: {ingest.get('health', '未確認')}",
        "- 次に使う検索: `python tools/memory_recall.py \"<焦点>\"`",
    ]
    if not external_info.get("ok", True):
        lines.append(f"- 外部検索エラー: {external_info.get('error', '')[:240]}")
    if not deep_repost_info.get("ok", True):
        lines.append(f"- shared-reads深掘り再投稿エラー: {deep_repost_info.get('error', '')[:240]}")
    if not directive_info.get("ok", True):
        lines.append(f"- Nao_u→log_cdx指示チェックエラー: {directive_info.get('error', '')[:240]}")
    if not game_feedback_info.get("ok", True):
        lines.append(f"- game-rights教師化エラー: {game_feedback_info.get('error', '')[:240]}")
    if directive_info.get("directives"):
        lines.append("")
        lines.append("## Nao_uからlog_cdx宛の新規指示")
        for directive in directive_info.get("directives", [])[:5]:
            lines.append(f"- #{directive.get('channel')} {directive.get('permalink')}")
            lines.append(f"  - {str(directive.get('text', '')).strip()[:180]}")
    if not discussion_info.get("ok", True):
        lines.append(f"- all-nao-u-lab議論投入エラー: {discussion_info.get('error', '')[:240]}")

    if interesting:
        lines.append("")
        lines.append("## 新規Slackから記憶化した注目atom")
        for atom in interesting[:3]:
            title = atom.get("title", "(untitled)")
            tags = ", ".join(atom.get("tags", [])[:5])
            lines.append(f"- `{atom.get('id')}` {title[:110]} tags=[{tags}]")
            lines.append(f"  - 見立て: {atom.get('trigger', '')[:180]}")
    elif recent:
        lines.append("")
        lines.append("## 直近atomの分析")
        for atom in recent[:3]:
            title = atom.get("title", "(untitled)")
            tags = ", ".join(atom.get("tags", [])[:5])
            lines.append(f"- `{atom.get('id')}` {title[:110]} tags=[{tags}]")

    if analysis_atoms:
        lines.append("")
        lines.append("## 注目内容の詳細分析")
        for atom in analysis_atoms:
            lines.extend(atom_analysis(atom))

    lines += [
        "",
        "## サイクル方針",
        "- このサイクルの目的は、Slackを読んだ事実を流すことではなく、次回の判断で再利用できる形に変換すること。",
        "- 有用投稿は GPT 側 `memory/raw/` に原文を保持し、`source_ts`・短いexcerpt・`Use when` trigger として atom 化する。",
        "- 興味深い投稿がある場合は、単なる紹介ではなく「どの判断に効くか」「どの既存テーマに接続するか」を #log に残す。",
    ]

    last_error = state.get("last_error")
    if last_error:
        lines.append(f"- previous_error_cleared: {str(last_error)[:180]}")
    return "\n".join(lines)


def save_status_locally(text: str, dry_run: bool) -> dict[str, Any]:
    """Save deterministic status report to local file (Slack 投稿は停止)。

    Nao_u 指示 2026-05-13: テンプレ status 投稿は #log を埋めるノイズ。
    Slack に流すべき日記は `codex_phases_cycle.py` Phase 5 (LLM 駆動) が担う。
    本 status は local 保存のみとし、Codex 作業時に最新版を読めるようにする。
    """
    status_path = LOG_DIR / "codex_log_cycle_status.md"
    if dry_run:
        return {"ok": True, "dry_run": True, "would_save_to": str(status_path)}
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    status_path.write_text(text, encoding="utf-8", newline="\n")
    return {"ok": True, "saved_to": str(status_path), "char_count": len(text)}


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Codex deterministic maintenance cycle (memory ingest + local status save). "
                    "Slack 投稿は廃止 (Nao_u 指示 2026-05-13)。日記は codex_phases_cycle.py Phase 5 が担う。",
    )
    parser.add_argument("--channel", default=DEFAULT_CHANNEL, help="(deprecated/unused) Slack channel name; retained for arg compat")
    parser.add_argument("--interval-sec", type=int, default=DEFAULT_INTERVAL_SEC)
    parser.add_argument("--force", action="store_true")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    MEMORY_DIR.mkdir(parents=True, exist_ok=True)
    should, reason, state = should_run(args.interval_sec, args.force)
    if not should:
        log(reason)
        print(reason)
        return 0

    try:
        log(f"run start ({reason})")
        external_research = run_external_research(args.dry_run)
        shared_reads_deep_repost = run_shared_reads_deep_repost(args.dry_run)
        game_feedback = run_game_feedback_ingest(args.dry_run)
        slack_directives = run_slack_directives(args.dry_run)
        slack_ingest = run_slack_ingest()
        discussion_router = run_discussion_router(args.dry_run)
        ingest = run_ingest()
        ingest["slack"] = slack_ingest
        ingest["slack_directives"] = slack_directives
        ingest["external_research"] = external_research
        ingest["shared_reads_deep_repost"] = shared_reads_deep_repost
        ingest["game_feedback"] = game_feedback
        ingest["discussion_router"] = discussion_router
        ingest["health"] = run_memory_health()
        message = build_message(ingest, state, reason)
        result = save_status_locally(message, args.dry_run)
        if not result.get("ok"):
            raise RuntimeError(f"Status save failed: {result}")
        if args.dry_run:
            state.update(
                {
                    "last_dry_run": now_iso(),
                    "last_dry_run_reason": reason,
                    "last_error": None,
                }
            )
        else:
            state.update(
                {
                    "last_success": now_iso(),
                    "last_reason": reason,
                    "last_status_save": result,
                    "last_error": None,
                }
            )
        save_state(state)
        if not args.dry_run:
            git_sync = run_git_sync("codex: sync deterministic cycle outputs")
            state["last_git_sync"] = git_sync
            save_state(state)
        log(f"run success dry_run={args.dry_run} saved={result.get('saved_to', '-')}")
        print(message)
        return 0
    except Exception as exc:
        state.update({"last_attempt": now_iso(), "last_error": str(exc)})
        save_state(state)
        log(f"run failed: {exc}")
        print(f"FAILED: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
