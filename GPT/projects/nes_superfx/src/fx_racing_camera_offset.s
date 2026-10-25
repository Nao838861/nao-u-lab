.setcpu "6502"
.segment "CODE"
.ifndef CAMERA_INPUT
CAMERA_INPUT = $6000
.endif
; Back distances are non-negative even world units, Q7 (low byte zero).
; floor(backQ7 * signedQ8 / 256) = signedQ8 * backQ7.high.
; Use a small general multiply instead of the previous hardcoded 5/9/13.
; Output keeps the state_bridge ABI: product at0356..0359.
lda #0
sta $0356
sta $0357
sta $0358
sta $0359
lda $035c
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
lda $0358
bpl done
lda #$ff
sta $0359
done:
rts
