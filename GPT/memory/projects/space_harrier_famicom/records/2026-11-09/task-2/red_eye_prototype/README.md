Independent red-eye8x1 experiment derived from v021.

Review [deliverables/REPORT_JA.md](deliverables/REPORT_JA.md). The deliverables folder contains the current videos, two experimental ROMs, actual PPU comparison and patches. Both ROMs require this folder's runtime/MesenCore.dll. Neither is hardware-tested. The FPGA fit fails by one LAB; no candidate RBF exists. Do not pair these ROMs with the existing RBF or deploy them to SD.

Build ROM: `python -X utf8 build.py`. Build DLL: `python -X utf8 tools/build_palette_core.py`.

The source files are authoritative. Initial patch-preparation tools are history, not idempotent update commands. Older numbered capture directories contain failed/obsolete attempts; review only deliverables/.
