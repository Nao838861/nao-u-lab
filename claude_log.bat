@echo off
REM claude_log.bat — Log(Win) Claude Code launcher wrapper
REM Starts scheduler -> runs Claude Code -> stops scheduler on exit
REM For family-shared PC: only runs while Claude Code is active

cd /d D:\AI\Nao_u_BOT

REM --- git pull ---
git pull origin master --rebase 2>nul

REM --- Start scheduler (hidden, via wscript) ---
echo Starting scheduler...
start "" /b wscript //nologo run_scheduler_log.vbs

REM --- Wait for scheduler to start ---
timeout /t 2 /nologo >nul

REM --- Run Claude Code (blocks here until user exits) ---
echo Starting Claude Code...
claude

REM --- User exited Claude Code. Stop scheduler. ---
echo Stopping scheduler...
python scheduler_log.py --stop

echo Done.
