"""家と木の近景を実際の PPU で描画し、独立した色参照と照合する。"""
import argparse,hashlib,json,os,re,struct,subprocess
from pathlib import Path
from PIL import Image
from native_lock import core_lock
from verify_ground import decode
from verify_mode7_pixels import div
from verify_racing_scenery import cases
ROOT=Path(__file__).resolve().parents[1]
COLORS=[(255,254,255),(181,49,32),(12,147,0),(102,102,102),(100,176,255)]

def main():
    p=argparse.ArgumentParser();p.add_argument('--rom',type=Path,required=True)
    p.add_argument('--runtime',type=Path,required=True);p.add_argument('--out',type=Path,required=True)
    p.add_argument('--legacy',action='store_true');p.add_argument('--compare-results',type=Path)
    p.add_argument('--cases',type=Path);p.add_argument('--measure-fps',action='store_true');a=p.parse_args()
    out=a.out.resolve();out.mkdir(parents=True,exist_ok=True);runtime=a.runtime.resolve();rom=a.rom.resolve()
    rows=[r for r in cases() if re.fullmatch(r'object-(0|8|9)-v[01]-a(0|8192|40960)-d40',r['name'])]
    rows += [dict(rows[0],name='hidden-fx',hide=1)]
    if a.cases:rows=json.loads(a.cases.read_text())
    labels={n:int(v,16) for v,n in re.findall(r'al ([0-9A-Fa-f]+) \.([^\s]+)',(ROOT/'build/racing/v005/cpu.lbl').read_text())}
    lua=r'''local L=LABELS local rows=ROWS local out=OUTDIR
local shot=1 local settle=0 local frames=0 local done=false local clocks={}
local function b(a) return emu.read(a,emu.memType.nesMemory) end
local function w(a) return b(a)+256*b(a+1) end
local function dump(name,data) local f=assert(io.open(out..'/'..name,'wb'));f:write(data);f:close() end
emu.addMemoryCallback(function()
 if done then return end
 for i,v in ipairs(rows[shot].state) do emu.write(L.original_state+i-1,v,emu.memType.nesMemory) end
end,emu.callbackType.exec,L.render_from_mmc5_state)
emu.addEventCallback(function()
 if done then return end
 frames=frames+1;assert(frames<4000,'timeout')
 local row=rows[shot] local hide=row.hide or 0
 emu.write(L.desired_view,row.view,emu.memType.nesMemory)
 emu.write(L.desired_ground,hide,emu.memType.nesMemory)
 if w(L.updates)>2 and b(L.displayed_view)==row.view and b(L.displayed_ground)==hide then
  settle=settle+1
  if settle==24 then
   assert(b(0x4fe3)==0,'FX fault');assert(math.floor(b(0x4fb0)/4)%2==0,'Mode7 fault')
   assert(w(0x4fb4)==w(L.displayed_tick),'generation mismatch')
   assert(w(L.physics_ticks)==w(L.audio_ticks),'audio mismatch')
   dump(row.name..'.png',emu.takeScreenshot())
   local ram={} for i=0,16383 do ram[#ram+1]=string.char(emu.read(b(L.front)*16384+i,emu.memType.nesMapperRam)) end
   dump(row.name..'.bin',table.concat(ram))
   local camera={} for i=0,13 do camera[#camera+1]=string.char(emu.read(0x8008+i,emu.memType.nesMapperRam)) end
   dump(row.name..'.camera',table.concat(camera))
   clocks[#clocks+1]=w(L.gsu_clocks)+65536*w(L.gsu_clocks+2)
   shot=shot+1;settle=0
   if shot>#rows then dump('clocks.json','['..table.concat(clocks,',')..']');done=true;emu.stop(0) end
  end
 else settle=0 end
end,emu.eventType.endFrame)
'''
    lua=lua.replace('LABELS','{'+','.join(f'{k}={v}' for k,v in labels.items())+'}')
    lua=lua.replace('ROWS','{'+','.join('{name='+json.dumps(r['name'])+',view='+str(r['view'])+',hide='+str(r.get('hide',0))+',state={'+','.join(map(str,r['state']))+'}}' for r in rows)+'}')
    lua=lua.replace('OUTDIR',json.dumps(out.as_posix()));script=out/'capture.lua';script.write_text(lua)
    if a.measure_fps:
        lua=lua.replace('local clocks={}','local clocks={} local stamps={} local mark=0')
        lua=lua.replace('  if settle==24 then','  if settle==10 then mark=w(L.updates) end\n  if settle==130 then\n   stamps[#stamps+1]=(w(L.updates)-mark)%65536')
        lua=lua.replace("done=true;emu.stop(0)","dump('fps.json','['..table.concat(stamps,',')..']');done=true;emu.stop(0)")
        script.write_text(lua)
    settings=runtime/'settings.json';before=settings.read_bytes();cfg=json.loads(before)
    cfg.setdefault('Debug',{}).setdefault('ScriptWindow',{})['AllowIoOsAccess']=True;settings.write_text(json.dumps(cfg))
    env=os.environ.copy();env.update(NES_GSU_MAPPER='n8pro-racing-gsu',NES_GSU_CLOCK_HZ='25000000')
    try:
        with core_lock(runtime/'MesenCore.dll'):
            run=subprocess.run([runtime/'Mesen.exe','--testRunner','--timeout=90','--doNotSaveSettings',rom,script],cwd=runtime,env=env,capture_output=True,timeout=100,creationflags=subprocess.CREATE_NO_WINDOW)
    finally:settings.write_bytes(before)
    (out/'emulator.log').write_bytes(run.stdout+run.stderr);assert run.returncode==0,(run.stdout,run.stderr)
    texture=rom.read_bytes()[1048608:1151008];pixels=gray=overflow=0
    for row in rows:
        name=row['name'];cx,cz,h,cs,sn,pc,ps=struct.unpack('<7h',(out/(name+'.camera')).read_bytes())
        fx=decode((out/(name+'.bin')).read_bytes()) if not row.get('hide') else bytes(256*192)
        expected=[];lost=preserved=0
        for y in range(192):
            dy=y-96;den=ps*128+dy*pc;norm=cs*cs+sn*sn;sky=den<=0;valid=False
            if not sky:
                forward=div(h*512*(pc*128-dy*ps),den);depth=div(forward*pc+h*512*ps,256);valid=0<depth<=144*65536
                if valid:
                    du=div(-depth*cs*256*5,norm*128);dv=div(depth*sn*256*5,norm*128)
                    u0=(cx*512+div(forward*sn*256,norm))*5+320*65536-128*du
                    v0=(cz*512+div(forward*cs*256,norm))*5+320*65536-128*dv
            for x in range(256):
                fg=fx[y*256+x];color=4 if sky else 2
                if sky:
                    group=set(fx[y*256+(x//8)*8:y*256+(x//8)*8+8])
                    fallback=group=={0,1,2,3}
                    if x%8==0 and fallback:overflow+=1
                    if fg:
                        color=4 if fg==3 and (a.legacy or fallback) else fg
                        if fg==3:
                            if color==3:preserved+=1
                            else:lost+=1
                else:
                    if valid:
                        u=u0+x*du;v=v0+x*dv
                        if 0<=u<640*65536 and 0<=v<640*65536:
                            at=(v>>16)*640+(u>>16);color=(texture[at//4]>>(6-2*(at%4)))&3
                    if fg:color=fg
                expected.append(COLORS[color])
        got=list(Image.open(out/(name+'.png')).convert('RGB').crop((0,0,256,192)).getdata())
        if got!=expected:
            im=Image.new('RGB',(256,192));im.putdata(expected);im.save(out/(name+'-expected.png'))
            raise AssertionError((name,sum(x!=y for x,y in zip(got,expected))))
        row.update(sky_gray_preserved=preserved,sky_gray_to_blue=lost);gray+=preserved;pixels+=len(expected)
    assert a.legacy or gray>0,'no recovered gray was tested'
    report={'status':'pass','legacy':a.legacy,'rom_sha256':hashlib.sha256(rom.read_bytes()).hexdigest(),
            'core_sha256':hashlib.sha256((runtime/'MesenCore.dll').read_bytes()).hexdigest(),
            'ppu_pixels':pixels,'sky_gray_preserved':gray,'four_color_overflow_blocks':overflow,'cases':rows,'hardware_tested':False}
    if a.measure_fps:
        report['measured_fps']=[n*60.0988/120 for n in json.loads((out/'fps.json').read_text())]
    if a.compare_results:
        baseline=a.compare_results.resolve();ground_pixels=0;changed_pixels=0
        assert json.loads((baseline/'clocks.json').read_text())==json.loads((out/'clocks.json').read_text()),'GSU workload changed'
        for row in rows:
            name=row['name']
            for suffix in ['.bin','.camera']:assert (baseline/(name+suffix)).read_bytes()==(out/(name+suffix)).read_bytes(),(name,suffix)
            camera=struct.unpack('<7h',(out/(name+'.camera')).read_bytes());pc,ps=camera[5:]
            old=list(Image.open(baseline/(name+'.png')).convert('RGB').getdata())
            new=list(Image.open(out/(name+'.png')).convert('RGB').getdata())
            for i,(x,y) in enumerate(zip(old,new)):
                if i//256>=192 or ps*128+(i//256-96)*pc>0:
                    assert x==y,'ground/HUD changed';ground_pixels+=1
                elif x!=y:
                    assert x==COLORS[4] and y==COLORS[3],'unexpected sky change';changed_pixels+=1
        report.update(unchanged_ground_and_hud_pixels=ground_pixels,changed_sky_pixels=changed_pixels,identical_gsu_clocks=True,identical_fx_frames=len(rows))
    (out/'verification.json').write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps({k:v for k,v in report.items() if k!='cases'}))

if __name__=='__main__':main()
