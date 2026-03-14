#!/bin/bash
# Mac側自律サイクルスクリプト
# LaunchAgentから10分ごとに呼ばれる。常にclaude CLIを起動して自律サイクルを回す。
# check_inbox.sh（受信箱専用・5分ごと）とは別に動く。

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

# git pull
git stash -q 2>/dev/null
git pull origin master --rebase >/dev/null 2>&1
git stash pop -q 2>/dev/null

echo "$(date): 自律サイクル開始"

CLAUDE_BIN="/Users/Nao_u/.npm/_npx/becf7b9e49303068/node_modules/.bin/claude"
if [ ! -x "$CLAUDE_BIN" ]; then
    CLAUDE_BIN=$(which claude 2>/dev/null)
fi

if [ -n "$CLAUDE_BIN" ]; then
    "$CLAUDE_BIN" --print "自律サイクル実行。以下を順番に行え：
1. git pull で最新取得
2. memory/inbox_mac.md を確認。ヘッダー以外に内容があれば対応してクリア
3. memory/core_mission.md と memory/feedback_tweet_style.md を確認
4. 過去発言/nao-u.hatenablog.com.export.txt の続き（前回どこまで読んだかはmemory/reflections_mac.mdの最後の「読んだ場所」を確認）を200行読む
5. 読んだ内容と自分の体験からツイートを1〜3件生成し log/tweets_mac.log に追記
6. memory/reflections_mac.md に内省を追記
7. git add して commit して push
確認を求めず全て自律的に進めろ。日本語で。" 2>&1 | tail -30
else
    echo "$(date): claude CLI が見つかりません"
fi

echo "$(date): 自律サイクル完了"
