@echo off
REM watchdog_log.bat — Log(Win) スケジューラ監視＋復帰
REM タスクスケジューラから5分ごとに呼ぶ
REM 1. Slackの新着をチェック（Claudeなしで動く）
REM 2. scheduler_log.pyが動いていなければ再起動
REM
REM 2026-03-26 Log作成: 24h自動終了後の再起動忘れ防止

cd /d C:\AI\nao-u-lab

REM git pull（他マシンからの変更を取り込む）
git pull origin master --rebase 2>nul

REM Slack新着チェック（Python単体で動く、Claude不要）
pythonw check_slack.py 2>nul

REM スケジューラのPIDファイルを確認
if not exist ".scheduler_log.lock" goto :start_scheduler

REM PIDファイルがあればプロセスが生きているか確認
set /p PID=<.scheduler_log.lock
tasklist /FI "PID eq %PID%" 2>nul | find "%PID%" >nul
if errorlevel 1 goto :start_scheduler

REM プロセスは生きている
echo %date% %time%: scheduler_log.py稼働中 (PID %PID%) >> log\watchdog_log.log
goto :eof

:start_scheduler
echo %date% %time%: scheduler_log.pyが停止中。再起動します。 >> log\watchdog_log.log
REM PIDファイルを掃除
if exist ".scheduler_log.lock" del ".scheduler_log.lock"
REM Pythonで直接デタッチ起動（VBS経由は起動失敗する問題があったため変更 2026-03-31）
pythonw -c "import subprocess; subprocess.Popen(['pythonw','scheduler_log.py'],creationflags=0x00000008|0x00000200,stdout=open('log/scheduler_stdout.log','w'),stderr=subprocess.STDOUT)"
echo %date% %time%: スケジューラ再起動完了。 >> log\watchdog_log.log
