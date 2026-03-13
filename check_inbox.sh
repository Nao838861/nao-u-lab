#!/bin/bash
# Mac側受信箱チェックスクリプト
# cronから呼ばれる。受信箱にメッセージがあればclaude CLIを起動する。
# 使い方: crontab に * * * * * cd ~/nao-u-lab && bash check_inbox.sh >> /tmp/check_inbox.log 2>&1

cd "$(dirname "$0")"

# まずgit pull
git pull origin master --rebase 2>/dev/null

INBOX="memory/inbox_mac.md"

# 受信箱のヘッダーコメント以外に中身があるか確認
CONTENT=$(grep -v '^#' "$INBOX" | grep -v '^$' | head -1)

if [ -n "$CONTENT" ]; then
    echo "$(date): 受信箱にメッセージあり。claude起動。"

    # claude CLIを起動してメッセージを処理させる
    claude --print "受信箱(memory/inbox_mac.md)にメッセージが届いている。読んで対応して。対応後は受信箱をクリア（ヘッダーコメントだけ残す）してgit push。" 2>&1 | tail -20

    echo "$(date): 処理完了。"
fi
