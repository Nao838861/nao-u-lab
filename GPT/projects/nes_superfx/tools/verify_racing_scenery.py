"""コース全周と景物近傍でGSUを計測し、重い地点をPPU表示で確認する。"""
import argparse, hashlib, json, math, os, re, struct, subprocess
from pathlib import Path
import mmc5_course, mmc5_state
from build_ground import VIEWS
from build_racing_scenery import TREES, HOUSES
from native_lock import core_lock
import verify_racing_optimization as profile

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'build/racing/v005/scenery-test'


def cases():
    result=[]
    def add(name,state,view):result.append({'name':name,'state':list(state[:10]),'view':view})
    for view in range(4):
        for phase,state in enumerate(mmc5_state.route_states(mmc5_course.route())):
            x,z,body,cam,tick=mmc5_state.unpack(state)
            for slip in [-4096,0,4096]:add(f'route-{view}-{phase}-{slip}',mmc5_state.snapshot(x,z,body+slip,cam),view)
    for i,(x,z) in enumerate(TREES+HOUSES):
        for view in range(4):
            for angle in range(0,65536,8192):
                a=angle*math.tau/65536
                for distance in [12,40]:
                    # Player points toward scenery, 2.4 or 8 world units away.
                    px=x-math.sin(a)*distance;pz=z+math.cos(a)*distance
                    add(f'object-{i}-v{view}-a{angle}-d{distance}',mmc5_state.snapshot(round(px*256),round(pz*256),angle+2048,angle),view)
    return result


