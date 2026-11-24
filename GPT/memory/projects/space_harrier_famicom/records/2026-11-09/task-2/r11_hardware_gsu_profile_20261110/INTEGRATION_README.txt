Optional exact-renderer GSU profile

Merge only rtl/GSU.vhd and the RACING_RENDERER_PROFILE=>true mapping from rtl/racing_gsu.vhd. Compare baseline hash first; preserve newer parent changes. No GSU_PKG change. Material/alpha fold remains unchanged.

Default false retains full original behavior. True removes only ten unused arithmetic operations and LMULT R4 writeback. UMULT, NOT, LOB, LOOP, PLOT, RPIX, MOVES, all instruction sequencing and multiplier wait timing remain original.

Validation: full GSU GHDL analysis/elaboration; 249856 vectors compare exact extracted production ALU against original for all61 opcodes, and208896 compare profile for51 retained opcodes. Source reversal proves no additional edits to GSU. Actual512-byte binary contains508-byte program plus padding; opcode_inventory.json records decoded instruction addresses/bytes and operations. Listing confirms MOVE expands WITH source then TO destination. All static relative branches and IWT R13/R15 targets land at instruction boundaries. Both UMULT instructions are explicitly ALT1/ALT3 prefixed.

No area or real-hardware result is claimed. New ROMs with pruned operations are unsupported on profile-enabled bitstreams; disable generic or audit new program. Full-renderer RTL, physical timing and hardware transfer validation remain integration work.
