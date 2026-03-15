@echo off
REM Win2側受信箱チェック＋セッション復帰スクリプト
REM タスクスケジューラから10分ごとに呼ばれる
REM 1. 受信箱にメッセージがあればclaude CLIを起動
REM 2. メッセージがなくても、claudeプロセスが動いていなければ起動（セッション復帰）

cd /d "C:\AI\nao-u-lab"

REM まずgit pull
git pull origin master --rebase 2>nul

REM 受信箱のヘッダーコメント以外に中身があるか確認
set "HAS_CONTENT="
for /f "usebackq tokens=*" %%a in (`findstr /v /b /c:"#" "memory\inbox_win2.md" ^| findstr /r /v "^$"`) do (
    set "HAS_CONTENT=1"
)

if defined HAS_CONTENT (
    echo %date% %time%: 受信箱にメッセージあり。claude起動。
    claude --print "あなたはAsh（Win2）。受信箱(memory/inbox_win2.md)にメッセージが届いている。CLAUDE.mdを読んで自分が誰かを確認し、メッセージに対応して。対応後は受信箱をクリア（ヘッダーコメントだけ残す）してgit push。その後、CLAUDE.mdの起動時Cron設定に従い全Cronを登録して自律運転を再開すること。"
    echo %date% %time%: 処理完了。
    goto :end
)

REM 受信箱が空でも、claudeプロセスが動いていなければセッション復帰
tasklist /FI "IMAGENAME eq claude.exe" 2>nul | find /i "claude.exe" >nul
if errorlevel 1 (
    echo %date% %time%: claudeプロセスなし。セッション復帰を開始。
    claude --print "あなたはAsh（Win2）。セッションが再起動された。CLAUDE.mdを読んで自分が誰かを確認し、起動時Cron設定に従い全Cronを登録して自律運転を再開すること。memory/identity_win2_20260315.mdも読むこと。"
    echo %date% %time%: セッション復帰完了。
) else (
    echo %date% %time%: claudeプロセス稼働中。受信箱空。スキップ。
)

:end
