# Dual scenery and extended bottom: final verification

Date: 2026-11-09. All files are within this isolated oracle folder unless specified. The verification task changed no live ROM, DLL, source, RBF, USB, SD or physical console.

## Result

PASS for dedicated Mesen functional verification of the r11 dual-scroll ROM and 209-row background DLL. This is not physical hardware or integrated RTL pipeline signoff.

- ROM: MonoSH_r11_BS2_DualScroll_MESEN.nes, SHA256 71311f9f0055940ad43b677d507ce82291035b674c4b9a72444b7cfcdcc35d5d.
- Final DLL: bottom_background_r11_20261109/runtime/MesenCore.dll, SHA256 423f2f9be8fbfc42e13e885221e9cf74bc0a0de1908136e3b69547b476d69171.
- Old 192-row DLL control: SHA256 344a1cf465444bdd13192da5236c99e92a215641157f242722fdc65e0949bb93.
- Power-on RAM: AllZeros=1, verified by GetNesConfig readback for every final capture.

## Actual gameplay evidence

1. `mesen_final_zero_960/DualScroll_actual_gameplay.mp4`: actual 960-field Left/Right gameplay, captured from Mesen AVI and nearest-neighbor enlarged. Screenshots field_0030 through field_0950 are original-resolution actual AVI frames. No generated or composited gameplay images.
2. `mesen_final_zero_em1_2504/EM1_all15_poses_actual.mp4`: actual EM1 encounter excerpt from a neutral 2,504-field capture. `near_pose1.png` through `near_pose5.png` show its five near poses. Complete video and native AVI are retained beside the excerpt.
3. SELECT invokes only the ROM's original invincibility control. No RAM writes, save-state injection, geometry patches, or emulator source changes were used.

## Independent dual-scroll proof

The final 960 fields contain 480 midpoint and 480 current presentations. Every visible scenery state and simulation generation matches the corresponding queued record. Far and near accumulators are independent: near = 2 * far modulo 65536 for these inputs, with 422 distinct far pixel positions, 444 near positions, 423 relative offsets, and four wraps of each accumulator.

Actual image comparison against the original SFC scenery samples gives 3,264,908 correct two-layer matches out of 3,456,000 examined pixels; the same frames give 2,464,433 matches for incorrect shared scrolling and 2,440,163 for missing near scenery. On 872,492 pixels that distinguish the scroll models, 816,151 match the correct model versus 15,676 for shared scrolling. Foreground sprites legitimately occlude scenery, so this is not a claim of complete scene-pixel equivalence. Far-only upper rows separately favor the correct far accumulator: 1,103,684 matches versus 657,653 at the incorrect near rate.

Counter deltas in this 960-field run: present 960, logic 480, late fields 0, queue drops 0, deadline misses 0, starvation 0.

## Equal-state old/new comparison and bottom continuation

AVI frame n corresponds to telemetry n-1 (frame 0 uses the saved initial state). Both captures have identical displayed generation/phase, scenery and all 14 bytes of the queued ground camera across all 960 fields. This is stronger than field-number-only alignment.

The upper 223 physical rows are exactly equal for 960/960 frames: zero pixel mismatches. Thus the final DLL preserves all visible actor placement, pose, scenery, and upper ground pixels for this sequence.

Physical rows 223..239 correspond to ordinary projected ground rows 192..208. An independent D10Mode7Row::Make reference plus the ROM's original ground texture reproduces all 4,177,920 captured bottom pixels exactly: zero mismatched pixels or frames. This reference uses queued camera history keyed to visible simulation generation and midpoint/current phase, not the latest staged camera registers. The bottom has only the expected ground colors and changes in 678 adjacent frame pairs. The old HUD/separator does not remain in these rows.

## EM1 poses and timing limits

All 15 depth/pose combinations (three depths times five poses) are confirmed from actual gameplay telemetry. Pose conflicts: 0. Animation uploads: 24. The neutral 2,504-field run reports present 2,492, logic 1,252, late fields 228, queue drops 12, deadline misses 0, and starvation 12. These dense-scene stalls remain visible diagnostic limits. Do not characterize this as uninterrupted 60 fps.

## Original source and payload

See REPORT.md for detailed sampling, priority, palette and source findings. The original compact scenery is 3,920 bytes, SHA256 a852325fb9a3b53f4231cf849abd52eff8ba4ab4b7dbe1a34db1e5fccd73f9dc. The full packed 15-row dual-layer payload is 3,840 bytes, SHA256 e9e7e138ab0bb46704b4c34f54735a26fa7dec5b1b4e0afc1fe920fd185fff8f.

