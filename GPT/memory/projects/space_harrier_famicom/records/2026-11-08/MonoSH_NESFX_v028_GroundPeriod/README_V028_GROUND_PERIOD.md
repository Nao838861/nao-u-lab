# v028 Ground Period

Based on frozen v027 DirectDepth. Only display forward-phase handling changed. All prior versions, original NES gameplay/collision sources, audio, textures, palette, v027 smooth dimensions/anchors, v026's 19-pixel horizon adjustment, runtime DLL, and SD/RBF remain unchanged. No ROM/archive uploaded.

## Cause and correction

The horizontal-band texture has a 32-texel full Y period. Translating it 16 texels changes 50% of the samples; translating it 32 texels changes none. The old camera wrapped after 16 texels, swapping the patterned-row color orientation halfway through its true cycle.

Mode7 camera Z contributes cameraZ * 512 * 5 / 65536 = cameraZ * 5/128 texture texels. The full pattern requires 32 * 128/5 = 819.2 camera units, versus the old 409.6.

Full logic phase positions:
0, 59, 117, 176, 234, 293, 351, 410, 468, 527, 585, 644, 702, 761.

Midpoints:
29, 88, 146, 205, 263, 322, 380, 439, 497, 556, 614, 673, 731, 790.

These are 14 logic phases plus 14 midpoints, or 28 display positions. Speed is unchanged: old 16/7 = new 32/14 = 2.285714 texture texels per original logic tick. The final midpoint 790 to wrapped 0 covers 29.2 camera units, within the normal 29?30-unit display steps. The full cycle takes twice as long; velocity was not halved.

SFC reference tools/build_ground.py and game/v001/frame.s use 14 display phases for a nonlinear two-band cycle. This is a reference for the full color-period rule, not a claim that its phase count or nonlinear projected band motion equals the regular Mode7 texture. NESFX now needs 28 display positions for its doubled full texture period at unchanged forward speed.

## Implementation

New display state occupies previously unused runtime padding $03C1?$03C3. GROUND_CODE uses $DE75?$DF14 (160 bytes) in normal render bank $D2. Existing segments and entry addresses, original fixed game bytes $F219?$F80D, and smooth tables $F80E?$FFED are preserved. Old phase-table space remains; expanded phase tables live in spare render-bank space.

The original core_tick is unchanged. A same-size main JSR invokes a display wrapper which calls it and lifts actual original 0?6 transitions to 0?13. Display forward phase stays fixed when the original ground phase freezes. The existing interpolation lifetime-reset hook clears display phase explicitly, including an original 0-to-0 reset while lifted phase was 7. Discontinuous changes resynchronize. The original game never reads the new display state. Renderer copy/OAM helpers restore bank $5116; actual scene/probe reads all report $D2.

The build asserts that the emitted main JSR targets the new wrapper. The initial dc25 candidate missed that source replacement and is rejected. Its old trace directories are labeled in results/rejected_dc25.txt and excluded from final evidence.

## Validation

- 1,201 fixed-NMI-input boundaries versus v027: all 151 original state fields (850 bytes), original 256-byte OAM, latched input, and sampled frame/logic/draw counters identical. Includes boss states 0, 1 and 2. CPU cycle positions differ, so no full timing-identity claim.
- 900 actual scenes: current/midpoint camera coordinates agree with the 14/28 phase tables. Verified 64 full wraps from 13 to 0 and 65 half-cycle transitions from 6 to 7. One suppressed scene retained and excluded from midpoint comparisons, without dropping logic phase tracking.
- 180-tick reset probe: two original START stage/boss resets from lifted phase 7/raw 0 both clear phase to 0.
- 700-tick no-invincibility probe: player states 0, 1 and 2 with 231 frozen transitions keep display phase fixed.
- 409,600 texture pixels checked. Renderer-level 33 altitudes ? 128 lateral phases: exact 32-texel shift has zero color mismatches for 69,304,320 common in-map samples. Comparing integer camera 819 continuation to wrapped 0 can affect at most one raster row per camera due to 0.0078125-texel rounding. The finite 640-pixel map edge likewise can affect one row. The old half-pattern jump is removed; mathematical zero seam pixels are not claimed.
- Actual video decoded 1,799 frames, about 29.93 seconds, with non-silent audio (maximum -21.1 dB). Still frames at 7, 12, 21 and 27 seconds inspected. First 10 seconds use fixed steering, followed by horizontal/altitude changes. Normal ROM and original SELECT invincibility; no RAM writes or synthetic gameplay frames.

Video: results/ground_period_final/v028_ground_period.mp4

ROM SHA256: b63798cac9c7ba22a4169ea10aa4f8215480ffdccdb318d7b6b49583f5cce6db

Video SHA256: 882fb8e4e3dac9181aa2039423d2009a963ef7970709f9e4c151146b8a5cf061

Read results/final_validation.json and its phase, projection, fixed-input and transition evidence for details. This is an incremental visual correction, not perfect 60 fps, full-stage/hardware validation, or an SFC pixel-identity claim.
