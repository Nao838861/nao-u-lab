@echo off
setlocal
set "GSU_ROOT=%~dp0..\..\..\.tmp\nesfx-audio-repo\GPT\projects\nes_superfx"
python "%GSU_ROOT%\tools\setup_mode7_runtime.py" --core "%~dp0pc\MesenCore.dll" --mesen-dir "%GSU_ROOT%\runtime_sky" --out "%GSU_ROOT%\runtime_r004"
if errorlevel 1 exit /b 1
python "%GSU_ROOT%\tools\launch.py" --mapper n8pro-racing-gsu --runtime "%GSU_ROOT%\runtime_r004" --gsu-mhz 25 "%~dp0pc\GSU_MMC5Racing3D_v005_opt_r004.nes"
if errorlevel 1 pause
