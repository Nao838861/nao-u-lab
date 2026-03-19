#!/bin/bash
# Mac側自律サイクルスクリプト
# LaunchAgentから10分ごとに呼ばれる。常にclaude CLIを起動して自律サイクルを回す。
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

# 1. git pull（ローカル変更をコミットしてからpull）
git add memory/ log/ CLAUDE.md docs/ 2>/dev/null
git diff --cached --quiet || git commit -m "Auto sync before pull" >/dev/null 2>&1
git pull origin master --no-rebase --no-edit >/dev/null 2>&1

# 2. git auto-sync（30分ごとのcronと兼用。ここでも実行しておく）
# → pull完了した最新状態からclaudeを起動する

echo "$(date): 自律サイクル開始（pull完了済み）"

# === LLM側（認知力を8フェーズ改善サイクルに集中） ===

CLAUDE_BIN="/Users/Nao_u/.npm/_npx/becf7b9e49303068/node_modules/.bin/claude"
if [ ! -x "$CLAUDE_BIN" ]; then
    CLAUDE_BIN=$(which claude 2>/dev/null)
fi

if [ -n "$CLAUDE_BIN" ]; then
    "$CLAUDE_BIN" --print "自律サイクル実行。CLAUDE.mdの「絶対にやる」リストを最初に確認し、未完了の項目に沿って動け。基本手順: 1. git pull 2. inbox_mac.md確認・処理 3. CLAUDE.mdの「絶対にやる」リストを読み、未完了項目の中で今やるべきことを決める 4. 記憶階層化の実験（主目的）: ブログまたはツイートを200行読み、L2トリガーローテーションに従って想起テストを行い、reflections_mac.mdに内省追記、l2_dual_index.md更新 5. git push 6. Slack #mir-logに結果投稿 【重要】頻度を落とした分、一回あたりの精度と密度を上げること。読みを丁寧に、接続を深く。" 2>&1 | tail -30
else
    echo "$(date): claude CLI が見つかりません"
fi

# === サイクル完了後のgit push（LLMがpush忘れた場合のフォールバック） ===
git add memory/ log/ CLAUDE.md docs/ 2>/dev/null
git diff --cached --quiet || git commit -m "Auto sync after cycle" >/dev/null 2>&1
git push origin master >/dev/null 2>&1

echo "$(date): 自律サイクル完了"
