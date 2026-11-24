# v012 no-debugger continuous host-speed probe

## Measured result

- Wall measurement: 30.000295 seconds.
- PPU progress: frame 1 to 248, **247 frames = 8.233253 frames per wall second**.
- CPU-clock progress: 7,367,795 cycles / 1,789,773 Hz = **4.116609 emulated seconds**.
- Emulation progress / wall time: **13.722% of real time**.
- Software-renderer image callbacks: **1,031** during the interval (34.366329/second). These callbacks are not one-to-one with PPU frames and must not be reported as gameplay frame rate or unique images.
- Debugger running before/after: **false / false**.

Under this particular concurrent-load, no-input, early-scene test, the host did not run in real time. This is not an isolated maximum-speed benchmark and cannot determine the machine's best achievable speed or full-stage/boss behavior. It also does not identify the bottleneck or establish the debugger's causal slowdown, because this is not a matched A/B test. The API's nominal 60.098811862 FPS describes emulated timing, not measured host delivery.

## Conditions and invariants

- Machine: [REDACTED_HOST_IDENTITY], with other measurements running concurrently (as specified by the parent). Other processes were not stopped, reprioritized or reconfigured.
- Existing `Host.__init__` used, then `LoadRom` called directly. `Host.load` was not used because it calls `InitializeDebugger` and sets debugger flags.
- No `InitializeDebugger`, `Step`, debugger memory APIs, AVI, trace, GUI or controller-override calls. No ROM, DLL or production-source edits.
- `SetInputOverrides` was intentionally omitted: source confirms it uses `WithDebugger` -> `GetDebugger(true)` and would create a debugger. The run therefore uses no input, including no START, rather than the shooting/movement benchmark workload.
- The existing image-copy work in `Host._notification` was retained, with one counter increment added. This is not a stripped-down raw CPU interpreter benchmark.
- Existing benchmark mapper `n8pro-racing-d10-format-probe` and GSU 50 MHz retained. No emulation timing or EmulationSpeed changes. The source default for EmulationSpeed is 100%; this was not changed, and no unsupported runtime getter was used.
- Measurement starts just after ROM load and includes boot/early activity. Timing sampled every five wall seconds. The console runs continuously and is stopped after the 30-second measurement.
- `GetTimingInfo` reads through `Emulator::GetTimingInfo` -> console, without requesting a debugger. `IsDebuggerRunning` uses the non-auto-initializing `GetDebugger()` default (`false`).
- Functional mapper log warns that copy arbitration/MCU are unsupported. **This host-speed observation is not FPGA/hardware throughput evidence.**

## Exact inputs

ROM: `[REDACTED_WIN_PATH]

SHA-256: `204b14d017a5c2425e56b2eb9d5543a029a42953fc9e2be5958e0eb8bc88b78a`

DLL: `[REDACTED_WIN_PATH]

SHA-256: `ed35b9fe449cd289ee4a10c8763684f90464bbcd442784c76e8bc100f6e0b4d6`

## Files

- `metrics.json`: exact timing samples and derived measurements.
- `probe_host_speed.py`: reproducible 30-second isolated test script.
- `run.log`: start, five-second samples, final result.
- `emulator.log`: ROM and dedicated mapper verification.
- `source_evidence.json`: exact source paths/lines establishing debugger side effects and safe timing calls.

Primary source anchors: `tools/host.py:18-44,54-61`; original host `InteropDLL/DebugApiWrapper.cpp:30-50,67-70,90`; `Core/Shared/Emulator.h:219`; `Core/Shared/Emulator.cpp:660-664,1033-1045`; `InteropDLL/EmuApiWrapper.cpp:148-152,179-182`.
