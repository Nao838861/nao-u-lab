.setcpu "65816"
.smart
.export _fx_ground_native
.export ground_empty
.import _fx_ground_vptr, _fx_ground_c1ptr, _fx_ground_c3ptr, _fx_ground_bandptr
.import _fx_ground_horizon, _fx_ground_step, _fx_ground_light, _fx_ground_dark
.import _monosh_ground_offset
.import _fx_far_u_acc, _fx_far_d_acc, _fx_ground_far_xptr
.segment "ZEROPAGE"
vp: .res 2
c1p: .res 2
c3p: .res 2
bp: .res 2
fp: .res 2
.segment "CODE"
.a8
.i8
_fx_ground_native:
  php
  rep #$30
  lda _monosh_ground_offset
  and #$ff
  asl
  tax
  lda f:$7f0000+ground_scroll_offsets,x
  clc
  adc #ground_scroll_data
  sta _fx_ground_vptr
  lda f:$7f0000+ground_row_offsets,x
  clc
  adc #ground_rows
  sta $013c
  lda _fx_ground_far_xptr
  sta fp
  lda _fx_far_u_acc
  lsr
  lsr
  lsr
  lsr
  lsr
  lsr
  lsr
  and #$ff
  sta $0134
  lda _monosh_ground_offset
  and #$ff
  clc
  adc #109
  ldy #0
  cmp #128
  bcc far_tail
  pha
  lda #127
  jsr far_run
  pla
  sec
  sbc #127
far_tail:
  jsr far_run
  lda _fx_far_d_acc
  lsr
  lsr
  lsr
  lsr
  lsr
  lsr
  lsr
  and #$ff
  sta $0134
  lda #2
  jsr far_run
  sep #$20
  lda #0
  sta (fp),y
  rep #$20
  lda _fx_ground_c1ptr
  sta c1p
  lda _fx_ground_c3ptr
  sta c3p
  lda _fx_ground_bandptr
  sta bp
  stz $0120
  stz $0122
  stz $0124
  stz $0126
  stz $0128
  lda #$ffff
  sta $012a
  sta $012c
  lda _fx_ground_horizon
  sec
  sbc #7
  sta $0120
  sta $0138
  lda $0138
  sta $0128
  lda _fx_ground_light
  sta $012a
  lda _fx_ground_dark
  sta $012c
  ldy #0
  sep #$20
  lda (bp),y
  rep #$20
  and #$ff
  bne :+
  lda $012a
  ldx $012c
  sta $012c
  stx $012a
:
  lda $0128
  cmp #128
  bcc row
  lda #127
  sta $0128
  jsr emit_run
  lda $0138
  sec
  sbc #127
  sta $0128
row:
  ldx $013c
  lda f:$7f0000,x
  and #$00ff
  sta $0130
  inc $013c
palette:
  lda $0130
  asl
  tax
  lda _fx_ground_light,x
  sta $0134
  lda _fx_ground_dark,x
  sta $0136
  ldy $0130
  sep #$20
  lda (bp),y
  rep #$20
  and #$ff
  bne :+
  lda $0134
  ldx $0136
  sta $0136
  stx $0134
:
  lda $0128
  cmp #127
  beq flush
  lda $0134
  cmp $012a
  bne flush
  lda $0136
  cmp $012c
  beq extend
flush:
  lda $0128
  beq save_color
  jsr emit_run
  stz $0128
save_color:
  lda $0134
  sta $012a
  lda $0136
  sta $012c
extend:
  inc $0128
  inc $0120
  lda $0120
  cmp #205
  beq complete
  jmp row
complete:
  jsr emit_run
  ldy $0126
  sep #$20
  lda #0
  sta (c1p),y
  sta (c3p),y
  plp
  rts
emit_run:
  ldy $0126
  sep #$20
  lda $0128
  sta (c1p),y
  sta (c3p),y
  rep #$20
  iny
  lda $012a
  sta (c1p),y
  lda $012c
  sta (c3p),y
  iny
  iny
  sty $0126
  rts
far_run:
  sep #$20
  sta (fp),y
  rep #$20
  iny
  lda $0134
  sta (fp),y
  iny
  iny
  rts
ground_empty: .byte 0
ground_scroll_offsets: .incbin "assets/ground_scroll_offsets.bin"
ground_row_offsets: .incbin "assets/ground_row_offsets.bin"
ground_scroll_data: .incbin "assets/ground_scroll.bin"
ground_rows: .incbin "assets/ground_rows.bin"
