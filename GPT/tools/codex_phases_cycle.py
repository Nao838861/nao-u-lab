#!/usr/bin/env python3
"""Phased log_cdx cycle orchestrator (scaffold).

Goal: ゲーム制作のための情報収集 + 経験を次の制作に活かす記憶システム構築。

5+ phases sequentially via Codex CLI (1 LLM session per phase), with a staging
file for cross-phase handoff. Conditional gating on Phase 4b / 4c.

Architecture: Claude 側 `docs/scheduler_architecture.md` セクション 11
(Ash auto_diary 4 phase 分割) と同型。

CURRENT STATE (2026-05-12 initial scaffold):
  - State management + interval gating: WORKING
  - Staging file init: WORKING
  - Conditional gating parse (4b/4c): WORKING (naive substring match)
  - Codex CLI invocation: STUB (invoke_codex_cli は print のみ、実装は次サイクルで)

TODO for Codex (Phase 4c で自己実装):
  - `invoke_codex_cli(phase_name)` の実体を埋める。想定:
      subprocess.run(["codex", "exec", "--prompt-file", str(prompt_path), "--working-dir", str(ROOT), ...], check=True)
  - 実環境での Codex CLI 起動方法を検証してから実コマンドに置換
  - install スクリプト (`install_codex_phases_cycle_task.ps1`) を作る (既存
    `install_codex_log_cycle_task.ps1` を雛形に)
"""
from __future__ import annotations

import argparse
import json
import subprocess  # noqa: F401  # for future CLI invocation
import sys
from datetime import datetime
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
PHASES_DIR = ROOT / "phases"
LOG_DIR = ROOT / "log"
MEMORY_DIR = ROOT / "memory"
STAGING_PATH = LOG_DIR / "cycle_staging_log_cdx.md"
STATE_PATH = MEMORY_DIR / "codex_phases_cycle_state.json"
RUN_LOG_PATH = LOG_DIR / "codex_phases_cycle.log"

DEFAULT_INTERVAL_SEC = int(2.5 * 60 * 60)  # 2.5h

FIXED_PHASES = [
    "phase1_collect",
    "phase2_analyze",
    "phase3_post_shared_reads",
    "phase4a_cleanup",
]
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
    - 出力は log に末尾だけ記録 (フル stdout は別ファイルに保存)
    """
    import subprocess

    prompt_path = PHASES_DIR / f"{phase_name}.md"
    if not prompt_path.exists():
        log(f"phase prompt not found: {prompt_path}")
        return 1

    prompt_text = prompt_path.read_text(encoding="utf-8")
    timeout = PHASE_TIMEOUTS.get(phase_name, 1800)
    stdout_path = LOG_DIR / f"codex_phase_{phase_name}_last.stdout.txt"
    stderr_path = LOG_DIR / f"codex_phase_{phase_name}_last.stderr.txt"

    cmd = [
        "codex",
        "exec",
        "--cd",
        str(ROOT),
        "--dangerously-bypass-approvals-and-sandbox",
        "-",
    ]
    log(f"codex exec start phase={phase_name} timeout={timeout}s")
    try:
        result = subprocess.run(
            cmd,
            input=prompt_text,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=timeout,
        )
    except subprocess.TimeoutExpired as exc:
        log(f"codex exec TIMEOUT phase={phase_name}: {exc}")
        stdout_path.write_text(exc.stdout or "", encoding="utf-8")
        stderr_path.write_text(exc.stderr or "", encoding="utf-8")
        return 124
    except FileNotFoundError:
        log("codex CLI not found in PATH")
        return 127

    stdout_path.write_text(result.stdout or "", encoding="utf-8")
    stderr_path.write_text(result.stderr or "", encoding="utf-8")
    tail = (result.stdout or "")[-800:]
    log(f"codex exec end phase={phase_name} rc={result.returncode}")
    log(f"stdout tail: {tail!r}")
    return result.returncode


def run_phase(phase_name: str) -> int:
    log(f"phase {phase_name} start")
    rc = invoke_codex_cli(phase_name)
    log(f"phase {phase_name} end (rc={rc})")
    return rc


def main() -> int:
    parser = argparse.ArgumentParser(description="log_cdx phased cycle orchestrator (scaffold).")
    parser.add_argument("--force", action="store_true", help="ignore interval gate")
    parser.add_argument("--phase", help="run a single phase by name (no init, no gating)")
    parser.add_argument("--dry-run", action="store_true", help="show plan, do not invoke")
    args = parser.parse_args()

    state = load_state()

    if args.phase:
        log(f"single-phase run: {args.phase}")
        return run_phase(args.phase)

    should, reason = should_run(state, args.force)
    log(f"gate: should_run={should} reason={reason}")
    if not should:
        print(reason)
        return 0

    cycle_id = datetime.now().strftime("%Y-%m-%d %H:%M")
    log(f"cycle start: {cycle_id} ({reason})")
    if args.dry_run:
        plan = FIXED_PHASES + ["(maybe " + CONDITIONAL_4B + ")", "(maybe " + CONDITIONAL_4C + ")", FINAL_PHASE]
        print("dry-run plan:")
        for p in plan:
            print(f"  - {p}")
        return 0

    init_staging(cycle_id)

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
        "last_reason": reason,
        "last_error": None,
    })
    save_state(state)
    log(f"cycle success: {cycle_id}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
