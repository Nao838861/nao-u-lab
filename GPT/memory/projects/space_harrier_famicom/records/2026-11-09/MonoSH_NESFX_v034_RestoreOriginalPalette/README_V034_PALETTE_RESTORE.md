# v034 original palette restoration

The root cause was a partial rollback in v031. It restored only the highlight $29 while keeping the F shadow $1A and band $2A. v032 and v033 inherited that partial palette and forest shading correctly. All three versions have identical 32-byte palettes, source palette code, compositor code and runtime DLL.

This independent version retains v033 detail, effects, exact-depth motion and v031 source-based forest shadows, while restoring the complete pre-D/F v028 palette: shadow $09, band $19, highlight $29. The emitted ROM differs from v033 only in ten palette bytes. Its complete 32-byte palette matches v028 exactly. All opaque player colours, purple sky and gray are unchanged.

Validation: all 900 normal-stage and 600 boss boundary records equal v033 exactly, across every recorded field. All 2,998 raw PPU frames were compared pixel-for-pixel. The only differences are the intended shadow RGB (12,147,0) to (11,72,0) and band RGB (92,228,48) to (56,135,0). The highlight remains RGB (136,216,0). All 295 snapshotted original build/source/core/runtime files are unchanged. Existing ROM, SD and RBF files were not overwritten.

The 28-second comparison video is actual input-only Mesen recording, not post-production recolouring. It uses original SELECT invincibility. It is not a hardware or full-stage validation. Video decode and audio checks passed; 7, 17 and 24 seconds were visually inspected.

Deliverable: results/v034_original_palette_restored_comparison.mp4
Patch: results/restore_palette.patch
Detailed validation: results/palette_validation.json
