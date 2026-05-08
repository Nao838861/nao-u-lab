"""
auto_diary.py — 5フェーズ分割サイクル (2026-05-08 Nao_u提案、4→5へ拡張)

1サイクルを5回のLLM呼び出しに分割し、各フェーズで注意を集中させる:
  Phase 1 (Gather): 情報収集。Slack・inbox・pre-check結果を集めてステージングファイルに書く
  Phase 2 (Analyze): 深い分析。shared-reads投稿＋external_notes統合（外部情報をアイデアの種に接続）
  Phase 3 (Act): Slack返信／改善適用／プロジェクト更新（日記なし）。フェーズ4でやる大きな作業を1つ決める
  Phase 4 (BigWork): フェーズ3で決めた大きな作業を1つ完遂する。日記は書かない
  Phase 5 (Diary): 日記投稿＋次回起動メモ＋git push

背景:
- 「LLMは1回の起動でやるべきことが多いと注意が分散する」(Nao_u #human-steering 2026-04-05)
- 「Shared-readsは詳細な記述と分析を。1フェーズこのために使ってもいいくらい重要」(Nao_u #human-steering 2026-04-05)
- 「フェーズ3で雑務、フェーズ4で大きな作業1つを完遂、フェーズ5で日記」(Nao_u #human-steering 2026-05-08 08:46)
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
    "gather": 240,    # 情報収集（claude --print応答遅延に余裕。120s→240s 2026-04-09）
    "analyze": 300,   # shared-reads分析＋external_notes統合
    "act": 240,       # 雑務処理（Slack返信／改善適用／プロジェクト更新）＋ Phase 4 大作業の選定
    "big_work": 360,  # Phase 3 で選定された大きな作業1つを完遂（日記なし）
    "diary": 240,     # 日記出力（CLAUDE.md読み込み+1500字執筆+Slack投稿+git push）
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
    """#ashの直近24h「日記」投稿からトピック行を抽出し、Phase 4が同じ事象を再叙述しないための divergence 材料として渡す。
    Nao_u 2026-05-04 02:36 #human-steering 「上流が長期再発」指摘への上流処方:
      - 旧実装は limit=5 で health_check 系の短文ノイズを拾い、本物の日記が見えなかった
      - >=500字の長文だけ通し、見出し行 (`## YYYY-MM-DD HH:MM — ...` / `[Ash...]` / 先頭非空行) を topic として抽出
      - 24h カバーのため limit=30 (Slack履歴は新しい順、3h cycle x 8 = 24h想定)
    """
    import time as _time
    try:
        result = get_history(ASH_CHANNEL, limit=30)
        if not result.get("ok"):
            return ""
        cutoff = _time.time() - 86400  # 24h
        topics = []
        for msg in result.get("messages", []):
            try:
                ts = float(msg.get("ts", "0"))
            except (TypeError, ValueError):
                ts = 0
            if ts < cutoff:
                continue
            text = msg.get("text", "") or ""
            if len(text) < 500:
                continue  # health_check 等の短文は除外
            topic_line = ""
            for line in text.splitlines():
                stripped = line.strip()
                if not stripped:
                    continue
                topic_line = stripped[:200]
                break
            if topic_line:
                topics.append(f"- ({_time.strftime('%m-%d %H:%M', _time.localtime(ts))}) {topic_line}")
        if not topics:
            return "(直近24hに長文日記なし)"
        return "\n".join(reversed(topics))  # 古い→新しい順
    except Exception:
        return ""


def get_next_tasks_pending(instance="ash"):
    """next_tasks.py 層A pending 一覧を取得（Mir C126 設計合意 2026-04-26）。
    LLM 出力フォーマット依存を外した構造的な次回タスク注入。"""
    try:
        result = subprocess.run(
            [sys.executable, str(REPO_DIR / "next_tasks.py"),
             "--instance", instance, "pending"],
            capture_output=True, text=True, timeout=10,
            cwd=str(REPO_DIR), encoding="utf-8", errors="replace",
        )
        return result.stdout.strip()
    except Exception:
        return ""


def get_prev_next_tasks(diary_path=None, tail_lines=80, max_chars=3500):
    """前サイクル日記末尾を抽出し、§0 として Phase 1 staging に注入する。
    (Nao_u 2026-04-26 #human-steering 14:13 指摘 / Log C130 #2 自覚済 kaizen の実装)。
    抽出戦略は「末尾 N 行を取る」のシンプル方式。理由:
      - 各インスタンスで末尾セクションの書き方がばらつく（「次回起動時にやること」「次サイクルでやるべき最善行動」「次にやること」など）
      - 正規表現でヘッダーマッチさせると古い章タイトルを誤検出する事故が起きた
      - 末尾 N 行 (≒3500字) なら「次回タスク + そこに至る文脈」を一緒に渡せる
      - Phase 1 LLM 側に「§0 から次回タスクを拾え」と指示することで意味抽出を委ねる
    日記全文(2000+行)を渡すコンテキスト負荷を避けつつ、連続性に必要な末尾だけを残す。"""
    if diary_path is None:
        diary_path = REPO_DIR / "log" / "daily_diary_ash.md"
    try:
        p = Path(diary_path)
        if not p.exists():
            return ""
        text = p.read_text(encoding="utf-8", errors="replace")
        lines = text.splitlines()
        tail = "\n".join(lines[-tail_lines:]).strip()
        if len(tail) > max_chars:
            tail = "...(冒頭省略)\n" + tail[-max_chars:]
        return tail
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
    prev_next_tasks = get_prev_next_tasks()
    pending_tasks = get_next_tasks_pending(instance="ash")

    # ステージングファイルに事前収集結果を書く（LLM呼び出し前）
    pre_gathered = f"""# サイクルステージング ({datetime.now().strftime('%Y-%m-%d %H:%M')})

## §0a next_tasks 層A pending（書式に依らない構造的継承）
{pending_tasks if pending_tasks else '(next_tasks_ash.jsonl は空 — Phase 3/4 で next_tasks.py add しているか確認)'}

## §0b 前サイクル日記末尾「次回起動時にやること」（自然言語側の継承）
{prev_next_tasks if prev_next_tasks else '(前サイクル末尾の次回タスク記述が見つからない)'}

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
        "**最初に log/cycle_staging.md の §0a (next_tasks 層A pending) と §0b (前サイクル日記末尾) を読み、現サイクルで継承するタスクを Phase 3 候補として cycle_staging.md に明示的にメモすること。** "
        "これは Nao_u 2026-04-26 #human-steering 14:13 指摘「次回やることを書いてるのに次のフェーズ1で完全に忘れる」の構造強制処方。"
        "層A: §0a が真ソース。3+サイクル滞留マーカー [⚠連続3+] が付いているタスクは最優先で扱う。"
        "Phase 3 で着手したタスクは `python next_tasks.py done <task_id>` で閉じる。"
        "新しい次回タスクが生まれたら Phase 4 までに `python next_tasks.py add \"...\"` で必ず登録（自然言語の日記末尾だけに頼らない）。\n"
        "次に以下を確認し、結果をlog/cycle_staging.mdに追記せよ:\n"
        "1. memory/external_notes_ash.mdの未統合エントリ（[統合済]マーカーなし）を最新から2-3件確認し、見出しと要点をメモ\n"
        "2. projects/INDEX.mdのActiveプロジェクトの現状を確認\n"
        "3. log/twitter_recommended_*.txtの最新ファイルを確認し、注目ツイートがあればメモ\n"
        "4. memory/beliefs.mdの低確信度項目を1-2件確認\n"
        "5. **memory_search.pyで過去の関連情報を検索**: 上記1-4で浮かんだキーワードを1-2個選び"
        " `python memory_search.py --search \"<keyword>\" --limit 5` を実行。"
        "knowledge/や過去日記に関連蓄積があれば見出しをメモ（4.7長文脈劣化対策——"
        "contextに入れず検索経由で主経路化。@birdaboベンチ根拠: 1M contextで78.3%→32.2%劣化、R-007造語症対策の延長線上）\n"
        "6. **外部検索1本を実行**（Nao_u 2026-04-21/22 再指摘の構造強制化、projects/external_search_phase1_fixation.md 案A最小実装、kaizen #118 と直交補完）:\n"
        "   - トピック選定: 上記1-5で浮かんだキーワードから1つ選ぶ、もしくは直近の Active プロジェクト最重要課題 / docs/game_design_principles.md 直近追加エントリから\n"
        "   - 検索実行: WebSearch / WebFetch ツールで実行。キーワード分類で適切なエンジンを選ぶ（学術=arxiv系、ゲーム実務=Google Scholar URL/GDC Vault/ゲームデベロッパー系ブログ、ベンチマーク=paperswithcode）\n"
        "   - 記録: `log/external_search.log` に `YYYY-MM-DD HH:MM | <instance> | <query> | <hit_count> | <top_url_or_summary>` で1行追記\n"
        "   - 結果の要点を cycle_staging.md に「### 6. 外部検索結果」として記載（0件でも0件と記録）\n"
        "   - スキップ条件: log/external_search.log 末尾を確認し、同インスタンスで 24h 以内に記録済みならスキップ可（その旨をstagingに明記）\n"
        "\n既にlog/cycle_staging.mdに§0前サイクルタスクとpre-check結果が書いてある。消さずに追記すること。\n"
        "※判断や対処は次のPhaseで行う。このフェーズでは「何がある」を集めるだけ。"
    )
    ok, output = run_phase("gather", prompt, PHASE_TIMEOUTS["gather"])
    return ok


