"""4視点と地面2方式の実機能画像を保存し、物理・音更新の継続を確認する。"""
import argparse,json,os,re,subprocess
from pathlib import Path
from native_lock import core_lock

ROOT=Path(__file__).resolve().parents[1]


def main():
    parser=argparse.ArgumentParser();parser.add_argument('--rom',type=Path,default=ROOT/'releases/GSU_MMC5Racing3D_v003.nes');parser.add_argument('--results',type=Path,default=ROOT/'demos/racing/v003/results');parser.add_argument('--trees',action='store_true');parser.add_argument('--dump-gsu',action='store_true');parser.add_argument('--measure-fps',action='store_true');args=parser.parse_args()
    out=args.results.resolve();out.mkdir(parents=True,exist_ok=True)
    labels={n:int(a,16) for a,n in re.findall(r'al ([0-9A-Fa-f]+) \.([^\s]+)',(ROOT/'build/racing/v003/cpu.lbl').read_text())}
    lua=r'''
local L=LABELS local out=OUTDIR local frame=0 local shot=0 local settle=0 local done=false local clocks={}
local function b(a) return emu.read(a,emu.memType.nesMemory) end
local function w(a) return b(a)+256*b(a+1) end
emu.addEventCallback(function()
 if done then return end
 frame=frame+1
 if frame>2200 then emu.stop(1);return end
 local ground=math.floor(shot/4) local view=shot%4
 emu.write(L.desired_view,view,emu.memType.nesMemory)
 emu.write(L.desired_ground,ground,emu.memType.nesMemory)
 if w(L.updates)>1 and b(L.displayed_view)==view and b(L.displayed_ground)==ground then
  settle=settle+1
  if settle>=4 then
   assert(b(0x4ff5)==1,'sky palette extension missing')
   assert(b(0x4ff4)==({88,72,56,0})[view+1],'palette/frame mismatch')
   assert(emu.read(0x3f05,emu.memType.nesPpuMemory)==0x1a,'sky green')
   assert(emu.read(0x3f06,emu.memType.nesPpuMemory)==0x30,'sky white')
   assert(emu.read(0x3f07,emu.memType.nesPpuMemory)==0x21,'sky blue')
   clocks[#clocks+1]=w(L.gsu_clocks)+65536*w(L.gsu_clocks+2)
   local f=assert(io.open(out..'/ground'..ground..'-view'..view..'.png','wb'));f:write(emu.takeScreenshot());f:close()
   shot=shot+1;settle=0
  end
 else settle=0 end
 if shot==8 then
  local f=assert(io.open(out..'/counters.json','w'))
  f:write(string.format('{"physics_ticks":%d,"audio_ticks":%d,"fault":%d,"captures":8}',w(L.physics_ticks),w(L.audio_ticks),b(0x4fe3)));f:close()
  local t=assert(io.open(out..'/gsu_clocks.json','w'));t:write('['..table.concat(clocks,',')..']');t:close()
  done=true;emu.stop(0)
 end
end,emu.eventType.endFrame)
'''.replace('LABELS','{'+','.join(f'{k}={v}' for k,v in labels.items())+'}').replace('OUTDIR',json.dumps(out.as_posix()))
    if args.trees:
        positions=json.loads((ROOT/'demos/racing/v003/trees.json').read_text())['source_positions']
        pose_lua='local positions={'+','.join('{'+str(x)+','+str(z+40)+'}' for x,z in positions)+'}\n'
        pose_lua+="emu.addMemoryCallback(function() local p=positions[math.min(shot+1,8)] local vals={0,p[1]%256,math.floor(p[1]/256),0,p[2]%256,math.floor(p[2]/256),0,0,0,0} for i,v in ipairs(vals) do emu.write(L.original_state+i-1,v,emu.memType.nesMemory) end end,emu.callbackType.exec,L.render_from_mmc5_state)\n"
        lua=lua.replace('local function b(a)',pose_lua+'local function b(a)').replace('local ground=math.floor(shot/4) local view=shot%4','local ground=0 local view=1').replace('settle>=4','settle>=40').replace("'/ground'..ground..'-view'..view", "'/tree'..shot")
    if args.measure_fps:
        lua=lua.replace('local clocks={}','local clocks={} local rates={} local startUpdates=0')
        timing=r"""local stamps={} local trace=assert(io.open(out..'/timing.csv','w'))
local function cycles() return emu.getState()['cpu.cycleCount'] end
emu.addMemoryCallback(function()
 local now=cycles()
 if stamps.start and stamps.go and stamps.hud and stamps.wait then
  trace:write(string.format('%d,%d,%d,%d,%d,%d\n',stamps.view,stamps.ground,stamps.go-stamps.start,stamps.hud-stamps.go,stamps.wait-stamps.hud,now-stamps.wait))
 end
 stamps={start=now,view=emu.read(L.view,emu.memType.nesMemory),ground=emu.read(L.ground,emu.memType.nesMemory)}
end,emu.callbackType.exec,L.frame)
emu.addMemoryCallback(function(a,v) if v==0x90 then stamps.go=cycles() end end,emu.callbackType.write,0x481f)
emu.addMemoryCallback(function() stamps.hud=cycles() end,emu.callbackType.exec,L.hud)
emu.addMemoryCallback(function() if not stamps.wait then stamps.wait=cycles() end end,emu.callbackType.exec,L.wait_present)
"""
        lua=lua.replace('local function b(a)',timing+'local function b(a)').replace('done=true;emu.stop(0)','trace:close();done=true;emu.stop(0)')

        lua=lua.replace('if settle>=4 then','if settle==4 then startUpdates=w(L.updates) end\n  if settle>=124 then\n   rates[#rates+1]=(w(L.updates)-startUpdates)*60.0988/120')
        lua=lua.replace('done=true;emu.stop(0)',"local f=assert(io.open(out..'/fps.json','w'));f:write('['..table.concat(rates,',')..']');f:close()\n  done=true;emu.stop(0)")
    if args.dump_gsu:
        dump=r"""emu.addMemoryCallback(function(a,v)
 if v~=0x90 or done then return end
 local data={} for i=0,40959 do data[#data+1]=string.char(emu.read(i,emu.memType.nesMapperRam)) end
 local f=assert(io.open(out..'/snapshot'..shot..'.bin','wb'));f:write(table.concat(data));f:close()
end,emu.callbackType.write,0x481f)
"""
        lua=lua.replace('local function b(a)',dump+'local function b(a)')
    script=ROOT/'build/racing/v003/visual.lua'  ;script.write_text(lua)
    settings=ROOT/'runtime/settings.json';before=settings.read_bytes();cfg=json.loads(before)
    cfg.setdefault('Debug',{}).setdefault('ScriptWindow',{})['AllowIoOsAccess']=True;settings.write_text(json.dumps(cfg))
    env=os.environ.copy();env.update(NES_GSU_MAPPER='n8pro-racing-gsu',NES_GSU_CLOCK_HZ='50000000')
    try:
        with core_lock(ROOT/'runtime/MesenCore.dll'):
            p=subprocess.run([str(ROOT/'runtime/Mesen.exe'),'--testRunner','--timeout=90','--doNotSaveSettings',str(args.rom.resolve()),str(script)],cwd=ROOT/'runtime',env=env,capture_output=True,timeout=100,creationflags=subprocess.CREATE_NO_WINDOW)
    finally:settings.write_bytes(before)
    (out/'emulator.log').write_bytes(p.stdout+p.stderr);assert p.returncode==0,(p.stdout,p.stderr)
    report=json.loads((out/'counters.json').read_text());assert report['fault']==0 and report['physics_ticks']==report['audio_ticks'],report
    from PIL import Image
    for ground in ([] if args.trees else [0,1]):
        for view,h in enumerate([88,72,56,0]):
            im=Image.open(out/f'ground{ground}-view{view}.png').convert('RGB')
            if h:assert set(im.crop((0,0,256,h)).getdata())=={(100,176,255)},('sky pixels',ground,view)
            assert (181,49,32) in set(im.getdata()),('red car missing',ground,view)
    print(json.dumps(report))


if __name__=='__main__':main()
