; SPDX-License-Identifier: GPL-3.0-or-later
; RAM: $0000 bitmap, $1000 vertices, $1100 projected XY, $1200 matrix, $1300 edges.
.include "casfx.inc"
.segment "GSU"
.export render_entry, render_stop
render_entry:
  sub r0
  iwt r1,#0
  iwt r12,#1024
  iwt r13,#clear_loop
clear_loop:
  stw (r1)
  inc r1
  loop
  inc r1
  iwt r3,#$1000
  iwt r4,#$1100
  ibt r5,#8
vertex:
  iwt r6,#$1200
  ibt r11,#2
  ibt r10,#32
component:
  sub r0
  move r8,r0
  move r7,r3
  ibt r12,#3
  iwt r13,#dot
dot:
  to r9
  ldw (r7)
  to r0
  ldw (r6)
  mult r9
  with r8
  add r0
  inc r7
  inc r7
  inc r6
  loop
  inc r6
  from r8
  .repeat 7
    asr
  .endrepeat
  add r10
  stw (r4)
  inc r4
  inc r4
  ibt r10,#24
  dec r11
  bne component
  nop
  .repeat 6
    inc r3
  .endrepeat
  dec r5
  bne vertex
  nop
  iwt r11,#$1300
  ibt r12,#12
edge:
  to r3
  ldw (r11)
  inc r11
  inc r11
  to r4
  ldw (r11)
  inc r11
  inc r11
  ldw (r11)
  color
  inc r11
  inc r11
  to r1
  ldw (r3)
  inc r3
  inc r3
  to r2
  ldw (r3)
  to r3
  ldw (r4)
  inc r4
  inc r4
  to r4
  ldw (r4)
  ibt r7,#1
  from r3
  sub r1
  bpl dx_positive
  nop
  not
  inc r0
  ibt r7,#$FF
dx_positive:
  move r5,r0
  ibt r8,#1
  from r4
  sub r2
  bpl dy_positive
  nop
  not
  inc r0
  ibt r8,#$FF
dy_positive:
  not
  inc r0
  move r6,r0
  from r5
  add r6
  move r9,r0
pixel:
  plot
  dec r1                 ; PLOT increments X; Bresenham owns the coordinate.
  from r1
  cmp r3
  bne advance
  nop
  from r2
  cmp r4
  beq next_edge
  nop
advance:
  from r9
  add r9
  move r10,r0
  from r10
  cmp r6
  blt check_y
  nop
  with r9
  add r6
  with r1
  add r7
check_y:
  from r10
  cmp r5
  blt step_y
  nop
  beq step_y
  nop
  bra pixel
  nop
step_y:
  with r9
  add r5
  with r2
  add r8
  bra pixel
  nop
next_edge:
  dec r12
  bne edge
  nop
  rpix
  iwt r11,#0
  ldw (r11)
render_stop:
  stop
  nop
.assert * <= 512,error,"GSU code must fit the ABI1 cache"
