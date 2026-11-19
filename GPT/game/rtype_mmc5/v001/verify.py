"""Mesen 2でパッド入力、ExRAM転送、通路の復元を実ROMで検査する。"""
import json
import os
import shutil
import subprocess
from pathlib import Path
root=Path(__file__).resolve().parent
out=root/'build'/'check'
out.mkdir(parents=True,exist_ok=True)
src=Path(os.environ.get('MESEN_EXE') or shutil.which('Mesen') or 'Mesen.exe').resolve()
for path in [src,*src.parent.glob('*.dll')]:
    shutil.copy2(path,out/path.name)
config={'Debug':{'ScriptWindow':{'AllowIoOsAccess':True}},'Nes':{'Port1':{'Type':'NesController'}}}
(out/'settings.json').write_text(json.dumps(config))
lua=r'''
local frame=0
local cells={}
local ntWrites=0
local maxLit=0
local transfers=0
local function fail(s)
 local f=assert(io.open(DIR..'/error.txt','w'));f:write(s);f:close();emu.stop(1)
end
emu.addMemoryCallback(function(a,v)
 if frame>28 then
  if a<0x5c80 or a>=0x5f40 then fail('wall write') end
  cells[a]=v
 end
end,emu.callbackType.write,0x5c00,0x5fff)
emu.addMemoryCallback(function() if frame>28 then ntWrites=ntWrites+1 end end,emu.callbackType.write,0x2007)
emu.addMemoryCallback(function() transfers=transfers+1 end,emu.callbackType.write,0x4014)
emu.addEventCallback(function()
 emu.setInput({a=(frame>=38 and frame<72) or (frame>=215 and frame<300),
 b=(frame>=130 and frame<164) or (frame>=215 and frame<300),
 up=frame>=98 and frame<124, right=frame>=180 and frame<190},0)
end,emu.eventType.inputPolled)
local function shot(name)
 local f=assert(io.open(DIR..'/'..name..'.png','wb'));f:write(emu.takeScreenshot());f:close()
end
emu.addEventCallback(function()
 frame=frame+1
 local count=0
 for _,v in pairs(cells) do if v~=0 then count=count+1 end end
 maxLit=math.max(maxLit,count)
 if frame==32 then shot('idle') end
 if frame==54 or frame==150 then
  if count==0 then fail('laser missing at '..frame);return end
  shot(frame==54 and 'wave' or 'reflection')
 end
 if frame==385 then
  if transfers<250 or count~=0 or ntWrites~=0 then fail('DMA / clear / PPUDATA '..transfers..' '..count..' '..ntWrites);return end
  local f=assert(io.open(DIR..'/result.txt','w'))
  f:write('frames='..frame..' DMA='..transfers..' peak_lit='..maxLit..' final_lit='..count..' PPUDATA_writes='..ntWrites);f:close()
  emu.stop(0)
 end
end,emu.eventType.endFrame)
'''.replace('DIR',json.dumps(out.as_posix()))
(out/'check.lua').write_text(lua)
for name in ['result.txt','error.txt']:
    (out/name).unlink(missing_ok=True)
p=subprocess.run([str(out/src.name),'--testrunner','--timeout=25','--donotsavesettings','--enableStdout',str(root/'rtype-mmc5.nes'),str(out/'check.lua')],cwd=out,timeout=40,capture_output=True,creationflags=getattr(subprocess,'CREATE_NO_WINDOW',0))
if p.returncode or not (out/'result.txt').exists():
    raise RuntimeError((out/'error.txt').read_text() if (out/'error.txt').exists() else (p.stdout+p.stderr).decode(errors='replace'))
print((out/'result.txt').read_text())

