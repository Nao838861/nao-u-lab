# v029 Palette D preview

Independent copy of v028 GroundPeriod. User-selected D colors:
- Shadow: NES $19 (previously $09)
- Solid horizontal bands: NES $29 (previously $19)
- Highlight cells: NES $39 (previously $29)

The adaptive compositor remaps texture indices 3/0/2 into displayed palette indices 0/3/2. The source palette accounts for that mapping. Sky and ground keep their existing three shared colors. Purple sky, gray, and opaque native NES player colors remain unchanged. Shared tree/enemy greens brighten consistently; shapes and draw ordering are unchanged.

## Minimal verification

The rebuilt image differs from v028 at exactly 14 palette bytes. All other ROM bytes and the runtime DLL are identical. No new scenery or fine-depth experiment was merged. The v028 ground-period correction is retained exactly.

Video: results/palette_d/v029_palette_D_preview.mp4
20 seconds, 1199 decoded frames, audio maximum -21.1 dB. Actual dedicated-Mesen recording using controller input and the original SELECT invincibility mode, with no gameplay RAM writes. Visual inspection at 7, 12, and 17 seconds confirms visible ground bands and object silhouettes. All 600 recorded scene boundaries retain correct ground phase/bank values; no suppressed scenes. This is a short visual preview, not hardware or complete-stage validation.

Only the preview MP4 was saved to Space. No ROM or ZIP was uploaded. Existing v028, original ROM, SD, and RBF files were not changed. A local independent build is retained only as the reproducible recording source.

Library upload succeeded. The official local xattr helper is unsupported on Windows (os.setxattr unavailable); returned Library identity is retained in results/video_library_identity.json instead.
