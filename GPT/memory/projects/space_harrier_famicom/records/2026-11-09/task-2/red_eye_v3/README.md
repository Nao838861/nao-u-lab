Red-eye v3 sparse phase-cache update experiment.

Review deliverables/REPORT_JA.md. Existing ROMs/RBFs and SD are untouched. The circuit, dedicated DLL and GSU programs are byte-identical to v2; only the CPU phase reload is changed. Measured reload is about3.44ms versus27.5ms in v2. Full native PPU comparison against v021 over1800frames has only intended dark-green-to-red changes.

Build the new ROM with `python -X utf8 build.py`. The copied runtime/MesenCore.dll is the unchanged v2 DLL. No new hardware fit/STA was required or performed. Hardware remains untested with known external timing gaps.

Small-enemy allscale and boss eye additions are studies only, not implemented in this ROM. The repacked model marked NOT_RUNNABLE must not be loaded by the current GSU. Preparation scripts are historical, non-idempotent; src/ and generated/cache_patch_*.inc are authoritative.
