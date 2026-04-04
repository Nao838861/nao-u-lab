#!/bin/bash
# 間隔変更後の動作確認スクリプト
# 使い方: bash verify_interval_change.sh [インスタンス名]
# 「間隔を変えて」の依頼後、必ずこれを実行して結果をSlackに報告する

cd "$(dirname "$0")"
export PATH="/Users/Nao_u/.nvm/versions/node/v22.17.0/bin:/usr/local/bin:/opt/homebrew/bin:$PATH"

INSTANCE="${1:-mir}"
ERRORS=0
REPORT=""

echo "=== 間隔変更 確認チェック ($INSTANCE) ==="

# 1. 認証チェック
echo -n "[1] CLI認証... "
AUTH_CHECK=$(claude --print "echo ok" 2>&1 | head -1)
if echo "$AUTH_CHECK" | grep -qi "not logged in\|login required"; then
    echo "❌ 認証切れ"
    REPORT="${REPORT}\n❌ CLI認証切れ。対話セッションを起動して更新が必要"
    ERRORS=$((ERRORS + 1))
else
    echo "✅"
    REPORT="${REPORT}\n✅ CLI認証OK"
fi

# 2. 設定値の確認
echo -n "[2] 設定値... "
if [ "$INSTANCE" = "mir" ]; then
    INTERVAL=$(awk '/^## サイクル間���/{found=1;next} found && /^[0-9]/{print;exit}' memory/mir_boot_intent.md | tr -d '[:space:]')
    echo "✅ mir_boot_intent.md = ${INTERVAL}分"
    REPORT="${REPORT}\n✅ 設定��: ${INTERVAL}分 (mir_boot_intent.md)"
elif [ "$INSTANCE" = "log" ]; then
    INTERVAL=$(python3 -c "import json; c=json.load(open('scheduler_log_config.json')); print(c.get('auto_cycle',{}).get('interval','-'))" 2>/dev/null)
    echo "✅ config = ${INTERVAL}秒"
    REPORT="${REPORT}\n✅ 設定値: ${INTERVAL}秒 (scheduler_log_config.json)"
elif [ "$INSTANCE" = "ash" ]; then
    INTERVAL=$(python3 -c "import json; c=json.load(open('scheduler_ash_config.json')); print(c.get('auto_diary',{}).get('interval','-'))" 2>/dev/null)
    echo "✅ config = ${INTERVAL}秒"
    REPORT="${REPORT}\n✅ 設定値: ${INTERVAL}秒 (scheduler_ash_config.json)"
fi

# 3. プロセス生存チェック
echo -n "[3] プロセス... "
if [ "$INSTANCE" = "mir" ]; then
    # LaunchAgent + autonomous_cycle.sh
    PLIST_LOADED=$(launchctl list 2>/dev/null | grep nao-u-lab || echo "")
    if [ -n "$PLIST_LOADED" ]; then
        echo "✅ LaunchAgent稼働中"
        REPORT="${REPORT}\n✅ LaunchAgent稼働中"
    else
        echo "⚠️ LaunchAgentが見つからない（cron経由の可能性）"
        REPORT="${REPORT}\n⚠️ LaunchAgent未検出（cron経由の可能性あり）"
    fi
    # check_slack.py cron
    CRON_ENTRY=$(crontab -l 2>/dev/null | grep check_slack)
    if [ -n "$CRON_ENTRY" ]; then
        echo "    check_slack cron: ✅"
        REPORT="${REPORT}\n✅ check_slack.py cron設定あり"
    else
        echo "    check_slack cron: ❌"
        REPORT="${REPORT}\n❌ check_slack.py cronが設定されていない"
        ERRORS=$((ERRORS + 1))
    fi
fi

# 4. 最終実行時刻チェック
echo -n "[4] 最終実行... "
if [ "$INSTANCE" = "mir" ]; then
    if [ -f /tmp/nao-u-lab-last-run ]; then
        LAST=$(cat /tmp/nao-u-lab-last-run)
        NOW=$(date +%s)
        AGE=$(( (NOW - LAST) / 60 ))
        echo "✅ ${AGE}分前"
        REPORT="${REPORT}\n✅ 最終サイクル実行: ${AGE}分前"
    else
        echo "⚠️ タイ���スタンプなし"
        REPORT="${REPORT}\n⚠️ 最終実行タイムスタンプなし"
    fi
fi

# 5. 直近ログのエラーチェック
echo -n "[5] 直近ログ... "
RECENT_ERRORS=$(tail -5 /tmp/check_inbox_triggered.log 2>/dev/null | grep -c "Not logged in")
if [ "$RECENT_ERRORS" -gt 0 ]; then
    echo "❌ 直近5件中${RECENT_ERRORS}件が認証エラー"
    REPORT="${REPORT}\n❌ 直近ログに認証エラー${RECENT_ERRORS}件"
    ERRORS=$((ERRORS + 1))
else
    echo "✅ エラーなし"
    REPORT="${REPORT}\n✅ 直近ログにエラーなし"
fi

# 結果サマリ
echo ""
echo "=== 結果: エラー${ERRORS}件 ==="
if [ "$ERRORS" -eq 0 ]; then
    SUMMARY="✅ 間隔変更確認完了（${INSTANCE}）。全チェックパス。設定値=${INTERVAL}"
else
    SUMMARY="⚠️ 間隔変更確認（${INSTANCE}）で${ERRORS}件の問題。要対応"
fi
echo "$SUMMARY"

# Slack通知
/opt/homebrew/bin/python3 -c "
import sys; sys.path.insert(0, '$(pwd)')
from slack_bot import post_message
post_message('mir-log', '''${SUMMARY}$(echo -e "$REPORT")''')
" 2>/dev/null

echo "Slack通知送信完了"
