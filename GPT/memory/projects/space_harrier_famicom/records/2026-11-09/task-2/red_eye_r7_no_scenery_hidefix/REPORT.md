# Dedicated r7 no-scenery hide-alpha reference DLL

Built DLL: runtime/MesenCore.dll
SHA256:20aadedee3c5c596ebaddd57ed3a6d57252c54ebea9042f31739fc2f8bbe4d84

Only core change: Mode7Ground::Fetch now clears alpha as well as fxLow and fxHigh when hideFx[front] is set. The original r7 core is unchanged. All other11-file-overlay source content is byte-identical except this single line, verified by tools/verify_preservation.py and recorded in MANIFEST.json and hide_alpha.patch. This remains original r7 audio, not CleanMix v003.

Build: existing supported build_palette_core.py compiles independent MapperFactory.cpp against the independent core headers, links existing host objects with only MapperFactory object replaced, and emits a new independent DLL. Compile/link logs and link.rsp are under build/core. No original output was overwritten.

Validation:3,387,144 vectors and27,097,152 pixel checks passed through the actual no-scenery Fetch function, then matched the exact unchanged r7 racing_display state10 RTL expression in GHDL. Coverage includes all background plane-byte combinations in both regions with hide on/off, reproducible random foreground/alpha, and all5^8 foreground sequences (transparent, three ordinary foreground codes, and opaque-zero eye) with hide on/off in both regions and two representative backgrounds. The old test tested CompositeAdaptive with inputs pre-cleared, which could not catch the Fetch omission; this test now calls Fetch with original alpha and hide state.

Results and vector/log files: results/red_eye_tests. Scope is functional compositor equivalence, not full PPU timing, ROM gameplay, DLL runtime loading, or hardware validation. Parent owns those later trial checks. No ROM, SD, USB, board, or capture action occurred here.

A ROM whose CHR1B014 scenery version byte is0 is rejected by Layers::Load. NesRacingFx initializes _hasScenery=false and passes null scenery/state pointers to Fetch, selecting the tested row-table background path. Loading an old save state is outside this validation; use a fresh initialization for the finite trial.
