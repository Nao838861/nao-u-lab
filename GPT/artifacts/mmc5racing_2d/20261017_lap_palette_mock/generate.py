"""現在のROMを基に、専用パレット2組×置換色3個の実画面モックを生成する。"""
from pathlib import Path
import concurrent.futures, hashlib, importlib.util, json, os, subprocess
from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).resolve().parent
WORK = OUT.parents[2]
REPO = WORK / '.tmp/MMC5Racing'
TEMP = REPO / 'build/lap-palette-mock'
TEMP.mkdir(parents=True, exist_ok=True)
BASE = REPO / 'releases/MMC5Racing_HudB2_136x184.nes'
MESEN = WORK / '.tmp/Mesen/Mesen.exe'
spec = importlib.util.spec_from_file_location('car_style', REPO/'direct-runtime/car-style/build.py')
car = importlib.util.module_from_spec(spec)
spec.loader.exec_module(car)
FONT = ImageFont.truetype('C:/Windows/Fonts/meiryo.ttc', 18)
SMALL = ImageFont.truetype('C:/Windows/Fonts/meiryo.ttc', 14)
RGB = {0x00:(102,102,102), 0x0f:(0,0,0), 0x30:(255,254,255),
       0x16:(181,49,32), 0x1a:(12,147,0), 0x3c:(181,235,242), 0x11:(21,95,217)}
CASES = [('current',None,None,'現在：変更なし')]
for p, names in ((0,('白い車体','黒いタイヤ・影','緑の差し色')),
                 (1,('水色の車体','黒いタイヤ・影','青い差し色'))):
    for index, name in enumerate(names,1):
        CASES.append((f'{"A" if p==0 else "B"}{index}',p,index,f'{name} → 灰色'))

def make_rom(case):
    name,p,index,_=case
    rom=bytearray(BASE.read_bytes())
    at=16+109*8192+0xcc
    assert rom[at:at+16]==b''.join(bytes((9,*v)) for v in car.PALETTE)
    if p is not None:
        rom[at+4*p+index]=0 # NES $00: same gray as TIME/TOTAL
        for slot in (55,16):
            attr=16+109*8192+0xdc+4*slot+2
            rom[attr]=(rom[attr]&0xfc)|p
        # Only the two LAP patterns change ink; numbers, slash and GO stay intact.
        for tile in (129,131):
            ptr=16+1048576+506*1024+((tile&254)*16&1023)
            rows=car.decode(rom[ptr:ptr+32])
            assert set(v for row in rows for v in row)<={0,3}
            rom[ptr:ptr+32]=car.encode([[index if v else 0 for v in row] for row in rows])
    target=TEMP/f'{name}.nes'
    target.write_bytes(rom)
    return target

def native(case,mode):
    name,p,index,_=case
    folder=TEMP/f'{name}-{mode}'
    folder.mkdir(exist_ok=True)
    lua='''local out=OUT local frame=0
emu.addEventCallback(function()
 local k={}
 if GRIP and frame>=100 and frame<104 then k.down=true end
 if frame>=110 and frame<114 then k.a=true end
 emu.setInput(k,0)
end,emu.eventType.inputPolled)
emu.addEventCallback(function()
 frame=frame+1
 if frame==450 then
  local f=assert(io.open(out..'/screen.png','wb')); f:write(emu.takeScreenshot());f:close()
  f=assert(io.open(out..'/palette.bin','wb'))
  for i=0,31 do f:write(string.char(emu.read(0x3f00+i,emu.memType.nesPpuMemory))) end;f:close()
  f=assert(io.open(out..'/oam.bin','wb'))
  for i=0,255 do f:write(string.char(emu.read(i,emu.memType.nesSpriteRam))) end;f:close()
  f=assert(io.open(out..'/mode.txt','w'));f:write(emu.read(0x674d,emu.memType.nesMemory));f:close()
  emu.stop(0)
 end
end,emu.eventType.endFrame)
'''.replace('OUT',json.dumps(folder.as_posix())).replace('GRIP',str(mode=='grip').lower())
    script=folder/'capture.lua';script.write_text(lua)
    run=subprocess.run([str(MESEN),'--testRunner','--timeout=60',
        '--debug.scriptWindow.allowIoOsAccess=true',str(TEMP/f'{name}.nes'),str(script)],
        cwd=folder,capture_output=True,timeout=70,creationflags=subprocess.CREATE_NO_WINDOW)
    assert run.returncode==0,run.stderr
    assert (folder/'mode.txt').read_text()==str(int(mode=='grip'))
    pal=(folder/'palette.bin').read_bytes(); oam=(folder/'oam.bin').read_bytes()
    if p is not None:
        assert pal[16+4*p+index]==0
        for slot in (55,16):
            assert oam[slot*4+2]&3==p
            assert oam[slot*4]==55
    (OUT/f'{name}-{mode}.png').write_bytes((folder/'screen.png').read_bytes())

