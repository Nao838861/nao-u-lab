# v031 Forest Shade preview

Independent copy of v030 PaletteF. Reverts only its highlight $3A to the pre-D/F $29. Shadow $1A and band $2A are retained from the latest F as a working assumption, not a new user choice. All three green entries are distinct. Purple sky $14, gray $10 and opaque native player colors stay unchanged. Shared object highlights follow the existing shared palette.

The original SFC forest source already contains dark and light shades. The old g<19 quantizer mapped every forest green to the light slot because actual source greens start at g=19. This version maps g=19/21 to existing dark green and keeps g=23/24/25/28 light. Original tile shapes, transparency and scroll data are unchanged. There is no generated texture.

Validation: 368,640 overlay/sky palette cases, 84 x 192 ground-row regression checks, and 3,870,720 source pixel cases passed. Mountains and uncovered sky are unchanged. ROM differs from F by exactly four highlight-palette bytes. All 600 captured game/camera/timing scene-boundary records equal F exactly. All 1,199 raw video frames were compared pixel by pixel: the only two RGB transitions are the intended bright-green revert and forest-shadow addition. No other RGB transition occurred, including red backgrounds. Images at 7, 12 and 17 seconds were visually inspected. MP4 decoding and audio validation pass (maximum audio -21.1 dB).

Video: results/forest_shade/v031_forest_shade_preview.mp4
Detailed verification: results/final_validation_v031.json

The roughly 20-second capture uses original SELECT invincibility. Dedicated Mesen visual preview only; not a full-stage or hardware test. Original versions, source ROM, SD and RBF were not overwritten. Only the MP4 is a Space deliverable.
