@echo off
cd /d "%~dp0"
if "%~1"=="" (
  python tools\launch.py --mapper n8pro-gsu-abi2 --controller-a releases\GSU_CubeBenchmark_A_v002.nes
) else (
  python tools\launch_benchmark.py %*
)
if errorlevel 1 pause
