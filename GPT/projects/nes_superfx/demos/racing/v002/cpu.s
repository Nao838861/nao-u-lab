.setcpu "6502"
.macpack longbranch
.export reset,nmi,sim_begin,sim_end,frame,updates,nmi_count,view,ground,drive_mode
.export displayed_view,displayed_ground,displayed_tick,render_tick,front,stage,gsu_clocks
.export audio_begin,audio_end,audio_ticks
audio_ticks=$0454
.export original_state,external_state,state_error,render_from_mmc5_state
.export desired_view,desired_ground,desired_mode,reset_request,physics_ticks,latest_state,present_ready
original_state=$0300
external_state=$0310
state_error=$0311
displayed_tick=$0312
snapshot=$0320
render_tick=snapshot+10
latest_state=$0380
pad=$0440
pad_previous=$0441
pad_edges=$0442
saved_window=$0443
physics_ticks=$0448
desired_view=$0450
desired_ground=$0451
desired_mode=$0452
reset_request=$0453
saved_banks=$0458
.segment "ZEROPAGE"
nmi_count:.res 2
updates:.res 2
view:.res 1
ground:.res 1
drive_mode:.res 1
displayed_view:.res 1
displayed_ground:.res 1
front:.res 1
stage:.res 1
gsu_clocks:.res 4
present_ready:.res 1
src:.res 2
dst:.res 2
left:.res 2
fillptr:.res 2
fillcount:.res 1
backhigh:.res 1
copy_sequence:.res 1
init_bank:.res 1
init_source_bank:.res 1
.segment "CODE"
reset:
  sei
  cld
  ldx #$ff
  txs
  lda #0
  sta $2000
  sta $2001
  sta $4010
  sta $4015
  lda #$40
  sta $4017
  lda #0
  tax
: sta $0000,x
  sta $0200,x
  sta $0300,x
  sta $0400,x
  inx
  bne :-
  bit $2002
: bit $2002
  bpl :-
: bit $2002
  bpl :-
  ldx #trampoline_end-trampoline-1
: lda trampoline,x
  sta $0700,x
  dex
  bpl :-
  lda #2
  sta desired_view
restart:
  lda #0
  sta $2000
  sta $4015
  sta audio_ticks
  sta audio_ticks+1
  sta $2001
  sta present_ready
  sta reset_request
  sta physics_ticks
  sta physics_ticks+1
  sta front
  sta $4ff3
  lda desired_mode
  sta drive_mode
  asl a
  asl a
  asl a
  asl a
  clc
  adc #$88
  sta init_source_bank
  lda #0
  sta init_bank
init_wram:
  lda init_bank
  sta $5113
  lda init_source_bank
  sta $5116
  lda #0
  sta src
  sta dst
  sta left
  lda #$c0
  sta src+1
  lda #$60
  sta dst+1
  lda #$20
  sta left+1
  jsr copy_data
  inc init_source_bank
  inc init_bank
  lda init_bank
  cmp #16
  bne init_wram
  lda #0
  sta $5113
  ldx drive_mode
  lda physics_lo,x
  sta src
  lda physics_hi,x
  sta src+1
  ldy #0
: lda (src),y
  sta $40,y
  iny
  cpy #192
  bne :-
  ; Original audio code/tables are already in the restored WRAM snapshot.
  lda drive_mode
  sta $18
  lda #$ed
  sta $5115
  jsr $b828
  lda #$a5
  sta $4ff0
  ldx #0
: dex
  bne :-
  lda #4
  sta $4fe1
  lda #1
  sta $4ff3
  lda drive_mode
  clc
  adc #$81
  sta $5116
  lda #0
  sta src
  sta dst
  sta left
  lda #$c0
  sta src+1
  lda #$60
  sta dst+1
  lda #$20
  sta left+1
  jsr copy_data
  lda #$83
  sta $5116
  ldx #1
texture_bank:
  lda #$c0
  sta src+1
  lda #0
  sta src
  stx $4fe1
  lda #$68
  sta dst+1
  jsr texture_chunk
  lda #$78
  sta dst+1
  jsr texture_chunk
  ldx $4fe1
  inx
  inx
  cpx #5
  bcc texture_bank
  lda #4
  sta $4fe1
  lda #$84
  sta $5115
  lda desired_view
  sta view
  jsr load_rows
  lda #$70
  sta $4834
  lda #1
  sta $4839
  lda #$a0
  sta $4837
  lda #$18
  sta $483a
  lda #$3f
  sta $2006
  lda #0
  sta $2006
  ldx #0
: lda palette,x
  sta $2007
  inx
  cpx #4
  bne :-
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
  sta $4fe0
  lda #1
  sta stage
  lda #$88
  sta $2000
  lda #$1e
  sta $2001
frame:
  lda reset_request
  jne restart
  lda desired_ground
  sta ground
  lda desired_view
  cmp view
  beq :+
  sta view
  jsr load_rows
: lda physics_ticks
  jeq frame
copy_latest:
  lda latest_state+10
  sta copy_sequence
  ldx #11
: lda latest_state,x
  sta original_state,x
  dex
  bpl :-
  lda latest_state+10
  cmp copy_sequence
  bne copy_latest
  lda ground
  sta $6000
  lda view
  sta $6006
  lda front
  eor #1
  asl a
  asl a
  asl a
  asl a
  sta $4838
  asl a
  asl a
  sta backhigh
  sta $6005
  lda #0
  sta $6004
  jsr render_from_mmc5_state
  jcs fail
  jsr clear_background
  lda #0
  sta $481e
  lda #$90
  sta $481f
  lda #2
  sta stage
poll:
  lda $4830
  and #$20
  bne poll
  lda $4830
  ldx #3
