# MonoSH Audio v002: v034 with MMC5/APU music and sound effects

Independent copy of MonoSH_NESFX_v034_RestoreOriginalPalette. Original v034/v031 ROMs, SD contents, RBF and shared Mesen runtime were not modified. This folder contains a private MesenCore.dll. The ROM is explicitly UNTESTED on hardware.

## Verified BGM defect

The dedicated NesRacingFx mapper did not route $5000-$5015 to MMC5 audio or clock its audio engine. The previous three-voice conversion therefore played only its APU triangle bass: its MMC5 melody and accompaniment were silent. Actual isolated-MMC5 recording had RMS 0 before the fix and nonzero RMS after it.

The mapper now uses the existing upstream Mmc5Audio implementation, clocks it, routes audio registers and includes reset/serialization. PCM/DMC is not used by this port; MMC5 PCM read IRQ behavior is not an implemented requirement here.

## Arrangement and effects

Source: reference/sfc_audio/theme.mml, theme.spc, effects.txt and monosh.terrificaudio, from MonoSH_FX2 game/v001.

Six-channel NES arrangement:
- A: MMC5 pulse 1, melody.
- C: MMC5 pulse 2, accompaniment.
- D: APU pulse 1, temporarily borrowed by effects.
- G: APU pulse 2.
- E: APU triangle bass.
- B/F: priority-merged APU noise drums, temporarily borrowed by effects.

H pad is omitted. SFC BRR timbres, ADSR, stereo and echo are not reproduced. This is a source-derived chiptune arrangement, not a bit-exact SFC audio recreation. The original approximately 25-second C4/C5 introduction is retained, not replaced with invented music.

Seven source-derived effects: shot, explosion, reflect, stumble, boss explosion, death and ground impact. Linear-frequency portamento and source tick duration are approximated by NES-frame updates. Effects temporarily take pulse 1 and noise, then restore the current music state. Death/boss/stumble cannot be restarted by equal-priority repeat events. Requests use independent byte flags.

PRG 89 holds audio code. Music data uses banks 90-97; reserved banks 98-99 remain zero. Driver uses 2 zero-page bytes and 56 BSS bytes. Audio init/tick trampolines preserve active banks and caller registers. Audio tick runs after PPU writes and try_start_gsu at the end of NMI so variable audio cost does not delay VBlank writes.

## Tests

Run audio/verify_audio_v001.py (historical script name; targets this folder):
- 29,973 frames, two complete music loops.
- Every event duration, control, low/high period byte and bank-chain boundary matched the converted sequence on the actual assembled 6502 binary.
- All seven effect contours, restoration, bank preservation, register preservation, simultaneous requests and priority locks passed.
- Mean 282.74 CPU cycles per display frame, approximately 0.95% of a 29,780.5-cycle NTSC frame.
- Maximum observed 1,755 cycles, approximately 5.89%, including simultaneous requests. This is not a worst-case interrupt proof.

Actual Mesen playback of source theme.spc was compared with an isolated MMC5 channel:
- C4: corrected 261.351 Hz; SFC 261.701 Hz; approximately -2.318 cents.
- C5: corrected 522.702 Hz; SFC 523.302 Hz.
- Measured rest span: corrected 12.465 s; SFC 12.480 s, approximately 0.1203% difference.
FFT windows and rest minima are limited measurements, not a full subjective listening test. Rest minima include instrument release/echo and frame quantization. See results/bgm_reference_comparison.json.

A 3,600-frame same-input Mesen run compared unmodified v034 with this version:
- Logic ticks: 1,801 / 1,801.
- Draws: 1,801 / 1,801.
- Presents: baseline 3,569 / audio 3,571.
- Deadline misses: 20 / 16.
- Queue drops: 30 / 28.
- Starvations: 11 / 13.
- Late fields: 86 / 95.

Timing changes are mixed, not a blanket performance improvement or zero-overhead claim. Digital clipped samples: 0. Shot/explosion/ground/stumble/death occurred during natural gameplay; reflect and boss effects were verified by fixtures but not encountered naturally in the one-minute run. Full-stage and real FPGA/hardware playback remain untested.

Visual preservation: GSU, rendering adapter, interpolation, render tables, effects animation, Mode7Ground, atlas asset, full CHR-ROM and palette are byte-equal to v034. See results/v034_visual_preservation.json.

## Deliverables

- build/MonoSH_Audio_v002_v034_UNTESTED.nes
- runtime/MesenCore.dll
- results/video/MonoSH_Audio_v002_v034_Compare_Play.mp4
- audio_integration.patch: relative to unmodified v034; for applying only to another independent copy.
- results/audio_driver_test.json, v034_comparison.json, final_hashes.json.
- audio/build_audio.py, driver.s, capture_audio_v001.py, capture_sfc_reference.py, analyze_bgm_reference.py and make_audio_video.py provide conversion and reproducible tests/captures.

Video: 10 seconds old BGM, 10 seconds original SFC SPC, 10 seconds corrected BGM, then about 60 seconds normal latest gameplay. Comparison clips use the same musical passage beginning at 25 seconds. Audition volume alone is normalized, with no pitch/tempo processing. Corrected BGM comparison uses a separate diagnostic ROM that skips effect requests; gameplay uses the normal ROM with effects. Only the MP4 was uploaded to Space, not the source or ROM. MP4 passed a full FFmpeg decode.

Local metadata results/video/library_identity.json records Space identity. The official xattr helper was invoked immediately after upload, but Windows Python lacks os.setxattr; identity is retained in that JSON sidecar instead. Upload itself succeeded.

## Provenance and limitations

Composition: Hiroshi Kawaguchi. Third-party transcription credited by the source: JK150 / SixtyTunes, https://www.vgmusic.com/new-files/spaceharrier_main_theme.mid . Source SFC samples, BRR runtime, TAD driver and SFC recordings are not embedded in the NES ROM. Source-derived note/effect data is included locally for this requested port. No claim of public redistribution rights is made.

