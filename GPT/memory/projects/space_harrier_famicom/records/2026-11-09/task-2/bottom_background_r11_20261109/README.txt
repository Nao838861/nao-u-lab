r11 bottom background component - OFFLINE / HARDWARE UNTESTED

User request: remove the bottom text area and continue the normal background.
This component is intended to be merged with the separate r11 dual-scroll source.
No NES ROM, original source, old RBF, USB, SD, or console state was modified.

Implementation
- Physical scanlines31..239 now use209 ordinary background rows.
- Existing object/FX and alpha surfaces remain192 rows, including their colors,
  positions, copy sizes, EM1 assets, and BS2 GSU program. Extra rows192..208 bypass
  all FX/alpha reads and explicitly clear both color planes and alpha.
- Existing top sky31-line behavior and native PPU sprite detection are unchanged.
- Font/HUD read override and physical223 separator are removed during gameplay.
- Lower CIRAM CPU writes are retained when /RD is high. Active gameplay reads
  instead come from the mapper. ROM/NMI code and PPU v/t side effects are unchanged.
- Row tables use1024 words per bank within the existing2048-word external CHR
  region2C000..2DFFF. Used ranges are2C000..2CD0F and2D000..2DD0F.
- Row0 is prepared at commit and physical30. No wrap request occurs at239:
 209 is odd, so immediately rendering0 there would overwrite row208's even bank.

Files
- bottom_background.patch: exact changes from verified r10 RTL/current core.
- rtl/: complete14-file component source. Only mode7_dsp.vhd,
 racing_display.vhd and racing_hud_route.vhd changed.
- core/: current core overlay, only Mode7Ground.hpp and NesRacingFx.h changed.
- runtime/MesenCore.dll: isolated rebuilt Mesen2.1.1 DLL, SHA256
 423f2f9be8fbfc42e13e885221e9cf74bc0a0de1908136e3b69547b476d69171.
- tools/build_palette_core.py: original supported overlay build recipe.
- test_bottom_background.py: reproducible strict regression/oracle generator.
 BOTTOM_BG_RTL_DIR and BOTTOM_BG_TEST_DIR select isolated alternate RTL/output.
- tests/: actual generated fixtures, source, logs, oracle and held-frame test.
- capture_bottom.py: input-only180-frame old/new DLL comparison.
- results/: raw AVI recordings, screenshots, telemetry and visual_comparison.json.
- VERIFICATION.json: unchanged original hashes, final source hashes and results.

Verified
- All3072 original row words remain exact;68 extra rows generated across4 cameras.
- C++ bottom-only composition rejects2176 deliberately nonzero FX/alpha inputs.
-65536 PPU bus-address ownership cases and327960 native sprite checks pass.
- Strict memory tests pass at110ns reads and0/19/39ns phase offsets, including
 four continuous240-line frames, back-bank isolation, stable write pulse/hold,
 reset during color/alpha writes, every bottom pixel, and no out-of-range FX reads.
- Eight held frames pass without requiring a new commit to refill row0.
-180/180 actual old/new Mesen frame pairs have identical top223 pixel rows,
 including all objects and top sky; all180 have background in the bottom17 rows.
- Original BS2 ROM123f9311... and original RBFd344be0b... remain byte-identical.

Limits
No hardware action or physical validation was performed. External I/O timing is
not signed off. This standalone source has not been fitted here; the parent task
owns the merged dual-scroll fit and final candidate. The old r10 RBF is not a
matching r11 bitstream. Mesen captures are functional checks, not FPGA performance
or full-game validation. Use a fresh emulator session rather than old save states,
since the row table is now209 rows.

Reproduction from this directory (PowerShell)
$env:BOTTOM_BG_RTL_DIR='rtl'
$env:BOTTOM_BG_TEST_DIR='tests'
python test_bottom_background.py
python run_held_frame.py

For the exact merged r11 snapshot instead use merged_rtl and merged_tests.
The snapshot is identified by merged_snapshot_sha256.json. Main results are
merged_tests_result.json; held-frame log is merged_tests/held_frame.log.
These compatibility tests leave dual scenery disabled. The parent independently
owns the dual-enabled expected-pixel fixtures and final placement/timing fit.

Capture reproducibility note
Mesen RamState enum is Random=0, AllZeros=1, AllOnes=2. InitializeNesFxHost already
sets AllZeros. Explicitly overriding it with0 randomizes startup RAM and can alter
the accepted camera X, producing unrelated checkerboard phase differences across
runs. Compare actual14-byte queued cameras keyed by displayed generation/phase,
not scenery offsets alone. No delivered mapper math change was made for this.

Final integrated capture proof (oracle worker)
With explicitly verifiedAllZeros1 initialization, the installed old344a1cf... DLL
and new423f2f9... DLL produced identical top223 rows in all960 matched frames.
All4,177,920 bottom pixels matched the independent D10 projection+ROM texture
oracle using actual queued14-byte cameras keyed by displayed generation/phase.
See ../double_scroll_source_oracle_20261109/mesen_final_zero_960/ for final video,
parallax_analysis.json and bottom_pixel_result.json. Earlier randomRAM comparisons
are superseded and do not show a mapper regression.
