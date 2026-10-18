@echo off
setlocal
set "GSU_ROOT=%~dp0..\..\..\.tmp\nesfx-audio-repo\GPT\projects\nes_superfx"
python "%GSU_ROOT%\tools\launch.py" --mapper n8pro-racing-gsu --runtime "%GSU_ROOT%\runtime_mode7" --gsu-mhz 25 "%~dp0pc\GSU_MMC5Racing3D_v005_opt_r002.nes"
if errorlevel 1 pause
