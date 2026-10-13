@echo off
python "%~dp0tools\launch.py" --mapper nrom %*
if errorlevel 1 pause
