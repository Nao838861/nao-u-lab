@echo off
setlocal
cd /d "%~dp0"
if not exist ".tmp\Mesen\Mesen.exe" (
  echo Mesen was not found at .tmp\Mesen\Mesen.exe
  pause
  exit /b 1
)
start "" ".tmp\Mesen\Mesen.exe" "artifacts\mmc5racing_2d\20261016_minimap\MMC5Racing_Minimap_136x184.nes"
