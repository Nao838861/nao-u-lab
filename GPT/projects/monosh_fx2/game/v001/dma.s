.setcpu "65816"
.smart
.macpack longbranch
.export fx_plan_dma, fx_commit_dma, fx_dma_count, fx_dma_desc, fx_dma_bytes
.import _fx_packet, _fx_packet_count
.segment "ZEROPAGE"
packet_ptr: .res 2
.segment "BSS"
current_min: .res 32
current_max: .res 32
last_min: .res 32
last_max: .res 32
initialized: .res 2
fx_dma_count: .res 2
fx_dma_bytes: .res 2
fx_dma_desc: .res 128       ; VRAM word address、byte length。最大32本。
.segment "CODE"
.a16
.i16
fx_plan_dma:
  lda initialized
  bne :+
  ldx #30
  lda #$ffff
init_last:
  sta last_min,x
  dex
  dex
  bpl init_last
  inc initialized
:
  ldx #30
  lda #$ffff
clear_current:
  sta current_min,x
  stz current_max,x
  dex
  dex
  bpl clear_current
  lda #_fx_packet
  sta packet_ptr
  lda _fx_packet_count
  sta $01c0
object:
  lda $01c0
  jeq union
  ldy #0
  lda (packet_ptr),y
  sta $01c2
  lsr
  lsr
  lsr
  sta $01c4                 ; first column
  ldy #14
  lda (packet_ptr),y
  clc
  adc $01c2
  dec
  lsr
  lsr
  lsr
  sta $01c6                 ; last column
  ldy #2
  lda (packet_ptr),y
  sta $01c2
  lsr
  lsr
  lsr
  sta $01c8                 ; first tile row
  ldy #10
  lda (packet_ptr),y
  clc
  adc $01c2
  dec
  lsr
  lsr
  lsr
  sta $01ca                 ; last tile row
  ldx $01c4
  sep #$20
columns:
  lda $01c8
  cmp current_min,x
  bcs :+
  sta current_min,x
:
  lda $01ca
  cmp current_max,x
  bcc :+
  sta current_max,x
:
  inx
  cpx $01c6
  bcc columns
  beq columns
  rep #$20
  lda packet_ptr
  clc
  adc #20
  sta packet_ptr
  dec $01c0
  jmp object
union:
  stz fx_dma_count
  stz fx_dma_bytes
  stz $01c4                 ; column tile base in VRAM words
  stz $01c6                 ; descriptor offset
  ldx #0
scan:
  sep #$20
  lda current_min,x
  cmp last_min,x
  bcc :+
  lda last_min,x
:
  cmp #$ff
  beq no_column
  sta $01c8
  lda current_max,x
  cmp last_max,x
  bcs :+
  lda last_max,x
:
  sta $01ca
  rep #$20
  lda $01c8
  and #$ff
  asl
  asl
  asl
  clc
  adc $01c4
  ldy $01c6
  sta fx_dma_desc,y
  lda $01ca
  and #$ff
  sec
  sbc $01c8
  inc
  asl
  asl
  asl
  asl
  sta fx_dma_desc+2,y
  clc
  adc fx_dma_bytes
  sta fx_dma_bytes
  inc fx_dma_count
  iny
  iny
  iny
  iny
  sty $01c6
no_column:
  rep #$20
  lda $01c4
  clc
  adc #192                 ; 一列24 tiles ×8 words
  sta $01c4
  inx
  cpx #32
  bne scan
  ; 多数の細切れDMAより全FBの方が安い場合には一本へまとめる。
  lda fx_dma_count
  asl
  asl
  asl
  asl
  asl
  asl
  clc
  adc fx_dma_bytes
  cmp #12000
  bcc complete
  lda #1
  sta fx_dma_count
  stz fx_dma_desc
  lda #$3000
  sta fx_dma_desc+2
  sta fx_dma_bytes
complete:
  rts
fx_commit_dma:
  ldx #30
copy:
  lda current_min,x
  sta last_min,x
  lda current_max,x
  sta last_max,x
  dex
  dex
  bpl copy
  rts
