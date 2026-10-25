.setcpu "6502"
.segment "CODE"
.ifndef CAMERA_INPUT
CAMERA_INPUT = $6000
.endif
; Signed even world distances in Q7, with low byte zero.
; Preserve the state_bridge product ABI at0356..0359.
lda #0
sta $0356
sta $0357
sta $0358
sta $0359
lda $035c
sta $0355
bpl positive
eor #$ff
clc
adc #1
positive:
sta $0354
beq done
lda CAMERA_INPUT,x
sta $0350
lda CAMERA_INPUT+1,x
sta $0351
loop:
lsr $0354
bcc noadd
clc
lda $0357
adc $0350
sta $0357
lda $0358
adc $0351
sta $0358
noadd:
asl $0350
rol $0351
lda $0354
bne loop
lda $0355
bpl extend
sec
lda #0
sbc $0357
sta $0357
lda #0
sbc $0358
sta $0358
extend:
lda $0358
bpl done
lda #$ff
sta $0359
done:
rts
