ENEMY 60 HZ MODULE

Inputs and entries
- Baseline: r11_logic60_trial_20261110/build/combined_MESEN.nes
- Module: build/enemy60.bin (1671 bytes), physical ROM bank 16, MMC5 value $90.
- enemy60_reset: $8000
- update_enemy60: $800E
- update_em160: $8033
- enemy60_step: $8058 (combined EM0 then EM1 entry; use one far-call)
- Shared half_phase: $67FB, 0 = original 30 Hz AI tick + live midpoint,
  1 = retained exact endpoint. Both wrappers run every field.
- Dedicated RAM: $6800..$6861 (98 bytes). Only tags/validity require reset.

Integration
1. Install the manifest patch into unused bank 16; original routines remain.
2. Replace original update_enemy / update_em1 calls with the matching wrappers.
3. Call after background bucket heads have been cleared/rebuilt, before collision
   and drawing. Each wrapper restores the pre-call heads after running old AI,
   then inserts its own live geometry exactly once into both linked lists.
4. Call enemy60_reset on game reset. Keep half_phase alternating 0 then 1.
5. Keep spawn timing and em1_fire_process on phase 0.
6. Do not also execute the original enemy routines outside these wrappers.

What changes
The AI/event timer, lifetime, animation, vulnerability and native EM1 movement
state still use one original update per two fields. Live enemy_cx, enemy_bot and
enemy_wz are midway between successive full-tick endpoints on phase 0, and the
exact endpoint on phase 1. These are the same fields read by drawing/collision,
not a display-only OAM effect. Their arithmetic uses a carry-preserving 9-bit
sum and restores exact endpoints, so odd deltas have no accumulated drift.
New lifetimes snap their first sample rather than blending with stale slots.

Original endpoint buckets are preserved. In particular, path 6 contains nine
samples where ep_zb differs from wz/32, so the old exported ep_zb tables are
copied into this module rather than approximated.

Validation
python src/build_enemy60.py
python tests/test_enemy60_cpu.py
python tests/test_enemy60_differential.py

Both pass. The focused 6502 harness executes the actual old ROM AI bytes and the
new module bytes for all 9 EM0 paths and all 9 EM1 lane/group combinations to
natural removal. It checks AI state, timers, firing-event ticks, lifetime,
midpoint geometry, exact endpoint geometry/buckets, mixed 8-slot linkage,
collision removal between halves, and EM0/EM1 same-type slot reuse.
The harness stubs external bullet creation and display-lifetime callbacks;
it is not a cycle-accurate NES or an integrated emulator/hardware test.

Limits
- Geometric movement/collision position is 60 Hz; discrete sprites and events
  retain the original 30 Hz cadence.
- Midpoint-first output adds up to one 60 Hz field of geometry delay relative
  to immediately displaying the full old step.
- First spawn sample is snapped. Subsequent movement is midpoint/end.
- No real-hardware throughput or integrated-ROM result is claimed here.

Optimization validation (2026-11-10)
- Unrolled fixed eight-head save/restore transfers.
- Removed unnecessary X stack preservation in endpoint bucket lookup.
- Midpoint publication consumes retained endpoints directly instead of copying
  four eight-slot arrays before original AI. $6810..$682F remain reserved.
- Combined enemy60_step preserves EM0-then-EM1 order with one caller far-call.
- Existing 18 full-lifetime machine-code tests pass.
- 1200-field deterministic baseline differential test passes: full game RAM,
  endpoint/tag state, fires and bucket links match across mixed spawns, reuse,
  collision deaths and invalid types. 42,202 fewer interpreter instructions
  (1,039,019 to 996,817), excluding the real far-call overhead saved by integration.
- Original AI calls retained even for empty families so native invalid-type
  cleanup semantics remain intact. No new timing/geometry approximation.
