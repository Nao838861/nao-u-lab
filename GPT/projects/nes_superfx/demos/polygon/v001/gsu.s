; Indexed flat triangle renderer. All transform/project/cull/sort/raster work is GSU.
.include "casfx.inc"
.segment "GSU"
.export render_entry,render_stop,object_begin,transform_begin,cull_begin,tri_begin
.ifndef BRESENHAM
.export slope_begin,raster_begin
.endif
.macro load reg,address
  lm reg,(address)
.endmacro
.macro save address,reg
  sm (address),reg
.endmacro
.macro call address
  link #4
  iwt r15,#address
  nop
.endmacro
.macro jump address
  iwt r15,#address
  nop
.endmacro
.macro add2 reg
  inc reg
  inc reg
.endmacro
.macro shift7
  .repeat 7
    asr
  .endrepeat
.endmacro
.macro ble target
  blt target
  nop
  beq target
.endmacro
.macro bgt target
  .local equal
  beq equal
  nop
  bge target
  nop
equal:
.endmacro
.macro jeq target
  .local skip
  bne skip
  nop
  jump target
skip:
.endmacro
.macro jlt target
  .local skip
  bge skip
  nop
  jump target
skip:
.endmacro
.macro jge target
  .local skip
  blt skip
  nop
  jump target
skip:
.endmacro
.macro jpl target
  .local skip
  bmi skip
  nop
  jump target
skip:
.endmacro
.macro jcs target
  .local skip
  bcc skip
  nop
  jump target
skip:
.endmacro
.macro raster_loop loopname,clipped
  .local right_is_long,long_is_left,round_done,left_clipped,right_clipped,plot8,tail,plot1,skip_scanline,small_span
loopname:
.if clipped
  from r2
  sub #0
  jlt skip_scanline
  nop
  iwt r0,#240
  from r2
  cmp r0
  jge raster_done
  nop
.endif
  move r1,r3
  move r12,r5
  from r4
  sub #0
  beq round_done
  nop
  inc r1
round_done:
.if clipped
  from r1
  sub #0
  bpl left_clipped
  nop
  ibt r1,#0
left_clipped:
  iwt r0,#255
  from r12
  cmp r0
  ble right_clipped
  nop
  iwt r12,#255
right_clipped:
.endif
  from r12
  sub r1
  bmi skip_scanline
  nop
  inc r0
  move r12,r0
  ibt r13,#16
  cmp r13
  blt small_span
  nop
  move r14,r0
  lsr
  lsr
  lsr
  move r12,r0
  sub #0
  beq tail
  nop
  iwt r13,#plot8
plot8:
  .repeat 7
    plot
  .endrepeat
  loop
  plot
tail:
  from r14
  and #7
  beq skip_scanline
  nop
  move r12,r0
small_span:
  iwt r13,#plot1
plot1:
  loop
  plot
skip_scanline:
  from r4
  add r8
  move r4,r0
  with r3
  adc r7
  from r6
  add r10
  move r6,r0
  with r5
  adc r9
  inc r2
  from r2
  cmp r11
  jlt loopname
  nop
  jump raster_half_done
.endmacro
render_entry:
  cache
  ibt r0,#$10
  cmode
  load r1,$8006
  sub r0
  iwt r12,#512
  iwt r13,#clear_buffer
clear_buffer:
  .repeat 15
    stw (r1)
    add2 r1
  .endrepeat
  stw (r1)
  inc r1
  loop
  inc r1
  save $8010,r0 ; transformed vertices
  save $8012,r0 ; submitted triangles
  save $8014,r0 ; visible triangles
  save $8016,r0 ; rejected near/far triangles
  call animate_objects
  call sort_objects
  load r0,$8000
  save $9330,r0 ; remaining objects
  iwt r0,#$8200
  save $9332,r0 ; object cursor
object_begin:
  cache
  load r3,$9332
  iwt r4,#$9320
  ibt r12,#4
  iwt r13,#copy_object
