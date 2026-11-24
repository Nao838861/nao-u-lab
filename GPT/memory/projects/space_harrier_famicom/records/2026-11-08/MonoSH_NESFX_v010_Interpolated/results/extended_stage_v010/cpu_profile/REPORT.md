# Frozen v010 CPU load profile

ROM: 2bb00f360554c36f7952db87209c4f103b8cd42d23950fc9be9d75b6690f0065
Window: after field1600 through2050 (450fields), same controller-only stage replay.
Replay validation:116/116 checkpoints matched prior run, including exact CPU/PPU time and gameplay/counters.
No CPU breakpoints, RAM writes, source changes or timing changes.

## Findings
- Whole window: left loop 6.3861–6.3885% CPU (1.0626–1.0630ms/field), 312 clipped objects / 21345 pixel iterations. Top loop 0 iterations. Entire render_clip 17.7780–17.8204%.
- Slowdown1700–1800: left loop 14.1419–14.1524% CPU (2.3531–2.3549ms/field), 208 clipped objects / 10499 pixel iterations. Top loop 0 iterations. Entire render_clip 24.5562–24.6032%.
- Peak1720–1740: left loop 17.6895–17.7033% CPU (2.9434–2.9457ms/field), 48 clipped objects / 2627 pixel iterations. Top loop 0 iterations. Entire render_clip 27.6013–27.6498%.

Left clipping is material, not the sole bottleneck. In1950–2000 it uses only about0.13% CPU, while later presentation gaps occur at1998 and2000.
Preserving exact UV and clamping behavior with bounded multiply-based clipping is justified by measurements, but every-gap removal must be re-tested.

## Whole-window function profile
Inclusive means include nested calls and cooperative rendering. Do not add inclusive percentages.

- _core_draw: 225 calls, mean inclusive8.5737ms, profiler max15.3025ms, exclusive0.10% / inclusive25.76% CPU.
- _core_tick: 225 calls, mean inclusive2.5473ms, profiler max7.6909ms, exclusive0.60% / inclusive7.65% CPU.
- build_midpoint: 219 calls, mean inclusive9.2508ms, profiler max14.5527ms, exclusive13.64% / inclusive27.06% CPU.
- render_clip: 2758 calls, mean inclusive0.2556ms, profiler max3.7005ms, exclusive8.92% / inclusive9.41% CPU.
- prepare_oam_impl: 219 calls, mean inclusive3.4285ms, profiler max4.8112ms, exclusive9.77% / inclusive10.03% CPU.
- copy_commands: 438 calls, mean inclusive1.0468ms, profiler max2.1187ms, exclusive0.28% / inclusive6.12% CPU.
- nmi: 450 calls, mean inclusive1.2449ms, profiler max1.2745ms, exclusive4.70% / inclusive7.48% CPU.
- audio_tick: 450 calls, mean inclusive0.0586ms, profiler max0.2620ms, exclusive0.35% / inclusive0.35% CPU.

## Frozen-ROM anchors
Physical PRG bank82: render_clip CPU$D8D5–$D9C9; left loop$D8E9–$D906; top loop$D91E–$D93B.
_core_draw=$EF0F; _core_tick=$ECC0; build_midpoint=bank82:$DA68; prepare_oam_impl=bank85:$C000; copy_commands=$E33E; NMI=$E4A6.

## Files
cpu_report.json: refined cycle bounds, function metrics and replay equivalence.
cpu_profile_raw.json / profile_*.json: raw existing-debugger counters.
clip_instructions.json: frozen-ROM opcode decode and loop bounds.
summary.json: first conservative unrefined branch bounds.
run_cpu_profile.py / analyze_cpu_profile.py: isolated reproducible harness and analysis.
