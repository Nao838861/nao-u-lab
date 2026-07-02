#!/bin/bash
set -e
cd "$(dirname "$0")"
python3 chrgen.py

build() {  # out_name  source.s  [defines...]
    name="$1"; src="$2"; shift 2
    ca65 "$src" "$@" -o "$name.o"
    ld65 -C nes.cfg "$name.o" -o "$name.nes"
    echo "  built $name.nes"
}

build repro       repro.s                    # ExRAM extended-attribute display test
build sanity      repro.s -D SANITY=1        # basic-rendering sanity (solid white)
build wram        wram_test.s                # WRAM sequential write-integrity
build wram_stride wram_stride.s              # WRAM strided (draw-pattern) writes
build combo       combo.s                    # WRAM writes during ext-attr rendering
build exram       exram_test.s               # ExRAM sequential writes (render off)
build xfer        xfer_test.s                # WRAM read <-> ExRAM write alternating copy

# --- 連番シリーズ (08以降) ---
build 08_exram_midframe     08_exram_midframe.s      # ExRAM writes in mid-frame black band
build 09_wram_bankflip      09_wram_bankflip.s       # $5113 bank alias / flip integrity
build 11_wram_bankflip_nes2 09_wram_bankflip.s -D NES2=1  # same, NES2.0 header w/ 32KB NVRAM

# 10 は 32KB マルチバンク構成 (nes32.cfg)
ca65 10_bankexec_xfer.s -o 10_bankexec_xfer.o
ld65 -C nes32.cfg 10_bankexec_xfer.o -o 10_bankexec_xfer.nes
echo "  built 10_bankexec_xfer.nes"

echo "done."
