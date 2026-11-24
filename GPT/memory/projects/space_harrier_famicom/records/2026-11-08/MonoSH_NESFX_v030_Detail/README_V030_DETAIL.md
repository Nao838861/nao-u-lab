# v030 Detail: native-resolution grass and swarm enemy

Independent candidate from frozen v028 GroundPeriod. Palette D is not included. Existing v028/v029, original ROMs, SD and RBF were not changed. No ROM or archive was uploaded.

## What changed

Only the source textures and source UV coordinates of Bush0, Bush1 and Em0 were upgraded. Destination dimensions, depth curves, positions and gameplay collision geometry are unchanged.

- Bush0: content 32x17 -> native56x30 (1.75x width, 1.76x height).
- Bush1: content32x15 ->64x30 (2x in each direction), from67x31 original.
- Em0: content32x17 -> native55x30 (1.72x width, 1.76x height).

These are reconstructed, locally preserved SFC bg_color originals, with the existing NES three-color classification. This recovers detail lost during the earlier32px thumbnail conversion; it does not invent pixels or claim64x64 new artwork. A literal64x64 canvas would include transparent padding or upscaling beyond these originals. Current GitHub color4 was not separately verified; its contents API returned404.

The original packed atlas and its metadata remain byte-identical. Native PPU player/shots, ordinary/boss bullets, rotating bullet frames, round Em1 open/closed, trees, stones, explosions, and all sampled boss texels are preserved exactly. IDs remain unchanged; only physical texture addresses are remapped.

## Resource budget and implementation

The three target textures each occupy a64x32 packed2bpp slot512bytes instead of a32x32 slot256bytes. The extra768bytes are recovered from one unused256-byte legacy bullet slot and the two separate256-byte boss span lookup slots. The lookup data now uses128-byte tables inside the boss body's never-sampled top/bottom transparent margins. All eight existing fast boss spans are retained. Actual original/midpoint boss widths are at most80px, giving du>=67; du>=192 bypasses the span table and reads the exact byte texture.

GSU work RAM remains8192bytes, including1024 command/scratch bytes and7168 texture/cache bytes. Atlas startup copy remains7168bytes. ROM remains1,179,664bytes. GSU code grows488 ->512bytes, exactly the existing cache limit. Source row stride is selected once per destination row (8 or16bytes); output pixel dimensions are unchanged.

Original game source, fixed game machine code atF219..F80D, all131072CHRbytes, CPU scheduler, interpolation source, destination geometry tables, and runtime DLL are byte-identical or structurally identical as appropriate. The full static checks are in results/detail_static_checks.json.

## Actual emulator measurements

Configured50MHz dedicated Mesen functional model, same900-scene controller schedule,1799PPUfields/about29.93seconds. This is not an FPGA/hardware throughput claim.

- GSU job mean: v0283.282ms; v0303.963ms (+0.681ms,20.7%).
- GSU job95th percentile:7.751 ->9.952ms.
- GSU job maximum:9.350 ->11.872ms.
- Presentations:1796 ->1793 (about60.01 ->59.91 per second).
- Queue drops:2 ->6; queue starvations:3 ->6; late_fields:50 ->31.
- Mean producer interval:29748.8 ->29604.9 CPU cycles. Includes scheduler effects, not isolated arithmetic.

There is extra rendering work, but this measured interval loses only three additional presentations, about0.17% of fields. Do not describe load as unchanged or promise no slowdown. Scheduling divergence means eight scenes have some raw geometry difference and four camera snapshots differ; this is not an identical-command replay benchmark. The fixed-field logic test below isolates gameplay equivalence.

## Verification

- Build succeeded, and rebuild produced the same ROM hash.
-164 synthetic actual-Mesen GSU cases match an independent CPU pixel sampler exactly across the complete physical12KiB framebuffer, including minification/enlargement, both source row strides, flipped bullets, fractional UV, screen quadrant boundaries, and original/midpoint boss sizes. The collected raw buffer also includes4096 unused trailing bytes. results/detail_unit/oracle.json has zero differences. Failed exploratory runs were superseded before the final hash.
- Existing stage asset packing/hash/preview test passes.
-1201 fixed-NMI-input pre-core_tick boundaries: all150 gameplay state fields, original256-byte OAM and latched inputs identical, including boss states0/1/2. The strict151-field test intentionally reports failure because the wallclock-only_frame_counter differs at one boundary605, with one NMI-count difference. Full timing identity is NOT claimed. See results/detail_core_identity/comparison.json.
- Original source/fixed game bytes, target geometry, active non-target texture bytes, full CHR, and unchanged DLL verified by tools/finalize_detail.py.
-15-second side-by-side MP4 fully decoded; actual frames7 and12seconds inspected. Source recording is controller-only gameplay, using original SELECT invincibility, with no RAM writes or synthetic video frames. Video retains the v028 HUD from the unchanged CPU program; the top label identifies v030.

## Deliverables

- results/detail_comparison.png: Japanese texture comparison at matching display sizes.
- results/detail_comparison_15s.mp4: leftv028/rightv030 actual gameplay, with audio.
- results/v030_detail_from_v028.patch: separated reproducible source patch. Apply only to an independent v028 copy; coordinate any build.py changes when combining Palette D.
- results/detail_performance.json and detail_static_checks.json: measured facts and preservation checks.
- build/MonoSH_NESFX_v030_Detail_UNTESTED.nes: local experimental candidate only.

ROM SHA256:4e01e7ea2922958d7a9b2d6bb9a127c967b371194511d6fad956df36d8833559

No full-stage clear, FPGA, flashcart or SD/RBF validation has been performed. Re-run rendering and control checks if combined with another palette/runtime branch.

The current official prepared Library upload helper failed before preparation with 'Library prepare_uploads is not available'. The two media files remain local; no successful attachment is claimed.
Update: The supported direct single-file route subsequently saved both media files successfully in Space (version0). See results/detail_library_receipts.json for exact identities. Only local xattr metadata application failed because Windows Python lacks os.setxattr; the Space files are saved and can be attached.
