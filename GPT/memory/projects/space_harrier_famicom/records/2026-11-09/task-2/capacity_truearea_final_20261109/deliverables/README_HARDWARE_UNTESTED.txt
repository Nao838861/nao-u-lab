EXPERIMENTAL FPGA CANDIDATE: HARDWARE UNTESTED

This RBF requires the matching mountain ROM. Do not pair it with an unrelated experimental ROM.

Quartus 24.1std map, fit, STA and offline assembly passed for EP4CE6F17C8.
Resources: 6148/6272 LE; 2447 registers; 23/30 DSP; 30/30 M9K; 392/392 LAB.
All 48 timing-summary checks are nonnegative. Minimum setup: +0.148 ns. Minimum hold: +0.105 ns.
The original timing-constraint file is unchanged. External I/O timing has NOT been signed off.

Independent RTL comparison passed 90 valid and invalid camera cases against original r9 with scenery disabled.
Each valid job wrote every one of its 768 row words. Final row data and CPU readback matched.
Tests included memory ACK stalls, CPU camera-byte writes during generation, resets and commits.
Calculation latency was allowed to differ because the shared arithmetic adds calculation cycles.

This candidate has NOT been programmed into or tested on physical hardware.
No hardware programming, SD-card modification or USB-device access was performed.
The tight timing margin and fully occupied LAB/M9K resources require care in any later revision.

VERIFICATION_AND_HASHES.json contains the RBF, project and source SHA256 hashes.
The verification folder contains the row-comparison testbench/log and Quartus summaries.
