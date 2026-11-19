; Sparse ink writes and collision against the central 8x8 of each enemy.
; ZP arguments avoid cc65 argument-stack access for each individual cell.
.import _x_bias,_scroll_x
.import _enemy_x,_enemy_y,_explosion,_hit_count
.exportzp _column,_row,_bank
.export _light,_erase_lights
.segment "ZEROPAGE"
_column: .res 1
_row: .res 1
_bank: .res 1
worldcol: .res 1
addr: .res 2
px0: .res 1
py0: .res 1
count: .res 1
mask: .res 1
xpos: .res 1
lamp_ink: .res 1
hit_bank: .res 1
ray_offset: .res 1
cell_lo: .res 1
column_hits: .res 32
row_hits: .res 32
hits: .res 1
.segment "RODATA"
enemy_bit: .byte 1,2,4
enemy_for_bits: .byte 0,0,1,0,2,0,1,0
.segment "CODE"
.export _prepare_hits
_prepare_hits:
 lda #0
 ldx #31
: sta column_hits,x
 sta row_hits,x
 dex
 bpl :-
 ldx #2
@mark:
 lda _explosion,x
 bne @next
 lda _enemy_x,x
 clc
 adc #4
 clc
 adc _scroll_x
 pha
 lsr
 lsr
 lsr
 tay
 lda column_hits,y
 ora enemy_bit,x
 sta column_hits,y
 pla
 clc
 adc #7
 lsr
 lsr
 lsr
 tay
 lda column_hits,y
 ora enemy_bit,x
 sta column_hits,y
 lda _enemy_y,x
 clc
 adc #4
 pha
 lsr
 lsr
 lsr
 tay
 lda row_hits,y
 ora enemy_bit,x
 sta row_hits,y
 pla
 clc
 adc #7
 lsr
 lsr
 lsr
 tay
 lda row_hits,y
 ora enemy_bit,x
 sta row_hits,y
@next: dex
 bpl @mark
 rts
.segment "RODATA"
rowlo: .repeat 30,I
 .byte <($5c00+I*32)
.endrepeat
rowhi: .repeat 30,I
 .byte >($5c00+I*32)
.endrepeat
.segment "CODE"

_erase_lights:
 ; Enter a straight-line block at the suffix that matches the previous count.
 ldx count
 lda #0
 sta count
 ldy previous+1
 cpy #$60
 beq @a
 lda clear_b_lo,x
 sta addr
 lda clear_b_hi,x
 bne @jump
@a: lda clear_a_lo,x
 sta addr
 lda clear_a_hi,x
@jump: sta addr+1
 lda #0
 jmp (addr)
.repeat 96,I
 sta $6001+(95-I)*5
.endrepeat
clear_a_end: rts
.repeat 96,I
 sta $6201+(95-I)*5
.endrepeat
clear_b_end: rts
.segment "RODATA"
clear_a_lo: .repeat 97,I
 .byte <(clear_a_end-I*3)
.endrepeat
clear_a_hi: .repeat 97,I
 .byte >(clear_a_end-I*3)
.endrepeat
clear_b_lo: .repeat 97,I
 .byte <(clear_b_end-I*3)
.endrepeat
clear_b_hi: .repeat 97,I
 .byte >(clear_b_end-I*3)
.endrepeat
.segment "CODE"
_light:
 ldx _column
 cpx #32
 bcs @out
 ldy _row
 cpy #2
 bcc @out
 cpy #28
 bcs @out
 lda count
 cmp #96
 bcc :+
@out: rts
: txa
 clc
 adc _x_bias
 and #31
 sta worldcol
 ora rowlo,y
 sta cell_lo
 lda attrlo,y
 sta addr
 lda attrhi,y
 sta addr+1
 ldy worldcol
 lda (addr),y
 bmi @out
 ldx lamp_ink
 cpx #RAY_FIRST
 bcc @wave
 ; The cell's base palette and ray style are baked from its uncovered pixels.
 stx hit_bank
 ldx _row
 lda ray_palette_lo,x
 sta addr
 lda ray_palette_hi,x
 clc
 adc ray_offset
 sta addr+1
 lda (addr),y
 ora lamp_ink
 jmp @emit
