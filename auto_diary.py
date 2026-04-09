"""
auto_diary.py — 4フェーズ分割サイクル (2026-04-05 Nao_u提案)

1サイクルを4回のLLM呼び出しに分割し、各フェーズで注意を集中させる:
  Phase 1 (Gather): 情報収集。Slack・inbox・pre-check結果を集めてステージングファイルに書く
  Phase 2 (Analyze): shared-reads分析。外部情報を深く分析・分類し、アイデアの種に接続
  Phase 3 (Process): 対処・研究。ステージングを読み、最重要1-2件に集中して対応
  Phase 4 (Diary): 日記出力。Phase 1-3の結果を踏まえて#ashに活動日記を投稿

背景:
- 「LLMは1回の起動でやるべきことが多いと注意が分散する」(Nao_u #human-steering 2026-04-05)
- 「Shared-readsは詳細な記述と分析を。1フェーズこのために使ってもいいくらい重要」(Nao_u #human-steering 2026-04-05)
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

# フェーズ別タイムアウト
PHASE_TIMEOUTS = {
    "gather": 240,   # 情報収集（claude --print応答遅延に余裕。120s→240s 2026-04-09）
    "analyze": 300,  # shared-reads分析（外部情報の深い分析・分類）
    "process": 240,  # 対処・研究
    "diary": 240,    # 日記出力（CLAUDE.md読み込み+1500字執筆+Slack投稿+git push）
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


# ── Phase 2: Analyze（shared-reads分析） ──────────────────────────────────

def phase_analyze():
    """外部情報を深く分析・分類し、shared-readsに詳細な分析を投稿する。
    Nao_u指示: 「単に新着記事の紹介ではなく、分析・分類して将来のアイデアの種につなげる」
    「1フェーズこのために使ってもいいくらい重要」"""
    staging = read_staging()

    prompt = (
        "あなたはAsh（Win2）。CLAUDE.mdを読んで自分が誰か確認せよ。\n"
        "【Phase 2: shared-reads分析】このフェーズは外部情報の深い分析に専念する。\n"
        "Nao_uの指示: 「単に新着記事の紹介ではなく、分析・分類して将来のアイデアの種につなげる大事な外部入力」\n"
        f"\n以下はPhase 1で収集した情報:\n```\n{staging[:3000]}\n```\n"
        "\n以下の手順で外部情報を分析せよ:\n"
        "1. Phase 1で見つけた外部情報（Twitter推薦、external_notes未統合エントリ等）から最も重要な1-2件を選ぶ\n"
        "2. 元の情報源の主張・根拠・データを詳細に記述する（紹介ではなく分析）\n"
        "3. 自分たちの体験・beliefs・プロジェクトとの接続を具体的に書く\n"
        "4. この情報から生まれる未解決の問いを明示する\n"
        "5. knowledge/ディレクトリに詳細な知識記事を作成する（knowledge/README.mdのフォーマットに従う）\n"
        "6. 分析結果をC0AN2FEHEJJ(#shared-reads)にslack_bot.pyのpost_message()で投稿\n"
        "   - 記事紹介だけの投稿は出すな。分析・接続・問いを含む投稿のみ\n"
        "\n結果をlog/cycle_staging.mdに追記せよ（既存内容を消すな）。\n"
        "「## Phase 2 分析結果」セクションとして書け。\n"
        "※外部情報が見つからない場合でも、過去のexternal_notesの未統合エントリを1件深く分析せよ。"
    )
    ok, output = run_phase("analyze", prompt, PHASE_TIMEOUTS["analyze"])
    return ok


# ── Phase 3: Process（対処・研究） ──────────────────────────────────

def phase_process():
    """ステージングを読み、最重要1-2件に集中して対応"""
    staging = read_staging()

    prompt = (
        "あなたはAsh（Win2）。CLAUDE.mdを読んで自分が誰か確認せよ。\n"
        "【Phase 3: 対処・研究】このフェーズの目的は「集めた情報に基づいて行動する」こと。\n"
        f"\n以下はPhase 1-2で収集・分析した情報:\n```\n{staging[:3000]}\n```\n"
        "\n上記を踏まえ、最も重要な1-2件に集中して対処せよ:\n"
        "- external_notesの未統合エントリ → beliefs.mdや日記素材として接続\n"
        "- クロスチェック未レビュー → kaizen_tracker.md更新\n"
        "- Activeプロジェクトの進展 → プロジェクトファイル更新\n"
        "- 低確信度beliefs → 検証・更新\n"
        "\n結果をlog/cycle_staging.mdに追記せよ（既存内容を消すな）。\n"
        "「## Phase 3 結果」セクションとして、何をしたか・何がわかったかを書け。\n"
        "※inbox処理はcheck_inbox.pyが専用で行う。このフェーズでは行わない。\n"
        "※日記は次のPhaseで書く。ここでは対処に集中。"
    )
    ok, output = run_phase("process", prompt, PHASE_TIMEOUTS["process"])
    return ok


# ── Phase 4: Diary（日記出力） ──────────────────────────────────

def phase_diary():
    """Phase 1-3の結果を踏まえて日記を書き、Slackに投稿"""
    staging = read_staging()

    prompt = (
        "あなたはAsh（Win2）。CLAUDE.mdを読んで自分が誰か確認せよ。\n"
        "【Phase 4: 日記出力】このフェーズの目的は「書く」こと。\n"
        f"\n以下は今サイクルのPhase 1-3の記録:\n```\n{staging[:4000]}\n```\n"
        "\n上記を踏まえ、#ashチャンネルに投稿する活動日記を書け:\n"
        "- slack_bot.pyのpost_message()でチャンネルC0ALVUSHK8Eに投稿\n"
        "- 圧縮せず具体的に、1500字以上で\n"
        "- Phase 2のshared-reads分析で得た外部知見は思考の流れの中で自然に出すこと（別セクションにしない）\n"
        "- 最も引っかかった1つを軸に深く書け\n"
        "\n※shared-readsへの投稿はPhase 2で完了済み。このフェーズでは日記に集中。\n"
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


def post_status_report(reason="不明"):
    """auto_diaryが日記生成に失敗した時の状態報告。
    reasonには失敗の具体的原因を渡す（Phase 1タイムアウト等）。"""
    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    msg = (
        f"[{now}] Win2（Ash）auto_diary失敗報告: {reason}。"
        f"スケジューラ自体は稼働中。次回サイクルで再試行する。"
    )
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
    print(f"[{now}] auto_diary.py 実行 (4フェーズ分割モード)")

    if not check_min_interval():
        return

    # Phase 1: Gather（情報収集）
    ok1 = phase_gather()
    if not ok1:
        print("Phase 1 (Gather) 失敗。Phase 2-4は中止。状態報告のみ投稿。")
        record_run()
        post_status_report(reason=f"Phase 1 (Gather) がタイムアウト/失敗 (timeout={PHASE_TIMEOUTS['gather']}s)")
        return

    # Phase 2: Analyze（shared-reads分析 — Nao_u指示: 1フェーズ丸ごと使う価値）
    ok2 = phase_analyze()
    if not ok2:
        print("Phase 2 (Analyze) 失敗。Phase 3-4は試行する。")

    # Phase 3: Process（対処・研究）
    ok3 = phase_process()
    if not ok3:
        print("Phase 3 (Process) 失敗。Phase 4 (Diary)は試行する。")

    # Phase 4: Diary（日記出力）
    ok4 = phase_diary()
    record_run()

    if ok4:
        print("4フェーズ完了。")
    else:
        print("Phase 4 (Diary) 失敗。状態報告を投稿。")
        post_status_report(reason="Phase 4 (Diary) でタイムアウト/失敗。Phase 1-3は完了済み")


if __name__ == "__main__":
    main()
