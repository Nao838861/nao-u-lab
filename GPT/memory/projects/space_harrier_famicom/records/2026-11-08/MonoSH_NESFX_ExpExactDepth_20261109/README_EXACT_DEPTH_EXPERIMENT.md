# Exact-depth display-only candidate

This is an independent experiment based on the frozen 112-row EM0 candidate, not the latest high-detail/palette/effects release. Original ROMs, SD card and RBF files were not changed. Emulator evidence only; hardware/FPGA untested.

## Result
- Preserve all original NES 8 drawing buckets and traversal order. The 56 background depth values are not 56 bucket heads.
- EM0 dimensions now index all original quarter-depth values 0..223 directly. The SFC-derived monotone Hermite model is evaluated at quarter-depth; no additional precision is invented upstream. Rows 221..223 guard the far endpoint at 220 rather than extrapolating it.
- Preserve the original full-pixel enemy_bot value in display: bottom = enemy_bot - 29. The previous (bot-31)>>1 path lost a pixel on even source bottoms.
- Generalized midpoint bottom rounding uses both top-sum and height-sum parity. Birth, removal, slot reuse, camera/world reset fences remain intact. X centers retain the original integer NES path.
- Reuse existing exact per-dimension UV tables instead of expanding four extra depth-indexed tables. No per-object multiply/divide, extra RAM/ZP or bank switch.
- Fixed smooth data: 2016 -> 1904 bytes. Renderer: 7718 -> 7676 bytes. Total linked occupation decreases 154 bytes; file remains 1179664 bytes. Fixed gap before vectors 124 bytes; render+ground gap 356 bytes.

## Validation
900 matched-input producer scenes:
- Mean producer cycles: half-depth 29677.23 -> exact-depth 29699.30 (+0.074%). Frozen v028 was 29748.76.
- p95: 41988 -> 42479; max: 51469 -> 51665. Late fields: 46 -> 50. These include scheduler, NMI, yields and uploads; not an isolated lookup benchmark or universal speed guarantee.
- Both: 1799 PPU fields, 1796 presentations, drop 2, starvation 3, approximately 59.999 fps at 60.0988 fields/sec in this functional emulator.
- All 6491 current commands and 6490 midpoint commands match independent clipping/UV/anchor formulas, including lifetime fences and rotated projectiles.
- 2029 EM0 raw rectangles verified. 308 records gained a different dimension from the previously discarded Z low bit; 1652 records recovered the source Y low bit.
- 4598 comparable non-EM0 raw rectangles unchanged; draw order matched in all 898 comparable non-suppressed scenes. Candidate scene 650 and half-depth scene 649 have stale suppressed raw data and are not paired.
- Reference 100 files and generated NES core 51 files are byte-identical to the half-depth baseline. Linked gameplay banks can contain relocated render-call addresses; whole-ROM/bank identity is not claimed.

Fixed physical-NMI input comparison against frozen v028, 1201 pre-core_tick boundaries:
- All 151 fields / 850 bytes match, including frame_counter.
- Original 256-byte OAM, latched input, controller NMI field index and logic/draw/frame boundary counters all match.
- Strict comparison passes (exit 0). Boss states 0/1/2 included. The earlier half-depth candidate's one-boundary timing mismatch does not occur in this run.
- This is not a proof for every stage, input sequence or hardware configuration.

## Video
results/exact_depth_comparison.mp4: left 112-row half-depth, right 224-row exact source Z and original Y. Candidate audio. Each native recording has 1199 decoded PPU frames; 596 frames differ, maximum 1101 native pixels at frame 540. Frame 540 and 660 were visually inspected: differences are subtle EM0 dimensions/vertical anchors; unaffected scenery/player align. Old v026 HUD and purple/green palette are inherited, not the current visual release.

## Integration
Run tools/apply_exact_depth_patch.py <NEW independent project> --dry-run first. It only edits four source files, never builds or writes a ROM. Then run without --dry-run only in the intended new candidate. The generator must run immediately after generate_direct_depth_v027.py (replacing generate_fine_depth.py if present), before assembly. It honors detail_manifest EM0 extent overrides and asserts shortened high-byte UV-table bounds. A dry-run against v032_AllDetail passed; v032 was NOT modified by this work.

The effects generator may remain before the exact-depth postprocessor. Its explosion-selection call is preserved. Do not copy this experiment's old artwork, whole render tables or build configuration over a high-detail candidate. Re-run full integrated state, timing, video and sampler tests after combining changes.

## Files and repeatability
- ROM: build/MonoSH_NESFX_ExpExactDepth_20261109_UNTESTED.nes
- ROM SHA256: 7968eab7081a0752de52e4cdbc9ff92ed4a761643758dcef4531f7274d3c138d
- DLL SHA256: c39bca0f76b04a7f0d37b4de1e385b74e1b90ca743a0105f2b290733fe3fb79d
- results/exact_depth_validation.json
- results/core_identity_exact_depth/comparison.json
- results/exact_depth_pixels.json
- results/exact_depth_source.patch
- exact_depth_integration_patch.zip

Build in a fresh copy or give its output a new filename; do not overwrite an existing ROM. Run tools/profile_exact_oracle.py <candidate folder name> then tools/validate_exact_depth.py for the captured-command check. The validator is tied to this baseline's assets and should be adapted to integrated atlas metadata. Fixed-field comparison: tools/compare_fine_depth.py --candidate-rom <new ROM> --candidate-labels <new labels> --expected-sha <SHA> --boundaries 1201 --out <new directory>. Capture scripts use the existing dedicated Mesen DLL and controller inputs only, not emulator RAM writes.

## Remaining scope
Background objects only retain integer source Z, so an enlarged lookup cannot recover a missing fraction. They already have continuous dimension tables and temporal midpoint geometry. General background subpixel projection or new motion models require additional display-only work and budget tests; the previous v022 broad precision experiment increased drops and failed gameplay/input equivalence. This candidate deliberately avoids that regression. EM1/boss geometry, player/OAM and other families are unchanged.