@wave:
 cmp #0
 beq @neutral
 lda lamp_ink
 tax
 ora #64
 sta hit_bank
 txa
 jmp @emit
@neutral:
 lda _ink
 and #63
 sta hit_bank
 lda _ink
@emit:
 ldy #1
 sta (cursor),y
 dey
 lda #$a9
 sta (cursor),y
 ldy #3
 lda cell_lo
 sta (cursor),y
 ldx _row
 lda rowhi,x
 iny
 sta (cursor),y
 lda cursor
 clc
 adc #5
 sta cursor
 bcc :+
 inc cursor+1
: inc count
 ldy worldcol
 lda column_hits,y
 and row_hits,x
 bne :+
 rts
: sta hits
 tya
 asl
 asl
 asl
 sec
 sbc _scroll_x
 sta px0
 txa
 asl
 asl
 asl
 sta py0
@enemy:
 ldy hits
 ldx enemy_for_bits,y
 lda _explosion,x
 bne @next
 jsr exact_hit
 bcc @next
 lda #12
 sta _explosion,x
 inc _hit_count
 sta $400c
 lda #7
 sta $400e
 lda #8
 sta $400f
@next: lda hits
 eor enemy_bit,x
 sta hits
 bne @enemy
 rts

exact_hit:
 ldy hit_bank
 lda covlo,y
 sta addr
 lda covhi,y
 sta addr+1
 ldy #0
@scan:
 tya
 clc
 adc py0
 sec
 sbc _enemy_y,x
 cmp #4
 bcc @skip
 cmp #12
 bcs @skip
 lda (addr),y
 beq @skip
 sta mask
 lda #0
 sta xpos
@pixel:
 lsr mask
 bcc @advance
 lda xpos
 clc
 adc px0
 sec
 sbc _enemy_x,x
 cmp #4
 bcc @advance
 cmp #12
 bcc @yes
@advance:
 inc xpos
 lda mask
 bne @pixel
@skip: iny
 cpy #8
 bne @scan
 clc
 rts
@yes: sec
 rts
.segment "ZEROPAGE"
.segment "RODATA"
coverage: .incbin "build/coverage.bin"


attrs: .incbin "build/kinds.bin"
attrlo: .repeat 30,I
 .byte <(attrs+32*I)
.endrepeat
attrhi: .repeat 30,I
 .byte >(attrs+32*I)
.endrepeat
covlo: .repeat 128,I
 .byte <(coverage+8*I)
.endrepeat
covhi: .repeat 128,I
 .byte >(coverage+8*I)
.endrepeat
wave_data: .incbin "build/waves.bin"
.segment "BSS"
.export _wave_x,_wave_y,_wave_phase,_draw_wave
_wave_x: .res 1
_wave_y: .res 1
_wave_phase: .res 1
.segment "ZEROPAGE"
waveptr: .res 2
wi: .res 1
.segment "RODATA"
.include "build/waveptr.inc"
.segment "CODE"
_draw_wave:
 ldx _wave_phase
 lda wlo,x
 sta waveptr
 lda whi,x
 sta waveptr+1
 ldy #0
@cell:
 lda (waveptr),y
 bmi @done
 clc
 adc _wave_x
 sta _column
 iny
 lda (waveptr),y
 clc
 adc _wave_y
 sta _row
 iny
 lda (waveptr),y
 sta _ink
 iny
 lda (waveptr),y
 sta lamp_ink
 iny
 sty wi
 jsr _light
 ldy wi
 jmp @cell
