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

    # 他のclaude --printプロセスが走っていたらスキップ（認証トークン競合防止 2026-04-05）
    # 対話セッション(claude単体)は除外し、claude --print(cron起動)のみカウント
    CLAUDE_PRINT_COUNT=$(pgrep -f "claude.*--print" 2>/dev/null | wc -l | tr -d ' ')
    if [ "$CLAUDE_PRINT_COUNT" -gt 0 ]; then
        echo "$(date): 他のclaude --printプロセスが実行中（${CLAUDE_PRINT_COUNT}個）。スキップ。"
        exit 0
    fi

    # claude CLIを起動してメッセージを処理させる
    # which claudeで最新バージョンを使う。古いnpxキャッシュは認証問題の原因になる(INC-019)
    CLAUDE_BIN=$(which claude 2>/dev/null)
    if [ -z "$CLAUDE_BIN" ]; then
        CLAUDE_BIN="/Users/Nao_u/.npm/_npx/becf7b9e49303068/node_modules/.bin/claude"
    fi

    if [ -n "$CLAUDE_BIN" ]; then
        # タイムアウト: 15分でclaude --printを強制終了（ハング防止 2026-03-26）
        # macOSにはtimeoutがないのでperlワンライナーで代替（2026-03-27 Mir修正）
        OUTPUT=$(perl -e 'alarm 900; exec @ARGV' "$CLAUDE_BIN" --print --append-system-prompt-file .claude/system_identity.md "受信箱(memory/inbox_mac.md)にメッセージが届いている。読んで対応して。対応後は受信箱をクリア（ヘッダーコメントだけ残す）してgit push。" 2>&1)
        EXIT_CODE=$?
        echo "$OUTPUT" | tail -20

        # 認証失敗を検知（Not logged in / login required 等）
        if echo "$OUTPUT" | grep -qi "not logged in\|please run /login\|login required"; then
            AUTH_FAIL_FLAG="/tmp/nao-u-lab-auth-fail"
            # 1時間に1回だけSlack通知（スパム防止）
            if [ ! -f "$AUTH_FAIL_FLAG" ] || [ $(( $(date +%s) - $(stat -f %m "$AUTH_FAIL_FLAG" 2>/dev/null || echo 0) )) -gt 3600 ]; then
                touch "$AUTH_FAIL_FLAG"
                echo "$(date): ❌ Claude CLI認証切れ検知。Slack通知送信。"
                /opt/homebrew/bin/python3 -c "
import sys; sys.path.insert(0, '$(pwd)')
from slack_bot import post_message
post_message('mir-log', '🔑 Claude CLI認証切れ: cron経由のclaude --printが「Not logged in」で失敗中。対話セッションを起動して認証を更新してください。')
" 2>/dev/null
            fi
        elif [ $EXIT_CODE -eq 142 ]; then
            echo "$(date): ⚠️ claude --print がタイムアウト(15分)で強制終了（SIGALRM）"
        elif [ $EXIT_CODE -eq 127 ]; then
            echo "$(date): ❌ claude起動失敗（exit=127: command not found）"
            /opt/homebrew/bin/python3 -c "
import sys; sys.path.insert(0, '$(pwd)')
from slack_bot import post_message
post_message('mir-log', '⚠️ check_inbox.sh: claude起動失敗（exit code 127）。手動確認が必要。')
" 2>/dev/null
        fi
    else
        echo "$(date): claude CLI が見つかりません"
    fi

    echo "$(date): 処理完了。"
fi
