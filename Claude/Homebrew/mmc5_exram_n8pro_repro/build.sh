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

build repro                       # ExRAM extended-attribute test
build sanity      -D SANITY=1     # basic-rendering sanity check (solid white screen)

# WRAM ($6000-$67FF) write-integrity test (self-verifying: green=all OK, red=any mismatch)
ca65 wram_test.s -o wram.o
ld65 -C nes.cfg wram.o -o wram.nes
echo "  built wram.nes"

echo "done:"
ls -1 repro.nes sanity.nes wram.nes