@done: rts
.segment "ZEROPAGE"
spriteptr: .res 2
sprite_x: .res 1
sprite_y: .res 1
sprites_wide: .res 1
sprite_i: .res 1
ray_i: .res 1
.segment "CODE"
.import _ray_min_col
.import _mx,_my,_mw,_mh,_tile_list,_oam_index,_ray_data,_ray_length
.export _draw_meta,_draw_ray
.segment "CODE"
_draw_meta:
 lda _tile_list
 sta spriteptr
 lda _tile_list+1
 sta spriteptr+1
 lda _my
 sec
 sbc #1
 sta sprite_y
 ldx _oam_index
 ldy #0
@line:
 lda _mx
 sta sprite_x
 lda _mw
 sta sprites_wide
@cell:
 lda sprite_y
 sta $0200,x
 lda (spriteptr),y
 iny
 sta $0201,x
 lda (spriteptr),y
 iny
 sta $0202,x
 lda sprite_x
 sta $0203,x
 clc
 adc #8
 sta sprite_x
 inx
 inx
 inx
 inx
 dec sprites_wide
 beq @rowend
 bcc @cell
 ; The right side was clipped. Skip the remaining tile/palette pairs.
 tya
 clc
 adc sprites_wide
 adc sprites_wide
 tay
@rowend:
 lda sprite_y
 clc
 adc #8
 sta sprite_y
 dec _mh
 bne @line
 stx _oam_index
 rts
_draw_ray:
 lda _ray_data
 sta spriteptr
 lda _ray_data+1
 sta spriteptr+1
 ldy #0
@cell:
 sty ray_i
 lda (spriteptr),y
 cmp _ray_min_col
 bcc @skip
 sta _column
 tya
 clc
 adc #12
 tay
 lda (spriteptr),y
 sta _row
 tya
 clc
 adc #12
 tay
 lda (spriteptr),y
 sta lamp_ink
 sec
 sbc #RAY_FIRST
 asl
 asl
 sta ray_offset
 jsr _light
@skip: ldy ray_i
 iny
 cpy _ray_length
 bcc @cell
 rts

.segment "CODE"
.import _red
.export _launch_effects
_launch_effects:
 ldx _oam_index
 ldy #0
 jsr effects_one
 ldy #4
 jsr effects_one
 stx _oam_index
 rts
effects_one:
 lda _red,y
 bne :+
 rts
:
 lda _red+2,y
 asl
 asl
 asl
 sta py0
 lda _red+1,y
 asl
 asl
 asl
 sta px0
 lda _red+3,y
 asl
 clc
 adc px0
 bcs :+
 cmp #248
 bcc :++
: jmp @bolt
:
 sta sprite_x
 ; Four OAM records; offsets match the original flare / streak metasprite.
 .repeat 4,I
 lda py0
 clc
 .if (I & 1)
 adc #7
 .else
 adc #241
 .endif
 sta $0200,x
 .if I<2
 lda #FLARE
 .else
 lda #STREAK
 .endif
 sta $0201,x
 .if I<2
 lda #1
 .else
 lda #2
 .endif
 sta $0202,x
 lda sprite_x
 .if I>=2
 clc
 adc #5
 .endif
 sta $0203,x
 inx
 inx
 inx
 inx
 .endrepeat
@bolt:
 lda _red+3,y
 cmp #49
 bcs @done
 asl
 asl
 clc
 adc _red+3,y
 adc #12
 bcs @done
 adc px0
 bcs @done
 cmp #249
 bcs @done
 sta $0203,x
 lda py0
 sec
 sbc #4
 sta $0200,x
 lda #BOLT
 sta $0201,x
 lda #0
 sta $0202,x
 inx
 inx
 inx
 inx
@done: rts

.segment "RODATA"
ray_palette:
 .incbin "build/raypal0.bin"
 .res 64
 .incbin "build/raypal1.bin"
 .res 64
 .incbin "build/raypal2.bin"
ray_palette_lo: .repeat 30,I
 .byte <(ray_palette+I*32)
.endrepeat
ray_palette_hi: .repeat 30,I
 .byte >(ray_palette+I*32)
.endrepeat
