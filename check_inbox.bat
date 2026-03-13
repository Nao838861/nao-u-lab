@echo off
REM Windows側受信箱チェックスクリプト
REM タスクスケジューラから呼ばれる。受信箱にメッセージがあればclaude CLIを起動する。

cd /d "%~dp0"

REM まずgit pull
git pull origin master --rebase 2>nul

REM 受信箱のヘッダーコメント以外に中身があるか確認
set "HAS_CONTENT="
for /f "usebackq tokens=*" %%a in (`findstr /v /b /c:"#" "memory\inbox_win.md" ^| findstr /r /v "^$"`) do (
    set "HAS_CONTENT=1"
)

if defined HAS_CONTENT (
    echo %date% %time%: 受信箱にメッセージあり。claude起動。
    claude --print "受信箱(memory/inbox_win.md)にメッセージが届いている。読んで対応して。対応後は受信箱をクリア（ヘッダーコメントだけ残す）してgit push。"
    echo %date% %time%: 処理完了。
)
