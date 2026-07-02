; ============================================================
; MMC5 WRAM ストライド書き込みテスト  N8 Pro 用
; ------------------------------------------------------------
; 本編 draw_bgfaru の書き込みパターン（dst_ptr += 64 で縦に飛ばし書き）を再現。
; 実機観察「縦2ピクセルOK / 2ピクセル失敗」= ストライド64書き込みで1個おきに
; 取りこぼす、という仮説を直接検証する。
;
; 動作: 毎フレーム
;   1. $6000-$6BFF を「補数値」で loop 埋め
;   2. 8列 x 48ペア を addr=$6000 + pair*64 + col の順（=縦ストライド64）で
;      最大速度アンロール sta（目標値）
;   3. その384バイトを読み戻して照合。取りこぼし=補数値が残る→検出
;   結果: 緑=全一致 / 赤=不一致をラッチ
; ============================================================

.segment "HEADER"
    .byte "NES", $1A
    .byte $01          ; PRG 16KB
    .byte $04          ; CHR 32KB (未使用)
    .byte $50          ; mapper 5
    .byte $00
    .byte $00,$00,$00,$00,$00,$00,$00,$00

.segment "CODE"

ptrlo  = $10
ptrhi  = $11
toggle = $12
failed = $13
expect = $16
paircnt = $17

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
    lda #$02
    sta $5102
    lda #$01
    sta $5103
    lda #$00
    sta $5113
    sta toggle
    sta failed

loop:
    lda toggle
    and #$01
    beq @useFF
    lda #$FF
    jsr fill_region     ; pre-fill $FF
    lda #$00
    jsr fill_strided    ; strided max-rate write $00
    lda #$00
    jsr verify_strided  ; expect $00
    jmp @after
@useFF:
    lda #$00
    jsr fill_region     ; pre-fill $00
    lda #$FF
    jsr fill_strided    ; strided max-rate write $FF
    lda #$FF
    jsr verify_strided  ; expect $FF
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

; A = value ; fill $6000-$6BFF (12 pages) via loop
fill_region:
    ldx #$60
    stx ptrhi
    ldy #$00
    sty ptrlo
    ldx #$0C
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

; A = value ; MAX-RATE strided writes: col 0..7, pair 0..47, addr=$6000+pair*64+col
fill_strided:
.repeat 8, C
.repeat 48, P
    sta $6000 + P*64 + C
.endrepeat
.endrepeat
    rts

; A = expected ; verify the 384 strided bytes; latch failed on mismatch
verify_strided:
    sta expect
    ldx #$00           ; col
@col:
    txa
    sta ptrlo          ; lo = col (col<8 -> $6000+col)
    lda #$60
    sta ptrhi
    lda #48
    sta paircnt
    ldy #$00
@pair:
    lda (ptrlo),y
    cmp expect
    bne @bad
    lda ptrlo
    clc
    adc #64
    sta ptrlo
    bcc @noc
    inc ptrhi
@noc:
    dec paircnt
    bne @pair
    inx
    cpx #$08
    bne @col
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
