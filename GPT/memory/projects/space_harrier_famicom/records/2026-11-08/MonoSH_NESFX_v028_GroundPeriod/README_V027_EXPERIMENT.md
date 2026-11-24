# v027 Direct Depth + stable anchors

Experimental candidate based on frozen v026_GroundHorizon, retaining camera83 custom Mesen DLL and horizontal ground bands. Never overwrote v024/v026. No ROM/archive uploaded.

Candidate SHA256 ac17d93dac2e5f65e1bed32d6472f3eecec5cb54910d3b22212d5b23c5a64afb. Build: python -X utf8 build.py.

## Bottleneck and changes
v024 loaded old geometry, then switched ROM banks twice and dispatched/reloaded six smooth dimensions/UV values. v027 replaces the original handler loads directly with depth-indexed fixed-ROM lookup. Six object families only: Tree0,Bom0,Bush0,Bush1,FlyStone,Em0. No runtime curve/multiplication. Aggregate v024 unclipped area was2.9% lower than old sizes, so average larger raster area did not explain its slowdown (some individual scenes grow).

Added2016bytes of tables are pinned at$F80E..$FFED in SMOOTH_FIXED, leaving12bytes before vectors$FFFA. Existing PRG_FIXED code addresses retained. RENDER_CODE has room because obsolete16-depth UV arrays were removed. Game/core/collision source, memory allocation and gameplay dimensions unchanged.

Hermite compile-time curve follows SFC MonoSH_FX2 tools/smooth_depth.py, adapted to56 NES depths. Tree height is now derived from smoothed negative treetop relative to fixed camera0 bottom, matching the SFC anchor method. Independent review across33 cameras ?55 transitions found tree reversals448(max8px) original,138(max4px) naive smooth heights,13(max1px) corrected heights. Near/far heights160/8 preserved, height difference from naive curve?3px. These are table-derived geometry counts, not displayed frame rates.

Odd smooth dimensions expose independent-midpoint-floor errors. Matched midpoint X uses carry from ROR X plus original width parity; Y uses carry from height-average ROR. This interpolates the original even center/bottom then subtracts averaged dimensions. Unmatched/reset/identity paths remain untouched. Independent reference checking of actual final clipped commands:6344 commands across6247 matched pairs,zero errors;17 scenes with ambiguous reconstructed lifetime flags excluded.

## Tests and remaining qualification
900-scene final actual capture:1799 PPU fields,1796 presentations,2 queue drops,3 starvations,49 late_fields. In matched producer profiling baseline v026 also1796 presentations,2drops,3starvations,late43. v027 mean producer29811cycles(+0.69% vs29608);p9542510vs42239;max51644(28.86ms)vs53591(29.94ms). Max observed v027 scene634 had16 objects;baseline scene635 had17. Duration includes scheduler/yields,NMI,uploads,not isolated arithmetic. No hardware or full-stage speed claim.

Strict1201 pre-core-tick-boundary comparison: original OAM identical,150/151 original state fields identical. Only_frame_counter differs at5 boundaries and input-edge latches at3. Exact equivalence therefore NOT claimed. Parent is separately running longer boss/death coverage and a fixed-physical-field input test to distinguish renderer-induced input scheduling alias from an actual behavior change. Do not rewrite these strict test results after other checks.

Final video (actual emulator frames, original SELECT invincibility):results/anchor_audit/v027_smooth_motion_experiment.mp4.7-second frame inspected. It is labeled Experimental. No ROM/upload supplied. Original30Hz NES logic,projected-position quantization and untouched EM1/projectile/boss dimension families remain limitations.

Evidence:results/core_identity_anchor/comparison.json;results/anchor_geometry_check.json;results/dimension_geometry_check.json;results/producer_profile_summary.json;results/profile_MonoSH_NESFX_v026_GroundHorizon/audit_trace.json;results/profile_MonoSH_NESFX_v027_DirectDepth/audit_trace.json. Initial uncorrected v027 results retained in direct_depth_audit and core_identity_v026_v027; those are not final ac17.

## Final independent tests
Fixed-NMI-field input test1201 boundaries (boss states0/1/2): all150 gameplay fields, original OAM and latched input identical. Only NMI wallclock/frame timing differs. Extended3601 boundary-triggered test: all150 gameplay fields and original OAM identical,12 wallclock differences and5 input-edge differences. The older strict tests remain valid records; full timing equality is not claimed. Read results/final_validation.json for interpretation and limits. Video fully decoded1799frames,non-silent audio; frames7/12/21/27seconds inspected.
