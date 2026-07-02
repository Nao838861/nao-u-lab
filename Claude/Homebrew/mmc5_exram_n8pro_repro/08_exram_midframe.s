; ============================================================
; 08: MMC5 フレーム内黒帯での ExRAM 書き込み検証  N8 Pro 再現
; ------------------------------------------------------------
; 本編 MonoSH の exram_phase0/1 は「vblank中」ではなく、スキャンラインIRQで
; 画面下部の描画をOFFにした"フレーム内黒帯"の中で ExRAM($5C80-$5F7F) に書く。
; 既存の exram.nes は電源投入からずっと描画OFF＝この文脈が未検証だった。
;
; 仮説: N8 Pro の MMC5 コアが ExRAM への CPU 書き込みを内部の
;   「フレーム内/レンダリング中」状態でゲートしており、直前まで拡張属性
;   モードで描画していたフレームの途中($2001=0にした黒帯)では書き込みが
;   落ちる。常時描画OFFのテストでは絶対に再現しない。
;
; 構成(本編のフレーム構造を骨格だけ忠実に再現):
;   - ExRAM拡張属性モードで背景を実レンダリング
;   - MMC5スキャンラインIRQ(line192) → $2001=0(下側黒帯) → $5104=2
;     → ExRAM $5C80-$5F7F に768バイト連続書き(本編exram_phaseと同範囲・同順)
;     → 読み戻し照合 → $5104=1 → 次のvblankで描画ON復帰(トップ黒帯)
;   - 書く値は毎サイクル $FF/$00 反転(取りこぼし=前回値が残る→検出)
;   - WRAMは一切使わない(ExRAM単独要因の切り分け)
;   - 黒帯の背景色: 緑=OK / 赤=不一致ラッチ
;
; ヘッダは本編と同じ flags6=$53 (vertical + battery + mapper5)。
; ============================================================

.segment "HEADER"
    .byte "NES", $1A
    .byte $01, $04
    .byte $53, $00
    .byte $00, $00, $00, $00, $00, $00, $00, $00

.segment "CODE"

ptrlo  = $10
ptrhi  = $11
failed = $13
val    = $16
row    = $17

IRQ_LINE = 192

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
    sta failed
    lda #$FF
    sta val            ; 最初に書く値

    ; ---- palette: backdrop=green(結果表示), 全4パレットに可視色 ----
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

    ; ---- nametable: tile $00 x 1024 ----
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
    sta $5104
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

    ; ---- scroll + render ON (NMI off) ----
    bit $2002
    lda #$00
    sta $2005
    sta $2005
    lda #$00
    sta $2000
    lda #$0A
    sta $2001

    ; ---- arm MMC5 scanline IRQ ----
    lda #IRQ_LINE
    sta $5203
    lda #$80
    sta $5204
    cli

main:
    jmp main

; ------------------------------------------------------------
; IRQ: 本編の下側黒帯シーケンスを再現
; ------------------------------------------------------------
irq:
    pha
    txa
    pha
    tya
    pha

    lda $5204          ; ack
    lda #$00
    sta $5204          ; 再発火無効化(本編と同じ・次回はvblank後に再設定)

    lda #$00
    sta $2001          ; 描画OFF = フレーム内黒帯

    lda #$02
    sta $5104          ; ExRAM writable

    ; ---- 768バイト連続書き ($5C80-$5F7F, 本編exram_phase0+1と同範囲・昇順) ----
    lda val
.repeat 768, I
    sta $5C80+I
.endrepeat

    ; ---- 読み戻し照合 ----
    lda #$80
    sta ptrlo
    lda #$5C
    sta ptrhi
    ldx #$03
@vp:
    ldy #$00
@vb:
    lda (ptrlo),y
    cmp val
    bne @bad
    iny
    bne @vb
    inc ptrhi
    dex
    bne @vp
    jmp @vdone
@bad:
    lda #$01
    sta failed
@vdone:
    lda #$01
    sta $5104          ; extended attribute mode に戻す(本編と同じ)

    lda val
    eor #$FF
    sta val

    ; ---- 黒帯の背景色で結果表示 (描画OFF中なので安全) ----
    bit $2002
    lda #$3F
    sta $2006
    lda #$00
    sta $2006
    ldx #$2A           ; green
    lda failed
    beq @col
    ldx #$16           ; red
@col:
    stx $2007
    lda #$00
    sta $2006
    sta $2006

    ; ---- 次のvblankまで描画OFFのまま待つ(トップ黒帯相当) ----
@wv:
    bit $2002
    bpl @wv

    ; ---- 描画ON復帰 + IRQ再設定 (game.cの復帰シーケンスと同順) ----
    lda #$00
    sta $2005
    sta $2005
    lda #$20
    sta $2006
    lda #$00
    sta $2006
    lda #$0A
    sta $2001
    lda #IRQ_LINE
    sta $5203
    lda #$80
    sta $5204

    pla
    tay
    pla
    tax
    pla
nmi:
    rti

.segment "RODATA"
palette:
    .byte $2A,$30,$16,$2A    ; backdrop=green(結果), pal0
    .byte $2A,$30,$16,$2A
    .byte $2A,$30,$16,$2A
    .byte $2A,$30,$16,$2A
    .byte $2A,$30,$16,$2A
    .byte $2A,$30,$16,$2A
    .byte $2A,$30,$16,$2A
    .byte $2A,$30,$16,$2A

.segment "VECTORS"
    .word nmi
    .word reset
    .word irq

.segment "CHR"
    .incbin "chr.bin"
