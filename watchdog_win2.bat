@echo off
set PYTHONUTF8=1
REM watchdog_win2.bat - scheduler monitor and restart
REM Called from task scheduler every 5 minutes
REM 1. Check if scheduler_ash.py (pythonw) is running
REM 2. Restart if stopped
REM Note: ASCII-only to avoid cp932/Shift-JIS bat parsing errors
REM INC-022b: Use process name detection, not PID file

cd /d "C:\AI\nao-u-lab"

REM git pull removed (INC-022b): git pullがscheduler_ash.pyを変更し
REM auto-reloadで再起動ループを引き起こした(2026-04-09障害)。
REM git syncはscheduler内のgit_syncジョブ(1時間間隔)が担当する。

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
