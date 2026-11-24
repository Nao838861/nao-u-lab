Space Harrier NES-FX r11: camera packet copy unroll
FINAL FROZEN VARIANT: tailcall

Final ROM: build/tailcall_MESEN.nes
SHA256: bafaa708cad910baa724946ab1a3011c03e9dd7ba2fd07dde20fa771b10ec8b5
Input ROM: build/baseline_MESEN.nes (parent cpu60_MESEN.nes)
SHA256: 13b1660e63d2a67dc2036227448988e2d889f183c34965c8498222efeb159542
Unchanged dedicated DLL SHA256:
423f2f9be8fbfc42e13e885221e9cf74bc0a0de1908136e3b69547b476d69171

RESULT
Final hash: Stage3000/3000 and boss3000/3000 presentations, late fields,
starvations, drops, and deadline misses all0. Relative to13b input,
Stage2999->3000, starve1->0, late5->0. No waits, warmup delays, NMI/audio
ordering changes, physics changes, or input changes were introduced.
This is a dedicated-Mesen fixed3000field result, not a hardware, full-game,
or always60fps claim. Parent longer-run tests are separate from this result.

IMPLEMENTATION
The40B routine atE519..E540 previously copied19 camera/scenery bytes per
mid/current record via indirect indexed stores. It now uses a17B wrapper
atE519..E529 to save$5116, select bank85, JMP toCF80, then resume atE525 to
restore$5116 and RTS. HelperCF80..D171 uses498 bytes of abandoned preload
space. Its two absolute unrolled copies cover queue_tail0 and2. They copy
in the same descending19byte order as before and set oam_dest_mid/cur to
the same four pointer bytes. All76 queue bytes lie within page7C, which is
compile-time asserted. Caller immediately reloadsX from queue_tail and
later initializes carry before advancing the queue; returnedA/X/Y unused.
Only mapper save uses temporary stack, +1B. No extra helper return address.

Only two patch regions differ from13b:
- build/camera_tailcall_wrapper.bin,17B -> ROM offset0x529 (CPU E519).
- build/camera_tailcall_helper.bin,498B -> ROM offset0xAAF90 (bank85 CF80).
All existing OAM code, submitD4AD, bank76 MMC5 multiply,31B gateFF80..FF9E,
NMI/audio,GSU,graphics,atlas,colors,mountains,EM1,and every other ROM byte
are unchanged. Next fixed functionE541 is untouched. No new RAM or banks.
No physical FPGA,SD,USB,normal ROM or RBF access. Old onepass directory was
not modified. No hardware variant was created.

VERIFICATION OF FINAL bafaa708 HASH
-32 real6502 oracle cases: both tails, saved mapper84/CC/D5/FE,carry0/1,
 zero/FF/ramp/seeded source bytes; destination38B exact, other pair canary,
 both surrounding canaries, sources unchanged, four pointer bytes exact,
 mapper restoration, stack balanced, carry retained. Baseline522 cycles;
 final pairA368/pairB370, mean369,29.3% faster. Includes caller JSR/RTS.
-Stage and boss each1501 pre-core_tick boundaries with fixed per-NMI
 A+movement input: all151 fields/850 bytes including NMI counter equal,
 plus JOY3B and native OAM256B equal at every boundary.
-Stage and boss each200 producer generations: both foreground command
 streams,current/mid, camera38B,queued OAM232B,JOY/native OAM equal. All849
 non-clock state bytes equal. Stage packet-capture NMI counter differs at
 two boundaries; boss counter also equal. NMI clock itself is unchanged.
-Both scenes each3000fields with original SELECT invincibility, original
 START boss skip, no movement/shooting. Emulation RAM AllZeros enum1;
 random mapper/alignment false; GSU50MHz; no gameplay RAM writes.
-Baseline identity and gameplay data, and boss baseline FG data were
 retained unchanged from parent verified13b runs. Their SOURCE.txt files
 give exact origins. Stage baseline FG and every final variant check ran
 in this isolated directory. New source reassembly reproduces final SHA.

REPRODUCTION
python rebuild.py
Uses existing ca65/ld65; CC65_BIN can override tool directory. Rebuild goes
to rebuilt/tailcall_MESEN.nes and never writes the frozen final ROM.
Complete final source: src/camera_tailcall.s and src/camera_tailcall.cfg.
Unit bodies: src/camera_tailcall_body.s and camera_tailcall_wrapper_body.s.
python tools/test_camera.py tailcall
python tools/benchmark.py tailcall stage
python tools/benchmark.py tailcall boss
python tools/check_identity.py tailcall stage 1501
python tools/check_identity.py tailcall boss 1501
python tools/check_foreground_packets.py tailcall stage 200
python tools/check_foreground_packets.py tailcall boss 200
python tools/summarize.py
Measurement scripts intentionally refuse to overwrite existing result dirs.

EARLIER VARIANT IS NOT THE FINAL
build/candidate_MESEN.nes SHA a970dad33eca7035b3c0a2f981e78913bee62b3900b25f9b946da7839341af75
uses a JSR helper and +3B stack. Its32case,Stage3000 and Stage200-generation
results are retained separately only for provenance. It is not the
recommended artifact and must not be confused with final tailcall results.
