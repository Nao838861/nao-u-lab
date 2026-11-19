; Sparse wave cells are grouped by scanline tile row. In the stationary
; boss room they only need the tail/body shadow and the one exposed target.
.export _boss_wave_row,_boss_wave_cell
.exportzp _boss_wave_cols
.segment "ZEROPAGE"
_boss_wave_cols: .res 7
fast_row_ptr: .res 2
fast_wave_ptr: .res 2
fast_y: .res 1
fast_page: .res 1
fast_row_hit: .res 1
.segment "CODE"
fast_row_low: .repeat 30,I
 .byte <(32*I)
.endrepeat
fast_row_high: .repeat 30,I
 .byte >($6400+32*I)
.endrepeat
fast_boss_wave:
 ldx #6
@col:
 txa
 clc
 adc _wave_x
 cmp #32
 bcs @clipped
 clc
 adc _x_bias
 and #31
 cmp _scroll_tile
 bne @valid
 ldy _scroll_x
 tya
 and #7
 bne @clipped
 lda _scroll_tile
 jmp @valid
@clipped: lda #255
@valid: sta _boss_wave_cols,x
 dex
 bpl @col
 lda #$b0                   ; bank 48 has the 32 program pointers
 sta $5115
 ldy _wave_phase
 lda $a020,y
 sta fast_wave_ptr
 lda $a040,y
 sta fast_wave_ptr+1
 lda $a000,y
 sta fast_page
 sta $5115
 jsr @call
 jmp main_bank
@call: jmp (fast_wave_ptr)

_boss_wave_row:
 clc
 adc _wave_y
fast_absolute_row:
 cmp #2
 bcc @off
 cmp #28
 bcs @off
 tax
 stx fast_y
 lda fast_row_low,x
 sta fast_row_ptr
 lda fast_row_high,x
 sta fast_row_ptr+1
 lda row_hits,x
 sta fast_row_hit
 sec
 rts
@off: clc
 rts

_boss_wave_cell:
 sta lamp_ink
 lda (fast_row_ptr),y
 bmi @hits
 lda count
 cmp #96
 bcs @done
 sty worldcol
 tya
 ora fast_row_ptr
 ldy #3
 sta (cursor),y
 iny
 lda fast_row_ptr+1
 sec
 sbc #8
 sta (cursor),y
 ldy #1
 lda lamp_ink
 ora #64
 sta (cursor),y
 clc
 lda cursor
 adc #5
 sta cursor
 bcc :+
 inc cursor+1
: inc count
 ldy worldcol
@hits:
 lda fast_row_hit
 beq @done
 and column_hits,y
 beq @done
 sty worldcol
 lda lamp_ink
 sta hit_bank
 ldx fast_y
 jsr main_bank
 jsr light_collide
 lda fast_page
 sta $5115
@done: rts

; Reflected segments already contain absolute rows. Reuse the horizontal
; segment's row pointer and the same occupancy/weak-point test as the wave.
fast_ray:
 lda _ray_data
 sta spriteptr
 lda _ray_data+1
 sta spriteptr+1
 lda #255
 sta fast_y
 lda #$9d
 sta fast_page
 ldy #0
@step:
 sty ray_i
 lda (spriteptr),y
 cmp _ray_min_col
 bcc @skip
 cmp #32
 bcs @skip
 clc
 adc _x_bias
 and #31
 sta worldcol
 cmp _scroll_tile
 bne :+
 lda _scroll_x
 and #7
 bne @skip
: tya
 clc
 adc #12
 tay
 lda (spriteptr),y
 cmp fast_y
 beq @shape
 jsr fast_absolute_row
 bcc @skip
@shape:
 lda ray_i
 clc
 adc #24
 tay
 lda (spriteptr),y
 ldy worldcol
 jsr _boss_wave_cell
@skip:
 ldy ray_i
 iny
 cpy _ray_length
 bcc @step
 rts
