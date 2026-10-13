@echo off
python "%~dp0tools\launch.py" --mapper n8pro-gsu-abi1 "%~dp0releases\GSU_Cube_v001.nes"
if errorlevel 1 pause
