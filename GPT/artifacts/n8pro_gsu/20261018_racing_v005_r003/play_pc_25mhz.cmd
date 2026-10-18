@echo off
setlocal
set "GSU_ROOT=%~dp0..\..\..\.tmp\nesfx-audio-repo\GPT\projects\nes_superfx"
if not exist "%GSU_ROOT%\runtime_sky\Mesen.exe" (
  python "%GSU_ROOT%\tools\setup_mode7_runtime.py" --core "%~dp0pc\MesenCore.dll" --mesen-dir "%GSU_ROOT%\runtime_mode7" --out "%GSU_ROOT%\runtime_sky"
  if errorlevel 1 exit /b 1
)
python "%GSU_ROOT%\tools\launch.py" --mapper n8pro-racing-gsu --runtime "%GSU_ROOT%\runtime_sky" --gsu-mhz 25 "%~dp0pc\GSU_MMC5Racing3D_v005_sky_r003.nes"
if errorlevel 1 pause
