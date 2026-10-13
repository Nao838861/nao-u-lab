@echo off
cd /d "%~dp0"
python tools\launch.py --mapper n8pro-gsu-abi2 releases\GSU_SolidCube30_v001.nes
if errorlevel 1 pause
