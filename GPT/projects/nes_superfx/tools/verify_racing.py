"""元ROMの物理実行と走行ROMを、実パッド・60Hz・描画中断込みで照合。"""
import argparse,copy,hashlib,json,os,re,struct,subprocess
from pathlib import Path
from py65.devices.mpu6502 import MPU
from PIL import Image
from build_ground import ROOT,VIEWS
from mmc5_state import pose,snapshot
from ground_reference import reference
from verify_ground import decode
from native_lock import core_lock

OUT=ROOT/'build/racing/v001'
FIELDS=[a for a in range(0x40,0xea) if a not in [0xc2,0xc3,0xc4]]

class Memory:
    def __init__(self,rom,mode):
        self.prg=rom[16:16+1048576];self.ram=bytearray(2048)
        self.ram[:]=(OUT/mode/'initial-cpu.bin').read_bytes()
        self.wram=bytearray((OUT/mode/'initial-wram.bin').read_bytes())
        self.banks=[0xfd,0xed,0xfa,0xff];self.rambank=0;self.mul=[0,0];self.executed=set()
    def __getitem__(self,a):
        if isinstance(a,slice):return [self[i] for i in range(a.start,a.stop)]
        if a<0x2000:return self.ram[a&2047]
        if a==0x5205:return self.mul[0]*self.mul[1]&255
        if a==0x5206:return self.mul[0]*self.mul[1]>>8
        if a>=0x8000:
            b=self.banks[(a-0x8000)//8192]
            return self.prg[(b&127)*8192+(a&8191)] if b&128 else self.wram[(b&15)*8192+(a&8191)]
        if a>=0x6000:return self.wram[self.rambank*8192+(a&8191)]
        return 0
    def __setitem__(self,a,v):
        if a<0x2000:self.ram[a&2047]=v
        elif 0x5114<=a<=0x5117:self.banks[a-0x5114]=v
        elif a==0x5113:self.rambank=v&15
        elif a in [0x5205,0x5206]:self.mul[a-0x5205]=v
        elif 0x6000<=a<0x8000:self.wram[self.rambank*8192+(a&8191)]=v
    def step(self,buttons,tick):
        self.ram[0x16]=buttons;self.ram[0]=tick&255;self.ram[1]=tick>>8
        self.wram[0x740:0x742]=bytes([1,0]);self.rambank=0
        c=MPU(memory=self,pc=0xf78a);c.sp=0xd0
        for _ in range(12000):
            if c.pc==0xf7a9:break
            # Run unchanged road/vehicle code; exclude the game's scenery crash scene.
            if c.pc==0xfa43:c.pc=0xf796
            if c.pc>=0x8000:self.executed.add(self.banks[(c.pc-0x8000)//8192]&127)
            c.step()
        else:raise AssertionError(('physics timeout',hex(c.pc)))
        elapsed=c.processorCycles
        self.banks[1]=0xf1
        self.ram[0x700:0x704]=bytes([0x20,0,0xa0,0xea])
        c=MPU(memory=self,pc=0x700);c.sp=0xd0
        for _ in range(12000):
            c.step()
            if c.pc==0x703:break
        else:raise AssertionError('legacy camera timeout')
        return elapsed+c.processorCycles

def baseline_check():
    reports=[]
    for mode in ['grip','drift']:
        mem=Memory((OUT/'baseline.nes').read_bytes(),mode)
        rows=[json.loads(x) for x in (OUT/mode/'native.jsonl').read_text().splitlines()]
        for r in rows:
            mem.step(r['buttons'],r['tick'])
            diffs=[hex(a) for a in FIELDS if mem.ram[a]!=r['state'][a-64]]
            assert not diffs,(mode,r['tick'],'original native replay',diffs)
        reports.append({'mode':mode,'native_original_ticks':len(rows),'physical_fields':len(FIELDS),'status':'pass','executed_prg_banks':sorted(mem.executed)})
    return reports

def native(mode,mhz,ground,ticks):
    labels={n:int(a,16) for a,n in re.findall(r'al ([0-9A-Fa-f]+) \.([^\s]+)',(OUT/'cpu.lbl').read_text())}
    out=OUT/f'native_{mode}_{mhz}_{ground}';out.mkdir(exist_ok=True)
    code=r'''local L=LABELS local out=OUTDIR local wantedMode=MODE local wantedGround=GROUND local frame=0 local count=0 local last=-1 local done=false local started=0 local capturePending=false
local trace=assert(io.open(out..'/physics.jsonl','w')) local images=assert(io.open(out..'/images.jsonl','w'))
local function byte(a) return emu.read(a,emu.memType.nesMemory) end
local function word(a) return byte(a)+256*byte(a+1) end
local function put(a,v) emu.write(a,v,emu.memType.nesMemory) end
local function dump(name,a,n,kind)
 local t={} for i=0,n-1 do t[#t+1]=string.char(emu.read(a+i,kind)) end
 local f=assert(io.open(out..'/'..name,'wb'));f:write(table.concat(t));f:close()
end
emu.addMemoryCallback(function() put(L.desired_mode,wantedMode);put(L.desired_ground,wantedGround) end,emu.callbackType.exec,L.restart)
emu.addEventCallback(function()
 local k={} local phase=count%320
 if phase<235 then k.a=true end
 if phase>=55 and phase<100 then k.right=true;k.b=true elseif phase>=100 and phase<135 then k.left=true end
 -- Renderer controls are ignored by original vehicle physics, but still passed through.
 if count==200 or count==400 or count==600 then k.select=true end
 emu.setInput(k,0)
end,emu.eventType.inputPolled)
emu.addMemoryCallback(function() started=emu.getState()['cpu.cycleCount'] end,emu.callbackType.exec,L.sim_begin)
emu.addMemoryCallback(function()
 count=count+1
 local state={} for a=0x40,0xff do state[#state+1]=byte(a) end
 trace:write('{"tick":'..count..',"frame":'..frame..',"cycles":'..(emu.getState()['cpu.cycleCount']-started)..',"buttons":'..byte(0x40)..',"offroad":'..byte(0x6771)..',"tail":'..byte(0x6772)..',"state":['..table.concat(state,',')..']}\n');trace:flush()
end,emu.callbackType.exec,L.sim_end)
emu.addEventCallback(function()
 if done then return end
 frame=frame+1
 local ok,err=pcall(function()
 if frame==2499 then dump('timeout-cpu.bin',0,2048,emu.memType.nesMemory) end
 assert(frame<2500,'timeout stage='..byte(L.stage)..' ticks='..word(L.physics_ticks)..' PC='..tostring(emu.getState()['cpu.pc']));assert(byte(L.stage)~=0xe1,'pose range error');assert(byte(0x4fe3)==0,'bitmap fault='..byte(0x4fe3)..' tick='..count..' frame='..frame)
 local update=word(L.updates)
 if update~=last and update>0 then
  last=update;capturePending=true
 elseif update>0 and capturePending then
  -- Front swaps at NMI. Wait one field for the newly published PPU frame.
  capturePending=false
  if update<=24 or update%40==0 then
   local front=byte(0x4fe2) local name='image'..update
   dump(name..'.ram',front*16384,16384,emu.memType.nesMapperRam)
   dump(name..'.state',0x320,12,emu.memType.nesMemory)
   local f=assert(io.open(out..'/'..name..'.png','wb'));f:write(emu.takeScreenshot());f:close()
   images:write('{"name":"'..name..'","view":'..byte(L.displayed_view)..',"mode":'..byte(L.displayed_ground)..',"tick":'..word(L.displayed_tick)..',"frame":'..frame..'}\n');images:flush()
  end
 end
 if count>=TICKS then trace:close();images:close();done=true;emu.stop(0) end
 end)
 if not ok then local f=assert(io.open(out..'/error.txt','w'));f:write(tostring(err));f:close();emu.stop(1) end
end,emu.eventType.endFrame)
'''.replace('LABELS','{'+','.join(f'{k}={v}' for k,v in labels.items())+'}').replace('OUTDIR',json.dumps(out.as_posix())).replace('MODE',str(0 if mode=='grip' else 1)).replace('GROUND',str(ground)).replace('TICKS',str(ticks))
    script=out/'test.lua';script.write_text(code)
    settings=ROOT/'runtime/settings.json';before=settings.read_bytes();cfg=json.loads(before)
    cfg.setdefault('Debug',{}).setdefault('ScriptWindow',{})['AllowIoOsAccess']=True
    cfg.setdefault('Nes',{}).setdefault('Port1',{})['Type']='NesController'
    settings.write_text(json.dumps(cfg));env=os.environ.copy();env.update(NES_GSU_MAPPER='n8pro-racing-gsu',NES_GSU_CLOCK_HZ=str(mhz*1000000))
    try:
        with core_lock(ROOT/'runtime/MesenCore.dll'):
            p=subprocess.run([str(ROOT/'runtime/Mesen.exe'),'--testRunner','--timeout=120','--doNotSaveSettings','--enableStdout',str(OUT/'GSU_MMC5Racing3D_v001.nes'),str(script)],cwd=ROOT/'runtime',env=env,capture_output=True,timeout=130,creationflags=getattr(subprocess,'CREATE_NO_WINDOW',0))
    finally:settings.write_bytes(before)
    (out/'emulator.log').write_bytes(p.stdout+p.stderr)
    assert p.returncode==0,(out/'error.txt').read_text() if (out/'error.txt').exists() else p.stdout
    rows=[json.loads(x) for x in (out/'physics.jsonl').read_text().splitlines()]
    mem=Memory((OUT/'baseline.nes').read_bytes(),mode)
    for r in rows:
        mem.step(r['buttons'],r['tick'])
        diff=[hex(a) for a in FIELDS if mem.ram[a]!=r['state'][a-64]]
        assert not diff,(mode,mhz,ground,r['tick'],diff)
        assert mem.wram[0x771]==r['offroad'] and mem.wram[0x772]==r['tail']
    assert len(rows)>=ticks
    assert all(b['frame']==a['frame']+1 for a,b in zip(rows,rows[1:])),('physics missed a field',mode,mhz,ground)
    config=json.loads((OUT/'config.json').read_text());images=[json.loads(x) for x in (out/'images.jsonl').read_text().splitlines()]
    if mode=='drift':
        for i in range(config['own_first_vertex'],len(config['vertices'])):config['vertices'][i][0]=128 if (i-config['own_first_vertex'])&1 else -128
    for r in images:
        state=(out/(r['name']+'.state')).read_bytes()
        # The request can already be for the next image at endFrame; select the displayed tick from physical trace instead.
        s=rows[r['tick']-1]['state'];raw=snapshot(int.from_bytes(bytes(s[1:4]),'little',signed=True),int.from_bytes(bytes(s[4:7]),'little',signed=True),s[8]+256*s[9],tick=r['tick'])
        c=copy.deepcopy(config);c['views'][r['view']]['poses'][0]=pose(raw,VIEWS[r['view']])
        expected,_,_=reference(c,r['view'],r['mode'],0)
        actual=decode((out/(r['name']+'.ram')).read_bytes())
        assert actual==expected,('GSU frame mismatch',r,sum(a!=b for a,b in zip(actual,expected)))
    return {'status':'pass','mode':mode,'mhz':mhz,'ground':ground,'ticks':len(rows),'physics_fields':len(FIELDS),'physics_every_field':True,'physics_cycles_max':max(r['cycles'] for r in rows),'offroad_ticks':sum(r['offroad'] for r in rows),'images_checked':len(images),'executed_original_banks':sorted(mem.executed)}

def main():
    p=argparse.ArgumentParser();p.add_argument('--ticks',type=int,default=1024);p.add_argument('--mode',choices=['grip','drift'],default='grip');p.add_argument('--mhz',type=int,default=50);p.add_argument('--ground',type=int,default=0);p.add_argument('--all',action='store_true');args=p.parse_args()
    check=baseline_check();results=[]
    cases=[(m,h,g) for m in ['grip','drift'] for h in [25,50] for g in [0,1]] if args.all else [(args.mode,args.mhz,args.ground)]
    for mode,mhz,ground in cases:
        result=native(mode,mhz,ground,args.ticks);results.append(result)
        report={'status':'pass','rom_sha256':hashlib.sha256((OUT/'GSU_MMC5Racing3D_v001.nes').read_bytes()).hexdigest(),'original_native_replay':check,'native':result}
        (OUT/f'verification_{mode}_{mhz}_{ground}.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(result),flush=True)
    if args.all:(OUT/'verification.json').write_text(json.dumps({'status':'pass','rom_sha256':hashlib.sha256((OUT/'GSU_MMC5Racing3D_v001.nes').read_bytes()).hexdigest(),'original_native_replay':check,'results':results},indent=2)+'\n')

if __name__=='__main__':main()
