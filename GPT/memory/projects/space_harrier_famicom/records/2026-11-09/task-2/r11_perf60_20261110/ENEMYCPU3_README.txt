ENEMY CPU3: BANK16-ONLY OPTIMIZATION

Baseline: candidate_hotspots2.nes
Baseline SHA256: 3a5af3836b47b2aaac13c141e9703b2c049d1a66e64d40291e56155867b48be6
Candidate: candidate_enemycpu3.nes
Candidate SHA256: a418d73030e5833a7b2d3fb6e8efc9bd8e1ab4ef547c64bc5cfa5c21c2331732

Reproduce:
  python build_enemycpu3.py
  python test_enemycpu3.py
  python test_enemycpu3_background.py

Integration: copy physical PRG bank16 only, file offset131088, length8192,
into a compatible candidate_hotspots2-based ROM. Manifest patches include exact
baseline bytes. Public entries and all original code/data remain at their old
addresses. Six wrapper JSR/JMP operands are redirected to specialized routines
at $8900..$9DA1 (5282 bytes). There is no change outside bank16.

Proof by construction:
- Same EM0 AI then midpoint publication, followed by EM1 AI then publication.
  Both original AI routines execute even for empty families. No AI/event,
  spawning, lifetime, animation, vulnerability or firing decision is skipped.
- Fixed eight-slot prepare scans remain descending7..0. They clear valid_old,
  check timer/type/last_type and exactly the same lifetime-freshness conditions.
  Specializing the requested family removes only the redundant generic test.
- Original eight draw/collision heads are saved/restored around each AI call.
- Publication remains ascending0..7, separately for EM0 then EM1, preserving
  every linked-list insertion and all ordering.
- The exact original endpoint bucket tables remain at $828B and onward.
  Path6 exceptional endpoint buckets are not replaced by depth/32.
- Midpoint arithmetic is the same carry-preserving unsigned9-bit average.
  Existing odd X/Z bits at $6862..$6871 are retained exactly. Fresh/uncached
  endpoints and stale-cache invalidation are unchanged.
- Inline absolute slot reads/writes replace indexed accesses, loop control,
  bucket helper calls and repeated family dispatch. No new RAM is allocated.
- Existing caller-visible registers A/X/Y/P/SP and every writable RAM byte
  outside dead6502 return-address stack bytes are differential-tested exact.
  Eliminated internal JSR/RTS calls change only dead stack return-address bytes.
  Temporary X within the new unrolled publication may differ; no external
  callbacks occur there and final X=8 is unchanged. Interrupt handling requires
  no new assumptions beyond the existing CPU ABI.

Validation:
- Original18 full-lifetime tests pass unchanged against the candidate module.
- Main differential:17600 calls, both public wrappers and combined entry,
  12000 mixed-spawn fields, dense all-EM0/all-EM1/mixed8 slots, empty scenes,
  collision deletion, same/different-type reuse, fresh phase1 spawning,
  invalid types and randomized stale endpoint/carry caches.
- All $6000..$67FF game RAM, $6800..$6871 cache/scratch, other non-stack RAM,
  final CPU registers, fire/touch callbacks and raw bucket links match exactly.
- Supplemental2000 fields test16 pre-existing background objects per field,
  with different draw/collision bucket order, under mixed enemy lifetimes.

Measured main-suite savings:
- Mixed scenes:428..429 cycles/call average,14.8% of enemy-update cycles.
- Dense8 mixed:637 cycles/call average,14.4%; up to945 cycles in a call.
- All8 EM0:639 cycles/call average; all8 EM1:636 cycles/call average.
- Empty:197 cycles/call average,16.5%.
These are instruction cycles including branch/index page crossings. Original
far-resolver/bullet/touch external callback costs are harnessed identically on
both sides. The delta for changed instructions is exact; the suite is not an
integrated console/NMI timing benchmark. Parent task handles final emulator
state/frame equivalence and total-FPS measurements.
