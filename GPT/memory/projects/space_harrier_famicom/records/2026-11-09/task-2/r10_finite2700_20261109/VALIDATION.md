# r10 finite2700 local validation

Physical diagnostic only (not the playable ROM): MonoSH_r10_EM1_Mountains_FINITE2700_UNTESTED.nes
SHA256 5772631dc488973a40203ef3c393421d7f22b1727a5d63ba823fee952839ce2e
Source SHA256 e814bb9c4725252f936dd65db281a2d6e79bacaabca562d074fb82a8d53c9dac
Matching mapper supplied by other worker: d344be0ba48399f212933526c9d4a2b1ae3ae2566be81006199fd7d87c192974 (not tested here).

## Changed regions
727 bytes differ, restricted to unused bank127 (3257-byte allocated diagnostic), 21-byte fixed bridge F7F2..F806, and three 3-byte instruction replacements. Original fixed CODE/RODATA/PRG_FIXED ends F7F1. Main replacement is LDA frame_count at E1C6 (service_logic entry), not either service_render call. NMI replacement is INC6008 at E6BB; input replacement LDA input_current at E7B8. Dispatcher at A000 discriminates stacked caller return address. It preserves X/Y, actual5115 bank and original flags except the exact emulated instruction N/Z result. Input changes A to table value. NMI preserves A and increments6008. Main produces original LDA0300 result. No shared dispatch scratch RAM.

All original banks1..126, all CHR (GSU, MSHS and packed mountains), all EM1 banks120..125, header, and startup A9 01 8D 95 4F at file235 are unchanged. See PRESERVATION_PROOF.json. Existing source and playable ROM were read only, and their source ROM hash was reverified. Only this independent directory was written.

## Tests
PROTOCOL_TEST.json: nine encoded success/failure paths; 67,500 input cases; 196,608 all256bank/all256flag hook cases; 59,052 nested NMI boundary cases over three contexts, seven bank values,13 relevant input fields and stack entry40/80/D0/FF; threshold2700 and watchdog on all hooks. Original110-byte RAM return stub is byte-identical to previously physically successful stub. Success reads only FFFC/FFFD after remap while executing from RAM; failure halts safely without a blind reset. Maximum tested no-completion path2297603CPUcycles; frozen-idle timer path1705043cycles.

mesen/RESULT.json: exact physical artifact, expected unsupported MCU completion E4 at PPU2787, NMI2700, reason1. All15 stage/pose combinations,24uploads,0conflicts,0deaths,status0. X[-112,0],Y[56,201],ground[0,32]. SELECT10..13, neutral until2519, movement+A2520..2679. No emulator host controller/RAM/state writes. Recorded video and telemetry present. This physical artifact leaves the old MSHS scenery flag OFF; new4F95 enable is not supported by this emulator.

emulator_sibling/mesen/RESULT.json: separate Mesen-only artifact SHA05263ffd86da61e9142661d801b8393d04fea8c6c9881b3e36c2739eec2321a2; one byte at1159204 changed0->1, never use it on hardware. Same all15pose and exit outcomes, mountains visually confirmed in30s and43s captures. MesenCore SHA344a1cf465444bdd13192da5236c99e92a215641157f242722fdc65e0949bb93.

## Bounds and limitations
Exit request after2700NMI (~45s at60Hz); exact emulation reaches bounded MCU-failure halt by2787PPU (~46.5s).60s capture budget has margin, but this is not an electrical/MCU completion guarantee. Physical menu return has not been tested for this artifact. Requires adequate uncorrupted stack and continued CPU/NMI execution. Entry SP40..FF tested; arbitrary wrapping stack is not supported. Diagnostic overhead causes timing counters (physical artifact279late fields,26queue drops,4deadline misses,23starvations) and is not normal-playable-ROM performance signoff. Synthetic nested handler validates gateway semantics, not a whole-FPGA timing proof. No USB, SD, cartridge, capture-device, reset, or hardware commands were issued.

Source/build scripts and listing/labels: build_finite.py, gateway.s/.lst/.lbl/.bin, diagnostic.s/.lst/.lbl/.bin, return-stub.s/.lst/.lbl/.bin, test_protocol.py, test_mesen.py. Await independent review and parent release before hardware use.

## Complete real-NMI and reachable-stack audit
STACK_NMI_AUDIT.json and stack_audit/script.log close the hook-SP gap with read-only opcode callbacks across a fresh exact-ROM run. All69,271main hooks had SP>=FD; all2,700NMI hooks and2,699input hooks had SP>=E5. Lowest post-start stack write was01DC. Complete returning real NMI entry-to-RTI duration <=3179CPUcycles versus minimum observed entry interval29775cycles. Maximum nesting was1. The final2700th NMI intentionally enters terminal instead of RTI. Thus the exact emulated finite workload has ample stack headroom and no recursive NMI; model boundary-injection tests remain complementary, not a claim that arbitrary full real-NMI injection was executed. Hardware timing/electrical behavior remains untested. Hardware use is PAUSED by parent; results only, no release.