copy_object:
  ldw (r3)
  stw (r4)
  add2 r3
  inc r4
  loop
  inc r4
  save $9332,r3
  load r0,$8004
  load r1,$9326
  add r1
  iwt r1,#63
  and r1
  move r6,r0
  add r0
  move r1,r0
  .repeat 3
    add r0
  .endrepeat
  add r1
  iwt r1,#$8600
  add r1
  save $9328,r0
  load r3,$800c
  iwt r4,#$8140
  load r5,$8008
  load r0,$8010
  add r5
  save $8010,r0
transform_begin:
  to r7
  ldw (r3)
  add2 r3
  to r8
  ldw (r3)
  add2 r3
  to r9
  ldw (r3)
  add2 r3
  load r6,$9328
  iwt r10,#$9320
  ibt r11,#3
axis:
  ldw (r6)
  mult r7
  move r12,r0
  add2 r6
  ldw (r6)
  mult r8
  with r12
  add r0
  add2 r6
  ldw (r6)
  mult r9
  with r12
  add r0
  add2 r6
  from r12
  shift7
  move r12,r0
  ldw (r10)
  add r12
  stw (r4)
  add2 r4
  add2 r10
  dec r11
  bne axis
  nop
  from r4
  sub #6
  move r10,r0
  save $9334,r4
  from r4
  sub #2
  move r1,r0
  ldw (r1)
  ibt r6,#32
  cmp r6
  blt invalid_vertex
  nop
  iwt r6,#512
  cmp r6
  bge invalid_vertex
  nop
  add r0
  add r0
  iwt r6,#$8b00
  add r6
  move r1,r0
  to r6
  ldw (r1)
  add2 r1
  ldw (r1)
  swap
  lsr
  move r12,r0
  from r6
  hib
  lsr
  or r12
  move r6,r0 ; focal length 128, Q8.8 factor
  ldw (r10)
  lmult
  lob
  swap
  move r12,r0
  from r4
  hib
  or r12
  iwt r12,#128
  add r12
  stw (r10)
  add2 r10
  ldw (r10)
  lmult
  lob
  swap
  move r12,r0
  from r4
  hib
  or r12
  ibt r12,#120
  add r12
  stw (r10)
  bra vertex_done
  nop
invalid_vertex:
  sub r0
  stw (r1) ; z=0 rejects a triangle touching the near/far plane
vertex_done:
  load r4,$9334
  dec r5
  beq transformed
  nop
  jump transform_begin
transformed:
  call cull_begin
  iwt r0,#$9b00
  save $9336,r0
render_faces:
  load r5,$9338
  from r5
  sub #0
  beq object_done
  nop
  dec r5
  save $9338,r5
  load r3,$9336
  add2 r3
  to r0
  ldw (r3)
  save $93a0,r0
  add2 r3
  to r8
  ldw (r3)
  add2 r3
  save $9336,r3
  link #2
  jmp r8
  nop
  jump render_faces
object_done:
  load r0,$9330
  dec r0
  save $9330,r0
  beq finished
  nop
  jump object_begin
finished:
  rpix
render_stop:
  stop
  nop
animate_objects:
  load r5,$8000
  iwt r3,#$8204
animate_one:
  from r3
  add #2
  move r1,r0
  ldw (r1)
  move r7,r0
  .repeat 6
    lsr
  .endrepeat
  move r8,r0
  load r0,$8004
  add r7
  iwt r1,#63
  and r1
  add r0
  iwt r1,#$8a80
  add r1
  move r1,r0
  ldw (r1)
  add r8
  stw (r3)
  from r3
  add #8
  move r3,r0
  dec r5
  bne animate_one
  nop
  jmp r11
  nop
.assert *-render_entry <= $200,error,"transform block overflow"
.align $200,$01
cull_begin:
  cache
  save $93fa,r11
  load r3,$800e
  load r5,$800a
  load r0,$8012
  add r5
  save $8012,r0
  sub r0
  save $9338,r0
