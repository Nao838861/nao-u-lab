.setcpu "65816"
.smart
.macpack longbranch
.export _fx_build_packet
.import _fx_draw, _fx_draw_count, _fx_packet, _fx_packet_count
.import _fx_du_table, _fx_dv_table, _fx_asset_width, _fx_asset_height, _fx_asset_bank
.import _monosh_runtime_frame_counter
.segment "ZEROPAGE"
dp: .res 2
pp: .res 2
steps: .res 2
.segment "CODE"
.a8
.i8
_fx_build_packet:
  php
  rep #$30
  lda _fx_draw_count
  and #$ff
  sta $0140
  asl
  asl
  clc
  adc $0140
  asl
  sta $0142                ; total draw bytes
  lda #10
  sta $0144                ; insertion cursor
sort:
  lda $0144
  cmp $0142
  jcs sorted
  tax
  .repeat 5,I
    lda _fx_draw+I*2,x
    sta $0150+I*2
  .endrepeat
  txa
  sec
  sbc #10
  tax
compare:
  sep #$20
  lda _fx_draw+9,x
  cmp $0159
  bcc insert
  bne move_record
  lda _fx_draw+8,x
  cmp $0158
  bcs insert
move_record:
  rep #$20
  .repeat 5,I
    lda _fx_draw+I*2,x
    sta _fx_draw+10+I*2,x
  .endrepeat
  txa
  sec
  sbc #10
  tax
  bpl compare
insert:
  rep #$20
  txa
  clc
  adc #10
  tax
  .repeat 5,I
    lda $0150+I*2
    sta _fx_draw+I*2,x
  .endrepeat
  lda $0144
  clc
  adc #10
  sta $0144
  jmp sort
sorted:
  lda #_fx_draw
  sta dp
  lda #_fx_packet
  sta pp
  stz _fx_packet_count
  stz $0144
next:
  lda $0144
  cmp $0142
  bcc compile
  plp
  rts
compile:
  ldy #4
  lda (dp),y
  and #$ff
  sta $0160                 ; width
  ldy #5
  lda (dp),y
  and #$ff
  sta $0162                 ; height
  ldy #6
  lda (dp),y
  and #$ff
  sta $0164                 ; asset
  asl
  tax
  lda _fx_du_table,x
  sta steps
  lda $0160
  asl
  tay
  lda (steps),y
  sta $0166                 ; du
  lda _fx_dv_table,x
  sta steps
  lda $0162
  asl
  tay
  lda (steps),y
  sta $0168                 ; dv
  ldy #7
  lda (dp),y
  and #$ff
  sta $016a                 ; flags
  and #$80
  beq :+
  lda _monosh_runtime_frame_counter
  and #1
  beq :+
  jmp skip
:
  stz $016c                 ; u0
  stz $016e                 ; v0 (within asset)
  lda $0160
  lsr
  sta $0170
  ldy #0
  lda (dp),y
  sec
  sbc $0170
  sta $0172                 ; x
  bpl x_positive
  eor #$ffff
  inc
  tax
  lda $0160
  clc
  adc $0172
  sta $0160
  stz $0172
  lda #0
clip_x:
  clc
  adc $0166
  dex
  bne clip_x
  sta $016c
x_positive:
  lda $0172
  clc
  adc $0160
  cmp #257
  bcc :+
  lda #256
  sec
  sbc $0172
  sta $0160
:
  ldy #2
  lda (dp),y
  sec
  sbc $0162
  sec
  sbc #20
  sta $0174                 ; y
  bpl y_positive
  eor #$ffff
  inc
  tax
  lda $0162
  clc
  adc $0174
  sta $0162
  stz $0174
  lda #0
clip_y:
  clc
  adc $0168
  dex
  bne clip_y
  sta $016e
y_positive:
  lda $0174
  clc
  adc $0162
  cmp #193
  bcc :+
  lda #192
  sec
  sbc $0174
  sta $0162
:
  lda $0160
  jeq skip
  jmi skip
  lda $0162
  jeq skip
  jmi skip
  ldx $0164
  lda $016a
  and #$10
  beq :+
  lda _fx_asset_width,x
  and #$ff
  xba
  dec
  sec
  sbc $016c
  sta $016c
  lda $0166
  eor #$ffff
  inc
  sta $0166
:
  lda $016a
  and #$20
  beq :+
  lda _fx_asset_height,x
  and #$ff
  xba
  dec
  sec
  sbc $016e
  sta $016e
  lda $0168
  eor #$ffff
  inc
  sta $0168
:
  lda $0164
  and #1
  beq :+
  lda $016e
  ora #$8000
  sta $016e
:
  ldy #0
  lda $0172
  sta (pp),y
  ldy #8
  sta (pp),y
  ldy #2
  lda $0174
  sta (pp),y
  ldy #4
  lda $0166
  sta (pp),y
  ldy #6
  lda $0168
  sta (pp),y
  ldy #10
  lda $0162
  sta (pp),y
  ldy #12
  lda $016e
  sta (pp),y
  ldy #14
  lda $0160
  sta (pp),y
  ldy #16
  lda $016c
  sta (pp),y
  ldy #18
  lda _fx_asset_bank,x
  and #$ff
  sta (pp),y
  inc _fx_packet_count
  lda pp
  clc
  adc #20
  sta pp
skip:
  lda dp
  clc
  adc #10
  sta dp
  lda $0144
  clc
  adc #10
  sta $0144
  jmp next
