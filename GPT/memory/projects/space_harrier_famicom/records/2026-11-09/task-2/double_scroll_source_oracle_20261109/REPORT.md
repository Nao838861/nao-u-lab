# Double-scroll source oracle, 2026-11-09

## Result

Original SFC tile, map and RGB555 palette bytes are preserved exactly. The complete two-layer NES-quantized payload is `scenery_quantized_15rows.bin`, 3840 bytes, SHA256 `e9e7e138ab0bb46704b4c34f54735a26fa7dec5b1b4e0afc1fe920fd185fff8f`.

This is source and pure compositor verification, not FPGA timing, fit or physical-console verification. No original ROM, RBF, source, USB, SD or console was changed.

## Layout and alpha

Each of 15 source rows y112 through126 contains far128 bytes then near128 bytes. Four pixels per byte, highest two bits first. Offset is `(mapY-112)*256 + (near ?128:0) + ((sourceX&511)>>2)`; shift is `6-2*(sourceX&3)`. Separate 1920-byte layer files and a planar far-then-near 3840-byte file are included for integration choices.

Packed3 is transparent. Packed0 is opaque dark green, not transparent. A near pixel other than3 overrides far. Native source code0 is transparent, independent of its palette word. Near has 1030 dark0 pixels and1434 light2 pixels, with5216 transparent3 pixels. Far has1916 dark0,3180 gray1 and2584 transparent3. The original SFC full512x256 maps have no opaque pixels outside the retained15 rows. Near occupies rows118..126, far113..126; far120..126 is opaque across all512 columns.

Quantization retains the established r9 scheme, not original SFC RGB: far native code1 or RGB5550x51ad maps0, remaining opaque far maps1. Near minimum RGB5 component>=25 maps1, otherwise green<=21 maps0, remaining near maps2. Actual forest uses no gray1. Palette slots0/1/2 are NES09/10/29; sky slot3 is14. Palette2 slot3 is16(red); palette3 slot3 is0f(black). Slot3 replacement is allowed only if no uncovered sky remains. Foreground classes1/5 remain gray,2/6 remain light green. Eye4/warm7 can use red only when uncovered sky does not conflict; otherwise dark0. Plain black3 uses black only in palette3, otherwise dark0. Uncovered background colors never change.

## Scroll, vertical clipping and camera

Both independent unsigned16 accumulators are sampled with `acc>>7`, masked to9-bit x. Sample x is `(screenX + (acc>>7)) &511`; do not use a shared accumulator or average already-shifted coordinates. SFC updates far by `(player_x-128)*2` and near by `(player_x-128)*4` each60Hz field. NES core signed player_x updates far by*4 and near by*8 at30Hz; queued midpoint fields preserve this relation. Positive deltas move artwork left because the sampled source coordinate increases.

The original SFC VOFS is21-camera. `mapY=physicalY+21-camera`, with physicalY>=106+camera owned by ground. NES mapper physicalY=mapperY+31, so source rows112..126 appear at mapper rows60+camera..74+camera. Source127 is excluded. Current r10 camera is19+2*ground_offset, range19..83 for ground offsets0..32, not the stale header comment's2*ground_offset. Midpoint camera is previous ground_offset+current ground_offset+19; the matching pitch identity is camera=23-pitch_sin/2. Standalone tests also cover all camera values0..83. Hardware clamp83 must happen before row selection.

Midpoint accumulators use previous + signed16(current-previous)/2, preserving wrap and independent direction. Exact6502 arithmetic shift floors negative odd deltas; C++ helper truncates toward zero for those out-of-normal cases. Normal gameplay deltas are multiples4/8 and agree. Snap uses current state unchanged. State must remain immutable across accepted job, display bank and presentation phase; live writes must not change an in-flight field.

## Important actual-played r10 finding

The protected BodySpan2 ROM remains SHA256123f93114a7aa1525ba20828a46be8278e037524b504e5132755c5767ee24415. Its embedded compact scenery has MSHS version0 and an all-zero256-byte near map. Restoring near data alone does not re-enable the emulator decoder; a candidate using that decoder also needs original version1. The complete original3920-byte source is included as `scenery_source.bin`; do not change the protected actual-played ROM. The original RBF remains SHA256d344be0ba48399f212933526c9d4a2b1ae3ae2566be81006199fd7d87c192974.

## Independent tests

- Exact original full SFC maps:262144 pixels, all opaque pixels retained; compact tile/map/palette bytes exact.
- Packed pixels:15360.
- All independent far/near combinations on every retained row:3932160.
- All camera0..83, physicalY0..239 and512 independent shift pairs:10321920.
- Source decoder/compositor comparison:5160960 blocks.
- Deterministic JSONL foreground/wrap/row/camera vectors:19584 blocks, compared against the original C++ decoder/compositor.
- Independent pixel-first foreground oracle:500000 random blocks.
- Wrap-aware midpoint and snap:720896 pairs.
- Ground-offset midpoint/pitch identity:1089 pairs.

`oracle.py` exposes source and packed sampling, midpoint, scene_row and fetch_block. JSONL vectors with scene_row=null mean the scenery sampler's transparent-sky result, not permission to replace baseline ground rows. Their purpose is to test clipping; integrated code must retain baseline rendering outside scene rows.

Run: `python generate_payload.py`, `python oracle.py`, `python run_cpp_tests.py`, `python verify_source_coverage.py`. C++ compiles with the already-installed MSVC toolchain and the original r9 headers. Scripts write only this oracle folder.

## Primary source locations

Original SFC: `[REDACTED_WIN_PATH] `ground.s`113..118 is far>>7; `cpu.s`431..436 is near>>7; `frame.s`170..195 updates separate accumulators; `ground.s`49..58 computes VOFS; `assets/scenery.inc` defines21. `tools/verify_game_display.py` confirms near before far, near transparent0 and ground start106+camera. Original raw assets are `assets/ppu.bin` and `assets/scenery_palette.bin`.

Current NES camera and queues: `mountains_r10_experiment_20261109/combined_rom/src/cpu.s`, prepare_scenery_pair. NES update source: `combined_rom/reference/nes_support/src/draw_ground_bgfar_batch.s`. Quantization/compositor: `MonoSH_r9_Playable_MidDrums_QuietShot_20261109/core/Core/NES/Mappers/Homebrew/NesFx/Mode7Ground.hpp`110..127, `SceneryLayers.hpp`. Exact source hashes and preservation checks are in JSON manifests.
