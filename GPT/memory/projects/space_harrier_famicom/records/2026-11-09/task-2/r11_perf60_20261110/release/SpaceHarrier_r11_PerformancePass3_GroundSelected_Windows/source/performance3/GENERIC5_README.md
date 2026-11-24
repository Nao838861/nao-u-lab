# Generic sprite CPU optimization, candidate generic5

Candidate: candidate_generic5.nes
SHA256: c59bbfd8ba87d0675f623349f593e3de044dda08b1d2e0b5c795333da28da109
Baseline: candidate_round9.nes, SHA256 670a4e10a046cf1367c857554ada60f9cbf723c2fb183b84227dbbaab8627eae (unchanged).

## Changes

320 modified bytes in bank82 only. Regions lie within C0B2-C0B4, C175-C177, C1B5-C1B7, C319-C35D, C3DE-C422, C4A3-C4E7, C568-C5A9, D695-D708, D716-D718 and D92C-D96B.

- Merge X-128-floor(width/2) into one exact16-bit subtraction; preserve rt scratch.
- Generic Y*2+2 uses (Y+1)*2 modulo65536. The following unchanged Y-height subtraction overwrites flags/A before they are consumed.
- Shared geometry tail-transfers the trimmed capture function instead of pushing and returning an otherwise unused capture return address. Raw count, ip pointer, Y, rotation and yield decisions remain identical. Old capture code already bypassed raw record writes in round9.
- Seven adapters use a compact argument helper that still reads X, balances cc65 stack, zeros identical render state and leaves Y=1. They discard the second legacy argument, so its read/PHA/PLA are omitted. EM1 still uses the original helper because its pose argument is live.
- Three rotating bullet adapters omit initial rid/rkind stores overwritten unconditionally by select_bullet_rotation. Four bullet adapters reuse zero returned by the helper for UV-high initialization and load/store their slot directly with Y.
- The compact capture and argument helper fit in the old capture footprint. The D979 midpoint entry and all other banks are unchanged.

No clock, timing model, palette, object count, gameplay rules, source tables, sprite order, clipping, rotation, raster resolution or emulator core changes.

## Verification

TEST_generic5.json: 209,688 actual emitted6502 instruction differential cases against final round9. Full geometry/capture/rotation/clipping/command paths and EB0/EB1/EB2/boss bullet, explosion, EM0 and stone adapters execute to their actual returns. Exact A/X/Y/P/SP/PC, mapper state, yield decisions, every non-stack RAM byte and MMC5 latches are compared. Only dead hardware-stack residues from the removed balanced calls/PHA/PLA differ. NES arithmetic is modeled; renderer_yield is a balanced register-preserving stub. All256 dimensions, broad signed16bit coordinate edges and all65,536 low-coordinate byte pairs are covered, plus all56bullet depths and6slots and randomized state. Explosion age is constrained to its valid0..47 range.

MATCHED_generic5_boss_1000.json: frozen-core 1,000-generation boss replay matches both original accepted and round9 gameplay, published command bytes/count/camera and actual OAM5 pool. The established exclusions are only the real-field counter and43 total real-field/audio bytes; optimizing real-field throughput changes those time-paced values. Plain matched_candidate_generic4/5 boss runs used the obsolete queued_oam observer and are superseded by matched_oampool_candidate_generic5_boss_1000.

Measured instruction savings relative to round9: rotating enemy bullets44-52 active cycles, boss bullets34-42, EM0 26-30, explosions29-37, and shared captures6-9. Suppressed adapter calls also save work. Combined scene deadline/performance testing remains the integration parent's responsibility; no standalone FPS gain is claimed.

## Reproduction and integration

Run build_generic4.py then build_generic5.py against unchanged candidate_round9.nes. Both assert baseline hashes. Run test_generic5.py. The candidate_generic5_manifest.json contains baseline/data hex patches directly against round9; assert each old span before merging them. Generic5 supersedes generic4, so do not apply both manifests independently. Generic4 remains a frozen fallback, with its own209,688-case passing test.
