@echo off
REM watchdog_log.bat — Log(Win) スケジューラ監視＋復帰
REM タスクスケジューラから5分ごとに呼ぶ
REM 1. Slackの新着をチェック（Claudeなしで動く）
REM 2. scheduler_log.pyが動いていなければ再起動
REM
REM 2026-03-26 Log作成: 24h自動終了後の再起動忘れ防止

cd /d D:\AI\Nao_u_BOT

REM git pull（他マシンからの変更を取り込む）
git pull origin master --rebase 2>nul

REM Slack新着チェック（Python単体で動く、Claude不要）
python check_slack.py 2>nul

REM スケジューラのPIDファイルを確認
if not exist ".scheduler_log.lock" goto :start_scheduler

REM PIDファイルがあればプロセスが生きているか確認
set /p PID=<.scheduler_log.lock
tasklist /FI "PID eq %PID%" 2>nul | find "%PID%" >nul
if errorlevel 1 goto :start_scheduler

REM プロセスは生きている
echo %date% %time%: scheduler_log.py稼働中 (PID %PID%)。
goto :eof

:start_scheduler
echo %date% %time%: scheduler_log.pyが停止中。再起動します。
REM PIDファイルを掃除
if exist ".scheduler_log.lock" del ".scheduler_log.lock"
REM 非表示ウィンドウで起動（既存のrun_scheduler_log.vbsを利用）
start "" /b wscript //nologo run_scheduler_log.vbs
echo %date% %time%: スケジューラ再起動完了。
