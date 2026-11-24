# MonoSH Audio v003 Clean Mix

Independent working copy of MonoSH_Audio_v002_v034. Existing ROMs, RBFs, SD contents and the concurrent color work were not changed. Do not mistake the inherited v002 files in build/ for the new output.

New ROM: build/MonoSH_Audio_v003_CleanMix_UNTESTED.nes
Preview: results/video/MonoSH_Audio_v003_Intro_Drums_Shots_Compare.mp4
Patch against v002: audio_v002_to_v003.patch

## Findings

The v002 noise converter used a full-scale hardware envelope (15) for every drum. Priority merging selected drums at every frame, allowing masked tails to reappear and retrigger the envelope. There were 297 delayed/reappearing drum segments per 249-second loop, including a kick delayed by 6 frames (about 100 ms) at the start. This is an actual conversion/playback defect, separate from intentional NES timbre changes.

The v002 gameplay capture also pressed A every 8 frames, repeatedly playing a roughly 3 kHz falling-pitch shot. This is a likely source of the background beeping; it is an effect, not a new melody note. The comparison now separates music-only and repeated-fire footage.

Pulse parts had constant volume; source channel volumes and instrument envelopes were not reproduced. The quiet source stab parts were too prominent. The original C4/C5 introduction and octave bass line are in the source MML. They have not been replaced or silenced.

## Changes

- Low-amplitude, explicit frame envelopes for hats, snare, crash, kick and tom.
- Masked drum hits are discarded rather than resumed as fresh hits. No hidden hardware-envelope restart after effects.
- Lower stab/brass level, a shaped lead envelope and short release gates. These are NES arrangement choices, not exact SFC BRR/ADSR reproduction.
- Volume-only rows do not reset pulse oscillators. Real note onsets still trigger once.
- Shot peak changed from 6 to 2. Effect timing, priorities and the other six effects are retained.
- Music banks now use 90-101. ROM size remains unchanged; other reserved banks remain empty.

## Verification

- Assembled 6502: 29,973 frames, two loops; all six channels, every event, both pitch bytes, bank crossing and loop boundaries passed.
- Four pulse channels: phase-trigger writes occur only at actual onsets; volume-only rows do not retrigger.
- Seven effects, restoration, priority locks, register and bank preservation passed.
- CPU mean 384.49 cycles/frame (about 1.29%); observed max 1,772 cycles (5.95%). This is not a worst-case interrupt proof.
- Actual Mesen captures: noise RMS over matching 11.98-second intro fell from 866.56 to 176.94, a 13.80 dB reduction. Full BGM RMS fell only about 1.24 dB.
- Digital clipped samples: 0 in before/after music and normal gameplay recordings.
- GSU, rendering adapter, interpolation, visual effects, render tables, scenery asset, full CHR and private MesenCore.dll are byte-identical to v002.
- Source SPC drums/bass and NES MMC5/APU voices were separately captured. Analysis is code and signal based; subjective listening validation is not claimed.
- FPGA/hardware playback and full-stage performance are not tested. No SD deployment was performed.

## Comparison video

0:00 before intro, 0:12 source SFC intro, 0:24 after intro.
0:36 before melody, 0:44 source SFC melody, 0:52 after melody.
1:00 before drums only, 1:04 after drums only.
1:08 before repeated-fire gameplay, 1:18 after repeated-fire gameplay.

v002 and v003 use exactly the same preview gain. Source SFC gets its own fixed listening gain and 0.16-second capture-offset correction. No pitch or tempo processing. The source game music remains a third-party composition; no redistribution rights are asserted. Only the comparison video is prepared for private user delivery.
