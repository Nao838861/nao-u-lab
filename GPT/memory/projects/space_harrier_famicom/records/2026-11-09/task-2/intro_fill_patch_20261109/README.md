# Local intro-ending tom timbre adjustment

Original v004 untouched. Copy audio/build_audio.py, song.s and manifest.json into independent combined release. No driver changes.

Likely intro-ending fill: drumF4, 15 tom hits, ticks 2928 through 3060, ending tick 3072. Frames 1428 through 1498; 23.760868 to 24.942256 seconds after BGM start. Main melody begins tick 3072. No user timestamp supplied, so identification is inferred from arrangement. Earlier comparison video shows only 0-8 seconds of intro, not this passage.

Only these toms select periodic (short LFSR) noise via bit 7 of $400E. Existing pitch indices 8, 10, 11 form descending pitched/rough bodies instead of broadband noise. Exact v004 amplitude curve [10,8,6,4,2,1], duration clipping, onset timing, priorities and anti-retrigger arbitration are unchanged. No pulse or triangle voice borrowed. All later fills unchanged, including repeated intro at loop end.

Full-loop generated stream comparison passed: only local mode bits differ. All five pitched streams, seven SE sequences, amplitude/onset/duration fields, and noise frames outside fill identical. Row count unchanged. See validation.json for exact results/hashes. CPU/emulator integration tests belong to combined ROM build. Hardware and subjective listening acceptance unverified: short noise can sound pitched/metallic and needs audition.
