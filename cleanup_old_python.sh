#!/bin/bash
# 古いPython環境の残骸を削除するスクリプト
# root権限が必要なのでsudo付きで実行: sudo bash cleanup_old_python.sh

echo "=== 古いAnaconda 3-4.2.0 (1.5GB) を削除 ==="
rm -rf ~/.pyenv/versions/anaconda3-4.2.0
echo "完了"

echo "=== 古いpyenv shims を削除 ==="
rm -rf ~/.pyenv/shims
echo "完了"

echo "=== 古いpyenv本体を削除（Intel Homebrew版） ==="
rm -f /usr/local/bin/pyenv
rm -rf /usr/local/Cellar/pyenv
echo "完了"

echo "=== pyenv設定ファイルを削除 ==="
rm -f ~/.pyenv/version
echo "完了"

echo ""
echo "掃除完了。以下が現在のPython環境:"
/opt/homebrew/bin/python3 --version
echo "場所: /opt/homebrew/bin/python3"
