; Stream the incoming column into the mirrored nametable while its alias at
; the left edge is clipped. The same descriptor serves every beam shape.
.export _stage_col,_prepare_column,_backdrop
.segment "ZEROPAGE"
_stage_col: .res 1
stage_ptr: .res 2
attribute_ptr: .res 2
pending_column: .res 1
_backdrop: .res 1
shown_backdrop: .res 1
.segment "RODATA"
stage_tiles: .incbin "build/stage_tiles.bin"
.segment "STAGEDATA"
stage_meta: .incbin "build/stage_meta.bin"
.segment "RODATA"
column_lo: .repeat STAGE_COLS,I
 .byte <(I*32)
.endrepeat
column_hi: .repeat STAGE_COLS,I
 .byte >(I*32)
.endrepeat
sky_color: .byte $0f,$01,$0c,$2d
red_lamp: .byte $0f,$06,$06,$16
blue_lamp: .byte $0f,$01,$0c,$2c
.segment "CODE"
_prepare_column:
 ldx _stage_col
 lda column_lo,x
 clc
 adc #<stage_tiles
 sta stage_ptr
 lda column_hi,x
 adc #>stage_tiles
 sta stage_ptr+1
 lda column_lo,x
 clc
 adc #<stage_meta
 sta attribute_ptr
 lda column_hi,x
 adc #>stage_meta
 sta attribute_ptr+1
 txa
 and #31
 tax
 stx pending_column
 inc pending_column
 .repeat 30,I
  ldy #I
  lda (stage_ptr),y
  sta $0400+I
  lda (attribute_ptr),y
  sta $6400+I*32,x
  cmp #$80
  lda #0
  bcc :+
  lda (attribute_ptr),y
  cmp #$c0
  lda #$c1
  bcc :+
  lda #$fe
: sta $0420+I
 .endrepeat
 rts

stream_column:
 ldx pending_column
 bne :+
 rts
: dex
 lda #$84
 sta $2000
 lda #$20
 sta $2006
 stx $2006
 .repeat 30,I
  lda $0400+I
  sta $2007
  lda $0420+I
  sta $5c00+I*32,x
 .endrepeat
 lda #0
 sta pending_column
 sta $2006
 sta $2006
 lda #$80
 sta $2000
@done: rts

update_backdrop:
 ldx _backdrop
 cpx shown_backdrop
 beq @done
 stx shown_backdrop
 lda #$3f
 sta $2006
 lda #0
 sta $2006
 lda sky_color,x
 sta $2007
 lda #$3f
 sta $2006
 lda #2
 sta $2006
 lda red_lamp,x
 sta $2007
 lda blue_lamp,x
 sta $2007
 lda #0
 sta $2006
 sta $2006
@done: rts
