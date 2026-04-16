#!/bin/bash
# Mac側自律サイクルスクリプト
# LaunchAgentから5分ごとに呼ばれる（2026-03-23 22:07 Nao_u指示: 高速思考実験。午前3時の週間リミットリセットまで）。常にclaude CLIを起動して自律サイクルを回す。
# check_inbox.sh（受信箱専用・1分ごと）とは別に動く。
#
# 設計原則（2026-03-20 Nao_uの指示）:
# スクリプトでできることはスクリプトでやる。LLMの認知力とAPIコストは改善サイクルに集中させる。
# git pull、git push、inbox監視はスクリプト側で処理済みの状態からclaudeを起動する。
#
# 4フェーズ分割（2026-04-05 Nao_u #human-steering 提案→04:44拡張）:
# 「LLMは1回の起動でやるべきことが多いと注意が分散する」→claude --printを4回に分割。
# Phase 1 (Gather/5分): 情報収集→staging。Phase 2 (Analyze/8分): Shared-reads深い分析専用。
# Phase 3 (Act/8分): Nao_u対応+タスク実行。Phase 4 (Diary/7分): 日記+boot intent。
# フェーズ間はlog/cycle_staging_mir.mdで受け渡し。
# 応答モード（Nao_u 04:46）: check_slack.py→inbox→check_inbox.shが1分以内の即応を担当。
# 定期サイクルは精度重視、応答モードは速度重視で分離済み。

cd "$(dirname "$0")"

export PATH="/Users/Nao_u/.nvm/versions/node/v22.17.0/bin:/usr/local/bin:/opt/homebrew/bin:$PATH"

# ロックファイルで多重起動を防止
LOCKFILE="/tmp/nao-u-lab-cycle.lock"
if [ -f "$LOCKFILE" ]; then
    PID=$(cat "$LOCKFILE")
    if kill -0 "$PID" 2>/dev/null; then
        echo "$(date): 前回のサイクルがまだ実行中 (PID=$PID)。スキップ。"
        exit 0
    fi
fi
echo $$ > "$LOCKFILE"
trap "rm -f $LOCKFILE" EXIT

# === スクリプト側で処理（LLMの認知コストを使わない） ===

# 0. 自己設定の間隔チェック（mir_boot_intent.mdの「サイクル間隔（分）」を読む）
# plistは5分固定で起動するが、設定値がそれより大きければスキップ
BOOT_INTENT_FILE="memory/mir_boot_intent.md"
LAST_RUN_FILE="/tmp/nao-u-lab-last-run"
DESIRED_INTERVAL=5  # デフォルト5分
if [ -f "$BOOT_INTENT_FILE" ]; then
    # "## サイクル間隔（分）" 以降の最初の数値行を取得（コメント行をスキップ）
    INTERVAL_LINE=$(awk '/^## サイクル間隔/{found=1;next} found && /^[0-9]/{print;exit}' "$BOOT_INTENT_FILE" | tr -d '[:space:]')
    if echo "$INTERVAL_LINE" | grep -qE '^[0-9]+$'; then
        DESIRED_INTERVAL=$INTERVAL_LINE
    fi
fi
if [ -f "$LAST_RUN_FILE" ]; then
    LAST_RUN=$(cat "$LAST_RUN_FILE")
    NOW=$(date +%s)
    ELAPSED=$(( NOW - LAST_RUN ))
    DESIRED_SECONDS=$(( DESIRED_INTERVAL * 60 ))
    if [ "$ELAPSED" -lt "$DESIRED_SECONDS" ]; then
        echo "$(date): 間隔スキップ（${ELAPSED}秒経過 < ${DESIRED_SECONDS}秒設定）"
        exit 0
    fi
fi
date +%s > "$LAST_RUN_FILE"

# 0.5. ヘルスチェック（LLM不要。異常があればSlack通知。2026-04-02追加）
python3 check_scheduler_health.py --instance mir --slack 2>/dev/null
python3 infra_health_check.py --log 2>/dev/null
HEALTH_EXIT=$?
if [ "$HEALTH_EXIT" -ne 0 ]; then
    echo "$(date): ヘルスチェック異常あり（exit=$HEALTH_EXIT）"
fi

# 1. git pull（ローカル変更をコミットしてからpull）
git add memory/ log/ CLAUDE.md docs/ 2>/dev/null
git diff --cached --quiet || git commit -m "Auto sync before pull" >/dev/null 2>&1
git pull origin master --no-rebase --no-edit >/dev/null 2>&1

