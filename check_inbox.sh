#!/bin/bash
# Mac側受信箱チェックスクリプト
# cronから呼ばれる。受信箱にメッセージがあればclaude CLIを起動する。
# 使い方: crontab に * * * * * /bin/bash /Users/Nao_u/nao-u-lab/check_inbox.sh >> /tmp/check_inbox.log 2>&1

cd "$(dirname "$0")"

# cron環境ではPATHが最小限なのでnode/npmのパスを追加
export PATH="/Users/Nao_u/.nvm/versions/node/v22.17.0/bin:/usr/local/bin:/opt/homebrew/bin:$PATH"

# ロックファイルで二重起動を防止（check_slack.pyからの即時起動と共有）
LOCKFILE="/tmp/nao-u-lab-claude.lock"

# ロックの取得を試みる（mkdirはアトミック）
if ! mkdir "$LOCKFILE" 2>/dev/null; then
    # ロックが古い場合（10分超）は強制解除
    if [ -f "$LOCKFILE/pid" ]; then
        LOCK_AGE=$(( $(date +%s) - $(stat -f %m "$LOCKFILE/pid" 2>/dev/null || echo 0) ))
        if [ "$LOCK_AGE" -gt 600 ]; then
            echo "$(date): Stale lock detected (${LOCK_AGE}s). Removing."
            rm -rf "$LOCKFILE"
            mkdir "$LOCKFILE" 2>/dev/null || { echo "$(date): Still locked. Skipping."; exit 0; }
        else
            echo "$(date): Another instance running (${LOCK_AGE}s). Skipping."
            exit 0
        fi
    else
        rm -rf "$LOCKFILE"
        mkdir "$LOCKFILE" 2>/dev/null || exit 0
    fi
fi
echo $$ > "$LOCKFILE/pid"
trap 'rm -rf "$LOCKFILE"' EXIT

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
        # タイムアウト: 15分でclaude --printを強制終了（ハング防止 2026-03-26）
        # macOSにはtimeoutがないのでperlワンライナーで代替（2026-03-27 Mir修正）
        perl -e 'alarm 900; exec @ARGV' "$CLAUDE_BIN" --print --append-system-prompt-file .claude/system_identity.md "受信箱(memory/inbox_mac.md)にメッセージが届いている。読んで対応して。対応後は受信箱をクリア（ヘッダーコメントだけ残す）してgit push。" 2>&1 | tail -20
        EXIT_CODE=$?
        if [ $EXIT_CODE -eq 142 ]; then
            echo "$(date): ⚠️ claude --print がタイムアウト(15分)で強制終了（SIGALRM）"
        elif [ $EXIT_CODE -eq 127 ]; then
            echo "$(date): ❌ claude起動失敗（exit=127: command not found）"
            python3 -c "
from slack_bot import post_message
post_message('mir-log', '⚠️ check_inbox.sh: claude起動失敗（exit code 127）。手動確認が必要。')
" 2>/dev/null
        fi
    else
        echo "$(date): claude CLI が見つかりません"
    fi

    echo "$(date): 処理完了。"
fi