: lda $4fd0,x
  sta gsu_clocks,x
  dex
  bpl :-
  jsr hud
  lda #1
  sta present_ready
wait_present:
  lda present_ready
  bne wait_present
  jmp frame
fail:
  lda #$e1
  sta stage
: lda reset_request
  beq :-
  jmp restart

.include "../../ground/v003/state_bridge.inc"
texture_chunk:
  lda #0
  sta dst
  sta left
  lda #8
  sta left+1
  jmp copy_data
load_rows:
  lda #$83
  sta $5116
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
  sta $4fe8
  iny
  lda (fillptr),y
  clc
  adc backhigh
  sta $4fe9
  iny
  lda (fillptr),y
  sta $4fea
  iny
  lda (fillptr),y
  sta $4feb
  iny
  lda (fillptr),y
  sta $4fec
  iny
  lda (fillptr),y
  sta $4fed
  lda #1
  sta $4fee
: lda $4fef
  and #1
  bne :-
  clc
  lda fillptr
  adc #6
  sta fillptr
  bcc :+
  inc fillptr+1
: dec fillcount
  bne fill_command
  rts
hud:
  lda #$ff
  ldx #0
: sta $0200,x
  inx
  bne :-
  lda #'P'
  ldx ground
  beq :+
  lda #'T'
: sta $0201
  lda #'V'
  sta $0205
  lda view
  clc
  adc #'1'
  sta $0209
  lda #'G'
  ldx drive_mode
  beq :+
  lda #'D'
: sta $020d
  ldx #0
: lda #199
  sta $0200,x
  lda #0
  sta $0202,x
  txa
  asl a
  clc
  adc #8
  sta $0203,x
  inx
  inx
  inx
  inx
  cpx #16
  bne :-
  rts

nmi:
  pha
  txa
  pha
  tya
  pha
  inc nmi_count
  bne :+
  inc nmi_count+1
: lda present_ready
  beq no_present
  lda front
  eor #1
  sta front
  sta $4fe2
  lda view
  sta displayed_view
  lda ground
  sta displayed_ground
  lda render_tick
  sta displayed_tick
  lda render_tick+1
  sta displayed_tick+1
  lda #0
  sta $2003
  lda #2
  sta $4014
  inc updates
  bne :+
  inc updates+1
: lda #0
  sta present_ready
no_present:
  lda #1
  sta $4016
  lda #0
  sta $4016
  sta pad
  ldx #8
: lda $4016
  lsr a
  ror pad
  dex
  bne :-
  lda pad_previous
  eor #$ff
  and pad
  sta pad_edges
  lda pad
  sta pad_previous
  lda pad_edges
  and #4
  beq :+
  inc desired_view
  lda desired_view
  and #3
  sta desired_view
: lda pad_edges
  and #16
  beq :+
  lda desired_ground
  eor #1
  sta desired_ground
: lda pad_edges
  and #32
  beq :+
  lda desired_mode
  eor #1
  sta desired_mode
  lda #1
  sta reset_request
: lda pad_edges
  and #8
  beq :+
  lda #1
  sta reset_request
: ldx #63
save_render_zp:
  lda 0,x
  sta $0400,x
  dex
  bpl save_render_zp
  lda $4ff3
  sta saved_window
  lda #0
  sta $4ff3
  sta $5113
  ldx #2
: lda $5114,x
  sta saved_banks,x
  dex
  bpl :-
  lda pad
  sta $16
  lda #1
  sta $6740
  lda #0
  sta $6741
sim_begin:
  jsr $0700
sim_end:
  inc physics_ticks
  bne :+
  inc physics_ticks+1
: ldx #5
: lda $41,x
  sta latest_state,x
  dex
  bpl :-
  lda $48
  sta latest_state+6
  sta latest_state+8
  lda $49
  sta latest_state+7
  sta latest_state+9
  lda physics_ticks
  sta latest_state+10
  lda physics_ticks+1
  sta latest_state+11
  ldx #2
: lda saved_banks,x
  sta $5114,x
  dex
  bpl :-
  lda saved_window
  sta $4ff3
  ldx #63
: lda $0400,x
  sta 0,x
  dex
  bpl :-
  pla
  tay
  pla
  tax
  pla
  rti
irq:rti
trampoline:
  lda #$ff
  sta $5117
  jsr $f78a
  ; Legacy drift correction reads $68f3 from this exact camera calculation.
  ; Keep its numerical output, while only GSU output is actually displayed.
  lda #$f1
  sta $5115
  jsr $a000
  ; Native APU engine/tire driver, once per NMI, independent of GSU.
  lda desired_mode
  sta $18
audio_begin:
  jsr $ff00
audio_end:
  inc audio_ticks
  bne :+
  inc audio_ticks+1
: lda #$80
  sta $5117
  rts
trampoline_end:
.segment "RODATA"
palette:.byte $21,$1a,$00,$30
directions=$a000
cameras:.incbin "camera.bin"
physics_lo:.lobytes physics_grip,physics_drift
physics_hi:.hibytes physics_grip,physics_drift
physics_grip:.incbin "physics_grip.bin"
physics_drift:.incbin "physics_drift.bin"
rows_lo:.lobytes $d000,$d300,$d600,$d900
rows_hi:.hibytes $d000,$d300,$d600,$d900
fills_lo:.lobytes fills0,fills1,fills2,fills3
fills_hi:.hibytes fills0,fills1,fills2,fills3
fills0:.incbin "fills_0.bin"
fills1:.incbin "fills_1.bin"
fills2:.incbin "fills_2.bin"
fills3:.incbin "fills_3.bin"
.segment "VECTORS"
.word nmi,reset,irq
