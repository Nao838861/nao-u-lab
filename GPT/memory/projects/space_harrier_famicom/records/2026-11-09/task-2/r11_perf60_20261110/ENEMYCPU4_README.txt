ENEMY CPU4: ELIMINATE THROWAWAY ENDPOINT BUCKETS

Baseline: candidate_round9.nes
SHA256: 670a4e10a046cf1367c857554ada60f9cbf723c2fb183b84227dbbaab8627eae
Candidate: candidate_enemycpu4.nes
SHA256: d2030446f203efb5f7d78638f33438ecee47737155fe8e8f7d5e4362acebcde9
Changed banks:16,21,59. Changed bytes:1360.

RESULT
All correctness tests pass. Saves260cycles on empty phase0 and up to495cycles
with8 enemies. Phase1 is byte-for-byte unchanged. Average mixed-stream savings
191.5cycles/field; dense8 around246cycles/field. No AI/geometry/entity/render
rate reduction, no clock/core/palette changes, and no new RAM.
Standalone native throughput did NOT improve: round9 had35late fields and37
starvations per6000, this candidate37late and38starvations; both1queue drop,
zero deadline misses and zero pose conflicts. This is a safe CPU-saving building
block for combination, not a standaloneFPS improvement or hardware proof.

DESIGN
- Private EM0 clone bank59 $9900..$9A4E (335bytes), EM1 clone bank21
  $8500..$8906 (1031bytes). Original AI entries remain entirely unchanged.
- Only enemy60 phase0 dispatches to clones. Byte-exact original AI copied with
  internal absolute JMP/JSR relocation; relative branches and tables unchanged.
- Replace the original throwaway bucket insertion with equivalent A/X/Y/N/Z
  effects and continue at identical AI logic. Keep all AI decisions, timing,
  life/death, firing, animation and geometry instructions.
- Keep every saved-head cache write at$6850..$685F. Since clone cannot change
  heads, bypass only redundant restore. Midpoint publication inserts in the
  original EM0-then-EM1, ascending-slot order.
- Clone prologue restores original$23/$24 dispatch pointer. All final ZP,
  gameplay, scratch, cache and mapper state are exact.
- EM0 lifetimes [123,118,118,118,120,120,95,95,95] cannot wrap active timer
  to0 after temporary insertion. Every would-be insertion necessarily reaches
  midpoint publication, overwriting both raw links. Dead slots never insert.
  EM1 removal branches before insertion. No raw dead-slot link differences.

CALLBACK AND INTERRUPT PROOF
- Actual fire code and all callees run, including bullet-pool allocation and
  interpolation touch. Dynamic read sets contain no heads/links. Static audit
  verifies every possible indirect velocity pointer range avoids$60F6..$6141;
  normal depths4..55 read ROM only. Fire cannot change enemy activity/type.
- Touch routines only preserve P/A on live stack and set dirty flag. No reads
  of lists. Callback entry A/X/Y/P and sequence match exactly.
- Calibrated native physical WRAM0 read watch covers all draw/collision heads
  and30 next links, all CPU addressing modes/aliases, every instruction from
  NMI entry through RTI.6000NMIs across title/stage/boss/movement/shooting/reset:
  zero accesses. Initial main-thread read at$EC3F proves watch sensitivity.
- GSU consumes copied queued packets, not CPU linked lists. No mapper/core
  changes. All native generated command/camera/OAM packets match round9.

TESTS
-18full original enemy lifetimes, original routines preserved and real callbacks.
-17,600differential calls,12,000mixed fields, all8EM0/EM1/mixed, empty scenes,
  both public wrappers, deletion, same/different-type reuse and randomized cache.
-2,000additional fields with16background objects, different draw/collision lists.
-All RAM below$8000 excluding dead hardware-stack residues exact. Includes
  saved heads, raw links for live/dead objects, generation dirty flags, bullet
  allocations, timers, old/new caches and ZP. A/X/Y/P/SP and callback ABI exact.
-Native3500stage+1000boss generations:867gameplaybytes after logic and producer,
  all commands/count/camera, actual WRAM15 OAM5pool exact. Zero suppressions.
  Established43real-field/audio bytes excluded from native comparison only.
-6000calibrated NMI read-watch fields and6000native performance fields.

REPRODUCE
 python build_enemycpu4.py
 python test_enemycpu4.py
 python test_enemycpu4_background.py
 python matched_camera3.py candidate_enemycpu4 stage 3500
 python matched_camera3.py candidate_enemycpu4 boss 1000
 python compare_camera3.py candidate_enemycpu4 stage 3500
 python compare_camera3.py candidate_enemycpu4 boss 1000
 python audit_enemycpu4_nmi.py candidate_enemycpu4 6000
 python native.py stage 6000 candidate_enemycpu4
Existing result directories are fail-if-present; use distinct new output names
for reruns. Do not use obsolete matched.py OAM observer: it reads pre-OAM5 RAM.
Its initial candidate run is retained for audit, not counted as final validation.

Integration: apply manifest patches against exact baseline bytes. Do not copy
whole banks from old candidates; other workers may modify different bank16,
bank21 or bank59 regions. Parent must test the final combined artifact.
