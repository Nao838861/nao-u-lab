.include "build/sprite.inc"
.import _scroll_x
.import _main
.importzp c_sp
.export _ready,_ink,_queue,_begin_list,_end_list,_readpad
.export __STARTUP__: absolute = 1
.segment "ZEROPAGE"
cursor: .res 2
_ready: .res 1
_ink: .res 1
pad: .res 1
.segment "STARTUP"
reset:
 sei
 cld
 ldx #$ff
 txs
 inx
 stx $2000
 stx $2001
 stx $4010
 stx $5100
 lda #$80
 sta $5117
 lda #$40
 sta $4017
 bit $2002
: bit $2002
 bpl :-
 txa
: sta $0000,x
 sta $0200,x
 sta $0300,x
 sta $0400,x
 sta $0500,x
 sta $0600,x
 sta $0700,x
 inx
 bne :-
: bit $2002
 bpl :-
 lda #8
 sta c_sp+1
 lda #0
 sta c_sp
 sta $5105
 sta $5130
 sta $5200
 sta $5204
 lda #1
 sta $5101
 lda #SPR_BANK
 sta $5123
 sta $5127
 sta $512b
 jmp _main

; Each command is LDA #ink / STA absolute (6 cycles).
_begin_list:
 lda #0
 sta cursor
 lda #3
 sta cursor+1
 rts
_queue:
 ldy #3
 sta (cursor),y
 iny
 txa
 sta (cursor),y
 ldy #0
 lda #$a9
 sta (cursor),y
 iny
 lda _ink
 sta (cursor),y
 iny
 lda #$8d
 sta (cursor),y
 lda cursor
 clc
 adc #5
 sta cursor
 bcc :+
 inc cursor+1
: rts
_end_list:
 ldy #0
 lda #$60
 sta (cursor),y
 rts
_readpad:
 lda #1
 sta $4016
 sta pad
 lsr
 sta $4016
: lda $4016
 lsr
 rol pad
 bcc :-
 lda pad
 rts
nmi:
 pha
 txa
 pha
 tya
 pha
 lda _ready
 beq @exit
 lda #2
 sta $5104
 jsr $0300
 lda #1
 sta $5104
 lda #0
 sta $2003
 lda #2
 sta $4014
 lda _scroll_x
 sta $2005
 lda #0
 sta $2005
 sta _ready
@exit:
 pla
 tay
 pla
 tax
 pla
irq:
 rti
.segment "VECTORS"
.word nmi, reset, irq


.include "laser.inc"
