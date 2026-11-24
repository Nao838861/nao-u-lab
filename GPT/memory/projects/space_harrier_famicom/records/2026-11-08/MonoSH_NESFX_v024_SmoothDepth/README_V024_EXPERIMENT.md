# v024 smooth-depth experiment (not release accepted)

Based on frozen v021, independent of v023 horizon/row changes. Build with `python -X utf8 build.py`.

Adapts MonoSH_FX2 tools/smooth_depth.py monotone cubic Hermite compile-time dimensions, sampling its 111-point curve at even depths to match original NES 56-depth state. Six families: Tree0, Bom0, Bush0, Bush1, FlyStone, Em0. All dimensions and UV increments are precomputed; runtime only dispatches and reads tables. Original center and bottom are retained. Original game/collision sources are untouched. The source generator is copied as tools/sfc_smooth_depth_reference.py with its original contents; provenance is reference/MonoSH_FX2 in v001, RESULTS_20261008_SMOOTH_DEPTH.md. Unlike SFC, new dimensions do NOT feed collision rectangles.

Final candidate SHA256: cffc58d0acaa7392c2c0257c898c5451f8c728da7f91a94f4ac8d62a5df0d0d7.

Verified 6057 actual source geometry records against generated width/height tables: zero errors. Tree unique dimensions 16 to49 and longest same-size depth run7 to2; flying stone15 to41 and13 to6. These are depth steps, not delivered frame measurements.

Strict 1201 boundary comparison: original OAM identical and150 of151 state fields identical. `_frame_counter` differs at19 boundaries; input edge latches differ at8. Hence complete unchanged behavior is NOT established. Input phase differences arise after extra rendering time crosses NMI. Sources and collision are unchanged, but that alone does not prove timing identity.

Same900-scene schedule spans1799 PPU fields in both versions. v021:1796 presentations,2 queue drops,3 starvations,40 late fields,1 suppressed scene. v024:1795 presentations,4 drops,4 starvations,71 late fields,2 suppressed scenes. These are in-emulator counters, not a claim of hardware speed or perfect60fps.

Actual emulator MP4: results/smooth_audit_hermite/v024_smooth_depth_experiment.mp4. No ROM/archive uploaded. Video uses original SELECT invincibility, same scene-index control schedule as the baseline audit. Frame at7seconds visually inspected. It retains v021 horizon/ground, not v023.

Do not merge as a completed motion cure. Remaining work: avoid input/NMI phase shifts; combine horizon adjustment only after timing checks; resolve original projected-position quantization/tree-top rounding; inspect and address EM1, projectiles and boss separately. The SFC report specifically warns that independent tree-height rounding can reverse treetop motion. MSX fix was not independently inspected in this trial. No hardware, all-stage or all-input tests.

Final measurements: results/SMOOTH_DEPTH_REPORT.json; strict traces: results/core_identity_hermite_1201; source and per-scene geometry: results/smooth_audit_hermite. Earlier run-center linear trial results are retained separately under smooth_audit and core_identity_1201 and are not the final candidate.
