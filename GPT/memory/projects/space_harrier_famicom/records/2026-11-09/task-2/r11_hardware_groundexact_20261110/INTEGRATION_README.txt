GroundExact hardware implementation candidate

Copy only rtl/mode7_dsp.vhd and rtl/serial_math.vhd into the integrated mapper RTL. Copy core/D10Mode7Row.hpp into the functional emulator NesFx header directory. Do not replace Mode7Ground.hpp: it already contains the GroundExact horizontal function and integration-specific compositor.

The RTL computes bottom-row208 DU once, then applies trunc(trunc(oldDU*327680/abs(bottomDU))/51), which equals the original single positive-denominator division. Existing origin arithmetic rebuilds centered U, V/DV remain unchanged. c(2) is reused only after height/hps setup and validation; the four upper divisor bits use formerly-zero low bits of height, masked from subsequent height arithmetic. This avoids a separate20-bit state register. serial_math supports a20-bit positive divisor while keeping the18-bit signed multiplier.

The emulator header keeps coordinate calculation raw and charges prepass cost to row0 plus160 clocks per normalized valid row. Baseline row clock constants are corrected to10/167/690 based on the current RTL schedule. Full mapper contention and scenery shortcuts are not cycle-accurately modeled.

All assertions and exact hashes are in GROUND_EXACT_VALIDATION.json. These are isolated functional RTL checks, not a hardware-ready release. Integrated rendering regressions, fitting, STA, external I/O and real hardware remain required. Development helpers retain the original local paths; they are not a portable clean build claim.
