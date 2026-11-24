CAMERA3: exact camera CPU optimization on candidate_round9

Candidate: candidate_camera3.nes
SHA256: 04225bae75d40f5c03d9c9228db97e589377b3434c8bd660a09b82686cb9f5fd
Baseline: candidate_round9.nes
SHA256: 670a4e10a046cf1367c857554ada60f9cbf723c2fb183b84227dbbaab8627eae

Two patch ranges, both physical bank18:
  $8000: JMP $8400 (3 bytes)
  $8400-$89FF: optimized update routine, zero padding, three256-byte tables.
All actual round9 bytes elsewhere remain unchanged. In particular old source
camera ground-period constants differ at $821A/$821F/$8227/$822F; these actual
round9 bytes remain unchanged, and the original routines are still called.

Savings: signed16 steering shift lookup; unrolled identical descending bucket
clear; FRACTION condition reuse; exact even-depth OR0/1; reuse just-stored
world-X in P00. No RAM allocated, changes to gameplay, palette, runtime,
scheduler, GSU clock or deadline policy.

Validation:
- TEST_camera3.json:217608 full-call actual6502 differential cases pass.
  All writable RAM except dead hardware-stack bytes, return A/X/Y/P/SP,
  bank/return address and actual removal callback entry registers match.
  Original removal and interp_touch_slot_x instructions execute, not stubs.
  Exhausts65536 player-X values with both carried remainders and65536 near-cull
  X values;12000 randomized full scenes and6000 natural lifetime fields.
- Saves115cycles even empty,172.3avg in random scenes,254.0avg in dense
  lifetime stream, maximum273 in the tested suite. Official instruction
  cycles include branch and indexed page crossings.
- OAM5-aware integrated matched-stage3500 and matched-boss1000 pass against
  round9: gameplay, render commands/count, camera and actual queued OAM.
  Boss has999 mutually published packets; one differing queue suppression.
  Excludes the existing43 NMI/audio real-field bytes, not gameplay bytes.
- Native6000: late35->33 (stage22->25,boss13->8),logic5964->5966,
  queue_drops1->4,presentations5963->5962,GSU deadline misses0->0.
  Timing alignment changed. Do not claim standalone presentation-FPS gain;
  benchmark the final combined candidate separately.

Use MATCHED_vs_round9_oam5_candidate_camera3_* reports. Initial generic
matched.py reads obsolete OAM storage and produced invalid OAM failures;
its raw camera3 traces were retained but superseded by the OAM5-aware runs.

Reproduce build in a fresh copy of the experiment folder with existing
dependencies: python build_camera3.py (refuses candidate overwrite), then
python test_camera3.py. For integration apply only manifest patch ranges,
verifying baseline_bytes; do not replace bank18 from an older source build.
Existing accepted build, source repository and launchers were never edited.