def rival(rom,mode,p,angle):
    t0,t1,a0,a1=car.rival_tables()
    banks=car.GRIP_BANKS if mode=='grip' else car.DRIFT_BANKS
    pal=list(car.PALETTE[p])
    ptr=16+109*8192+0xcc+4*p
    pal=list(rom[ptr+1:ptr+4])
    canvas=Image.new('RGB',(16,16),RGB[0x00])
    for half,(tile,attr) in enumerate(((t0[angle],a0[angle]),(t1[angle],a1[angle]))):
        addr=car.tile_addr(tile); bank=banks[0x20+addr//1024]
        start=16+1048576+bank*1024+addr%1024
        rows=car.flip(car.decode(rom[start:start+32]),attr)
        for y,row in enumerate(rows):
            for x,v in enumerate(row):
                if v:canvas.putpixel((x+8*half,y),RGB[pal[v-1]])
    return canvas

def sheet():
    # One row per proposal: both actual screens and exact ROM CHR at three angles.
    w,h=1300,110+7*540
    canvas=Image.new('RGB',(w,h),'#20252b'); d=ImageDraw.Draw(canvas)
    d.text((20,10),'LAP 灰色化：専用パレットの1色置換 全6案',font=FONT,fill='white')
    d.text((20,40),'灰色は TIME / TOTAL と同じ NES $00。ゲーム画面は候補ROMのMesen実描画。車はROMの絵を拡大。',font=SMALL,fill='#dddddd')
    d.text((20,65),'左：DRIFT　中央：GRIP　右：専用パレット2台の比較（背景は比較用の道路色）',font=SMALL,fill='#dddddd')
    for row,case in enumerate(CASES):
        name,p,index,title=case; y=110+row*540
        d.text((20,y),f'{name}　{title}',font=FONT,fill='white')
        for col,mode in enumerate(('drift','grip')):
            im=Image.open(OUT/f'{name}-{mode}.png').convert('RGB')
            canvas.paste(im.resize((512,480),Image.Resampling.NEAREST),(20+col*525,y+35))
        rom=(TEMP/f'{name}.nes').read_bytes()
        for mi,mode in enumerate(('drift','grip')):
            yy=y+40+mi*235
            d.text((1080,yy),mode.upper(),font=FONT,fill='white')
            for pi in (0,1):
                d.text((1080,yy+30+pi*90),f'P{pi}',font=SMALL,fill='white')
                for ai,angle in enumerate((0,8,16)):
                    im=rival(rom,mode,pi,angle).resize((64,64),Image.Resampling.NEAREST)
                    canvas.paste(im,(1080+ai*68,yy+50+pi*90))
        d.line((20,y+525,w-20,y+525),fill='#555555')
    canvas.save(OUT/'comparison.png')
    # Compact all-options sheet with magnified cars and a real HUD crop.
    compact=Image.new('RGB',(1160,900),'#20252b');d=ImageDraw.Draw(compact)
    d.text((20,10),'LAPを灰色へ：白／黒／緑のP0と、水色／黒／青のP1から1色置換',font=FONT,fill='white')
    for n,case in enumerate(CASES[1:]):
        name,p,index,title=case;x=20+(n//3)*580;y=60+(n%3)*280
        d.text((x,y),f'{name}　{title}',font=FONT,fill='white')
        im=Image.open(OUT/f'{name}-drift.png').convert('RGB')
        compact.paste(im.crop((164,52,244,102)).resize((320,200),Image.Resampling.NEAREST),(x,y+35))
        rom=(TEMP/f'{name}.nes').read_bytes()
        for mi,mode in enumerate(('drift','grip')):
            d.text((x+335,y+30+mi*110),mode.upper(),font=SMALL,fill='white')
            for ai,angle in enumerate((0,8,16)):
                im=rival(rom,mode,p,angle).resize((64,64),Image.Resampling.NEAREST)
                compact.paste(im,(x+335+ai*68,y+55+mi*110))
    compact.save(OUT/'options.png')

if __name__=='__main__':
    for case in CASES:make_rom(case)
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
        jobs=[pool.submit(native,case,mode) for case in CASES for mode in ('drift','grip')]
        for j in jobs:j.result()
    sheet()
    (OUT/'manifest.json').write_text(json.dumps(dict(base_sha256=hashlib.sha256(BASE.read_bytes()).hexdigest(),
        gray='$00',cases=[dict(id=n,palette=p,ink=i,description=t) for n,p,i,t in CASES],
        native_screens=14,scope='通常LAP行のモック。BAD LAP等の全状態対応は採用後に実装。'),ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print('14 native screenshots and two comparison sheets generated.')
