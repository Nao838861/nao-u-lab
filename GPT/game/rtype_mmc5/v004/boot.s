.include "build/sprite.inc"
.import _scroll_x,_ray_colors
.import _main
.importzp c_sp
.export _ready,_ink,_begin_list,_end_list,_readpad
.export __STARTUP__: absolute = 1
.segment "ZEROPAGE"
cursor: .res 2
previous: .res 2
drawpage: .res 1
window: .res 1
visible_colors: .res 1
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
 ; Initialize two 96-entry VBlank programs in cartridge RAM.
 lda #2
 sta $5102
 lda #1
 sta $5103
 lda #0
 sta $5113
 sta cursor
 lda #$60
 sta cursor+1
 ldx #2
@buffer:
 ldy #0
 lda #$60
 sta (cursor),y
 ldy #2
 lda #$8d
@template:
 sta (cursor),y
 pha
 tya
 clc
 adc #5
 tay
 bcc :+
 inc cursor+1
: pla
 cpy #((2+96*5) & $ff)
 bne @template
 ; 96 entries span 480 bytes. Initialize the other buffer from its own page.
 lda #$62
 sta cursor+1
 dex
 bne @buffer
 lda #$60
 sta drawpage
 jmp _main

; Each command is LDA #ink / STA absolute (6 cycles).
_begin_list:
 lda #0
 sta cursor
 sta previous
 lda drawpage
 sta previous+1
 eor #2
 sta drawpage
 sta cursor+1
 rts
_end_list:
 ldy #0
 lda #$60
 sta (cursor),y
 rts
.export _start_irq
_start_irq:
 lda #64
 sta $5203
 lda $5204
 lda #$80
 sta $5204
 cli
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
 lda #0
 sta $5130
 sta window
 lda #64
 sta $5203
 lda _ready
 beq @exit
 lda #2
 sta $5104
 lda drawpage
 cmp #$60
 beq @draw_a
 jsr $6000
 jsr stream_column
 jsr $6200
 jmp @done
@draw_a:
 jsr $6200
 jsr stream_column
 jsr $6000
@done:
 lda #1
 sta $5104
 lda #0
 sta $2003
 lda #2
 sta $4014
 ; Change weapon inks once on selection. Static field and wall palettes
 ; remain resident; ray extension, reflection and erasure use only ExRAM.
 lda _ray_colors
 cmp visible_colors
 beq @scroll
 sta visible_colors
 tax
 lda #$3f
 sta $2006
 lda #$05
 sta $2006
 lda upper_rim,x
 sta $2007
 lda lower_rim,x
 sta $2007
 lda #$3f
 sta $2006
 lda #$0a
 sta $2006
 lda panel_rim,x
 sta $2007
 lda #0
 sta $2006
 sta $2006
@scroll:
 jsr update_backdrop
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
 pha
 lda $5204
 bpl @return
 inc window
 lda window
 sta $5130
 asl
 asl
 asl
 asl
 asl
 asl
 clc
 adc #64
 sta $5203
@return:
 pla
 rti
upper_rim: .byte $0f,$02
lower_rim: .byte $16,$22
panel_rim: .byte $2c,$12
.segment "VECTORS"
.word nmi, reset, irq


.include "stage.inc"
.include "laser.inc"
