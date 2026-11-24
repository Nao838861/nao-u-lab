Ground column alignment, grid-only patch

Result: remove the alternating-depth row reversal so each U column retains the same color along V. Existing solid depthwise bands, five-texel half-period, palette D19/2A/39, camera projection, SCROLL80V3 and CPU/gameplay bytes are preserved.

Merge into another isolated candidate:
  python apply_grid_alignment.py CANDIDATE --rom build/HARDWARE.nes --rom build/MESEN.nes
  python apply_grid_alignment.py CANDIDATE --rom build/HARDWARE.nes --rom build/MESEN.nes --apply
The first command is read-only. All texture/source guards are checked before writing. The script accepts the exact previous or aligned ground pattern and is idempotent. It deliberately does not require the entire ROM hash, so independent camera/Zbase patches may be combined.

Changes:
- Packed texture file range 0x102010..0x11B00F (102,400 bytes). Exactly 25,600 bytes differ. Every solid depth-band row and every byte outside this range stays identical.
- core/Core/NES/Mappers/Homebrew/NesFx/Mode7Ground.hpp: remove V>>20 XOR from periodic Fetch only.
- rtl/racing_display.vhd: remove V(20) XOR from periodic fallback only.
- No mode7_dsp, row projection or D10 timing change.

Verified:
- All 409,600 packed texture pixels and unchanged dark-band rows.
- Actual C++ Fetch: 2,772,288 finite-map/fallback/signed-boundary samples.
- Actual production RTL fallback: 12,779,520 samples over full signed integer U and fractional boundaries.
- Full integrated display test with aligned finite texture: SRAM110ns, phases0/19/39ns, abort/restart; native CHR40 phases and HUD65,536 address ownership cases.
- Input-only dedicated Mesen replay: before/after420fields each at normal/max altitude; all telemetry identical and late/drop/starve0.
- Native frame299 before/after screenshot visually inspected.

Deliverables:
- apply_grid_alignment.py: portable guarded patch.
- GRID_ALIGNMENT_PATCH.diff: two small source hunks, LF line endings.
- GRID_ALIGNMENT_TEST_RESULT.json; GRID_REPLAY_RESULT.json; tests_hardware_strict_result.json.
- ground_aligned_columns_comparison.png; grid_before/after_center/maxup.png.

Arcade comparison: same longitudinal columns are visible in the original arcade screenshot at https://regmedia.co.uk/2014/02/17/sh_1.jpg (article: https://www.theregister.com/2014/02/18/antique_code_show_space_harrier/). Local SFC tools/build_ground.py also uses fixed column indices and changes only palette by depth band.

Limits: the screenshots intentionally retain the preceding VSHIFT geometry to isolate this pattern change. They are not the final combined camera/contact correction. No new Quartus bitstream was built here. No physical console was started, selected, reset or rebooted. Final combined candidate needs its own build and verification.
