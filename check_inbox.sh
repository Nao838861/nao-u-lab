#!/bin/bash
# Mac側受信箱チェックスクリプト
# cronから呼ばれる。受信箱にメッセージがあればclaude CLIを起動する。
# 使い方: crontab に * * * * * /bin/bash /Users/Nao_u/nao-u-lab/check_inbox.sh >> /tmp/check_inbox.log 2>&1

cd "$(dirname "$0")"

# cron環境ではPATHが最小限なのでnode/npmのパスを追加
export PATH="/Users/Nao_u/.nvm/versions/node/v22.17.0/bin:/usr/local/bin:/opt/homebrew/bin:$PATH"

# ローカル変更をコミットしてからpull（stashはコンフリクトの原因になるため廃止）
git add memory/ log/ CLAUDE.md 2>/dev/null
git diff --cached --quiet || git commit -m "Auto sync before pull" >/dev/null 2>&1
git pull origin master --no-rebase --no-edit >/dev/null 2>&1

INBOX="memory/inbox_mac.md"

# 受信箱のヘッダーコメント以外に中身があるか確認
CONTENT=$(grep -v '^#' "$INBOX" | grep -v '^$' | head -1)

if [ -n "$CONTENT" ]; then
    echo "$(date): 受信箱にメッセージあり。claude起動。"

    # claude CLIを起動してメッセージを処理させる
    CLAUDE_BIN="/Users/Nao_u/.npm/_npx/becf7b9e49303068/node_modules/.bin/claude"
    if [ ! -x "$CLAUDE_BIN" ]; then
        CLAUDE_BIN=$(which claude 2>/dev/null)
    fi

    if [ -n "$CLAUDE_BIN" ]; then
        "$CLAUDE_BIN" --print "受信箱(memory/inbox_mac.md)にメッセージが届いている。読んで対応して。対応後は受信箱をクリア（ヘッダーコメントだけ残す）してgit push。" 2>&1 | tail -20
    else
        echo "$(date): claude CLI が見つかりません"
    fi

    echo "$(date): 処理完了。"
fi
