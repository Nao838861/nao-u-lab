@echo off
rem Windows build. Requires cc65 (ca65/ld65) and python in PATH.
cd /d "%~dp0"
python chrgen.py || goto :err

call :build repro                                  || goto :err
call :build repro_dense      -D DENSE=1            || goto :err
call :build repro_8x8        -D SPR8X8=1           || goto :err
call :build repro_8x8_dense  -D SPR8X8=1 -D DENSE=1 || goto :err
echo done
dir *.nes
goto :eof

:build
set NAME=%1
shift
ca65 repro.s %2 %3 %4 %5 -o %NAME%.o || exit /b 1
ld65 -C nes.cfg %NAME%.o -o %NAME%.nes || exit /b 1
echo   built %NAME%.nes
exit /b 0

:err
echo BUILD FAILED
exit /b 1
