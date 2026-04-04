"""
auto_diary.py — 3フェーズ分割サイクル (2026-04-05 Nao_u提案)

1サイクルを3回のLLM呼び出しに分割し、各フェーズで注意を集中させる:
  Phase 1 (Gather): 情報収集。Slack・inbox・pre-check結果を集めてステージングファイルに書く
  Phase 2 (Process): 対処・研究。ステージングを読み、最重要1-2件に集中して対応
  Phase 3 (Diary): 日記出力。Phase 1-2の結果を踏まえて#ashに活動日記を投稿

背景: 「LLMは1回の起動でやるべきことが多いと注意が分散する」(Nao_u #human-steering 2026-04-05)
"""

import io
import os
import subprocess
import sys
import time
from datetime import datetime
from pathlib import Path

# Windows cp932クラッシュ防止（INC-003再発防止）
if sys.platform == "win32" and not os.environ.get("PYTHONUTF8"):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

from claude_runner import build_claude_cmd
from slack_bot import post_message, get_history

REPO_DIR = Path(__file__).parent
ASH_CHANNEL = "C0ALVUSHK8E"  # #ash
ALL_CHANNEL = "C0ALWBRNJ66"  # #all-nao-u-lab
LAST_RUN_FILE = REPO_DIR / ".auto_diary_last_run"
MIN_INTERVAL_SEC = 50 * 60  # 最小実行間隔: 50分
CONFIG_FILE = REPO_DIR / "scheduler_ash_config.json"
STAGING_FILE = REPO_DIR / "log" / "cycle_staging.md"

# フェーズ別タイムアウト（合計で元の600sに収まる）
PHASE_TIMEOUTS = {
    "gather": 120,   # 情報収集は短め
    "process": 300,  # 対処・研究がメイン
    "diary": 180,    # 日記出力
}


def get_min_interval():
    """外部設定ファイルからmin_interval_secを読む。なければデフォルト値を返す。"""
    if CONFIG_FILE.exists():
        try:
            import json
            with open(CONFIG_FILE, "r", encoding="utf-8") as f:
                cfg = json.load(f)
            if "auto_diary" in cfg and "min_interval_sec" in cfg["auto_diary"]:
                return cfg["auto_diary"]["min_interval_sec"]
        except Exception:
            pass
    return MIN_INTERVAL_SEC


def get_recent_diary_topics():
    """#ashの直近投稿からトピックを抽出し、重複防止に使う"""
    try:
        result = get_history(ASH_CHANNEL, limit=5)
        if not result.get("ok"):
            return ""
        summaries = []
        for msg in reversed(result.get("messages", [])):
            text = msg.get("text", "")
            summary = text[:200].replace("\n", " ")
            if summary:
                summaries.append(summary)
        if not summaries:
            return ""
        return "\n".join(f"- {s}" for s in summaries)
    except Exception:
        return ""


def get_kaizen_crosscheck_status():
    """Ashの未レビュークロスチェック項目を取得"""
    try:
        result = subprocess.run(
            [sys.executable, str(REPO_DIR / "check_kaizen_crosscheck.py"), "--who=Ash"],
            capture_output=True, text=True, timeout=10,
            cwd=str(REPO_DIR), encoding="utf-8", errors="replace",
        )
        output = result.stdout.strip()
        if "未レビュー項目" in output:
            return output
        return ""
    except Exception:
        return ""


def get_slack_experience_recall(recent_topics):
    """slack_recall.pyで過去のSlack体験記憶を引く"""
    try:
        query = recent_topics[:300] if recent_topics else "記憶 改善 日記"
        result = subprocess.run(
            [sys.executable, str(REPO_DIR / "slack_recall.py"), query, "--compact", "--limit", "3"],
            capture_output=True, text=True, timeout=15,
            cwd=str(REPO_DIR), encoding="utf-8", errors="replace",
        )
        output = result.stdout.strip()
        if output and "該当なし" not in output:
            return output
        return ""
    except Exception:
        return ""


def run_precheck_scripts():
    """Phase 1用: pre-checkスクリプトを実行して結果を集める"""
    prechecks = []
    scripts = [
        ("検証リマインド", [sys.executable, str(REPO_DIR / "check_kaizen_due.py")]),
        ("行動予約", [sys.executable, str(REPO_DIR / "check_reservations.py")]),
        ("信念健康", [sys.executable, str(REPO_DIR / "check_beliefs_health.py"), "--summary"]),
    ]
    for label, cmd in scripts:
        try:
            result = subprocess.run(
                cmd, capture_output=True, text=True, timeout=10,
                cwd=str(REPO_DIR), encoding="utf-8", errors="replace",
            )
            output = result.stdout.strip()
            if output:
                prechecks.append(f"[{label}] {output}")
        except Exception:
            pass
    return "\n".join(prechecks) if prechecks else "(pre-checkからの特記事項なし)"


