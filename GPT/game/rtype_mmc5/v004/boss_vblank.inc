.import _stage_tile
.segment "STARTUP"
restore_beads:
 lda _boss_active
 beq @done
 jsr select_patch
 jsr restore_tiles
 jmp main_bank
@done: rts

paint_beads:
 lda _boss_active
 bne :+
 rts
:
 jsr select_patch
 jsr paint_tiles
 lda #0
 sta $2006
 sta $2006
main_bank:
 lda #$9d
 sta $5115
 rts
select_patch:
 lda patch_bank
 sta $5115
 ldx right_edge
 ldy _stage_col
 rts
restore_tiles: jmp (restore_ptr)
paint_tiles: jmp (paint_ptr)
