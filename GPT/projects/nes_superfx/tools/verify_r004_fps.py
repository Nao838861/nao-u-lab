"""コース全周×4視点×3ドリフト角の実ROM表示更新頻度を検査する。"""
import argparse,hashlib,json,os,re,subprocess
from pathlib import Path
from native_lock import core_lock
from verify_racing_scenery import cases
ROOT=Path(__file__).resolve().parents[1]

def main():
    p=argparse.ArgumentParser();p.add_argument('--rom',type=Path,required=True);p.add_argument('--runtime',type=Path,required=True)
    p.add_argument('--out',type=Path,required=True);a=p.parse_args();out=a.out.resolve();out.mkdir(parents=True,exist_ok=True)
    rows=[r for r in cases() if r['name'].startswith('route')]
    labels={n:int(v,16) for v,n in re.findall(r'al ([0-9A-Fa-f]+) \.([^\s]+)',(ROOT/'build/racing/v005/cpu.lbl').read_text())}
    lua=r'''local L=LABELS local rows=ROWS local shot=1 local settle=0 local frames=0 local mark=0 local done=false
local result=assert(io.open(OUTFILE,'w'));result:write('case,updates_per_24_vblanks,gsu_clocks\n')
local function b(a) return emu.read(a,emu.memType.nesMemory) end
local function w(a) return b(a)+256*b(a+1) end
emu.addMemoryCallback(function()
 if done then return end
 for i,v in ipairs(rows[shot].state) do emu.write(L.original_state+i-1,v,emu.memType.nesMemory) end
end,emu.callbackType.exec,L.render_from_mmc5_state)
emu.addEventCallback(function()
 if done then return end
 frames=frames+1;assert(frames<40000,'timeout')
 emu.write(L.desired_view,rows[shot].view,emu.memType.nesMemory)
 if w(L.updates)>2 and b(L.displayed_view)==rows[shot].view then
  settle=settle+1
  if settle==10 then mark=w(L.updates) end
  if settle==34 then
   assert(b(0x4fe3)==0,'FX fault');assert(math.floor(b(0x4fb0)/4)%2==0,'DSP fault')
   assert(w(L.physics_ticks)==w(L.audio_ticks),'audio mismatch')
   result:write(string.format('%s,%d,%d\n',rows[shot].name,(w(L.updates)-mark)%65536,w(L.gsu_clocks)+65536*w(L.gsu_clocks+2)))
   result:flush();shot=shot+1;settle=0
   if shot>#rows then result:close();done=true;emu.stop(0) end
  end
 else settle=0 end
end,emu.eventType.endFrame)
'''
    lua=lua.replace('LABELS','{'+','.join(f'{k}={v}' for k,v in labels.items())+'}')
    lua=lua.replace('ROWS','{'+','.join('{name='+json.dumps(r['name'])+',view='+str(r['view'])+',state={'+','.join(map(str,r['state']))+'}}' for r in rows)+'}')
    lua=lua.replace('OUTFILE',json.dumps((out/'timing.csv').as_posix()));script=out/'test.lua';script.write_text(lua)
    runtime=a.runtime.resolve();settings=runtime/'settings.json';before=settings.read_bytes();cfg=json.loads(before)
    cfg.setdefault('Debug',{}).setdefault('ScriptWindow',{})['AllowIoOsAccess']=True;settings.write_text(json.dumps(cfg))
    env=os.environ.copy();env.update(NES_GSU_MAPPER='n8pro-racing-gsu',NES_GSU_CLOCK_HZ='25000000')
    try:
        with core_lock(runtime/'MesenCore.dll'):
            run=subprocess.run([runtime/'Mesen.exe','--testRunner','--timeout=360','--doNotSaveSettings',a.rom.resolve(),script],cwd=runtime,env=env,capture_output=True,timeout=370,creationflags=subprocess.CREATE_NO_WINDOW)
    finally:settings.write_bytes(before)
    (out/'emulator.log').write_bytes(run.stdout+run.stderr);assert run.returncode==0,(run.stdout,run.stderr)
    import csv
    actual=list(csv.DictReader((out/'timing.csv').open()));assert len(actual)==768
    slow=[r for r in actual if int(r['updates_per_24_vblanks'])<12]
    report={'status':'pass' if not slow else 'below_target','cases':len(actual),'below_30fps':len(slow),
            'min_measured_fps':min(int(r['updates_per_24_vblanks']) for r in actual)*60.0988/24,
            'rom_sha256':hashlib.sha256(a.rom.read_bytes()).hexdigest(),'core_sha256':hashlib.sha256((runtime/'MesenCore.dll').read_bytes()).hexdigest(),
            'slow_cases':slow,'scope':'Mesen full CPU/audio/Mode7/GSU/PPU model, 24-vblank sample after 10 stable vblanks per pose; hardware unverified'}
    (out/'verification.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps({k:v for k,v in report.items() if k!='slow_cases'}))

if __name__=='__main__':main()
