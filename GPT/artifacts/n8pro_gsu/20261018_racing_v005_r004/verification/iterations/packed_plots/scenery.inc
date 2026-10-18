; Shared local meshes, per-instance descriptors and world-space centers.
.ifndef SCENERY_TREES
SCENERY_TREES = 16
.endif
.ifndef SCENERY_HOUSES
SCENERY_HOUSES = 4
.endif
SCENERY_COUNT = SCENERY_TREES+SCENERY_HOUSES
.ifndef TREE_LOD_DEPTH
TREE_LOD_DEPTH = 8192
.endif
; Base centers $8540 -> camera centers $8d00; mesh scratch $8600.
; Descriptors: vertices, count, faces, count, far faces, count, radius, far vertices.
tree_transform:
  save $8050,r11
  save $80fa,r9
  iwt r10,#256
  jump world_read
trees:
  save $8f30,r11
  load r0,$8008
  save $80f0,r0
  load r0,$800a
  save $80f4,r0
  iwt r7,#$8540
  iwt r8,#$8d00
  ibt r9,#SCENERY_COUNT
  call tree_transform
  ibt r0,#SCENERY_COUNT
  save $8f32,r0
tree_next:
  cache
  iwt r3,#$8d04
  iwt r7,#$8000
  ibt r9,#0
  ibt r8,#0
  ibt r6,#SCENERY_COUNT
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
  cmp r6
  blt select_tree
  nop
  save $8f38,r7
  from r8
  add r8
  add r8
  add r0
  iwt r6,#$8d00
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
  iwt r6,#$8400
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
  ; Conservative sphere/frustum bounds for the 256x192 projection.
  ; Horizontal: z+1.5r. Vertical: .75z+1.28125r. Include Q7 slack.
  from r6
  lsr
  add r6
  add r7
  add #15
  save $8f36,r0
  from r7
  asr
  asr
  move r8,r0
  from r7
  sub r8
  save $80fc,r0
  from r6
  lsr
  lsr
  move r8,r0
  from r6
  .repeat 5
    lsr
  .endrepeat
  add r8
  add r6
  load r8,$80fc
  add r8
  add #15
  save $80fc,r0
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
  load r0,$80fc
  save $8f36,r0
  dec r9
  bne tree_axis
  nop
  ; Houses always retain the complete mesh. Far trees omit only the trunk.
  ibt r0,#4
  save $8f3c,r0
  load r0,$8f3a
  iwt r6,#($8400+SCENERY_TREES*16)
  cmp r6
  bge detailed_model
  nop
  load r0,$8f38
  iwt r6,#TREE_LOD_DEPTH
  cmp r6
  blt detailed_model
  nop
  ibt r0,#8
  save $8f3c,r0
detailed_model:
  ; Camera relative to this model in unrotated world coordinates.
  load r0,$8f34
  iwt r6,#$7c0
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
  load r0,$8f3c
  sub #8
  bne near_vertices
  nop
  ; First five input vertices are exactly the full model's canopy.
  with r3
  add #12
  to r9
  ldw (r3)
near_vertices:
  iwt r8,#$8600
  call tree_transform
  load r0,$8f3a
  load r6,$8f3c
  add r6
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

; Signed 32-bit plane test before projection. Precomputed model-space planes
; avoid divisions for hidden faces; the projected test remains the final guard.
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
