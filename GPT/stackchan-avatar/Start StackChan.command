#!/bin/bash
set -u

ROOT="$(cd "$(dirname "$0")" && pwd)"
VENV="$ROOT/.stackchan-venv"
LOG="$ROOT/launcher.log"
cd "$ROOT" || exit 1

find_python() {
  for candidate in python3.13 python3.12 python3.11; do
    if command -v "$candidate" >/dev/null 2>&1; then
      echo "$candidate"
      return 0
    fi
  done
  return 1
}

if [ ! -x "$VENV/bin/python" ]; then
  PYTHON="$(find_python)" || {
    echo "Python 3.11〜3.13が必要です。python.orgからインストールしてください。"
    read -r -p "Enterキーで閉じます"
    exit 1
  }
  echo "初回セットアップ中です。数分かかることがあります…"
  "$PYTHON" -m venv "$VENV" || exit 1
fi

if ! "$VENV/bin/python" -c "import stackchan_avatar, platformio" >/dev/null 2>&1; then
  echo "必要な部品をインストール中です…"
  "$VENV/bin/python" -m pip install -e '.[firmware]' 2>&1 | tee "$LOG" || {
    echo "セットアップに失敗しました。$LOG を確認してください。"
    read -r -p "Enterキーで閉じます"
    exit 1
  }
fi

echo "設定画面をブラウザで開きます。この画面はアプリ終了まで閉じないでください。"
exec "$VENV/bin/python" scripts/launch_gui.py
