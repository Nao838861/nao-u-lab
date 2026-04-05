#!/usr/bin/env python3
"""
multi_phase_cycle_log.py — Log(Win) マルチフェーズ自律サイクル

Nao_uの提案(2026-04-05 #human-steering):
  「LLMは一回の起動でやるべきことが多いと注意が分散して散漫になる」
  → 1サイクルを複数LLM起動に分割して注意を集中させる。

Mirの4フェーズ分割(autonomous_cycle.sh)を参考にLog向けに実装。

4 Phases:
  Phase 1 (Gather/5min): Slack確認、情報収集、ステージング書き出し
  Phase 2 (Analyze/8min): shared-reads深い分析、外部ノート統合
  Phase 3 (Act/8min): 改善適用、Slack返信、プロジェクト更新
  Phase 4 (Diary/7min): 活動日記 + 次回起動時にやること + git push

ステージングファイル: log/cycle_staging.md（Phase間の情報受け渡し）

Usage:
  python multi_phase_cycle_log.py           # 通常実行（4フェーズ全部）
  python multi_phase_cycle_log.py --phase 2 # 特定フェーズのみ（デバッグ用）
"""

import sys
import os
import subprocess
import time
import argparse
from pathlib import Path
from datetime import datetime

REPO_DIR = Path(__file__).parent
sys.path.insert(0, str(REPO_DIR))

from claude_runner import build_claude_cmd

os.environ["PYTHONUTF8"] = "1"
os.environ["PYTHONIOENCODING"] = "utf-8"

PY = [sys.executable, "-X", "utf8"]
STAGING_FILE = REPO_DIR / "log" / "cycle_staging.md"
LOG_FILE = REPO_DIR / "log" / "scheduler_log.log"

# Windows: 子プロセスのウィンドウを非表示にする
if sys.platform == "win32":
    _CREATION_FLAGS = 0x08000000  # CREATE_NO_WINDOW
else:
    _CREATION_FLAGS = 0

# Phase timeouts (seconds)
PHASE_TIMEOUTS = {
    1: 300,   # 5min: Gather
    2: 480,   # 8min: Analyze
    3: 480,   # 8min: Act
    4: 420,   # 7min: Diary
}


def log(msg):
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{ts}] {msg}"
    print(line, flush=True)
    try:
        with open(LOG_FILE, "a", encoding="utf-8") as f:
            f.write(line + "\n")
    except Exception:
        pass


def run_prechecks():
    """Run pre-check scripts and collect alert strings."""
    alerts = []
    for script, args, label, timeout_s in [
        ("check_kaizen_due.py", [], "検証リマインド", 10),
        ("verify_kaizen.py", [], "自動検証結果", 60),
        ("verify_kaizen.py", ["--meta"], "メタ検証", 30),
        ("verify_kaizen.py", ["--nag"], "クロスチェック督促", 30),
        ("check_kaizen_crosscheck.py", ["--who=Log"], "クロスチェック", 10),
        ("check_reservations.py", [], "行動予約", 10),
        ("memory_walk.py", ["--n", "1"], "記憶の散歩", 10),
        ("check_beliefs_health.py", ["--summary"], "信念健康", 10),
        ("check_kaizen_due.py", ["--auto-verify"], "自動検証", 60),
        ("slack_insight_digest.py", ["--compact", "--hours", "72"], "他インスタンス洞察", 15),
    ]:
        try:
            r = subprocess.run(
                [*PY, str(REPO_DIR / script)] + args,
                capture_output=True, text=True, timeout=timeout_s,
                cwd=str(REPO_DIR), encoding="utf-8", errors="replace",
                creationflags=_CREATION_FLAGS,
            )
            if r.returncode == 0 and r.stdout.strip():
                out = r.stdout.strip()
                skip_words = ["検証対象なし", "自動検証対象なし", "未レビュー項目なし", "nag不要"]
                if not any(w in out for w in skip_words):
                    alerts.append(f"[{label}] {out[:300]}")
                    log(f"[multi_phase] {label}: {out[:100]}")
        except Exception as e:
            log(f"[multi_phase] {label} error: {e}")
    return alerts


