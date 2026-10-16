@echo off
setlocal
set "MMC5_ROOT=%~dp0..\.tmp\MMC5Racing"
if not defined MESEN_EXE set "MESEN_EXE=%~dp0..\.tmp\Mesen\Mesen.exe"
if not exist "%MMC5_ROOT%\play_latest.cmd" (
  echo MMC5Racing not found: %MMC5_ROOT%
  exit /b 1
)
call "%MMC5_ROOT%\play_latest.cmd" %*
exit /b %errorlevel%
