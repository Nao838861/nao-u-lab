; ============================================================
; MMC5 ExRAM ($5C00-$5FFF) 書き込み信頼性テスト  N8 Pro 用  ★本命
; ------------------------------------------------------------
; ソース解析の結論:
;   本編は VBUF のピクセルを VBlank 中に ネームテーブル($2007) と
;   ExRAM($5C80+..) へ「そのまま」転送して表示する。NTはCIRAM(本体側)で
;   N8 Proでは変えられないので、Pro固有の取りこぼしは ExRAM書き込みしか
;   あり得ない。ExRAMはダブルバッファ無し→落ちると古い値が残る=症状一致。
;
; 動作: 毎フレーム(レンダリングOFF=VBlank転送と同条件)
;   1. ExRAM $5C00-$5FFF を「補数値」で loop 埋め
;   2. 同領域を「目標値」で 最大速度アンロール sta 埋め(ストレス, 本編の連続書き)
;   3. 読み戻して全一致か照合。取りこぼし=補数値が残る→検出
;   4. 目標値を $00/$FF 交互
;   結果: 緑=全一致 / 赤=不一致をラッチ
;
; ExRAM書き込み/読み出しは $5104=2 (ExRAM as writable RAM) で行う。
; ============================================================

.segment "HEADER"
    .byte "NES", $1A
    .byte $01          ; PRG 16KB
    .byte $04          ; CHR 32KB (未使用)
    .byte $50          ; mapper 5
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

    ; MMC5: ExRAM as writable RAM (mode 2)
    lda #$03
    sta $5100
    lda #$03
    sta $5101
    lda #$00
    sta $5105
    sta $5130
    lda #$02
    sta $5104          ; ExRAM = CPU read/write RAM
    sta toggle         ; (=2, low bit 0 -> starts on $FF branch; fine)
    lda #$00
    sta failed

loop:
    lda toggle
    and #$01
    beq @useFF
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
    sta $2006
    sta $2006
    jmp loop

; A=value ; loop-fill ExRAM $5C00-$5FFF (4 pages)
fill_loop:
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

; A=value ; MAX-RATE unrolled sta to ExRAM $5C00-$5FFF (1024 bytes)
fill_unrolled:
.repeat 1024, I
    sta $5C00+I
.endrepeat
    rts

; A=expected ; verify $5C00-$5FFF, latch failed on mismatch
verify:
    sta expect
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
