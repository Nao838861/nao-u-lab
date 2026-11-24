# Independent double-scroll capacity review

## Recommended exact optimization

In racing_display.vhd retain u and v as signed(31 downto 0), but declare du and dv signed(23 downto 0). Load both from signed(row_word(23 downto 0)). See display24.patch. The only changed RTL file in display24 is racing_display.vhd; QSF and SDC are byte-identical to the matched far-only baseline.

The producer mode7_dsp already holds du/dv as signed24 and sign-extends them into the row table. Therefore for every generated row, the old display load and sign extension during u/v addition equal the new24-bit loads and arithmetic. This applies to ground, invalid-zero rows and mountain du=65536,dv=0. It does not promise compatibility with arbitrary corrupted/manually injected row-table data violating that producer contract.

## Measured result

Baseline6148LE/2447FF becomes6132LE/2433FF;23DSP9-equivalents,30M9K and392LAB unchanged. Display entity itself756LC/380FF becomes706LC/366FF; other fitter packing changes reduce the total gain to16LE. All48 constrained timing checks pass with minimum setup+.288ns and hold+.124ns, compared with baseline+.148ns/+.105ns. Exact evidence and hashes are in CAPACITY_RESULTS.json and display24/output_files.

## Verification

-90 adversarial camera cases, stalled row ACK, CPU writes during busy, reset and commits: exact row equivalence plus signed24 du/dv assertions passed.
-7 additional generated cases including disabled/enabled mountains, immutable accepted capture, rejected starts, alternating banks and game-pitch identity:5376 expected row words plus du/dv width assertions passed.
-Original strict display pipeline passed native CHR phase tests, exhaustive HUD ownership, memory-read timing at PPU phases0/19/39ns, and white-frame stop case. Logs and case durations are in display24/tests_result.json.

## Architecture review

Packing nearX into u bits8..0 and explicit dual-enable into bit9 is preserved by mountain du=65536. An8-bit-only near cache is sufficient because screen x moves monotonically, with a compulsory fetch at x=0 or nearCoord low2=0. Fetch completion must emit or fall back directly rather than return to the same miss check. Current r11 states11/12 follow that condition, and opaque versus transparent paths each advance u/v once per pixel. This is read-only code review, not verification of the integrated r11 design.

## Rejected experiment

Depth32 to25 plus an explicit original32-bit range-rejection flag passed the90-camera regression and timing but increased total LE6148 to6156. Do not use it as a capacity optimization. It is retained separately at this directory root; do not copy its mode7_dsp into the live design.

## Limits

The successful results above are for the isolated far-only baseline plus display24. Integrated double-scroll and new bottom-background/HUD changes require their own final simulation, fit and STA. Timing covers current constrained internal paths, not external PSRAM or hardware electrical signoff. No hardware, USB, SD or physical console operations were performed.
