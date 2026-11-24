# Fine-depth display-only experiment

Independent candidate based on frozen v028. Existing v027/v028 ROMs, SD card and RBF files were not changed. Not a release or FPGA/hardware validation.

## Finding
The NES gameplay model has 56 background depth values (0..55), but **8 drawing bucket heads**, indexed with Z >> 3. Its background update decrements integer bgobj_wz; no hidden half-step remains to recover. A larger lookup cannot recover discarded information. The separate SFC reference has 111 depth samples; packet_bucket.inc mentions 56 buckets in a comment, but its actual bucket_heads allocation is 512 bytes, 256 word heads. Do not treat that comment as the current implementation.

EM0 is different: enemy_wz actually retains quarter-NES-depth units 0..223. v028 discarded both low bits before its 56-entry dimensions/UV lookup. This experiment discards only one bit and uses 112 entries: 111 Hermite samples plus row111 equal to the far endpoint. This is half-depth precision, not all original quarter-depth precision. The guard row is needed: observed gameplay reaches223.

## Implementation and resource cost
- Same original 8-bucket ordering, priority, gameplay source, collisions, integer position projection, and input pipeline. No sorting change, stable original traversal preserved.
- EM0 width, height and four UV-step bytes use half-depth. Other five smooth object families retain56 entries.
- All six smooth handlers had four constant16-entry attribute tables. Replace these proven-constant tables with immediate loads and remove dead initial TAX. Remove one LSR only for EM0.
- Three112-byte EM0 arrays remain in fixed ROM; three use reclaimed space in the already mapped render bank. No new bank switch or runtime arithmetic.
- Extra RAM/ZP:0. Same allocation and addresses. Fixed smooth tables remain2016 bytes atF80E..FFED;12 bytes remain before vectors. Renderer code/data shrinks79 bytes, 1E75 to1E26; renderer+ground endsDEC5,314 bytes free toE000. ROM file size unchanged,1179664 bytes.
- Nominal setup saving10 cycles per affected non-EM0 object,12 for EM0, before indexed page-cross differences. Final whole-producer measurement is below.
- Original reference and generated gameplay sources are byte-identical. Linked gameplay bank bytes differ only where 22 JSR/JMP operands refer to relocated rendering labels (all changed bytes independently accounted for); do not claim whole-ROM or linked-bank byte identity.

## Validation
Candidate SHA256: a994a66545457c71ecff4e3c66c045f627ab1bdf98c14a400499d7d106cc1a10
Baseline SHA256: b63798cac9c7ba22a4169ea10aa4f8215480ffdccdb318d7b6b49583f5cce6db
Dedicated Mesen DLL SHA256: c39bca0f76b04a7f0d37b4de1e385b74e1b90ca743a0105f2b290733fe3fb79d

900 matched producer scenes, same inputs:
- Average producer cycles29748.76 ->29677.23 (-0.24%). p9542560 ->41988. Maximum51654 ->51469.
- Measured interval1799 PPU fields,1796 presentations, about59.999fps on this functional emulator, both versions. Queue drop2/starvation3 each. late_fields50 ->46.
- Includes scheduler, yields, NMI and uploads, not isolated lookup cycles. A tiny improvement is not a universal speed guarantee.
- Independent actual-command check:2023 EM0 raw rectangles matched half-depth width/height and retained center/bottom anchors.1909 visible EM0 commands matched independent clipping/UV math.709 raw rectangles changed. All4598 non-EM0 rectangles unchanged. Order matched across898 comparable scenes.
- Scenes649/650 explicitly excluded from paired raw validation because one renderer suppressed that scene and kept stale raw records; this is the same two-drop scheduler behavior shifted by a field, not a bucket sort change. These scenes remain included in performance counters.
- Observed EM0 source Z modulo4 counts760/343/577/343 in validated scenes.1263 of2023 values have nonzero low bits.

Fixed physical-NMI input test,1201 pre-core-tick boundaries including boss states0/1/2:
- All150 actual gameplay fields, original256-byte OAM, and latched inputs identical.
- 1 boundary (605) differs only in wallclock/frame_counter by1 field; strict full timing/state equality test exits1. Do not relabel it a full pass. No gameplay-field, OAM or input-latch differences were observed.
- Not full-stage/all-input equivalence or real hardware throughput.

## Image evidence
Two600-scene recordings,1199 actual PPU frames decoded each.515 frames differ; maximum1104 native pixels. Comparison MP4 uses candidate audio, with left v028 and right experiment. Inspected7s,11s and exact frame536 (near EM0 wave): expected small EM0 scale/detail differences; unaffected scenery and player aligned. HUD still saysv026 inherited from v028; the comparison overlay identifies the candidate.

Files:
- build/MonoSH_NESFX_ExpFineDepth_20261109_UNTESTED.nes
- results/fine_depth_comparison.mp4
- results/fine_depth_comparison_frame536.png
- results/fine_depth_validation.json
- results/core_identity_fine_depth/comparison.json
- results/pixel_difference_summary.json
- results/fine_depth_model.json

Rebuild: python -X utf8 build.py
Repeat profile: python -X utf8 tools/profile_fine_depth.py MonoSH_NESFX_ExpFineDepth_20261109
Fixed-field comparison: python -X utf8 tools/compare_fine_depth.py --expected-sha <candidate SHA256> --boundaries 1201 --out <new output directory>

## Recommendation
This separation is worthwhile where original precise Z exists. Keep coarse ordering and use finer Z for display lookup. Use this EM0-only prototype as a low-risk measured candidate. Background smoothing would require reconstructing display-only temporal midpoints or retaining higher-resolution Z upstream; simply doubling its current integer Z creates no new precision. Any future midpoint/depth model must preserve world/collision values and account for birth, slot compaction, removal, freeze and camera changes.
