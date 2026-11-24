# Full60 dead raw capture store elimination

## Patch
Only bank82:$D939 (file offset 0xA5949) changes: A0 00 91 70 C8 becomes A0 09 4C 6A D9 (LDY #9; JMP $D96A). The original bounds checks and increment/pointer tail remain unchanged. Ten STA (ip),Y writes and their intervening loads/increments are bypassed. The replacement preserves Y=9, all other register/flag liveouts, raw pointer advancement, raw count, limits and cooperative yield cadence. Saves exactly 102 cycles for every valid capture.

## Read/dead-use audit
The original raw record is display-only, not original gameplay RAM. Source interpolation.s stores raw records only for build_midpoint. The actual verified baseline ROM has two contiguous A9 B4 85 70 A9 6C 85 71 raw-pointer initializations: bank82:$D923 (interpolation_begin) and $DA6C (build_midpoint). The sole capture_geometry JSR is bank82:$D716. Bank82:$D720 still reads raw count and yields every fourth capture; this patch deliberately preserves it.

Full60 scheduler source/build removes build_midpoint and queues only current slots1/3. The ROM retains a legacy fixed-bank thunk at $FFB0 containing JSR $D979, but an entire PRG scan finds no direct JSR to $FFB0. This is supporting static evidence, not a general proof against every possible indirect call. Safety is conditional on the current full60 scheduler; never apply to the old midpoint-producing build. Current generation/lifetime metadata, all packet metadata and animation are untouched.

Do not remove dirty flags or clearing: actual camera60 and bullets60 read _interp_dirty, while explosion animation reads slots0..15 and bullet rotation reads slots24..29. Do not remove live bank126 packet preparation or bank14 player publication merely because historical names mention interpolation.

## Tests and limits
Run python bookkeeping/build_test.py from this workspace. It writes only bookkeeping/. It verifies the baseline SHA and exact original bytes before patching. It loads the existing interpreter definitions without executing that module's original tests/writes, adds STA indirect,Y emulation, then compares 671 cases covering raw counts0..56/63/64/127/255 and slots0/1/15/24/29/32/40/63/64/65/255, randomized RAM/registers, valid raw pointers including page crossings. All CPU registers/flags/stack/return address and all RAM match except the ten deliberately omitted raw bytes. Decimal flag is disabled to match NES arithmetic.

This is instruction-semantic testing, not native emulator integration, interrupt scheduling, or PPU verification. Required before release: native Mesen stage/boss profiles, reset/death/restart, dense bullets/explosions, packet consistency and visual capture. Performance estimate from original boss capture count5836/600 fields: 595272 cycles total saved, about992 cycles/field. No hardware, USB, SD or FPGA access.
