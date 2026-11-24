# Space Harrier r10: EM1 opening poses + distant mountains

This package is verified in the dedicated Mesen runtime only. It is NOT approved for NES/FPGA hardware deployment.

ROM: MonoSH_r10_EM1_Mountains_MESEN.nes
SHA256: de4c4e19d02712a6d2786f12e2551957590b0b8a8a85c4cf5dca9e8fa011d686
Dedicated MesenCore.dll SHA256: 344a1cf465444bdd13192da5236c99e92a215641157f242722fdc65e0949bb93

Changes:
- EM1 now uses all five original opening images (SFC sources32..36) at the original three depth stages. The original NES gameplay selects their poses and timing.
- Distant mountains use the original far-layer source, including its dark-green shadows and gray highlights. Their scrolling and vertical position follow the queued game camera.
- The near forest scenery layer is intentionally omitted in this mountain-only candidate.
- Audio and the existing object color compositor are unchanged.

Verification:
- 2,504 actual dedicated-Mesen fields, all15 EM1 depth/pose combinations observed,24 image uploads, zero pose conflicts, status0.
- The capture uses only the original SELECT invincibility control, no memory edits. Normal startup has invincibility off.
- Images near_pose1.png..near_pose5.png and EM1_actual_gameplay.mp4 are actual PPU output, not mockups.
- Existing performance limits remain:4 deadline misses,223 late fields,17 queue starvations in this capture. This is not a60fps or full-game completion claim.

Hardware limit:
The old r9 FPGA mapper has no scenery fetch path. Loading this ROM with that mapper does not restore hardware mountains. A separate offline FPGA prototype now passes fit (6148/6272LE), all48 internal timing checks (minimum setup+0.148ns, hold+0.105ns), and the expanded enabled/disabled PPU phase and stop checks. It is still hardware-untested and external I/O timing is unsigned. No RBF is supplied in this Mesen-only package, and no SD, USB, board configuration or hardware was changed. Do not deploy experimental mapper/ROM files.

Rebuild source is preserved locally under combined_rom. python build.py uses the existing [REDACTED_HOST_IDENTITY] cc65, Python and Pillow setup. The proof script tools/verify_em1_gameplay.py uses the included matching DLL through an isolated headless host; it is a verification tool, not an interactive GUI launcher.
