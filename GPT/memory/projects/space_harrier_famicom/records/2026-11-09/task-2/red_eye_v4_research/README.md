Independent allscale red-eye research on FROZEN OLD artwork. NOT ADOPTED.

Review deliverables/REPORT_JA.md. The final v4b program uses508/512GSU cache bytes and a7168-byte atlas, supports both reducing/enlarging byte sources, and removes phase cache reloads. Boss pupils remain unmarked. Boss draw cost rises in tested cases. Latest artwork was not integrated and existing ROM/RBF/SD was not modified.

Build with `python -X utf8 build.py`. This generates the v4b RESEARCH ROM. The copied DLL is unchanged from v2/v3. Do not rerun historical setup scripts over the current tree. The current sources are authoritative.

`tools/test_allscale.py` runs machine-code and pixel/cost comparisons. `tools/compare_allscale_ppu.py` compares real PPU captures. External timing remains unresolved; no new hardware fit/STA or real-device run was performed.
