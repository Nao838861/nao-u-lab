# r7 scenery feasibility result

Status: BLOCKED BY FULL-MAPPER AREA; NOT A HARDWARE CANDIDATE.

No new ROM, DLL, RBF, SD preparation, USB operation, or physical trial was performed. The experiment contains a partial ABI implementation only. Never deploy it. Existing r7 and v019 sources and artifacts were not edited.

## Measured result

- r7 baseline: 6246/6272 LE, 392/392 LAB, 30/30 physical M9K, 29/30 DSP9.
- Added the exact staging and front-state readback interface $4F90..99 within the existing DSP. State is captured only in its accepted-start branch, stored for the target bank, and selected by the existing committed front bank. Thus no duplicate generation/commit FSM is added.
- Full mapper with ABI only: Quartus map succeeds; fit fails at 6344/6272 LE, 402/392 LAB.
- One-hot readback decode optimization: map succeeds; fit still fails at 6341/6272 LE, 402/392 LAB. 2568 registers, 6251 combinational functions, 222464 logical RAM bits and 29 DSP9. Existing physical RAM allocation is unchanged.
- Exact error 170012: Fitter requires 402 LABs; device contains 392. This is a completed failed fit, not a denied or pending action.
- Both attempts use inherited area optimization, resource sharing, physical combinational area synthesis and seed1. Timing constraints are unchanged. No false path was added.
- These counts EXCLUDE scenery fetch, row clipping and layer-selection logic. The previously measured standalone fetch block uses 83 LE; simple addition is not a full integrated estimate.

## Work completed and verified

1. Regenerated 3840-byte scenery payload from the exact r7 source and tested against the actual r7 compositor. 15360 source pixels, 3932160 layer pairs, 10321920 camera/clip cases and 5160960 eight-pixel compositor blocks passed. Tests include varying foreground planes and opaque-zero alpha. New packed format is only a payload, not a ROM or supported ABI.
2. GHDL test of modified actual mode7_dsp passed reset, staging reads/writes, camera clamp to83, rejected starts during busy, immutable captured values after later staging writes, and four alternating bank commits. The original signed-pitch arithmetic is unchanged.
3. Repeated GHDL test after mux optimization passed.
4. Tracked baseline and r7 source payload/header inputs retain hashes in INPUTS_UNCHANGED.json. Full final hashes are in HASHES.json.

Payload SHA256: e9e7e138ab0bb46704b4c34f54735a26fa7dec5b1b4e0afc1fe920fd185fff8f
DSP RTL SHA256: e7b1a7c79fe1d533ceccf842e5a33f7a22d083fa75b35b4961e8aaf0d216b864
Top RTL SHA256: 91c69c993c50f0f6cf214040e6c02a2039ff55820f10af0304b86e479437726e

## Not completed or claimed

There is no integrated scenery fetching, source-ROM versioned payload decoder, matching new Mesen DLL, full-scenery PPU lifecycle test, fitted simulation, assembly, or STA. Fit failure makes assembly/STA inapplicable. Passing the limited ABI or packing tests does not establish complete CPU control behavior, stopping behavior, PPU timing, or any physical operation. The ABI accepted-start capture follows the existing RTL DSP acceptance gate, not an independent reimplementation of all emulator camera validation.

r7 audio remains unchanged, not CleanMix v003. Original r7 RBF hash is33ecfd3db7eefa1159ab24ac5d2e0f9da9a6363d80c45e5b75a503fb775e694a; it has no scenery support and is not an output of this experiment.

## Safe next options

- If testing r7 colors alone, parent must explicitly describe the absence of mountain/forest scenery and use a matching no-scenery reference. It is not the complete requested latest image.
- For exact complete scenery, first reclaim substantial logic/LAB area across the full design and rerun the complete r7 regression. Merely freeing69 LE is insufficient because fetching and clipping are not implemented and ten LABs are already missing.
- A possible architectural route is serializing state into unused external-CHR row-table sidecar storage, then sharing existing DSP store and display read FSMs. This must preserve full16-bit accumulator readback, bank capture, generation ownership, visible commit, stop/reset, and read deadlines. It adds arbitration/readback latency concerns and requires a new measured full fit and lifecycle proof. It has NOT been implemented or shown feasible here.
- Alternatively a larger FPGA would remove this particular capacity ceiling but is not an authorized substitute for the existing hardware.

## Reproduction

run_fit.py rebuilds current checked-in experiment RTL. tb_abi.vhd uses rtl/serial_math.vhd and rtl/mode7_dsp.vhd with GHDL --std=08. prepare_latest.py regenerates and verifies the packed payload against r7. optimize_mux.py is a one-time transformation and must not be reapplied to already optimized source. abi_unoptimized contains the prior area report and RTL. probe_abi.py is retained as initial editing history only, not a final reproducible build entry point.