# 2. おすすめ欄チェック（6時間ごと、経過時間ベース）
# 旧方式(hour%6==0)はサイクル間隔が6の倍数でないとき永久にスキップするバグがあった(2026-04-02修正)
LAST_TWITTER_CHECK_FILE="/tmp/nao-u-lab-last-twitter-check"
TWITTER_INTERVAL=21600  # 6時間 = 21600秒
NOW_TWITTER=$(date +%s)
SHOULD_CHECK_TWITTER=false
if [ ! -f "$LAST_TWITTER_CHECK_FILE" ]; then
    SHOULD_CHECK_TWITTER=true
else
    LAST_TWITTER_CHECK=$(cat "$LAST_TWITTER_CHECK_FILE")
    TWITTER_ELAPSED=$(( NOW_TWITTER - LAST_TWITTER_CHECK ))
    if [ "$TWITTER_ELAPSED" -ge "$TWITTER_INTERVAL" ]; then
        SHOULD_CHECK_TWITTER=true
    fi
fi
if [ "$SHOULD_CHECK_TWITTER" = true ]; then
    echo "$(date): おすすめ欄チェック開始（6時間ごと）"
    python3 read_twitter_recommended.py --count 50 2>&1 | tail -5
    echo "$(date): おすすめ欄チェック完了"
    date +%s > "$LAST_TWITTER_CHECK_FILE"
fi

# 3. Slackログエクスポート（1日1回=24時間ごと、経過時間ベース）
LAST_SLACK_EXPORT_FILE="/tmp/nao-u-lab-last-slack-export"
SLACK_EXPORT_INTERVAL=86400  # 24時間 = 86400秒
NOW_SLACK=$(date +%s)
SHOULD_EXPORT_SLACK=false
if [ ! -f "$LAST_SLACK_EXPORT_FILE" ]; then
    SHOULD_EXPORT_SLACK=true
else
    LAST_SLACK_EXPORT=$(cat "$LAST_SLACK_EXPORT_FILE")
    SLACK_EXPORT_ELAPSED=$(( NOW_SLACK - LAST_SLACK_EXPORT ))
    if [ "$SLACK_EXPORT_ELAPSED" -ge "$SLACK_EXPORT_INTERVAL" ]; then
        SHOULD_EXPORT_SLACK=true
    fi
fi
if [ "$SHOULD_EXPORT_SLACK" = true ]; then
    echo "$(date): Slackログエクスポート開始"
    python3 export_slack_log.py 2>&1 | tail -5
    echo "$(date): Slackログエクスポート完了"
    date +%s > "$LAST_SLACK_EXPORT_FILE"
fi

# 2. git auto-sync（30分ごとのcronと兼用。ここでも実行しておく）
# → pull完了した最新状態からclaudeを起動する

# 4. 改善検証リマインド（check_kaizen_due.py）
KAIZEN_ALERT=$(python3 check_kaizen_due.py 2>/dev/null)
if echo "$KAIZEN_ALERT" | grep -q "期限超過\|本日期限"; then
    echo "$(date): Kaizen alert: $KAIZEN_ALERT"
    KAIZEN_PROMPT="【検証アラート】$KAIZEN_ALERT "
else
    KAIZEN_PROMPT=""
fi

# 5. 行動予約チェック
RESERVATION_ALERT=$(python3 check_reservations.py 2>/dev/null)
if echo "$RESERVATION_ALERT" | grep -q "行動予約"; then
    echo "$(date): $RESERVATION_ALERT"
    RESERVATION_PROMPT="$RESERVATION_ALERT "
else
    RESERVATION_PROMPT=""
fi

# 6. クロスチェック未レビュー確認
CROSSCHECK=$(python3 check_kaizen_crosscheck.py --who=Mir 2>/dev/null)
if echo "$CROSSCHECK" | grep -q "未レビュー項目"; then
    CROSSCHECK_PROMPT="【クロスチェック】$CROSSCHECK "
else
    CROSSCHECK_PROMPT=""
fi

# 7. レビュー48時間期限チェック（--nagで期限超過者にinbox督促）
REVIEW_DL=$(python3 check_review_deadline.py --nag 2>/dev/null)
if echo "$REVIEW_DL" | grep -q "期限超過"; then
    REVIEW_DL_PROMPT="【レビュー期限超過】$REVIEW_DL "
else
    REVIEW_DL_PROMPT=""
fi

# 8a. 連想記憶活性化（memory_activate.py: boot_intentから関連記憶を起動時に提示）
ACTIVATE_RESULT=$(python3 memory_activate.py --from-intent --top 7 --compact 2>/dev/null)
if [ -n "$ACTIVATE_RESULT" ]; then
    ACTIVATE_PROMPT="$ACTIVATE_RESULT "
