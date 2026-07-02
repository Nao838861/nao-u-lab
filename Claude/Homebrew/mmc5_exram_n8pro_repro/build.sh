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

build repro                       # ExRAM extended-attribute test (the real repro)
build sanity      -D SANITY=1     # basic-rendering sanity check (should be a solid white screen)

echo "done:"
ls -1 repro.nes sanity.nes
