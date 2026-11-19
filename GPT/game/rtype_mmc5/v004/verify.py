"""Mesen 2でパッド入力、ExRAM転送、通路の復元を実ROMで検査する。"""
import json
import os
import re
import shutil
import subprocess
from pathlib import Path
root=Path(__file__).resolve().parent
out=root/'build'/'check'
out.mkdir(parents=True,exist_ok=True)
rom=Path(os.environ.get('CHECK_ROM',root/'rtype-mmc5-v004.nes')).resolve()
src=Path(os.environ.get('MESEN_EXE') or shutil.which('Mesen') or 'Mesen.exe').resolve()
for path in [src,*src.parent.glob('*.dll')]:
    shutil.copy2(path,out/path.name)
config={'Debug':{'ScriptWindow':{'AllowIoOsAccess':True}},'Nes':{'Port1':{'Type':'NesController'}}}
(out/'settings.json').write_text(json.dumps(config))
lua=r'''
local frame=0
local cells={}
local tiles=assert(io.open(DIR..'/../stage_tiles.bin','rb')):read('*a')
local cols=0
local streamBytes=0
local increment=1
local lastCamera=-1
local settled=0
local positions=assert(io.open(DIR..'/positions.txt','w'))
local bright=0
local ntWrites=0
local addr=0
local highNext=true
local paletteWrites=0
local allowedAddr={0x3f05,0x3f06,0x3f0a,0x3f05,0x3f06,0x3f0a,0x3f05,0x3f06,0x3f0a}
local allowedColor={0x02,0x22,0x12,0x0f,0x16,0x2c,0x02,0x22,0x12}
local maxLit=0
local transfers=0
local trace=assert(io.open(DIR..'/rays.txt','w'))
local function read(addr) return emu.read(addr,emu.memType.nesMemory) end
local last=0
local allMissed=0
local missed={0,0,0}
local spans={{60,300},{405,645},{750,990}}
local function fail(s)
 local f=assert(io.open(DIR..'/error.txt','w'));f:write(s);f:close();emu.stop(1)
end
emu.addMemoryCallback(function(a,v)
 if frame>45 then
  if a<0x5c00 or a>=0x5fc0 then fail('wall write') end
  cells[a]=(v==0 or v==0xc1 or v==0xfe) and 0 or v
 end
end,emu.callbackType.write,0x5c00,0x5fff)
emu.addMemoryCallback(function(a,v) increment=(v==0x84) and 32 or 1 end,emu.callbackType.write,0x2000)
emu.addMemoryCallback(function(a,v)
 if frame<=45 then return end
 if highNext then addr=v*256 else addr=addr+v end
 highNext=not highNext
end,emu.callbackType.write,0x2006)
emu.addMemoryCallback(function(a,v)
 if frame<=45 then return end
 if increment==32 and addr>=0x2000 and addr<0x23c0 then
  local col=read(STAGE_LABEL)+32
  local row=math.floor((addr-0x2000)/32)
  if addr%32~=col%32 or tiles:byte(col*32+row+1)~=v then fail('wrong column at '..frame);return end
  streamBytes=streamBytes+1
  if row==29 then cols=cols+1 end
 elseif addr==0x3f00 or addr==0x3f02 or addr==0x3f03 then
  bright=bright+1
 elseif addr==allowedAddr[paletteWrites+1] and v==allowedColor[paletteWrites+1] then
  paletteWrites=paletteWrites+1
 else ntWrites=ntWrites+1 end
 addr=addr+increment
end,emu.callbackType.write,0x2007)
emu.addMemoryCallback(function()
 transfers=transfers+1
 if ((frame>=750 and frame<990) or (frame>=2200 and frame<2460) or (frame>=4100 and frame<4400)) and read(BLUE_LABEL)~=0 then
  trace:write(string.format('%d %d %d %d',read(BLUE_LABEL+3),read(BLUE_LABEL+1),read(BLUE_LABEL+2),read(STAGE_LABEL)*8+(read(SCROLL_LABEL)%8)))
  for a,v in pairs(cells) do if v~=0 then trace:write(string.format(' %04x:%02x',a,v)) end end
  trace:write('\n')
 end
end,emu.callbackType.write,0x4014)
emu.addEventCallback(function()
 emu.setInput({a=(frame>=405 and frame<645) or frame==1040,
 b=(frame>=750 and frame<990) or (frame>=2200 and frame<2460) or (frame>=4100 and frame<4400),
 up=false, right=false},0)
end,emu.eventType.inputPolled)
local function shot(name)
 local f=assert(io.open(DIR..'/'..name..'.png','wb'));f:write(emu.takeScreenshot());f:close()
end
emu.addEventCallback(function()
 frame=frame+1
 if frame>=48 then
  local pos=read(STAGE_LABEL)*8+read(SCROLL_LABEL)%8
  if pos<lastCamera or pos>1334 or pos-lastCamera>1 and lastCamera>=0 then fail('camera step '..frame);return end
  lastCamera=pos
  if pos==1334 then settled=settled+1 end
 end
 if RECORD and frame>=14 and frame<=4430 and frame%2==0 then shot(string.format('film%04d',(frame-14)/2)) end
 if frame>=50 and frame<=4442 and (frame-50)%60==0 then
  positions:write(string.format('%d %d %d\n',frame-50,lastCamera,read(BACKDROP_LABEL)))
  shot('stage'..(frame-50))
 end
 for i,v in ipairs(spans) do if frame>=v[1] and frame<v[2] and transfers==last then missed[i]=missed[i]+1 end end
 if frame>=60 and transfers==last then allMissed=allMissed+1 end
 last=transfers
 local count=0
 for _,v in pairs(cells) do if v~=0 then count=count+1 end end
 maxLit=math.max(maxLit,count)
 if frame>=405 and frame<=483 and frame%3==0 then shot('anim'..(frame-369)) end
 if frame>=750 and frame<=831 and frame%3==0 then shot('anim'..(frame-633)) end
 if frame>=405 and frame<=463 then shot('opening'..(frame-367)) end
 if frame==32 then shot('idle') end
 if frame==434 or frame==780 then
  if count==0 then fail('laser missing at '..frame);return end
  shot(frame==434 and 'wave' or 'reflection')
 end
 if frame==4490 then
  trace:close()
  positions:close()
  if missed[1]+missed[2]+missed[3]~=0 or count~=0 or ntWrites~=0 or paletteWrites~=9 or streamBytes~=cols*30 or bright~=18 or settled<40 or allMissed~=0 then fail('DMA / clear / PPUDATA '..transfers..' '..count..' '..ntWrites..' light='..bright..' colours='..paletteWrites..' stop='..settled..' missed='..table.concat(missed,','));return end
  local f=assert(io.open(DIR..'/result.txt','w'))
  f:write('frames='..frame..' DMA='..transfers..' peak_lit='..maxLit..' final_lit='..count..' columns='..cols..' camera='..lastCamera..' palette_writes='..paletteWrites..' other_PPUDATA_writes='..ntWrites..' missed idle/A/B='..table.concat(missed,','));f:close()
  emu.stop(0)
 end
end,emu.eventType.endFrame)
'''.replace('DIR',json.dumps(out.as_posix())).replace('RECORD','true' if os.environ.get('RECORD_STAGE') else 'false')
labels={name:int(address,16) for address,name in re.findall(r'al ([0-9A-Fa-f]+) \.(_\w+)',(root/'build/cart.lbl').read_text())}
lua=lua.replace('BLUE_LABEL',str(labels['_blue'])).replace('SCROLL_LABEL',str(labels['_scroll_x'])).replace('STAGE_LABEL',str(labels['_stage_tile'])).replace('BACKDROP_LABEL',str(labels['_backdrop']))
(out/'check.lua').write_text(lua)
for name in ['result.txt','error.txt']:
    (out/name).unlink(missing_ok=True)
