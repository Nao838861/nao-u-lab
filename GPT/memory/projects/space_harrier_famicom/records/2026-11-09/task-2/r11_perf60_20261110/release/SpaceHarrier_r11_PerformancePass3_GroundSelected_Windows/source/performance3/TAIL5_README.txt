TAIL5: exact grouped EM1 enemy pose transfer

Status: VALIDATED_ISOLATED_CANDIDATE. This is emulator validation, not physical hardware validation.
ROM: candidate_tail5.nes
SHA256: 263426588cbd74c8b7cc6bf929cbc6bc2ecdeb41fa6385143d4e145cea099f28
Frozen exact MesenCore.dll SHA256: 4c49df2fb0c557ba99126dbb9c6208bfd6c833af87c2f57e622ea96c445f682f

Scope and reproducibility
- Only PRG banks 120..125 differ from frozen candidate_round9.nes. Bank 120 is the already validated tail4 ascending EM1 tag selector; banks 121..125 are full enemy-pose stores. Tail5 already includes tail4, so apply candidate_tail5_manifest.json alone. Exact manifest reconstruction and independent CC65 assembly of all 5 pose routines pass.
- EM1 means the opening-animation enemy, not the player. Every original target address is written exactly once with the same value. Group identical immediate values to reduce LDA instructions, retaining the original final accumulator group last. No delta cache, new generation semantics, extra buffer, skipped bytes, or atlas-tail change.
- CPU register/flag/stack return state is exact. Only the order of intermediate texture stores changes. Existing GSU/fill busy checks and preload publication remain unchanged. Core, clocks, palette, GSU program, OAM5, game logic and assets remain unchanged. Frozen round9 and tail4 ROM hashes remain intact.
- Saved CPU cycles per actual pose change, poses 0..4: 1014,1182,1276,1266,1286. Routine cycles change from 3814/4254/4542/4494/4580 to 2800/3072/3266/3228/3294. No such transfer saving applies when the enemy pose is unchanged or no EM1 request exists.

Ownership proof and authoritative tests
1. TEST_tail5.json: 1280 exact instruction cases, all 5 poses and all 256 initial flags, randomized registers and full RAM. Exact CPU A/X/Y/P/SP/PC, CPU RAM/stack, all 8192 GSU atlas bytes including untouched tail, and unique write-address set/count.
2. TEST_tail5_boundaries.json: combined authoritative 5-pose summary. 4181 decoded instruction starts, 4176 injected requests, 4252 genuine NMI executions, and all 3639 completed texture-store boundaries actually interrupted. Per pose, stores/NMIs are 640/771,715/830,763/887,751/872,770/892. Exact final emulated D10 GSU atlas via verified aperture, CPU return, mapper restoration and NMI preservation of the partial atlas pass. GSU/fill remain idle and preloaded remains 0; no new GSU/fill start occurs.
3. Boundary sources: tail5_boundaries_candidate_tail5_15/RESULT.json contains fully passed poses 0..3 records, then stopped before accepting pose 4 because of a terminal pending-interrupt assertion. tail5_boundaries_candidate_tail5_16/RESULT.json is the successful fresh-boot pose 4 repeat, with no terminal pending interrupt. No pose 4 result is claimed from run15. Earlier boundary runs are diagnostic artifacts, not release evidence.
4. tail5_native_candidate_tail5_3500/RESULT.json: 3520 normal-play fields, 48 actual enemy-pose uploads spanning all 5 poses, one naturally interrupted upload. Every upload began in normal render_state 2; all atlas/untouched-tail bytes, CPU and mapper return match. Conditional ownership/start watchpoints pass, including the natural NMI overlap at logic tick 3227.
5. TAIL4_MATCHED_candidate_tail5_stage_3500.json and TAIL4_MATCHED_candidate_tail5_boss_1000.json: generation-aligned gameplay/OAM/packet comparisons pass. 43 real-field/audio bytes are excluded. Six boss packets are not compared where queue-suppression decisions differ; the remaining 994 boss packets match, and gameplay/OAM checks still pass.
6. native_candidate_tail5_stage_6000/RESULT.json: 5969 logic/draw/present generations, 31 late fields, 31 starvations, 0 drops, 0 GSU deadlines. This isolated result must not be substituted for the combined release result. Parent testing found equal primary counters for combined round12 and tail4-based round14_safe, so intrinsic savings do not establish an additional FPS gain for that combined route.

