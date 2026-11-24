# Exact CPU rendering optimization

Apply only MANIFEST.json patches, checking baseline_bytes against the unmodified current_MESEN.nes (SHA256 5ce6828aa837c83d71caf6af7e7d9900a9f5cf02e0492a3dc794d14bcca427fc). The candidate ROM and every source/test/build artifact remain in this directory. No shared source or build files were changed.

Changes:
- Inline the boss-specific cc65 argument setup. The unused sprite-index argument still advances c_sp, but its discarded read, stack save/restore, subroutine overhead and no-op compare are removed. All live initialization remains identical.
- Reuse Y (already boss slot) rather than reload rslot.
- Fuse centered X subtraction of 128 and floor(width/2). Since width is unsigned byte, the combined value fits in one byte. Restore rt to the original half-width value afterward.
- Original draw entrypoint C62A and shared helper C882 remain fixed. The same UV arrays, sizes, art, capture, clipping and command emitter execute. No new RAM, banks or ROM growth.

Validation: test.py executes the actual baseline and candidate CPU binaries. It covers every boss slot 32..40, every depth 0..55, every unsigned X, rotating across Y carry/clipping boundaries and cc65 stack page-crossing boundaries, plus 30,000 arbitrary shared-helper states. Exact A/X/Y/P/S/PC and every non-hardware-stack RAM byte agree at the unchanged render_geometry_bottom continuation, or at suppression return. This identical continuation proves identical subsequent capture/clipping/command behavior. Only dead hardware-stack residues differ because a nested JSR/PHA was removed. Live return stack is identical.

See TEST.json for final measured instruction-cycle savings. Native Mesen performance, interrupts, display and hardware were not tested by this worker. No hardware/USB/FPGA access occurred. Parent should merge and run native scene validation.
