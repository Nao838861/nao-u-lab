COMMAND UPLOAD3: isolated CPU-side optimization

ROM: candidate_upload3.nes
Baseline: candidate_hotspots2.nes (preserved)
SHA256: 9de1861ef6d6abaa79832ef86e96772f486c0184f545c56386e96e0d79b0cf7a

Behavior: 18-byte GSU packets unchanged. The x/y/width/height high bytes at offsets3/5/7/9 are explicitly zeroed for all56 slots once during every ROM reset. Steady-state upload copies the other14 changing bytes, saving32 CPU cycles per command. Count0 performs no packet writes. At15 commands this saves480 cycles, approximately0.268ms at NTSC CPU speed. GSU code, model, clocks, framebuffer, atlas, palette, culling and game logic are untouched.

Current-ROM copy banks are84,86,87,88. Bank85 is NOT a copy bank in this baseline and is untouched. Reset hook: bank0 E10C..E110. Reserved boot thunk: bank82 C6E0..C6F5. Initializer: formerly empty bank31 A000..A2A2. Thunk preserves5115, never switches its executing C000 window, and retains the original4834 register write. Fixed upload wrapper and restoration remain unchanged.

Proof: 3648 actual-instruction copy cases(all4 sources, counts0..56, random packets);256 boot tests from random nonzero GSU RAM/all saved5115 values;1792 actual common-emitter executions; exact reassembly of current GSU binary and store-target audit. Real unchanged-core validation:2800 candidate transfers/22775 commands,26 natural NMI-overlapped uploads, exact queue-to-GSU bytes and mapper restoration. Ordered1600-transfer stage sequence also exactly matches baseline.

Return-visible A/X/Y/flags match for nonzero copies. Count0 A/NZ and dispatch scratch45/46 differ but are dead: the unchanged trampoline immediately overwritesA, and no live copy pointer remains. Native NMI restoration is exercised. Existing ROM save-state migration was not tested; normal reset always initializes explicitly.

Reproduce from this directory:
python build_upload3.py
python test_upload3.py
python audit_upload3.py
python test_upload3_native.py candidate_upload3 stage 1600
python test_upload3_native.py candidate_upload3 boss 1200
python test_upload3_native.py candidate_hotspots2 stage 1600
python finalize_upload3.py
Native test output directories must be new; use distinct sample counts or archive existing outputs before re-running. Generated6502 sources, binaries and listings have upload3_ prefixes. The manifest carries exact baseline bytes and replacement data for all patches, so combination can reject overlap or wrong baseline.

