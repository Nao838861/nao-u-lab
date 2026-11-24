# NES audio first pass

This is an independent ca65 driver and a three-voice reduction of the committed SFC arrangement, not an arcade-accurate reproduction. It uses MMC5 pulse 1 (MML A melody), MMC5 pulse 2 (C accompaniment), and APU triangle (E bass). The complete 640-quarter-note sequence is retained: 154 BPM, 14,961 nominal 60 Hz frames / 249.35 seconds. NTSC 60.0988 Hz playback is approximately 0.16% faster. D/G/H harmony and B/F percussion are omitted. Instrument changes, stereo, echo, envelopes and velocity are not reproduced. MMC5 pulse duty/volume is fixed; original melodic ties are combined, distinct repeated notes retain their event boundaries.

## Integration

Assemble driver.s and song.s separately and link their CODE/RODATA/ZEROPAGE/BSS segments into the parent ROM. All song data must stay mapped while audio_tick runs. No mapper bank registers are touched. Driver and song plus constants occupy 6,614 bytes in the standalone test image. ZEROPAGE requires 2 bytes; BSS requires 12 bytes. There are no hardcoded game RAM addresses.

- audio_init: initialize APU/MMC5 and restart song. A/X/Y are scratch.
- audio_tick: call once per displayed nominal 60 Hz frame. It starts the first notes on the first call. A/X/Y/flags are scratch. No recursion or simultaneous NMI/main invocation. Maximum observed cost is 591 CPU cycles in the standalone tests (not a proof of all interrupt integration timing).
- audio_sfx: A=1 shot, 2 explosion, 3 reflect, 4 stumble, 5 boss explosion, 6 death, 7 ground explosion. Other IDs do nothing. A/X/flags scratch. New effects replace old effects. The caller must arbitrate priority.
- audio_stop: disable APU and MMC5 output. Do not call tick while stopped; use init to restart. It is not pause/resume.

Owned registers: APU pulse 1, triangle, noise and enable/frame-control; MMC5 pulse 1/2 and enable. Initialization also silences unused pulse 2 and disables DMC. Do not share these channels with another driver. PCM read/write and IRQ are unused. The first prototype SE are newly synthesized pulse/noise approximations keyed to the source effect names, NOT a conversion of the source DSP portamento/noise envelopes. Repeated firing can interrupt any SE unless the parent supplies priority logic. All seven effects deliberately use pulse plus noise in this initial implementation. Their timbres require audition and revision.

## Provenance

Source: ../reference/MonoSH_FX2/game/v001/audio/theme.mml and its manifest.json. Source SHA256 is recorded in this directory's manifest.json. Composer: Hiroshi Kawaguchi. The SFC note arrangement derives from JK150 / SixtyTunes' third-party transcription at https://www.vgmusic.com/new-files/spaceharrier_main_theme.mid (source MIDI SHA256 a63eb2425c523e3a29e8c94ba4acd42e4bde829961c2d7019e4540c27a38ba4f). This is not an authoritative original arcade score. No source recording, BRR sample or TAD runtime is copied. No claim of third-party music redistribution permission is made; retain provenance and review permissions before public distribution. MMC5Racing/music driver was inspected for hardware context; this driver is new independent source, not a replacement or patch to MMC5Racing.

## Reproduction / verification

Run `python -X utf8 audio/build_audio.py` from any directory to regenerate song.s and manifest.json from the committed SFC theme. The script uses only Python standard library. It uses cumulative rounding to avoid tempo drift and rejects unrepresentable pitches. Current source lanes all contain 30,720 MML ticks.

Assemble driver.s/song.s using ca65, link using test.cfg with ld65 to test.bin and `-Ln test.lbl`, then run `python -X utf8 audio/test_audio.py`. test_audio.py uses the pre-existing local py65 under [ローカルパス省略]; it disables bytecode writes there. The standalone test executes the real assembled binary for two song loops, compares every event time and low pitch byte to the conversion model, checks all seven effects expire and silence, and checks no PCM register writes occur. test_report.json records the result. This does not test an analog mixer, FPGA audio implementation, clipping or subjective fidelity. No hardware or emulator listening test was performed.

Existing tools used: [ローカルパス省略] and ld65.exe. Only files under this new audio directory were created. Existing source assets, ROMs, SD cards and FPGA images were not altered.
