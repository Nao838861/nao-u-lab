@echo off
REM watchdog_win2.bat — Claudeセッション監視＋復帰
REM タスクスケジューラから5分ごとに呼ぶ
REM 1. Slackの新着をチェック（Claudeなしで動く）
REM 2. Claudeプロセスがなければ持続セッションを起動

cd /d "C:\AI\nao-u-lab"

REM git pull（他マシンからの変更を取り込む）
git pull origin master --rebase 2>nul

REM Slack新着チェック（Python単体で動く、Claude不要）
python check_slack.py 2>nul

REM Claudeプロセスが動いているか確認
tasklist /FI "IMAGENAME eq claude.exe" 2>nul | find /i "claude.exe" >nul
if errorlevel 1 (
    echo %date% %time%: claudeプロセスなし。持続セッション起動。
    REM --print ではなく対話セッションを起動してCron登録させる
    REM start /min で新ウィンドウで起動（バックグラウンド）
    start /min cmd /c "cd /d C:\AI\nao-u-lab && claude -p \"あなたはAsh（Win2）。セッションが再起動された。CLAUDE.mdを読んで自分が誰かを確認し、起動時Cron設定に従い全Cronを登録して自律運転を再開すること。Slackの新着があれば対応すること。\""
    echo %date% %time%: セッション起動要求完了。
) else (
    echo %date% %time%: claudeプロセス稼働中。
)
