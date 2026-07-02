@echo off
rem Windows build for the MMC5 ExRAM repro. Requires cc65 (ca65/ld65) and python in PATH.
cd /d "%~dp0"
python chrgen.py || goto :err
ca65 repro.s -o repro.o || goto :err
ld65 -C nes.cfg repro.o -o repro.nes || goto :err
echo built repro.nes
dir repro.nes
goto :eof
:err
echo BUILD FAILED
exit /b 1
