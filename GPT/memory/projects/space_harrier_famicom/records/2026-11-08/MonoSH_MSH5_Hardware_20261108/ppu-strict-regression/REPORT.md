# MSH5 strict PPU regression

Result: PASS. No hardware or USB was accessed. Only this independent test directory was written.

## Tested RTL

racing_display.vhd and racing_hud_route.vhd are exact copies of the current work/rtl and work-no-profiler/rtl files. Full SHA256 identities are in INPUTS.json.

## Completed coverage

- Full composition/copy/DSP regression: four continuous visible frames per run; phase offsets 0, 19, and 39 ns; all PASS. The four expected compositor images, back/front buffers, write protection, ownership, write pulse/hold, and line deadline assertions remain enabled.
- Additional four-frame run with reset during a white-mask copy at phase 19 ns: PASS. This supplements the color-copy reset exercised by the other three runs.
- All full runs use /RD Low 186 ns, High 186 ns, PSRAM read 110 ns and release 15 ns.
- Dots 337/339 now issue actual consecutive nametable reads. The normal one-dot gap and odd-pre-render omitted gap are modeled.
- Every scanline includes sprite dummy pairs, both pattern tables, deliberately different/reversed sprite fine Y, and the next-row prefetch. Scanline 239 includes its otherwise-unused row-0 prefetch.
- Each frame models NMI HUD writes leaving v=$23BA after 24 writes from $23A2, then pre-render begins from coarse X26/Y29/fineY0. Horizontal reload is represented in sprite dummy addresses; vertical reload at dot280 changes later dummy addresses to row0. Row0 background prefetch follows. Alternating frames exercise even/odd timing.
- Focused native route test: all 8,192 PPU CHR addresses at each integer phase offset 0..39 ns. It checks exact $1C000+a PSRAM addresses and valid data by 186 ns, attribute recovery, 337/339 recovery, HUD font recovery, and long-idle clearing. PASS: 329,240 checks.
- HUD ownership: all 16,384 addresses x two enabled states x two /RD states. Exact lower16 nametable/last attribute-row boundaries and no CIRAM/mapper simultaneous drive. PASS: 65,536 cases.

## Files and reproduction

- RESULT.json and strict-*.log: full-frame and HUD results.
- FOCUSED_RESULT.json and native-all-phases.log: focused 40-phase results.
- tb.vhd, tb_hud.vhd, tb_native_phase.vhd: testbench sources.
- test_changes.patch: full-frame changes against the original display-regression TB.
- python run_strict.py: analyze and run HUD plus all four full-frame configurations.
- python run_focused.py: analyze in its own focused-ghdl directory and run all 40 focused phases.

The original copied completion logs/results/GHDL library were not reused. The GHDL executable path is explicit in the runners.

## Limits

- This is RTL simulation, not hardware verification. It does not establish electrical margins, FPGA pin delays, metastability behavior, or the actual PSRAM part's timing requirements. No new physical timing signoff is implied.
- PPU and CPU register hardware are not instantiated. NMI and scrolling are tested through their resultant PPU address sequence; no $2006/$2005 register implementation is verified.
- Full composition/DMA under load is tested at offsets 0/19/39, not all 40 offsets. The all-40 focused test has no copy/DSP workload.
- Horizontal/vertical nametable select aliases are not physically modeled in the full-frame memory image. Ownership is nevertheless exhaustively checked across all four nametable ranges by the HUD test.
- This remains a dedicated v019 ABI test: BG table0, 8x16 sprites, zero scrolling, mode4. Arbitrary mid-render mode/scroll changes and general-purpose mapper compatibility are outside coverage.
- One inherited harmless GHDL warning remains: readppu's parameter named value hides an unused outer value variable.
