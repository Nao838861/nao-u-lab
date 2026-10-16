"""実Mesenで音レジスター、60Hz更新、音追加前後の物理一致を検証する。"""
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import zipfile
from native_lock import core_lock

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT/'build/racing/v002/audio-test'


def run(version, mode, mhz):
    out = OUT/f'{version}-{mode}-{mhz}'
    out.mkdir(parents=True, exist_ok=True)
    if version == '001':
        with zipfile.ZipFile(ROOT/'demos/racing/v001/results/verification.zip') as z:
            labels = z.read('build/cpu.lbl').decode()
    else:
        labels = (ROOT/'build/racing/v002/cpu.lbl').read_text()
    lab = {n:int(a,16) for a,n in re.findall(r'al ([0-9A-Fa-f]+) \.([^\s]+)',labels)}
    lua = r'''
local L=LABELS local out=OUTDIR local frame=0 local count=0 local armed=false
local states=assert(io.open(out..'/physics.txt','w'))
local audio=assert(io.open(out..'/apu.txt','w'))
local function byte(a) return emu.read(a,emu.memType.nesMemory) end
local function word(a) return byte(a)+256*byte(a+1) end
emu.addMemoryCallback(function() emu.write(L.desired_mode,MODE,emu.memType.nesMemory) end,emu.callbackType.exec,L.restart)
emu.addEventCallback(function()
 local t=word(L.physics_ticks)
 emu.setInput({a=t>=80 and t<620,b=t>=620 and t<850,right=t>=400 and t<620,left=t>=620 and t<850},0)
end,emu.eventType.inputPolled)
emu.addMemoryCallback(function(a,v)
 audio:write(string.format('%d %04x %02x\n',count,a,v))
end,emu.callbackType.write,0x4000,0x4017)
emu.addMemoryCallback(function()
 count=count+1
 for a=0x40,0xe9 do
  if a<0xc2 or a>0xc4 then states:write(string.format('%02x',byte(a))) end
 end
 states:write('\n')
end,emu.callbackType.exec,L.sim_end)
emu.addEventCallback(function()
 frame=frame+1
 if frame>2600 then error('audio test timed out') end
 if count>=1000 then
  local report=assert(io.open(out..'/counters.json','w'))
  report:write(string.format('{"physics_ticks":%d,"audio_ticks":%d,"fault":%d}',word(L.physics_ticks),word(0x454),byte(0x4fe3)))
  report:close();states:close();audio:close()
  local f=assert(io.open(out..'/screen.png','wb'));f:write(emu.takeScreenshot());f:close()
  emu.stop(0)
 end
end,emu.eventType.endFrame)
'''.replace('LABELS','{'+','.join(f'{k}={v}' for k,v in lab.items())+'}').replace('OUTDIR',json.dumps(out.as_posix())).replace('MODE',str(mode))
    script=out/'test.lua';script.write_text(lua)
    env=os.environ.copy();env.update(NES_GSU_MAPPER='n8pro-racing-gsu',NES_GSU_CLOCK_HZ=str(mhz*1000000))
    with core_lock(ROOT/'runtime/MesenCore.dll'):
        p=subprocess.run([str(ROOT/'runtime/Mesen.exe'),'--testRunner','--timeout=90','--doNotSaveSettings',
                          str(ROOT/f'releases/GSU_MMC5Racing3D_v{version}.nes'),str(script)],
                         cwd=ROOT/'runtime',env=env,capture_output=True,timeout=100,creationflags=subprocess.CREATE_NO_WINDOW)
    (out/'emulator.log').write_bytes(p.stdout+p.stderr)
    assert p.returncode==0,(out,p.stdout,p.stderr)
    return out


def main():
    results=[]
    for mode in [0,1]:
        for mhz in [25,50]:
            before=run('001',mode,mhz);after=run('002',mode,mhz)
            old=(before/'physics.txt').read_text().splitlines()
            new=(after/'physics.txt').read_text().splitlines()
            assert old[:1000]==new[:1000], ('physics changed',mode,mhz,next((i for i,(a,b) in enumerate(zip(old,new)) if a!=b),None))
            counters=json.loads((after/'counters.json').read_text())
            assert counters['audio_ticks']==counters['physics_ticks']>=1000,counters
            assert counters['fault']==0,counters
            trace=[(int(t),int(a,16),int(v,16)) for t,a,v in (line.split() for line in (after/'apu.txt').read_text().splitlines())]
            active=[x for x in trace if x[0]>20]
            engine=[v&15 for t,a,v in active if a==0x4000]
            tire=[v&15 for t,a,v in active if a==0x4004]
            pitch={v for t,a,v in active if a==0x4002}
            assert max(engine)>0 and min(engine)==0 and len(pitch)>8,(engine,pitch)
            assert max(tire)>0 and min(tire)==0,('tire gate',mode)
            report={'mode':mode,'mhz':mhz,'physics_ticks_compared':1000,'counters':counters,
                    'engine_volumes':sorted(set(engine)),'tire_volumes':sorted(set(tire)),'pitch_values':len(pitch),
                    'apu_trace_sha256':hashlib.sha256((after/'apu.txt').read_bytes()).hexdigest()}
            results.append(report);print(json.dumps(report),flush=True)
        sequences=[]
        for mhz in [25,50]:
            rows=[line.split() for line in (OUT/f'002-{mode}-{mhz}/apu.txt').read_text().splitlines()]
            sequences.append([(int(t),int(a,16),int(v,16)) for t,a,v in rows
                              if int(t)<1000 and (int(a,16)<=0x4013 or int(a,16)==0x4015)])
        assert sequences[0]==sequences[1],('audio depends on GSU clock',mode)
    dst=ROOT/'demos/racing/v002/results';dst.mkdir(exist_ok=True)
    (dst/'verification.json').write_text(json.dumps({'status':'pass','cases':results,
        'rom_sha256':hashlib.sha256((ROOT/'releases/GSU_MMC5Racing3D_v002.nes').read_bytes()).hexdigest(),
        'core_sha256':hashlib.sha256((ROOT/'runtime/MesenCore.dll').read_bytes()).hexdigest(),
        'audio_equal_across_gsu_clocks':True},indent=2)+'\n')


if __name__=='__main__':main()
