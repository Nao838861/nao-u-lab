; Sparse ink writes and collision against the central 8x8 of each enemy.
; ZP arguments avoid cc65 argument-stack access for each individual cell.
.import _enemy_x,_enemy_y,_explosion,_hit_count
.exportzp _column,_row,_bank
.export _light,_erase_lights
.segment "ZEROPAGE"
_column: .res 1
_row: .res 1
_bank: .res 1
addr: .res 2
px0: .res 1
py0: .res 1
count: .res 1
mask: .res 1
xpos: .res 1
.segment "BSS"
lastlo: .res 36
lasthi: .res 36
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
 bcs @done
 ldy _row
 cpy #4
 bcc @done
 cpy #26
 bcs @done
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
 ora _column
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
 lda _bank
 asl
 asl
 asl
 clc
 adc #<coverage
 sta addr
 lda #>coverage
 adc #0
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

