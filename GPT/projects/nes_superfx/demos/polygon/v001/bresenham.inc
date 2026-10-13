tri_begin:
  cache
  save $93fc,r11
  load r10,$93a0
  ldw (r10)
  color
  add2 r10
  to r7
  ldw (r10)
  add2 r10
  to r8
  ldw (r10)
  add2 r10
  to r9
  ldw (r10)
  save $9300,r7
  save $9302,r8
  save $9304,r8
  save $9306,r9
  save $9308,r9
  save $930a,r7
  add2 r7
  add2 r8
  add2 r9
  to r1
  ldw (r7)
  to r2
  ldw (r8)
  to r3
  ldw (r9)
  move r4,r1
  from r2
  cmp r1
  bge b_min2
  nop
  move r1,r2
b_min2:
  from r3
  cmp r1
  bge b_min3
  nop
  move r1,r3
b_min3:
  from r2
  cmp r4
  ble b_max2
  nop
  move r4,r2
b_max2:
  from r3
  cmp r4
  ble b_max3
  nop
  move r4,r3
b_max3:
  from r4
  sub #0
  jlt b_done
  nop
  iwt r0,#240
  from r1
  cmp r0
  jge b_done
  nop
  from r1
  sub #0
  bpl b_ymin_ok
  nop
  ibt r1,#0
b_ymin_ok:
  iwt r0,#239
  from r4
  cmp r0
  ble b_ymax_ok
  nop
  iwt r4,#239
b_ymax_ok:
  save $93d0,r1
  from r4
  sub r1
  inc r0
  save $93d2,r0
  iwt r11,#$9300
  iwt r10,#$93d0
  ldw (r10)
  add r0
  iwt r1,#$8400
  with r1
  add r0
  move r2,r1
  iwt r0,#$1a00
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
  iwt r0,#$8000
  stw (r2)
  inc r1
  inc r1
  inc r2
  loop
  inc r2
  ibt r12,#3
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
  sub #0
  blt bounds_recorded
  nop
  iwt r0,#240
  from r2
  cmp r0
  bge bounds_recorded
  nop
  from r2
  add r2
  move r10,r0
  iwt r0,#$8400
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
  iwt r0,#$1a00
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
bounds_recorded:
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
  iwt r10,#$93d0
  to r2
  ldw (r10)
  from r2
  add r2
  iwt r3,#$8400
  with r3
  add r0
  move r4,r3
  iwt r0,#$1a00
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
  from r1
  sub #0
  bpl left_ok
  nop
  ibt r1,#0
left_ok:
  iwt r0,#255
  from r5
  cmp r0
  ble right_ok
  nop
  iwt r5,#255
right_ok:
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
b_done:
  rpix
  load r11,$93fc
  jmp r11
  nop
.assert *-tri_begin <= $400,error,"baseline triangle block overflow"
