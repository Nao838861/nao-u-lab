; ============================================================
; 10: 切替PRGバンクから実行する WRAM読み→ExRAM書き 転送  N8 Pro 再現
; ------------------------------------------------------------
; 本編の exram_phase0/1 は $5114 で切り替えた PRGバンク($8000-$9FFF)から
; 実行され、WRAM(VBUF)を読み ExRAM に書く。既存テストは全て固定バンク
; ($E000-)から実行＝最大の未再現要素だった(検証ログ§5-2)。
;
; 構成(本編 transfer.s の exram_phase を忠実に再現):
;   - PRG 32KB (8KB x4バンク)。固定コードは最終バンク($E000)。
;   - 転送ルーチンはバンク0に配置し、IRQ内で $5114=$80 に切り替えて実行
;     (本編は $5114=$86/$87)。アドレスパターンも本編と同一:
;       lda VBUF($6010)+128*R+I : sta $5C80+32*R+I  (R=0..23, I=0..31)
;   - メインループ(=画面描画中)が WRAM $6000-$6BFF を値Fで埋める(本編のdraw相当)
;   - スキャンラインIRQ(line192) → $2001=0 → $5113=0 → $5114切替 → $5104=2
;     → jsr 転送 → $5114復帰 → ExRAM読み戻し照合 → $5104=1 → vblank後に描画ON
;   - F は毎サイクル $FF/$00 反転。黒帯の背景色: 緑=OK / 赤=不一致ラッチ
;
; 08(固定バンク・即値書き)が緑でこれが赤なら「切替バンク実行 or WRAM読み混在」
; が原因。ヘッダは本編と同じ flags6=$53。
; ============================================================

.segment "HEADER"
    .byte "NES", $1A
    .byte $02, $04     ; PRG 32KB, CHR 32KB
    .byte $53, $00
    .byte $00, $00, $00, $00, $00, $00, $00, $00

.segment "CODE"

ptrlo  = $10
ptrhi  = $11
failed = $13
frmval = $16
ready  = $17
row    = $18

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

    ; ---- MMC5 (本編 startup.s と同順 + PRGバンク初期化) ----
    lda #$03
    sta $5100          ; PRG mode 3 (8KB banks)
    lda #$03
    sta $5101
    lda #$80
    sta $5114          ; $8000 = ROM bank0 (転送ルーチン)
    lda #$81
    sta $5115
    lda #$82
    sta $5116
    lda #$83
    sta $5117          ; $E000 = ROM bank3 (固定コード)
    lda #$02
    sta $5102          ; WRAM write enable
    lda #$01
    sta $5103
    lda #$00
    sta $5113          ; WRAM bank 0
    sta $5105
    sta $5130
    sta failed
    sta ready
    lda #$FF
    sta frmval

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

    ; ---- ExRAM diagonal fill ----
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
    sta $5104

    ; ---- WRAM(VBUF相当) 初期充填 ----
    jsr fill_wram
    lda #$01
    sta ready

    ; ---- scroll + render ON (NMI off) + IRQ arm ----
    bit $2002
    lda #$00
    sta $2005
    sta $2005
    lda #$00
    sta $2000
    lda #$0A
    sta $2001
    lda #IRQ_LINE
    sta $5203
    lda #$80
    sta $5204
    cli

; ---- main: 描画中にWRAMを次の値で埋める(本編のVBUF drawに相当) ----
main:
    lda ready
    bne main           ; IRQが消費するまで待つ
    lda frmval
    eor #$FF
    sta frmval
    jsr fill_wram
    lda #$01
    sta ready
    jmp main

; frmval で WRAM $6000-$6BFF (12ページ) を埋める
fill_wram:
    lda #$00
    sta ptrlo
    lda #$60
    sta ptrhi
    ldx #$0C
    lda frmval
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

; ------------------------------------------------------------
; IRQ: 本編の下側黒帯 exram_phase シーケンス
; ------------------------------------------------------------
irq:
    pha
    txa
    pha
    tya
    pha

    lda $5204          ; ack
    lda #$00
    sta $5204

    lda ready
    bne @go
    jmp rearm          ; ソース未準備フレームは何もしない(描画は継続)
@go:

    lda #$00
    sta $2001          ; 描画OFF = フレーム内黒帯
    lda #$00
    sta $5113          ; 読みバンク設定(本編 set_wram_bank 相当)
    lda #$80
    sta $5114          ; ★切替バンクへ(本編は$86/$87)
    lda #$02
    sta $5104          ; ExRAM writable (本編と同順: $5114→$5104)

    jsr xfer768        ; $8000(切替バンク)で実行される転送

    lda #$83
    sta $5114          ; バンク復帰(本編 pla→sta $5114 相当)

    ; ---- ExRAM 読み戻し照合 ($5C80-$5F7F == frmval) ----
    lda #$80
    sta ptrlo
    lda #$5C
    sta ptrhi
    ldx #$03
@vp:
    ldy #$00
@vb:
    lda (ptrlo),y
    cmp frmval
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
    sta $5104          ; extended attribute mode に戻す
    lda #$00
    sta ready          ; 消費完了 → mainが次を用意

    ; ---- 黒帯の背景色で結果表示 ----
    bit $2002
    lda #$3F
    sta $2006
    lda #$00
    sta $2006
    ldx #$2A
    lda failed
    beq @col
    ldx #$16
@col:
    stx $2007
    lda #$00
    sta $2006
    sta $2006

    ; ---- vblankまで描画OFFのまま待って復帰 ----
@wv:
    bit $2002
    bpl @wv
    lda #$00
    sta $2005
    sta $2005
    lda #$20
    sta $2006
    lda #$00
    sta $2006
    lda #$0A
    sta $2001

rearm:
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
    .byte $2A,$30,$16,$2A
    .byte $2A,$30,$16,$2A
    .byte $2A,$30,$16,$2A
    .byte $2A,$30,$16,$2A
    .byte $2A,$30,$16,$2A
    .byte $2A,$30,$16,$2A
    .byte $2A,$30,$16,$2A
    .byte $2A,$30,$16,$2A

; ------------------------------------------------------------
; 転送ルーチン: 切替バンク(ROM bank0, CPU $8000-)に配置。
; 本編 _exram_phase0_impl/_exram_phase1_impl と同一アドレスパターン。
; VBUF_1BPP=$6000, X_BIAS/4=$10, stride=128 (=2*VBUF_STRIDE_PACKED)
; ------------------------------------------------------------
.segment "XFER"
xfer768:
.repeat 24, R
.repeat 32, I
    lda $6010 + 128*R + I
    sta $5C80 + 32*R + I
.endrepeat
.endrepeat
    rts

.segment "VECTORS"
    .word nmi
    .word reset
    .word irq

.segment "CHR"
    .incbin "chr.bin"
