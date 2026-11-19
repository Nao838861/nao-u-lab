"""通路のタイルと光形状を合成し、cc65でmapper 5のROMを生成する。"""
import math
import shutil
import subprocess
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent
OUT = ROOT / 'build'
OUT.mkdir(exist_ok=True)
def canvas(w,h,color=0):
    img=Image.new('L',(w,h),color)
    return img,ImageDraw.Draw(img)

def tile(img,x,y):
    return img.crop((x,y,x+8,y+8)).tobytes()

def planar(pixels):
    return bytes(sum(((pixels[8*y+x] >> bit)&1) << (7-x) for x in range(8))
                 for bit in range(2) for y in range(8))

def stage():
    field,d=canvas(80,48,1)
    for x,y in [(0,2),(28,26),(60,10)]:
        d.line([(x,y),(x+14,y),(x+20,y+6),(x+20,y+17),(x+29,y+17)],fill=0)
        d.rectangle((x+3,y+4,x+13,y+8),fill=0)
        d.line((x+5,y+5,x+7,y+5),fill=2)
        d.point((x+11,y+5),fill=2)
    for y in [35,38,41]:
        d.line((4,y,20,y),fill=0)
        d.line((5,y+1,19,y+1),fill=2)
    wall,d=canvas(128,32,0)
    d.rectangle((0,2,127,23),fill=1)
    for x in range(-12,128,28):
        d.polygon([(x,3),(x+23,3),(x+23,13),(x+17,19),(x+4,19),(x,15)],fill=2)
        d.line((x+2,4,x+21,4),fill=3)
        d.line((x+4,16,x+14,16),fill=1)
        d.rectangle((x+3,6,x+4,7),fill=0)
    d.rectangle((0,22,127,27),fill=2)
    d.line((0,22,127,22),fill=3)
    for x in range(0,128,8):
        d.line((x,24,x+2,26),fill=1)
    for x in [19,87]:
        d.rectangle((x-13,0,x+13,24),fill=1)
        for r,c in [(15,0),(14,2),(12,3),(10,1),(8,0),(6,2),(3,1)]:
            d.ellipse((x-r,12-r,x+r,12+r),fill=c)
    d.line((0,31,127,31),fill=2)
    patterns=[]; ids=[]
    def index(data):
        if data not in patterns: patterns.append(data)
        return patterns.index(data)
    for y in range(0,48,8):
        for x in range(0,80,8): index(tile(field,x,y))
    repeat=len(patterns)
    floor=wall.transpose(Image.Transpose.FLIP_TOP_BOTTOM)
    for y in range(30):
        for x in range(32):
            if y<4: data=tile(wall,x%16*8,y*8)
            elif y>=26: data=tile(floor,x%16*8,(y-26)*8)
            else: data=tile(field,x%10*8,(y-4)%6*8)
            ids.append(index(data))
    assert len(patterns)<=256
    return patterns,repeat,bytes(ids)

def sprites():
    atlas=[]
    def art(rows):
        w=max(map(len,rows)); h=len(rows)
        img,d=canvas((w+7)//8*8,(h+7)//8*8)
        for y,row in enumerate(rows):
            for x,c in enumerate(row):
                if c!='.': d.point((x,y),int(c))
        for y in range(0,img.height,8):
            for x in range(0,img.width,8): atlas.append(planar(tile(img,x,y)))
    art(['.....31.................','....3331................','..1223331...2222........','...12233313322221.......','....122333322233311.....','..11113333333333333311..','112223311111222333333331','..33332222222222222211..','...111133333333111......','....1333222111..........','..133321................','..1111..................'])
    art(['.....22222......','...223333322....','..23333222221...','.2333222222211..','.23322111122221.','133221122112221.','133211233212221.','132211233212221.','132221122112221.','.12222111122221.','.1222222222221..','..12222222221...','...112222211....','.....11111......'])
    art(['..222...','.233321.','13333221','.122221.','..111...'])
    art(['.....222211.....','..1112333221....','.123322222221...','..122211122221..','...11233332221..','..1223331112221.','.123321222212221','1233212332212221','.12221122211221.','..122211112221..','...1122222221...','..12221112221...','.12211....1221..','1111.......1111.'])
    art(['...3....','1..2..1.','.12221..','..2332.1','1233322.','..2221..','.12.221.','1......1'])
    return b''.join(atlas).ljust(4096,b'\0')

def build():
    patterns,n,nt=stage()
    masks=[bytes(64)]
    def mask_id(data):
        if data not in masks: masks.append(data)
        return masks.index(data)
    tables=[]
    for shift in [0,4]:
        img,d=canvas(48,32)
        for x in range(40):
            offset=round(11*math.sin(x*math.pi/20))
            for y in [15+offset,15-offset]:
                d.line((x+shift,y-1,x+shift,y+1),fill=1)
        tables.append([mask_id(tile(img,x,y)) for y in range(0,32,8) for x in range(0,48,8)])
    diag=[mask_id(bytes(int(abs(y-(7-x if up else x))<=1) for y in range(8) for x in range(8))) for up in (False,True)]
    assert len(masks)<64
    banks=[]
    for i,m in enumerate(masks):
        tiles=patterns if i==0 else patterns[:n]
        banks.append(b''.join(planar(bytes(3 if light else p for p,light in zip(t,m))) for t in tiles).ljust(4096,b'\0'))
    size=1<<(len(banks)).bit_length()
    size=max(2,size)
    chrrom=b''.join(banks).ljust((size-1)*4096,b'\0')+sprites()
    def array(name,values):
        return 'static const unsigned char '+name+'[]={'+','.join(map(str,values))+'};\n'
    (OUT/'art.h').write_text(array('nametable',nt)+array('wave',sum(tables,[]))+array('diagonal',diag))
    (OUT/'coverage.bin').write_bytes(bytes(sum(1<<x for x in range(8) if m[y*8+x]) for m in masks for y in range(8)))
    (OUT/'sprite.inc').write_text(f'SPR_BANK = {size-1}\n')
    def run(*args): subprocess.run(args,cwd=ROOT,check=True)
    run('cc65','-t','none','-Oirs','-o','build/game.s','game.c')
    run('ca65','-t','none','build/game.s','-o','build/game.o')
    run('ca65','boot.s','-o','build/boot.o')
    lib=Path(shutil.which('ca65')).resolve().parents[1]/'lib/none.lib'
    run('ld65','-C','cart.cfg','-Ln','build/cart.lbl','-o','build/prg.bin','build/boot.o','build/game.o',str(lib))
    header=b'NES\x1a'+bytes([2,size//2,0x50,0])+bytes(8)
    (ROOT/'rtype-mmc5.nes').write_bytes(header+(OUT/'prg.bin').read_bytes()+chrrom)
    print(f'{n} corridor tiles, {len(patterns)} total, {len(masks)-1} laser masks, {size*4} KiB CHR')
if __name__=='__main__': build()

