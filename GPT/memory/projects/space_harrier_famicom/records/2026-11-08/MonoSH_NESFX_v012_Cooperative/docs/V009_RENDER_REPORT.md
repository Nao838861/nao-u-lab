# v009: pixel-exact boss and projectile raster optimization

Status: rendering optimization milestone, not a 60fps gameplay release. Original NES logic and draw scheduling remain NTSC/2. There is no interpolation, frame generation, RAM-write-assisted gameplay, invincibility, or FPGA/RBF change.

## Fixed-input comparison

The same 1,200-field controller schedule was executed in every version. START at field600 selects the original boss test behavior. This is about19.9672 modeled seconds, not a complete stage or a hardware test. CPU1,789,773Hz; GSU50MHz. The dedicated DLL is unchanged from v005.

| Version | Stage GSU mean/max ms | Boss GSU mean/max ms | Boss request-to-copy max ms |
|---|---:|---:|---:|
| v005 | 3.0552/9.3911 | 11.9146/18.8633 | 26.2866 |
| v006 | 3.0561/9.3939 | 10.2042/15.5009 | 19.1510 |
| v007 | 2.9415/8.8883 | 9.8123/14.8142 | 18.4644 |
| v008 | 2.9415/8.8883 | 9.8123/14.8142 | 18.4644 |
| v009 | 2.9422/8.8894 | 7.5293/11.3350 | 14.9851 |

Every sampled v009 job finished request-to-copy within one16.639ms field. However this interval starts AFTER CPU scene construction, OAM preparation/submission and command upload. It is not end-to-end frame latency or evidence of60fps.

Actual v009 rates: output60.0985Hz, original game logic30.0492Hz, draw snapshots30.0492Hz, new scene commits30.0492fps. Commit intervals were584 two-field,8 three-field and8 one-field gaps, so the average also hides uneven30fps cadence. No interpolation is present.

## Implementation

- v006: byte-expanded boss body/head, exact destination spans for transparent row margins.
- v007: useful PLOT and register-prefix instructions occupy GSU branch/LOOP delay slots instead of NOPs. All tested pixel results stayed identical.
- v008: exact live-command copies use unrolled absolute LDA/STA pairs at8CPU cycles/byte; both116-byte OAM copies use the same approach. No extra ROM bank or mapper ABI is needed. The56-command capacity kernel is8,073cycles, about4.51ms, plus call/setup/OAM overhead. Typical command counts are much lower.
- v009: actual job inspection identified up to six enlarged64x62 boss projectiles as the remaining bottleneck. Their original texture is now byte-expanded too. All three32x32 expanded textures occupy$9400-$9FFF. Eight exact span tables occupy$9200-$93FF; two lookup tables reuse non-rendered player texture slots$8700/$8800. Active original packed textures stay byte-identical. The original atlas file is not modified. The full runtime atlas remains7KiB and total work RAM8KiB. GSU code occupies exactly512bytes.
- Native PPU player, bullets, reflected bullets, shadow, palettes and moving horizon remain from v005. Original gameplay functions and source references are preserved.

## Regression evidence

-104 synthetic GSU cases: all12KiB raw framebuffer bytes equal the v005 renderer, including signed U, clipped offsets, overlaps, scale extremes and zero commands.
-57 command counts0..56: assembled6502 load/store/jump kernels copy exactly the live range and leave the unused destination tail untouched. Both OAM kernels copy exactly116bytes. This is an instruction-decoding test, not a full CPU emulator test; gameplay is tested separately.
-33 horizon offsets,6,336 ground rows and256 palette compositions pass. Original PPU CHR banks match byte-for-byte.
-Fixed-input test: all300 sampled gameplay-state/input/tick/draw records match v005. Four sampled composed screenshots are pixel-identical.
-All35 original NES reference files match v005 byte-for-byte; v005ROM SHA256 is unchanged.
-No error/overflow/late-field flag in the1,200-field fixed-input run. This is not an all-stage guarantee.
-301 exact pre-tick boundaries: all151 gameplay fields (850bytes) match the original-source stub. Visible player/shot OAM and hidden-sprite visibility match. Evidence is in results/integrated_game_state.json and results/qualification/oam_semantic_comparison.json. Hidden OAM tile/attribute/X initialization differs from the stub by design; do not claim raw OAM identity.

