; ============================================================
; 09: MMC5 WRAM バンク切替($5113) ダブルバッファ検証  N8 Pro 再現
; ------------------------------------------------------------
; 本編 MonoSH は VBUF を WRAM バンク0/1 でダブルバッファし、$5113 を
; 毎フレーム複数回切り替える。既存テストは全てバンク0固定＝未検証だった。
;
; 仮説A(エイリアス): 本編ヘッダは旧iNESで WRAMサイズ無宣言(byte8=0)。
;   N8 Pro が 8KB しか確保していなければバンク1はバンク0のエイリアスになり、
;   読みバッファ=書きバッファ → 「静止で正常・移動中だけ崩れ・量依存」を説明。
; 仮説B(切替タイミング): $5113 切替が高頻度だと書き込みが旧バンクに落ちる。
;
; 構成:
;   - ExRAM拡張属性モードで背景表示(レンダリングON) = 本編と同じ描画文脈
;   - メインループ(=画面描画中)で $6000-$6BFF (VBUFと同領域) を
;     64バイトごとに bank0=V0 / bank1=V1 (V1=~V0) 交互に書く(切替96回/パス)
;   - 両バンクを読み戻して照合。エイリアスなら bank0 に V1 が残り即・確定で赤
;   - 毎パス V0 を $00/$FF 反転
;   - 画面色: 緑=OK / 赤=不一致ラッチ (NMIでパレット更新)
;
; ヘッダは本編 MonoSH と同じ flags6=$53 (vertical mirror + battery + mapper5)。
; -D NES2=1 で NES2.0 ヘッダ(PRG-NVRAM 32KB 宣言)版(=11)を生成。
; 09が赤で11が緑なら「ヘッダのWRAM宣言不足によるバンクエイリアス」が確定し、
; 本編側のヘッダ修正で直せる。
; ============================================================

.segment "HEADER"
.ifdef NES2
    ; NES 2.0: PRG 16KB, CHR 32KB, mapper5, battery, PRG-NVRAM = 64<<9 = 32KB
    .byte "NES", $1A
    .byte $01, $04
    .byte $53, $08
    .byte $00, $00
    .byte $90, $00
    .byte $00, $00, $00, $00
.else
    ; 旧iNES: 本編 MonoSH と同形式 (byte7=0, byte8=0 = WRAMサイズ無宣言)
    .byte "NES", $1A
    .byte $01, $04
    .byte $53, $00
    .byte $00, $00, $00, $00, $00, $00, $00, $00
.endif

.segment "CODE"

ptrlo   = $10
ptrhi   = $11
failed  = $13
expect  = $16
frmval  = $17          ; V0 (bank0値)。V1 = ~V0
val0    = $18
val1    = $19
chunks  = $1A
row     = $1B

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

    ; ---- MMC5 (本編 startup.s と同順) ----
    lda #$03
    sta $5100          ; PRG mode 3
    lda #$03
    sta $5101          ; CHR mode 3
    lda #$02
    sta $5102          ; WRAM write enable (1/2)
    lda #$01
    sta $5103          ; WRAM write enable (2/2)
    lda #$00
    sta $5113          ; WRAM bank 0
    sta $5105          ; NT -> CIRAM page 0
    sta $5130
    sta failed
    lda #$FF
    sta frmval

    ; ---- palette (green) ----
    jsr set_palette

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

    ; ---- enable rendering + NMI ----
    bit $2002
    lda #$00
    sta $2005
    sta $2005
    lda #$80
    sta $2000
    lda #$0A
    sta $2001

; ---- main: bank-interleaved WRAM writes DURING active display ----
pass:
    lda frmval
    sta val0
    eor #$FF
    sta val1

    ; 48 chunks x 64B: bank0=V0 -> flip -> bank1=V1 -> flip -> ...
    lda #$00
    sta ptrlo
    lda #$60
    sta ptrhi
    lda #48
    sta chunks
@chunk:
    lda #$00
    sta $5113
    lda val0
    ldy #63
@wb0:
    sta (ptrlo),y
    dey
    bpl @wb0
    lda #$01
    sta $5113
    lda val1
    ldy #63
@wb1:
    sta (ptrlo),y
    dey
    bpl @wb1
    lda ptrlo
    clc
    adc #64
    sta ptrlo
    bcc @nc2
    inc ptrhi
@nc2:
    dec chunks
    bne @chunk

    ; verify both banks ($6000-$6BFF each)
    lda #$00
    sta $5113
    lda val0
    jsr verify_region
    lda #$01
    sta $5113
    lda val1
    jsr verify_region

    lda frmval
    eor #$FF
    sta frmval
    jmp pass

; A=expected ; verify $6000-$6BFF (12 pages) ; latch failed
verify_region:
    sta expect
    lda #$00
    sta ptrlo
    lda #$60
    sta ptrhi
    ldx #$0C
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

; --- NMI: refresh palette (green/red) in vblank ---
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

set_palette:
    bit $2002
    lda #$3F
    sta $2006
    lda #$00
    sta $2006
    lda #$0F
    sta $2007          ; backdrop black
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

.segment "VECTORS"
    .word nmi
    .word reset
    .word irq

.segment "CHR"
    .incbin "chr.bin"
