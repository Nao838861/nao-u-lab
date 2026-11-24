ContactA: exact unrolled player-contact depth masking

Status: VERIFIED OPTIONAL, NOT ADOPTED in primary release.
ROM: candidate_contactA.nes
SHA256: 7c5511d28255e96bf4d34ee5be35fcc04ee33e558d3075942229892f08d28662
Base: candidate_round9.nes, SHA670a4e10a046cf1367c857554ada60f9cbf723c2fb183b84227dbbaab8627eae

Patch: bank15 $8235 JMP to470-byte helper $8A00..$8BD5. Exact free bytes verified against base; bank15 OAM5 $9000..$9FFF unchanged. Original collision callback runs without shortcut. Same mask/depth write order, callback ABI, final registers, flags, mapper and every live/private RAM byte. Only dead hardware-stack return-address residues differ. No timing/core/AI/movement-rate reduction.

Validation:
- TEST_contactA.json:136072 differential calls, including65536 mask patterns,65536 signed16 player-X values through actual enemy contact,5000 randomized phase/autoscroll/gate/contact cases;268072 callback entries. Every nonstack write address/value/order exact. Actual mapper resolver and collision code execute.
- Savings171..219 CPU cycles per affected full scrolling tick;195 mean over all mask patterns. Unaffected half-phase/autoscroll paths identical.
- MATCHED_vs_round9_candidate_contactA_stage_3500.json:3500 generations, all867 gameplay RAM bytes after logic/producer exact; every OAM and all3500 commands/count/camera packets exact. Only established43 NMI counter/audio bytes excluded because real-field counts differ.
- contactA_nmi_boundaries_v3/RESULT.json:592 actual native NMI/RTIs (including natural nesting) across masks0000/FFFF/5555/AAAA; all8149 non-audio WRAM bytes, AXY/SP/interrupt return stack and mapper state preserved across each NMI. All observed completed store boundaries covered. Boundary counts include repeated breakpoint visits. Earlier v1/v2 harness failures were assumptions about expected NMI audio mutations and natural nested NMIs, not candidate failures; preserved for audit.
- contactA_unrolled.s reassembled by official cc65 tools matches helper byte-for-byte.

Native performance,6000 shooting fields, unchanged Mesen core/50MHz modeledGSU:
- round9:35late,37starvations,1queue drop
- isolated contactA:32late,35starvations,2queue drops
- combined round12:17late,20starvations,1queue drop
- combined round13 (+contactA):19late,21starvations,2queue drops
Thus not recommended for the primary release despite exact local behavior and cycle savings. Pipeline phase/input changes can move deadline collisions. These are functional-emulator results, not FPGA/hardware throughput.

Logic investigation:
Nonhalting playertrace_candidate_round9_stage_2100 reproduces all2100 native telemetry rows and initial state exactly. Missing logic cost is largely $8356 JSR $FF9F publish/service:1814 mean cycles across run (1246 in dense fields1760..1900, max7265). It services render work as well as publishing playerOAM. Full-player $F1FD is560 cycles including JSR; half-player286 plus OAM256. Dense-stage mask/unmask average372.6+229.8 per full tick. After all child calls and measured inline scrolling, residual bookkeeping is469cycles/tick. The old game60_nodebug.s is stale and must not be rebuilt over the actual round9 bank15.
