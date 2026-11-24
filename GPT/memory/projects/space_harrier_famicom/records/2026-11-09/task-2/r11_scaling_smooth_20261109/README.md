# r11 display-only scaling experiment

Tested candidate SHA-256: 26ef9672d2de451a8694bbd7c74263eba4141d7c2ccbcc79cbb1bce209ece9f3.
Base: final r11 CPU-supply Mesen ROM bafaa708cad910baa724946ab1a3011c03e9dd7ba2fd07dde20fa771b10ec8b5.
No FPGA, cartridge, device or hardware action was performed.

## Findings

The current NES scenery path has 56 size rows, sampled from a 111-point monotone Hermite curve. It inserts a 60 Hz midpoint by averaging previous/current geometry, including size. Therefore the display already has 111 time positions across the 56 logical depth positions, even without a 112-entry size table. Directly indexing the odd-depth Hermite samples changes the current scenery midpoint sizes by at most one pixel. The maximum per-field size jump is unchanged. EM0 already keeps its original quarter-depth: 224 width/height rows indexed by the exact original enemy Z.

The missing smooth paths were closed EM1, ordinary enemy bullets, boss bullets, and boss parts. Those still used 13/16 discrete source sizes. Their midpoint averaging reduces each transition but does not remove the long holds between size changes. Open EM1 animation is a separate five-pose sequence and remains unchanged.

The NES depth sorter is eight bucket heads, with Z>>3, not one bucket per size/depth value. Sorting precision and display lookup precision are already independent. This experiment leaves the sorter, movement, collision and all original gameplay state unchanged.

## Candidate

- Smooth only the missing display size families with 56-point monotone curves and the existing 60 Hz midpoint renderer.
- Keep original source textures, texture families, endpoints, open EM1 poses, bullet rotation, explosion timing and player/shot OAM.
- Keep closed EM1 and boss scaling centered on their original logical centers rather than on an old-size quantized bottom.
- Keep all original exported draw entrypoints, render_geometry, interpolation, CPU scheduling, mapper and GSU code at the same addresses.
- Add no RAM, ROM bank, ROM bytes or bank switch. Replace only ten fixed-position ranges in render bank82.
- Reuse old size/UV tables plus unreachable UV low-byte entries. Closed EM1 source extent14x15 only reaches width<=28,height<=30. Boss-bullet extent31 only reaches height<=62. New data uses step14[29..84], step15[31..86], step31[63..118]; the shared center helper uses step15[87..146]. Original high-byte UV tables stay untouched.
- No use of fixed-bank FEC0..FF7F. That is live EM0 exact-Z data, not free space. No use of bank83, DF80..DFE9 or other teams' new areas.

## Verification

Each baseline/candidate stage and boss run: 3000 Mesen fields, 1500 game updates, 3000 displayed packets. Late fields, deadline misses, dropped packets and starvations were all zero. Functional dedicated Mesen, original SELECT invincibility, original START skip for boss, no RAM edits.

Stage GSU mean 2.921440 -> 2.908310 ms, p95 5.766640 -> 5.690660 ms, max 8.908400 -> 8.632940 ms.
Boss GSU mean 4.539669 -> 4.348589 ms, p95 8.952540 -> 8.739100 ms, max 11.741160 -> 11.622720 ms.

Read-only, pre-core-tick identity under fixed per-NMI controls: stage1501 generations and boss301 generations. All 151 gameplay fields/850 bytes, native OAM256 bytes, and JOY bytes matched exactly.

Entry-to-capture CPU path, matched boss samples: Boss mean272.15 -> 300.47 CPU cycles (+28.33 per part, about0.143ms/generation at nine parts). BossBullet271.79 -> 269.36 cycles. This excludes GSU work, which is measured separately above. Normal enemy bullets probe at314 cycles versus316..317 before. Closed/open EM1 probes lie269..317 versus271..272. Stage CPU-address breakpoint records can alias other mapped banks, so do not use their raw mixed means; results/CPU_SUMMARY.json separates the compact path samples from those aliases. The fixed-field performance and exact gameplay identity tests above are the authoritative end-to-end checks.

Static monotone Z55->0 sweep, with the unchanged midpoint at each logical step, maximum per-field dimension jump:
- Ordinary bullet width/height: 4/4 -> 2/2 pixels.
- Boss bullet: 6/6 -> 3/2 pixels.
- Boss head: 8/11 -> 2/2 pixels.
- Boss body: 8/5 -> 2/1 pixels.
- Closed EM1: 2/2 -> 1/1 pixels.
These are deterministic full-depth sweep values, not an assertion that every live object traverses one Z per update.

The initial failed trial incorrectly swapped the head/body source index families and was rejected. Its results are kept only as failure evidence in gameplay_boss_candidate and FAILED_INITIAL_BUILD.json. The accepted candidate is candidate2, hash26ef9672..., also copied to candidate_MESEN.nes. Correct source families: head uses sprite index16+, body uses index0+, and the body size caps at12 at the far end.

## Apply to an integrated current ROM

python tools/apply_scaling.py INPUT.nes OUTPUT.nes

The script first checks every destination range against either the untouched bafaa bytes or the already-applied new blob. It stops on any other change. It preserves all bytes outside those ten ranges, including art, ground correction, title, latest CPU, GSU and mapper differences. It writes an output manifest. This was verified to reproduce the tested candidate exactly from the base.

Source: tools/build_scaling.py, src/*.s, src/*.cfg.
Reproduction: python tools/build_scaling.py (requires the unchanged original combined_rom source tree at its recorded sibling path and installed cc65).
Evidence: results/VERIFIED_SUMMARY.json; results/gameplay_{stage,boss}_{baseline,candidate2}/RESULT.json; identity_zero_* traces.

Hardware remains untested. After integrating with other changes, run the final combined-ROM checks again.
