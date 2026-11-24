Exact display-only projection multiplication

Build: python -B projection/build.py
Test: python -B projection/test.py
Integrate the two patches from MANIFEST.json, asserting baseline_bytes before each patch. No shared source/build files were edited.

Original source: ../r11_reference111_20261110/src/projection.s, project at CPU $A268 (bank3 is mapped at $A000; native profiler printed $8268).
Original arithmetic region $A2D9-$A338 is replaced by JMP $AD00. Helper returns by JMP $A339; original signed conversion, rounding shift, centering, and width subtraction stay intact. Every original multiplication scratch byte is reproduced, including cleared world coordinate and shifted multiplicand. The full tail makes CPU status identical, including V.
Four MMC5 8x8 products reconstruct a full32-bit product, then add256 and retain the original >>9 rounding. No truncation shortcut is used. Both mapper operands are initialized. Only MMC5 operand registers are clobbered.

Interrupt audit: source cpu.s NMI calls start_preloaded_job/try_start_gsu/audio_tick; IRQ is RTI. No $5205/$5206 access in CPU or audio source. Audio MMC5 indexed stores target $5000/$5002/$5003 with channel index0/1 (Y=0/4), not multiplication registers. Actual baseline fixed bank0 and audio bank81 contain no absolute/indexed STA/STX/STY instructions targeting $5205 or $5206. Existing verified bank76 MMC5 multiplier already relies on this invariant. Parent's new main-thread game60 multiplier is sequential, so it does not race this helper.

RESULT.json records 77,761 emitted-binary differential cases and 7,143,424 exhaustive arithmetic cases. The binary test uses the existing small6502 interpreter, models MMC5 multiply exactly, and compares signed output, all scratch, A/X/Y/status/SP. It is not an interrupt or PPU simulation. Parent should perform actual Mesen integration/profiling and visual/game-state regression; no physical hardware validation is claimed.
