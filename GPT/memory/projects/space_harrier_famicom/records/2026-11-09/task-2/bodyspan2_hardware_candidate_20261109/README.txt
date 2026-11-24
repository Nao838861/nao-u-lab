BodySpan2 hardware-targeted candidate. HARDWARE UNTESTED.
ROM SHA256: 123f93114a7aa1525ba20828a46be8278e037524b504e5132755c5767ee24415
Required matching RBF: [REDACTED_WIN_PATH]
RBF SHA256: d344be0ba48399f212933526c9d4a2b1ae3ae2566be81006199fd7d87c192974
Only the original512-byte GSU region was replaced with the exact latest507-byte program plus padding. All other hardware baseline bytes are unchanged, including actual scenery flag00 at0x11B024, mountain CPU enable, CHR, all15 EM1 poses and audio.
Standard OR/XOR decoder and ALU support confirmed in hash-verified matched RTL. No new mapper or RBF needed by the optimization.
See VERIFICATION.json for complete provenance and byte ranges. Reused tests are not physical-hardware validation. External I/O timing remains unsigned.
