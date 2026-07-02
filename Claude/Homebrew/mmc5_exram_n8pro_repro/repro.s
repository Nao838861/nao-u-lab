; ============================================================
; MMC5 ExRAM 拡張属性モード + 8x16スプライト  N8 Pro 再現ROM
; ------------------------------------------------------------
;  背景 : ExRAM拡張属性モード(mode1)。各8x8セルがExRAMのバイトで
;         4KB CHRバンクを選び、solidタイルの白/赤/緑ブロックを表示。
;  スプライト : 8x16モードで各ラインに8枚（Y=40..168の帯）。
;               → MMC5のスプライト/BGフェッチ位相検出を負荷。
;  期待 : Mesen / 無印N8 では、斜めの白赤緑ブロック＋白いスプライト帯が
;         きれいに出る。黒い横線は出ない。
;  バグ : N8 Pro では拡張属性の背景ブロックに1ラインおきの黒線が入る想定。
;  操作 : Aボタンを押している間はスプライトを画面外へ隠す
;         → スプライトが無いと黒線が消える＝スプライト依存を実証。
; ============================================================

.segment "HEADER"
    .byte "NES", $1A
    .byte $02          ; PRG 2 x 16KB = 32KB
    .byte $04          ; CHR 4 x 8KB  = 32KB
    .byte $50          ; flags6: mapper low nibble = 5 ($50), horizontal mirror
    .byte $00          ; flags7: mapper high nibble = 0  -> mapper 5 (MMC5)
    .byte $00,$00,$00,$00,$00,$00,$00,$00

.segment "CODE"

ptrlo = $10
ptrhi = $11
row   = $12
pad   = $13

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
@vw1:
    bit $2002
    bpl @vw1
@vw2:
    bit $2002
    bpl @vw2

    ; ---- MMC5 init ----
    lda #$03
    sta $5100          ; PRG mode 3 (8KB banks)
    lda #$03
    sta $5101          ; CHR mode 3 (1KB banks, for sprite CHR)
    lda #$02
    sta $5102
    lda #$01
    sta $5103          ; enable PRG-RAM writes (harmless)
    lda #$00
    sta $5105          ; all nametables -> CIRAM page 0
    sta $5130          ; CHR upper bits = 0
    lda #$80
    sta $5114          ; $8000 = PRG bank0 (ROM)
    lda #$81
    sta $5115          ; $A000 = bank1
    lda #$82
    sta $5116          ; $C000 = bank2
    lda #$03
    sta $5117          ; $E000 = bank3 (fixed ROM)
    ldx #$00
@chr:
    txa
    sta $5120,x        ; sprite CHR 1KB banks 0..7 = first 8KB of CHR
    inx
    cpx #$08
    bne @chr
    lda #$02
    sta $5104          ; ExRAM = writable RAM (to fill it)

    ; ---- palette ----
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

    ; ---- nametable fill: tile $00, 1024 bytes ($2000..$23FF) ----
    lda #$20
    sta $2006
    lda #$00
    sta $2006
    lda #$00
    ldx #$04
@ntp:
    ldy #$00
@ntb:
    sta $2007
    iny
    bne @ntb
    dex
    bne @ntp

    ; ---- fill ExRAM ($5C00..) : byte = (row+col) & 7  (4KB bank), pal bits 0 ----
    lda #$00
    sta ptrlo
    lda #$5C
    sta ptrhi
    lda #$00
    sta row
@exrow:
    ldy #$00
@excol:
    tya
    clc
    adc row
    and #$07
    sta (ptrlo),y
    iny
    cpy #$20
    bne @excol
    lda ptrlo
    clc
    adc #$20
    sta ptrlo
    bcc @noc
    inc ptrhi
@noc:
    inc row
    lda row
    cmp #$1E           ; 30 rows
    bne @exrow

    lda #$01
    sta $5104          ; ExRAM = extended attribute mode

    jsr copy_oam

    ; ---- enable ----
    bit $2002
    lda #$00
    sta $2005
    sta $2005
    lda #$A0           ; NMI on, 8x16 sprites, patterns $0000, NT0
    sta $2000
    lda #$1E           ; show BG + sprites (incl. left column)
    sta $2001
main:
    jmp main

copy_oam:
    ldx #$00
@l:
    lda oam_init,x
    sta $0200,x
    inx
    bne @l
    rts

nmi:
    pha
    txa
    pha
    tya
    pha
    ; read controller 1
    lda #$01
    sta $4016
    lda #$00
    sta $4016
    ldx #$08
@rp:
    lda $4016
    lsr a
    rol pad
    dex
    bne @rp
    lda pad
    and #$80           ; A button
    bne @hide
    jsr copy_oam       ; A not held -> sprites visible
    jmp @dma
@hide:
    ldx #$00
    lda #$FF
@hl:
    sta $0200,x        ; A held -> push all sprite Y offscreen
    inx
    inx
    inx
    inx
    bne @hl
@dma:
    lda #$00
    sta $2003
    lda #$02
    sta $4014
    pla
    tay
    pla
    tax
    pla
    rti

irq:
    rti

.segment "RODATA"
palette:
    .byte $0F,$30,$16,$2A    ; BG0 : black, white, red, green
    .byte $0F,$0F,$0F,$0F
    .byte $0F,$0F,$0F,$0F
    .byte $0F,$0F,$0F,$0F
    .byte $0F,$30,$16,$2A    ; SPR0: black, white, red, green
    .byte $0F,$0F,$0F,$0F
    .byte $0F,$0F,$0F,$0F
    .byte $0F,$0F,$0F,$0F

; 8 rows x 8 cols = 64 sprites (fills OAM). 8 sprites per scanline over Y=40..168.
oam_init:
.repeat 8, R
.repeat 8, C
    .byte 40 + R*16    ; Y
    .byte $00          ; tile 0 (8x16 -> tiles 0/1, pattern $0000)
    .byte $00          ; attr: sprite palette 0
    .byte C*32 + 4     ; X
.endrepeat
.endrepeat

.segment "VECTORS"
    .word nmi
    .word reset
    .word irq

.segment "CHR"
    .incbin "chr.bin"
