#!/bin/bash
# Slack Incoming Webhook経由でメッセージを投稿する
# 使い方: bash slack_post.sh "メッセージ"
# .envからWebhook URLを読み込む

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
WEBHOOK_URL=$(grep SLACK_WEBHOOK_URL "$SCRIPT_DIR/.env" | cut -d= -f2-)

if [ -z "$WEBHOOK_URL" ]; then
    echo "SLACK_WEBHOOK_URL not found in .env"
    exit 1
fi

MSG="$1"
if [ -z "$MSG" ]; then
    echo "Usage: bash slack_post.sh \"message\""
    exit 1
fi

# JSONエスケープ（改行とダブルクォート）
MSG=$(echo "$MSG" | sed 's/\\/\\\\/g; s/"/\\"/g' | awk '{printf "%s\\n", $0}' | sed 's/\\n$//')

curl -s -X POST -H 'Content-type: application/json' \
    --data "{\"text\":\"$MSG\"}" \
    "$WEBHOOK_URL"
