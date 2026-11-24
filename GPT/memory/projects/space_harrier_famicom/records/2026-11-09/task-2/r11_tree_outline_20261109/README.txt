Tree0 outline restoration (emulator only; no hardware use)

Original SFC-derived indexed Tree0 is 34x79. The adopted runtime nearest-neighbor version is 28x64.
Source palette bank2 roles: transparent0 / dark-green1 / green2 / brown3.
This experiment maps those source roles to runtime transparent0 / dark-green3 / light-green2 / gray1.
Only the original brown trunk becomes gray. The original dark boundary/shadow and green leaves remain intact.
The original outline is asymmetric shade, not a newly invented uniform perimeter stroke.

Why the outline disappeared:
2026-11-08 MonoSH_NESFX_v002_B/tools/apply_palette_b.py paints every opaque pixel in the lower trunk rectangle gray, including its adjacent shadow.
The later generate_all_detail_assets.py repeats that blanket material edit at 28x64.
The restore changes 50 pixels: gray to dark-green44, gray to green6. Gray trunk becomes47 pixels instead of97.

Preserved: geometry28x64, full transparency silhouette, all asset addresses, GSU509-byte code, other static asset texels, dynamic EM1 bytes, palette values0..3 only.
Atlas remains7168 bytes. Shared RLE pool2470->2493 bytes, static spare52->29 bytes. Extra work RAM0; ROM size growth0.

Validation:
255 synthetic Mesen GSU rendering cases agree byte-for-byte with the pinned independent native GSU model before and after.
All255 opacity/warm/eye side planes are identical before and after. All241 cases without Tree remain framebuffer-identical.
Tree maximum actual geometry68x160:134290->135548 clocks (+1258, +0.02516ms at50MHz).
This is a per-object synthetic timing measurement, not proof of full-game60fps. Hardware remains untested.

Main outputs:
visual/tree_outline_comparison.png: before/after comparison.
visual/tree_restored.png: transparent indexed-art preview.
candidate/stage_atlas_runtime.bin: adoption payload.
candidate/detail_manifest.json: updated compressed-pool accounting.
RESULT.json and results/RENDER_TEST.json: all checks.
tools/apply_outline.py INPUT.nes OUTPUT.nes: patch a separate ROM copy containing the adopted baseline atlas, changing only7168 bytes at file offset0xa0010.
roms/: separate outline-only CPU Supply Optimized candidate ROMs (not projection corrections).