Both source accumulators are 16-bit; pixel scroll is (accumulator >> 7) & 511. Near pixels override far when their code is not transparent 3, including dark code 0. All opaque original pixels lie in source rows 112..126. The native mapper camera relation is camera = 19 + 2 * ground_offset; midpoint camera = 19 + previous_offset + current_offset. The hardware-compatible 15 rows occupy mapper rows 60 + camera through 74 + camera.

Independent tests passed: 262,144 original SFC source pixels, 15,360 packed pixels, 3,932,160 independent layer pairs, 10,321,920 camera/clipping cases, 5,160,960 direct compositor blocks, 19,584 stored vectors, 500,000 foreground blocks, 720,896 wrap/midpoint pairs, and 1,089 camera midpoint pairs. These are pure source/compositor proofs, separate from integrated timing.

The protected actual-played r10 remains SHA256 123f93114a7aa1525ba20828a46be8278e037524b504e5132755c5767ee24415. Its hardware RBF remains d344be0ba48399f212933526c9d4a2b1ae3ae2566be81006199fd7d87c192974.

## Resolved diagnostic issue

Earlier captures explicitly selected RamPowerOnState=0, which means Random, not zero. Fresh runs consequently had different ground camera X values. The initial cross-run top-ground mismatch was therefore not evidence of a changed ground projection. Same-DLL repeats and full queued camera records exposed the problem. All final captures select verified AllZeros=1, and top-row equality now passes for every field. Earlier random-state captures are retained for traceability, but their cross-run equality attribution is superseded. No ROM initialization changes were made.

## Reusable tools

- capture_parallax.py accepts --rom, --dll, --labels, --out, --frames and --neutral. Output directories must not already exist.
- analyze_parallax.py --capture CAPTURE --reference OLD_CAPTURE checks visible state, parallax, exact old/new top rows and counters.
- verify_bottom_pixels.py --capture CAPTURE independently reconstructs projected bottom pixels.
- verify_em1_capture.py --capture CAPTURE validates all poses and produces actual near-pose screenshots and encounter video.
- generate_payload.py, oracle.py, verify.cpp, run_cpp_tests.py, and verify_source_coverage.py provide the independent source/compositor checks.

FINAL_RESULT.json consolidates all machine-readable results and hashes of the final deliverables. Each capture folder retains telemetry, native AVI and its own exact result JSON.

## Additional boss/stage smoke

PASS: `mesen_final_zero_boss_1600/BossStage_actual_gameplay.mp4` is the complete actual 1,600-field boss/stage smoke. `boss_close.png`, `boss_coil.png`, `stage_returned.png`, and `stage_resumed.png` are actual AVI screenshots.

Inputs were SELECT at startup, START held for fields 300..303 and 1100..1103, otherwise neutral. Boss selection occurred at field 301, the live nine-part boss at field 303, and return to ordinary stage at field 1101. Status stayed zero. This is a boss selection/return smoke test, not a boss defeat or natural stage completion.

The same profile on the protected r10 BS2 ROM and original 344a DLL produced identical per-field boss geometry, player/object state, presentation phase/generation and counters across all 1,600 fields. Upper physical rows 0..222 excluding the restored 15-row scenery band were bit-identical in every frame: 85,196,800 pixels checked, zero mismatches. This includes native boss/player colors and placement outside that band; all nine parts' geometry also agrees throughout the band.

All 6,963,200 final bottom pixels exactly match independent projected ground, with no HUD or separator. During heavy scenes, queue slots can be rewritten while a previous frame remains visible. The optional stable-history validator freezes the unique camera observed at least twice before its first display, keyed by generation and phase. This selection is based on telemetry alone and never fits the image. All cameras were unambiguous, and every predicted pixel matched. The strict-history 960-field proof remains unchanged.

Both boss captures report exactly: present 1,574, logic 800, late fields 82, queue drops 26, deadline misses 24, starvation 2. Therefore this new integration introduces no measured counter regression in this profile, but these existing stalls remain and no uninterrupted 60 fps claim is made.

Reusable commands: capture_parallax.py --boss-smoke --frames 1600; verify_bottom_pixels.py --stable-history; verify_boss_smoke.py --capture FINAL --reference PROTECTED. Explicit ROM/DLL paths remain supported. `boss_smoke_result.json` contains the exact comparison, hashes and limits, also consolidated in FINAL_RESULT.json.