cull_face:
  from r3
  add #2
  move r1,r0
  to r7
  ldw (r1)
  add2 r1
  to r8
  ldw (r1)
  add2 r1
  to r9
  ldw (r1)
  from r7
  add #4
  move r1,r0
  ldw (r1)
  sub #0
  jeq near_rejected
  nop
  move r10,r0
  from r8
  add #4
  move r1,r0
  ldw (r1)
  sub #0
  jeq near_rejected
  nop
  with r10
  add r0
  from r9
  add #4
  move r1,r0
  ldw (r1)
  sub #0
  jeq near_rejected
  nop
  with r10
  add r0 ; z sum, painter key
  to r1
  ldw (r7) ; Ax
  to r2
  ldw (r8) ; Bx
  to r6
  ldw (r9) ; Cx
  add2 r7
  add2 r8
  add2 r9
  to r7
  ldw (r7) ; Ay
  to r8
  ldw (r8) ; By
  to r9
  ldw (r9) ; Cy
  with r2
  sub r1
  with r6
  sub r1
  with r8
  sub r7
  with r9
  sub r7
  move r7,r6
  move r6,r9
  from r2
  lmult
  move r12,r0
  move r13,r4
  move r6,r7
  from r8
  lmult
  move r14,r0
  from r13
  sub r4
  from r12
  sbc r14
  jpl culled
  nop
  iwt r12,#tri_begin
.ifndef BRESENHAM
  ibt r13,#33
  from r2
  add #15
  add #1
  cmp r13
  bcs shader_chosen
  nop
  from r7
  add #15
  add #1
  cmp r13
  bcs shader_chosen
  nop
  ibt r13,#31
  from r8
  add #15
  cmp r13
  bcs shader_chosen
  nop
  from r9
  add #15
  cmp r13
  bcs shader_chosen
  nop
  from r8
  sub r9
  add #15
  cmp r13
  bcs shader_chosen
  nop
  iwt r12,#small_begin
shader_chosen:
.endif
  save $93cc,r12
  ; Insertion-sort the visible faces by descending depth.
  load r7,$9338
  from r7
  add r7
  move r1,r0
  add r0
  add r1
  iwt r8,#$9b00
  add r8
  move r8,r0 ; destination
sort_insert:
  from r7
  sub #0
  beq insert_face
  nop
  from r8
  sub #6
  move r9,r0
  ldw (r9)
  cmp r10
  bge insert_face
  nop
  stw (r8)
  add2 r9
  add2 r8
  ldw (r9)
  stw (r8)
  add2 r9
  add2 r8
  ldw (r9)
  stw (r8)
  from r8
  sub #10
  move r8,r0
  dec r7
  bra sort_insert
  nop
insert_face:
  from r10
  stw (r8)
  add2 r8
  from r3
  stw (r8)
  add2 r8
  load r0,$93cc
  stw (r8)
  load r0,$9338
  inc r0
  save $9338,r0
  load r0,$8014
  inc r0
  save $8014,r0
  bra culled
  nop
near_rejected:
  load r0,$8016
  inc r0
  save $8016,r0
culled:
  from r3
  add #8
  move r3,r0
  dec r5
  beq cull_done
  nop
  jump cull_face
cull_done:
  load r11,$93fa
  jmp r11
  nop
sort_objects:
  cache
  load r5,$8000
  dec r5
  beq objects_sorted
  nop
  iwt r3,#$8208
sort_object:
  to r7
  ldw (r3)
  add2 r3
  to r8
  ldw (r3)
  add2 r3
  to r9
  ldw (r3)
  add2 r3
  to r10
  ldw (r3)
  from r3
  sub #6
  move r4,r0
shift_object:
  iwt r0,#$8200
  from r4
  cmp r0
  beq insert_object
  nop
  from r4
  sub #4
  move r1,r0
  ldw (r1)
  cmp r9
  bgt insert_object
  nop
  bne move_object
  nop
  add2 r1
  ldw (r1)
  cmp r10
  ble insert_object
  nop
move_object:
  from r4
  sub #8
  move r1,r0
  move r2,r4
  ibt r12,#4
  iwt r13,#copy_shift
