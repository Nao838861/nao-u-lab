"""カメラ修正前後の物理一致と、元のカメラ角度の伝達を実ROMで検証する。"""
import hashlib,json,os,re,subprocess
from pathlib import Path
from native_lock import core_lock

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'build/racing/v003/camera-test'

def run(mode,after):
    name=('after' if after else 'before')+str(mode)
    out=OUT/name;out.mkdir(exist_ok=True)
    labels=ROOT/'build/racing/v003/cpu.lbl' if after else OUT/'before.lbl'
    lab={n:int(a,16) for a,n in re.findall(r'al ([0-9A-Fa-f]+) \.([^\s]+)',labels.read_text())}
    lua=r'''
local L=LABELS local out=OUTDIR local count=0 local frames=0 local seen=0
local poses={} local maxAngle=0 local capturedTick=0
local states=assert(io.open(out..'/physics.txt','w'))
local function b(a) return emu.read(a,emu.memType.nesMemory) end
local function w(a) return b(a)+256*b(a+1) end
local function angle(a,b) return (a-b+32768)%65536-32768 end
emu.addMemoryCallback(function() emu.write(L.desired_mode,MODE,emu.memType.nesMemory) end,emu.callbackType.exec,L.restart)
emu.addEventCallback(function()
 local t=w(L.physics_ticks)
 emu.setInput({a=t>=80 and t<620,b=t>=620 and t<850,right=t>=400 and t<620,left=t>=620 and t<850},0)
end,emu.eventType.inputPolled)
emu.addMemoryCallback(function()
 count=count+1
 for a=0x40,0xe9 do states:write(string.format('%02x',b(a))) end
 states:write('\n')
end,emu.callbackType.exec,L.sim_end)
if AFTER then
 emu.addMemoryCallback(function()
  assert(w(L.latest_state+6)==w(0x48),'body heading changed')
  assert(w(L.latest_state+8)==w(0xc2),'original camera heading lost')
  seen=seen+1
 end,emu.callbackType.exec,L.snapshot_ready)
end
emu.addMemoryCallback(function()
 local body=w(L.original_state+6) local cam=w(L.original_state+8)
 if not AFTER then assert(body==cam,'baseline no longer body-locked') end
 poses[w(L.original_state+10)]=math.abs(angle(body,cam))
end,emu.callbackType.exec,L.render_from_mmc5_state)
emu.addEventCallback(function()
 frames=frames+1;assert(frames<2600,'timeout')
 emu.write(L.desired_view,1,emu.memType.nesMemory)
 local t=w(L.displayed_tick) local delta=poses[t] or 0
 if delta>maxAngle then
  maxAngle=delta;capturedTick=t
  local f=assert(io.open(out..'/slip.png','wb'));f:write(emu.takeScreenshot());f:close()
 end
 if count>=1000 then
  assert(b(0x4fe3)==0,'display fault')
  assert(w(L.audio_ticks)==w(L.physics_ticks),'audio tick mismatch')
  if AFTER then assert(seen>=1000,'publication hook missed') end
  if AFTER and MODE==1 then assert(maxAngle>256,'no drift side view') end
  local f=assert(io.open(out..'/report.json','w'))
  f:write(string.format('{"ticks":%d,"camera_checks":%d,"max_displayed_yaw_units":%d,"capture_tick":%d}',count,seen,maxAngle,capturedTick));f:close()
  states:close();emu.stop(0)
 end
end,emu.eventType.endFrame)
'''.replace('LABELS','{'+','.join(f'{k}={v}' for k,v in lab.items())+'}').replace('OUTDIR',json.dumps(out.as_posix())).replace('MODE',str(mode)).replace('AFTER','true' if after else 'false')
    script=out/'test.lua';script.write_text(lua)
    env=os.environ.copy();env.update(NES_GSU_MAPPER='n8pro-racing-gsu',NES_GSU_CLOCK_HZ='50000000')
    rom=ROOT/'releases/GSU_MMC5Racing3D_v003.nes' if after else OUT/'before.nes'
    with core_lock(ROOT/'runtime/MesenCore.dll'):
        p=subprocess.run([str(ROOT/'runtime/Mesen.exe'),'--testRunner','--timeout=90','--doNotSaveSettings',str(rom),str(script)],cwd=ROOT/'runtime',env=env,capture_output=True,timeout=100,creationflags=subprocess.CREATE_NO_WINDOW)
    (out/'emulator.log').write_bytes(p.stdout+p.stderr)
    assert p.returncode==0,(name,p.stdout,p.stderr)
    return out

def main():
    settings=ROOT/'runtime/settings.json';before=settings.read_bytes();cfg=json.loads(before)
    cfg.setdefault('Debug',{}).setdefault('ScriptWindow',{})['AllowIoOsAccess']=True
    settings.write_text(json.dumps(cfg))
    results=[];dst=ROOT/'demos/racing/v003/results/camera';dst.mkdir(exist_ok=True)
    try:
        for mode in [0,1]:
            a=run(mode,False);b=run(mode,True)
            old=(a/'physics.txt').read_text().splitlines()[:1000]
            new=(b/'physics.txt').read_text().splitlines()[:1000]
            assert old==new,('physics changed',mode,next(i for i,(x,y) in enumerate(zip(old,new)) if x!=y))
            report=json.loads((b/'report.json').read_text());report.update(mode=mode,physics_ticks_identical=1000,max_displayed_yaw_degrees=round(report['max_displayed_yaw_units']*360/65536,2))
            if (b/'slip.png').exists():(dst/f'mode{mode}-slip.png').write_bytes((b/'slip.png').read_bytes())
            results.append(report)
    finally:settings.write_bytes(before)
    report={'cases':results,'rom_sha256':hashlib.sha256((ROOT/'releases/GSU_MMC5Racing3D_v003.nes').read_bytes()).hexdigest()}
    (dst/'verification.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report))

if __name__=='__main__':main()
