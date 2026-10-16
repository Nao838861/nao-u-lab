; Flat ground polygons / affine scanline texture, all raster work on the GSU.
.include "casfx.inc"
.segment "GSU"
.export render_entry,render_stop
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
.macro jeq address
  .local skip
  bne skip
  nop
  jump address
skip:
.endmacro
.macro jge address
  .local skip
  blt skip
  nop
  jump address
skip:
.endmacro
.macro jlt address
  .local skip
  bge skip
  nop
  jump address
skip:
.endmacro

render_entry:
  cache
  ibt r0,#$11
  cmode
  sub r0
  save $8024,r0
  load r0,$8000
  sub #0
  beq polygon_ground
  nop
  call texture_ground
polygon_ground:
  call transform
  call faces
  rpix
render_stop:
  stop
  nop

; Row table: forward and half-width in world Q9.7. $7fff means sky/far.
texture_ground:
  save $8052,r11
  sub r0
  save $8054,r0
  iwt r0,#$8c00
  save $8056,r0
texture_row:
  load r3,$8056
  to r0
  ldw (r3)
  save $8058,r0
  add2 r3
  to r0
  ldw (r3)
  save $805a,r0
  add2 r3
  save $8056,r3
  load r0,$8058
  iwt r6,#$7fff
  cmp r6
  jeq texture_next
  call setup_row
  cache
  load r2,$8054
  ibt r1,#0
  iwt r12,#256
  iwt r13,#texel
  load r14,$8004
  iwt r0,#$2800
  with r14
  add r0
texel:
  ; MERGE packs u integer in the high byte, v integer in the low byte.
  merge
  bvs grass_texel             ; either coordinate outside unsigned 0..63
  nop
  ; Resident texture is u-major: fold MERGE into u*64+v.
  lsr
  lsr
  iwt r9,#$3fc0
  and r9
  move r9,r0
  from r8
  hib
  or r9
  move r9,r0
  iwt r10,#$800
  cmp r10
  bcc texture_address
  nop
  with r9
  add r10                    ; skip the visible bottom-right 2KiB block
texture_address:
  from r9
  add r14
  move r9,r0
  ldb (r9)
  bra plot_texel
  nop
grass_texel:
  ibt r0,#1
plot_texel:
  color
  plot
  with r7
  add r3
  with r8
  add r5
  loop
  nop
texture_next:
  load r0,$8054
  inc r0
  save $8054,r0
  iwt r6,#192
  cmp r6
  jlt texture_row
  load r11,$8052
  jmp r11
  nop
.assert *-render_entry <= $200,error,"entry/texture block overflow"
.align $200,$01

; u/v are texture Q8.8: world Q9.7 naturally includes the 1/2 texture scale.
setup_row:
  cache
  save $805c,r11
  load r0,$8058
  load r6,$8010
  call mul8
  load r6,$8008
  add r6
  save $805e,r0
  load r0,$805a
  load r6,$800e
  call mul8
  move r6,r0
  load r0,$805e
  add r6                    ; screen-left ray: +half*cos in east/south world
  iwt r6,#8192
  add r6
  move r7,r0
  load r0,$8058
  load r6,$800e
  call mul8
  load r6,$800a
  add r6
  save $805e,r0
  load r0,$805a
  load r6,$8010
  call mul8
  load r6,$805e
  from r6
  sub r0                    ; screen-left ray: -half*sin
  iwt r6,#8192
  add r6
  move r8,r0
  load r0,$805a
  load r6,$800e
  call mul15                 ; half-width*cos / 128 gives per-pixel increment
  not
  inc r0
  move r3,r0
  load r0,$805a
  load r6,$8010
  call mul15
  move r5,r0
  load r11,$805c
  jmp r11
  nop

; Signed product >>8. Only r0,r4,r5 are clobbered; multiplier in r6.
mul8:
  lmult
  move r5,r0
  from r4
  hib
  move r4,r0
  from r5
  lob
  swap
  or r4
  jmp r11
  nop
mul15:
  lmult
  move r5,r0
  from r4
  .repeat 15
    lsr
  .endrepeat
  move r4,r0
  from r5
  add r5
  or r4
  jmp r11
  nop
mul14:
  lmult
  move r5,r0
  from r4
  .repeat 14
    lsr
  .endrepeat
  move r4,r0
  from r5
  add r5
  add r0
  or r4
  jmp r11
  nop
.align $200,$01

transform:
  cache
  save $8050,r11
  iwt r7,#$8100
  iwt r8,#$8600
  load r9,$801e
  ibt r10,#0
