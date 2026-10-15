.setcpu "6502"
.macpack longbranch
.export phase,displayed_phase,ground,displayed_ground,view,displayed_view,paused
.export updates,nmi_count,stage,missed,render_fields,front,gsu_clocks,switches
.export queue_overflow
.segment "HEADER"
.byte "NES",$1a,2,1,1,0
.res 8,0
.segment "ZEROPAGE"
phase:.res 1
displayed_phase:.res 1
ground:.res 1
displayed_ground:.res 1
view:.res 1
displayed_view:.res 1
paused:.res 1
updates:.res 2
nmi_count:.res 2
stage:.res 1
missed:.res 2
render_fields:.res 1
front:.res 1
gsu_clocks:.res 4
switches:.res 2
src:.res 2
dst:.res 2
left:.res 2
seen:.res 1
target:.res 1
started:.res 1
buttons:.res 1
previous:.res 1
pending:.res 1
edges:.res 1
event_queue:.res 8
queue_read:.res 1
queue_write:.res 1
queue_overflow:.res 1
fillptr:.res 2
fillcount:.res 1
backhigh:.res 1
clock_mhz:.res 1
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
  sta 0,x
  inx
  bne clear_zp
  bit $2002
v1:bit $2002
  bpl v1
v2:bit $2002
  bpl v2
  lda $5ff2
  cmp #2
  jne fail
  lda #$a5
  sta $5ff0
  ldx #0
delay:dex
  bne delay
  lda $5fe6
  sta clock_mhz
  lda #4
  sta $5fe1
  lda #<payload
  sta src
  lda #>payload
  sta src+1
  lda #0
  sta dst
  sta left
  lda #$60
  sta dst+1
  lda #$20
  sta left+1
  jsr copy_data
  ; Identical 4KiB texture in the two non-displayed 2KiB chunks of each bank.
  ldx #1
texture_bank:
  stx $5fe1
  lda #<texture
  sta src
  lda #>texture
  sta src+1
  lda #$68
  sta dst+1
  jsr texture_chunk
  lda #$78
  sta dst+1
  jsr texture_chunk
  ldx $5fe1
  inx
  inx
  cpx #5
  bcc texture_bank
  lda #4
  sta $5fe1
  lda #2
  sta view
  jsr load_rows
  lda #$70
  sta $5034
  lda #1
  sta $5039
  lda #$a0
  sta $5037
  lda #$18
  sta $503a
  lda #$3f
  sta $2006
  lda #0
  sta $2006
  ldx #0
palette_loop:
  lda palette,x
  sta $2007
  inx
  cpx #4
  bne palette_loop
  lda #$3f
  sta $2006
  lda #$11
  sta $2006
  lda #$30
  sta $2007
  lda #0
  sta $2005
  sta $2005
  lda #4
  sta $5fe0
  lda $5fe0
  cmp #4
  jne fail
  lda #$88
  sta $2000
  lda #$1e
  sta $2001
  jsr wait_nmi
  lda nmi_count
  sta target
frame:
  lda #0
  sta edges
consume_events:
  ldx queue_read
  cpx queue_write
  beq events_ready
  txa
  and #7
  tax
  lda event_queue,x
  ora edges
  sta edges
  inc queue_read
  jmp events_ready
events_ready:
  lda edges
  and #$80
  beq no_ground_change
  lda ground
  eor #1
  sta ground
  inc switches
  bne no_ground_change
  inc switches+1
no_ground_change:
  lda edges
  and #$40
  beq no_pause_change
  lda paused
  eor #1
  sta paused
no_pause_change:
  lda edges
  and #$20
  beq no_view_change
  inc view
  lda view
  and #3
  sta view
  jsr load_rows
no_view_change:
  lda paused
  beq no_step
  lda edges
  and #2
  beq :+
  dec phase
: lda edges
  and #1
  beq :+
  inc phase
: lda phase
  and #63
  sta phase
no_step:
  lda #1
  sta stage
  lda ground
  sta $6000
  lda phase
  sta $6002
  lda front
  eor #1
  asl
  asl
  asl
  asl
  sta $5038
  asl
  asl
  sta backhigh
  sta $6005
  lda #0
  sta $6004
  lda view
  sta $6006
  jsr prepare_pose
  lda nmi_count
  sta started
  jsr clear_background
  lda #<$9000
  sta $501e
  lda #>$9000
  sta $501f
poll:
  lda $5030
  and #$20
  bne poll
  lda $5030
  ldx #3
read_timing:
  lda $5fd0,x
  sta gsu_clocks,x
  dex
  bpl read_timing
  lda nmi_count
  sec
  sbc started
  sta render_fields
  lda #2
  sta stage
  jsr hud
  clc
  lda target
  adc #2
  sta target
wait_present:
  jsr wait_nmi
  lda nmi_count
  sec
  sbc target
  bmi wait_present
  beq present
  inc missed
  bne :+
  inc missed+1