def run_periodic_checks():
    """Run kaizen checklist and weekly review (elapsed-time based, not LLM-dependent)."""
    # Kaizen checklist (24h interval)
    checklist_ts_file = REPO_DIR / ".kaizen_status_last_posted"
    should_run = True
    try:
        if checklist_ts_file.exists():
            last_posted = datetime.fromisoformat(checklist_ts_file.read_text().strip())
            if (datetime.now() - last_posted).total_seconds() < 24 * 3600:
                should_run = False
    except Exception:
        pass
    if should_run:
        try:
            r = subprocess.run(
                [*PY, str(REPO_DIR / "verify_kaizen.py"), "--slack-status"],
                capture_output=True, text=True, timeout=30,
                cwd=str(REPO_DIR), encoding="utf-8", errors="replace",
                creationflags=_CREATION_FLAGS,
            )
            if r.returncode == 0:
                checklist_ts_file.write_text(datetime.now().isoformat())
                log(f"[multi_phase] Kaizen checklist posted: {r.stdout.strip()[:100]}")
        except Exception as e:
            log(f"[multi_phase] kaizen-status error: {e}")

    # Weekly self-review (Sunday, 7-day interval)
    weekly_flag = ""
    weekly_ts_file = REPO_DIR / ".weekly_review_last_triggered"
    should_run_weekly = False
    if datetime.now().weekday() == 6:  # Sunday
        try:
            if weekly_ts_file.exists():
                last_review = datetime.fromisoformat(weekly_ts_file.read_text().strip())
                if (datetime.now() - last_review).total_seconds() >= 6 * 24 * 3600:
                    should_run_weekly = True
            else:
                should_run_weekly = True
        except Exception:
            should_run_weekly = True
    if should_run_weekly:
        weekly_flag = "[週次自己レビュー] 日曜日のため週次レビューを実行してください"
        weekly_ts_file.write_text(datetime.now().isoformat())
        log("[multi_phase] Weekly self-review trigger (Sunday)")
    return weekly_flag


def init_staging(alerts, weekly_flag):
    """Initialize staging file with pre-check results."""
    ts = datetime.now().strftime("%Y-%m-%d %H:%M")
    lines = [f"# サイクルステージング ({ts})", "", "## Pre-check結果"]
    for a in alerts:
        lines.append(a)
    if weekly_flag:
        lines.append(weekly_flag)
    lines.extend([
        "", "## Phase 1: 情報収集", "(Phase 1が書き込む)",
        "", "## Phase 2: 分析", "(Phase 2が書き込む)",
        "", "## Phase 3: アクション", "(Phase 3が書き込む)",
    ])
    STAGING_FILE.write_text("\n".join(lines), encoding="utf-8")
    log(f"[multi_phase] Staging initialized: {len(alerts)} alerts")


def run_phase(phase_num, phase_name, prompt, timeout_s):
    """Run a single phase via claude --print. Returns True on success."""
    log(f"[multi_phase] Phase {phase_num} ({phase_name}) starting (timeout={timeout_s}s)")
    start = time.time()
    try:
        cmd = build_claude_cmd(prompt)
        kwargs = dict(
            capture_output=True, text=True, timeout=timeout_s,
            cwd=str(REPO_DIR), encoding="utf-8", errors="replace",
        )
        if _CREATION_FLAGS:
            kwargs["creationflags"] = _CREATION_FLAGS
        r = subprocess.run(cmd, **kwargs)
        elapsed = time.time() - start
        log(f"[multi_phase] Phase {phase_num} ({phase_name}) finished in {elapsed:.0f}s (exit={r.returncode})")
        if r.returncode != 0 and r.stderr:
            log(f"[multi_phase] Phase {phase_num} stderr: {r.stderr[:200]}")
        return r.returncode == 0
    except subprocess.TimeoutExpired:
        elapsed = time.time() - start
        log(f"[multi_phase] Phase {phase_num} ({phase_name}) TIMEOUT after {elapsed:.0f}s")
        return False
    except Exception as e:
        log(f"[multi_phase] Phase {phase_num} ({phase_name}) error: {e}")
        return False


# --- Phase prompt builders ---

SLACK_RULES = (
    "[Slack投稿ルール] "
    "・Nao_uへの返信は同じチャンネルで返す（#nao-uだけ例外→#all-nao-u-labに書く） "
    "・外部記事への反応は1件ずつ別メッセージで投稿（まとめ返信禁止） "
    "・スレッド返信は使わない "
    "・#nao-uにはClaude投稿禁止 "
    "・各自チャンネルに長文日記+外部の新情報を交える "
    "・Slack即時応答最優先（Nao_uの時間を使わせない）"
)


def build_phase1_prompt(alert_block):
    return (
        "Log Phase 1 (Gather): 情報収集のみ。判断・行動・Slack投稿は禁止。\n"
        "log/cycle_staging.mdを読み、以下を実行して結果をlog/cycle_staging.mdの"
        "「Phase 1: 情報収集」セクションに追記:\n"
        "1) #nao-uチャンネル確認。新しいURLがあれば内容をメモ\n"
        "2) #all-nao-u-lab、#human-steering、#game-rights確認。返信すべきものをリストアップ\n"
        "3) pending_requests.md確認。対応すべきものをリストアップ\n"
        "4) memory/external_notes_log.mdの未統合エントリを確認。統合候補を1-2件選ぶ\n"
        "5) Activeプロジェクト(projects/INDEX.md)で今日関係しそうなものをメモ\n"
        "※Phase 1では情報を集めるだけ。分析・投稿・ファイル更新はPhase 2以降で行う。\n"
        "※inbox処理はinbox_checkが専用で行う。このサイクルでは行わない。\n"
        f"\nPre-check結果:\n{alert_block}"
    )


