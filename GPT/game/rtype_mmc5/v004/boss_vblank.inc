.import _stage_tile
.segment "STARTUP"
.import _boss_cleared
restore_beads:
 lda _boss_cleared
 bne @done
 lda _boss_active
 beq @done
 lda patch_bank
 sta $5115
 ldx right_edge
 ldy _stage_col
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
 jmp (paint_ptr)
main_bank:
 lda #$9d
 sta $5115
 rts
