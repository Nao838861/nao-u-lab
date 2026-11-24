# EM1 opening animation repair

The unchanged original NES core selects opening indices 13..27: five poses at
three depths. The r9 replacement renderer mapped all 15 to slot 0 / SFC source
32, so only the first opening image was visible. Images 33..36 were never used.

## Outputs

- build/MonoSH_r10_EM1_Open_Animation_MESEN.nes
- build/MonoSH_r10_EM1_Open_Animation_NO_SCENERY_UNTESTED.nes

Both ROMs are 1,179,664 bytes. The hardware-labelled file retains r9's one-byte
scenery-disable setting. No USB, SD, FPGA programming, or running hardware was
accessed. Hardware operation is not verified. Mountains are a separate patch.

## Implementation

- All five SFC opening images (32..36) are present, nearest-neighbor at the
  existing maximum 60-pixel detail scale. Original pose 1 texels are preserved.
- All 27,782 existing non-EM1 decoded texels are preserved exactly.
- The existing 8KiB GSU RAM and unchanged 512B GSU program are retained. The
  atlas reserves 801B at GSU $9C9F..$9FBF for one opening frame, with the original
  64B decoder row cache at $9FC0..$9FFF.
- Immutable packet addresses $7F00..$7F04 carry the selected pose. At the
  existing GSU-idle upload boundary, the CPU translates those addresses and
  writes a changed frame before publishing the packet. It never changes a
  running GSU's atlas. PRG banks 120..125 hold the selector and immediate stores.
- The original three EM1 enemies have synchronized animation. The validation
  checks this invariant and records a zero conflict count.
- New source 33..36 retain their reconstructed dark pupils. No unverified red
  pupil mask was invented. The existing approved pose-1 red texels are unchanged.

## Verification

- python build.py completed. Rebuilding is self-contained, with a frozen r9
  atlas snapshot under reference/em1_baseline. Requires the existing [REDACTED_HOST_IDENTITY]
  cc65/Python/Pillow paths used by r9.
- results/em1_atlas_report.json: exact decoded-pixel preservation and frame data.
- results/em1_gameplay_02/RESULT.json: actual input-only dedicated-Mesen capture,
  2,504 fields, all 15 depth/pose combinations, 24 uploads, zero pose conflicts.
- results/em1_gameplay_02/near_pose1.png through near_pose5.png: actual PPU images.
- results/em1_gameplay_02/EM1_actual_gameplay.mp4: actual PPU video.
- results/em1_timing_comparison.json: baseline/fix deadline misses 6/4, late
  fields 178/221, queue starvations 11/17; both finish at logic tick 1257.
  These measurements are functional emulation only, not a 60fps claim.
- All original NES reference source files are byte-identical to r9.

## Integration

Changed source inputs: build.py, src/cpu.s, src/nes_render_tables.inc,
src/detail_addresses.inc, assets/detail_manifest.json,
assets/stage_atlas_runtime.bin. Added src/em1_select.inc,
src/em1_animation.inc, assets/em1_frames.bin, tools/restore_em1_frames.py,
tools/verify_em1_gameplay.py, and reference/em1_baseline/assets/*.

The mapper DLL/RTL, GSU code, native player/shot CHR, audio PRG banks and CHR
remain unchanged by this repair. The fixed CPU bank has limited space left;
keep further additions small or use an available bank.
