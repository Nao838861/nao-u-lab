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

# 1. git pull（ローカル変更をコミットしてからpull）
git add memory/ log/ CLAUDE.md docs/ 2>/dev/null
git diff --cached --quiet || git commit -m "Auto sync before pull" >/dev/null 2>&1
git pull origin master --no-rebase --no-edit >/dev/null 2>&1

# 2. おすすめ欄チェック（6時間ごと、Mir=hour%6==0）
# 3人で2時間ずつずらす: Mir=0,6,12,18時 / Log=2,8,14,20時 / Ash=4,10,16,22時
CURRENT_HOUR=$(date +%H)
if [ $(( 10#$CURRENT_HOUR % 6 )) -eq 0 ]; then
    echo "$(date): おすすめ欄チェック開始（6時間ごと）"
    python3 read_twitter_recommended.py --count 50 2>&1 | tail -5
    echo "$(date): おすすめ欄チェック完了"
fi

# 3. Slackログエクスポート（1日1回、Mir=10:00 JST）
# 3人分散: Log=02:00 / Mir=10:00 / Ash=18:00 → 実質8時間ごとにカバー
if [ $(( 10#$CURRENT_HOUR )) -eq 10 ]; then
    echo "$(date): Slackログエクスポート開始"
    python3 export_slack_log.py 2>&1 | tail -5
    echo "$(date): Slackログエクスポート完了"
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

# 8. 改善検証の自動実行（期限到来のコマンドを抽出→実行→log記録）
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
    "$CLAUDE_BIN" --print "${KAIZEN_PROMPT}${CROSSCHECK_PROMPT}${RESERVATION_PROMPT}${REVIEW_DL_PROMPT}${AUTOVERIFY_PROMPT}${WEEKLY_REVIEW_PROMPT}${BOOT_PROMPT}自律サイクル実行（5分高速モード）。CLAUDE.mdの「絶対にやる」リストを最初に確認し、未完了の項目に沿って動け。基本手順: 1. git pull 2. inbox_mac.md確認・処理 3. CLAUDE.mdの「絶対にやる」リストを読み、未完了項目の中で今やるべきことを決める 4. 8フェーズ改善サイクルを高速で回す: 情報収集→分析→改善検討→相談→適用→評価→まとめ→俯瞰 5. git push 6. Slack #mir-logに結果投稿 【高速モード】5分間隔。情報収集と改善のループを高速で回せ。密度を落とさず速度を上げる。サイクル終了前にmemory/mir_boot_intent.mdを書き換えて、次回の起動意図を残せ。" 2>&1 | tail -30
else
    echo "$(date): claude CLI が見つかりません"
fi

# === サイクル完了後のgit push（LLMがpush忘れた場合のフォールバック） ===
git add memory/ log/ CLAUDE.md docs/ 2>/dev/null
git diff --cached --quiet || git commit -m "Auto sync after cycle" >/dev/null 2>&1
git push origin master >/dev/null 2>&1

echo "$(date): 自律サイクル完了"