vertex:
  ldw (r7)
  save $8040,r0
  add2 r7
  ldw (r7)
  save $8042,r0
  add2 r7
  ldw (r7)
  save $8044,r0
  add2 r7
  load r0,$8028
  from r10
  cmp r0
  blt world_vertex
  nop
  load r0,$8028
  add #8
  from r10
  cmp r0
  bge world_vertex
  nop
  ; The moving car starts at the header's vertex index.
  load r0,$8040
  load r6,$801a
  call mul8
  save $8046,r0
  load r0,$8044
  load r6,$801c
  call mul8
  load r6,$8046
  sub r6                    ; body right is (-cos,+sin), not (+cos,-sin)
  load r6,$8016
  add r6
  save $8048,r0
  load r0,$8040
  load r6,$801c
  call mul8
  save $8046,r0
  load r0,$8044
  load r6,$801a
  call mul8
  load r6,$8046
  add r6
  load r6,$8018
  add r6
  save $8044,r0
  load r0,$8048
  save $8040,r0
world_vertex:
  load r0,$8040
  load r6,$8008
  sub r6
  save $8040,r0
  load r0,$8044
  load r6,$800a
  sub r6
  save $8044,r0
  load r0,$8040
  load r6,$800e
  call mul8
  save $8046,r0
  load r0,$8044
  load r6,$8010
  call mul8
  load r6,$8046
  sub r6                    ; screen right = dz*sin - dx*cos
  stw (r8)
  add2 r8
  load r0,$8040
  load r6,$8010
  call mul8
  save $8046,r0
  load r0,$8044
  load r6,$800e
  call mul8
  load r6,$8046
  add r6
  save $804a,r0
  load r0,$800c
  load r6,$8042
  sub r6
  save $804c,r0
  load r6,$8012
  call mul8
  save $8046,r0
  load r0,$804a
  load r6,$8014
  call mul8
  load r6,$8046
  from r6
  sub r0
  stw (r8)
  add2 r8
  load r0,$804a
  load r6,$8012
  call mul8
  save $8046,r0
  load r0,$804c
  load r6,$8014
  call mul8
  load r6,$8046
  add r6
  stw (r8)
  add2 r8
  inc r10
  dec r9
  beq vertices_done
  nop
  jump vertex
vertices_done:
  load r11,$8050
  jmp r11
  nop
.align $200,$01

faces:
  cache
  save $8078,r11
  iwt r0,#$8300
  save $807a,r0
  load r0,$8020
  save $807c,r0
next_face:
  load r7,$807a
  ldw (r7)
  save $807e,r0
  add2 r7
  ldw (r7)
  save $8080,r0
  add2 r7
  ; Texture mode skips the ground quads, whose end pointer is in the header.
  load r0,$8000
  sub #0
  beq copy_face
  nop
  load r0,$807a
  load r6,$802a
  cmp r6
  jlt skip_face
copy_face:
  iwt r8,#$8800
  ibt r9,#4
copy_corner:
  to r3
  ldw (r7)
  add2 r7
  .repeat 3
    ldw (r3)
    stw (r8)
    add2 r3
    add2 r8
  .endrepeat
  dec r9
  bne copy_corner
  nop
  iwt r0,#$8800
  save $8064,r0
  iwt r0,#$8840
  save $8066,r0
  ibt r0,#4
  save $8068,r0
  iwt r0,#256
  save $8060,r0
  ibt r0,#0
  save $8062,r0
  call clip_plane
  load r0,$806a
  sub #3
  blt skip_face
  nop
  load r0,$806a
  save $8068,r0
  iwt r0,#$8840
  save $8064,r0
  iwt r0,#$8800
  save $8066,r0
  iwt r0,#18432
  save $8060,r0
  ibt r0,#1
  save $8062,r0
  call clip_plane
  load r0,$806a
  sub #3
  blt skip_face
  nop
  call project_polygon
  call raster_polygon
skip_face:
  load r0,$807a
  add #12
  save $807a,r0
  load r0,$807c
  dec r0
  save $807c,r0
  beq faces_done
  nop
  jump next_face
faces_done:
  load r11,$8078
  jmp r11
  nop

; Generic one-plane Sutherland-Hodgman; near and far use opposite signs.
clip_plane:
  save $8086,r11
  load r7,$8064
  load r8,$8066
  save $8074,r8
  load r0,$8068
  save $8076,r0
  sub #1
  move r6,r0
  add r0
  add r6
  add r0
  add r7
  save $806c,r0
  save $806e,r7
  ibt r0,#0
  save $806a,r0
