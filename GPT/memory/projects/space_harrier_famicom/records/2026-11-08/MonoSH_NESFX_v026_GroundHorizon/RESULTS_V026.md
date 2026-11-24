# v026 ground-horizon candidate

This branch preserves v021 object projection, native player/shot OAM, and original game logic. The ground plane and SFC scenery move down 19 pixels to meet the existing distant object root. Horizontal depth bands alternate between a full-width middle-green row and a bright/dark checker row. Original source assets are not changed.

## Geometry
- Ground analytic horizon: 123 + 2*g, all 33 source camera heights.
- Original far object root: 124 + 2*g.
- First ground-owned row after scenery: 125 + 2*g.
- Near checker reference stays at y204, approximately 51 pixels wide.
- Scenery camera is 19 + 2*g (range19..83), with midpoint interpolation retained.
- Isolated Mesen mapper clamp extended64 to83. This candidate requires its rebuilt dedicated DLL. No FPGA or hardware change was made or tested.
- render_adapter.s, interpolation.s, GSU code, sprite atlas, scenery assets, original NES/support sources and audio match v021.

## Rejected routes retained
- v023 moved display objects upward based on depth. Independent QA found active enemy slots read the wrong source depth.
- v025 fixed the source depth and1200 live geometry records matched expected correction, including274 active enemies and all33 heights. However shifting object geometry while native shots remained unchanged is an undesirable alignment risk, and top clipping increased. Do not use v023/v025 as final fixes.
- v026 instead changes the background to match native object coordinates. The first capture had a purple gap because the renderer still clamped scenery camera to64. The corrected DLL allows83. Earlier artifacts remain for traceability; only deliverable_final uses the rebuilt DLL.

## SFC smooth-depth trial
The separate v024_SmoothDepth branch uses MonoSH_FX2 tools/smooth_depth.py monotone cubic Hermite dimensions computed at build time. It is not merged here. Tree size variants16->49, longest unchanged depth interval7->2;6057 geometry records matched the generated tables. But900-scene queue drops increased2->4, and1201-boundary test had19 frame-counter and8 input-edge differences. Therefore the trial is NOT accepted as a complete motion fix. Original positions, EM1, boss and projectile dimensions still need work.

## MSX reference findings
MSX repairs combined final-output odd pixel sizes,111 depth steps,65 camera heights, frame-coherent page/scroll/SAT state, removal of artificial player bob and exact near projection beyond1.0. The current NESFX30Hz source state must remain intact, so these ideas belong in display-only state rather than copied gameplay timing changes.

Sources:
- https://github.com/[REDACTED_HOST_IDENTITY]/MonoSH_FX2/blob/cddff2f016775c4506a2423edb19911900c19a08/game/v001/RESULTS_20261008_SMOOTH_DEPTH.md
- https://github.com/[REDACTED_HOST_IDENTITY]/MSXSH/commit/7e6c0b4be85d91146b3d229e9565584272ab8df9
- https://github.com/[REDACTED_HOST_IDENTITY]/MSXSH/blob/c4b23c299fa5bcd8a96750f4861de0bd5b9ab1fa/tools/generate_projection_table.py#L17-L100
- https://github.com/[REDACTED_HOST_IDENTITY]/MSXSH/blob/c4b23c299fa5bcd8a96750f4861de0bd5b9ab1fa/tools/generate_mode3_assets.py#L494-L506
- https://github.com/[REDACTED_HOST_IDENTITY]/MSXSH/blob/c4b23c299fa5bcd8a96750f4861de0bd5b9ab1fa/src/monosh_runtime_fast.asm#L208-L231

## Acceptance limits
No perfect60fps, all-stage, all-input, hardware or FPGA claim. Final game-state, frame/logic/draw counters, OAM and input test reports are in results/core_identity_camera83. These compare both ROMs under the same rebuilt dedicated DLL. Video uses normal original SELECT invincibility and actual1800 PPU frames, with no synthetic gameplay frames. Check results/final_validation.json for final measured results.

