"""各姿勢の差分を6502の短い転送列にしてPRG ROMから直接実行する。"""
from itertools import groupby

def by_column(cells):
    return groupby(sorted(cells),key=lambda key:key[0])

def visible(code,col):
    # X = rightmost resident world column. All tail columns are to the right
    # of the camera even at its final position; later columns can return early.
    code.extend((0xe0,col,0xb0,1,0x60))  # CPX #col / BCS +1 / RTS

def attribute_program(old,frame,base):
    code=bytearray()
    for draw,cells in ((False,old.keys()-frame.keys()),(True,frame)):
        for col,group in by_column(cells):
            # Restoration and painting have separate sorted runs, so a clipped
            # group skips to the next one instead of returning from both.
            chunk=bytearray()
            for c,r in group:
                value=128 if draw or base(c,r)[1] else 0
                address=0x6400+r*32+c%32
                chunk.extend((0xa9,value,0x8d,address&255,address>>8))
            code.extend((0xe0,col,0x90,len(chunk)))
            code.extend(chunk)
    return code+b'\x60'

def transfer(cells,old):
    code=bytearray()
    for c,group in by_column(cells):
        visible(code,c)
        for key in group:
            _,r=key
            slot,attr=cells[key]
            addr=0x2000+r*32+c%32
            writes=((addr>>8,0x2006),(addr&255,0x2006),(slot,0x2007),(attr,addr+0x3c00))
            # Y holds the freshly streamed column. A stationary tile only
            # needs repainting when that column first appears on the right.
            if old.get(key)==cells[key]:code.extend((0xc0,c,0xd0,20))
            for value,dest in writes:
                code.extend((0xa9,value,0x8d,dest&255,dest>>8))
    return code+b'\x60'

def programs(frames,base):
    rom=bytearray(0x700)
    for i,frame in enumerate(frames):
        old=frames[i-1]
        removed={cell:base(*cell) for cell in old.keys()-frame.keys()}
        routines=(attribute_program(old,frame,base),transfer(removed,{}),transfer(frame,old))
        size=sum(map(len,routines))
        if len(rom)%8192+size>8192:rom.extend(bytes(8192-len(rom)%8192))
        rom[i]=0x80+len(rom)//8192
        for j,routine in enumerate(routines):
            addr=0xa000+len(rom)%8192
            rom[(2*j+1)*256+i]=addr&255
            rom[(2*j+2)*256+i]=addr>>8
            rom.extend(routine)
    assert len(rom)<=224*1024
    return bytes(rom)