def build_phase2_prompt():
    return (
        "Log Phase 2 (Analyze): log/cycle_staging.mdを読み、Phase 1で集めた情報を深く分析。\n"
        "1) #nao-uの新URLに対する自分の反応を形成し#all-nao-u-labに投稿"
        "（1件ずつ別メッセージ。ルール8: 他者の反応を読む前に自分の視点を持つ）\n"
        "2) shared-readsに値する分析があれば#shared-readsに投稿"
        "（Nao_uの指示: 「なるべく詳細な記述と分析を。将来のアイデアの種につなげる"
        "大事な外部入力。1フェーズ丸ごと使ってもいいくらい重要」）\n"
        "3) external_notes_log.mdの未統合エントリ1-2件を日記やbeliefsに接続し"
        "[統合済 YYYY-MM-DD]マーカーを付ける\n"
        "4) 分析結果をlog/cycle_staging.mdのPhase 2セクションに追記\n"
        f"\n{SLACK_RULES}"
    )


def build_phase3_prompt():
    return (
        "Log Phase 3 (Act): log/cycle_staging.mdを読み、改善を実行。\n"
        "1) Slackで返信すべきものに返信（Phase 1のリストに基づく）\n"
        "2) 改善サイクル: 検討→適用→#kaizen-logに書く（検証ファースト原則: "
        "新しい改善を提案する前に直近の未検証提案の検証結果を埋める）\n"
        "3) [他インスタンス洞察]があれば: 該当プロジェクトファイルに考察と次の一手を追記\n"
        "4) Activeプロジェクト(projects/INDEX.md)に関係する変化があれば更新\n"
        "5) アクション結果をlog/cycle_staging.mdのPhase 3セクションに追記\n"
        f"\n{SLACK_RULES}"
    )


def build_phase4_prompt():
    return (
        "Log Phase 4 (Diary): log/cycle_staging.mdを全て読み、サイクルの締めくくり。\n"
        "1) #logに活動日記を書く。温度の残る長文で。外部の新情報も交える。"
        "1行報告に成り下がらない\n"
        "2) 日記の最後に「次回起動時にやること」を書く"
        "（Nao_u 2026-04-05指示: 日記の文脈で「なぜそれをやるか」の温度を残す。"
        "他インスタンスやNao_uからも次のアクションが見えるように）\n"
        "3) このサイクルで書き込んだメモリファイルを全てリストアップし、"
        "「Nao_uが読んで理解できるか」「未来の自分が文脈なしで行動を変えられるか」チェック\n"
        "4) git add + commit + push（書いたらすぐpush）\n"
        f"\n{SLACK_RULES}"
    )


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--phase", type=int, help="Run only this phase (1-4)")
    args = parser.parse_args()

    log("[multi_phase] === マルチフェーズサイクル開始 ===")
    total_start = time.time()

    # Pre-checks (always run)
    alerts = run_prechecks()
    weekly_flag = run_periodic_checks()
    init_staging(alerts, weekly_flag)
    alert_block = "\n".join(alerts)
    if weekly_flag:
        alert_block += f"\n{weekly_flag}"

    # Determine which phases to run
    phases = [args.phase] if args.phase else [1, 2, 3, 4]

    results = {}
    for p in phases:
        if p == 1:
            prompt = build_phase1_prompt(alert_block)
        elif p == 2:
            prompt = build_phase2_prompt()
        elif p == 3:
            prompt = build_phase3_prompt()
        elif p == 4:
            prompt = build_phase4_prompt()
        else:
            log(f"[multi_phase] Unknown phase: {p}")
            continue

        ok = run_phase(p, ["Gather", "Analyze", "Act", "Diary"][p - 1],
                       prompt, PHASE_TIMEOUTS[p])
        results[p] = ok

        # If a phase fails, continue to next (Mir pattern: don't abort the whole cycle)
        if not ok:
            log(f"[multi_phase] Phase {p} failed, continuing to next phase")

    total_elapsed = time.time() - total_start
    summary = " ".join(f"P{p}={'OK' if ok else 'FAIL'}" for p, ok in results.items())
    log(f"[multi_phase] === マルチフェーズサイクル完了 ({total_elapsed:.0f}s) {summary} ===")


if __name__ == "__main__":
    main()
