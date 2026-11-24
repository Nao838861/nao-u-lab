Space Harrier r11: CPU OAM snapshot-copy optimization

RECOMMENDED CANDIDATE. Dedicated emulator verified; hardware untested.
This is an independent successor to accepted hardware2b30a24a / Mesen36da9d1d.
The normal ROM and current equipment test target were NOT overwritten.

Change
Keep the prior native-OAM snapshot until interpolation has finished.
Interpolate directly against unchanged current native OAM, then save the new
snapshot once. This removes a redundant copy. No gameplay, scheduler, NMI
clock, GSU, atlas, scenery, CHR, EM1, audio or FPGA/RBF changes.

Resources
prepare_oam_impl is2948B instead of3644B, within the same PRG bank85 slot.
No extra ROM capacity, static RAM or FPGA resources. The unused oam_previous
256B allocation is retained, so it is NOT counted as newly available RAM.
Existing bank126 OAM preload optimization is retained unchanged.

Measurements
Canonical settings: RamPowerOnState=1 (AllZeros), no randomized mapper state
or CPU/PPU alignment; matching r11 MesenCore.dll SHA423f2f9b... .
AllZeros is1, NOT0. Earlier0-setting files are Random-state historical tests.
An existing uninitialized lateral_phase can give different ground-X start
phases under Random. No initialization fix is mixed into this CPU candidate.

36 assembled6502 midpoint oracle cases pass;464..519 CPU cycles saved per
prep (about0.259..0.290ms at1789773Hz). Includes visibility, wraps, reflected
shot lifetime, discontinuities, attributes, other-pair canaries, seeded cases.
Boss3000fields: presentations2999->3000; starvation1->0; late111->0;
deadline misses0, drops0. Stage3000fields: presentations2988 unchanged,
starvation12 unchanged; late217->182. This is NOT a universal60fps claim.
See tests/VALIDATION.json for corrected-settings input, pixel and packet checks.
A separate extra service_render-call prototype gave no useful benefit and is
NOT included in the deliverable ROMs.

Rebuild
python -B rebuild.py
Optional: set CC65_BIN to the cc65 bin directory, then
python -B rebuild.py --assemble
The script writes only rebuilt/ and checks exact final hashes. It never
accesses hardware. Included inputs are the unchanged prior accepted ROMs.
The small archive supports standalone ROM rebuilding. Full headless test
re-execution additionally needs the matching Windows DLL at runtime/MesenCore.dll,
cc65, Python/Pillow and original build/result setup; the large DLL is not bundled.
Harness source is included as research evidence, not a one-click test runner.

Hardware
Use only the HARDWARE_UNTESTED ROM with paired unchanged r11 RBF08775918... .
Mesen and hardware variants retain their original one-byte CHR compatibility
difference at ROM offset0x11b024. Do not swap variants casually.
No SD, USB, launch, reset, equipment memory reads or capture by this worker.
The dedicated DLL still models a fixed2.948977ms copy; actual RTL dirty-copy
behavior and physical performance require separate validation.
