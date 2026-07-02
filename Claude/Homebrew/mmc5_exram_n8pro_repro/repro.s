; ============================================================
; MMC5 ExRAM 拡張属性モード  N8 Pro 再現ROM (スプライト無し・静止画面)
; ------------------------------------------------------------
;  背景を ExRAM拡張属性モード(mode1) で描く。各8x8セルがExRAMのバイトで
;  4KB CHRバンクを選び、solidタイルの白/赤/緑ブロックを斜めに並べる。
;  solidタイルなので、CHRフェッチが1ラインでも欠けると黒い横線として見える。
;
;  期待: Mesen / 無印N8 では 斜めの白赤緑ブロックがきれいに出る（黒線なし）。
;  バグ: N8 Pro で拡張属性の描画が化ける想定。
;
;  ビルド定義:
;    (無し)      : ExRAM拡張属性モードのテスト（本命）
;    -D SANITY=1 : 拡張属性を使わず通常描画（基本描画の動作確認用。全面白になるはず）
;
;  ※ 重要: コードは固定バンク($E000-$FFFF)に配置。MMC5は電源投入時この領域を
;    最終バンクに固定するので、起動直後から確実に実行できる（$8000配置は起動不能）。
; ============================================================

.segment "HEADER"
    .byte "NES", $1A
    .byte $01          ; PRG 1 x 16KB
    .byte $04          ; CHR 4 x 8KB = 32KB
    .byte $50          ; flags6: mapper low nibble = 5 ($50), horizontal mirror
    .byte $00          ; flags7 -> mapper 5 (MMC5)
    .byte $00,$00,$00,$00,$00,$00,$00,$00

.segment "CODE"

ptrlo = $10
ptrhi = $11
row   = $12

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

    ; ---- MMC5 base ----
    lda #$03
    sta $5100          ; PRG mode 3
    lda #$03
    sta $5101          ; CHR mode 3 (1KB banks)
    lda #$00
    sta $5105          ; nametables -> CIRAM page 0
    sta $5130          ; CHR upper bits = 0

    ; ---- palette ----
    lda $2002
    lda #$3F
    sta $2006
    lda #$00
    sta $2006
    ldx #$00
@pal:
    lda palette,x
    sta $2007
    inx
    cpx #$20
    bne @pal

    ; ---- nametable + attr fill: tile $00, 1024 bytes ($2000..$23FF) ----
    lda $2002
    lda #$20
    sta $2006
    lda #$00
    sta $2006
    lda #$00
    ldx #$04
@np:
    ldy #$00
@nb:
    sta $2007
    iny
    bne @nb
    dex
    bne @np

.ifdef SANITY
    ; --- 通常描画（拡張属性を使わない）: CHRバンク0..7 を $0000-$1FFF に。
    ;     全セル tile$00 = bank0 の solid色1 → 画面全体が白になるはず ---
    lda #$00
    sta $5104          ; ExRAM off (RAM as extra, unused)
    ldx #$00
@cb:
    txa
    sta $5120,x
    inx
    cpx #$08
    bne @cb
.else
    ; --- ExRAM拡張属性モード ---
    lda #$02
    sta $5104          ; ExRAM writable
    lda #$00
    sta ptrlo
    lda #$5C
    sta ptrhi
    lda #$00
    sta row
@er:
    ldy #$00
@ec:
    tya
    clc
    adc row
    and #$07           ; bank 0..7 (solid色が循環)
    sta (ptrlo),y
    iny
    cpy #$20
    bne @ec
    lda ptrlo
    clc
    adc #$20
    sta ptrlo
    bcc @nc
    inc ptrhi
@nc:
    inc row
    lda row
    cmp #$1E
    bne @er
    lda #$01
    sta $5104          ; extended attribute mode
.endif

    ; ---- scroll + enable BG ----
    bit $2002
    lda #$00
    sta $2005
    sta $2005
    lda #$00
    sta $2000          ; no NMI, BG pattern $0000, NT0
    lda #$0A           ; show BG (+ left column)
    sta $2001
main:
    jmp main

nmi:
irq:
    rti

.segment "RODATA"
palette:
    .byte $0F,$30,$16,$2A    ; BG0 : black, white, red, green
    .byte $0F,$0F,$0F,$0F
    .byte $0F,$0F,$0F,$0F
    .byte $0F,$0F,$0F,$0F
    .byte $0F,$0F,$0F,$0F
    .byte $0F,$0F,$0F,$0F
    .byte $0F,$0F,$0F,$0F
    .byte $0F,$0F,$0F,$0F

.segment "VECTORS"
    .word nmi
    .word reset
    .word irq

.segment "CHR"
    .incbin "chr.bin"