clip_edge:
  cache
  load r3,$806c
  add2 r3
  add2 r3
  ldw (r3)
  call inside
  save $8070,r0
  load r3,$806e
  add2 r3
  add2 r3
  ldw (r3)
  call inside
  save $8072,r0
  load r6,$8070
  xor r6
  beq no_intersection
  nop
  call intersect
no_intersection:
  load r0,$8072
  sub #0
  beq next_clip_edge
  nop
  load r3,$806e
  load r8,$8074
  .repeat 3
    ldw (r3)
    stw (r8)
    add2 r3
    add2 r8
  .endrepeat
  save $8074,r8
  load r0,$806a
  inc r0
  save $806a,r0
next_clip_edge:
  load r0,$806e
  save $806c,r0
  add #6
  save $806e,r0
  load r0,$8076
  dec r0
  save $8076,r0
  bne clip_edge
  nop
  load r11,$8086
  jmp r11
  nop
inside:
  load r6,$8060
  sub r6
  load r6,$8062
  from r6
  sub #0
  bne far_inside
  nop
  ; Reload because the sign test above overwrites flags.
  ldw (r3)
  load r6,$8060
  sub r6
  bge yes_inside
  nop
  bra no_inside
  nop
far_inside:
  ldw (r3)
  load r6,$8060
  from r6
  sub r0
  bge yes_inside
  nop
no_inside:
  ibt r0,#0
  jmp r11
  nop
yes_inside:
  ibt r0,#1
  jmp r11
  nop
.align $200,$01

intersect:
  cache
  save $8090,r11
  load r7,$806c
  load r8,$806e
  load r0,$8070
  sub #0
  beq out_in_order
  nop
  move r3,r7
  move r7,r8
  move r8,r3
out_in_order:
  save $8092,r7
  save $8094,r8
  from r7
  add #4
  move r3,r0
  to r9
  ldw (r3)
  from r8
  add #4
  move r3,r0
  ldw (r3)
  sub r9
  bpl denominator_positive
  nop
  not
  inc r0
denominator_positive:
  move r6,r0
  load r0,$8060
  sub r9
  bpl numerator_positive
  nop
  not
  inc r0
numerator_positive:
  move r9,r0
  lsr
  lsr
  move r5,r0
  from r9
  and #3
  swap
  .repeat 6
    add r0
  .endrepeat
  move r4,r0
  call divide
  save $8096,r4
  load r7,$8092
  load r8,$8094
  load r9,$8074
  ibt r10,#2
intersection_axis:
  ldw (r7)
  save $8098,r0
  ldw (r8)
  load r6,$8098
  sub r6
  load r6,$8096
  call mul14
  load r6,$8098
  add r6
  stw (r9)
  add2 r7
  add2 r8
  add2 r9
  dec r10
  bne intersection_axis
  nop
  load r0,$8060
  stw (r9)
  add2 r9
  save $8074,r9
  load r0,$806a
  inc r0
  save $806a,r0
  load r11,$8090
  jmp r11
  nop

project_polygon:
  save $80a0,r11
  iwt r7,#$8800
  iwt r8,#$8880
  load r9,$806a
  save $8082,r9
project_vertex:
  cache
  from r7
  add #4
  move r3,r0
  ldw (r3)
  save $80a2,r0
  ldw (r7)
  call project_coord
  iwt r6,#128
  add r6
  stw (r8)
  add2 r7
  add2 r8
  ldw (r7)
  call project_coord
  iwt r6,#96
  add r6
  stw (r8)
  add2 r7
  add2 r7
  add2 r8
  dec r9
  bne project_vertex
  nop
  load r11,$80a0
  jmp r11
  nop
project_coord:
  save $80a4,r11
  save $80a6,r0
  sub #0
  bpl projection_positive
  nop
  not
  inc r0
projection_positive:
  iwt r6,#128
  lmult
  move r5,r0
  load r6,$80a2
  call divide
  load r0,$80a6
  sub #0
  bpl projection_sign_done
  nop
  from r4
  not
  inc r0
  bra projection_return
  nop
projection_sign_done:
  move r0,r4
projection_return:
  load r11,$80a4
  jmp r11
  nop
.align $200,$01

