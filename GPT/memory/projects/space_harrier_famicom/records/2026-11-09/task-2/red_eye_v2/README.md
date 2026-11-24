Red-eye8x1 follow-up experiment v2.

Review deliverables/REPORT_JA.md. Hardware fit/STA passes with the inherited external timing limitations. Boss-phase GSU draw cost is restored to v021; runtime cache reload takes about27.5ms. No hardware or SD operations were performed.

Build the ROM with `python -X utf8 build.py`; build the dedicated Mesen DLL with `python -X utf8 tools/build_palette_core.py`. Current src/ files are authoritative. Preparation scripts are non-idempotent history and must not be rerun over this tree.

The ROM and fitted RBF are separate candidates and remain hardware-untested. Existing ROM/RBF files are preserved. The RBF does not implement the Mesen-only mountains/forest.
