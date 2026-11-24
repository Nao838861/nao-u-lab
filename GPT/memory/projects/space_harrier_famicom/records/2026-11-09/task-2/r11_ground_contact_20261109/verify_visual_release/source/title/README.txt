Stage 1 / MOOT display restoration for the frozen r11 CPU Supply Optimized release

Status: EMULATOR VERIFIED. HARDWARE UNTESTED. No hardware, SD or USB action performed.

Cause and source
- The original NES draw routine still selects Stage1 using its original timers.
- Its replacement display adapter only sets render_title=1 and returns. Nothing consumed that flag. The omission predates the r11 CPU optimizations.
- Original title image: em1_open_fix_20261109/reference/detail_originals/bg_color/42.png. It reads STAGE 1 / MOOT. Source 44x19, display88x38, centered at physical x84,y95.
- The existing original timers, player rise, controls and gameplay are unchanged.

Implementation
- Adds one static title command after ordinary objects in both immutable current/midpoint packets. Native PPU player/shots retain their priority.
- The first cold-boot midpoint retains its original empty packet, avoiding a one-frame pre-BG position flash.
- Uploads the 210-byte packed title texture only when the immutable packet itself ends with the title command. A live producer flag never controls an older queued packet.
- Uses the otherwise unused command tail GSU832E..83FF only while title is present. Max44 commands including title end at8327, six-byte gap. Normal intro reaches at most6 commands. At capacity44 or above before append, safely omits title rather than corrupting a packet/atlas.
- No existing atlas, CHR, GSU code, FPGA/RBF, controls or palette bytes change. Source transparency and original dark outline remain opaque/transparent as appropriate. Uses existing common gray173,173,173 and black; the existing8-pixel palette constraint can map part of the outline to dark green over purple sky. No extra colors are introduced.

Final patch address reservations
- PRG bank83, file0xA6010..0xA800F, CPU C000..DFFF: new helper and title texture. Previously all zero.
- Fixed FFB0..FFC3:20-byte wrapper after original build_midpoint.
- Fixed FFD0..FFDA:11-byte wrapper after original command upload.
- Call sites E25A and E3DD only. All original symbols keep their addresses.
- MANIFEST.json contains exact file offsets and patch bytes.

Verification
- 600-field paired original/final actual Mesen recordings. All590 measured presentation intervals are one PPU field. Zero late fields, deadline misses, queue drops or queue starvations. About60.099 presentations per emulated second; original gameplay stays30Hz with60Hz presentation as before.
- Same600-field counters except expected command counts;297 original gameplay-state hashes identical.
-600 decoded frame pairs:123 title frames, zero changed pixels outside title bounds, zero changes on original transparent texels.466 post-title frames fully pixel-identical.
- Three input-only START Boss -> Stage1 cycles: title appears again and expires each time. Existing horizontal, reversed vertical, SELECT and START paths exercised; A/B inputs sampled. Zero renderer errors/misses/drops throughout719 PPU frames.
-160 focused actual-helper instruction cases and114 upload cases cover both packet pairs, title off/on, cold boot, capacity limits and upload markers. Writes stay in expected packet/count/ZP/stack/texture ranges.
- Dedicated functional Mesen timing, NOT measured hardware performance. Matching r11 hardware remains untested.

Rebuild/integration
- python -B -X utf8 build_title.py reproduces isolated ROMs from the frozen CPU-supply release and installed cc65.
- python -B -X utf8 apply_title_patch.py INPUT.nes NEW_OUTPUT.nes applies the same patch while preserving compatible unrelated binary changes. It checks call sites and reserved spaces and refuses overwrite.
- When integrating, also keep the other workers' bottom-BG / geometry changes. This patch does not implement those changes.
- After integrating all changes, rerun the final combined emulator/gameplay checks. These isolated checks do not prove a later combined binary.

Evidence
- results/PIXEL_IDENTITY_FINAL.json
- results/candidate2/RESULT.json and telemetry.json
- results/candidate2/intro.avi and field_0060.png
- results/reset_controls_final/RESULT.json and stage_title_0.png
- results/UNIT_BOUNDS.json

Final isolated ROM SHA256
MESEN:001f74957b15feda91a495efff34a44c36444f58d39ac71d552565e43e522cce
HARDWARE:e2dbf4931acde724baf3aab948b7876036cbc9529fb20ae0d8b6bc467938384c
