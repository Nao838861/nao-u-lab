.setcpu "6502"
.macpack longbranch
.include "config.inc"
.export phase,updates,nmi_count,stage,missed,render_fields,displayed_phase,front
.segment "HEADER"
.byte "NES",$1a,2,1,1,0
.res 8,0
.segment "ZEROPAGE"
phase:.res 1
displayed_phase:.res 1
updates:.res 2
nmi_count:.res 2
stage:.res 1
missed:.res 2
render_fields:.res 1
front:.res 1
seen:.res 1
started:.res 1
target:.res 1
src:.res 2
dst:.res 2
left:.res 2
.ifdef INTERACTIVE
.export profile,switches,displayed_profile
profile:.res 1
displayed_profile:.res 1
switches:.res 2
button_previous:.res 1
button_current:.res 1
hud_pending:.res 1
.endif
.segment "CODE"
reset:
  sei
  cld
  ldx #$ff
  txs
  inx
  stx $2000
  stx $2001
  stx $4010
  lda #$40
  sta $4017
  lda #0
  sta $4015
  txa
clear:
  sta $00,x
  inx
  bne clear
  bit $2002
v1:bit $2002
  bpl v1
v2:bit $2002
  bpl v2
  lda $5ff2
  cmp #2
  jne fail
  lda #$a5
  sta $5ff0
  ldx #0
delay:dex
  bne delay
  lda #4
  sta $5fe1
  lda #<payload
  sta src
  lda #>payload
  sta src+1
  lda #$00
  sta dst
  lda #$60
  sta dst+1
  lda #<$2000
  sta left
  lda #>$2000
  sta left+1
upload:
  ldy #0
  lda (src),y
  sta (dst),y
  inc src
  bne :+
  inc src+1
: inc dst
  bne :+
  inc dst+1
: lda left
  bne :+
  dec left+1
: dec left
  lda left
  ora left+1
  bne upload
  lda #$70
  sta $5034
  lda #0
  sta $5039
  lda #$80
  sta $5037
  lda #$18
  sta $503a
  bit $2002
  lda #$3f
  sta $2006
  lda #0
  sta $2006
  lda #$0f
  sta $2007
  lda #$30
  sta $2007
  lda #$2c
  sta $2007
  lda #$14
  sta $2007
  lda #0
  sta $2005
  sta $2005
  lda #MODE
  sta $5fe0
.ifdef INTERACTIVE
  jsr load_profile
  lda #$3f
  sta $2006
  lda #$11
  sta $2006
  lda #$30
  sta $2007
  lda #0
  sta $2005
  sta $2005
  lda #$88
  sta $2000
  lda #$1e
  sta $2001
.else
  lda #$80
  sta $2000
  lda #$0a
  sta $2001
.endif
  jsr wait_nmi
.ifdef INTERACTIVE
  jsr prepare_hud
.endif
  lda nmi_count
  sta target
frame:
.ifdef INTERACTIVE
  jsr read_a
.endif
  lda #1
  sta stage
  lda front
  eor #1
  asl
  asl
  asl
  asl
  sta $5038
  lda #0
  sta $6102
  lda front
  eor #1
  asl
  asl
  asl
  asl
  asl
  asl
  sta $6103
.if KIND
  ldx phase
  lda matrix_low,x
  sta src
  lda matrix_high,x
  sta src+1
  ldy #0
matrix:
  lda (src),y
  sta $6080,y
  iny
  cpy #12
  bne matrix
  ldx phase
  lda face_low,x
  sta src
  lda face_high,x
  sta src+1
  ldy #0
faces:
  lda (src),y
  sta $6140,y
  iny
  cpy #54
  bne faces
.else
  lda #<WIDTH
  sta $5010
  lda #>WIDTH
  sta $5011
  lda #<HEIGHT
  sta $5012
  lda #>HEIGHT
  sta $5013
