; SPDX-License-Identifier: GPL-3.0-or-later
.setcpu "6502"
.macpack longbranch
.export phase, displayed_phase, updates, nmi_count, stage, idle
.segment "HEADER"
.byte "NES",$1a,2,1,1,0
.res 8,0
.segment "ZEROPAGE"
phase: .res 1
displayed_phase: .res 1
updates: .res 2
nmi_count: .res 1
stage: .res 1
src: .res 2
dst: .res 2
matrix_ptr: .res 2
row: .res 1
column: .res 1
pair: .res 1
bits_a: .res 1
bits_b: .res 1
bits_c: .res 1
bits_d: .res 1
tile: .res 1
copy_src: .res 2
copy_dst: .res 2
front: .res 1
chunks: .res 1
seen: .res 1
limit: .res 2
.segment "CODE"
reset:
  sei
  cld
  ldx #$ff
  txs
  inx
  stx $2000
  stx $2001
  stx $4010
  lda #$40
  sta $4017
  lda #0
  sta $4015
  txa
clear_zp:
  sta $00,x
  inx
  bne clear_zp
  bit $2002
v1: bit $2002
  bpl v1
v2: bit $2002
  bpl v2
  lda $5ff1
  cmp #$53
  jne missing
  lda $5ff2
  cmp #1
  jne missing
  lda #$a5
  sta $5ff0
  ldx #0
delay: dex
  bne delay
  lda #0
  sta $5034
  sta $5039
  sta $5038
  lda #$80
  sta $5037
  lda #$18
  sta $503a
  ldx #0
upload:
  lda gsu_program,x
  sta $5100,x
  lda gsu_program+$100,x
  sta $5200,x
  inx
  bne upload
  ldx #0
vertices:
  lda model,x
  sta $7000,x
  inx
  cpx #48
  bne vertices
  ldx #0
edges:
  lda edge_data,x
  sta $7300,x
  inx
  cpx #72
  bne edges
  ; Both physical nametables have the same fixed header/footer, blank viewport.
  lda #$20
  sta copy_dst+1
init_page:
  bit $2002
  lda copy_dst+1
  sta $2006
  lda #0
  sta $2006
  ldx #4
  ldy #0
  lda #0
clear_nt:
  sta $2007
  iny
  bne clear_nt
  dex
  bne clear_nt
  bit $2002
  lda copy_dst+1
  sta $2006
  lda #0
  sta $2006
  ldx #0
header:
  lda header_tiles,x
  sta $2007
  inx
  cpx #128
  bne header
  lda copy_dst+1
  cmp #$24
  beq init_done
  lda #$24
  sta copy_dst+1
  bne init_page
init_done:
  bit $2002
  lda #$3f
  sta $2006
  lda #0
  sta $2006
  lda #$0f
  sta $2007
  lda #$12
  sta $2007
  lda #$2c
  sta $2007
  lda #$30
  sta $2007
  lda #0
  sta $2005
  sta $2005
  lda #$80
  sta $2000
  lda #$0a
  sta $2001
idle:
  lda #1
  sta stage
  ; Matrix selection is CPU-side; all vertex multiplies and line drawing are GSU.
  ldx phase
  lda matrix_low,x
  sta matrix_ptr
  lda matrix_high,x
  sta matrix_ptr+1
  ldy #0
copy_matrix:
  lda (matrix_ptr),y
  sta $7200,y
  iny
  cpy #12
  bne copy_matrix
  lda #0
  sta $501e
  sta $501f
  sta limit
  sta limit+1
poll:
  inc limit
  bne :+
  inc limit+1
  jeq timeout
: lda $5030
  and #$20
  bne poll
  lda $5030
  lda #2
  sta stage
  ; Convert 2x2 logical pixels to one fixed CHR tile (4x enlargement).
  lda #0
  sta row
  sta dst
  lda #3
  sta dst+1
pack_row:
  lda row
  asl
  sta src
  lda #$60
  sta src+1
  lda #8
  sta column
pack_column:
  ldy #0
  lda (src),y
  sta bits_a
  iny
  lda (src),y
  sta bits_b
  iny
  lda (src),y
  sta bits_c
  iny
  lda (src),y
  sta bits_d
  lda #4
  sta pair
pack_pair:
  ldx bits_a
  lda top0,x
  ldx bits_b
  ora top1,x
  ldx bits_c
  ora bottom0,x
  ldx bits_d
  ora bottom1,x
  ldy #0
  sta (dst),y
  inc dst
  bne :+
  inc dst+1
: asl bits_a
  asl bits_a
  asl bits_b
  asl bits_b
  asl bits_c
  asl bits_c
  asl bits_d
  asl bits_d
  dec pair
  bne pack_pair
  inc src+1
  dec column
  bne pack_column
  inc row
  inc row
  lda row
  cmp #48
  bne pack_row
  lda #3
  sta stage
  lda #0
  sta copy_src
  lda #3
  sta copy_src+1
  lda front
  eor #1
  asl
  asl
  ora #$20
  sta copy_dst+1
  lda #$80
  sta copy_dst
  lda #6
  sta chunks
transfer:
  jsr wait_nmi
  bit $2002
  lda copy_dst+1
  sta $2006
  lda copy_dst
  sta $2006
  ldy #0
copy128:
  lda (copy_src),y
  sta $2007
  iny
  bpl copy128
  clc
  lda copy_src
  adc #128
  sta copy_src
  bcc :+
  inc copy_src+1
: clc
  lda copy_dst
  adc #128
  sta copy_dst
  bcc :+
  inc copy_dst+1
: dec chunks
  bne keep_front
  lda front
  eor #1
  sta front
  lda phase
  sta displayed_phase
  inc updates
  bne :+
  inc updates+1
: inc phase
  lda phase
  and #63
  sta phase
keep_front:
  lda front
  ora #$80
  sta $2000
  lda #0
  sta $2005
  sta $2005
  lda chunks
  bne transfer
  jmp idle
wait_nmi:
  lda nmi_count
  sta seen
wait:
  lda nmi_count
  cmp seen
  beq wait
  rts
missing:
  lda #$e1
  bne fail
timeout:
  lda #$e2
fail:
  sta stage
  lda #0
  sta $2000
  sta $2001
  bit $2002
  lda #$3f
  sta $2006
  lda #0
  sta $2006
  lda #$16
  sta $2007
forever: jmp forever
nmi:
  inc nmi_count
  rti
irq: rti
.segment "RODATA"
gsu_program: .incbin "gsu.bin"
model: .incbin "model.bin"
edge_data: .incbin "edges.bin"
header_tiles: .incbin "header.bin"
top0: .incbin "top0.bin"
top1: .incbin "top1.bin"
bottom0: .incbin "bottom0.bin"
bottom1: .incbin "bottom1.bin"
.include "matrices.inc"
.segment "VECTORS"
.addr nmi,reset,irq
.segment "CHR"
.incbin "mosaic.chr"