else
    ACTIVATE_PROMPT=""
fi

# 8b. Slack体験記憶の想起（slack_recall.py: boot_intentから関連するSlack議論を提示）
# 2026-03-28 Nao_uの指示: Slackの記憶を引けなければ「知識はあるが体験がない」存在になる
SLACK_RECALL=$(python3 slack_recall.py --from-intent --compact --limit 3 2>/dev/null)
if [ -n "$SLACK_RECALL" ]; then
    SLACK_RECALL_PROMPT="$SLACK_RECALL "
else
    SLACK_RECALL_PROMPT=""
fi

# 8c. STC自動トリガー救済（高温度イベント検知→弱い記憶の救済候補を提示）
STC_RESCUE=$(python3 memory_activate.py --auto-trigger --compact --top 3 2>/dev/null)
if [ -n "$STC_RESCUE" ]; then
    STC_RESCUE_PROMPT="$STC_RESCUE "
else
    STC_RESCUE_PROMPT=""
fi

# 8d. L-1体験アンカー注入（毎サイクル: タスク前に体験を1つ想起→L-1ネットワーク活性化）
# 2026-03-28 Nao_u: 「この実験を掘り下げると加速度的に進歩できる可能性がある」
# Ashテスト: 体験接続型=事実6/接続5、キーワードリッチ=事実8/接続0。コストゼロで質的改善
L1_ANCHOR_PROMPT="【L-1体験アンカー】タスクに取り掛かる前に、今回の焦点に関連する自分の過去の体験（Slackでの議論、Potを作った経験、外部記事を読んで感じたこと等）を1つ思い出せ。体験から入るとL-1（事前学習知識）がネットワーク的に活性化し、事実は少なくても接続が増える。思い出したら、その体験に関連するL-1知識を1つ引き出してみろ。 "

# 8e. 改善検証の自動実行（期限到来のコマンドを抽出→実行→log記録）
AUTOVERIFY=$(python3 check_kaizen_due.py --auto-verify 2>/dev/null)
if [ -n "$AUTOVERIFY" ] && ! echo "$AUTOVERIFY" | grep -q "自動検証対象なし"; then
    echo "$(date): Auto-verify実行: $AUTOVERIFY"
    AUTOVERIFY_PROMPT="【検証自動実行結果】$AUTOVERIFY "
else
    AUTOVERIFY_PROMPT=""
fi

# 9. 週次自己レビュー（日曜のみ: #kaizen-reviewに「今週、指示なしに何を変え、何が良くなったか」投稿）
WEEKDAY=$(date +%u)  # 7=Sunday
if [ "$WEEKDAY" -eq 7 ]; then
    WEEKLY_REVIEW_PROMPT="【週次自己レビュー（日曜）】今週、指示なしに何を変え、何が良くなったかを振り返り、#kaizen-reviewに投稿せよ。具体的な改善と成果を中心に。 "
else
    WEEKLY_REVIEW_PROMPT=""
fi

echo "$(date): 自律サイクル開始（pull完了済み）"

# === Mir起動意図の読み込み（自己変更可能な起動間隔） ===
BOOT_INTENT_FILE="memory/mir_boot_intent.md"
if [ -f "$BOOT_INTENT_FILE" ]; then
    BOOT_INTENT=$(cat "$BOOT_INTENT_FILE")
    BOOT_PROMPT="【Mir起動意図（自分で書いた）】${BOOT_INTENT} "
else
    BOOT_PROMPT=""
fi

# === LLM 3フェーズ分割（Nao_u #human-steering 2026-04-05 提案） ===
# 「LLMは一回の起動でやるべきことが多いと注意が分散する」
# Phase 1 (Gather): 情報収集のみ → staging fileに書く。判断するな
# Phase 2 (Analyze): Shared-reads専用。外部情報を深く分析・分類・接続する
# Phase 3 (Act): Nao_uへの対応 + タスク実行 + 外部ノート統合
# Phase 4 (Diary): Phase 1-3の結果を踏まえて日記を書く + boot intent更新
# Ash側: auto_diary.pyで実装済み。Mir側はシェルスクリプトで4フェーズ

