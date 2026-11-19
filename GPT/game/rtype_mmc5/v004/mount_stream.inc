; An intact housing is part of the streamed terrain. When a gun is hit,
; re-stream its original columns through the normal one-column VBlank path.
.export kill_mount,_refresh_mounts
.segment "BSS"
; Each gun dies once and spans at most three columns.
mount_dirty_cols: .res MOUNT_COUNT*3
.segment "ZEROPAGE"
mount_dirty_count: .res 1
mount_end: .res 1
mount_shadow: .res 2
.segment "RODATA"
.include "build/mount-background.inc"
.segment "CODE"
kill_mount:
 lda #12
 sta _gun_dead,x
 ldy mount_dirty_count
 lda mount_right,x
@push:
 sta mount_dirty_cols,y
 iny
 cmp mount_left,x
 beq @queued
 sec
 sbc #1
 bcs @push
@queued: sty mount_dirty_count
 rts
_refresh_mounts:
 ldy mount_dirty_count
 beq @return
 lda _stage_col
 cmp #255
 bne @return
@pop:
 dey
 sty mount_dirty_count
 lda mount_dirty_cols,y
 sec
 sbc _stage_tile
 cmp #32
 bcs @skip
 cmp #0
 bne @refresh
 lda _scroll_x
 and #7
 bne @skip
@refresh:
 lda mount_dirty_cols,y
 sta _stage_col
 jmp _prepare_column
@skip:
 cpy #0
 bne @pop
@return: rts

patch_mount_column:
 ldx _stage_col
 lda mount_col_start+1,x
 sta mount_end
 lda mount_col_start,x
 cmp mount_end
 beq @done
 tax
@part:
 ldy mount_owner,x
 lda _gun_dead,y
 bne @next
 ldy mount_row,x
 lda mount_tile,x
 sta $0400,y
 lda #$ff
 sta $0420,y
 lda attrlo,y
 sta mount_shadow
 lda attrhi,y
 sta mount_shadow+1
 ldy pending_column
 dey
 lda #224
 sta (mount_shadow),y
@next:
 inx
 cpx mount_end
 bne @part
@done: rts