: lda nmi_count
  sta target
present:
  lda front
  eor #1
  sta front
  sta $5fe2
  lda phase
  sta displayed_phase
  lda ground
  sta displayed_ground
  lda view
  sta displayed_view
  lda #0
  sta $2003
  lda #2
  sta $4014
  inc updates
  bne :+
  inc updates+1
: lda paused
  jne frame
  inc phase
  lda phase
  and #63
  sta phase
  jmp frame

texture_chunk:
  lda #0
  sta dst
  sta left
  lda #8
  sta left+1
  jmp copy_data
load_rows:
  ldx view
  lda rows_lo,x
  sta src
  lda rows_hi,x
  sta src+1
  lda #0
  sta dst
  sta left
  lda #$6c
  sta dst+1
  lda #3
  sta left+1
  jmp copy_data
prepare_pose:
  ldx view
  lda poses_lo,x
  sta src
  lda poses_hi,x
  sta src+1
  ldx phase
  beq pose_address
pose_offset:
  clc
  lda src
  adc #22
  sta src
  bcc :+
  inc src+1
: dex
  bne pose_offset
pose_address:
  lda #$08
  sta dst
  lda #$60
  sta dst+1
  lda #22
  sta left
  lda #0
  sta left+1
  jmp copy_data
clear_background:
  ldx view
  lda fills_lo,x
  sta fillptr
  lda fills_hi,x
  sta fillptr+1
  ldy #0
  lda (fillptr),y
  sta fillcount
  inc fillptr
  bne fill_command
  inc fillptr+1
fill_command:
  ldy #0
  lda (fillptr),y
  sta $5fe8
  iny
  lda (fillptr),y
  clc
  adc backhigh
  sta $5fe9
  iny
  lda (fillptr),y
  sta $5fea
  iny
  lda (fillptr),y
  sta $5feb
  iny
  lda (fillptr),y
  sta $5fec
  iny
  lda (fillptr),y
  sta $5fed
  lda #1
  sta $5fee
fill_busy:
  lda $5fef
  and #1
  bne fill_busy
  clc
  lda fillptr
  adc #6
  sta fillptr
  bcc :+
  inc fillptr+1
: dec fillcount
  bne fill_command
  rts
copy_data:
  ldy #0
  lda (src),y
  sta (dst),y
  inc src
  bne :+
  inc src+1
: inc dst
  bne :+
  inc dst+1
: lda left
  bne :+
  dec left+1
: dec left
  lda left
  ora left+1
  bne copy_data
  rts
hud:
  lda #$ff
  ldx #0
hide_oam:
  sta $0200,x
  inx
  bne hide_oam
  ldx #0
hud_copy:
  lda hud_template,x
  sta $0200,x
  inx
  cpx #48
  bne hud_copy
  lda #'P'
  ldx ground
  beq :+
  lda #'T'
: sta $0201
  lda view
  clc
  adc #'1'
  sta $0211
  lda #'2'
  ldx clock_mhz
  cpx #50
  bne :+
  lda #'5'
: sta $021d
  lda #'5'
  cpx #50
  bne :+
  lda #'0'
: sta $0221
  lda render_fields
  cmp #9
  bcc :+
  lda #9
: clc
  adc #'0'
  sta $022d
  rts
wait_nmi:
  lda nmi_count
  sta seen
wait:
  lda nmi_count
  cmp seen
  beq wait
  rts
fail:
  lda #$e1
  sta stage
failed:jmp failed
nmi:
  pha
  txa
  pha
  inc nmi_count
  bne :+
  inc nmi_count+1
: lda #1
  sta $4016
  lda #0
  sta $4016
  sta buttons
  ldx #8
read_pad:
  lda $4016
  lsr
  rol buttons
  dex
  bne read_pad
  lda buttons
  eor previous
  and buttons
  sta pending
  beq no_pad_edge
  lda queue_write
  sec
  sbc queue_read
  cmp #8
  bcc enqueue_edge
  inc queue_overflow
  jmp no_pad_edge
enqueue_edge:
  lda queue_write
  and #7
  tax
  lda pending
  sta event_queue,x
  inc queue_write
no_pad_edge:
  lda buttons
  sta previous
  pla
  tax
  pla
  rti
irq:rti
.segment "RODATA"
palette:.byte $21,$1a,$00,$30
hud_template:
.byte 199,'P',0,8, 199,' ',0,16, 199,'V',0,24, 199,'=',0,32, 199,'3',0,40
.byte 211,'C',0,8, 211,'=',0,16, 211,'5',0,24, 211,'0',0,32
.byte 211,'F',0,80, 211,'=',0,88, 211,'0',0,96
.include "tables.inc"
texture:.incbin "texture.bin"
payload:.incbin "payload.bin"
.segment "VECTORS"
.addr nmi,reset,irq
.segment "CHR"
.incbin "hud.chr"
