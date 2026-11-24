Isolated exact UV clipping optimization, 2026-11-10

Candidate: candidate_clip3.nes
SHA256: 571dc599ca91fe98e5471fd42304ede603451cbb824cac19c34cab6394f73667
Baseline: candidate_hotspots2.nes
SHA256: 3a5af3836b47b2aaac13c141e9703b2c049d1a66e64d40291e56155867b48be6
Accepted build was not changed. No assets, timing model, clocks, core or gameplay changed.

Only patches: physical bank82 CPU $D761-$D78F (47 bytes), $D7E8-$D816
(47 bytes). No new ROM space or RAM. Original source labels for these exact
blocks were verified against baseline machine bytes. No relocation of any code.

For partial clips with skip>=4, replace bitwise multiply/add loop with two MMC5
8x8 products. UV = UV + skip*step (mod65536) remains exact for signed16bit
steps, since their raw16bit residues give the same modular product. Step low
and high bytes are multiplied separately; only the low byte of the high product
contributes. Original culls and skips1..3 loops are untouched. rt and clipped
axis finish at zero as before. rdu/rdv stay unchanged. Return flags are exact
because the untouched right/bottom arithmetic overwrites temporary flags.

New documented clobber: MMC5 write-only operand latches $5205/$5206.
These are not normal RAM. Both operands are initialized before each operation.
All existing direct multiplier sites were classified; each arithmetic sequence
sets both operands before reading, with no yield/render callback in between.
The bank28 ground helper added in round6 was checked separately as well.

AUDIT_clip3*.json recursively traverses actual NMI/IRQ control flow and all
callees, including FFDB/bank14 DMA and bank89 audio. 747 instructions for the
baseline and clip3, 1425 for round6. No indirect jump/store, and no direct or
indexed store can reach the multiplier registers even with arbitrary8bit index.
Audio bank89 exactly matches source-backed build bytes. Thus interrupts cannot
clobber a pending product. Audit is tied to each recorded ROM hash.

TEST_clip3.json: 234,077 cases PASS in105seconds. Every clipcount0..256 x
width/height0..255 independently for both axes, every16bit step, signed-step
boundaries, overflow/culls, arbitrary UV, random geometry and12,000 actual boss
adapter/capture/packet calls. A/X/Y/P/SP/PC/bank and all memory including rt and
stack are exact, except explicitly changed multiplier latches. Packet fields
are also checked against an independent intersection/UV formula.

The new arithmetic block costs66 cycles. Per-axis savings:
 skip1..3:0; skip4:45(left)/47(top); skip8:71/74; skip16:97/101;
 skip64:149/155; skip128:175/182; skip254:289/290.
For b=bit_length(skip), p=popcount(skip), left savings =
 45 +26*(b-3)+19*(p-1). Top saves a further b-p cycles because its old branch
crossed a page on each zero bit. Both axes together save up to579 cycles.
No cycle regression on any tested path. These are CPU instruction savings,
not an FPS forecast. Native frame/visual/gameplay integration remains required.

Reproduce in this directory:
 python build_clip3.py
 python test_clip3.py
 python audit_clip3.py
 python audit_clip3.py candidate_clip3.nes
 python audit_clip3.py candidate_round6.nes
Build uses the existing official cc65 toolchain specified in build_clip3.py.
clip3_left.s and clip3_top.s are the complete assembled replacement source.
The source checkout and accepted ROM are left untouched. Integrate only the
manifest's two patches after verifying its baseline_bytes at each offset.

Test limitation: no asynchronous PPU/GSU/NMI timing simulation. renderer_yield
is a balanced no-work stub in full boss capture tests only. Parent performs
native matched-state and throughput runs. Audit does not prove arbitrary future
code can reuse the multiplier safely; rerun if NMI or arithmetic callers change.
