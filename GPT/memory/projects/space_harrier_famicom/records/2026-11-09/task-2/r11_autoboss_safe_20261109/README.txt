SAFE AUTO-BOSS TEST FIXTURE, NOT A REPLACEMENT NORMAL ROM

Exact hardware test ROM:
 build/MonoSH_r11_AUTO_BOSS_HW_TEST_ONLY.nes
 SHA256 b1fc486745428d6b948fad64eac9369980fe668b3202c579b13b2cab51637ebe
Use the unchanged accepted mapper SHA256
 08775918b001b9d2f9e27032d24d6b2e8f6dbbe052c98134c4d797f644c920e5.
No hardware operations were performed by this builder. Hardware validation is pending equipment owner.

Derived directly from accepted normal HW ROM SHA256
 2b30a24aa395508dfe193076eae0678a011199713e8fce176d48a1fd98a81d1c.
Frozen input is inputs/accepted_HW.nes. Original external files were not changed.
Exactly 52 byte values differ, wholly within file $7C2-$7C4 and $1F90-$1FC2.
Hook replaces CPU $E7B2 LDA $0300 with JSR $FF80. Helper is 51 bytes at
CPU $FF80-$FFB2, in trailing fixed-bank padding after the 224-byte table
smooth_Em0_0 at $FE9E-$FF7D. No bank is added or switched.
Every other byte is identical, including header, reset/NMI vectors, all
bank1+ payloads, GSU509B, atlases/12-bit pointers, EM1, CHR, audio,
adopted OAM bank126, and original NMI clock. See evidence/binary_diff.json.

BOOTSTRAP
Reset already clears zero page. The helper reuses allocated but previously
unused copy_pages byte $49; no new RAM allocation or game-state patch.
At the existing NMI input location, AFTER the physical controller read and
BEFORE held_ring/edge_ring/released_ring, it substitutes input_current only.
Original input_old, edge/release calculation and core controls execute.
NMI1-10: ordinary input. NMI11-14: SELECT $20. NMI15-18: release $00.
NMI19-22: START $10. NMI23-26: release $00. NMI27: counter saturates $80.
Thereafter it never injects again, regardless of frame_count wrap. Physical
controller input remains normal. No automatic shooting or motion. Original
SELECT enables invincibility and original START selects boss. This is a
persistent boss-rendering fixture, not a boss-kill/full-stage test.

SAFETY/TIMING
PHP/PLP preserves C/V/I/D; final original LDA $0300 restores exact A/N/Z.
X/Y untouched. Bank registers untouched. JSR+PHP peak extra stack 3 bytes,
net stack change zero. Steady-state 29 cycles inclusive of JSR/RTS versus
original LDA's 4: +25 CPU cycles per NMI (about0.084% NTSC field).
Startup maximum61 inclusive versus4: +57 cycles, for the first27 NMIs only.
Source scan of combined_rom/src and generated/nes_core finds copy_pages
only in its declaration; matching symbols allocate $49 within runtimeZP.
Independent review additionally examines indexed/aliased writes. Generic
pre-existing arbitrary-pointer bugs cannot be disproved statically.
Encoded-byte unit test covers655360 combinations of counters/input/P/frame
values plus131100 sequential calls across two16-bit frame-count wraps.
Only the original eight nonzero SELECT/START injections occur.

FRESH FUNCTIONAL EVIDENCE
Runtime frozen runtime/MesenCore.dll SHA256
 423f2f9be8fbfc42e13e885221e9cf74bc0a0de1908136e3b69547b476d69171.
The harness has no game-RAM writes, cheats, save-state loading, or external
controls other than all-buttons-released. Each run starts from ROM reset.
Normal accepted baseline:45 PPU fields, boss_state0, capture_flags0 throughout.
Exact physical HW fixture:900 PPU fields. Invincibility changes at NMI13,
boss enters state1 at NMI21 and active state2 at NMI23. Flags3 means bit0
invincible plus bit1 next START selects stage. BossHP remains16, playerstate
always0(alive), nine boss parts active, projectile count up to6. Last
frame_count894, presentations890, logic446, counter128, input0. No retrigger,
no death, no renderer error status. Face/body/projectiles visible in saved
screenshots/video. This finite functional test is not hardware timing proof.

Evidence folders baseline/, hardware/, mesen/ each contain telemetry.json,
summary.json, raw.avi, gameplay.mp4 and screenshots. hardware/ is the exact
physical file. Its scenery decoder is intentionally incompatible with this
Mesen runtime; the separate Mesen sibling changes ONLY file $11B024 00->01
and confirms scenery for900 fields with the same game-state outcome.
Mesen sibling SHA256 b02d5412c004356da276e76272864aff405e711f42a7bd399500314ab4e2a1df.
NEVER use the Mesen sibling on hardware.

REBUILD
Run python rebuild.py with the existing official cc65 toolchain path set in
that script. It assembles frozen bootstrap.s/config, verifies accepted SHA,
patch sites and padding, and emits the exact two fixtures and build.json.
Tests: tools/test_encoded_bootstrap.py; tools/validate_fixture.py MODE FIELDS.
Integration modes baseline/hardware/mesen deliberately refuse to overwrite
existing evidence directories. Emulation sources/inputs and helper tool
sources are frozen in this folder. Existing full base-game sources are not
recompiled; binary provenance is exact against the accepted ROM.
