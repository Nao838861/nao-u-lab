@echo off
cd /d "%~dp0"
python tools\launch.py --mapper n8pro-gsu-abi2 --controller-a releases\GSU_PolygonBenchmark_A_v001.nes
if errorlevel 1 pause