copy_shift:
  ldw (r1)
  stw (r2)
  add2 r1
  inc r2
  loop
  inc r2
  from r4
  sub #8
  move r4,r0
  bra shift_object
  nop
insert_object:
  from r7
  stw (r4)
  add2 r4
  from r8
  stw (r4)
  add2 r4
  from r9
  stw (r4)
  add2 r4
  from r10
  stw (r4)
  from r3
  add #2
  move r3,r0
  dec r5
  bne sort_object
  nop
objects_sorted:
  jmp r11
  nop
.assert *-cull_begin <= $200,error,"cull block overflow"
.align $200,$01
.ifdef BRESENHAM
.include "bresenham.inc"
.else
tri_begin:
  cache
  save $93fc,r11
  load r7,$93a0
  ldw (r7)
  color
  add2 r7
  to r8
  ldw (r7)
  add2 r7
  to r9
  ldw (r7)
  add2 r7
  to r10
  ldw (r7)
  to r1
  ldw (r8)
  add2 r8
  to r2
  ldw (r8)
  to r3
  ldw (r9)
  add2 r9
  to r4
  ldw (r9)
  to r5
  ldw (r10)
  add2 r10
  to r6
  ldw (r10)
  from r2
  cmp r4
  ble y12_sorted
  nop
  move r0,r1
  move r1,r3
  move r3,r0
  move r0,r2
  move r2,r4
  move r4,r0
y12_sorted:
  from r4
  cmp r6
  ble y23_sorted
  nop
  move r0,r3
  move r3,r5
  move r5,r0
  move r0,r4
  move r4,r6
  move r6,r0
y23_sorted:
  from r2
  cmp r4
  ble y_sorted
  nop
  move r0,r1
  move r1,r3
  move r3,r0
  move r0,r2
  move r2,r4
  move r4,r0
y_sorted:
  save $9300,r1
  save $9302,r2
  save $9304,r3
  save $9306,r4
  save $9308,r5
  save $930a,r6
  ibt r0,#0
  save $93c0,r0
  from r2
  sub #0
  blt clip_flag_done
  nop
  iwt r7,#240
  from r6
  cmp r7
  bgt clip_flag_done
  nop
  iwt r7,#255
  from r1
  sub #0
  blt clip_flag_done
  nop
  cmp r7
  bgt clip_flag_done
  nop
  from r3
  sub #0
  blt clip_flag_done
  nop
  cmp r7
  bgt clip_flag_done
  nop
  from r5
  sub #0
  blt clip_flag_done
  nop
  cmp r7
  bgt clip_flag_done
  nop
  ibt r0,#1
  save $93c0,r0
clip_flag_done:
  from r6
  sub r2
  beq tri_done
  nop
  iwt r7,#512
  cmp r7
  bge tri_done ; bounded table; scene inputs must satisfy max vertical extent 511
  nop
  from r6
  sub #0
  ble tri_done
  nop
  iwt r7,#240
  from r2
  cmp r7
  bge tri_done
  nop
  from r5
  sub r1
  move r3,r0
  from r6
  sub r2
  move r5,r0
  call slope_begin
  save $93b0,r7
  save $93b2,r8
  load r0,$9304
  load r1,$9300
  sub r1
  move r3,r0
  load r0,$9306
  load r1,$9302
  sub r1
  move r5,r0
  call slope_begin
  save $93b4,r7
  save $93b6,r8
  load r0,$9308
  load r1,$9304
  sub r1
  move r3,r0
  load r0,$930a
  load r1,$9306
  sub r1
  move r5,r0
  call slope_begin
  save $93b8,r7
  save $93ba,r8
  jump raster_begin
tri_done:
  load r11,$93fc
  jmp r11
  nop
.assert *-tri_begin <= $200,error,"triangle block overflow"
.align $200,$01
slope_begin:
  cache
  ; Return signed 16.16 dx/dy, using a general 24-bit reciprocal table.
  ; dy=0 is a flat edge. dy=1 is exact. Other dy are 2..511.
  from r5
  sub #0
  beq slope_zero
  nop
  sub #1
  beq slope_integer
  nop
  from r3
  sub #0
  save $93be,r0
  bpl positive_dx
  nop
  not
  inc r0
