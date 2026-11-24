# v011 CPU clipping qualification

ROM: `7b00cf62569c1d1dfebdc24c4c4e57dea990ab9ccb2c21bc78e76d0e6d382e40`.

The original game remains30.049 Hz. Midpoint/current presentation packets target the60.098 Hz NTSC field rate. Dedicated-emulator timing only; no real-time desktop or physical FPGA throughput claim.

## Changes

- Left/top clipping uses exact16-bit modular skip-times-step arithmetic instead of one iteration per clipped pixel. Fully clipped rectangles are rejected immediately. Skips1–3 keep the short loop.
- The OAM pair copy uses absolute addresses for the selected free pair, saving about696 CPU cycles per original draw.
- GSU code, atlas, dedicated DLL and all35 original reference files are unchanged.

## Correctness

-902,510 independent oracle cases, including445,550 direct v010 comparisons: PASS.
-302 cases per version executed in Mesen, including exact cycle agreement with the independent runner: PASS.
-692 current callback cases per version and32 midpoint scenes per version: PASS.
-12 native OAM cases and228 packet-copy kernels: PASS.
-1201 original-game update boundaries over40 seconds, with A and horizontal input and no START: original151 fields/850 bytes, native OAM256 bytes, input and logic/draw/frame counters identical to frozen v009.
-1200 native video frames under the fixed stage/boss input schedule have byte-identical playfield pixels to v010. Only the version HUD differs.

Clipping examples: fully visible285→285 cycles; left128 pixels5417→570; top160 pixels6542→592; left+top127 pixels10332→1019; fully left-offscreen10277→52. Maximum in the test set20365→1071. Small skips add12–14 cycles. Code+164 bytes, RAM+0.

## Timing

Fixed20-second stage/boss video:1200 fields,1200 presentation commits,1199 intervals all one field. Present60.09849/s; logic30.04924/s; drops, starvation, deadline misses and late fields all0. Changed decoded images49.58125/s, a separate content-dependent measure.

Extended40-second normal-stage workload:2398 commits/2400 fields, present60.04840/s, logic30.04924/s. Two two-field gaps remain; queue drops2, starvation2, late fields0, GSU deadline misses0. GSU maximum9.57888ms; request-to-copy maximum13.23017ms. This is a major improvement over v010's13 gaps/late100/drop12, but not yet an uninterrupted60Hz presentation result for this longer workload.

The remaining two start failures occur around test fields1737 and1997. Existing queued data can still miss its upload opportunity while CPU game work continues. v012 tests more cooperative upload opportunities without changing the game algorithm.

## Evidence

- `results/extended_stage_v011/summary.json`
- `results/capture_v011_cpuclip/metrics.json`
- `results/capture_v011_cpuclip/v010_pixel_comparison.json`
- `results/core_identity_stage_v009_v011_7b00cf62/comparison.json`
- `build/render_clip_test/result.json`
- `build/clip_regression/result.json`

The input uses no RAM writes, no SELECT invincibility and no START in the long stage run. It does not establish all-stage or all-input correctness. Actual framebuffer transfer contention remains unverified; the fixed2.949ms copy model is not a hardware guarantee.
