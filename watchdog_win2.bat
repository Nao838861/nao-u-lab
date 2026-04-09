@echo off
setlocal enabledelayedexpansion
set PYTHONUTF8=1
REM watchdog_win2.bat - scheduler monitor and restart
REM Called from task scheduler every 5 minutes
REM Note: ASCII-only to avoid cp932/Shift-JIS bat parsing errors
REM
REM !! DO NOT add git pull to this file !!
REM Reason (INC-022b, 2026-04-09): git pull changes scheduler_ash.py hash,
REM triggering auto-reload exit loops (162 restarts, massive API waste).
REM git sync is handled by git_sync job inside the scheduler (1h interval).

cd /d "C:\AI\nao-u-lab"

REM Check if ANY pythonw process running scheduler_ash.py exists
powershell -Command "if (Get-CimInstance Win32_Process -Filter \"Name='pythonw.exe' AND CommandLine LIKE '%%scheduler_ash%%'\") { exit 0 } else { exit 1 }" 2>nul
if errorlevel 1 (
    echo %date% %time%: No scheduler_ash.py process found. Starting.
    del .scheduler_ash.pid 2>nul
    start /min pythonw scheduler_ash.py
    echo %date% %time%: Start issued.
) else (
    echo %date% %time%: scheduler_ash.py already running.
)
endlocal