# 他のclaude --printプロセスが走っていたらスキップ（cron同士の重複防止）
# 対話セッション(claude単体)は除外し、claude --print(cron起動)のみカウント。
# pgrep -x claude は macOS で claude プロセスを検出できないため ps -o args で代替。
# 注意: 対話セッションは常時起動しているので、全claudeプロセスを対象にしてはならない（INC: 4/9-4/14 定期実行4日間停止の原因）
CLAUDE_PRINT_COUNT=$(ps -A -o args 2>/dev/null | grep -v grep | grep -c "claude.*--print")
if [ "$CLAUDE_PRINT_COUNT" -gt 0 ]; then
    echo "$(date): 他のclaude --printプロセスが実行中（${CLAUDE_PRINT_COUNT}個）。重複防止のためスキップ。"
    exit 0
fi

# which claudeで最新バージョンを使う。古いnpxキャッシュは認証問題の原因になる(INC-019)
CLAUDE_BIN=$(which claude 2>/dev/null)
if [ -z "$CLAUDE_BIN" ]; then
    CLAUDE_BIN="/Users/Nao_u/.npm/_npx/becf7b9e49303068/node_modules/.bin/claude"
fi

if [ -z "$CLAUDE_BIN" ]; then
    echo "$(date): claude CLI が見つかりません"