.endif
  lda nmi_count
  sta started
  lda #<$9c00
  sta $501e
  lda #>$9c00
  sta $501f
poll:
  lda $5030
  and #$20
  bne poll
  lda $5030
  lda nmi_count
  sec
  sbc started
  sta render_fields
  lda #2
  sta stage
.if KIND
  clc
  lda target
  adc #2
  sta target
  jsr wait_nmi
wait_target:
  lda nmi_count
  sec
  sbc target
  beq present
  bpl late
  jsr wait_nmi
  jmp wait_target
late:
  inc missed
  bne :+
  inc missed+1
: lda nmi_count
  sta target
.else
  jsr wait_nmi
.endif
present:
.ifdef INTERACTIVE
  lda profile
  sta displayed_profile
  lda #$1e
  sta $2001
.endif
  lda front
  eor #1
  sta front
  sta $5fe2
  lda phase
  sta displayed_phase
  inc updates
  bne :+
  inc updates+1
: inc phase
  lda phase
  and #63
  sta phase
.if KIND
  jmp frame
.else
  lda #3
  sta stage
idle:jmp idle
.endif
wait_nmi:
  lda nmi_count
  sta seen
wait:
  lda nmi_count
  cmp seen
  beq wait
  rts
fail:
  lda #$e1
  sta stage
failed:jmp failed
nmi:
  inc nmi_count
  bne :+
  inc nmi_count+1
: rti
irq:rti
.ifdef INTERACTIVE
read_a:
  lda #1
  sta $4016
  lda #0
  sta $4016
  lda $4016
  and #1
  sta button_current
  beq released
  lda button_previous
  bne released
  inc profile
  lda profile
  cmp #PROFILE_COUNT
  bcc :+
  lda #0
  sta profile
: inc switches
  bne :+
  inc switches+1
: jsr load_profile
  ; A profile upload is a transition; begin the new steady schedule on fresh NMI.
  jsr wait_nmi
  jsr prepare_hud
  lda nmi_count
  sta target
released:
  lda button_current
  sta button_previous
  rts
prepare_hud:
  ; DMA belongs to the profile transition, before starting its 2-field schedule.
  ; Keep the new text hidden until the matching framebuffer is presented.
  lda hud_pending
  beq :+
  lda #$0a
  sta $2001
  lda #0
  sta $2003
  sta hud_pending
  lda #2
  sta $4014
: rts
load_profile:
  ldx profile
  lda profile_low,x
  sta src
  lda profile_high,x
  sta src+1
  ldy #0
model_copy:
  lda (src),y
  sta $6000,y
  iny
  cpy #48
  bne model_copy
  lda (src),y
  sta $6100
  sta left
  iny
  lda (src),y
  sta $6101
  sta left+1
  .repeat 3
    asl left
    rol left+1
  .endrepeat
  clc
  lda src
  adc #50
  sta src
  bcc :+
  inc src+1
: lda #<$6200
  sta dst
  lda #>$6200
  sta dst+1
profile_copy:
  ldy #0
  lda (src),y
  sta (dst),y
  inc src
  bne :+
  inc src+1
: inc dst
  bne :+
  inc dst+1
: lda left
  bne :+
  dec left+1
: dec left
  lda left
  ora left+1
  bne profile_copy
  lda #$ff
  ldy #0
hide_oam:
  sta $0200,y
  iny
  bne hide_oam
  ldx profile
  lda hud_low,x
  sta src
  lda hud_high,x
  sta src+1
  ldy #0
hud_copy:
  lda (src),y
  sta $0200,y
  iny
  cpy #32
  bne hud_copy
  lda #1
  sta hud_pending
  rts
.endif
.segment "RODATA"
.include "tables.inc"
payload:.incbin "payload.bin"
.segment "VECTORS"
.addr nmi,reset,irq
.segment "CHR"
.ifdef INTERACTIVE
.incbin "hud.chr"
.else
.res $2000,0
.endif
