# v032 All Detail: source detail, projectile fix, explosion animation

Independent v031 ForestShade-derived experimental candidate. Original versions, SD and RBF were not overwritten. No ROM or source archive was uploaded. The separate v033 integration adds motion work; it is not included here.

## Artwork and behavior

Recovered details from preserved SFC original source images, not enlargement of the old32px thumbnails. Existing three-color classification and approved EM1 eye/chest and tree-trunk material rules are retained at corresponding source regions.

- Tree:14x32 ->28x64.
- Open round enemy:30x32 ->56x60.
- Boss head:21x32 ->39x60; body32x22 ->64x43.
- Grass:32x17 ->56x30;32x15 ->64x30. Swarm enemy32x17 ->55x30.
- Flying stone32x24 ->native35x26; closed round enemy remains native14x15. These originals contain no further detail, so they were not enlarged and called new artwork.
- Explosion:32x24 single frame ->four56x42 frames. These are SFC5/39/40/41, representing the same four masters used by MSX. MSX animation order0,1,2,3,2,1, eight60Hz fields per phase, is driven by display-only age. Original NES lifetimes, trajectories, collision geometry and screen dimensions remain unchanged.
- MSX's missing500x388 extra master canvases could not be recovered. SFC exports were cropped individually; later frames are normalized to56x42 for a fixed display envelope, mildly stretching their aspect ratio. This is not pixel-exact MSX canvas placement.
- Enemy projectile source7 contained dark blue luminance69, incorrectly mapped to gray by the prior threshold65. Projectile-only two-tone classification restores212 dark pixels in its32x32 pose. Other three rotating poses and boss bullets are pixel-identical. Rotation, canvas, mirror center, size and trajectories are unchanged.
- Native NES PPU player, player shots and shadow use original full PPU graphics and poses, not the low-resolution GSU thumbnails. All131072CHR bytes are unchanged.
- v031 palette, source forest shadows, CPU scheduler and runtime DLL are retained.

## Resources

GSU work RAM remains8192bytes:1024 commands/scratch plus7168 texture area. Lossless per-row pixel RLE and compact packed textures use7093bytes; the64-byte decoded row cache occupies$9FC0-$9FFF, leaving11bytes spare. All RLE rows are at most64 pixels and reproduce the recorded packed pixel hashes. Row reuse avoids decoding repeated source rows. Pixel samplers are specialized for byte-decoded and packed data.

GSU executable code459bytes fits the existing512-byte cache. Atlas startup transfer remains7168bytes. No per-frame texture upload was added. ROM remains1,179,664bytes. Explosion age/compaction markers add32bytes inside already allocated CPU work RAM; physical RAM capacity does not grow. Current render RAM ends$7A35, queue starts$7A36 and ends$7C5C, disjoint from original game RAM.

Original source files remain unchanged. The generated camera-compaction routine includes a register-preserving display-age copy. Two original fixed-bank call-address low bytes relocate accordingly; executable gameplay bytes are not globally claimed byte-identical. This hook passed544 independent compaction cases with identical game RAM/register outcomes.

## Measured performance

Same controller schedule per comparison, configured50MHz dedicated Mesen functional model, not FPGA/hardware speed. Rendering load can cause timing divergence, so these are matched-controller runs rather than identical-command replays.

- Stage900 scenes / about29.93s: v03160.01fps ->v03259.97fps;1796 ->1795 presentations; queue drops2 ->4. GSU mean3.282 ->4.348ms, p957.751 ->10.468ms, maximum9.350 ->14.461ms.
- Boss600 scenes / about19.94s: v03158.66fps ->v03254.10fps;1170 ->1079 presentations; drops28 ->120. GSU mean4.675 ->7.410ms, p9511.437 ->16.688ms, maximum15.093 ->24.050ms.

The boss case still has a measurable performance cost. Do not call load unchanged or promise60fps everywhere.

## Final verification

- Rebuild SHA256 identical:ec0684db4b20c928a5bb73fc026e3b44e112ec997ff6dbe74ba7f9a2134467c1.
-215 actual-emulator GSU tests match independent pixel sampling across the complete framebuffer, covering all18 assets, signed bullet UV, fractional steps, arbitrary pointers, page crossings,255/256/257 step boundaries and original/midpoint boss dimensions.
- Independent hybrid decode matches every asset's packed hash; row-pointer alignment, source limits and row-cache separation verified.
-1201 fixed-NMI-input pre-core_tick boundaries: all150 gameplay fields, original256-byte OAM and latched input are identical, including boss states0/1/2. Seven boundaries differ only in unused wallclock _frame_counter. Strict151-field/timing test therefore reports failure; full timing identity is not claimed.
-3213 actual6502 effect-function calls validate16 slots over96 updates, reset/freeze behavior, the MSX sequence, and544 compaction cases.
- Actual stage telemetry contains all four explosion texture IDs5/14/15/16. Corrected bullet pose25 has only212 gray-to-dark changes; all other projectile pixels and transparency are unchanged.
- Final28-second comparison video is actual controller-only gameplay (original SELECT invincibility and START boss shortcut), fully decoded with audio, max audio -21.1dB. Frames at1.6,7,17 and24seconds were visually inspected.

Final reports:results/final_validation_v032.json, final_core_identity_opt/comparison.json, detail_unit/oracle.json, effects_cpu_tests.json, bullet_final_regression.json, video_validation.json.
Earlier exploratory logs/captures are superseded and are not final verification.

## Deliverables and reproduction

- results/v032_high_detail_effects_comparison.mp4: actual v031/v032 comparison,20s stage+8s boss, saved to Space.
- results/v032_source_changes.patch: source differences. The project folder includes required preserved original images; this text patch alone does not transfer those images.
- build/MonoSH_NESFX_v032_AllDetail_UNTESTED.nes: local experimental candidate only.
- Rebuild from this directory with python build.py, using the existing CC65_BIN toolchain and Pillow.

No full-stage clear, FPGA, flashcart, SD/RBF or hardware timing validation has been performed.
