#!/usr/bin/env python3
# CHR generator for the MMC5 ExRAM extended-attribute N8 Pro repro.
# 8 banks x 4KB = 32KB. Tile $00 of each 4KB bank = a solid 8x8 block
# whose color cycles white/red/green, so the extended-attribute background
# shows a diagonal grid of solid blocks. Solid tiles make any per-scanline
# CHR fetch dropout show up immediately as horizontal black lines.
BANKS = 8
BANK_SZ = 4096

def solid(c):
    p0 = 0xFF if (c & 1) else 0x00
    p1 = 0xFF if (c & 2) else 0x00
    return bytes([p0] * 8 + [p1] * 8)

data = bytearray(BANKS * BANK_SZ)
for b in range(BANKS):
    c = (b % 3) + 1            # 1=white 2=red 3=green
    data[b * BANK_SZ : b * BANK_SZ + 16] = solid(c)

# bank0 tile1 solid too, so the 8x16 sprite (tiles 0+1) is a full 16px block
data[16:32] = solid(1)

with open("chr.bin", "wb") as f:
    f.write(data)
print("chr.bin", len(data), "bytes")
