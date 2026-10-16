; Ten objects, shared model descriptors at $8c00 (16 bytes each).
; Base centers $8e00 -> camera centers $8f40; mesh scratch $8600.
; Descriptors: vertices, count, faces, count, far faces, count, radius, far vertices.
tree_transform:
  save $8050,r11
  save $80fa,r9
  iwt r10,#256
  jump vertex
trees:
  save $8f30,r11
  iwt r7,#$8e00
  iwt r8,#$8f40
  ibt r9,#10
  call tree_transform
  ibt r0,#10
  save $8f32,r0
tree_next:
  iwt r3,#$8f44
  iwt r7,#$8000
  ibt r9,#0
  ibt r8,#0
select_tree:
  ldw (r3)
  cmp r7
  blt keep_tree
  nop
  move r7,r0
  move r8,r9
keep_tree:
  with r3
  add #6
  inc r9
  from r9
  sub #10
  blt select_tree
  nop
  save $8f38,r7
  from r8
  add r8
  add r8
  add r0
  iwt r6,#$8f40
  add r6
  save $8f34,r0
  add #4
  move r3,r0
  iwt r0,#$8000
  stw (r3)
  move r0,r8
  .repeat 4
    add r0
  .endrepeat
  iwt r6,#$8c00
  add r6
  save $8f3a,r0
  add #12
  move r3,r0
  ldw (r3)
  move r6,r0
  ; Reject sphere wholly behind the near plane or beyond the far plane.
  from r7
  add r6
  iwt r9,#256
  cmp r9
  jlt tree_done
  from r7
  sub r6
  iwt r9,#18432
  cmp r9
  jge tree_done
  ; Expanded screen cone: |center x/y| < z + 2*radius.
  from r6
  add r6
  add r7
  save $8f36,r0
  load r3,$8f34
  ibt r9,#2
tree_axis:
  ldw (r3)
  sub #0
  bpl tree_positive
  nop
  not
  inc r0
tree_positive:
  load r6,$8f36
  cmp r6
  jge tree_done
  add2 r3
  dec r9
  bne tree_axis
  nop
  load r0,$8f3a
  iwt r6,#$8c80
  cmp r6
  bge house_lod_distance
  nop
  iwt r6,#3072
  bra lod_distance
  nop
house_lod_distance:
  iwt r6,#4096
lod_distance:
  load r0,$8f38
  cmp r6
  blt detailed_model
  nop
  call distant_model
  jump tree_done
detailed_model:
  ; Camera relative to this model in unrotated world coordinates.
  load r0,$8f34
  iwt r6,#$140
  sub r6
  move r3,r0
  ldw (r3)
  move r6,r0
  load r0,$8008
  sub r6
  save $80f0,r0
  load r0,$800c
  save $80f2,r0
  with r3
  add #4
  ldw (r3)
  move r6,r0
  load r0,$800a
  sub r6
  save $80f4,r0
  load r3,$8f3a
  to r7
  ldw (r3)
  add2 r3
  to r9
  ldw (r3)
near_vertices:
  iwt r8,#$8600
  call tree_transform
  load r0,$8f3a
  add #4
  move r3,r0
near_faces:
  to r7
  ldw (r3)
  add2 r3
  to r6
  ldw (r3)
  move r0,r7
  call faces
tree_done:
  load r0,$8f32
  dec r0
  save $8f32,r0
  sub #0
  jeq trees_done
  jump tree_next
trees_done:
  load r11,$8f30
  jmp r11
  nop

distant_model:
  save $8052,r11
  load r0,$8f3a
  iwt r6,#$8c80
  cmp r6
  bge distant_house
  nop
  iwt r7,#$8fa4
  ibt r9,#3
  iwt r0,#$8f80
  ibt r6,#1
  bra distant_setup
  nop
distant_house:
  iwt r7,#$8fb0
  ibt r9,#5
  iwt r0,#$8f8c
  ibt r6,#2
distant_setup:
  save $80fc,r0
  save $80fe,r6
  save $80fa,r9
  load r3,$8f34
  ldw (r3)
  save $80f0,r0
  add2 r3
  ldw (r3)
  save $80f2,r0
  add2 r3
  ldw (r3)
  ; The depth slot was consumed by sorting: use the preserved depth.
  load r0,$8f38
  save $80f4,r0
  iwt r8,#$8600
distant_vertex:
  ldw (r7)
  load r6,$80f0
  add r6
  stw (r8)
  add2 r8
  add2 r7
  ldw (r7)
  save $8042,r0
  load r6,$8012
  call mul8
  move r6,r0
  load r0,$80f2
  sub r6
  stw (r8)
  add2 r8
  load r0,$8042
  load r6,$8014
  call mul8
  move r6,r0
  load r0,$80f4
  sub r6
  stw (r8)
  add2 r8
  add2 r7
  dec r9
  bne distant_vertex
  nop
  load r0,$80fc
  load r6,$80fe
  call faces
  load r11,$8052
  jmp r11
  nop

; Signed 32-bit plane test before projection. Precomputed model-space planes
; avoid divisions for hidden faces; the projected test remains the final guard.
plane_cull:
  load r3,$8080
  iwt r7,#$80f0
  ibt r9,#0
  ibt r10,#0
  ibt r8,#3
plane_axis:
  to r6
  ldw (r3)
  ldw (r7)
  lmult
  move r5,r0
  from r9
  add r4
  move r9,r0
  from r10
  adc r5
  move r10,r0
  add2 r3
  add2 r7
  dec r8
  bne plane_axis
  nop
  to r6
  ldw (r3)
  add2 r3
  to r5
  ldw (r3)
  from r9
  sub r6
  move r4,r0
  from r10
  sbc r5
  bmi plane_return
  nop
  bne plane_front
  nop
  add2 r3
  ldw (r3)
  from r4
  cmp r0
  bcc plane_uncertain
  nop
plane_front:
  ibt r0,#0
  save $8080,r0
plane_uncertain:
  ibt r0,#0
plane_return:
  jmp r11
  nop

car_camera:
  save $8052,r11
  load r0,$8008
  load r6,$8016
  sub r6
  save $8040,r0
  load r0,$800a
  load r6,$8018
  sub r6
  save $8044,r0
  load r6,$801c
  call mul8
  save $8046,r0
  load r0,$8040
  load r6,$801a
  call mul8
  move r6,r0
  load r0,$8046
  sub r6
  save $80f0,r0
  load r0,$800c
  save $80f2,r0
  load r0,$8040
  load r6,$801c
  call mul8
  save $8046,r0
  load r0,$8044
  load r6,$801a
  call mul8
  load r6,$8046
  add r6
  save $80f4,r0
  load r11,$8052
  jmp r11
  nop