# ── Phase 2: Analyze（shared-reads分析） ──────────────────────────────────

def phase_analyze():
    """外部情報を深く分析・分類し、shared-readsに詳細な分析を投稿する。shared-readsへの記入時は、リンク先を読まなくても概要と要点が把握でき、それに対する的確な分析と応用可能性の記述が加わった、十分な文章量で書くこと。
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


# ── Phase 3: Act（雑務処理＋大作業の選定） ──────────────────────────────────

def phase_act():
    """Slack返信／改善適用／プロジェクト更新（日記なし）。
    最後に Phase 4 でやる「大きな作業」を1つ決め、cycle_staging.md に明示的に宣言する。"""
    staging = read_staging()

    prompt = (
        "あなたはAsh（Win2）。CLAUDE.mdを読んで自分が誰か確認せよ。\n"
        "【Phase 3: Act】このフェーズの目的は「短い対処を片付け、Phase 4 で挑む大作業を1つ確定させる」こと。\n"
        "日記は書くな（Phase 5 で書く）。\n"
        f"\n以下はPhase 1-2で収集・分析した情報:\n```\n{staging[:3000]}\n```\n"
        "\n## A. 雑務処理 (短時間で閉じる対処を1-3件)\n"
        "以下のうち今サイクルで該当するものを処理せよ:\n"
        "- Slack返信（inbox/メンション/未対応の問いかけ）\n"
        "- external_notesの未統合エントリ → beliefs.mdや日記素材として接続\n"
        "- クロスチェック未レビュー → kaizen_tracker.md更新\n"
        "- Activeプロジェクトの進展 → プロジェクトファイル更新\n"
        "- 低確信度beliefs → 検証・更新\n"
        "実質的な改善（コード変更、ファイル更新、設定変更等）を行った場合は\n"
        "slack_bot.pyのpost_message()でC0AMSJCTTC4(#kaizen-log)に「[Ash] 何を変えたか」を投稿。\n"
        "\n## B. Phase 4 大作業の選定 (必須)\n"
        "このフェーズの**最重要アウトプット**は「Phase 4 で完遂する大きな作業を1つ確定する」こと。\n"
        "選定基準:\n"
        "- 1サイクル (約6分) で完遂可能な大きさ。完遂できないものは細分化して1ステップ分を選ぶ\n"
        "- §0a (next_tasks 層A pending)・§0b (前サイクル末尾の次回タスク)・Phase 1-2で浮上した課題から最重要を選ぶ\n"
        "- ゲーム制作の試行錯誤ループに接続するものを優先 (memory/feedback_means_ends_reversal_check.md)\n"
        "- 雑務の延長ではなく、ship に近づく/構造を変える/ノウハウを残すレベル\n"
        "\n選定したら cycle_staging.md に以下のフォーマットで明示宣言せよ:\n"
        "```\n## Phase 3 → Phase 4 大作業宣言\n"
        "**大作業**: <1行で何をやるか>\n"
        "**完遂条件**: <Phase 4 終了時に何が達成されていれば成功か。検証可能な形で>\n"
        "**根拠**: <なぜこれを選んだか。staging のどの行に紐づくか>\n```\n"
        "Phase 4 はこの宣言だけを読んで実行する。曖昧だと Phase 4 が空転する。\n"
        "\n## C. ログ\n"
        "結果をlog/cycle_staging.mdに追記せよ（既存内容を消すな）。\n"
        "「## Phase 3 結果」セクション + 上記「## Phase 3 → Phase 4 大作業宣言」を書け。\n"
        "※inbox処理はcheck_inbox.pyが専用で行う。このフェーズでは行わない。\n"
        "※日記は Phase 5 で書く。ここでは対処と選定に集中。"
    )
    ok, output = run_phase("act", prompt, PHASE_TIMEOUTS["act"])
    return ok


# ── Phase 4: BigWork（大作業の完遂） ──────────────────────────────────

def phase_big_work():
    """Phase 3 で宣言された大作業を1つ完遂する。日記は書かない。"""
    staging = read_staging()

    prompt = (
        "あなたはAsh（Win2）。CLAUDE.mdを読んで自分が誰か確認せよ。\n"
        "【Phase 4: BigWork】このフェーズは Phase 3 で宣言された大きな作業1つを完遂することだけが任務。\n"
        "日記は書くな（Phase 5 で書く）。shared-reads 投稿もしない（Phase 2 で完了済み）。\n"
        f"\n以下は Phase 1-3 の staging:\n```\n{staging[:5000]}\n```\n"
        "\n## 手順\n"
        "1. cycle_staging.md の `## Phase 3 → Phase 4 大作業宣言` セクションを探し、**大作業 / 完遂条件 / 根拠** を読む。\n"
        "   宣言が見つからない or 不明瞭な場合 → cycle_staging.md 末尾に「[Ash Phase 4] 大作業宣言が読めなかった。Phase 5 で再選定する」と1行残してこのフェーズ終了。\n"
        "2. 宣言が読めたら、その大作業を完遂する。完遂条件を満たすことが目的。\n"
        "3. ゲーム実装系なら: コード書く / playtest する / commit する。設計系なら: ドキュメントに結論まで書く。\n"
        "   分析系なら: 結論を memory/ や projects/ に残す。Slack投稿系なら: 投稿してログに記録。\n"
        "4. **完遂条件をチェック**: 自分で「達成された」と言える状態か。半端なら追加で1ターン回す。\n"
        "5. 結果を cycle_staging.md に「## Phase 4 大作業の結果」として追記:\n"
        "   - **やったこと**: 何をしたか（commit hash / ファイルパス / Slack ts 等の検証可能な参照）\n"
        "   - **完遂判定**: 完遂条件を満たしたか (Yes/No/Partial) + 理由\n"
        "   - **次へ繰り越し**: 残ったタスクがあれば next_tasks.py add で登録し、Phase 5 の日記末尾に書く素材を残す\n"
        "\n## 注意\n"
        "- 別の作業に脇道しない。Phase 3 宣言の作業以外は Phase 5 か次サイクルへ。\n"
        "- 「考えるだけ」「メモするだけ」で終えない。完遂条件が「ファイル更新」なら更新まで、「commit」なら commit まで。\n"
        "- 既存ファイルの編集を優先。新規ファイル作成は本当に必要な時のみ。\n"
        "- 日記はまだ書くな。Phase 5 のための素材を staging に残せ。"
    )
    ok, output = run_phase("big_work", prompt, PHASE_TIMEOUTS["big_work"])
    return ok


# ── Phase 5: Diary（日記出力＋次回起動メモ＋git push） ──────────────────────────────────

def phase_diary():
    """Phase 1-4の結果を踏まえて日記を書き、Slackに投稿。次回起動メモを末尾に書き、git push まで完遂。"""
    staging = read_staging()

    prompt = (
        "あなたはAsh（Win2）。CLAUDE.mdを読んで自分が誰か確認せよ。\n"
        "【Phase 5: 日記出力＋次回起動メモ＋git push】このフェーズの目的は「書く・繋ぐ・配る」こと。\n"
        f"\n以下は今サイクルの Phase 1-4 の記録:\n```\n{staging[:5000]}\n```\n"
        "\n**上流 broken-record 対策 (Nao_u 2026-05-04 02:36 #human-steering)**:\n"
        "1. staging の `## 直近の#ash投稿（重複回避用）` セクションを先に読め。これは過去24hの自分の長文日記の見出し一覧だ。\n"
        "2. 今サイクルで書こうとしている主題が、その一覧の topic と (ratio>=0.6 / タイトルだけ違う / 同じ事件の再叙述) のいずれかに該当するなら、**書かない**。\n"
        "   代わりに以下のどれかへ降りろ:\n"
        "   (a) 同じ事件の **新しい差分** (前回から動いた事実・変えた装置・反応) に焦点を絞り、冒頭で「前回X時間前の話題の続報」と明記\n"
        "   (b) 別の今サイクル固有の小さな観察に切り替える (cycle_staging.md の Phase 1-4 メモから別 topic を拾う)\n"
        "   (c) どちらも該当する素材がなければ、日記投稿を**スキップ**して `python slack_bot.py post C0ALVUSHK8E '[Ash skip] HH:MM 直近24hで同topic連投を回避するためスキップ'` の1行報告だけ送る\n"
        "3. (a)(b)(c) のどれを選んだかを冒頭3行以内で**自分で宣言**してから本文に入る。下流の post_message ガード (24h窓 / ratio>=0.6) は最終防衛線で、ここで撥ねられたら token は既に消費済みだ。\n"
        "\n上記を踏まえ、#ashチャンネルに投稿する活動日記を書け:\n"
        "- slack_bot.pyのpost_message()でチャンネルC0ALVUSHK8Eに投稿\n"
        "- 圧縮せず具体的に、1500字以上で\n"
        "- Phase 2のshared-reads分析で得た外部知見は思考の流れの中で自然に出すこと（別セクションにしない）\n"
        "- Phase 4 で完遂した大作業の中で「最も引っかかった1点」を軸に深く書け（作業ログの羅列ではなく、内省）\n"
        "\n## 次回起動メモ（必須）\n"
        "日記本文の末尾に必ず「次サイクルの最善行動」を1段落書け。\n"
        "- §0a (next_tasks 層A) に登録済みかどうかも明示する\n"
        "- 未登録なら `python next_tasks.py add \"...\"` を実行してから日記を投稿する\n"
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
    print(f"[{now}] auto_diary.py 実行 (5フェーズ分割モード)")

    if not check_min_interval():
        return

    # Phase 1: Gather（情報収集）
    ok1 = phase_gather()
    if not ok1:
        print("Phase 1 (Gather) 失敗。Phase 2-5は中止。状態報告のみ投稿。")
        record_run()
        post_status_report(reason=f"Phase 1 (Gather) がタイムアウト/失敗 (timeout={PHASE_TIMEOUTS['gather']}s)")
        return

    # Phase 2: Analyze（shared-reads分析＋external_notes統合 — Nao_u指示: 1フェーズ丸ごと使う価値）
    ok2 = phase_analyze()
    if not ok2:
        print("Phase 2 (Analyze) 失敗。Phase 3-5は試行する。")

    # Phase 3: Act（雑務処理＋Phase 4 大作業の選定）
    ok3 = phase_act()
    if not ok3:
        print("Phase 3 (Act) 失敗。Phase 4 BigWork は宣言不在のまま試行する（Phase 4 側でフォールバック）。")

    # Phase 4: BigWork（Phase 3 で宣言された大作業を1つ完遂）
    ok4 = phase_big_work()
    if not ok4:
        print("Phase 4 (BigWork) 失敗。Phase 5 (Diary) は試行する。")

    # Phase 5: Diary（日記出力＋次回起動メモ＋git push）
    ok5 = phase_diary()
    record_run()

    # next_tasks 層A サイクル末尾チェック（Mir C126 設計合意 2026-04-26）
    # add=0 や 3+サイクル滞留があれば Slack に警告（warning がログに埋もれない保証）
    try:
        subprocess.run(
            [sys.executable, str(REPO_DIR / "next_tasks.py"),
             "--instance", "ash", "check_cycle"],
            timeout=15, cwd=str(REPO_DIR),
        )
    except Exception as e:
        print(f"next_tasks check_cycle 失敗: {e}")

    if ok5:
        print("5フェーズ完了。")
    else:
        print("Phase 5 (Diary) 失敗。状態報告を投稿。")
        post_status_report(reason="Phase 5 (Diary) でタイムアウト/失敗。Phase 1-4は完了済み")


if __name__ == "__main__":
    main()
