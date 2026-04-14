#!/bin/bash
# setup_hooks.sh — git hooksをインストール
#
# 使い方: bash scripts/setup_hooks.sh
# 各マシンで1回実行すればOK。

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HOOKS_SRC="${REPO_ROOT}/scripts/hooks"
HOOKS_DST="${REPO_ROOT}/.git/hooks"

if [[ ! -d "$HOOKS_SRC" ]]; then
    echo "ERROR: ${HOOKS_SRC} が見つかりません"
    exit 1
fi

installed=0
for hook_file in "$HOOKS_SRC"/*; do
    if [[ -f "$hook_file" ]]; then
        filename="$(basename "$hook_file")"
        cp "$hook_file" "$HOOKS_DST/$filename"
        chmod +x "$HOOKS_DST/$filename"
        echo "Installed: $filename"
        installed=$((installed + 1))
    fi
done

echo "Done. ${installed} hook(s) installed."