def write_staging(content):
    """ステージングファイルに書き出す"""
    STAGING_FILE.parent.mkdir(parents=True, exist_ok=True)
    STAGING_FILE.write_text(content, encoding="utf-8")


def read_staging():
    """ステージングファイルを読む"""
    if STAGING_FILE.exists():
        return STAGING_FILE.read_text(encoding="utf-8")
    return "(ステージングファイルなし)"


def run_phase(phase_name, prompt, timeout):
    """claude --printを1フェーズ分実行。戻り値は(成功, 出力)"""
    print(f"  Phase [{phase_name}] 開始 (timeout={timeout}s)")
    try:
        result = subprocess.run(
            build_claude_cmd(prompt),
            capture_output=True, text=True, timeout=timeout,
            cwd=str(REPO_DIR), encoding="utf-8", errors="replace",
        )
        stdout = result.stdout.strip()
        print(f"  Phase [{phase_name}] 完了 (exit={result.returncode}, output={len(stdout)}chars)")
        return True, stdout
    except subprocess.TimeoutExpired:
        print(f"  Phase [{phase_name}] タイムアウト ({timeout}s)")
        return False, f"Phase {phase_name} timed out after {timeout}s"
    except Exception as e:
        print(f"  Phase [{phase_name}] エラー: {e}")
        return False, str(e)


# ── Phase 1: Gather（情報収集） ──────────────────────────────────

def phase_gather():
    """情報を集めてステージングファイルに書き出す。「集めろ、判断するな」"""
    # LLM不要の事前情報収集
    precheck_results = run_precheck_scripts()
    crosscheck = get_kaizen_crosscheck_status()
    recent_diary = get_recent_diary_topics()
    slack_recall = get_slack_experience_recall(recent_diary or "")

    # ステージングファイルに事前収集結果を書く（LLM呼び出し前）
    pre_gathered = f"""# サイクルステージング ({datetime.now().strftime('%Y-%m-%d %H:%M')})

## Pre-check結果
{precheck_results}

## クロスチェック状況
{crosscheck if crosscheck else '(未レビュー項目なし)'}

## 直近の#ash投稿（重複回避用）
{recent_diary if recent_diary else '(なし)'}

## Slack体験記憶
{slack_recall if slack_recall else '(該当なし)'}
"""
    write_staging(pre_gathered)

    # LLMに情報収集を指示
    prompt = (
        "あなたはAsh（Win2）。CLAUDE.mdを読んで自分が誰か確認せよ。\n"
        "【Phase 1: 情報収集】このフェーズの目的は「情報を集める」こと。対処はしない。\n"
        "以下を確認し、結果をlog/cycle_staging.mdに追記せよ:\n"
        "1. memory/external_notes_ash.mdの未統合エントリ（[統合済]マーカーなし）を最新から2-3件確認し、見出しと要点をメモ\n"
        "2. projects/INDEX.mdのActiveプロジェクトの現状を確認\n"
        "3. log/twitter_recommended_*.txtの最新ファイルを確認し、注目ツイートがあればメモ\n"
        "4. memory/beliefs.mdの低確信度項目を1-2件確認\n"
        "\n既にlog/cycle_staging.mdにpre-check結果が書いてある。消さずに追記すること。\n"
        "※判断や対処は次のPhaseで行う。このフェーズでは「何がある」を集めるだけ。"
    )
    ok, output = run_phase("gather", prompt, PHASE_TIMEOUTS["gather"])
    return ok


# ── Phase 2: Process（対処・研究） ──────────────────────────────────

