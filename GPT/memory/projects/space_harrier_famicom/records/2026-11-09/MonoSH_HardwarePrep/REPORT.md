# Space Harrier hardware scenery preparation

Status: OFFLINE PREPARATION COMPLETE; NOT AN INTEGRATED HARDWARE CANDIDATE.
Date: 2026-11-09. Executor: [REDACTED_HOST_IDENTITY].

## Confirmed baseline
- Actual v019 finite hardware-trial RBF: 408935e73db7e7fb9c0cd279b6579da90fcab92f4c720a8ac2fa3d605af7c6bb, 168949 bytes.
- Source: ../2026-11-08/MonoSH_MSH5_Hardware_20261108/work-signed-pitch (resolve from the Codex date parent, not this directory).
- Cyclone IV E EP4CE6F17C8: 6218/6272 LE, 29/30 embedded 9-bit multiplier elements, 222464/276480 logical memory bits.
- Crucial correction to reading the summary: physical M9K allocation is 30/30 and implementation memory bits 276480/276480. The reported 20% unused logical bits are not free RAM blocks. An additional internal scenery ROM cannot just be added.
- Baseline minimum internal STA setup +0.987 ns and hold +0.137 ns. Inherited 69 unconstrained input ports, 97 unconstrained output ports, and ppu_oe used as a clock without an associated clock assignment. This is not external/electrical timing signoff.
- Baseline hardware report establishes approximately23 seconds finite v019 movement and safe stable menu return, not long-run stability or v020+ scenery support. No new physical test occurred here.

## Proposed independent asset layout
- Reference is frozen v031 ForestShade, not the in-progress v032 art.
- Convert the existing SFC-derived layer source into its exact v031 NES palette codes before display: 0 dark green, 1 gray, 2 highlight, 3 transparent within either source layer. Composite near/forest first, far/mountain second, otherwise sky3.
- Only source rows112..126 can be visible. Source row127 is always occluded by the existing physicalY >=106+camera ground ownership rule, since mapY=physicalY+21-camera. Dropping that fully hidden row preserves every currently displayed pixel.
- Payload is15 rows x512 pixels x2 layers x2bits =3840 bytes.
- Proposed CHR range $1B100..$1BFFF inclusive. A row uses256 bytes, far layer first128, near layer second128. Address = $1B100 + row*256 + (near?128:0) + ((screenX+scroll)&511)/4. Pixel order is MSB first.
- The MSH5 marker at $1B000..$1B00F, ground texture ending at $1AFFF, and native player CHR beginning at $1C000 remain outside the payload. $1B010..$1B0FF remains available for a new versioned header.
- This replaces the existing compact SFC-source scenery format in a FUTURE independent ROM; the two source formats do not coexist in the gap. A versioned format identifier, builder and matching Mesen decoder must be implemented. No existing ROM was patched and no compatibility with the existing RBF is claimed.

## Executed validation
1. C++ verification against v031 reference headers:15,360 source pixels;3,932,160 near/far pixel pairs;10,321,920 camera/clip cases, all exact.
2. Direct calls to the actual v031 Mode7Ground::FetchScenery function:5,160,960 eight-pixel blocks, with varied FX low/high and opaque-zero alpha masks, exactly matched the proposed packing and composite. This covers5,160,960 x8 pixel positions in the real compositor call path.
3. GHDL standalone scenery_fetch:1,966,080 pixels with110ns asynchronous RAM delay, full512 far-scroll offsets and permuted near-scroll offsets across15 rows. Three synthetic grant-interruption patterns each tested122,880 pixels. Reset during an active read suppressed stale completion. All passed after the final RTL edit.
4. Quartus24.1 standalone map/fit/STA:83 LE,36 registers,0 RAM bits/M9Ks,0 DSP,63 virtual pins. 25MHz internal-only minimum setup +35.421ns, hold +0.194ns. This is a component fit and virtual-pin timing exercise, NOT a mapper fit or actual board IO result.
5. Standalone fetch line cost: maximum902 cycles=36.08us without interruptions,962 cycles=38.48us under the tested synthetic pattern. These numbers EXCLUDE the complete existing FX, alpha, row-table, PPU native sprite, copy/store and commit arbitration workload. They do not demonstrate a full line deadline or60fps.
6. All seven tracked source/baseline inputs retain their recorded SHA256. No existing ROM, RBF or SD file was overwritten. No USB, reset, launch, capture, board memory read, or deployment occurred. No RBF was generated in this preparation folder.

## Interface and limits
scenery_fetch assumes x walks0..255 in order for each line, x=0 starts each new line, and x/scroll/row remain stable from start through done. Row is0..14. It deliberately reuses the two byte caches without tags under that sequential contract. Synthetic grant interruption is not a substitute for the real PPU186ns read-low/high phase test. The simple model uses110ns memory access, not a measured identification of the installed PSRAM.

## Required next sequence
1. Freeze the intended art/palette version and regenerate the3840-byte payload from that exact source. Preserve the original source bitmap as the authority.
2. Create a separate full-mapper source copy from exact408935e7 signed-pitch baseline. Integrate into the existing display FSM/address path; do not bolt on the83LE block unchanged. Naive83LE addition already exceeds the54LE spare before scenery state, decode and commit support.
3. Implement $4F90..94 staging and $4F95..99 readback, exact back-bank capture at accepted DSP start, frame generation binding, the current0..83 camera clamp, stop/reset behavior and existing VBlank commit. Keep pending and visible state separated.
4. Keep palette selection determined by sky/ground only. Existing hardware racing_display still derives the high palette bit from the foreground mask; current Mesen FetchScenery does not. Match the current four-palette data and compositor truth table explicitly instead of assuming the v019 RBF's palette decision is already equivalent.
5. Optimize and measure the WHOLE mapper. Spare register count does not mean spare LE or RAM allocation. No integrated fit was run because the complete shared-state integration is not yet implemented. The component fit does not authorize or imply deployment.
6. Run exact-pixel full display tests with all sprite/fetch phases, white alpha, both layer scroll wraps, camera endpoints, generation updates, continuous PPU reads, copy/store overlap, stop, reset, menu and restart. Verify source ROM preserves original simulation/OAM/timing outside the requested visual differences.
7. Run complete Quartus map/fit/asm/STA and fitted tests on a uniquely named candidate. Resolve/characterize actual external IO and PSRAM timing rather than treating inherited internal slack as signoff. Then propose the bounded finite hardware check to the parent; no automatic launch or repeat.

## Files
- INPUTS.json, INPUTS_UNCHANGED.json: source identity and preservation.
- scenery_quantized_15rows.bin:3840B asset candidate, not a ROM.
- prepare.py, verify.cpp, packing_validation.json: reproducible data and real-compositor tests.
- scenery_fetch.vhd, tb_scenery.vhd, run_rtl.py, rtl_validation.json: isolated implementation and tests.
- prep.qpf/qsf/sdc, run_fit.py, fit_validation.json, fit_output/prep.fit.summary and prep.sta.summary: isolated resource/timing evidence.
