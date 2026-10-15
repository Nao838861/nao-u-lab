; Original physics is read-only. All bridge scratch is CPU RAM $0340..$0368.
; Original positions $41/$44: signed16.8 pixels. Heading $48: turn/65536.
; Caller owns $0300..$030b until this function returns. GSU must be idle.
; Output $6008..$601d: the existing eleven-word GSU pose request.
; Carry set + state_error=1 rejects positions outside signed Q9.7 range.
num=$0340
negative=$0343
remainder=$0344
index=$0345
world_x=$0347
world_z=$0349
mcand=$0350
multiplier=$0354
product=$0356
mul_negative=$035a
back=$035b

capture_mmc5_state:
  ldx #5
: lda $41,x
  sta original_state,x
  dex
  bpl :-
  lda $48
  sta original_state+6
  sta original_state+8
  lda $49
  sta original_state+7
  sta original_state+9
  rts

render_from_mmc5_state:
  ldx #11
: lda original_state,x
  sta snapshot,x
  dex
  bpl :-
  lda #0
  sta state_error
  ldx #0
  jsr convert_position
  jcs invalid_state
  lda num
  sta world_x
  lda num+1
  sta world_x+1
  ldx #3
  jsr convert_position
  jcs invalid_state
  lda num
  sta world_z
  lda num+1
  sta world_z+1
  ; Camera and body yaw are independent, including through 0xffff -> 0.
  ldx #8
  ldy #$0e
  jsr convert_direction
  ldx #6
  ldy #$1a
  jsr convert_direction
  lda view
  asl a
  asl a
  asl a
  tax
  lda cameras,x
  sta back
  lda cameras+1,x
  sta back+1
  lda cameras+2,x
  sta $600c
  lda cameras+3,x
  sta $600d
  lda cameras+4,x
  sta $6012
  lda cameras+5,x
  sta $6013
  lda cameras+6,x
  sta $6014
  lda cameras+7,x
  sta $6015
  ldx #$10
  jsr camera_offset
  sec
  lda world_x
  sbc product+1
  sta $6008
  lda world_x+1
  sbc product+2
  sta $6009
  ldx #$0e
  jsr camera_offset
  sec
  lda world_z
  sbc product+1
  sta $600a
  lda world_z+1
  sbc product+2
  sta $600b
  lda world_x
  sta $6016
  lda world_x+1
  sta $6017
  lda world_z
  sta $6018
  lda world_z+1
  sta $6019
  clc
  rts
invalid_state:
  lda #1
  sta state_error
  sec
  rts

; render Q7 = trunc((source Q8 - 320*256)/10). Exact 24-bit division.
convert_position:
  lda snapshot,x
  sta num
  sec
  lda snapshot+1,x
  sbc #$40
  sta num+1
  lda snapshot+2,x
  sbc #1
  sta num+2
  sta negative
  bpl :+
  jsr negate_num
: lda #0
  sta remainder
  ldx #24
divide10:
  asl num
  rol num+1
  rol num+2
  rol remainder
  lda remainder
  cmp #10
  bcc :+
  sbc #10
  sta remainder
  inc num
: dex
  bne divide10
  lda num+2
  bne invalid_position
  lda num+1
  cmp #$80
  bcc position_ready
  bne invalid_position
  lda num
  bne invalid_position
  lda negative
  bpl invalid_position
position_ready:
  lda negative
  bpl :+
  jsr negate_num
: clc
  rts
invalid_position:
  sec
  rts
negate_num:
  sec
  lda #0
  sbc num
  sta num
  lda #0
  sbc num+1
  sta num+1
  lda #0
  sbc num+2
  sta num+2
  rts

; Nearest of 1024 headings, signed Q8 coefficients, zero = original north.
convert_direction:
  sty dst
  clc
  lda snapshot,x
  adc #32
  sta index
  lda snapshot+1,x
  adc #0
  sta index+1
  ldx #6
: lsr index+1
  ror index
  dex
  bne :-
  asl index
  rol index+1
  asl index
  rol index+1
  clc
  lda index
  adc #<directions
  sta src
  lda index+1
  adc #>directions
  sta src+1
  ldx dst
  ldy #0
: lda (src),y
  sta $6000,x
  inx
  iny
  cpy #4
  bne :-
  rts

; floor(back Q7 * signed direction Q8 / 256), using a full signed product.
camera_offset:
  lda $6000,x
  sta multiplier
  lda $6001,x
  sta multiplier+1
  sta mul_negative
  bpl :+
  sec
  lda #0
  sbc multiplier
  sta multiplier
  lda #0
  sbc multiplier+1
  sta multiplier+1
: lda back
  sta mcand
  lda back+1
  sta mcand+1
  lda #0
  sta mcand+2
  sta mcand+3
  ldx #3
: sta product,x
  dex
  bpl :-
  ; Signed Q8 sine/cosine magnitude is at most 256 (nine bits).
  ldx #9
multiply_loop:
  lsr multiplier+1
  ror multiplier
  bcc :+
  clc
  lda product
  adc mcand
  sta product
  lda product+1
  adc mcand+1
  sta product+1
  lda product+2
  adc mcand+2
  sta product+2
  lda product+3
  adc mcand+3
  sta product+3
: asl mcand
  rol mcand+1
  rol mcand+2
  rol mcand+3
  dex
  bne multiply_loop
  lda mul_negative
  bpl :+
  sec
  lda #0
  sbc product
  sta product
  lda #0
  sbc product+1
  sta product+1
  lda #0
  sbc product+2
  sta product+2
  lda #0
  sbc product+3
  sta product+3
: rts
