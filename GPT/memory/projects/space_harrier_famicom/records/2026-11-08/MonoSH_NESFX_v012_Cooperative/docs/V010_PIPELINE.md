# v010 display pipeline

This version preserves the original NES 30.05 Hz gameplay calls and builds two display packets per original draw: an interpolated midpoint and the current original state. It does not run the game logic at60 Hz.

## Ownership

- The original game writes its own state and native OAM exactly once per original draw/tick phase.
- Two independent scene pairs hold four immutable GSU command packets: midpointA/currentA and midpointB/currentB. Queued metadata includes command count, original scene generation, midpoint/current phase, native OAM and camera.
- The CPU writes only a free scene pair. If both are occupied, it still performs the original game draw side effects, skips the display capture and records two queue drops. The next interpolated scene snaps instead of connecting unrelated history.
- Main prepares queued OAM/camera while the previous GSU job runs. After GSU STOP and fill-idle, it uploads the next command packet while the old external framebuffer copy can continue. It never clears the framebuffer during an old copy.
- NMI alone owns the render-state machine. It commits the completed frame and matching OAM, starts the preloaded next job, and launches GSU after fill completion. The two native OAM pages exchange ownership without a116-byte NMI copy.
- Midpoint construction yields to the uploader after each object. This is necessary because a long CPU loop could otherwise miss the upload window even when the GSU was fast enough.
- Before the first GO, one extra presentation field is reserved to prime the pipeline. This is a16.64ms display interval, not an extra33.28ms game update. Actual generation and input age must be taken from the measured event trace.

## Display interpolation

Geometry is stored before clipping, matched by object identity/lifetime, averaged, then clipped and assigned exact fixed-point UV increments. Pose, atlas selection and visibility changes stay discrete. Ordinary compacted object slots are invalidated by display-only hooks. Boss parts have separate stable IDs. Reset, death and boss-state transitions snap.

Native PPU sprite X/Y positions are averaged only when both states are visible, attributes match and movement is bounded. Newly reused reflected-bullet slots snap based on the original timer; the timer itself is never changed. Tiles remain the current discrete original pose. The ground phase handles its wrap, and horizon pitch uses a signed midpoint. Current packets retain the original values.

## Changes versus v009

The GSU program, atlas, original reference files, dedicated Mesen DLL and modeled clocks are unchanged. The gain here is CPU/GSU scheduling and display-only interpolation, not an emulator timing change.

v009 did not overlap the heavy original draw/command construction with GSU rasterization. Its boss draw averaged7.180ms with zero overlap in298 observed calls; some game ticks did overlap. The SNES reference starts its old GSU frame and immediately prepares the next CPU frame. v010 follows that ownership model with a queue appropriate to the unchanged30Hz NES logic.

The SNES renderer also has a ROM data path, GETC prefetch, large horizontally prescaled asset tables and partial tile transfer. The NES design still has only an8KiB GSU work-RAM atlas and a fixed12KiB framebuffer-copy ABI. Earlier versions already applied exact row spans, byte expansion, sample reuse and live command-only uploads; those are not newly missing problems in v010.

## Qualification boundaries

- Functional dedicated-emulator timing is measured in emulated NTSC time. Offline recording speed is not a claim of real-time desktop performance.
- The fixed copy model is about2.949ms. Actual FPGA compositor contention and transfer speed remain unverified, so the results cannot establish hardware60fps.
- The fixed1200-field sample uses only controller inputs, with original START at field600 to enter the boss. It is not a complete stage clear or exhaustive load test.
- New presentation commits, changed decoded images, original logic updates and output fields are separate metrics. Static/snap frames may legitimately be identical.
-32 midpoint cases,692 current callback cases,12 OAM cases and228 command-copy kernel cases are checked separately. A gameplay-state trace is required in addition to those unit tests.

## Evidence

See results/source_preservation.json, results/copy_equivalence/results.json, build/interpolation_test/result.json, build/callback_test/v010_result.json and build/oam_midpoint_test/result.json. Performance/capture and input-state regression reports identify the exact tested ROM hash. Do not use a copied report from an older version as evidence for this build.