## What still takes time

The separate v008 function profile covers600 initial fields plus300 boss draws with START and no other inputs. It is not the frozen benchmark above. In modeled CPU time:

| Function | Mean ms | Maximum ms |
|---|---:|---:|
| _core_tick | 1.8805 | 6.2298 |
| _core_draw | 6.0218 | 8.7212 |
| copy_commands | 1.3275 | 1.7762 |
| prepare_ppu_oam | 0.5219 | 0.5219 |
| submit_ppu_oam | 0.5219 | 0.5219 |
| nmi | 0.6415 | 0.9929 |
| audio_tick | 0.0562 | 0.2531 |

copy_commands includes submit_ppu_oam; NMI includes audio. These nested costs must not be added twice. service_render spends much of its exclusive time polling; that is idle waiting rather than useful computational demand. Do not sum independently observed maxima and label that sum a measured critical path.

## SNES comparison and remaining60Hz work

The reference SNES implementation uses288 prescaled boss images (406,800bytes), per-row transparent margins, pipelined ROM reads, and dirty-tile DMA. The current NES GSU has no equivalent PRG-ROM read path and only8KiB of work RAM. The result is not explained by GSU clock frequency alone. This implementation reuses existing RAM without altering the hardware interface.

1. Keep the original alternating logic/draw order. _core_draw advances title counters and has original display-related state side effects; doubling calls changes behavior.
2. A real60Hz presentation layer needs display-only snapshots with stable object identities and lifecycle generations. Interpolate unclipped geometry, then derive clipping/UV; synchronize native OAM and ground. Do not interpolate depth-sorted command indices or silently double game speed. Known previous/current states add display latency and must be disclosed.
3. Decouple command preupload from OAM/camera publication. Existing RTL permits work-RAM writes while the old framebuffer copy runs, provided GSU and fill are idle. Freeze the in-flight OAM/camera/generation until commit. The single internal framebuffer must not be cleared while copying.
4. A short postcommit NMI fill-start can overlap clearing with OAM DMA/input/audio, while preserving the one-byte main/NMI handshake. Measure full snapshot-ready through commit with generations and per-field deadlines.
5. Original30Hz snapshots are only generated every other field. Preupload alone cannot manufacture an intermediate scene. A deliberate60Hz presentation or original-speed60Hz logic design is still needed.

## Hardware limitation

The dedicated Mesen model charges a constant12KiB*6/25MHz, about2.949ms, for display copy. This is an idealized quiet lower bound. Existing RTL audit fixtures measured about11.61-13.62ms under continuous synthetic compositor contention, not current MonoSH gameplay. No actual MonoSH FPGA throughput has been measured here.

The existing racing_display.vhd copy engine always copies the fixed framebuffer range; there is no ROM-programmable dirty-map/region API. Sparse copy would require RTL/ABI work, outside this no-RBF-change task. Do not shorten emulator timing to claim hardware60fps.

Relevant existing audit: C:[REDACTED_HOME_PATH]
RTL: hardware-loop3d/candidate-D10-ground/fpga/rtl/racing_display.vhd and racing_gsu.vhd.

## Files

- build/MonoSH_NESFX_v009_BulletRaster_UNTESTED.nes
- runtime/MesenCore.dll, unchanged dedicated v005 core
- results/fixed_benchmark/v009: trace, telemetry, summary and sample images
- results/qualification: side-by-side evidence and source-preservation checks
- results/renderer_optimization/unit: exact framebuffer tests
- results/copy_equivalence and results/palette_ground_unit.json
- results/cpu_profile_v008: actual command jobs and CPU function costs

ROM SHA256: cadd27fa671543e63b5c223096372d074fd62304f6b0f1b75070935c73ce7842
