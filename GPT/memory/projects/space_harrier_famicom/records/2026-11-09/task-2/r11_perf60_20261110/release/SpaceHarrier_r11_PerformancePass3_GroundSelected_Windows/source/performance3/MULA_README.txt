Projection rounding fold: validated and frozen

Baseline: candidate_round9.nes
Baseline SHA256: 670a4e10a046cf1367c857554ada60f9cbf723c2fb183b84227dbbaab8627eae
Candidate: candidate_mulA.nes
Candidate SHA256: f0c9f832f86b1c899474f362fa6739fe4453621aaeeeea6994a6c37948d23ec8

Only bank 3 CPU $AD00..$AD51 is patched (file offsets 27920..28001).
The general path at $AD52 keeps exactly its previous bytes and address.
There are no changes to visuals, gameplay, timing configuration, or clock.
The baseline hash was verified again when this report was finalized.

Implementation
For Xhigh=0, use SEC instead of CLC before adding the low-result partial products. This folds the old separate +1 into the carry chain. Then ADC #0 after LDA #0 restores the exact high result and every status flag. Padding after the unconditional JMP keeps the general branch at its original address.

Proof
For X<256 and Y=Ylow+256*Yhigh, the required result is floor(X*Ylow/256)+X*Yhigh+1. This is exactly the folded carry-chain result. Its maximum is floor(255*65535/256)+1 = 65280 ($FF00), so the middle-byte addition cannot carry into the high result. The final ADC #0 therefore gives A=0, C=0, V=0; LDX #0 gives N=0, Z=1. These match the old state at $A339, including V. Other flag bits, Y, and SP are unchanged. MMC5 input latches and all scratch values remain exact. No new dead-scratch exemptions are used.

Cost
Small-X branch: 105 to 75 cycles, saving 30 cycles for every qualifying call.
General branch: 196 to 196 cycles, unchanged.
There is no claim of a standalone FPS increase without a native performance benchmark.

Validation
- All 256*65536 = 16,777,216 small-X operand pairs passed actual ROM instruction execution.
- Another 186,624 boundary/all-status cases and 1,000,000 deterministic full-width random pairs passed.
- These 17,963,840 arithmetic cases compare A/X/Y/P/SP/PC, scratch, and MMC5 latches at $A339. Every CPU status bit is compared, and exact integer arithmetic independently checks the result. Runtime was 7.211 seconds.
- 10,989 full tree/bush and 3,663 full stone projection cases passed. All RAM below $8000 and CPU return registers/flags/SP match round9.
- 77,761 public multiplier-return cases also compare all RAM below $8000 and CPU return state.
- Native Mesen deterministic stage: all 3,500 generations passed, including 3,500 published packets, camera, OAM, and gameplay RAM after both logic and producer.
- Native Mesen deterministic boss: all 1,000 generations passed, including 1,000 published packets, camera, OAM, and gameplay RAM after both logic and producer. There were no RAM differences at all in the boss comparison.
- Native comparison excludes the existing 43 real-field NMI/audio bytes, which may differ when cycle savings change the number of real fields. No other exclusions or suppressed-packet skips were needed. Suppression decisions were unchanged.

Important observer detail
Final native results use the correct WRAM bank 15 OAM-pool reader copied from oam3_matched.py to matched_mulA_oam5.py. Earlier matched_candidate_mulA captures used legacy queued-OAM addresses and captured zeros for OAM; those captures are retained for audit but are not used in the final comparison. Final native capture folders start with matched_mulA_oam5_candidate_mulA.

Artifacts
build_mulA.py, mulA.s, mulA.bin
candidate_mulA_manifest.json
MULA_README.txt
TEST_mulA_exhaustive.json and test_mulA_exhaustive.cs
TEST_mulA_geometry.json and test_mulA_geometry.py
MATCHED_vs_round9_candidate_mulA_stage_3500.json
MATCHED_vs_round9_candidate_mulA_boss_1000.json

The arithmetic interpreter models NES 6502 decimal-disabled arithmetic and MMC5 multiplication, not interrupts or PPU timing. Native Mesen tests provide the separate integration checks. The parent is benchmarking the combined candidate independently.
