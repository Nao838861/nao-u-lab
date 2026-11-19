; Sparse ink writes and collision against the central 8x8 of each enemy.
; ZP arguments avoid cc65 argument-stack access for each individual cell.
.import _scroll_tile,_scroll_x
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
.segment "BSS"
.segment "ZEROPAGE"
lastbase: .res 72
.segment "BSS"
lastlo: .res 72
lasthi: .res 72
.segment "RODATA"
rowlo: .repeat 30,I
 .byte <($5c00+I*32)
.endrepeat
rowhi: .repeat 30,I
 .byte >($5c00+I*32)
.endrepeat
.segment "CODE"
_erase_lights:
 lda #0
 sta _ink
@loop:
 ldy count
 beq @done
 dey
 sty count
 lda lastbase,y
 sta _ink
 lda lastlo,y
 ldx lasthi,y
 jsr _queue
 jmp @loop
@done: rts
_light:
 lda _bank
 bne :+
 rts
:
 ldx _column
 cpx #32
 bcc :+
 rts
:
 ldy _row
 cpy #2
 bcs :+
 rts
:
 cpy #28
 bcc :+
 rts
:
 lda count
 cmp #72
 bcc :+
 rts
: txa
 clc
 adc _scroll_tile
 and #31
 sta worldcol
 lda attrlo,y
 sta addr
 lda attrhi,y
 sta addr+1
 ldy worldcol
 lda (addr),y
 bpl :+
 rts
: ldy count
 sta lastbase,y
 ldy _row
 txa
 asl
 asl
 asl
 sta px0
 tya
 asl
 asl
 asl
 sta py0
 lda rowlo,y
 ora worldcol
 ldx count
 sta lastlo,x
 lda rowhi,y
 sta lasthi,x
 inc count
 ldy count
 dey
 ldx lasthi,y
 lda lastlo,y
 jsr _queue
 ldx #2
@enemy:
 lda _explosion,x
 bne @next
 ; Signed difference must be in [-3,10], using non-wrapping subtract.
 lda px0
 sec
 sbc _enemy_x,x
 bcs @right
 cmp #253
 bcc @next
 bcs @vertical
@right: cmp #11
 bcs @next
@vertical:
 lda py0
 sec
 sbc _enemy_y,x
 bcs @below
 cmp #253
 bcc @next
 bcs @hit
@below: cmp #11
 bcs @next
@hit:
 ; Test pixels of the beam that intersect the enemy's inner hull.
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
@next: dex
 bpl @enemy
@done: rts

exact_hit:
 ldy _bank
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


attrs: .incbin "build/attrs.bin"
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
wlo: .repeat 32,I
 .byte <(wave_data+49*I)
.endrepeat
whi: .repeat 32,I
 .byte >(wave_data+49*I)
.endrepeat
.segment "CODE"
_draw_wave:
 ldx _wave_phase
 lda wlo,x
 sta waveptr
 lda whi,x
 sta waveptr+1
 lda _wave_y
 sta _row
 lda #0
 sta wi
@line:
 lda _wave_x
 sta _column
@cell:
 ldy wi
 lda (waveptr),y
 beq @skip
 sta _ink
 and #$3f
 sta _bank
 jsr _light
@skip:
 inc wi
 inc _column
 lda _column
 sec
 sbc _wave_x
 cmp #7
 bne @cell
 inc _row
 lda wi
 cmp #49
 bne @line
 rts

.segment "ZEROPAGE"
spriteptr: .res 2
sprite_x: .res 1
sprite_y: .res 1
sprites_wide: .res 1
sprite_i: .res 1
ray_i: .res 1
.segment "CODE"
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
 sta _bank
 ora #$80
 sta _ink
 jsr _light
 ldy ray_i
 iny
 cpy _ray_length
 bcc @cell
 rts
