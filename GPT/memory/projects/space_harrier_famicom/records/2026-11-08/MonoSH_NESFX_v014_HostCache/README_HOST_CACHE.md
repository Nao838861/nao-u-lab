# v014 HostCache: independent row-cache experiment

Status: equivalence passed; end-to-end speedup not established. Do not merge this change into the final runtime on performance grounds. The separate configuration/getenv cache is not present here.

## Minimal change

Only core/Core/NES/Mappers/Homebrew/NesFx/Mode7Ground.hpp differs from v013 in runtime source. D10Mode7Row::Make(camera, cursor) is evaluated once per pending row, rather than once on every CPU-clock callback while the row is waiting. The pure result stays private until the original row clocks have elapsed.

- Start invalidates the cached row for a new camera.
- Each completed row invalidates it for the next cursor.
- Reset clears it through the existing default-object assignment.
- Serialize invalidates it for both save and load. No cache bytes or fields are added to the existing save-state format.
- Camera/cursor are changed by Start, row completion, Reset, and Serialize in the production caller; those paths are covered.
- No CPU/GSU/ground clock, setup latency, row-cycle count, memory wait, clear/copy/DMA model, ROM code, or image calculation was changed.

## Tests

C++ baseline-versus-cache comparison: PASS.

- 1,024 D10 cameras, 64 pending-row reset cases, 64 legacy-mode cases, 16 invalid/setup cases.
- 561,307 tick-state checks; 1,828,485 row comparisons; 2,008 exact serialized field/payload comparisons.
- Loading an old-format state into an object with a stale pending cached row is tested.
- Arithmetic-only microbenchmark, 2,000 requests at 14 clocks/Tick: 0.176343 seconds reference, 0.0150659 seconds cached (11.7048x). This is not game speed.

Fixed-input v013 ROM capture: PASS.

- All 1,200 native 256x240 BGRA frames and their timestamps match.
- All 8,416 trace lines are byte-identical.
- All 300 telemetry records are identical.
- Playfield frame-MD5 file is identical.
- This is the 1,200-field A/Start/horizontal-input scenario, not a complete stage or boss test. Audio waveform identity was not tested here.

## Actual wall-speed result

Sequential 30-second continuous probes with no debugger, Step, trace, AVI, controller override, or EmulationSpeed change:

- v013 original DLL: 229 PPU fields / 30.0005891 seconds = 7.6331834 fps.
- v014 row-cache DLL: 197 PPU fields / 30.0004273 seconds = 6.5665731 fps.

This single comparison did not show an end-to-end improvement. OS load, other systemwide processes, and thermals were not controlled. The arithmetic-only gain must not be presented as a runtime gain or a 60fps fix. The runtime experiment is intentionally left separate and is not a recommended final build.

## Pinned inputs and artifacts

- ROM SHA256: 63467a2d037dcf9d83d59e344ee186976a3ee1240206990cac23a0554e44bd5e
- Original DLL SHA256: ed35b9fe449cd289ee4a10c8763684f90464bbcd442784c76e8bc100f6e0b4d6
- Candidate DLL SHA256: 3761befcd32e8532f358acbd20b78b1aa5d01a0d558bb2afb6e29bcef9589ab3
- Minimal patch: results/mode7_host_cache.patch
- Source/ROM/label manifest: results/source_manifest.json
- Unit results: results/mode7_host_cache_unit.json
- Wall comparison: results/host_speed_comparison.json
- Native equivalence: results/v014_equivalence.json
- Capture: results/capture_v014_row_cache/
- Rebuild: python tools/build_palette_core.py
- Unit test: python tools/test_mode7_host_cache.py
- Capture verification: python tools/verify_v014_host_cache.py

The shared host source, SDK, link inputs, old versions, SD, and RBF were not edited. Compilation/link outputs are in this independent v014 workspace; the candidate runtime is runtime/MesenCore.dll.
