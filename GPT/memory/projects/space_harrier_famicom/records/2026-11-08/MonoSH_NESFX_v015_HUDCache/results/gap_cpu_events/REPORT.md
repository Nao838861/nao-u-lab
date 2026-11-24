# v015 field 2002 CPU starvation diagnosis

## Result

The remaining gap is **CPU packet-production lateness**, not a missed cooperative upload opportunity. During the critical draw, the previous packet is already preloaded and `commands_ready=0`. The GSU stops later during midpoint generation. Eight existing midpoint yields occur after STOP, all with `commands_ready=0`: there is no completed immutable pair to upload. Midpoint completion, OAM preparation and pair metadata/publication must finish first.

- GSU STOP -> next upload: **17,273 cycles / 9.650945 ms**.
- Actual GSU work: 258,329 cycles = 5.16658 ms. Copy finishes well before NMI; `deadline_misses` stays zero.
- At the missed NMI: ready=2, prepared=1, preloaded=0; command copying is in progress.
- **Copy-only shortage: 738 CPU cycles. Preloaded-flag publication included: 770 cycles.**
- Reaching the next `service_logic` frame-count read before that NMI requires **817 cycles of advancement in this fixed timeline**. This explains both starvation and late=1.
- A claimed approximately 950-cycle midpoint optimization has approximately 133 cycles of local margin for both conditions, subject to remeasurement of instruction alignment and altered scheduling. The v016 ROM was not run in this investigation.

Increasing draw callback yields from every 4 to every 2 or every 1 does **not directly fix this gap**: those calls would still find an existing preload or an empty queue, and add CPU work. Earlier scheduling phase changes could have secondary effects, but they are not measured here. Core-stage yields likewise cannot publish a pair which does not yet exist. Prioritize reducing midpoint/OAM/command-production cost while retaining atomic publication of packet, camera and OAM data.

## Exact critical timeline

All times below are absolute emulated CPU clocks. Fields use the original benchmark PPU origin.

| Event | CPU clock |
|---|---:|
| Logic begins | 59855332 |
| Logic returns | 59866602 |
| Producer begins | 59870766 |
| Original draw begins | 59870917 |
| Original draw returns | 59890264 |
| Midpoint begins | 59890333 |
| GSU STOP | 59897170 |
| First post-STOP midpoint yield, ready=0 | 59897877 |
| Current-frame copy finishes | 59902448 |
| Midpoint returns | 59905633 |
| OAM preparation begins | 59905639 |
| OAM preparation returns | 59911468 |
| Pair published, ready becomes 2 | 59912627 |
| Next upload begins | 59914443 |
| NMI first opcode breakpoint | 59915989 |
| Current frame commits | 59916093 |
| NMI final RTI breakpoint | 59917122 |
| Upload returns | 59917866 |
| service_logic begins | 59917941 |
| Next core tick begins, late=1 | 59918051 |

STOP-to-upload breakdown: remaining midpoint 8,463 + wrapper transition 6 + OAM 5,829 + pair finalization 1,159 + preload preparation/dispatch 1,816 = **17,273 cycles**. No yield cadence can remove this work while the queue is empty.

## Deficit arithmetic

The breakpoints are before the first NMI opcode and before its RTI. Therefore the full CPU suspension is:

- NMI body breakpoint span: 59917122 - 59915989 = 1,133 cycles.
- Add 7 interrupt-entry cycles and 6 RTI cycles: **1,146 cycles**.
- Interrupted upload wall duration: 59917866 - 59914443 = 3,423 cycles.
- Pure copy duration: 3,423 - 1,146 = **2,277 cycles**, matching uninterrupted uploads in this trace.
- NMI acceptance starts at 59915989 - 7 = **59915982**.
- Upload CPU budget before acceptance: 59915982 - 59914443 = **1,539 cycles**.
- Copy shortage: 2,277 - 1,539 = **738 cycles**.
- The frozen ROM's `upload_end` tail through `STA preloaded` costs **32 cycles**, so publication shortage is **770 cycles** (0.430222 ms).
- Without the interrupt, service_logic would begin at 59917941 - 1,146 = 59916795. Its first `LDA frame_count` takes 4 cycles. Read completion minus NMI acceptance = 59916799 - 59915982 = **817 cycles** (0.456482 ms).

These are exact arithmetic on the measured frozen timeline, not a promise that arbitrary edits shift every later event linearly. Allow a few cycles for changed interrupt instruction alignment and confirm both counters on the new ROM. With the old timeline, 950 cycles of saved midpoint work exceeds the larger threshold by 133 cycles.

## CPU budget context

The critical producer consumes 41,861 wall CPU cycles: draw 19,347 (including NMI), midpoint 15,300, OAM 5,829 and other producer work 1,385. The preceding logic interval is 11,270 cycles including its NMI.

Across producer starts at fields 1988 through 2000, six two-field intervals average 61345.667 cycles against a nominal 59561.011-cycle two-field budget. The last interval is 63,794 cycles. This is a short dense-workload burst consuming the available queue reserve, not evidence that every gameplay interval exceeds budget. A new version still needs the full fixed-input run, not only this local threshold.

## Validation and artifacts

- Frozen ROM SHA-256: `b6a16c4a87de8e6f2366c1702b54bdde6fca2660c515805f05982108c349bfe0`.
- Frozen labels SHA-256: `e89b2990a71767e1f2fca99d5ce24bd1b08194292c14b77b2c1ec9bbf2321cdc`.
- Frozen DLL SHA-256: `3d77e7a6ccec5b76483142a46fb9c42a1e38a2fe82b41e2d98626411f86d4a09`.
- Input: identical A every four fields and 120-field horizontal pattern; START/SELECT off. No emulated RAM writes, ROM/source modifications, RBF changes or timing changes.
- Replay through field 2020; detailed CPU events only fields 0-4 sanity and 1960-2020.
- **505 checkpoints match** original CPU clock, PPU frame, selected renderer/logic counters, command counts and nine gameplay variables. **4,474 events; complete=true; zero mismatches.**
- Final observed counters: starvation=1, late=1, drops=0, deadline_misses=0.
- `cpu_events.json` / `.jsonl`: full event evidence; `trace.csv`: independent mapper STOP/copy/commit timing; `key_events.csv`: focused critical path; `analysis.json`: all numeric derivations; `profile_gap_events.py`: reproducible controller-only harness.

## Source anchors

- `src/cpu.s:281-317`: service ordering and late-fields check.
- `src/cpu.s:338-357,393-410`: draw, midpoint/OAM preparation and final pair publication.
- `src/cpu.s:430-478`: an empty command queue returns immediately; completed packet upload and publication.
- `src/cpu.s:735-754`: NMI preload requirement/starvation.
- `src/cpu.s:854-991`: OAM preparation, including immutable pair copies and interpolation.
- `src/render_adapter.s:136-144`: existing every-four-captures draw yield.
- `src/interpolation.s:146-150,326-337`: validity clearing, per-command yield and final validity/dirty loop.

This is dedicated-emulator scheduling evidence. It does not establish FPGA throughput or PC real-time speed.
