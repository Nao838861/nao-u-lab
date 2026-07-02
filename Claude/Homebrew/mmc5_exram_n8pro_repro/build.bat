@echo off
rem Windows build. Requires cc65 (ca65/ld65) and python in PATH.
cd /d "%~dp0"
python chrgen.py || goto :err
ca65 repro.s -o repro.o || goto :err
ld65 -C nes.cfg repro.o -o repro.nes || goto :err
echo   built repro.nes
ca65 repro.s -D SANITY=1 -o sanity.o || goto :err
ld65 -C nes.cfg sanity.o -o sanity.nes || goto :err
echo   built sanity.nes
dir repro.nes sanity.nes
goto :eof
:err
echo BUILD FAILED
exit /b 1
