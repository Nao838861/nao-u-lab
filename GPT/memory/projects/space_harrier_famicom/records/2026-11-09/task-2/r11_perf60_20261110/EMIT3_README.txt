EMIT3: exact command-emission optimization, including upload3

ROM: candidate_emit3.nes
SHA256: 481a0e27717a20f8a0ab46ff66595bca01499978b0ad860cfd9773368b487651
Baseline: candidate_hotspots2.nes, preserved.
Supersedes: candidate_upload3.nes. DO NOT MERGE BOTH INITIALIZERS.

Gain
The common CPU emitter skips four invariant zero high-byte writes, saving 32 CPU cycles per emitted command. The included upload3 optimization saves another 32 cycles per transferred command. At 15 commands this totals 960 cycles, approximately 0.536 ms of NTSC CPU time. Dropouts save no cycles and have identical state. No core, clock, GSU program, packet format, atlas, palette, culling, AI, gameplay or visual changes.

Initialization and regions
On every normal ROM reset, all 224 GSU high bytes and all 448 high bytes in the two live CPU buffers are explicitly set to zero. CPU buffers are $6409..$67F8 and $7235..$7624; offsets 3/5/7/9 in each 18-byte record. Nothing assumes RAM powers on zero. The initializer saves/restores the exact $4FF3 value. $5113 is already zero from reset; its sole write in the ROM is verified. $5115 is preserved by the unchanged upload3 thunk. NMI is disabled during initialization.

The new helper occupies bank31 A000..A7EF (2032 bytes) instead of upload3's A000..A2A2. It includes the old GSU initialization and replaces its old final RTS with the CPU initialization extension. Other upload3 regions remain identical: bank0 E10C..E110 hook; bank82 C6E0..C6F5 thunk; copy banks84/86/87/88 C000..D81F. Emitter change is bank82 D856..D8C3. Original D856 entry and D8C3 dropout RTS remain fixed; successful emission returns from D8B3, followed by unreachable padding. External clipping branches and render_finish/interpolation entries are unchanged.

Why only two CPU buffers
Full60 uses queue slots1/3 only: initialization sets head/tail to1, and producer/consumer advance by2 modulo4. Slots0/2 are obsolete midpoint modes. Their old RAM is repurposed for game state ($67FB is half_phase), so it must NOT be initialized as packets. The old midpoint builder is not called by the actual Full60 scheduler or producer. Native watchpoints also trap any unexpected entry. This candidate is for normal-reset Full60, not arbitrary calls to dead30Hz code or migration of an old ROM save state. Reset before use.

Validation
- 38,218 actual-instruction cases. Includes all counts0..56, both buffers and every slot/page crossing, clipping/UV edges, 20,000 random full-clipping cases, all256 CPU flags, and all256 saved $5115 values at boot from random RAM.
- Emission: exact A/X/Y/P/SP/PC, all RAM including stack, and mapper values. Boot: exact live CPU state and mapper restoration; only dead stack residue from an extra balanced PHA/PLA differs.
- Actual-ROM/source checks: sole CPU command emitter, pointer assignments, live queue parity, buffer allocation boundaries, unchanged reset/scheduler, boot mapper preconditions and preserved branch targets.
- Native physical-WRAM write watch: 6000 fields, no writes whatsoever to the448 high bytes after boot, no old midpoint entry. Covers stage, boss, repeated Select/Start resets, movement, shooting and player states0/1/2. Includes dummy writes and all CPU addressing aliases. The same watch correctly trapped the original baseline D86D zero store as a positive control.
- Real unchanged core: 2800 transfers, 22777 commands, 24 NMI-overlapped uploads; exact CPU queue to GSU bytes, all invariant bytes zero and mapper restoration. Entire1600-transfer stage sequence matches baseline exactly.
- Generation matched: 3500 stage generations with all3500 packets/game RAM/OAM/camera equal; 1000 boss generations with989 common published packets equal. Eleven boss generations exclude packet comparison because one version suppressed production. The established test excludes43 real-field/audio bytes, not gameplay.

Artifacts
candidate_emit3_manifest.json contains all complete patch regions relative to hotspots2, validation summaries and merge instructions.
TEST_emit3.json; AUDIT_emit3.json; TEST_emit3_native_summary.json; MATCHED_candidate_emit3_stage_3500.json; MATCHED_candidate_emit3_boss_1000.json.
Build/test scripts: build_emit3.py, test_emit3.py, audit_emit3.py, test_emit3_native.py, audit_emit3_native.py, finalize_emit3.py.

Reproduction creates only emit3-specific files. Native test output directories must be new. To run a second native test, choose a different sample count or distinct output prefix; preserve existing evidence. The build script starts from the frozen upload3 ROM and emits a manifest relative to the frozen hotspots2 baseline. Parent owns integrated performance measurement; no physical-hardware FPS claim is made here.
