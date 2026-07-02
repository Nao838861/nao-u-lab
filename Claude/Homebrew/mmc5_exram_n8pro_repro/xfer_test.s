; ============================================================
; MMC5 転送パターン再現: WRAM($6000)読み ↔ ExRAM($5C00)書き の交互高速コピー
; ------------------------------------------------------------
; 本編 transfer.s は VBUF(WRAM)を読んで ExRAM/NT へ書く。単一メモリ書き込みは
; 全て成功(緑)だったので、次は「異なるカートメモリの交互アクセス」を検証する。
;
; 動作: 毎フレーム(レンダリングOFF)
;   1. WRAM $6000-$63FF を 目標値で埋める(コピー元)
;   2. ExRAM $5C00-$5FFF を 補数値で埋める(取りこぼし検出用の下地)
;   3. コピー: unrolled  lda $6000+I : sta $5C00+I  (WRAM読み↔ExRAM書き 交互, 最大速度)
;   4. ExRAM を読み戻して == 目標値 か照合。取りこぼし→補数値が残る→検出
;   5. 目標値 $00/$FF 交互
;   緑=全一致 / 赤=不一致ラッチ
; ============================================================

.segment "HEADER"
    .byte "NES", $1A
    .byte $01
    .byte $04
    .byte $50
    .byte $00
    .byte $00,$00,$00,$00,$00,$00,$00,$00

.segment "CODE"

ptrlo = $10
ptrhi = $11
toggle = $12
failed = $13
expect = $16

reset:
    sei
    cld
    ldx #$40
    stx $4017
    ldx #$FF
    txs
    inx
    stx $2000
    stx $2001
    stx $4010
    bit $2002
@w1:
    bit $2002
    bpl @w1
@w2:
    bit $2002
    bpl @w2

    lda #$03
    sta $5100
    lda #$03
    sta $5101
    lda #$00
    sta $5105
    sta $5130
    lda #$02
    sta $5102          ; WRAM writable
    lda #$01
    sta $5103
    lda #$00
    sta $5113          ; WRAM bank 0
    lda #$02
    sta $5104          ; ExRAM = writable RAM
    lda #$00
    sta toggle
    sta failed

loop:
    lda toggle
    and #$01
    beq @useFF
    lda #$00
    sta expect
    lda #$FF
    jsr fill_exram     ; ExRAM pre = $FF (complement)
    lda #$00
    jsr fill_wram      ; WRAM src = $00 (target)
    jmp @copy
@useFF:
    lda #$FF
    sta expect
    lda #$00
    jsr fill_exram     ; ExRAM pre = $00
    lda #$FF
    jsr fill_wram      ; WRAM src = $FF
@copy:
    jsr copy_wram_exram
    jsr verify_exram
    inc toggle
    ; result color
    bit $2002
    lda #$3F
    sta $2006
    lda #$00
    sta $2006
    lda failed
    bne @red
    lda #$2A
    jmp @set
@red:
    lda #$16
@set:
    sta $2007
    lda #$00
    sta $2006
    sta $2006
    jmp loop

; A=value ; fill WRAM $6000-$63FF (4 pages)
fill_wram:
    ldx #$60
    stx ptrhi
    ldy #$00
    sty ptrlo
    ldx #$04
@fp:
    ldy #$00
@fb:
    sta (ptrlo),y
    iny
    bne @fb
    inc ptrhi
    dex
    bne @fp
    rts

; A=value ; fill ExRAM $5C00-$5FFF (4 pages)
fill_exram:
    ldx #$5C
    stx ptrhi
    ldy #$00
    sty ptrlo
    ldx #$04
@fp:
    ldy #$00
@fb:
    sta (ptrlo),y
    iny
    bne @fb
    inc ptrhi
    dex
    bne @fp
    rts

; unrolled: lda $6000+I ; sta $5C00+I   (WRAM read <-> ExRAM write, max rate)
copy_wram_exram:
.repeat 1024, I
    lda $6000+I
    sta $5C00+I
.endrepeat
    rts

; verify ExRAM $5C00-$5FFF == expect
verify_exram:
    ldx #$5C
    stx ptrhi
    ldy #$00
    sty ptrlo
    ldx #$04
@vp:
    ldy #$00
@vb:
    lda (ptrlo),y
    cmp expect
    bne @bad
    iny
    bne @vb
    inc ptrhi
    dex
    bne @vp
    rts
@bad:
    lda #$01
    sta failed
    rts

nmi:
irq:
    rti

.segment "VECTORS"
    .word nmi
    .word reset
    .word irq

.segment "CHR"
    .incbin "chr.bin"