p=subprocess.run([str(out/src.name),'--testrunner','--timeout=65','--donotsavesettings','--enableStdout',str(rom),str(out/'check.lua')],cwd=out,timeout=80,capture_output=True,creationflags=getattr(subprocess,'CREATE_NO_WINDOW',0))
if p.returncode or not (out/'result.txt').exists():
    raise RuntimeError((out/'error.txt').read_text() if (out/'error.txt').exists() else (p.stdout+p.stderr).decode(errors='replace'))
print((out/'result.txt').read_text())
from check_render import check_background,check_rays,check_camera
checked=check_background()

frames_checked,wrapped=check_rays()
print(f'Background composites: {checked}; ray frames: {frames_checked} ({wrapped} after scroll wrap)')


poses,error=check_camera()
print(f'Captured camera: {poses} positions, max error {error:.2f} px')

# Show the first shot at 6x slow motion and the whole test at normal speed.
from PIL import Image
frames=[Image.open(out/f'opening{i}.png').convert('RGB').crop((0,83,164,158)).resize((656,300),Image.Resampling.NEAREST) for i in range(39,84)]
frames[0].save(root/'launch-slow.gif',save_all=True,append_images=frames[1:],duration=100,loop=0)
timeline=[Image.open(out/f'anim{i}.png').convert('RGB').resize((512,480),Image.Resampling.NEAREST) for i in range(36,201,3)]
timeline[0].save(root/'preview.gif',save_all=True,append_images=timeline[1:],duration=50,loop=0)

reflection=Image.open(out/'anim132.png').convert('RGB').crop((0,42,126,208))
reflection.resize((504,664),Image.Resampling.NEAREST).save(root/'reflection-detail.png')
