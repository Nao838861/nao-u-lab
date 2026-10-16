@echo off
setlocal
set "MMC5_WEB=%~dp0.tmp\MMC5RacingWeb"
set "MMC5_NODE=%~dp0.tmp\emsdk\node\24.19.0_64bit\node.exe"
if not exist "%MMC5_NODE%" (
  echo Node runtime is missing: %MMC5_NODE%
  pause
  exit /b 1
)
if not exist "%MMC5_WEB%\tools\deploy_ranking.py" (
  echo Replay release tools are missing: %MMC5_WEB%
  pause
  exit /b 1
)
if "%~1"=="--check" (
  echo MMC5Racing replay deployment tools are ready.
  exit /b 0
)
pushd "%MMC5_WEB%"
set "ESBUILD_WORKER_THREADS=0"
echo Sign in to the Cloudflare account that owns the MMC5Racing ranking.
"%MMC5_NODE%" node_modules\wrangler\bin\wrangler.js login --scopes account:read user:read workers:write d1:write
if errorlevel 1 goto failed
python tools\deploy_ranking.py --node "%MMC5_NODE%"
if errorlevel 1 goto failed
call play_browser.cmd
popd
echo Replay deployment completed.
pause
exit /b 0
:failed
popd
echo Deployment did not complete. Review the error above.
pause
exit /b 1
