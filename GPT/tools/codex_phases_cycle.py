#!/usr/bin/env python3
"""Phased log_cdx cycle orchestrator.

Goal: ゲーム制作のための情報収集 + 経験を次の制作に活かす記憶システム構築。

5+ phases sequentially via Codex CLI (1 LLM session per phase), with a staging
file for cross-phase handoff. Conditional gating on Phase 4b / 4c.

Architecture: Claude 側 `docs/scheduler_architecture.md` セクション 11
(Ash auto_diary 4 phase 分割) と同型。

CURRENT STATE (2026-05-15):
  - State management + interval gating: WORKING
  - Staging file init: WORKING
  - Conditional gating parse (4b/4c): WORKING (naive substring match)
  - Codex CLI invocation: WORKING (`codex exec --cd ROOT ...`)
  - Windows scheduled task installer: `tools/install_codex_phases_cycle_task.ps1`
"""
from __future__ import annotations

import argparse
import os
import json
import subprocess
import sys
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
PHASES_DIR = ROOT / "phases"
LOG_DIR = ROOT / "log"
MEMORY_DIR = ROOT / "memory"
STAGING_PATH = LOG_DIR / "cycle_staging_log_cdx.md"
STATE_PATH = MEMORY_DIR / "codex_phases_cycle_state.json"
RUN_LOG_PATH = LOG_DIR / "codex_phases_cycle.log"
LOCK_PATH = MEMORY_DIR / "codex_phases_cycle.lock.json"

DEFAULT_INTERVAL_SEC = 90 * 60  # 90 min
LOCK_STALE_AFTER = timedelta(hours=6)

FIXED_PHASES = [
    "phase1_collect",
    "phase2_analyze",
    "phase3_post_shared_reads",
    "phase3b_self_feedback",
    "phase4a_cleanup",
]
GAME_START_PHASE = "phase_game_start"
CONDITIONAL_4B = "phase4b_design"
CONDITIONAL_4C = "phase4c_introduce"
FINAL_PHASE = "phase5_diary"


if sys.stdout.encoding and sys.stdout.encoding.lower().startswith("cp"):
    sys.stdout = open(sys.stdout.fileno(), mode="w", encoding="utf-8", errors="replace", closefd=False)


def now_iso() -> str:
    return datetime.now().isoformat(timespec="seconds")


def log(msg: str) -> None:
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    with RUN_LOG_PATH.open("a", encoding="utf-8", newline="\n") as f:
        f.write(f"{now_iso()} {msg}\n")


def load_state() -> dict[str, Any]:
    if not STATE_PATH.exists():
        return {}
    try:
        return json.loads(STATE_PATH.read_text(encoding="utf-8"))
    except Exception:
        return {}