positive_dx:
  move r9,r0
  from r5
  add r5
  add r0
  iwt r1,#$8b00
  add r1
  move r1,r0
  to r6
  ldw (r1)
  add2 r1
  to r10
  ldw (r1)
  from r9
  lmult
  move r7,r0
  move r8,r4
  from r6
  sub #0
  bpl low_unsigned
  nop
  with r7
  add r9 ; correct signed LMULT to unsigned low reciprocal
low_unsigned:
  move r6,r10
  from r9
  lmult
  move r3,r0
  from r4
  add r7
  move r7,r0
  with r3
  adc #0
  from r3
  swap
  move r3,r0
  from r7
  hib
  or r3
  move r3,r0
  from r7
  swap
  iwt r6,#$ff00
  and r6
  move r6,r0
  from r8
  hib
  or r6
  move r8,r0
  move r7,r3
  load r0,$93be
  sub #0
  bpl slope_return
  nop
  from r7
  not
  move r7,r0
  from r8
  not
  move r8,r0
  with r8
  add #1
  with r7
  adc #0
  bra slope_return
  nop
slope_zero:
  ibt r7,#0
  ibt r8,#0
  bra slope_return
  nop
slope_integer:
  move r7,r3
  ibt r8,#0
slope_return:
  jmp r11
  nop
.assert *-slope_begin <= $200,error,"slope block overflow"
.assert *-slope_begin <= $100,error,"slope code overlaps per-object sort data"
.align $200,$01
raster_begin:
  cache
  load r2,$9302
  load r3,$9300
  ibt r4,#0
  move r5,r3
  ibt r6,#0
  load r7,$93b0
  load r8,$93b2
  load r9,$93b4
  load r10,$93b6
  load r11,$9306
  ibt r0,#0
  save $93bc,r0
  ; A convex triangle never exchanges its left/right sides within a half.
  ; Choose once, then keep left/right edges in fixed registers in the hot loop.
  from r2
  cmp r11
  beq flat_top_side
  nop
  from r7
  cmp r9
  blt long_on_left
  nop
  bne long_on_right
  nop
  from r8
  cmp r10
  bcc long_on_left
  nop
  bra long_on_right
  nop
flat_top_side:
  load r0,$9304
  from r3
  cmp r0
  ble long_on_left
  nop
long_on_right:
  ibt r0,#0
  save $93c8,r0
  move r0,r3
  move r3,r5
  move r5,r0
  move r0,r4
  move r4,r6
  move r6,r0
  move r0,r7
  move r7,r9
  move r9,r0
  move r0,r8
  move r8,r10
  move r10,r0
  bra sides_chosen
  nop
long_on_left:
  ibt r0,#1
  save $93c8,r0
sides_chosen:
  from r2
  cmp r11
  jeq lower_half
  nop
choose_scanline:
  load r0,$93c0
  sub #0
  beq choose_clipped
  nop
  jump scanline_fast
choose_clipped:
  jump scanline_clipped
  raster_loop scanline_fast,0
  raster_loop scanline_clipped,1
raster_half_done:
  load r0,$93bc
  sub #0
  bne raster_done
  nop
lower_half:
  load r0,$93c8
  sub #0
  beq replace_left_edge
  nop
  load r5,$9304
  ibt r6,#0
  load r9,$93b8
  load r10,$93ba
  bra short_replaced
  nop
replace_left_edge:
  load r3,$9304
  ibt r4,#0
  load r7,$93b8
  load r8,$93ba
short_replaced:
  load r11,$930a
  ibt r0,#1
  save $93bc,r0
  from r2
  cmp r11
  bge raster_done
  nop
  jump choose_scanline
raster_done:
  load r11,$93fc
  jmp r11
  nop
.assert *-raster_begin <= $200,error,"raster block overflow"
.align $200,$01

.include "small.inc"

.endif
