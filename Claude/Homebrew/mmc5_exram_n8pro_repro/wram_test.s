; ============================================================
; MMC5 WRAM ($6000-$67FF) 書き込み信頼性テスト  N8 Pro 用
; ------------------------------------------------------------
; 仮説: N8 Pro の MMC5 PRG-RAM(WRAM) が、最大速度の連続 sta で一部を
;       取りこぼす/化ける。本編は VBUF(=WRAM) を大量連続書き込みしており、
;       描画量に比例して壊れる（Mesen/無印N8は正常, Proのみ）。
;
; 動作: 毎フレーム
;   1. WRAM 全体を「補数値」で loop 埋め
;   2. WRAM 全体を「目標値」で 最大速度アンロール sta 埋め（ストレス）
;   3. 読み戻して 全バイト == 目標値 か照合
;   4. 目標値を $00/$FF で交互反転（取りこぼし=補数値が残る→検出）
;   結果を背景色で表示: 緑=全一致 / 赤=不一致を1回でも検出(ラッチ)
;
; 表示はレンダリングOFFのまま backdrop($3F00) の色だけ。CHR/NT不要。
; コードは固定バンク $E000-$FFFF に配置（起動確実）。
; ============================================================

.segment "HEADER"
    .byte "NES", $1A
    .byte $01          ; PRG 16KB
    .byte $04          ; CHR 32KB (未使用, chr.bin流用)
    .byte $50          ; mapper 5, horizontal
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

    ; MMC5 WRAM enable
    lda #$03
    sta $5100
    lda #$02
    sta $5102
    lda #$01
    sta $5103
    lda #$00
    sta $5113          ; WRAM bank 0
    sta toggle
    sta failed

loop:
    lda toggle
    and #$01
    beq @useFF
    ; target $00, pre $FF
    lda #$FF
    jsr fill_loop
    lda #$00
    jsr fill_unrolled
    lda #$00
    jsr verify
    jmp @after
@useFF:
    lda #$00
    jsr fill_loop
    lda #$FF
    jsr fill_unrolled
    lda #$FF
    jsr verify
@after:
    inc toggle
    ; backdrop color = green(ok) / red(failed)
    bit $2002
    lda #$3F
    sta $2006
    lda #$00
    sta $2006
    lda failed
    bne @red
    lda #$2A           ; green
    jmp @set
@red:
    lda #$16           ; red
@set:
    sta $2007
    lda #$00
    sta $2006          ; move addr out of palette so screen = $3F00
    sta $2006
    jmp loop

; A = value ; loop-fill $6000-$67FF
fill_loop:
    ldx #$60
    stx ptrhi
    ldy #$00
    sty ptrlo
    ldx #$08
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

; A = value ; MAX-RATE unrolled sta to $6000-$67FF (the stress write)
fill_unrolled:
.repeat 2048, I
    sta $6000+I
.endrepeat
    rts

; A = expected ; verify $6000-$67FF, latch failed on mismatch
verify:
    sta expect
    ldx #$60
    stx ptrhi
    ldy #$00
    sty ptrlo
    ldx #$08
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
