; Wave front is the collision position. Reveal the trailing sections as
; the front leaves the R-9. Vertical flip supplies the lower half of the pulse.
.import _charge,_bolt_travel
.export _draw_cannon
.segment "ZEROPAGE"
cannon_slot: .res 1
cannon_part: .res 1
cannon_x: .res 1
cannon_y: .res 1
cannon_limit: .res 1
.segment "CODE"
cannon_tiles: .byte CANNON_3,CANNON_2,CANNON_1,CANNON_0
bolt_slots: .byte 0,3,6,9
_draw_cannon:
 ldx _oam_index
 lda _charge
 cmp #24
 bcc @shots
 lda _px
 clc
 adc #22
 sta $203,x
 lda _py
 sec
 sbc #5
 sta $200,x
 lda _charge
 cmp #64
 bcc @small
 lda _tick
 and #2
 beq @bright
 lda #CHARGE
 bne @glow
@bright: lda #SPARK
 bne @glow
@small: lda #FLARE
@glow:
 sta $201,x
 lda #0
 sta $202,x
 inx
 inx
 inx
 inx
@shots:
 ldy #3
@slot:
 sty cannon_slot
 lda bolt_slots,y
 tay
 lda _bolts+2,y
 cmp #4
 beq @large
 cmp #2
 bne @next
 lda #2
 bne @size
@large: lda #4
@size: sta cannon_limit
 lda _bolts+1,y
 sec
 sbc #8
 sta cannon_y
 lda _bolts,y
 sec
 sbc #7
 sta cannon_x
 ldy cannon_slot
 lda _bolt_travel,y
 cmp cannon_limit
 bcs :+
 sta cannon_limit
: lda #0
 sta cannon_part
@pair:
 cpx #244
 bcs @done
 ldy cannon_part
 lda cannon_tiles,y
 sta $201,x
 sta $205,x
 lda cannon_y
 sta $200,x
 clc
 adc #8
 sta $204,x
 lda cannon_x
 sta $203,x
 sta $207,x
 cpy #3
 lda #0
 bcc :+
 lda #3
: sta $202,x
 ora #128
 sta $206,x
 txa
 clc
 adc #8
 tax
 inc cannon_part
 lda cannon_part
 cmp cannon_limit
 beq @next
 lda cannon_x
 sec
 sbc #8
 sta cannon_x
 bcs @pair
@next: ldy cannon_slot
 dey
 jpl @slot
@done: stx _oam_index
 rts

; Pulse 2 is independent of both laser sounds and the explosion noise.
.export _cannon_hum,_cannon_report
_cannon_hum:
 lda #$85
 sta $4004
 lda #0
 sta $4005
 lda #220
 sec
 sbc _charge
 sta $4006
 lda #8
 sta $4007
 rts
_cannon_report:
 lda #$8a
 sta $4004
 lda #$a2
 sta $4005
 lda #68
 sta $4006
 lda #$18
 sta $4007
 rts
