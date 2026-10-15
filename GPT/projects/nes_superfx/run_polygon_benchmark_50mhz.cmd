@echo off
cd /d "%~dp0"
python tools\launch.py --mapper n8pro-gsu-abi2 --gsu-mhz 50 --controller-a releases\GSU_PolygonBenchmark_A_v003.nes
if errorlevel 1 pause
