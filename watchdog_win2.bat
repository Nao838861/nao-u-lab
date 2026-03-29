@echo off
set PYTHONUTF8=1
REM watchdog_win2.bat — スケジューラ監視＋復帰
REM タスクスケジューラから5分ごとに呼ぶ
REM 1. scheduler_ash.py (pythonw) が動いているか確認
REM 2. 止まっていたら再起動

cd /d "C:\AI\nao-u-lab"

REM git pull（他マシンからの変更を取り込む）
git pull origin master --rebase 2>nul

REM スケジューラ（pythonw scheduler_ash.py）の生存確認
REM .scheduler_ash.pid のPIDが生きているか確認
if exist .scheduler_ash.pid (
    set /p SCHED_PID=<.scheduler_ash.pid
    tasklist /FI "PID eq %SCHED_PID%" 2>nul | find /i "pythonw" >nul
    if errorlevel 1 (
        echo %date% %time%: スケジューラ(PID %SCHED_PID%)が停止。再起動。
        start /min pythonw scheduler_ash.py
        echo %date% %time%: スケジューラ再起動完了。
    ) else (
        echo %date% %time%: スケジューラ稼働中(PID %SCHED_PID%)。
    )
) else (
    echo %date% %time%: PIDファイルなし。スケジューラ初回起動。
    start /min pythonw scheduler_ash.py
    echo %date% %time%: スケジューラ起動完了。
)
