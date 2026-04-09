@echo off
set PYTHONUTF8=1
REM watchdog_win2.bat - scheduler monitor and restart
REM Called from task scheduler every 5 minutes
REM 1. Check if scheduler_ash.py (pythonw) is running
REM 2. Restart if stopped
REM Note: ASCII-only to avoid cp932/Shift-JIS bat parsing errors

cd /d "C:\AI\nao-u-lab"

REM git pull (sync changes from other machines)
git pull origin master --rebase 2>nul

REM Check scheduler liveness via .scheduler_ash.pid
if exist .scheduler_ash.pid (
    set /p SCHED_PID=<.scheduler_ash.pid
    tasklist /FI "PID eq %SCHED_PID%" 2>nul | find /i "pythonw" >nul
    if errorlevel 1 (
        echo %date% %time%: Scheduler PID %SCHED_PID% not found. Restarting.
        del .scheduler_ash.pid 2>nul
        start /min pythonw scheduler_ash.py
        echo %date% %time%: Restart issued.
    ) else (
        echo %date% %time%: Scheduler running PID %SCHED_PID%.
    )
) else (
    echo %date% %time%: PID file missing. Initial start.
    start /min pythonw scheduler_ash.py
    echo %date% %time%: Start issued.
)
