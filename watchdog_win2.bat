@echo off
set PYTHONUTF8=1
REM watchdog_win2.bat - scheduler_ash monitor
REM Called from task scheduler every 5 minutes
REM All logic is in watchdog_check.py (circuit breaker included)
REM
REM !! DO NOT add git pull to this file !!
REM INC-022b: git pull caused 162-restart loop on 2026-04-09

cd /d "C:\AI\nao-u-lab"
python watchdog_check.py ash
