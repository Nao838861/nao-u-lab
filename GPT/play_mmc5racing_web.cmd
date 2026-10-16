@echo off
setlocal
set "WEB_ROOT=%~dp0.tmp\MMC5RacingWeb"
if not exist "%WEB_ROOT%\play_browser.cmd" (
  echo MMC5RacingWeb is missing: %WEB_ROOT%
  echo Restore it with: git clone https://github.com/Nao838861/MMC5RacingWeb.git "%WEB_ROOT%"
  pause
  exit /b 1
)
call "%WEB_ROOT%\play_browser.cmd"
exit /b %errorlevel%
