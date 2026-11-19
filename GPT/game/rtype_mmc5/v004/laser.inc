; Sparse ink writes and collision against the central 8x8 of each enemy.
; ZP arguments avoid cc65 argument-stack access for each individual cell.
.import _x_bias,_scroll_x,_scroll_tile
.import _enemy_x,_enemy_y,_enemy_live,_beam_hit,_hit_count
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
target_x: .res 1
target_y: .res 1
cell_lo: .res 1
column_hits: .res 32
row_hits: .res 32
hits: .res 1
.segment "RODATA"
enemy_bit: .byte 1,2,4,8,16,32,64
enemy_for_bits: .byte 0,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,6,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0
.segment "CODE"
.export _prepare_hits
_prepare_hits:
 lda #0
 ldx #31
: sta column_hits,x
 sta row_hits,x
 dex
 bpl :-
 ldx #6
@mark:
 lda _enemy_live,x
 beq @next
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
 cmp _scroll_tile
 bne @row
 lda _scroll_x
 and #7
 bne @out
 lda worldcol
@row:
 ora rowlo,y
 sta cell_lo
 jsr gun_cell
 ldy _row
 lda attrlo,y
 sta addr
 lda attrhi,y
 sta addr+1
 ldy worldcol
 lda (addr),y
 bpl @lit
 lda _boss_active
 beq @out
 lda lamp_ink
 sta hit_bank
 ldx _row
 jmp @collide
@lit: ldx lamp_ink
 stx hit_bank
 txa
 ora #64
@emit:
 ldy #1
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
@collide: ldy worldcol
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
 lda _beam_hit,x
 bne @next
 lda _enemy_x,x
 sta target_x
 lda _enemy_y,x
 sta target_y
 jsr exact_hit
 bcc @next
 lda #1
 sta _beam_hit,x
 inc _hit_count
 lda #12
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
 sbc target_y
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
 sbc target_x
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


attrs = $6400
attrlo: .repeat 30,I
 .byte <(attrs+32*I)
.endrepeat
attrhi: .repeat 30,I
 .byte >(attrs+32*I)
.endrepeat
covlo: .repeat 64,I
 .byte <(coverage+8*I)
.endrepeat
covhi: .repeat 64,I
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
 lda (spriteptr),y
 beq @empty_tile
 iny
 cpx #248
 bcs @transparent
 sta $0201,x
 lda (spriteptr),y
 sta $0202,x
 lda sprite_y
 sta $0200,x
 lda sprite_x
 sta $0203,x
 inx
 inx
 inx
 inx
 bne @transparent
@empty_tile: iny
@transparent:
 iny
 lda sprite_x
 clc
 adc #8
 sta sprite_x
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
 cpx #232
 bcc :+
 rts
: lda _red,y
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
 lda #3
 sta $0202,x
 inx
 inx
 inx
 inx
@done: rts

.segment "RODATA"

; The two mounts at world X=804 share a column, with independent HP.
.segment "CODE"
.export gun_upper,gun_lower,gun_wlo,gun_whi,_gun_height
gun_upper: .incbin "build/turret-grid.bin"
gun_lower=gun_upper+200
gun_wlo=gun_lower+200
gun_whi=gun_wlo+15
_gun_height=gun_whi+15
.import _gun_live,_gun_dead,_gun_screen
gun_cell:
 cpy #10
 bcc @lookup
 cpy #20
 bcc @none
 cpy #23
 bcs @none
@lookup:
 lda _boss_active
 bne @none
 lda worldcol
 sec
 sbc _scroll_tile
 and #31
 clc
 adc _stage_tile
 tax
 cpy #14
 bcs @floor
 lda gun_upper,x
 jmp @found
@floor: lda gun_lower,x
@found: tax
 beq @none
 dex
 lda _gun_live,x
 beq @none
 lda _gun_dead,x
 bne @none
 lda _gun_screen,x
 sec
 sbc #8
 sta target_x
 lda _gun_height,x
 sec
 sbc #8
 sta target_y
 tya
 asl
 asl
 asl
 sta py0
 lda worldcol
 asl
 asl
 asl
 sec
 sbc _scroll_x
 sta px0
 lda lamp_ink
 sta hit_bank
 jsr exact_hit
 bcc @none
 lda #12
 sta _gun_dead,x
 inc _hit_count
@none: rts

.import _rays,_head_index,_launch_tile,_blue,_ceilrow,_floorrow
.export _reflect_shot
.segment "ZEROPAGE"
ray_slot: .res 1
next_x: .res 1
next_y: .res 1
ray_advance: .res 1
.segment "CODE"
_reflect_shot:
 lda _blue
 bne :+
 rts
: lda _scroll_tile
 sec
 sbc _launch_tile
 and #31
 sta _ray_min_col
 lda _blue+3
 and #3
 eor #3
 sta ray_advance
 ldx #0
@ray:
 stx ray_slot
 lda ray_advance
 bne :+
 jmp @draw
:
 txa
 clc
 adc _head_index
 tay
 lda _rays,x
 sta _rays+5,y
 lda _rays+1,x
 sta _rays+17,y
 lda _rays+3,x
 beq @flat
 cmp _rays+2,x
 bne :+
 lda #RAY_FIRST
 bne @shape
:
 lda #RAY_FIRST+1
 bne @shape
@flat: lda #RAY_FIRST+2
@shape: sta _rays+29,y
 lda _rays+4,x
 cmp #12
 bcs :+
 inc _rays+4,x
: lda _rays,x
 cmp #32
 bcs @draw_jump
 clc
 adc _rays+2,x
 sta next_x
 lda _rays+1,x
 clc
 adc _rays+3,x
 sta next_y
 lda _rays,x
 clc
 adc _launch_tile
 tay
 lda next_y
 cmp _ceilrow,y
 bcc @horizontal
 cmp _floorrow,y
 beq @across
 bcs @horizontal
@across:
 lda next_x
 cmp #32
 bcs @move
 clc
 adc _launch_tile
 tay
 lda next_y
 cmp _ceilrow,y
 bcc @vertical
 cmp _floorrow,y
 beq @move
 bcc @move
@vertical:
 lda #0
 sec
 sbc _rays+2,x
 sta _rays+2,x
 lda _rays,x
 sta next_x
 jmp @move
@draw_jump: jmp @draw
@horizontal:
 lda #0
 sec
 sbc _rays+3,x
 sta _rays+3,x
 lda _rays+1,x
 sta next_y
@move: lda next_x
 sta _rays,x
 lda next_y
 sta _rays+1,x
@draw:
 txa
 clc
 adc #<(_rays+5)
 sta _ray_data
 lda #>(_rays+5)
 adc #0
 sta _ray_data+1
 lda _rays+4,x
 sta _ray_length
 jsr _draw_ray
 lda ray_slot
 clc
 adc #41
 tax
 cpx #123
 beq :+
 jmp @ray
: lda ray_advance
 beq :+
 inc _head_index
 lda _head_index
 cmp #12
 bcc :+
 lda #0
 sta _head_index
: inc _blue+3
 lda _blue+3
 cmp #62
 bcc :+
 lda #0
 sta _blue
: rts
