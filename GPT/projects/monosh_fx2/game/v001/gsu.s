.include "casfx.inc"
.segment "GSU"
.export render_entry, render_stop
.align 16
render_entry:
  cache
  sub r0
  cmode
  iwt r1,#$2000
  iwt r12,#$1800
  iwt r13,#.loword(clear_loop)
clear_loop:
  stw (r1)
  inc r1
  loop
  inc r1
  iwt r11,#$0000
  ldw (r11)
  iwt r11,#$0004
  stw (r11)
  iwt r0,#$0020
  iwt r11,#$0006
  stw (r11)
dispatch:
  iwt r11,#$0004
  ldw (r11)
  ibt r8,#0
  cmp r8
  beq finished
  nop
  dec r0
  stw (r11)
  iwt r11,#$0006
  ldw (r11)
  move r11,r0
  to r1
  ldw (r11)
  inc r11
  inc r11
  to r2
  ldw (r11)
  inc r11
  inc r11
  to r3
  ldw (r11)
  inc r11
  inc r11
  to r4
  ldw (r11)
  inc r11
  inc r11
  to r5
  ldw (r11)
  inc r11
  inc r11
  to r6
  ldw (r11)
  inc r11
  inc r11
  to r7
  ldw (r11)
  inc r11
  inc r11
  to r9
  ldw (r11)
  inc r11
  inc r11
  to r10
  ldw (r11)
  inc r11
  inc r11
  ldw (r11)
  romb
  inc r11
  inc r11
  iwt r8,#$0006
  from r11
  stw (r8)
  cache
  iwt r13,#.loword(pixel)
row:
  move r1,r5
  move r8,r10
  move r12,r9
pixel:
  merge r14
  with r8
  add r3
  getc
  loop
  plot
  with r7
  add r4
  dec r6
  bne row
  inc r2
  rpix
  iwt r11,#.loword(dispatch)
  jmp (r11)
  nop
finished:
  rpix
  iwt r11,#$0000
  ldw (r11)
render_stop:
  stop
  nop
.repeat 22,I
  .segment .sprintf("ASSET%02X",$44+I)
  .incbin .sprintf("assets/bank%02x.bin",$44+I)
.endrepeat
