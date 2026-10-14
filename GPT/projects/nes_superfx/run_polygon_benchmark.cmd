@echo off
cd /d "%~dp0"
python tools\launch.py --mapper n8pro-gsu-abi2 --controller-a releases\GSU_PolygonBenchmark_A_v002.nes
if errorlevel 1 pause
