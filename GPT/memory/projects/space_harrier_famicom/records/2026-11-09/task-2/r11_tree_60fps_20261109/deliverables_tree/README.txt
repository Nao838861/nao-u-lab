Space Harrier r11: exact tree RLE12 optimization candidate

Status: dedicated matching r11 emulator verified. Hardware UNTESTED. Do not copy to SD/USB or flash hardware as part of this task. Existing r11 RBF is unchanged.

Main result, identical input and pixels at simulated 50MHz:
- Nearest tree 68x160: 3.73846ms -> 2.68580ms, 28.16% faster.
- Boss body 80x54: 1.44152ms -> 1.05040ms, 27.13% faster.
- RLE enemy bullet phase0 60x62: 1.48400ms -> 0.84424ms.
- Packed boss face 80x116 remains 3.50884ms. This path does not improve.

How it works:
- Tree source texels are losslessly converted from packed2bpp to existing 3bit-color RLE runs.
- Positive-U RLE rendering consumes runs directly rather than expanding a whole row then sampling it. Signed/clipped/reversed fallback remains exact.
- Absolute RLE row pointers use 12bits because all token addresses are in $9000-$9fff. Two row pointers share 3bytes (lo0,lo1,paired high nibbles).
- Global token overlap packing makes the larger tree source fit with no extra RAM. All five dynamic EM1 pose tables and upload data are converted too.
- Original warm/red/opacity mode setup is retained. No reduced detail, LOD, sprites, geometry, game physics, collision, timing policy, near/far scenery scroll or bottom-background changes.

Memory and resources:
- GSU instructions:509/512bytes, compared with507bytes in r11 BS2. Same reserved512B cache,3B spare.
- Atlas+scratch allocation remains7168bytes, with52B static spare at $9c6b-$9c9e.
- Dynamic EM1 slot remains $9c9f-$9fbf,801bytes. Row cache stays $9fc0-$9fff,64bytes.
- CPU RAM, FPGA logic/BRAM allocation, ROM capacity and ROM file length do not grow. No RTL/RBF changes.
- All CHR bytes are identical to r11, including dual-scroll scenery and native PPU graphics. All program bytes outside declared GSU/data/upload ranges are preserved.

Verification:
- 325/325 dedicated-emulator GSU color cases exact:255 main plus14 per EM1 pose, including clipping/reflection/fractional UV.
- 326/326 pinned native GSU color and6144B red/warm/opacity side planes exact, including56 mixed overlapping commands and all EM1 poses.
- Additional528/528 native tree stress cases exact:all widths1..68 with4reflections plus256 valid randomized UV cases.
- Same3000field controller-only stage run:2986 presents,1500 logic ticks,0 deadline misses/status faults/EM1 conflicts. Late fields260, queue drops14, so NOT steady60fps.
- GSU stage mean2.918754ms, p955.75716ms,max8.90840ms. Paired stage r11 baseline:mean4.121428ms,p958.38934ms,max12.16524ms. Presents2986 and drops14 were unchanged; late264->260. Paired boss:mean7.226583->4.544080ms,p9512.29038->8.95254,max15.53606->11.74116. Presents2883->2988, deadline misses95->0, queue drops116->10, late376->373. These are fixed3000field tests only.
- Functional/emulated timing is not physical FPGA validation. Full-game and sustained60fps are not claimed.

Limits and alternatives:
- A simple tree RLE replacement would need206B extra atlas RAM. Optimal unchanged-token overlap alone still needs126B. Compressed row pointers recover enough space, leaving52B.
- All token pointers must stay inside $9000-$9fff; this is a build-time invariant and must be checked after future asset edits.
- Pre-scaling all tree widths1..68 fits spare ROM (~39.5KiB) but not current GSU RAM, and there is no connected GSU ROM byte-read path. Per-image CPU staging can cost several ms, so it is not a free speedup.
- The candidate ROM must be used as a whole:GSU,atlas,address tables and EM1 upload data are a matching set. Mixing pieces with the old atlas is invalid.

ROM identities:
- MonoSH_r11_TreeRLE12_HARDWARE_UNTESTED.nes: acf0c3da611823a8df9268ec3609330909ceb18034b512294ab13617d923e6e9
- MonoSH_r11_TreeRLE12_MESEN_ONLY.nes: d70d5b7a2a6ea79c3084d16b47328f2d662439e3de2da3fe4fad2ce8ae2901cc

Rebuild the exact ROMs: run python rebuild.py. Requires Python3 and cc65 ca65/ld65; set CC65_BIN if not at the original Windows installation path. Inputs are included. The rebuild asserts exact original ROM identity and assembled GSU byte identity before patching. Output is written only under rebuilt/.

CPU pose upload stored bytes shrink by27..30B. Measured instruction costs drop160..184 CPU cycles/upload. Trigger policy and reserved801B slot are unchanged. Stage selected player/boss core fields matched in all1500 sampled snapshots. Boss endpoint logic counter differed by one tick, within the existing sampled one-tick scheduling variation, so full-game equivalence is not asserted.
