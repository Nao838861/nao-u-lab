@echo off
where Mesen.exe >nul 2>nul
if errorlevel 1 goto local
start "" Mesen.exe "%~dp0rtype-mmc5.nes"
exit /b
:local
start "" "D:\HomeBrew\Mesen\Mesen.exe" "%~dp0rtype-mmc5.nes"

