; Queue nametable changes in WRAM. A banked routine paints the selected
; ExRAM attributes after the tail and lasers. Only cells at
; the ends of the moving footprint need a nametable write. The interior
; changes CHR through ExRAM. Solid body/tail cells keep their own graphics.
.export _prepare_bubble_display
.segment "RODATA"
.include "build/bubble-map.inc"
.segment "ACTORRAM"
old_bubble_bank: .res BUBBLE_CELLS
new_bubble_bank = $7810
bubble_lists_live: .res 1
.segment "ZEROPAGE"
packet_ptr: .res 2
remove_size: .res 1
add_size: .res 1
bubble_nmi_ptr: .res 2
bubble_nmi_bank: .res 1
.segment "CODE"
select_bubble_frame:
 lda #$a0
 sta $5115
 lda bubble_frame
 sec
 sbc #2
 tay
 lda $a080,y
 sta packet_ptr
 lda $a100,y
 sta packet_ptr+1
 lda $a180,y
 sta bubble_nmi_ptr
 lda $a200,y
 sta bubble_nmi_ptr+1
 lda $a000,y
 ora #$80
 sta bubble_nmi_bank
 sta $5115
 jsr @call
 jmp main_bank
@call: jmp (packet_ptr)

.segment "RODATA"
_prepare_bubble_display:
 lda bubble_frame
 cmp #2
 bcs @active
 lda bubble_lists_live
 bne @active
 rts
@active:
 lda #0
 ldx #BUBBLE_CELLS-1
@reset: sta new_bubble_bank,x
 dex
 bpl @reset
 lda _boss_cleared
 bne @programs
 lda bubble_frame
 cmp #2
 bcc @programs
 jsr select_bubble_frame
@programs:
 lda #0
 sta remove_size
 sta add_size
 sta bubble_lists_live
 ldx #BUBBLE_CELLS-1
@cell:
 lda new_bubble_bank,x
 beq @absent
 lda old_bubble_bank,x
 bne @remember
 ldy add_size
 lda #$20
 sta $7100,y
 lda bub_add_lo,x
 sta $7101,y
 lda bub_add_hi,x
 sta $7102,y
 iny
 iny
 iny
 sty add_size
 bne @remember
@absent:
 lda old_bubble_bank,x
 beq @next
 ldy remove_size
 lda #$20
 sta $7000,y
 lda bub_remove_lo,x
 sta $7001,y
 lda bub_remove_hi,x
 sta $7002,y
 iny
 iny
 iny
 sty remove_size
@remember:
 lda new_bubble_bank,x
 sta old_bubble_bank,x
@next:
 dex
 bpl @cell
 lda #$60
 ldy add_size
 sta $7100,y
 ldy remove_size
 sta $7000,y
 lda bubble_frame
 ora remove_size
 sta bubble_lists_live
 rts