raster_polygon:
  cache
  save $80b0,r11
  ; Optional car backface test, signed 32-bit projected cross product.
  load r0,$8080
  sub #0
  beq clear_spans
  nop
  load r0,$8884
  load r6,$8880
  sub r6
  move r7,r0
  load r0,$888a
  load r6,$8882
  sub r6
  move r6,r0
  from r7
  lmult
  save $80b2,r4
  save $80b4,r0
  load r0,$8886
  load r6,$8882
  sub r6
  move r7,r0
  load r0,$8888
  load r6,$8880
  sub r6
  move r6,r0
  from r7
  lmult
  move r5,r0
  load r0,$80b2
  sub r4
  load r0,$80b4
  sbc r5
  jlt raster_return
clear_spans:
  ; Reject off-screen faces, and clear only their active scanline interval.
  iwt r3,#$8880
  iwt r8,#$7fff
  iwt r9,#$8000
  iwt r10,#$7fff
  iwt r14,#$8000
  load r12,$8082
  iwt r13,#polygon_bounds
polygon_bounds:
  ldw (r3)
  cmp r10
  bge keep_min_x
  nop
  move r10,r0
keep_min_x:
  cmp r14
  blt keep_max_x
  nop
  move r14,r0
keep_max_x:
  add2 r3
  ldw (r3)
  cmp r8
  bge keep_min_y
  nop
  move r8,r0
keep_min_y:
  cmp r9
  blt keep_max_y
  nop
  move r9,r0
keep_max_y:
  inc r3
  loop
  inc r3
  iwt r0,#256
  from r10
  cmp r0
  jge raster_return
  from r14
  sub #0
  jlt raster_return
  iwt r0,#192
  from r8
  cmp r0
  jge raster_return
  from r9
  sub #0
  jlt raster_return
  jeq raster_return
  from r8
  sub #0
  bpl bounds_top_ok
  nop
  ibt r8,#0
bounds_top_ok:
  iwt r0,#192
  from r9
  cmp r0
  blt bounds_bottom_ok
  nop
  iwt r9,#192
bounds_bottom_ok:
  from r9
  sub r8
  jeq raster_return
  move r12,r0
  save $80ba,r8
  save $80bc,r9
  from r8
  add r8
  add r0
  iwt r3,#$8900
  with r3
  add r0
  iwt r13,#clear_span
clear_span:
  iwt r0,#$7fff
  stw (r3)
  add2 r3
  iwt r0,#$8000
  stw (r3)
  inc r3
  loop
  inc r3
  iwt r0,#$8880
  save $80b6,r0
  load r0,$8082
  save $80b8,r0
polygon_edge:
  cache
  load r7,$80b6
  move r8,r7
  add2 r8
  add2 r8
  load r0,$80b8
  sub #1
  bne edge_not_last
  nop
  iwt r8,#$8880
edge_not_last:
  ldw (r7)
  save $80be,r0
  add2 r7
  ldw (r7)
  save $80c0,r0
  ldw (r8)
  save $80c2,r0
  add2 r8
  ldw (r8)
  save $80c4,r0
  call edge_span
  load r0,$80b6
  add #4
  save $80b6,r0
  load r0,$80b8
  dec r0
  save $80b8,r0
  bne polygon_edge
  nop
  call fill_spans
raster_return:
  load r11,$80b0
  jmp r11
  nop

; Sort each edge upward, clip its y interval, then use quotient/remainder DDA.
edge_span:
  save $80c6,r11
  load r7,$80be
  load r8,$80c0
  load r9,$80c2
  load r10,$80c4
  from r10
  cmp r8
  jeq edge_return
  bge sorted_edge
  nop
  move r3,r7
  move r7,r9
  move r9,r3
  move r3,r8
  move r8,r10
  move r10,r3
sorted_edge:
  iwt r6,#192
  from r8
  cmp r6
  jge edge_return
  from r10
  sub #0
  jlt edge_return
  jeq edge_return
  from r10
  sub r8
  save $80c8,r0             ; denominator
  from r9
  sub r7
  ibt r6,#1
  bpl edge_dx_positive
  nop
  not
  inc r0
  ibt r6,#$ff
edge_dx_positive:
  save $80ca,r6             ; sign
  save $80cc,r0             ; abs dx
  save $80ce,r7             ; original x
  save $80d0,r8             ; original y
  iwt r6,#192
  from r10
  cmp r6
  blt edge_end_ok
  nop
  iwt r10,#192
edge_end_ok:
  save $80d2,r10
  load r4,$80cc
  ibt r5,#0
  load r6,$80c8
  call divide
  save $80d4,r4             ; absolute integer step
  save $80d6,r5             ; absolute remainder step
  load r0,$80d0
  sub #0
  bpl no_y_skip
  nop
  not
  inc r0
  load r6,$80cc
  lmult
  move r5,r0
  load r6,$80c8
  call divide
  ibt r2,#0
  bra edge_initial_x
  nop
