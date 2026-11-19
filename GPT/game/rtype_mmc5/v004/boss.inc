; The tail and body share world coordinates; OAM adds glints to the fixed body.
.import _boss_active,_boss_pose,_boss_offset,_dark_room
.export _draw_boss_details,_prepare_tail
.segment "ZEROPAGE"
tail_ptr: .res 2
restore_ptr: .res 2
paint_ptr: .res 2
patch_bank: .res 1
right_edge: .res 1
.segment "CODE"
_prepare_tail:
 lda #$80
 sta $5115
 ldx _boss_pose
 lda $a100,x
 sta tail_ptr
 lda $a200,x
 sta tail_ptr+1
 lda $a300,x
 sta restore_ptr
 lda $a400,x
 sta restore_ptr+1
 lda $a500,x
 sta paint_ptr
 lda $a600,x
 sta paint_ptr+1
 lda $a000,x
 sta patch_bank
 sta $5115
 lda _scroll_x
 and #7
 cmp #1
 lda _stage_tile
 adc #31
 sta right_edge
 tax
 ldy _stage_col
 jsr mark_tiles
 jmp main_bank
mark_tiles: jmp (tail_ptr)

_draw_boss_details:
 ldx _oam_index
@marks:
 ldy #0
@mark:
 lda mark_x,y
 clc
 adc _boss_offset
 bcs @next
 sta $0203,x
 lda mark_y,y
 sta $0200,x
 lda mark_tile,y
 sta $0201,x
 lda #3
 sta $0202,x
 inx
 inx
 inx
 inx
@next:
 iny
 cpy #MARK_COUNT
 bne @mark
 stx _oam_index
 rts
.segment "RODATA"
.include "build/boss-marks.inc"
.include "boss_vblank.inc"
