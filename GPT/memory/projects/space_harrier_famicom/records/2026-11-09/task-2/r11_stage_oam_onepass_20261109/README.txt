Space Harrier NES-FX r11: one-pass OAM CPU candidate

STATUS: dedicated Mesen verified; FPGA/hardware/full-game/always-60fps unverified.
Input: yieldgate_MESEN.nes SHA256 8588a0e496c8cc12d18336a15d509134610663a69b16c377e2846476cf11ce49
Output: build/candidate_MESEN.nes SHA256 5c36a275bf595bde7f3f9aadcb87148f7bf5ce163f6637377b99647c0d34ddcb
Unchanged DLL SHA256 423f2f9be8fbfc42e13e885221e9cf74bc0a0de1908136e3b69547b476d69171

Only CPU bank85 changes. No extra bank/RAM. GSU, atlas, colors, mountains,
EM1, audio, NMI, fixed FF80..FF99 yield gate, bank126 preload, and all other
ROM bytes are unchanged. No physical equipment, SD, USB, normal ROM or RBF
was accessed or modified. This work stayed in its independent directory.

IMPLEMENTATION
src/prepare_candidate.s is complete patch source with symbolic addresses.
src/prepare_candidate_body.s is the same body used by relocatable unit tests.
The 28 interpolated slots are unrolled. Y=0/232 selects pending A/B pair.
Eligibility matches baseline: visible old/current, matching attributes,
absolute X/Y deltas <=32, and reflected-shot timer >=2 for slots76..99.
Midpoint coordinates are written before overwriting their old snapshot.
Tile/attribute, current record and retained snapshot are copied per slot.
Slot0 stays discrete. Global discontinuity copies all116 bytes unchanged.
Both oam_dest_mid/cur pointers retain the baseline initialization contract.
The producer caller does not use returned A/X/Y/P; its wrapper and live
submit D4AD entry remain identical. NMI already preserves A/X/Y/P.

Code C000..CF7F =3968 bytes; rare all-snap D800..DD70 =1393 bytes.
The abandoned old preload entry at CE3C is partially replaced. This is
safe because its fixed wrapper already calls bank126 C000 instead.
The live old submit D4AD..D765 is untouched, with no wrapper relocation.

VALIDATION
-36 independent real6502 oracle cases passed, including tail0/2, hidden
 sprites, attributes,32/33px deltas, wrap, reflected timer0/1/2+, global
 snaps, seeded mixed cases, current bytes, snapshot, other-pair canaries,
 and unchanged timers. All36 cases faster; max6028->4634 CPU cycles,
 mean4824.28->3849.56 (20.2% lower), global snap2384/2385->2152/2153.
-Stage and boss each1501 pre-core_tick boundaries with fixed per-NMI A and
 movement:149 other fields + reflection RNG + controls/native OAM retained.
 In precise counts,151 fields/850 bytes sampled;849 state bytes, JOY3 bytes
 and native OAM256 bytes equal at every boundary. Only the existing NMI
 counter byte differs,37 Stage /24 boss boundaries, as already permitted.
-Stage and boss each200 produced generations: camera38 bytes and queued
 OAM232 bytes identical, plus JOY/native OAM and849 state bytes.
-Stage3000fields: present2991->2993, starve9->7, drop8->6, late165->132,
 deadline0. Boss3000fields: present3000, all four miss counters0.
-Actual Stage1170..1325 read-only component profile (77 pairs), including
 NMI interruptions: OAM mean5311.01->4247.38 CPU cycles, producer mean
 43403.08->41292.45. Timing of NMI interruption migrates between components,
 so do not interpret other component differences as changed code.
-All-zero RAM enum1, randomized mapper/alignment false,50MHz GSU, SELECT
 invincibility; original START boss skip. No gameplay RAM writes.
-Baseline3000field benchmark results copied unchanged from the input's
 previous verified yieldgate run; exact paths are in each SOURCE.txt.
 New candidate, identity, packet, oracle, and component tests ran here.

REPRODUCTION
python rebuild.py assembles source with existing ca65/ld65 and rebuilds
candidate from build/baseline_MESEN.nes, asserting input/output SHA256.
CC65_BIN can override the existing tool path. No equipment operations.
python tools/test_midpoint_cycles.py baseline
python tools/test_midpoint_cycles.py candidate
python tools/check_identity.py baseline stage 1501
Variants:baseline/candidate; scenes:stage/boss. Packet script same syntax
with200. benchmark.py takes variant scene and measures3000 fields.
Existing result directories are intentionally not overwritten by runners.
python tools/summarize.py verifies and writes RESULT.json.

INTEGRATION
Copy prepare.bin[0:0xF80] to ROM[0xAA010:0xAAF90].
Copy prepare.bin[0x1800:0x1D71] to ROM[0xAB810:0xABD81].
These are the only patch ranges; they do not overlap fixed-bank NMI work.
Do not copy the whole8192B blob, since linker fill would erase live submit.
BUILD.json records exact ranges/hashes; rebuild.py copies only these ranges.
No hardware variant was created, and no untested NMI changes integrated.
