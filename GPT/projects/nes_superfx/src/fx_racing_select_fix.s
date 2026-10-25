.setcpu "6502"
.segment "CODE"
; E5F2 originally jumps straight to E633, bypassing the old view handler.
; Restore only the rising edge of Select while the 3D race owns the display.
; Mode5 is the title, where Select must continue changing GRIP/DRIFT only.
lda $0642
and #$04
beq done
lda $4fe0
cmp #$04
bne done
inc $0650
lda $0650
and #$03
sta $0650
done:
jmp $e633
