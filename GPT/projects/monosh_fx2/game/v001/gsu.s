.include "casfx.inc"
.segment "GSU"
.export render_entry, render_stop
.export packed_one, packed_half, packed_quarter
.align 16
render_entry:
  cache
  sub r0
  cmode
  iwt r1,#$2000
  iwt r12,#$1800
  iwt r13,#.loword(clear_loop)
clear_loop:
  stw (r1)
  inc r1
  loop
  inc r1
  iwt r11,#$0000
  ldw (r11)
  iwt r11,#$0004
  stw (r11)
  iwt r0,#$0020
  iwt r11,#$0006
  stw (r11)
dispatch:
  iwt r11,#$0004
  ldw (r11)
  ibt r8,#0
  cmp r8
  bne dispatch_nonzero
  nop
  iwt r11,#.loword(finished)
  jmp (r11)
  nop
dispatch_nonzero:
  dec r0
  stw (r11)
  iwt r11,#$0006
  ldw (r11)
  move r11,r0
  to r1
  ldw (r11)
  inc r11
  inc r11
  to r2
  ldw (r11)
  inc r11
  inc r11
  to r3
  ldw (r11)
  inc r11
  inc r11
  to r4
  ldw (r11)
  inc r11
  inc r11
  to r5
  ldw (r11)
  inc r11
  inc r11
  to r6
  ldw (r11)
  inc r11
  inc r11
  to r7
  ldw (r11)
  inc r11
  inc r11
  to r9
  ldw (r11)
  inc r11
  inc r11
  to r10
  ldw (r11)
  inc r11
  inc r11
  ldw (r11)
  romb
  inc r11
  inc r11
  iwt r8,#$0006
  from r11
  stw (r8)
  cache
  ; 整数の水平stepと4texel境界のclipなら、同じ画素をpackedで読む。
  iwt r8,#$03ff
  from r10
  and r8
  bne generic
  nop
  iwt r0,#$0100
  from r3
  cmp r0
  beq packed_one_check
  nop
  iwt r0,#$0200
  from r3
  cmp r0
  beq packed_half_check
  nop
  iwt r0,#$0400
  from r3
  cmp r0
  beq packed_quarter_jump
  nop
generic:
  iwt r13,#.loword(pixel)
row:
  move r1,r5
  move r8,r10
  move r12,r9
pixel:
  merge r14
  with r8
  add r3
  getc
  loop
  plot
  with r7
  add r4
  dec r6
  bne row
  inc r2
  rpix
  iwt r11,#.loword(dispatch)
  jmp (r11)
  nop
packed_one_check:
  ibt r8,#3
  from r9
  and r8
  bne generic
  nop
  iwt r11,#.loword(packed_one)
  jmp (r11)
  nop
packed_half_check:
  ibt r8,#1
  from r9
  and r8
  bne generic
  nop
  iwt r11,#.loword(packed_half)
  jmp (r11)
  nop
packed_quarter_jump:
  iwt r11,#.loword(packed_quarter)
  jmp (r11)
  nop
.macro PACKED_GAME name, shift
  .local packed_row, packed_pixels
name:
  from r10
  .repeat 10
    lsr
  .endrepeat
  iwt r8,#128
  to r10
  add r8
  iwt r8,#$ff00
  .if shift < 2
    from r9
    .repeat 2-shift
      lsr
    .endrepeat
    move r9,r0
  .endif
  cache
  iwt r13,#.loword(packed_pixels)
packed_row:
  from r7
  and r8
  to r14
  or r10
  move r1,r5
  move r12,r9
packed_pixels:
  getb
  inc r14
  .repeat (4>>shift), I
    color
    .if I = (4>>shift)-1
      loop
      plot
    .else
      plot
      .repeat (2<<shift)
        lsr
      .endrepeat
    .endif
  .endrepeat
  with r7
  add r4
  dec r6
  bne packed_row
  inc r2
  rpix
  iwt r11,#.loword(dispatch)
  jmp (r11)
  nop
.endmacro
PACKED_GAME packed_one,0
PACKED_GAME packed_half,1
PACKED_GAME packed_quarter,2
finished:
  rpix
  iwt r11,#$0000
  ldw (r11)
render_stop:
  stop
  nop
.repeat 22,I
  .segment .sprintf("ASSET%02X",$44+I)
  .incbin .sprintf("assets/bank%02x.bin",$44+I)
.endrepeat
