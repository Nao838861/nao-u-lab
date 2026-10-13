@echo off
python "%~dp0tools\launch.py" --mapper n8pro-gsu-abi1 %*
if errorlevel 1 pause
