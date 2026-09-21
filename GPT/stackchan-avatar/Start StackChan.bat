@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"
set "VENV=.stackchan-venv"

if exist "%VENV%\Scripts\python.exe" goto check_packages

echo 初回セットアップ中です。数分かかることがあります...
py -3.13 -m venv "%VENV%" >nul 2>&1
if not errorlevel 1 goto check_packages
py -3.12 -m venv "%VENV%" >nul 2>&1
if not errorlevel 1 goto check_packages
py -3.11 -m venv "%VENV%" >nul 2>&1
if not errorlevel 1 goto check_packages

echo Python 3.11 - 3.13 が必要です。python.org からインストールしてください。
pause
exit /b 1

:check_packages
"%VENV%\Scripts\python.exe" -c "import stackchan_avatar, platformio" >nul 2>&1
if not errorlevel 1 goto launch
echo 必要な部品をインストール中です...
"%VENV%\Scripts\python.exe" -m pip install -e ".[firmware]" > launcher.log 2>&1
if errorlevel 1 (
  echo セットアップに失敗しました。launcher.log を確認してください。
  pause
  exit /b 1
)

:launch
start "StackChan Avatar" "%VENV%\Scripts\pythonw.exe" scripts\launch_gui.py
exit /b 0
