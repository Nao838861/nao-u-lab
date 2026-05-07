#!/bin/bash
# Git hooks 導入スクリプト。新規クローン時と scripts/hooks/ 更新時に実行する。
#
# .git/hooks/ は git 管理外なので、リポジトリ内の scripts/hooks/ から各インスタンスが
# 個別にコピーする運用にしている。シンボリックリンク禁止（Windows で動作不安定）。

set -e

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null)"
if [[ -z "$REPO_ROOT" ]]; then
    echo "✗ git リポジトリ内で実行してください" >&2
    exit 1
fi

SRC_DIR="${REPO_ROOT}/scripts/hooks"
DST_DIR="${REPO_ROOT}/.git/hooks"

if [[ ! -d "$SRC_DIR" ]]; then
    echo "✗ $SRC_DIR が見つかりません" >&2
    exit 1
fi

if [[ ! -d "$DST_DIR" ]]; then
    echo "✗ $DST_DIR が見つかりません（git init 済みか確認）" >&2
    exit 1
fi

INSTALLED=0
for hook in pre-push commit-msg; do
    src="${SRC_DIR}/${hook}"
    dst="${DST_DIR}/${hook}"
    if [[ ! -f "$src" ]]; then
        continue
    fi
    cp "$src" "$dst"
    chmod +x "$dst" 2>/dev/null || true
    echo "✓ ${hook} を導入しました: ${dst}"
    INSTALLED=$((INSTALLED + 1))
done

if [[ $INSTALLED -eq 0 ]]; then
    echo "⚠ 導入するフックがありませんでした" >&2
    exit 1
fi

echo ""
echo "完了。${INSTALLED} 個のフックを導入しました。"
echo "動作確認: memory/action_reservations.md を編集してコミットし、"
echo "         タグ無しメッセージで拒否されることを確認してください。"
