Rebuild exact ROM bytes: python rebuild.py hardware OUTPUT.nes
Use mesen instead of hardware for the functional-model ROM. Existing files are never overwritten.
Current program uses compact14-byte GSU packets with56 slots, selectedvegetation encoded in the ROM atlas, and palette0 common3A.
The optional GSU renderer profile supports the included508-byte program only. Do not substitute another program without opcode auditing.
Source assembly is included; exact ROM reproduction uses the included baseline and manifest patches.
This folder alone is not a complete hardware release. Matching FPGA fit, timing, assembly and transfer are separate gates.