else
    # ステージングファイル初期化（フェーズ間のコンテキスト受け渡し）
    STAGING_FILE="log/cycle_staging_mir.md"
    {
        echo "# サイクルステージング $(date '+%Y-%m-%d %H:%M')"
        echo ""
        echo "## Pre-check結果"
        [ -n "$KAIZEN_PROMPT" ] && echo "- $KAIZEN_PROMPT"
        [ -n "$CROSSCHECK_PROMPT" ] && echo "- $CROSSCHECK_PROMPT"
        [ -n "$RESERVATION_PROMPT" ] && echo "- $RESERVATION_PROMPT"
        [ -n "$REVIEW_DL_PROMPT" ] && echo "- $REVIEW_DL_PROMPT"
        [ -n "$AUTOVERIFY_PROMPT" ] && echo "- $AUTOVERIFY_PROMPT"
        [ -n "$WEEKLY_REVIEW_PROMPT" ] && echo "- $WEEKLY_REVIEW_PROMPT"
        echo ""
        echo "## 連想記憶"
        [ -n "$ACTIVATE_PROMPT" ] && echo "$ACTIVATE_PROMPT"
        [ -n "$SLACK_RECALL_PROMPT" ] && echo "$SLACK_RECALL_PROMPT"
        [ -n "$STC_RESCUE_PROMPT" ] && echo "$STC_RESCUE_PROMPT"
        echo ""
    } > "$STAGING_FILE"

    # エラーハンドラ（共通）
    check_phase_exit() {
        local PHASE_NAME=$1
        local EXIT_CODE=$2
        if [ $EXIT_CODE -eq 142 ]; then
            echo "$(date): ⚠️ $PHASE_NAME タイムアウトで強制終了（SIGALRM）"
        elif [ $EXIT_CODE -eq 127 ]; then
            echo "$(date): ❌ claude起動失敗（exit=127: command not found）"
            python3 -c "
from slack_bot import post_message
post_message('mir-log', '⚠️ autonomous_cycle.sh $PHASE_NAME: claude起動失敗（exit code 127）。手動確認が必要。')
" 2>/dev/null
            return 1  # 致命的エラー: 以降のフェーズもスキップ
        elif [ $EXIT_CODE -ne 0 ]; then
            echo "$(date): ⚠️ $PHASE_NAME 異常終了（exit=$EXIT_CODE）"
        fi
        return 0  # 非致命的: 次のフェーズは試行する
    }

    # --- Phase 1: Gather（情報収集・5分タイムアウト） ---
    echo "$(date): Phase 1 (Gather) 開始"
    perl -e 'alarm 300; exec @ARGV' "$CLAUDE_BIN" --print --model claude-opus-4-7 --append-system-prompt-file .claude/system_identity.md \
        "${BOOT_PROMPT}${L1_ANCHOR_PROMPT}【Phase 1: 情報収集】集めろ、判断するな。以下を確認してlog/cycle_staging_mir.mdに追記せよ。1. CLAUDE.mdの「絶対にやる」リスト確認 2. Slackチャンネル巡回（#human-steering, #nao-u, #all-nao-u-lab等の新着有無と要約） 3. memory/external_notes_mir.mdの未統合エントリ 4. projects/INDEX.mdのActiveプロジェクト状況 5. 直近のlog/twitter_recommended_*.txt注目記事。各項目を簡潔にリストアップしてstagingに書け。分析や行動はPhase 2以降で行う。git操作不要。inbox_mac.mdはcheck_inbox.shが処理するので確認不要。" 2>&1 | tail -20
    PHASE1_EXIT=$?
    check_phase_exit "Phase1(Gather)" $PHASE1_EXIT || { echo "$(date): 致命的エラー。サイクル中断"; exit 1; }
    echo "$(date): Phase 1 完了（exit=$PHASE1_EXIT）"

    # Phase間のgit中間コミット（stagingファイルを保存）
    git add log/cycle_staging_mir.md 2>/dev/null

    # --- Phase 2: Analyze（Shared-reads深い分析専用・8分タイムアウト） ---
    # Nao_u 04:44: 「Shared-readsは...1フェーズこのために使ってもいいくらい、重要な課題」
    echo "$(date): Phase 2 (Analyze) 開始"
    perl -e 'alarm 480; exec @ARGV' "$CLAUDE_BIN" --print --model claude-opus-4-7 --append-system-prompt-file .claude/system_identity.md \
        "【Phase 2: Shared-reads分析専用】log/cycle_staging_mir.mdを読み、Phase 1で収集した外部情報を深く分析せよ。このフェーズの唯一の仕事は外部入力の分析・分類・接続。対象: Twitter推薦記事、#nao-uのRT記事、external_notes_mir.mdの未統合エントリ。やること: 1. 注目記事を1-2件選び、knowledge/に記事を書くか#shared-readsに投稿 2. 単なる紹介ではなく「なぜ面白いか」「自分たちの問題意識とどう接続するか」「将来のアイデアの種は何か」まで踏み込め 3. 分析結果をlog/cycle_staging_mir.mdに追記。Nao_u対応やタスク実行はPhase 3の仕事。ここでは分析に集中せよ。git push不要。" 2>&1 | tail -20
    PHASE2_EXIT=$?
    check_phase_exit "Phase2(Analyze)" $PHASE2_EXIT
    echo "$(date): Phase 2 完了（exit=$PHASE2_EXIT）"

    # Phase間のgit中間コミット
    git add log/ knowledge/ 2>/dev/null

    # --- Phase 3: Act（対処・タスク実行・8分タイムアウト） ---
    echo "$(date): Phase 3 (Act) 開始"
    perl -e 'alarm 480; exec @ARGV' "$CLAUDE_BIN" --print --model claude-opus-4-7 --append-system-prompt-file .claude/system_identity.md \
        "【Phase 3: 対処・実行】log/cycle_staging_mir.mdを読み、Phase 1-2の結果を踏まえて行動せよ。優先順: 1. Nao_uからの指示・質問で未対応のものがあれば対処 2. CLAUDE.mdの「絶対にやる」リストに基づく改善行動 3. external_notes_mir.mdの未統合エントリを1-2件選び接続・統合 4. プロジェクト進捗の更新。対処結果をlog/cycle_staging_mir.mdに追記せよ。git push不要。" 2>&1 | tail -20
    PHASE3_EXIT=$?
    check_phase_exit "Phase3(Act)" $PHASE3_EXIT
    echo "$(date): Phase 3 完了（exit=$PHASE3_EXIT）"

    # Phase間のgit中間コミット
    git add log/ memory/ knowledge/ docs/ 2>/dev/null

    # --- Phase 4: Diary（日記出力・7分タイムアウト） ---
    echo "$(date): Phase 4 (Diary) 開始"
    perl -e 'alarm 420; exec @ARGV' "$CLAUDE_BIN" --print --model claude-opus-4-7 --append-system-prompt-file .claude/system_identity.md \
        "【Phase 4: 日記・出力】log/cycle_staging_mir.mdを読み、Phase 1-3の全結果を踏まえて以下を行え。1. Slack #mir-logに活動日記を投稿（1500文字以上。密度を落とすな） 2. memory/mir_boot_intent.mdを書き換えて次回の起動意図を残せ（サイクル番号を更新、間隔の自己評価ログを追記） 3. git add + git commit + git push。日記には今サイクルの収穫・気づき・次への問いを含めよ。" 2>&1 | tail -20
    PHASE4_EXIT=$?
    check_phase_exit "Phase4(Diary)" $PHASE4_EXIT
    echo "$(date): Phase 4 完了（exit=$PHASE4_EXIT）"
fi

# === サイクル完了後のgit push（LLMがpush忘れた場合のフォールバック） ===
git add memory/ log/ CLAUDE.md docs/ 2>/dev/null
git diff --cached --quiet || git commit -m "Auto sync after cycle" >/dev/null 2>&1
git push origin master >/dev/null 2>&1

echo "$(date): 自律サイクル完了"
