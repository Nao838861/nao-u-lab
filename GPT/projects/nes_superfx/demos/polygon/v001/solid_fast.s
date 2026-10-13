; GSU runtime transform and convex face rasterization. No pre-rendered spans.
.include "casfx.inc"
.segment "GSU"
.export render_entry,render_stop
render_entry:
  cache
  ibt r0,#$10
  cmode
  ; SCBR is selected by the CPU. Clear that entire 16KiB buffer.
  iwt r3,#$8102
  ldw (r3)
  move r1,r0
  sub r0
  iwt r12,#512
  iwt r13,#clear_image
clear_image:
  .repeat 15
    stw (r1)
    inc r1
    inc r1
  .endrepeat
  stw (r1)
  inc r1
  loop
  inc r1
  cache
  iwt r1,#$8100
  ldw (r1)
  iwt r1,#$9800
  stw (r1)
  iwt r0,#$8200
  iwt r1,#$9802
  stw (r1)
cube:
  iwt r1,#$9802
  to r3
  ldw (r1)
  iwt r4,#$80c0
  ibt r12,#4
  iwt r13,#read_object
read_object:
  ldw (r3)
  stw (r4)
  inc r3
  inc r3
  inc r4
  loop
  inc r4
  from r3
  stw (r1)
  iwt r3,#$8000
  iwt r4,#$8040
  ibt r5,#8
vertex:
  iwt r6,#$8080
  iwt r2,#$80c0
  ibt r11,#2
component:
  to r10
  ldw (r2)
  sub r0
  move r8,r0
  move r7,r3
  .repeat 3
    to r9
    ldw (r7)
    ldw (r6)
    mult r9
    with r8
    add r0
    inc r7
    inc r7
    inc r6
    inc r6
  .endrepeat
  from r8
  .repeat 7
    asr
  .endrepeat
  add r10
  stw (r4)
  inc r4
  inc r4
  inc r2
  inc r2
  dec r11
  bne component
  nop
  .repeat 6
    inc r3
  .endrepeat
  dec r5
  bne vertex
  nop
  iwt r11,#$8140
  ibt r0,#3
  iwt r1,#$9804
  stw (r1)
face:
  ldw (r11)
  color
  inc r11
  inc r11
  iwt r10,#$80c4
  ldw (r10)
  add r0
  iwt r1,#$9000
  with r1
  add r0
  move r2,r1
  iwt r0,#$0200
  with r2
  add r0
  inc r10
  inc r10
  to r12
  ldw (r10)
  iwt r13,#clear_spans
clear_spans:
  iwt r0,#$7fff
  stw (r1)
  sub r0
  stw (r2)
  inc r1
  inc r1
  inc r2
  loop
  inc r2
  ibt r12,#4
edge:
  to r3
  ldw (r11)
  inc r11
  inc r11
  to r4
  ldw (r11)
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
  ibt r7,#$ff
dx_positive:
  move r5,r0
  ibt r8,#1
  from r4
  sub r2
  bpl dy_positive
  nop
  not
  inc r0
  ibt r8,#$ff
dy_positive:
  not
  inc r0
  move r6,r0
  from r5
  add r6
  move r9,r0
edge_pixel:
  from r2
  add r2
  move r10,r0
  iwt r0,#$9000
  with r10
  add r0
  ldw (r10)
  from r1
  cmp r0
  bge not_left
  nop
  from r1
  stw (r10)
not_left:
  iwt r0,#$0200
  with r10
  add r0
  ldw (r10)
  from r1
  cmp r0
  blt not_right
  nop
  from r1
  stw (r10)
not_right:
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
  bra edge_pixel
  nop
step_y:
  with r9
  add r5
  with r2
  add r8
  bra edge_pixel
  nop
next_edge:
  dec r12
  beq fill_face
  nop
  iwt r15,#edge
  nop
fill_face:
  iwt r10,#$80c4
  to r2
  ldw (r10)
  from r2
  add r2
  iwt r3,#$9000
  with r3
  add r0
  move r4,r3
  iwt r0,#$0200
  with r4
  add r0
  inc r10
  inc r10
  to r6
  ldw (r10)
fill_row:
  to r1
  ldw (r3)
  to r5
  ldw (r4)
  from r5
  sub r1
  bmi skip_row
  nop
  inc r0
  move r12,r0
  iwt r13,#fill_pixels
fill_pixels:
  loop
  plot
skip_row:
  inc r2
  inc r3
  inc r3
  inc r4
  inc r4
  dec r6
  bne fill_row
  nop
  iwt r1,#$9804
  ldw (r1)
  dec r0
  stw (r1)
  beq next_cube
  nop
  iwt r15,#face
  nop
next_cube:
  iwt r1,#$9800
  ldw (r1)
  dec r0
  stw (r1)
  beq finished
  nop
  iwt r15,#cube
  nop
finished:
  rpix
render_stop:
  stop
  nop
