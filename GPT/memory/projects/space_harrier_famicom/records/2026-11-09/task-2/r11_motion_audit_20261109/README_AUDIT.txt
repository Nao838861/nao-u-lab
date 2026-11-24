r11 motion audit: latest frozen VisualFixes, no hardware use

Verified source ROMs
Hardware c4b531dc532c9dc32ed5df51b30a4f4bb5a66e128251e0d82164385443f83e20
Mesen 1591131317b8b621741c0c828bdc9025ae62eb5b34b01483503a5eed909ce8e5

Conclusion
The release provides 60Hz presentation of 30Hz gameplay using one integer midpoint scene. It does not guarantee a distinct or uniform 1-pixel scale increment every display field. Distant integer sizes can hold; near sizes can move multiple pixels per field. Stable scalable families interpolate XY, width and height, not world Z or the source texture itself. Reset, missing/dirty identity and incompatible pose transitions deliberately snap.

Airborne stone / FlyStone
Type4, kind40, atlas identity9. It already uses56 smoothed size rows sampled from the SFC111-point Hermite curve. Its XY projection still uses the original quantized NES coordinates. All1569 observed stone geometries were exactly predicted by:
X =128 + sign(WX)*2*floor((floor(abs(WX)/2)*scale[Z])/256) - floor(width/2)
BottomY = originalGroundRoot[camera,Z] - 2*floor(WY*scale[Z]/256)
Both formula residuals are zero. Ground and lift were rounded independently before doubling. Smoothing dimensions does not remove their opposing rounding errors.

Concrete latest-ROM example, fixed camera14, worldX-60, worldY36, slot3
Z22,21,20,19,18: bottom106,104,106,102,104.
The actual midpoint/current command sequence still goes105,104,105,106,104,102,103,104.
Width/height remain monotone22x18,24x19,25x20,27x21,28x22. No pose changes are involved.

New fixed-input stage1500 producer samples and boss750 samples have zero increases in late_fields, queue_drops and queue_starvations. These are dedicated Mesen measurements, not hardware frame-pacing verification. See MOTION_AUDIT.json for exact sample intervals, dimensions and exclusions. Actual midpoint geometry aligns for every eligible row after excluding the first sample and the intro's non-object title commands.

Open EM1 exception
Closed EM1 uses56 smoothed rows. Open EM1 still uses3 size tiers x5 source poses, unlike SFC's111 depth positions per open pose. Pose changes switch kind57..61 and intentionally bypass midpoint geometry interpolation. Latest stage trace has105 observed transitions, maximum one-field width/height change8/10 pixels. Example i967:48x46 ->52x56, midpoint already52x56. The silhouette pose change itself remains ordinary discrete animation.

Native player/shots
These retain native fixed-size PPU/OAM sprites, not this scalable rectangle path. Their separate OAM preparation averages eligible XY only. Sprite0, new/hidden entries, changed attributes and large jumps deliberately snap. No claim of interpolated sprite artwork or scale applies.

Offline prototype only
prototype/conservative_flystone_bottom_wy36.bin contains33x56=1848 bottom-Y entries, preserving66 near/far endpoints, camera deltas0..2, maximum position change3 pixels. The example becomes106,105,104,103,102. Fixed-camera maximum depth movement8->6 pixels/logical step, midpoint4->3. Actual nonzero-sign reversals379->33, keeping broad turning points. Maximum second difference10->3. Combined camera+depth can still move7 pixels/logical step.
This is not a patched ROM. Additional RAM, CPU timing, ROM placement, gameplay identity, full-game visuals and real hardware are not validated for any integration. Table lookup can be designed without new per-object state, but that is an implementation plan, not a performance result.
The initial globally monotone prototype is REJECTED for direct integration: it needs10 pixels of placement change. Do not use its bin as a production patch.

Reproduction
python -B capture_audit.py stage 1500 NEW_OUTPUT_DIRECTORY
 Available scenes stage, boss, fire_hold, fire_pulse. Output must not already exist. capture_audit.py loads the frozen final ROM and uses only original SELECT/START/controller inputs, no game RAM writes. No GUI or hardware API is used.
python -B analyze_motion.py

Static reference paths
combined_rom/src/interpolation.s:219-294 midpoint gating/arithmetic.
combined_rom/src/nes_render_tables.inc:128-157 FlyStone;592-595 dimensions.
combined_rom/tools/generate_direct_depth_v027.py:11 [::2] depth sampling.
combined_rom/generated/nes_core/src/draw_bgobj_all.s: airborne lift and XY projection.
r11_scaling_smooth_20261109/src/draw_Em1.s: open/closed split.
r11_ground_contact_20261109/deliverables/source/baseline_CPU/prepare_oam.s: native OAM path.
SFC reference MonoSH_FX2/tools/smooth_depth.py:80-105 open-EM1 and dimensions.

Supplementary pulse-fire500-update pass observed86 Bom0/explosion records, covering the remaining scalable family. Holding A is not continuous fire in the original game, so a separate edge-triggered pulse run was required. Both runs had zero late/drop/starve increases. See the third trace in MOTION_AUDIT.json.
