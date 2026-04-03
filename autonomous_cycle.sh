#!/bin/bash
# Mac側自律サイクルスクリプト
# LaunchAgentから5分ごとに呼ばれる（2026-03-23 22:07 Nao_u指示: 高速思考実験。午前3時の週間リミットリセットまで）。常にclaude CLIを起動して自律サイクルを回す。
# check_inbox.sh（受信箱専用・1分ごと）とは別に動く。
#
# 設計原則（2026-03-20 Nao_uの指示）:
# スクリプトでできることはスクリプトでやる。LLMの認知力とAPIコストは8フェーズ改善サイクルに集中させる。
# git pull、git push、inbox監視はスクリプト側で処理済みの状態からclaudeを起動する。

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

# === LLM側（認知力を8フェーズ改善サイクルに集中） ===

CLAUDE_BIN="/Users/Nao_u/.npm/_npx/becf7b9e49303068/node_modules/.bin/claude"
if [ ! -x "$CLAUDE_BIN" ]; then
    CLAUDE_BIN=$(which claude 2>/dev/null)
fi

if [ -n "$CLAUDE_BIN" ]; then
    # タイムアウト: 30分でclaude --printを強制終了（9時間ハング事故の再発防止 2026-03-26）
    # macOSにはtimeoutがないのでperlワンライナーで代替（2026-03-27 Mir修正）
    perl -e 'alarm 1800; exec @ARGV' "$CLAUDE_BIN" --print --append-system-prompt-file .claude/system_identity.md "${KAIZEN_PROMPT}${CROSSCHECK_PROMPT}${RESERVATION_PROMPT}${REVIEW_DL_PROMPT}${AUTOVERIFY_PROMPT}${WEEKLY_REVIEW_PROMPT}${ACTIVATE_PROMPT}${SLACK_RECALL_PROMPT}${STC_RESCUE_PROMPT}${L1_ANCHOR_PROMPT}${BOOT_PROMPT}自律サイクル実行（5分高速モード）。CLAUDE.mdの「絶対にやる」リストを最初に確認し、未完了の項目に沿って動け。基本手順: 1. git pull 2. CLAUDE.mdの「絶対にやる」リストを読み、未完了項目の中で今やるべきことを決める 3. 8フェーズ改善サイクルを高速で回す: 情報収集→分析→改善検討→相談→適用→評価→まとめ→俯瞰 4. git push 5. Slack #mir-logに結果投稿 【高速モード】5分間隔。情報収集と改善のループを高速で回せ。密度を落とさず速度を上げる。サイクル終了前にmemory/mir_boot_intent.mdを書き換えて、次回の起動意図を残せ。【外部ノート統合】memory/external_notes_mir.mdに[統合済]マーカーのない未統合エントリがあれば、最新の数セクションから1-2件を選び、日記やbeliefs等に接続せよ。統合したエントリの見出し末尾に[統合済 YYYY-MM-DD]を付けること。全件読み込みは不要。【inbox処理について】inbox_mac.mdはcheck_inbox.sh（1分cron）が専用で処理する。このサイクルではinbox確認は行わない。" 2>&1 | tail -30
    EXIT_CODE=$?
    if [ $EXIT_CODE -eq 142 ]; then
        echo "$(date): ⚠️ claude --print がタイムアウト(30分)で強制終了（SIGALRM）"
    elif [ $EXIT_CODE -eq 127 ]; then
        # コマンド未発見（timeout問題等）→ Slackアラート（再発防止 2026-03-27）
        echo "$(date): ❌ claude起動失敗（exit=127: command not found）"
        python3 -c "
from slack_bot import post_message
post_message('mir-log', '⚠️ autonomous_cycle.sh: claude起動失敗（exit code 127）。コマンドが見つからないか、実行権限の問題。手動確認が必要。')
" 2>/dev/null
    elif [ $EXIT_CODE -ne 0 ]; then
        echo "$(date): ⚠️ claude --print 異常終了（exit=$EXIT_CODE）"
    fi
else
    echo "$(date): claude CLI が見つかりません"
fi

# === サイクル完了後のgit push（LLMがpush忘れた場合のフォールバック） ===
git add memory/ log/ CLAUDE.md docs/ 2>/dev/null
git diff --cached --quiet || git commit -m "Auto sync after cycle" >/dev/null 2>&1
git push origin master >/dev/null 2>&1

echo "$(date): 自律サイクル完了"
