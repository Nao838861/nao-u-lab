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
.export _oam_prepared
_oam_prepared: .res 1
early_dma: .res 1
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
 sta $7800,x
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
 lda z:remove_size
 beq :+
 lda #$a0
 sta $5115
 jsr $7000
:
 lda drawpage
 cmp #$60
 beq @draw_a
 lda early_dma
 bne :+
 jsr $6000
: lda z:pending_column
 beq :+
 jsr stream_column
:
 jsr restore_beads
 jsr $6200
 jmp @done
@draw_a:
 lda early_dma
 bne :+
 jsr $6200
: lda z:pending_column
 beq :+
 jsr stream_column
:
 jsr restore_beads
 jsr $6000
@done:
 lda early_dma
 bne :+
 jsr upload_sprite_pages
:
 jsr paint_beads
 lda bubble_lists_live
 beq @no_ink
 lda z:add_size
 beq @bubble_colors
 lda #$a0
 sta $5115
 jsr $7100
@bubble_colors:
 lda bubble_frame
 cmp #2
 bcc :+
 lda _boss_cleared
 bne :+
 lda z:bubble_nmi_bank
 sta $5115
 jsr draw_bubble_attributes
:
 ; Bubble writes use paired $2006 writes entirely within nametable zero.
@no_ink:
 ; All VBlank routines execute in fixed ROM, WRAM or the resident $8000
 ; bank. Restore the switchable $a000 bank once after the final effect.
 lda #$9d
 sta $5115
 lda #1
 sta $5104
 lda early_dma
 bne :+
 lda #0
 sta $2003
 lda #2
 sta $4014
: ldx z:_backdrop
 cpx z:shown_backdrop
 beq :+
 jsr update_backdrop
:
 lda _scroll_x
 sta $2005
 lda #0
 sta $2005
 sta _oam_prepared
 sta _ready
@exit:
 lda early_dma
 beq :+
 lda #$1c
 sta $2001
 lda #0
 sta early_dma
: pla
 tay
 pla
 tax
 pla
irq:
 pha
 lda $5204
 bpl @return
 lda window
 cmp #3
 bne @band
 lda _boss_active
 beq @band
 lda _boss_offset
 bne @band
 lda _oam_prepared
 beq @stop
 ; The room ends at line 223. Transfer completed sprites in the black
 ; lower border, so the full VBlank remains available for BG animation.
 lda #0
 sta _oam_prepared
 sta $2001
 sta $2003
 lda #2
 sta $4014
 sta early_dma
 sta $5104
 lda drawpage
 cmp #$60
 beq @old_b
 jsr $6000
 jmp @erased
@old_b: jsr $6200
@erased:
 jsr upload_sprite_pages
 lda #1
 sta $5104
@stop:
 lda #0
 sta $5203
 beq @return
@band:
 inc window
 lda _boss_active
 beq :+
 lda #3
 bne @switch
: lda window
@switch: sta $5130
 lda window
 cmp #3
 bne @regular
 lda _boss_active
 beq @regular
 lda _boss_offset
 bne @regular
 lda #228
 bne @line
@regular:
 lda window
 asl
 asl
 asl
 asl
 asl
 asl
 clc
 adc #64
@line: sta $5203
@return:
 pla
 rti
upload_sprite_pages:
 lda #0
 sta $5130
 lda _sprite_page
 sta $5121
 sta $5125
 lda _boss_active
 beq @stage_sprites
 lda #1
 sta $5130
 lda #237
 bne @upper_page
@stage_sprites:
 lda _stage_tile
 cmp #96
 bcs @walking
 lda #1
 sta $5130
 lda #125                    ; upper page 381 with individual flight poses
 bne @upper_page
@walking:
 lda #253
@upper_page:
 sta $5123
 sta $5127
 lda #0
 sta $5130
 rts
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

.include "boss_attack.inc"

.segment "STARTUP"
draw_bubble_attributes: jmp (bubble_nmi_ptr)

.include "mount_stream.inc"
