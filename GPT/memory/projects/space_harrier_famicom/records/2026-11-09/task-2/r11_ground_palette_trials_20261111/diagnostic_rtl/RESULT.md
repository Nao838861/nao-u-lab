# Integrated palette RTL diagnostic

The original harness fails camera0 low y108/x28 and camera19 high y127/x30 and y128/x29 at phase0. Camera63/83 passed this phase when those assertions were temporarily warnings. These warning runs are diagnostic only, not verification passes.

At the first error, CHR address82439 selects memory0A but the delayed vector output is08. No PRG response is involved. Testbench default inertial delay couples110ns access latency to110ns pulse rejection. Merely changing byte representation or inserting a selected-data signal did not fix it. Explicitly setting rejection to1ps while retaining110ns read and15ns release delays resolves the mismatch with unchanged RTL.

## Recommended minimal generator patch
Before `(D/'tb.vhd').write_text(s)` add:

s=s.replace('mq<=mem(', 'mq<=reject 1 ps inertial mem(').replace('mq_tex<=mem(', 'mq_tex<=reject 1 ps inertial mem(')

`repair_generator.py` applies this only to explicitly supplied generator paths. It has not been run against any candidate by this worker.

## Verification
- reject_delta/phase0.log, phase19.log, phase39.log, abort.log: all fatal original assertions, four cameras0/19/63/83, all PASS.
- transport_phase0.log, transport_phase19.log, transport_phase39.log, transport_abort.log: independent transport crosscheck, all PASS.
- reject_delta/memory_delay.log: standalone110ns address/select latency,15ns release, delta transient, and canceled-read/no-ghost checks PASS. Source tb_memory_delay.vhd beside log.
- stable_assert/settled_last_event.log: full phase0/four-camera run with additional CHR/PRG exact-byte assertions after actual address/control last_event ages exceed110ns, sampled1ps after clock edge, PASS.

The preliminary 'stable attribute monitor, selected-byte intermediary, scalar default-inertial and event-wait models were unsuccessful diagnostics and are not recommended. failed_event_model_experiment.py is retained for provenance only.

## Source identity
racing_display.vhd SHA256 231D6D87C5FB46F0B707E25870635317D29912F9C84AACC5FC609E1EF1E693DF
prg_early_byte.vhd SHA256 5F4BF8D5707E2BEC03C81551773CB00F1F00CC72B308EA35874579DFB3C185E6
These hashes match A_three_step/rtl and reject_delta copies.

## Limits
This is model-based functional verification with explicit access/release assumptions, not electrical characterization or actual hardware signoff. No console interaction, finalized-project edit, experiment source edit, or hardware transfer occurred. No source RTL fix is recommended for this reported failure.
