TAIL4: exact ascending EM1 tag scan

ROM candidate_tail4.nes, SHA256 ddb55ee177b7e581b02ac3dc9111b652ac9c2b01457883d4c6a8548f61386a7f.
Frozen baseline candidate_round9.nes is preserved. Only bank120 A000..AD5B changes; entire bank replacement carried in candidate_tail4_manifest.json. Generated tail4_em1scan.s/binary/listing and build_tail4.py reproduce the patch.

All original EM1 tag interpretation, first-pose ordering/conflict counting, exact registers/flags/stack/scratch and GSU writes are retained. Caller/busy checks, shared GSU RAM ownership, core, clocks, GSU code and palette remain unchanged.

7296 instruction cases pass. Real core3500 stage +1200 boss scans pass, including48 pose changes and6 NMI-overlapped scans. OAM5-aware3500 stage and1000 boss generation comparisons pass. Native6000 fields: late35 to34, queue starvation37 to34, queue drops1 to0, noGSU deadlines.

At15 commands saves188..263cycles. Count1 regresses5..11cycles to keep exact pointer/flags, count0 saves3, counts2..56 save cycles. Initial generic matched.py results are invalid OAM-only comparisons because that observer reads the obsolete queue; authoritative corrected reports are TAIL4_MATCHED_candidate_tail4_*.json.

Reproduce: python -X utf8 build_tail4.py; python -X utf8 test_tail4.py; test_tail4_native.py candidate_tail4 stage3500 (separate arguments); test_tail4_matched.py candidate_tail4 stage3500; compare_tail4.py candidate_tail4 stage3500. Native output directories must be new.
