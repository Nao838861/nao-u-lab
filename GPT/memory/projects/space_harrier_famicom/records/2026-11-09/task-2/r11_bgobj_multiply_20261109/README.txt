Display-only background-object multiplier optimization, 2026-11-09

Independent candidate on top of yieldgate SHA8588a0e496c8cc12d18336a15d509134610663a69b16c377e2846476cf11ce49.
Candidate SHA c7df08690273c66a528dbd127d80e4a7a2e9e815c86db4e6d38d3da00b361ef5.
Only bank76: entry$828B three-byte JMP;73-byte helper at$8700 in verified unused padding.75 actual bytes changed. Fixed FF80 gate and all other banks/assets/GSU/audio/gameplay remain byte-identical.

Function speed: original487+19*popcount(multiplier), new74/89/96/111 cycles excluding JSR. All paths measured. 99,328 synthetic arithmetic/ABI cases and3000 real calls passed. P00/P05,P02,P06,A/X/Y,C/N/Z/D/I preserved. V is deliberately unspecified and dead at all3 local call sites. Mapper operand registers are clobbered; other user bom_inverse_x initializes both. NMI/audio/IRQ do not touch multiplier.

Stage3000fields: presentations2991 ->2999, starvation9 ->1, drop8 ->0, late165 ->41, deadline0 ->0. Both retain1500 logic/draw updates. Boss3000fields:3000 presentations, all misses0.
1501 input boundaries in each scene: all game fields except live NMI frame_counter, nativeOAM and JOY identical. Stage52 frame_counter differences, boss0. Per-generation camera38B/OAM232B at200 generations in both scenes identical. This is dedicated Mesen verification, not a hardware or full-game guarantee.

Rebuild: python -B -X utf8 tools/build.py.
Full-source verification: python -B -X utf8 tools/verify_fullsource.py (requires existing original full-source tree named above). Full modified source is src/draw_bgobj_all.s; full relink matches candidate bank76 exactly.
Test: tools/test_multiply.py; tools/probe_multiply.py timing; tools/probe_multiply.py real. Other benchmark/identity/packet tools preserve parent protocol.
See results/FINAL_REPORT.json and build/MANIFEST.json for complete measured results and scope.
No physical console, removable media, RBF or ordinary deliverable modified.
