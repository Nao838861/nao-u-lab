# v011 targeted CPU starvation event investigation

## Conclusion

Both missed launches are caused by a long `_core_draw` interval without `renderer_yield`, not by `_core_tick` in these two cases. The GSU had already stopped and the next immutable packet was prepared, but upload did not run until drawing returned. Yielding after every four completed drawing callbacks directly addresses both observed stalls. Core-stage yields can improve other situations, but alone cannot fix these two because logic had returned before GSU STOP.

## Reproducibility and scope

- Frozen ROM: `[REDACTED_WIN_PATH]
- ROM SHA-256: `7b00cf62569c1d1dfebdc24c4c4e57dea990ab9ccb2c21bc78e76d0e6d382e40`
- Labels SHA-256: `720374c850d75f38b26d34f08d7df33c0ba1422d158249c7b186c517760303a7`
- Dedicated copied DLL SHA-256: `ed35b9fe449cd289ee4a10c8763684f90464bbcd442784c76e8bc100f6e0b4d6`
- Controller-only replay of the original 2400-field input, ending at field 2008 after the second requested interval. START/SELECT remain off; A alternates every four fields; horizontal input keeps the existing 120-field phase pattern.
- Exact original four-field controller-change CPU clocks were reused, avoiding PPU-step re-anchoring after CPU breakpoints. All 502 checkpoints matched CPU clock, PPU field, selected renderer/logic counters, command counts, and the nine recorded gameplay variables in the original extended-stage telemetry.
- CPU breakpoints were enabled only for the 0-4 sanity window and fields 1724-1744 / 1984-2008. 1,413 events. No ROM/source modification or debugger RAM writes. No clock, RBF, mapper-timing or gameplay acceleration changes.
- `*.sanity_attempt1` / `*.sanity_attempt2` are preserved failed harness validation attempts and are excluded from all conclusions. Final `cpu_events.json` has `complete=true`, no failure and zero replay mismatches.
- Relative fields follow the original benchmark PPU origin, not the internal `frame_count` counter. Milliseconds use 1,789,773 CPU cycles/second.

## Exact event timelines

| Event / measurement | Missed field 1737 | Missed field 1997 |
|---|---:|---:|
| Logic returns (CPU clock) | 52003801 | 59748121 |
| Draw begins (CPU clock) | 52005843 | 59750161 |
| GSU STOP (CPU clock) | 52008622 | 59751131 |
| Draw returns (CPU clock) | 52022836 | 59768905 |
| Upload begins (CPU clock) | 52022895 | 59768964 |
| NMI begins (CPU clock) | 52024157 | 59767085 |
| Upload returns (CPU clock) | 52026566 | 59771241 |
| GSU work (ms) | 6.709240 | 6.473440 |
| STOP to upload (cycles) | 14273 | 17833 |
| STOP to upload (ms) | 7.974754 | 9.963833 |
| Draw wall time (cycles, includes NMI if any) | 16993 | 18744 |
| Drawing callbacks | 14 | 15 |
| Yield calls during draw | 0 | 0 |
| Remaining time at callback 5 entry before NMI (cycles) | 12455 | 11778 |

- Field 1737: upload starts only 1,262 cycles before NMI. Its 3,671-cycle wall time includes the interrupt. At NMI entry, `commands_ready=1`, `preload_prepared=1`, `preloaded=0`. Upload returns 884 cycles after NMI return, then publishes `preloaded=1`. Current-frame copy had already finished at CPU 52013900; commit succeeds at 52024257. This is CPU supply starvation, not GSU/copy deadline failure.
- Field 1997: NMI starts while drawing the last callback. Draw returns 1,820 cycles after NMI entry, and upload starts another 59 cycles later. At NMI entry, `commands_ready=2`, `preload_prepared=1`, `preloaded=0`. Copy had already finished at CPU 59756409; commit succeeds at 59767185. Again the launch is missed only because the next upload was not serviced.
- The missed 1997 launch leaves a backlog. At CPU 59793481 the producer publishes a new pair, bringing `commands_ready` to 3. At CPU 59806374 the next producer sees 3 and chooses suppressed rendering. Even though upload later reduces ready to 2, the suppression decision stays set, and at CPU 59818012 the producer has added `queue_drops=2`. This occurs before the NMI labelled 1999, explaining why the coarse telemetry first reports the drops there.

## Placement and implementation cautions

1. Call the existing register/flags-preserving `renderer_yield` after a completed draw callback, every four callbacks, while still allowing the ordinary post-draw service. Do not call it halfway through a render packet write. At the fifth callback entry in these unmodified traces, the GSU is already idle and the packet prepared, with 12,455 / 11,778 CPU cycles remaining before NMI. The measured uploads cost about 2,146 / 2,277 cycles excluding interrupt time, so the proposed cadence has clear local headroom. This is a timing-supported placement recommendation, not a measured v012 result.
2. Retain queue publication only after both immutable packets and their metadata are complete. `commands_ready` identifies previous completed data while the new pair is being built; yielding must never expose the partial current packet.
3. Preserve P/A/X/Y through the yield, preserve mapper windows, and audit scratch ownership: existing `copy_commands` restores $5115/$5116 and uses `copy_src`; preparation uses `oam_dest_mid`. New yield locations must not have live values in those renderer scratch locations. Do not recursively yield inside upload, preparation, or NMI.
4. Keep NMI the sole owner of GSU launch/commit. Keep the existing idle/fill checks before upload. Do not move a long upload into NMI or delay upload unnecessarily until copy completion; the current implementation permits it after GSU STOP and fill idle.
5. Keep the proposed between-Core-stage yields as additional coverage, but they are not the causal fix for these two misses. After integration, run the frozen-style full 2400-field test and compare CPU late, queue starvations/drops, deadline misses, commit gaps, source command/camera equivalence and GSU cycle maxima. Scheduling changes may alter input latency, so verify logic/input behavior separately rather than expecting every renderer counter to be identical.

## Source anchors

- `src/cpu.s:311-318`: `_core_tick` call and logic return.
- `src/cpu.s:319-350`: producer checks queue pressure before drawing, calls `_core_draw`, only then services the renderer; suppressed pair increments drops by two.
- `src/cpu.s:389-406`: pair metadata and final queue publication.
- `src/cpu.s:410-424`: register/flags-preserving yield wrapper.
- `src/cpu.s:426-475`: preload preparation, GSU/fill idle checks, command upload and publication.
- `src/cpu.s:478-502` and `src/command_copy_unrolled.inc:1-7`: mapper restoration and copy scratch.
- `src/cpu.s:567-578`: preload camera scratch pointer.
- `src/cpu.s:729-750`: NMI rejects a missing preload, increments starvation, or starts the ready packet.

## Evidence files

- `cpu_events.json`: full validated event dataset, hashes, breakpoint map and all checkpoints.
- `cpu_events.jsonl`: streaming event log.
- `trace.csv`: independent mapper GO/STOP/copy/commit clocks.
- `key_events.csv`: focused two-gap CPU timeline.
- `analysis.json`: derived numeric results with event/state details.
- `profile_gap_events.py`: controller-only reproducible harness.
- `run.log`: complete execution and verification result.
