"""通常LAPを背景へ置く表示試作。GO/BAD LAP等の状態切替は未実装。"""
from pathlib import Path
import sys,json,importlib.util,concurrent.futures
from PIL import Image,ImageChops
OUT=Path(__file__).resolve().parent;WORK=OUT.parents[2];REPO=WORK/'.tmp/MMC5Racing'
TEMP=REPO/'build/bg-capacity';sys.path.insert(0,str(REPO/'direct-runtime/minimap'))
from allocation import BANKS
from hud_b2 import label
spec=importlib.util.spec_from_file_location('scroll_proof',REPO/'direct-runtime/minimap/verify_scroll.py')
scroll=importlib.util.module_from_spec(spec);spec.loader.exec_module(scroll)
# This is a normal-LAP display fixture, not a GO/BAD LAP behavior test.
source=(REPO/'direct-runtime/minimap/verify_scroll.py').read_text(encoding='utf-8')
source=source.replace('wr(0x6726,600,3);wr(0x6729,600,3)',
    'wr(0x6756,0);wr(0x676c,0);wr(0x6721,0);wr(0x6726,600,3);wr(0x6729,600,3)')
exec(compile(source,str(spec.origin),'exec'),scroll.__dict__)
rom=bytearray((TEMP/'HudB2_Repacked.nes').read_bytes())
manifest=json.loads((OUT/'build-manifest.json').read_text())
free=[i for i in manifest['allocation']['safe'] if i not in manifest['chr_tiles']][:3]
assert len(free)==3
raster=label('LAP',16,top=2)
for fine,bank in enumerate(BANKS):
    for tx,tile in enumerate(free):
        def pixel(x,y):
            sx=tx*8+x-fine
            return raster[y][sx] if 0<=sx<16 else 3
        data=bytes(sum(((pixel(x,y)>>plane)&1)<<(7-x) for x in range(8)) for plane in (0,1) for y in range(8))
        at=16+1048576+bank*4096+tile*16;rom[at:at+16]=data
# Existing init has 27 stores then RTS. Append three stores for (168,56).
at=16+108*8192+(0xd400&8191)+135
assert rom[at:at+16]==b'\x60'+bytes([255])*15
code=bytearray()
for tx,tile in enumerate(free):
    addr=0x5c00+3*32+21+tx
    code+=bytes([0xa9,tile,0x8d,addr&255,addr>>8])
rom[at:at+16]=code+b'\x60'
# Hide LAP sprite ink. Production must switch BG for GO/BAD LAP/GOAL.
for tile in (129,131):
    at=16+1048576+506*1024+((tile&254)*16&1023);rom[at:at+32]=bytes(32)
target=TEMP/'LapBG_ProofOnly.nes';target.write_bytes(rom)
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
    jobs=[pool.submit(scroll.run,rom,WORK/'.tmp/Mesen/Mesen.exe',TEMP/f'{mode}-{kind}',mode)
          for mode in ('drift','grip') for kind,rom in
          (('proof-scroll',target),('proof-baseline',TEMP/'HudB2_Repacked.nes'))]
    for job in jobs:job.result()
count=0
for mode in ('drift','grip'):
    for path in (TEMP/f'{mode}-proof-scroll').glob('*.png'):
        im=Image.open(path).convert('RGB')
        before=Image.open(TEMP/f'{mode}-proof-baseline'/path.name).convert('RGB')
        delta=ImageChops.difference(im,before);delta.paste((0,0,0),(168,55,192,64))
        assert not delta.getbbox(),path
        for y,row in enumerate(raster):
            for x,ink in enumerate(row):
                assert im.getpixel((168+x,55+y))==((102,102,102) if ink==1 else (0,0,0)),(path,x,y)
        count+=1
    (OUT/f'lap-bg-{mode}.png').write_bytes((TEMP/f'{mode}-proof-scroll/64-8.png').read_bytes())
(OUT/'lap-proof.json').write_text(json.dumps(dict(tiles=free,screens=count,fine_x=list(range(8)),outside_lap_exact=True,scope='通常LAPのみ。GO/BAD LAP/GOAL切替は未対応。'),ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('LAP BG proof passed:',count,'screens; tiles',free)