def scan(probe):
    OUT.mkdir(parents=True,exist_ok=True);profile.OUT=OUT
    original=(ROOT/'build/racing/v005/initial-test/snapshot0.bin').read_bytes()
    rom=(ROOT/'releases/GSU_MMC5Racing3D_v005.nes').read_bytes();mesh=rom[8208:16400]
    data=bytearray(original);data[0x8000:0xa000]=mesh;data[:0x8000]=bytes(0x8000)
    rows=cases()
    for i,row in enumerate(rows):
        state=bytes(row['state'])+bytes(2);pose=mmc5_state.pose(state,VIEWS[row['view']])
        struct.pack_into('<11h',data,0x8008,*pose)
        clocks,frame=profile.run(probe,data,'probe')
        row.update(gsu_clocks=clocks,gsu_ms=round(clocks/50000,3))
        if (i+1)%256==0:print(f'GSU {i+1}/{len(rows)}',flush=True)
    worst=[]
    for view in range(4):
        # Keep both driving route and off-road close-up stress cases.
        for prefix in ['route','object']:
            worst+=sorted([r for r in rows if r['view']==view and r['name'].startswith(prefix)],key=lambda r:r['gsu_clocks'],reverse=True)[:2]
    for i in [0,8,9]:
        worst+=next([r] for r in rows if r['name']==f'object-{i}-v1-a40960-d40')
    report={'clock_hz':50000000,'rom_sha256':hashlib.sha256(rom).hexdigest(),'cases':len(rows),
            'route_cases':768,'object_cases':640,'max_gsu_ms':max(r['gsu_ms'] for r in rows),
            'selected':worst,'all':rows}
    (OUT/'scan.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps({k:v for k,v in report.items() if k not in ['all','selected']}))


def emulate(mode=0):
    report=json.loads((OUT/'scan.json').read_text());rows=report['selected']
    labels={n:int(a,16) for a,n in re.findall(r'al ([0-9A-Fa-f]+) \.([^\s]+)',(ROOT/'build/racing/v005/cpu.lbl').read_text())}
    runtime=ROOT/'runtime_mode7';out=OUT/('ppu-drift' if mode else 'ppu');out.mkdir(exist_ok=True)
    lua=r'''
local L=LABELS local rows=ROWS local out=OUTDIR
local shot=1 local settle=0 local frames=0 local start=0 local done=false local results={}
local function b(a) return emu.read(a,emu.memType.nesMemory) end
local function w(a) return b(a)+256*b(a+1) end
emu.addMemoryCallback(function() emu.write(L.desired_mode,DRIVE_MODE,emu.memType.nesMemory) end,emu.callbackType.exec,L.restart)
emu.addMemoryCallback(function()
 if done then return end
 for i,v in ipairs(rows[shot].state) do emu.write(L.original_state+i-1,v,emu.memType.nesMemory) end
end,emu.callbackType.exec,L.render_from_mmc5_state)
emu.addEventCallback(function()
 if done then return end
 frames=frames+1;assert(frames<12000,'timeout')
 emu.write(L.desired_view,rows[shot].view,emu.memType.nesMemory)
 if w(L.updates)>2 and b(L.displayed_view)==rows[shot].view then
  settle=settle+1
  if settle==10 then start=w(L.updates) end
  if settle==130 then
   assert(b(0x4fe3)==0,'FX fault')
   assert(math.floor(b(0x4fb0)/4)%2==0,'Mode7 fault')
   assert(w(0x4fb4)==w(L.displayed_tick),'generation mismatch')
   assert(w(L.physics_ticks)==w(L.audio_ticks),'audio mismatch')
   local updates=(w(L.updates)-start)%65536
   local clocks=w(L.gsu_clocks)+65536*w(L.gsu_clocks+2)
   results[#results+1]=string.format('{"case":%d,"updates_per_120_vblanks":%d,"fps":%.4f,"gsu_clocks":%d}',shot,updates,updates*60.0988/120,clocks)
   local f=assert(io.open(out..'/'..rows[shot].name..'.png','wb'));f:write(emu.takeScreenshot());f:close()
   shot=shot+1;settle=0
   if shot>#rows then
    f=assert(io.open(out..'/fps.json','w'));f:write('['..table.concat(results,',')..']');f:close()
    done=true;emu.stop(0)
   end
  end
 else settle=0 end
end,emu.eventType.endFrame)
'''
    cases_lua='{'+','.join('{name='+json.dumps(r['name'])+',view='+str(r['view'])+',state={'+','.join(map(str,r['state']))+'}}' for r in rows)+'}'
    lua=lua.replace('LABELS','{'+','.join(f'{k}={v}' for k,v in labels.items())+'}').replace('ROWS',cases_lua).replace('OUTDIR',json.dumps(out.as_posix())).replace('DRIVE_MODE',str(mode))
    script=OUT/'ppu.lua';script.write_text(lua)
    settings=runtime/'settings.json';before=settings.read_bytes();cfg=json.loads(before)
    cfg.setdefault('Debug',{}).setdefault('ScriptWindow',{})['AllowIoOsAccess']=True;settings.write_text(json.dumps(cfg))
    env=os.environ.copy();env.update(NES_GSU_MAPPER='n8pro-racing-gsu',NES_GSU_CLOCK_HZ='50000000')
    try:
        with core_lock(runtime/'MesenCore.dll'):
            p=subprocess.run([str(runtime/'Mesen.exe'),'--testRunner','--timeout=180','--doNotSaveSettings',str(ROOT/'releases/GSU_MMC5Racing3D_v005.nes'),str(script)],cwd=runtime,env=env,capture_output=True,timeout=190,creationflags=subprocess.CREATE_NO_WINDOW)
    finally:settings.write_bytes(before)
    (out/'emulator.log').write_bytes(p.stdout+p.stderr);assert p.returncode==0,(p.stdout,p.stderr)
    fps=json.loads((out/'fps.json').read_text())
    for row,measurement in zip(rows,fps):row.update(measurement)
    # Emulator and native probe use the same GSU instruction timing.
    # Native execution begins with a cold instruction cache; allow 0.1ms.
    for row in rows:assert abs(row['gsu_clocks']/50000-row['gsu_ms'])<.1,row
    result={k:v for k,v in report.items() if k!='all'};result.update(min_measured_fps=min(r['fps'] for r in rows),drive_mode=mode)
    (OUT/('verification_drift.json' if mode else 'verification.json')).write_text(json.dumps(result,indent=2)+'\n');print(json.dumps({'min_fps':result['min_measured_fps'],'max_gsu_ms':result['max_gsu_ms'],'ppu_cases':len(rows),'drive_mode':mode}))


if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--probe',type=Path);p.add_argument('--emulate',action='store_true');p.add_argument('--drive-mode',type=int,choices=[0,1],default=0);a=p.parse_args()
    if a.probe:scan(a.probe.resolve())
    if a.emulate:emulate(a.drive_mode)
