@echo off
cd /d "%~dp0"
python tools\launch_ground.py --gsu-mhz 50
if errorlevel 1 pause
