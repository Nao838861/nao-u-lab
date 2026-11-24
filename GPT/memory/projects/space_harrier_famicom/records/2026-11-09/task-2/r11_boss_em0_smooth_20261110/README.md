# Boss and EM0 display precision patch

Baseline: `../r11_ground_exact_sfc_20261110/build/ground_exact_MESEN.nes`

Baseline SHA256: `0f5dafd3908afce3306a225f81a8b01a5c66333a01f4e04fc193bf29d08bcf1f`

Candidate: `boss_em0_smooth_MESEN.nes`

Candidate SHA256: `eb9e5dea3f03e5540f7f030f61a9d2455c28b323808cc227ceda639ed2317d21`

## Changes

Boss rendering reads the discarded half-depth and half-coordinate bits from the existing old/endpoint caches, only for surviving active-to-active midpoint parts. Scale tables now have112 entries instead of56, with every original endpoint preserved. Head/body motion also recovers one physical pixel lost when integer logical coordinates were doubled. Newborn parts, dying state, invalid caches and endpoint fields use original geometry.

EM0/EM1 midpoint publication still writes exactly the original integer gameplay coordinates and retains the same AI endpoints. Two small hooks additionally capture the discarded CX/Z bits into display-only RAM. EM0 rendering uses the CX bit to recover one-pixel motion and the Z bit to interpolate existing adjacent width/height values. EM1 rendering is unchanged. No collision or AI field is replaced with a display value.

## Allocation

- Bank22 `$8000..$82CD`: boss render setup,112-entry scales. Entire baseline bank22 is asserted zero.
- Bank82 `$C62A..$C691`: replaces existing boss-only renderer with direct save/map/call/restore trampoline and EM0 display helpers. Two small hooks in the existing EM0 render path.
- Bank16 `$8800..$8813`: two fraction-capture helpers in checked zero space. Two3-byte hooks replace the corresponding existing stores.
- RAM `$6862..$6871`: display fraction arrays,8CX plus8Z bytes. Existing valid-old/phase fences make separate reset unnecessary.
- No other RAM, bank3, bank13, bank20 or banks23+ are allocated.

Do not put appended code immediately after enemy bucket tables: original indexed reads can reach zero padding up to table+255. The chosen `$8800` location is beyond every such read window. This was caught by the all-pattern differential test.

## Validation

Run `python build.py`, then `python test.py` with the existing cc65 and Python installations. `MANIFEST.json` contains baseline-checked before/after bytes for every patch and can be combined with disjoint patches. No baseline is overwritten.

`TEST.json`:29,732 actual6502 render/fraction cases and7,272 original-AI fields across9EM0+9EM1 complete lifetimes passed. All non-display gameplay RAM, endpoint caches, draw/collision links and fire callbacks match. Boss endpoint geometry is exact across every56depths/9parts and carry/clipping boundaries. EM0 covers every224depths/8slots, low-bit combinations, phase and fresh-cache cases. Mapper bank/shadow is restored before common render continuation.

`QUANTIFICATION.json`: monotone depth sweep head-height maximum jump4to2pixels, body-height2to1pixel, widths3to2pixels. Every original endpoint scale is unchanged. `TRAJECTORY.json` records all9EM0 actual-AI paths:2004active samples,325restored one-pixel X midpoints and130fractional-depth scale changes. Exact midpoint X matches the sum of adjacent original logical endpoint X values.

Instruction-count cycle overhead per rendered boss:39-42cycles at endpoints,135-138at active midpoints. EM0 renderer:54-71endpoint/fresh,83-123midpoint. Capture adds42cycles per interpolated enemy only on phase0. These are focused CPU measurements, not a complete field-throughput measurement.

Native Mesen full-game/GSU throughput, screenshot review and physical-hardware validation are not claimed here. Parent integration should check these using the dedicated ground-exact MesenCore runtime. The user-facing visual change can shift display geometry by at most the recovered sub-unit rounding at existing positions; collision remains exactly baseline.