def save_state(state: dict[str, Any]) -> None:
    MEMORY_DIR.mkdir(parents=True, exist_ok=True)
    STATE_PATH.write_text(
        json.dumps(state, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def is_process_running(pid: int | None) -> bool:
    if not pid or pid <= 0:
        return False
    try:
        os.kill(pid, 0)
    except OSError:
        return False
    except Exception:
        return True
    return True


def acquire_lock() -> bool:
    MEMORY_DIR.mkdir(parents=True, exist_ok=True)
    lock = {
        "pid": os.getpid(),
        "started_at": now_iso(),
    }
    try:
        fd = os.open(str(LOCK_PATH), os.O_CREAT | os.O_EXCL | os.O_WRONLY)
    except FileExistsError:
        existing_pid = None
        try:
            existing = json.loads(LOCK_PATH.read_text(encoding="utf-8"))
            existing_pid = int(existing.get("pid") or 0)
            started_at = datetime.fromisoformat(str(existing.get("started_at", "")))
        except Exception:
            started_at = None
        if (
            started_at
            and datetime.now() - started_at < LOCK_STALE_AFTER
            and is_process_running(existing_pid)
        ):
            log(f"lock exists; skipping overlapping run: {LOCK_PATH}")
            return False
        if started_at and datetime.now() - started_at < LOCK_STALE_AFTER:
            log(f"stale lock pid not running: pid={existing_pid} path={LOCK_PATH}")
        stale_path = LOCK_PATH.with_suffix(f".stale-{datetime.now().strftime('%Y%m%d_%H%M%S')}.json")
        try:
            LOCK_PATH.replace(stale_path)
            log(f"stale lock moved to {stale_path}")
        except Exception as exc:
            log(f"failed to move stale lock {LOCK_PATH}: {exc!r}")
            return False
        fd = os.open(str(LOCK_PATH), os.O_CREAT | os.O_EXCL | os.O_WRONLY)
    with os.fdopen(fd, "w", encoding="utf-8", newline="\n") as f:
        json.dump(lock, f, ensure_ascii=False, indent=2)
        f.write("\n")
    return True


def release_lock() -> None:
    try:
        existing = json.loads(LOCK_PATH.read_text(encoding="utf-8"))
    except Exception:
        return
    if existing.get("pid") != os.getpid():
        log(f"lock pid mismatch; not removing {LOCK_PATH}")
        return
    try:
        LOCK_PATH.unlink()
    except FileNotFoundError:
        pass
    except Exception as exc:
        log(f"failed to remove lock {LOCK_PATH}: {exc!r}")


def should_run(state: dict[str, Any], force: bool) -> tuple[bool, str]:
    if force:
        return True, "forced"
    last_success = state.get("last_success")
    if not last_success:
        return True, "no previous run"
    try:
        last_dt = datetime.fromisoformat(last_success)
    except ValueError:
        return True, "unreadable last_success"
    elapsed = (datetime.now() - last_dt).total_seconds()
    if elapsed >= DEFAULT_INTERVAL_SEC:
        return True, f"elapsed {elapsed / 60:.0f}min >= {DEFAULT_INTERVAL_SEC / 60:.0f}min"
    return False, f"skipped: elapsed {elapsed / 60:.0f}min < {DEFAULT_INTERVAL_SEC / 60:.0f}min"


def init_staging(cycle_id: str) -> None:
    template = f"""# log_cdx Cycle Staging — {cycle_id}

<!-- 各フェーズは下記セクションに追記。前フェーズの内容を消さない。 -->

## Phase 1: 情報収集
(Phase 1 が書き込む)

## Phase 2: 分析
(Phase 2 が書き込む)

## Phase 3: Shared-reads 投稿
(Phase 3 が書き込む)

## Phase 3b: Shared-reads 自己フィードバック
(Phase 3b が書き込む)

## Phase 4a: 整理 + 問題抽出
(Phase 4a が書き込む)

## Phase 4b: 仕組み検討 (条件起動)
(Phase 4a が needs_design: true の場合のみ実行される)

## Phase 4c: 導入 (条件起動)
(Phase 4b で decision: introduce が出た場合のみ実行される)

## Phase 5: 日記投稿
(Phase 5 が書き込む)
"""
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    STAGING_PATH.write_text(template, encoding="utf-8")


def read_staging() -> str:
    if not STAGING_PATH.exists():
        return ""
    return STAGING_PATH.read_text(encoding="utf-8")


def read_jsonl(path: Path) -> list[dict[str, Any]]:
    if not path.exists():
        return []
    rows: list[dict[str, Any]] = []
    with path.open("r", encoding="utf-8-sig") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                rows.append(json.loads(line))
            except json.JSONDecodeError:
                continue
    return rows


def has_active_local_game_directive() -> bool:
    game_dir = ROOT / "game"
    if not game_dir.exists():
        return False
    for directive_path in game_dir.rglob("CONTINUOUS_DIRECTIVE.md"):
        try:
            text = directive_path.read_text(encoding="utf-8-sig")
        except OSError:
            continue
        for line in text.splitlines():
            if line.strip().lower() == "status: active":
                return True
    return False


def has_game_start_routing_tag(row: dict[str, Any]) -> bool:
    tags = row.get("routing_tags")
    if isinstance(tags, list):
        return "game_start" in {str(tag) for tag in tags}
    return False


def has_pending_game_directive() -> bool:
    if has_active_local_game_directive():
        return True

    directives = read_jsonl(MEMORY_DIR / "slack_directives.jsonl")
    for row in directives:
        if row.get("status") != "pending":
            continue
        if row.get("domain") == "game":
            return True
        if has_game_start_routing_tag(row):
            return True
        text = str(row.get("text", ""))
        if "ゲーム" in text and ("作" in text or "始め" in text):
            return True
    return False


def _section_text(staging: str, header_prefix: str) -> str:
    if header_prefix not in staging:
        return ""
    section = staging.split(header_prefix, 1)[1]
    if "\n## " in section:
        section = section.split("\n## ", 1)[0]
    return section


def needs_phase4b(staging: str) -> bool:
    """Check if Phase 4a flagged needs_design: true."""
    a = _section_text(staging, "## Phase 4a:")
    return "needs_design: true" in a


def has_introduce_decision(staging: str) -> bool:
    """Check if Phase 4b has any decision: introduce."""
    b = _section_text(staging, "## Phase 4b:")
    return "decision: introduce" in b


PHASE_TIMEOUTS = {
    "phase1_collect": 1800,           # 30 min
    "phase2_analyze": 1800,           # 30 min
    "phase3_post_shared_reads": 3600, # 60 min (per pass candidate)
    "phase3b_self_feedback": 1800,    # 30 min
    "phase_game_start": 7200,         # 120 min (direct game-making directive)
    "phase4a_cleanup": 1200,          # 20 min
    "phase4b_design": 2400,           # 40 min
    "phase4c_introduce": 3600,        # 60 min
    "phase5_diary": 1500,             # 25 min
}


def invoke_codex_cli(phase_name: str) -> int:
    """Invoke Codex CLI with the phase prompt via stdin.

    Codex CLI (OpenAI @openai/codex) を非対話モードで呼ぶ。
    - `--cd` で作業ディレクトリを GPT/ ROOT に固定
    - `--dangerously-bypass-approvals-and-sandbox` で承認プロンプト・サンドボックスを
      バイパス (autonomous cycle のため)
    - prompt は stdin から読ませる (- 引数)
    - Windows では codex は .CMD として PATH にいるので shutil.which で解決
    - 出力は log に末尾だけ記録 (フル stdout は別ファイルに保存)
    """
    import shutil
    import subprocess

    prompt_path = PHASES_DIR / f"{phase_name}.md"
    if not prompt_path.exists():
        log(f"phase prompt not found: {prompt_path}")
        return 1

    codex_bin = shutil.which("codex")
    if not codex_bin:
        log("codex CLI not found in PATH (tried shutil.which('codex'))")
        return 127

    prompt_text = prompt_path.read_text(encoding="utf-8")
    timeout = PHASE_TIMEOUTS.get(phase_name, 1800)
    stdout_path = LOG_DIR / f"codex_phase_{phase_name}_last.stdout.txt"
    stderr_path = LOG_DIR / f"codex_phase_{phase_name}_last.stderr.txt"

    cmd = [
        codex_bin,
        "exec",
        "--cd",
        str(ROOT),
        "--dangerously-bypass-approvals-and-sandbox",
        "-",
    ]
    log(f"codex exec start phase={phase_name} timeout={timeout}s bin={codex_bin}")
    proc = subprocess.Popen(
        cmd,
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    try:
        stdout, stderr = proc.communicate(prompt_text, timeout=timeout)
    except subprocess.TimeoutExpired:
        log(f"codex exec TIMEOUT phase={phase_name}; terminating process tree pid={proc.pid}")
        kill_process_tree(proc.pid)
        try:
            stdout, stderr = proc.communicate(timeout=30)
        except subprocess.TimeoutExpired:
            log(f"codex exec TIMEOUT phase={phase_name}; process tree did not exit cleanly")
            proc.kill()
            stdout, stderr = proc.communicate()
        stdout_path.write_text(stdout or "", encoding="utf-8")
        stderr_path.write_text(stderr or "", encoding="utf-8")
        return 124

    stdout_path.write_text(stdout or "", encoding="utf-8")
    stderr_path.write_text(stderr or "", encoding="utf-8")
    tail = (stdout or "")[-800:]
    log(f"codex exec end phase={phase_name} rc={proc.returncode}")
    log(f"stdout tail: {tail!r}")
    return proc.returncode


def kill_process_tree(pid: int) -> None:
    """Best-effort cleanup for Windows scheduled Codex runs.

    `codex.CMD` starts node/codex descendants. Killing only the direct process can
    leave descendants holding stdout/stderr pipes, which prevents `communicate`
    from returning after the timeout.
    """
    if sys.platform == "win32":
        try:
            subprocess.run(
                ["taskkill", "/PID", str(pid), "/T", "/F"],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                encoding="utf-8",
                errors="replace",
                timeout=30,
            )
        except Exception as exc:
            log(f"taskkill failed for pid={pid}: {exc!r}")
        return
    try:
        proc = subprocess.Popen(["pkill", "-TERM", "-P", str(pid)])
        proc.wait(timeout=10)
    except Exception:
        pass
    try:
        subprocess.Popen(["kill", "-TERM", str(pid)]).wait(timeout=10)
    except Exception as exc:
        log(f"kill failed for pid={pid}: {exc!r}")


def run_phase(phase_name: str) -> int:
    log(f"phase {phase_name} start")
    rc = invoke_codex_cli(phase_name)
    log(f"phase {phase_name} end (rc={rc})")
    return rc


def run_git_sync(message: str) -> dict[str, Any]:
    """Commit and push GPT-owned outputs produced by successful phase cycles."""
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


def main() -> int:
    parser = argparse.ArgumentParser(description="log_cdx phased cycle orchestrator (scaffold).")
    parser.add_argument("--force", action="store_true", help="ignore interval gate")
    parser.add_argument("--phase", help="run a single phase by name (no init, no gating)")
    parser.add_argument("--dry-run", action="store_true", help="show plan, do not invoke")
    args = parser.parse_args()

    if not args.dry_run and not acquire_lock():
        print("skipped: codex phases cycle already running")
        return 0

    try:
        state = load_state()

        if args.phase:
            log(f"single-phase run: {args.phase}")
            rc = run_phase(args.phase)
            if rc == 0:
                git_sync = run_git_sync(f"codex: sync {args.phase} outputs")
                log(f"git sync after single phase: {git_sync}")
            return rc

        should, reason = should_run(state, args.force)
        log(f"gate: should_run={should} reason={reason}")
        if not should:
            print(reason)
            return 0

        cycle_id = datetime.now().strftime("%Y-%m-%d %H:%M")
        log(f"cycle start: {cycle_id} ({reason})")
        if args.dry_run:
            game_prefix = [GAME_START_PHASE] if has_pending_game_directive() else []
            plan = game_prefix + list(FIXED_PHASES) + ["(maybe " + CONDITIONAL_4B + ")", "(maybe " + CONDITIONAL_4C + ")", FINAL_PHASE]
            print("dry-run plan:")
            for p in plan:
                print(f"  - {p}")
            return 0

        init_staging(cycle_id)

        ran_game_start = False
        if has_pending_game_directive():
            log("pending game directive found -> running game start phase, then continuing into regular research cycle (Phase 1-4) so research does not go empty")
            rc = run_phase(GAME_START_PHASE)
            if rc != 0:
                log(f"cycle aborted at {GAME_START_PHASE} (rc={rc})")
                state["last_attempt"] = now_iso()
                state["last_error"] = f"{GAME_START_PHASE} failed rc={rc}"
                save_state(state)
                return rc
            ran_game_start = True

        for phase in FIXED_PHASES:
            rc = run_phase(phase)
            if rc != 0:
                log(f"cycle aborted at {phase} (rc={rc})")
                state["last_attempt"] = now_iso()
                state["last_error"] = f"{phase} failed rc={rc}"
                save_state(state)
                return rc

        staging = read_staging()

        if needs_phase4b(staging):
            log("4a flagged needs_design: true -> running 4b")
            rc = run_phase(CONDITIONAL_4B)
            if rc != 0:
                log(f"cycle aborted at {CONDITIONAL_4B} (rc={rc})")
                state["last_attempt"] = now_iso()
                state["last_error"] = f"{CONDITIONAL_4B} failed rc={rc}"
                save_state(state)
                return rc
            staging = read_staging()
            if has_introduce_decision(staging):
                log("4b produced decision: introduce -> running 4c")
                rc = run_phase(CONDITIONAL_4C)
                if rc != 0:
                    log(f"cycle aborted at {CONDITIONAL_4C} (rc={rc})")
                    state["last_attempt"] = now_iso()
                    state["last_error"] = f"{CONDITIONAL_4C} failed rc={rc}"
                    save_state(state)
                    return rc
            else:
                log("4b decision != introduce -> skipping 4c")
        else:
            log("4a flagged needs_design: false -> skipping 4b/4c")

        rc = run_phase(FINAL_PHASE)
        if rc != 0:
            log(f"cycle aborted at {FINAL_PHASE} (rc={rc})")
            state["last_attempt"] = now_iso()
            state["last_error"] = f"{FINAL_PHASE} failed rc={rc}"
            save_state(state)
            return rc

        state.update({
            "last_success": now_iso(),
            "last_cycle_id": cycle_id,
            "last_reason": reason + (" + game directive" if ran_game_start else ""),
            "last_error": None,
        })
        save_state(state)
        git_sync = run_git_sync("codex: sync phased cycle outputs")
        state["last_git_sync"] = git_sync
        save_state(state)
        log(f"cycle success: {cycle_id}{' (game directive + research)' if ran_game_start else ''}")
        return 0
    finally:
        if not args.dry_run:
            release_lock()


if __name__ == "__main__":
    raise SystemExit(main())
