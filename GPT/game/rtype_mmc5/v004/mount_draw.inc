; Choose a bore angle from the ship's position. Horizontal and vertical
; flips put the same mount on either side of the ship and on either wall.
.segment "ZEROPAGE"
mount_flags: .res 1
mount_dx: .res 1
mount_dy: .res 1
.segment "CODE"
_draw_guns:
 ldx _oam_index
 ldy gun_first
@mount:
 cpy gun_end
 bcc :+
 jmp @done
: lda _gun_live,y
 beq @next_jump
 lda _gun_dead,y
 cmp #1
 beq @next_jump
 cmp #2
 bcs @blast
 lda _gun_screen,y
 cmp #4
 bcc @next_jump
 cmp #253
 bcs @next_jump
 jmp @aim
@next_jump: jmp @next
@blast:
 cpx #248
 bcs @next_jump
 cmp #7
 lda #SPARK
 bcs :+
 lda #FLARE
: sta $201,x
 lda _gun_screen,y
 sec
 sbc #4
 sta $203,x
 lda _gun_height,y
 sec
 sbc #5
 sta $200,x
 lda #1
 sta $202,x
 inx
 inx
 inx
 inx
 jmp @next
@aim:
 sty gun_i
 lda #1
 sta mount_flags
 lda _gun_height,y
 cmp #100
 bcc :+
 lda #129
 sta mount_flags
: lda _px
 clc
 adc #10
 sec
 sbc _gun_screen,y
 bcc @left
 pha
 lda mount_flags
 ora #64
 sta mount_flags
 pla
 jmp @dx
@left: eor #255
 adc #1
@dx: sta mount_dx
 lda _py
 sec
 sbc _gun_height,y
 bcs :+
 eor #255
 adc #1
: sta mount_dy
 lsr
 cmp mount_dx
 lda #240
 bcs @shape
 lda mount_dx
 lsr
 cmp mount_dy
 lda #241
 bcc @shape
 lda #242
@shape:
 cpx #248
 bcs @done
 sta $201,x
 lda _gun_timer,y
 cmp #10
 bcs :+
 and #2
 beq :+
 inc mount_flags
: lda mount_flags
 sta $202,x
 lda _gun_screen,y
 sec
 sbc #4
 sta $203,x
 lda _gun_height,y
 sec
 sbc #5
 sta $200,x
 inx
 inx
 inx
 inx
@next: iny
 jmp @mount
@done: stx _oam_index
 rts
