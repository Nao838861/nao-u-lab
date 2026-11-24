Space Harrier r10 exact large-object optimization

Emulator-only candidate. Not approved for cartridge/FPGA deployment.
No hardware, SD card, USB device, or FPGA configuration was changed.

The original integrated mountains + EM1 ROM remains untouched.
Only the 512-byte GSU program region changes. All CPU gameplay, audio,
source graphics, CHR, atlas, and mapper bytes remain identical.

Implementation
- Decode packed sprite rows into the existing 64-byte row cache.
- Reuse decoded rows while vertical scaling repeats them.
- Keep the original packed path for deep shrinking and narrow clips.
- Use safe GSU branch-delay slots and short local branches.
- Program 495/512 bytes; no additional RAM or texture memory.

Verification
- 241/241 synthetic raw framebuffers are byte-identical to baseline.
- Includes actual nearest boss body/face/bullet/tree/enemy-bullet sizes,
  fractional UV, negative strides, clipping, and overlapping warm-color objects.
- 3,000-field boss and 3,000-field normal-stage runs use only original controller
  controls (SELECT invincibility, START boss skip), with no gameplay RAM edits.
- Both scenes retain 1,500 logic ticks, status 0. Normal stage has 28 EM1 uploads,
  zero pose conflicts. This does not assert all 15 depth/pose combinations.

Selected timings at the functional 50MHz GSU model
- Boss face 80x116: 5.09004 -> 3.52056ms
- Boss body 80x54: 2.57742 -> 2.41818ms
- Boss bullet 64x62: 2.25838 -> 1.54712ms
- Tree 68x160: 5.47276 -> 3.75132ms

Boss benchmark: deadline misses 382 -> 233, presentations 2596 -> 2751.
Normal stage: deadline misses 4 -> 0, presentations 2977 -> 2986.
The CPU field-service late counter does not improve: boss 317 -> 392,
normal stage 260 -> 264. Boss GSU worst case still 18.0023ms, so this is not 60fps.
Some tiny/clipped or near-one-to-one cases regress. Largest measured
synthetic regression is 0.09386ms. See the complete timings and JSON.

Rebuild and provenance
Full independent source and exact original/final comparisons remain at:
[REDACTED_WIN_PATH]
Run python build.py there using the existing cc65/Python/Pillow tools.
The patch targets only src/gsu.s in the integrated r10 combined_rom source.
Use its matching dedicated Mesen runtime. Do not load this experiment to hardware.
