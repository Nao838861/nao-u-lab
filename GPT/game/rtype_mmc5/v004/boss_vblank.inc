.import _stage_tile
.segment "STARTUP"
.import _boss_cleared
restore_beads:
 lda _boss_cleared
 bne @done
 lda _boss_active
 beq @done
 jsr select_patch
 ; The RAM laser list between restore and paint preserves X/Y and PRG banking.
 jmp (restore_ptr)
@done: rts

paint_beads:
 lda _boss_cleared
 beq :+
 rts
: lda _boss_active
 bne :+
 rts
:
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
paint_tiles: jmp (paint_ptr)
