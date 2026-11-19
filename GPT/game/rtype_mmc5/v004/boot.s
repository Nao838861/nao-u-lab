.include "build/sprite.inc"
.import _scroll_x,_sprite_page
.import _main
.importzp c_sp
.export _ready,_ink,_begin_list,_end_list,_readpad
.export __STARTUP__: absolute = 1
.segment "ZEROPAGE"
cursor: .res 2
previous: .res 2
drawpage: .res 1
terminators: .res 4
window: .res 1
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
 lda #$9f
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
 lda #2
 sta $5101
 lda #252
 sta $5121
 sta $5125
 lda #253
 sta $5123
 sta $5127
 lda #127
 sta $512b
 ; Initialize two 96-entry VBlank programs in cartridge RAM.
 lda #2
 sta $5102
 lda #1
 sta $5103
 lda #0
 sta $5113
 ldx #0
@clear_actors:
 .repeat 8,I
 sta $6800+I*256,x
 .endrepeat
 inx
 bne @clear_actors
 lda #$9c
 sta $5114
 lda #$9d
 sta $5115
 lda #$9e
 sta $5116
 lda #3
 sta $5100
 lda #0
 sta cursor
 lda #$60
 sta cursor+1
 ldx #2
 stx window
@buffer:
 ldx #96
@template:
 ldy #0
 lda #$a9
 sta (cursor),y
 ldy #2
 lda #$8d
 sta (cursor),y
 lda cursor
 clc
 adc #5
 sta cursor
 bcc :+
 inc cursor+1
: dex
 bne @template
 lda #0
 sta cursor
 lda #$62
 sta cursor+1
 dec window
 bne @buffer
 lda #$60
 sta drawpage
 sta terminators+1
 sta $6000
 sta $6200
 lda #$62
 sta terminators+3
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
 ; Reopen only the previous terminator. The other 95 LDA opcodes never change.
 and #2
 tax
 lda terminators,x
 sta z:addr
 lda terminators+1,x
 sta z:addr+1
 ldy #0
 lda #$a9
 sta (addr),y
 rts
_end_list:
 ldy #0
 lda #$60
 sta (cursor),y
 lda drawpage
 and #2
 tax
 lda cursor
 sta terminators,x
 lda cursor+1
 sta terminators+1,x
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
 bne :+
 jmp @exit
:
 lda #2
 sta $5104
 lda drawpage
 cmp #$60
 beq @draw_a
 jsr $6000
 jsr stream_column
 jsr restore_beads
 jsr $6200
 jmp @done
@draw_a:
 jsr $6200
 jsr stream_column
 jsr restore_beads
 jsr $6000
@done:
 lda _sprite_page
 sta $5121
 sta $5125
 jsr paint_beads
 lda #1
 sta $5104
 lda #0
 sta $2003
 lda #2
 sta $4014
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
 lda _boss_active
 beq :+
 lda #3
 bne @switch
: lda window
@switch: sta $5130
 lda window
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
.segment "VECTORS"
.word nmi, reset, irq


.include "stage.inc"
.include "laser.inc"
.include "boss.inc"

.segment "STARTUP"
.export _update_actors,_render_actors
.import _actor_update,_actor_render
_update_actors:
 lda #$9b
 sta $5116
 lda #$9a
 sta $5115
 jsr _actor_update
 jmp finish_actor_bank
_render_actors:
 lda #$9b
 sta $5116
 lda #$9a
 sta $5115
 jsr _actor_render
finish_actor_bank:
 lda #$9e
 sta $5116
 jmp main_bank
