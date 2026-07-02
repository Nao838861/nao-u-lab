; ============================================================
; MMC5 combo: 拡張属性レンダリング中に WRAM を書く  N8 Pro 再現
; ------------------------------------------------------------
; 仮説: MMC5がPPUフェッチ(拡張属性の追加ExRAMフェッチ含む)で忙しい最中に、
;       CPUがWRAM($6000-)へ高速書き込みすると、N8 Proが書き込みを落とす。
;       (描画中のみ・量依存・単体WRAMテストでは緑, を説明)
;
; 構成:
;   - ExRAM拡張属性モードで背景を表示(レンダリングON) = MMC5をフェッチで多忙に
;   - メインループ(=画面描画中)で WRAM $6000-$6BFF を ストライド64 最大速度で
;     書き→読み戻して照合(本編 draw と同じ書き方)
;   - 取りこぼし検出で 画面色を 緑→赤 にラッチ (NMIでパレット更新)
; ============================================================

.segment "HEADER"
    .byte "NES", $1A
    .byte $01          ; PRG 16KB
    .byte $04          ; CHR 32KB
    .byte $50          ; mapper 5
    .byte $00
    .byte $00,$00,$00,$00,$00,$00,$00,$00

.segment "CODE"

ptrlo  = $10
ptrhi  = $11
failed = $13
expect = $16
paircnt = $17
row    = $18

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

    ; ---- MMC5 ----
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
    sta failed

    ; ---- palette (green) ----
    jsr set_palette

    ; ---- nametable tile 0 ----
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

    ; ---- ExRAM diagonal fill (extended attribute) ----
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
    and #$07
    sta (ptrlo),y
    iny
    cpy #$20
    bne @ec
    lda ptrlo
    clc
    adc #$20
    sta ptrlo
    bcc @noc
    inc ptrhi
@noc:
    inc row
    lda row
    cmp #$1E
    bne @er
    lda #$01
    sta $5104          ; extended attribute mode ON

    ; ---- enable rendering + NMI ----
    bit $2002
    lda #$00
    sta $2005
    sta $2005
    lda #$80           ; NMI on, BG pattern $0000
    sta $2000
    lda #$0A           ; show BG
    sta $2001

; ---- main loop: WRAM stress DURING active display ----
main:
    lda #$FF
    jsr fill_region
    lda #$00
    jsr fill_strided
    lda #$00
    jsr verify
    lda #$00
    jsr fill_region_ff
    lda #$FF
    jsr fill_strided
    lda #$FF
    jsr verify
    jmp main

; --- NMI: refresh palette (green/red by failed) in vblank ---
nmi:
    pha
    txa
    pha
    jsr set_palette
    bit $2002
    lda #$00
    sta $2005
    sta $2005
    pla
    tax
    pla
    rti
irq:
    rti

; set BG palette 0: backdrop black, colors = green(ok)/red(fail)
set_palette:
    bit $2002
    lda #$3F
    sta $2006
    lda #$00
    sta $2006
    lda #$0F
    sta $2007          ; $3F00 backdrop
    ldx #$2A           ; green
    lda failed
    beq @c
    ldx #$16           ; red
@c:
    stx $2007
    stx $2007
    stx $2007
    lda #$00
    sta $2006
    sta $2006
    rts

; A=value ; fill $6000-$6BFF (12 pages)
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
fill_region_ff = fill_region

; A=value ; MAX-RATE strided writes col0..7,pair0..47 addr=$6000+pair*64+col
fill_strided:
.repeat 8, C
.repeat 48, P
    sta $6000 + P*64 + C
.endrepeat
.endrepeat
    rts

; A=expected ; verify the 384 strided bytes; latch failed
verify:
    sta expect
    ldx #$00
@col:
    txa
    sta ptrlo
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

.segment "VECTORS"
    .word nmi
    .word reset
    .word irq

.segment "CHR"
    .incbin "chr.bin"
