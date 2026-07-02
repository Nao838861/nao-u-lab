#!/bin/bash
set -e
cd "$(dirname "$0")"
python3 chrgen.py
ca65 repro.s -o repro.o
ld65 -C nes.cfg repro.o -o repro.nes
echo "built: $(pwd)/repro.nes"
ls -l repro.nes
