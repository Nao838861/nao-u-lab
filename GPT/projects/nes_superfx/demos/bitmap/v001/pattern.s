.include "casfx.inc"
.segment "GSU"
.export render_entry,render_stop
render_entry:
  cache
  ibt r0,#$10
  cmode
  ibt r2,#0
row:
  from r2
  .repeat 3
    asr
  .endrepeat
  move r5,r0
  from r2
  .repeat 6
    asr
  .endrepeat
  xor r5
  and #3
  move r5,r0
  ibt r1,#0
  move r12,r8
  iwt r13,#pixel
pixel:
  from r1
  .repeat 3
    asr
  .endrepeat
  move r4,r0
  from r1
  .repeat 6
    asr
  .endrepeat
  xor r4
  xor r5
  and #3
  color
  loop
  plot
  inc r2
  from r2
  cmp r9
  blt row
  nop
  rpix
render_stop:
  stop
  nop
