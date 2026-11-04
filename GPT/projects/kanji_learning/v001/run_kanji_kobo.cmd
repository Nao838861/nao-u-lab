@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo カンジ工房を起動します。
echo ブラウザーで http://127.0.0.1:8765 を開いてください。
echo 終了するときは、このウィンドウで Ctrl+C を押してください。
python -m http.server 8765 --bind 127.0.0.1 --directory dist
pause
