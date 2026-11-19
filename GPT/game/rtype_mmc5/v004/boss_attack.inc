; The recording shows three identical streams following a fixed centerline.
; All gameplay clocks start after the camera has stopped in the room.
.export _boss_attack_tick,_draw_attack,_core_flash,_core_pose,_salvos,_boss_clock
.export _bubble_age,_bubble_x,_bubble_y
.import _enemy_live,_enemy_x,_enemy_y
.segment "ACTORRAM"
_boss_clock: .res 2
_core_pose: .res 1             ; 0 hidden, 1..6 visible head poses
_core_flash: .res 1
_salvos: .res 1
salvo_delay: .res 1
salvo_left: .res 1
bubble_frame: .res 1
_bubble_age = $7800 ; nine ages, zero is inactive
_bubble_x: .res 9
_bubble_y: .res 9
.segment "ZEROPAGE"
attack_ptr: .res 2
.segment "RODATA"
.include "build/boss-attack.inc"
; NES frames after the camera stops. The three muzzle openings are 138
; and 139 frames apart. Withdrawal reuses the emergence silhouettes.
cue_lo: .lobytes 1,52,69,85,105,119,130,137,184,194,258,267,275,322,332,397,406,414,461,471,507,523,540,556,572,616
cue_hi: .hibytes 1,52,69,85,105,119,130,137,184,194,258,267,275,322,332,397,406,414,461,471,507,523,540,556,572,616
cue_pose: .byte 0,1,2,3,4,5,6,6,5,4,5,6,6,5,4,5,6,6,5,4,3,2,1,0,0,0
.segment "ACTORRAM"
next_cue: .res 1
.segment "RODATA"
_boss_attack_tick:
 lda _boss_cleared
 beq @alive
 lda #0
 sta _core_pose
 sta bubble_frame
 ldx #8
@clear: sta _bubble_age,x
 dex
 bpl @clear
 rts
@alive:
 lda _boss_offset
 beq @settled
 rts
@settled:
 inc _boss_clock
 bne :+
 inc _boss_clock+1
: ldx next_cue
 lda _boss_clock
 cmp cue_lo,x
 bne @stream
 lda _boss_clock+1
 cmp cue_hi,x
 bne @stream
 lda cue_pose,x
 sta _core_pose
 ; The eye moves left as the head emerges from the abdominal slit.
 tay
 lda eye_x,y
 sta _enemy_x+6
 lda #113                     ; enemy center is y+8
 sta _enemy_y+6
 lda vulnerable,y
 sta _enemy_live+6
 cpx #7
 beq @fire
 cpx #12
 beq @fire
 cpx #17
 bne @advance
@fire:
 inc _salvos
 lda #1
 sta bubble_frame
 lda #9
 sta salvo_left
 lda #0
 sta salvo_delay
@advance:
 inc next_cue
 cpx #25
 bne @stream
 lda #0
 sta _boss_clock
 sta _boss_clock+1
 sta next_cue
@stream:
 lda salvo_left
 beq @flight
 lda salvo_delay
 beq @emit
 dec salvo_delay
 jmp @flight
@emit:
 dec salvo_left
 ldx salvo_left
 lda #1
 sta _bubble_age,x
 lda #4
 sta salvo_delay
@flight:
 lda bubble_frame
 beq :+
 inc bubble_frame
 cmp #BUBBLE_TICKS+1
 bcc :+
 lda #0
 sta bubble_frame
:
 ldx #8
@move:
 ldy _bubble_age,x
 beq @next
 dey
 lda flight_x,y
 sta _bubble_x,x
 lda flight_y,y
 sta _bubble_y,x
 inc _bubble_age,x
 cpy #80
 bcc @next
 lda #0
 sta _bubble_age,x
@next:
 dex
 bpl @move
 rts
eye_x: .byte 0,197,196,193,189,188,188
vulnerable: .byte 0,0,7,7,7,7,7

.segment "CODE"
_draw_attack:
 ldy _core_pose
 beq @nothing
 dey
 lda _core_flash
 beq :+
 tya
 clc
 adc #6
 tay
: lda #$be
 sta $5115
 lda $a000,y
 sta attack_ptr
 lda $a010,y
 sta attack_ptr+1
 ldx _oam_index
 txa
 clc
 adc $a020,y
 bcs @limited
 cmp #253
 bcs @limited
 sta _oam_index
 jsr @copy
 jmp main_bank
@copy: jmp (attack_ptr)
@limited: jsr main_bank
 jmp limited_head
@nothing: rts
.segment "RODATA"
limited_head:
 ldx _oam_index
 ldy _core_pose
 beq @end
 dey
 lda head_lo,y
 sta attack_ptr
 lda head_hi,y
 sta attack_ptr+1
 ldy #0
@head:
 cpx #248
 bcs @end
 lda (attack_ptr),y
 cmp #255
 beq @end
 clc
 adc #186
 sta $203,x
 iny
 lda (attack_ptr),y
 clc
 adc #113                     ; y=98+16, OAM stores scanline minus one
 sta $200,x
 iny
 lda (attack_ptr),y
 sta $201,x
 iny
 lda _core_flash
 beq :+
 lda #2
 bne @palette
: lda (attack_ptr),y
@palette:
 sta $202,x
 iny
 inx
 inx
 inx
 inx
 jmp @head
@end: stx _oam_index
 rts

.include "bubble_display.inc"
