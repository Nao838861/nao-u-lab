.setcpu "65816"
.smart
.macpack longbranch
.export _fx_stage_render
.import _monosh_stage_objects, _monosh_stage_object_count
.import _monosh_stage_geometry, _monosh_stage_lift, _monosh_ground_depth_pointer
.import _fx_draw, _fx_draw_count, fx_project16
.import _monosh_stage_need_hitboxes, _monosh_player_state
.import _monosh_player_bullets, _monosh_player_bullet_count
.segment "ZEROPAGE"
op: .res 2
gp: .res 2
lp: .res 2
.segment "CODE"
.a8
.i8
_fx_stage_render:
  php
  rep #$30
  lda #_monosh_stage_objects
  sta op
  lda _monosh_stage_object_count
  and #$ff
  sta $0190
object:
  lda $0190
  jne process
  plp
  rts
process:
  ldy #2
  lda (op),y
  and #$ff
  sta $0192               ; z
  ldy #3
  lda (op),y
  and #$ff
  sta $0194               ; type
  tax
  lda f:$7f0000+geometry_asset,x
  and #$ff
  asl
  tax
  lda _monosh_stage_geometry,x
  sta gp
  lda $0192
  asl
  asl
  clc
  adc gp
  sta gp
  ldy #0
  lda (gp),y
  sta $0198               ; width,height
  ldy #2
  lda (gp),y
  and #$ff
  sta $0196               ; source bottom
  lda #219
  sec
  sbc $0196
  tay
  lda _monosh_ground_depth_pointer
  sta lp
  lda (lp),y
  and #$ff
  sta $0196
  lda #207
  sec
  sbc $0196
  sta $0196               ; screen bottom
  lda $0194
  cmp #1
  beq sink
  cmp #3
  beq sink
  cmp #7
  bne lift
sink:
  lda $0192
  ldx #3
  cmp #9
  bcs :+
  dex
  cmp #6
  bcs :+
  dex
  cmp #2
  bcs :+
  dex
:
  txa
  clc
  adc $0196
  sta $0196
lift:
  lda $0194
  cmp #4
  beq fly
  cmp #2
  bne world_x
  ldy #4
  lda (op),y
  and #$ff
  beq world_x
  cmp #13
  bcc :+
  lda #12
:
  sta $019a
  and #$fffe
  tax
  lda _monosh_stage_lift,x
  sta lp
  ldy $0192
  lda (lp),y
  and #$ff
  sta $019c
  lda $019a
  and #1
  beq subtract_lift
  lda _monosh_stage_lift+2,x
  sta lp
  lda (lp),y
  and #$ff
  clc
  adc $019c
  inc
  lsr
  sta $019c
  bra subtract_lift
fly:
  lda _monosh_stage_lift+12
  sta lp
  ldy $0192
  lda (lp),y
  and #$ff
  sta $019c
subtract_lift:
  lda $0196
  sec
  sbc $019c
  sta $0196
world_x:
  ldy #0
  lda (op),y
  ldx $0192
  jsr fx_project16
  clc
  adc #128
  sta $019e               ; center X
  lda $0198
  and #$ff
  lsr
  sta $01a0               ; half width
  clc
  adc $019e
  jmi advance
  lda $019e
  sec
  sbc $01a0
  cmp #256
  jpl advance
  lda $0198
  xba
  and #$ff
  sta $01a2               ; height
  lda $0196
  cmp #21
  jmi advance
  sec
  sbc $01a2
  cmp #212
  jpl advance
  sta $01a4               ; top
  lda _fx_draw_count
  and #$ff
  cmp #64
  bcs collision
  sta $01a6
  asl
  asl
  clc
  adc $01a6
  asl
  tax
  lda $019e
  sta _fx_draw,x
  lda $0196
  sta _fx_draw+2,x
  lda $0198
  sta _fx_draw+4,x
  phx
  ldx $0194
  cpx #2
  bne ordinary_asset
  ldy #5
  lda (op),y
  and #$ff
  sta $01a6
  lda #48
  sec
  sbc $01a6
  bpl :+
  lda #0
:
  lsr
  lsr
  lsr
  cmp #4
  bcc :+
  sta $01a6
  lda #6
  sec
  sbc $01a6
:
  beq ordinary_asset
  clc
  adc #38
  bra asset_selected
ordinary_asset:
  lda f:$7f0000+draw_asset,x
  and #$ff
asset_selected:
  plx
  sta _fx_draw+6,x
  lda $0192
  sta _fx_draw+8,x
  sep #$20
  inc _fx_draw_count
  rep #$20
collision:
  lda _monosh_stage_need_hitboxes
  and #$ff
  jeq advance
  lda _monosh_player_state
  and #$ff
  jne advance
  lda $0194
  cmp #2
  jeq advance
  lda $01a4
  jmi advance
  ldx #0
bullet:
  lda _monosh_player_bullets,x
  and #$ff
  cmp #1
  bne next_bullet
  lda _monosh_player_bullets+3,x
  and #$ff
  asl
  sta $01a6
  lda $0192
  sec
  sbc $01a6
  clc
  adc #8
  cmp #10
  bcs next_bullet
  lda _monosh_player_bullets+2,x
  and #$ff
  cmp $01a4
  bcc next_bullet
  cmp $0196
  bcc test_x
  bne next_bullet
test_x:
  lda _monosh_player_bullets+1,x
  and #$ff
  sec
  sbc $019e
  bpl :+
  eor #$ffff
  inc
:
  cmp $01a0
  bcc hit
  bne next_bullet
hit:
  sep #$20
  stz _monosh_player_bullets,x
  dec _monosh_player_bullet_count
  lda #2
  ldy #3
  sta (op),y
  lda $0194
  cmp #4
  bne :+
  lda #12
  bra :++
:
  lda #0
:
  iny
  sta (op),y
  lda #49
  iny
  sta (op),y
  rep #$20
  bra advance
next_bullet:
  txa
  clc
  adc #5
  tax
  cpx #15
  jne bullet
advance:
  lda op
  clc
  adc #6
  sta op
  dec $0190
  jmp object
geometry_asset:
  .byte 1,4,5,0,2,3,1,1
draw_asset:
  .byte 5,4,5,0,2,5,5,1