no_y_skip:
  load r2,$80d0
  ibt r4,#0
  ibt r5,#0
edge_initial_x:
  load r1,$80ce
  load r9,$80ca
  from r9
  sub #0
  bmi initial_negative
  nop
  with r1
  add r4
  bra initial_ready
  nop
initial_negative:
  with r1
  sub r4
initial_ready:
  load r7,$80d4
  from r9
  sub #0
  bpl positive_step
  nop
  from r7
  not
  inc r0
  move r7,r0
positive_step:
  load r6,$80d6
  load r8,$80c8
  load r10,$80d2
  load r0,$80ba
  from r2
  cmp r0
  bge min_y_ok
  nop
  save $80ba,r2
min_y_ok:
  load r0,$80bc
  from r10
  cmp r0
  blt max_y_ok
  nop
  save $80bc,r10
max_y_ok:
  jump edge_rows
edge_return:
  load r11,$80c6
  jmp r11
  nop
.align $200,$01

edge_rows:
  cache
  from r2
  add r2
  add r0
  iwt r3,#$8900
  with r3
  add r0
edge_row:
  move r4,r1
  move r14,r1
  from r5
  sub #0
  beq exact_edge
  nop
  from r9
  sub #0
  bmi negative_fraction
  nop
  inc r4
  bra exact_edge
  nop
negative_fraction:
  dec r14
exact_edge:
  ldw (r3)
  from r4
  cmp r0
  bge keep_left
  nop
  from r4
  stw (r3)
keep_left:
  add2 r3
  ldw (r3)
  from r14
  cmp r0
  blt keep_right
  nop
  from r14
  stw (r3)
keep_right:
  add2 r3
  with r1
  add r7
  with r5
  add r6
  from r5
  cmp r8
  bcc remainder_ok
  nop
  with r5
  sub r8
  with r1
  add r9
remainder_ok:
  inc r2
  from r2
  cmp r10
  blt edge_row
  nop
  jump edge_return

fill_spans:
  cache
  save $80d8,r11
  ; Only the rear face uses the native red/gray checkerboard.
  ibt r0,#$11
  cmode
  load r0,$807e
  iwt r6,#$20
  cmp r6
  bne material_ready
  nop
  ibt r0,#$13
  cmode
material_ready:
  load r0,$807e
  color
  load r2,$80ba
  load r10,$80bc
  from r2
  cmp r10
  bge fill_return
  nop
  from r2
  add r2
  add r0
  iwt r3,#$8900
  with r3
  add r0
fill_row:
  to r1
  ldw (r3)
  add2 r3
  to r4
  ldw (r3)
  add2 r3
  from r1
  sub #0
  bpl fill_left_ok
  nop
  ibt r1,#0
fill_left_ok:
  iwt r0,#255
  from r4
  cmp r0
  blt fill_right_ok
  nop
  iwt r4,#255
fill_right_ok:
  iwt r0,#256
  from r1
  cmp r0
  bge fill_next
  nop
  from r4
  sub #0
  bmi fill_next
  nop
  from r4
  sub r1
  bmi fill_next
  nop
  inc r0
  move r12,r0
  load r0,$807e
  iwt r6,#$30
  cmp r6
  beq kerb_row
  nop
  iwt r13,#flat_pixels
flat_pixels:
  loop
  plot
  bra fill_next
  nop
kerb_row:
  iwt r13,#kerb_pixels
kerb_pixels:
  ; Four-pixel diagonal bands remain visible on narrow projected kerbs.
  from r1
  add r2
  and #4
  lsr
  move r7,r0
  lsr
  add r7
  color
  loop
  plot
fill_next:
  inc r2
  from r2
  cmp r10
  blt fill_row
  nop
  load r0,$8024
  inc r0
  save $8024,r0
fill_return:
  load r11,$80d8
  jmp r11
  nop

; Unsigned 32/16 division. r5:r4 / r6 -> r4 quotient, r5 remainder.
; Callers guarantee quotient fits 16 bits and denominator !=0.
divide:
  cache
  iwt r12,#16
  iwt r13,#division_bit
division_bit:
  from r4
  add r4
  move r4,r0
  with r5
  adc r5
  from r5
  cmp r6
  bcc division_next
  nop
  with r5
  sub r6
  inc r4
division_next:
  loop
  nop
  jmp r11
  nop
.assert *-render_entry <= $1000,error,"GSU code exceeds work RAM"