Boundary fixture assumptions and limitations
- Fresh normal boot reaches a real uploader with live D10 RAM and ownership. Do not reload the diagnostic save-state fixture: this frozen core does not serialize all D10 work RAM/ownership.
- The test sets render_state=0 and preloaded=0 to represent idle post-commit state while injecting NMIs. This prevents an artificial framebuffer commit outside VBlank. Normal-play test 4 independently covers render_state 2 and real commits.
- Existing ROM mapper-selection code executes normally. Debug SetMemoryValue on mapper registers suppresses side effects and is unsuitable. Read the emulated D10 atlas through the verified CPU $6000..$7FFF aperture with $4FF3=1, not NesMapperRam50. Nested NMI may temporarily select WRAM; its outer NMI compares the complete D10 atlas. Every NMI checks CPU registers, interrupt-return stack and mapper restoration.
- Breakpoints cover individual decoded opcode starts, not a broad address range that also catches operand fetches. Two-cycle LDA can defer an NMI to the following STA; acceptance requires every completed STA return address in the genuine NMI stack. CPU NMI state is set through the supported debugger API; actual ROM NMI/RTI instructions execute. This does not claim sub-instruction hardware validation.
- After service_render observes GSU/fill idle, preloaded stays0 until the upload returns. NMI may service prior work but cannot start consuming the incomplete new atlas. The grouped routine contains only LDA-immediate/STA-absolute/RTS and cannot itself start a job.

Reproduction
python -X utf8 build_tail5.py
python -X utf8 test_tail5.py
python -X utf8 test_tail5_native.py candidate_tail5 3500
python -X utf8 test_tail5_boundaries.py candidate_tail5 UNIQUE_RUN_ID [COMMA_SEPARATED_POSES]
Historical commands that produced the accepted composite evidence:
python -X utf8 test_tail5_boundaries.py candidate_tail5 15
python -X utf8 test_tail5_boundaries.py candidate_tail5 16 4
The first command used the default all-five selection. Only its fully accepted pose 0..3 records are evidence; it stopped at E3F4 for pose 4 on assert not stack and not pending. The second command explicitly selected pose 4 on a fresh boot and passed. The report therefore does not claim one uninterrupted all-five passing harness run.

To reproduce the same accepted pose grouping without intentionally requesting the unaccepted tail of run15, use two NEW directory identifiers, for example:
python -X utf8 test_tail5_boundaries.py candidate_tail5 17 0,1,2,3
python -X utf8 test_tail5_boundaries.py candidate_tail5 18 4
These example identifiers have not been run as part of this frozen evidence. The completed run15 pose 0..3 path is identical to the first grouping; the fresh-boot pose 4 path is run16. Compare the per-pose records and aggregate the five distinct accepted poses as TEST_tail5_boundaries.json does.

Terminal harness limitation: the default all-five run retains a strict no-pending-request assertion at caller E3F4. A request deferred or not yet observed at the final RTS can trip it after the stores have executed. That condition alone does not establish an atlas or uploader-state mismatch, but that pose is not accepted until all final state and store-boundary assertions execute. Do not suppress missing-store coverage or relabel the incomplete pose as a pass. Fresh-boot pose 4 passed those checks and also had no pending request at return.

Output directory names must be new. The optional pose filter allows each pose to start from a fresh boot. Baseline tail4 scan evidence is documented separately in TAIL4_README.txt.

Boss upload attribution
The existing nonhalting round9 trace shows 13 boss CPU-late upload spans of 2.402539..2.565875ms, including 1.057676..1.220825ms spent inside NMI. Net upload CPU work is nearly constant 1.344491..1.345236ms. The boss 1200 selector audit observed 0 enemy-pose transfers. These boss spans primarily reflect command copy, selector and wrapper overhead, not full EM1 texture transfer.
