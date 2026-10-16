@echo off
setlocal
set "GSU_ROOT=%~dp0.tmp\nesfx-audio-repo\GPT\projects\nes_superfx"
if not exist "%GSU_ROOT%\runtime\MesenCore.dll" (
  echo SuperFX runtime is missing: %GSU_ROOT%\runtime
  pause
  exit /b 1
)
python "%GSU_ROOT%\tools\launch_racing.py" %*
if errorlevel 1 pause
