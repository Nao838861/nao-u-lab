# MonoSH Audio v004: medium drums

Independent copy of v003 CleanMix. New ROM: build/MonoSH_Audio_v004_MidDrums_UNTESTED.nes. Inherited older ROM filenames are not this release. Existing ROMs, RBFs, SD contents and parallel color work are unchanged.

## User request

The v003 drums were no longer too loud, but lacked impact. This version targets an impression between v002 and v003 while retaining the false-retrigger fix.

## Changes

Only the seven drum amplitude curves changed. Hats are 5/2 instead of 2/1, kick attack 9 instead of 4, snare attack 12 instead of 7, crash attack 11 instead of 6, and tom attack 10 instead of 5. Kick, snare and tom may have one extra quiet tail frame, still clipped to source note duration. The onset-only priority arbitration is unchanged: masked hits are not resurrected. No full-scale attack of 15, hardware envelope tail or delayed false hits were restored.

All five pitched BGM streams, every SE contour, the audio driver, rendering files, full CHR and DLL were verified unchanged from v003.

## Tests and measurement

Two complete loops / 29,973 CPU-emulated frames pass every note/control/pitch/bank boundary and phase-trigger check. All seven effects, restoration, priority locks, caller registers and bank preservation pass.

Mean audio tick: 388.42 CPU cycles/frame (about 1.30% of a 29,780.5-cycle NTSC frame), versus v003 384.49. Observed max remains 1,772 cycles / 5.95%. These measurements are not a worst-case proof.

Matching 11.98-second actual Mesen noise captures: v002 RMS 866.56; v003 RMS 176.94; v004 RMS 371.48. v004 is +6.44 dB above v003 and -7.36 dB below v002. The geometric midpoint is 391.58. This is a level-based starting point, not proof of a subjective midpoint.

BGM, drum-only and 20-second gameplay captures have no clipped samples. Subjective listening acceptance and real FPGA/hardware playback remain unverified. No SD deployment was performed.

## Comparison video

results/video/MonoSH_Audio_v004_Middle_Drum_Compare.mp4

0:00 source SFC intro; 0:08 v002 intro; 0:16 v003 intro; 0:24 v004 intro.
0:32 v002 melody; 0:38 v003 melody; 0:44 v004 melody.
0:50 v003 drums only; 0:53 v004 drums only; 0:56 v004 repeated-fire gameplay.

All NES excerpts have the same gain, with no pitch, tempo or normalization processing. Source SFC uses its own listening gain and 0.16-second capture alignment adjustment. Full FFmpeg decode and sampled visual QA are required before delivery. Composition/source provenance is unchanged; no public redistribution rights are asserted.

Patch against v003: audio_v003_to_v004.patch.
