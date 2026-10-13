"""通常起動したROMを一周走らせ、GSU頂点・全画素・PPU表示を独立計算と照合する。"""
import hashlib
import json
import os
import re
import struct
import subprocess
from pathlib import Path

from build_cube import ROOT, BUILD, geometry, expected_bitmap, mosaic_tile
from native_lock import core_lock


def main():
    from PIL import Image
    labels={name:int(address,16) for address,name in re.findall(r'al ([0-9A-Fa-f]+) \.([^\s]+)',(BUILD/'cube.lbl').read_text())}
    out=ROOT/'build/cube_verification'; out.mkdir(parents=True,exist_ok=True)
    code=r'''local L=LABELS
local out=OUTDIR
local ramSeen={} local imageSeen={} local imageCount=0 local ramCount=0 local stable=0 local lastUpdate=-1
local function dump(path,address,count,memory)
  local parts={}
  for i=0,count-1 do parts[#parts+1]=string.char(emu.read(address+i,memory)) end
  local f=assert(io.open(path,'wb'));f:write(table.concat(parts));f:close()
end
local report=assert(io.open(out..'/trace.jsonl','w'))
local frames=0
emu.addEventCallback(function()
  local ok,err=pcall(function()
    frames=frames+1
    local stage=emu.read(L.stage,emu.memType.nesMemory)
    assert(stage~=0xe1,'GSU mapper missing');assert(stage~=0xe2,'GSU timeout')
    local phase=emu.read(L.phase,emu.memType.nesMemory)
    local updates=emu.read(L.updates,emu.memType.nesMemory)+256*emu.read(L.updates+1,emu.memType.nesMemory)
    local shown=emu.read(L.displayed_phase,emu.memType.nesMemory)
    if (stage==2 or stage==3) and emu.read(0x5030,emu.memType.nesMemory)%64<32 and not ramSeen[phase] then
      dump(out..string.format('/ram_%02d.bin',phase),0x6000,2048,emu.memType.nesMemory)
      dump(out..string.format('/vertices_%02d.bin',phase),0x7100,32,emu.memType.nesMemory)
      ramSeen[phase]=true;ramCount=ramCount+1
    end
    if updates~=lastUpdate then stable=0;lastUpdate=updates else stable=stable+1 end
    if updates>0 and stable==2 and not imageSeen[shown] then
      -- Read both real nametables; the expected displayed one is updates parity.
      dump(out..string.format('/nt_%02d.bin',shown),0x2000+(updates%2)*0x400,1024,emu.memType.nesPpuMemory)
      local f=assert(io.open(out..string.format('/screen_%02d.png',shown),'wb'))
      f:write(emu.takeScreenshot());f:close()
      report:write(string.format('{"frame":%d,"phase":%d,"updates":%d}\n',frames,shown,updates));report:flush()
      imageSeen[shown]=true;imageCount=imageCount+1
      if imageCount==64 then assert(ramCount==64,'missing fresh GSU captures');report:close();emu.stop(0) end
    end
    assert(frames<2000,'rotation did not complete')
  end)
  if not ok then
    local f=assert(io.open(out..'/error.txt','w'));f:write(tostring(err));f:close();emu.stop(1)
  end
end,emu.eventType.endFrame)
'''.replace('LABELS','{'+','.join(f'{k}={v}' for k,v in labels.items())+'}').replace('OUTDIR',json.dumps(out.as_posix()))
    script=out/'test.lua'; script.write_text(code,encoding='utf-8')
    env=os.environ.copy(); env['NES_GSU_MAPPER']='n8pro-gsu-abi1'
    settings=ROOT/'runtime/settings.json'; before=settings.read_bytes()
    config=json.loads(before); config.setdefault('Debug',{}).setdefault('ScriptWindow',{})['AllowIoOsAccess']=True
    settings.write_text(json.dumps(config),encoding='utf-8')
    try:
        with core_lock(ROOT/'runtime/MesenCore.dll'):
            run=subprocess.run([str(ROOT/'runtime/Mesen.exe'),'--testRunner','--timeout=45','--doNotSaveSettings',
                                '--enableStdout',str(ROOT/'releases/GSU_Cube_v001.nes'),str(script)],
                               cwd=ROOT/'runtime',env=env,capture_output=True,timeout=55,
                               creationflags=getattr(subprocess,'CREATE_NO_WINDOW',0))
    finally: settings.write_bytes(before)
    (out/'emulator.log').write_bytes(run.stdout+run.stderr)
    if run.returncode: raise RuntimeError(f'cube run failed ({run.returncode}): {out}')
    trace=[json.loads(line) for line in (out/'trace.jsonl').read_text().splitlines()]
    if len(trace)!=64: raise RuntimeError(f'only {len(trace)} displayed phases')
    frames=[]; checked=0
    rgb=[(0,0,0),(66,64,255),(72,205,222),(255,254,255)]
    for phase in range(64):
        xy,pixels=expected_bitmap(phase)
        actual=list(struct.iter_unpack('<HH',(out/f'vertices_{phase:02d}.bin').read_bytes()))
        if actual!=xy: raise RuntimeError(f'GSU projection mismatch phase {phase}: {actual} != {xy}')
        ram=(out/f'ram_{phase:02d}.bin').read_bytes()
        for y in range(48):
            for x in range(64):
                offset=(x//8)*256+(y//8)*16+(y%8)*2
                color=((ram[offset]>>(7-x%8))&1)|(((ram[offset+1]>>(7-x%8))&1)<<1)
                if color!=pixels[y][x]: raise RuntimeError(f'GSU raster mismatch {phase} ({x},{y}): {color} != {pixels[y][x]}')
                checked+=1
        nt=(out/f'nt_{phase:02d}.bin').read_bytes()
        expected=bytes(mosaic_tile(pixels,x,y) for y in range(0,48,2) for x in range(0,64,2))
        if nt[128:128+768]!=expected: raise RuntimeError(f'PPU tile conversion mismatch phase {phase}')
        image=Image.open(out/f'screen_{phase:02d}.png').convert('RGB')
        reference=Image.new('RGB',(64,48))
        reference.putdata([rgb[color] for row in pixels for color in row])
        reference=reference.resize((256,192),Image.Resampling.NEAREST)
        if image.crop((0,32,256,224)).tobytes()!=reference.tobytes():
            raise RuntimeError(f'PPU RGB mismatch phase {phase}')
        frames.append(image)
    frames[0].save(out/'cube.gif',save_all=True,append_images=frames[1:],duration=133,loop=0,optimize=False)
    montage=Image.new('RGB',(256*4,240*2))
    for i,phase in enumerate(range(0,64,8)): montage.paste(frames[phase],((i%4)*256,(i//4)*240))
    montage.save(out/'rotation.png')
    summary={'status':'pass','rom_sha256':hashlib.sha256((ROOT/'releases/GSU_Cube_v001.nes').read_bytes()).hexdigest(),
             'phases':64,'vertices_checked':64*8,'gsu_pixels_checked':checked,'ppu_tiles_checked':64*768,
             'ppu_rgb_pixels_checked':checked*16,'display_interval_fields':sorted(set(trace[i]['frame']-trace[i-1]['frame'] for i in range(1,len(trace)))),
             'trace':trace,'timing':'functional emulator; not hardware measurement'}
    (out/'summary.json').write_text(json.dumps(summary,indent=2)+'\n')
    print(json.dumps({k:v for k,v in summary.items() if k!='trace'}))


if __name__=='__main__': main()
