@echo off
setlocal
set PYTHONUTF8=1
cd /d "%~dp0"
python -X utf8 tools\codex_phases_cycle.py %*
exit /b %ERRORLEVEL%