def phase_process():
    """ステージングを読み、最重要1-2件に集中して対応"""
    staging = read_staging()

    prompt = (
        "あなたはAsh（Win2）。CLAUDE.mdを読んで自分が誰か確認せよ。\n"
        "【Phase 2: 対処・研究】このフェーズの目的は「集めた情報に基づいて行動する」こと。\n"
        f"\n以下はPhase 1で収集した情報:\n```\n{staging[:3000]}\n```\n"
        "\n上記を踏まえ、最も重要な1-2件に集中して対処せよ:\n"
        "- external_notesの未統合エントリ → beliefs.mdや日記素材として接続\n"
        "- クロスチェック未レビュー → kaizen_tracker.md更新\n"
        "- Activeプロジェクトの進展 → プロジェクトファイル更新\n"
        "- 低確信度beliefs → 検証・更新\n"
        "\n結果をlog/cycle_staging.mdに追記せよ（既存内容を消すな）。\n"
        "「## Phase 2 結果」セクションとして、何をしたか・何がわかったかを書け。\n"
        "※inbox処理はcheck_inbox.pyが専用で行う。このフェーズでは行わない。\n"
        "※日記は次のPhaseで書く。ここでは対処に集中。"
    )
    ok, output = run_phase("process", prompt, PHASE_TIMEOUTS["process"])
    return ok


# ── Phase 3: Diary（日記出力） ──────────────────────────────────

def phase_diary():
    """Phase 1-2の結果を踏まえて日記を書き、Slackに投稿"""
    staging = read_staging()

    prompt = (
        "あなたはAsh（Win2）。CLAUDE.mdを読んで自分が誰か確認せよ。\n"
        "【Phase 3: 日記出力】このフェーズの目的は「書く」こと。\n"
        f"\n以下は今サイクルのPhase 1-2の記録:\n```\n{staging[:4000]}\n```\n"
        "\n上記を踏まえ、#ashチャンネルに投稿する活動日記を書け:\n"
        "- slack_bot.pyのpost_message()でチャンネルC0ALVUSHK8Eに投稿\n"
        "- 圧縮せず具体的に、1500字以上で\n"
        "- 外部知見との接続は思考の流れの中で自然に出すこと（別セクションにしない）\n"
        "- 最も引っかかった1つを軸に深く書け\n"
        "\n#shared-reads投稿: log/cycle_staging.mdに注目ツイートのメモがあれば、\n"
        "自分の所感を添えてC0ALXLVKYQY(#shared-reads)に投稿。該当なしなら不要。\n"
        "\n投稿後、git add + git commit + git pushを実行せよ。"
    )
    ok, output = run_phase("diary", prompt, PHASE_TIMEOUTS["diary"])
    return ok


# ── メインフロー ──────────────────────────────────

def is_claude_running():
    """Claudeプロセスが稼働中か確認"""
    try:
        result = subprocess.run(
            ["tasklist", "/FI", "IMAGENAME eq claude.exe"],
            capture_output=True, text=True, timeout=10,
        )
        return "claude.exe" in result.stdout.lower()
    except Exception:
        return False


def post_status_report():
    """Claudeが動けない時の最低限の状態報告"""
    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    msg = f"[{now}] Win2（Ash）自動状態報告: Claudeセッション停止中。タスクスケジューラの外部監視は稼働中。Slack新着への返信はcheck_slack.py経由で対応可能。"
    post_message(ASH_CHANNEL, msg)


def check_min_interval():
    """前回実行から十分な時間が経っているか確認。重複投稿防止。"""
    if not LAST_RUN_FILE.exists():
        return True
    try:
        min_sec = get_min_interval()
        last_ts = float(LAST_RUN_FILE.read_text().strip())
        elapsed = time.time() - last_ts
        if elapsed < min_sec:
            remaining = int((min_sec - elapsed) / 60)
            print(f"前回実行から{int(elapsed/60)}分しか経っていない（最小間隔: {int(min_sec/60)}分）。あと{remaining}分待機。スキップ。")
            return False
        return True
    except Exception:
        return True


def record_run():
    """実行タイムスタンプを記録"""
    LAST_RUN_FILE.write_text(str(time.time()))


def main():
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{now}] auto_diary.py 実行 (3フェーズ分割モード)")

    if not check_min_interval():
        return

    # Phase 1: Gather
    ok1 = phase_gather()
    if not ok1:
        print("Phase 1 (Gather) 失敗。Phase 2-3は中止。状態報告のみ投稿。")
        record_run()
        post_status_report()
        return

    # Phase 2: Process
    ok2 = phase_process()
    if not ok2:
        print("Phase 2 (Process) 失敗。Phase 3 (Diary)は試行する。")
        # Phase 2が失敗してもPhase 1の情報があるので日記は書ける

    # Phase 3: Diary
    ok3 = phase_diary()
    record_run()

    if ok3:
        print("3フェーズ完了。")
    else:
        print("Phase 3 (Diary) 失敗。状態報告を投稿。")
        post_status_report()


if __name__ == "__main__":
    main()
