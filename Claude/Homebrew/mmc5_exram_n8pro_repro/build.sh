#!/bin/bash
set -e
cd "$(dirname "$0")"
python3 chrgen.py

build() {  # name  defines...
    name="$1"; shift
    ca65 repro.s "$@" -o "$name.o"
    ld65 -C nes.cfg "$name.o" -o "$name.nes"
    echo "  built $name.nes"
}

# default: 8x16 sprites, 8 per scanline (the primary repro)
build repro
# variants for "next a hand" if the primary doesn't repro on hardware
build repro_dense       -D DENSE=1               # 8x16, >8 sprites/line (overflow)
build repro_8x8         -D SPR8X8=1              # 8x8 sprites, 8/line
build repro_8x8_dense   -D SPR8X8=1 -D DENSE=1   # 8x8 sprites, overflow

echo "done:"
ls -1 *.nes
