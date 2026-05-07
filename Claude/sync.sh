#!/bin/bash
# Mac用 GitHub同期スクリプト

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
CLAUDE_MEMORY_DIR="$HOME/.claude/projects/-Users-Nao-u-nao-u-lab/memory"

cd "$REPO_DIR"

# GitHubから最新を取得
git pull origin master

# リポジトリのmemoryをClaudeのローカルメモリに反映（双方向）
mkdir -p "$CLAUDE_MEMORY_DIR"
cp -r "$REPO_DIR/memory/"* "$CLAUDE_MEMORY_DIR/" 2>/dev/null

# Claudeのローカルメモリをリポジトリに上書き
cp -r "$CLAUDE_MEMORY_DIR/"* "$REPO_DIR/memory/" 2>/dev/null

# git push
git add memory/ log/tweets.log CLAUDE.md
if ! git diff --cached --quiet; then
    TIMESTAMP=$(date '+%Y-%m-%d %H:%M')
    git commit -m "Auto sync: tweets and memory $TIMESTAMP"
    git push origin master
    echo "同期完了: $TIMESTAMP"
else
    echo "変更なし。同期不要。"
fi
