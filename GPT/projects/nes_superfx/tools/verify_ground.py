"""両方式・4視点・64位置の独立画素参照と実ROMの表示／入力を検証。"""
import argparse,json,os,re,subprocess
from pathlib import Path
from PIL import Image
from build_ground import ROOT,OUT,build
from ground_reference import reference
from run_bitmap import pixel_byte
from native_lock import core_lock

def decode(data):
    return bytes(((data[pixel_byte(x,y,0)]>>(7-x%8))&1)|(((data[pixel_byte(x,y,0)+1]>>(7-x%8))&1)<<1)
                 for y in range(192) for x in range(256))

def native(config,mhz):
    proc=subprocess.run([str(ROOT/'build/Release/nesfx_ground_probe.exe'),str(OUT),str(mhz)],capture_output=True,check=True)
    result=json.loads(proc.stdout);(OUT/f'native_{mhz}.json').write_bytes(proc.stdout)
    for record in result['frames']:
        view,mode,phase=[record[k] for k in ['view','mode','phase']]
        name=OUT/f'native_{mhz}_{view}_{mode}_{phase}.bin'
        actual=decode(name.read_bytes());expected,im,_=reference(config,view,mode,phase)
        if actual!=expected:
            im.save(OUT/'expected.png')
            picture=Image.new('RGB',(256,192));picture.putdata([tuple(config['palette'][c]) for c in actual]);picture.save(OUT/'actual.png')
            raise AssertionError((mhz,view,mode,phase,'native mismatch',sum(a!=b for a,b in zip(actual,expected))))
    result['pixels_checked']=len(result['frames'])*256*192
    result['status']='pass';return result

def frontend(config,mhz,samples):
    out=OUT/f'frontend_{mhz}';out.mkdir(exist_ok=True)
    labels={n:int(a,16) for a,n in re.findall(r'al ([0-9A-Fa-f]+) \.([^\s]+)',(OUT/'cpu.lbl').read_text())}
    code=r'''local L=LABELS local out=OUTDIR local frame=0 local last=-1 local stable=0
local sample=0 local wanted=0 local pressUntil=-1 local press={} local done=false local pauseStage=0 local pausePhase=nil
local trace=assert(io.open(out..'/trace.jsonl','w')) local captures=assert(io.open(out..'/captures.jsonl','w'))
local function byte(a) return emu.read(a,emu.memType.nesMemory) end
local function word(a) return byte(a)+256*byte(a+1) end
local function capture(v,m,p)
 local name=string.format('/%02d_%02d',wanted,sample) local screen=emu.getScreenBuffer() local rgb={}
 for i=1,#screen do local c=screen[i];rgb[i]=string.char(math.floor(c/65536)%256,math.floor(c/256)%256,c%256) end
 local f=assert(io.open(out..name..'.rgb','wb'));f:write(table.concat(rgb));f:close()
 local front=byte(0x5fe2) local ram={}
 for i=0,16383 do ram[#ram+1]=string.char(emu.read(front*16384+i,emu.memType.nesMapperRam)) end
 f=assert(io.open(out..name..'.ram','wb'));f:write(table.concat(ram));f:close()
 captures:write(string.format('{"profile":%d,"sample":%d,"view":%d,"mode":%d,"phase":%d,"frame":%d,"updates":%d,"fields":%d}\n',wanted,sample,v,m,p,frame,word(L.updates),byte(L.render_fields)));captures:flush()
end
emu.addEventCallback(function() emu.setInput(frame<pressUntil and press or {},0) end,emu.eventType.inputPolled)
emu.addEventCallback(function()
 if done then return end
 local ok,err=pcall(function()
  frame=frame+1;assert(frame<10000,'timeout');assert(byte(L.stage)~=0xe1,'mapper missing');assert(byte(0x5fe3)==0,'bitmap fault');assert(byte(L.queue_overflow)==0,'input queue overflow')
  local u=word(L.updates) local v=byte(L.displayed_view) local m=byte(L.displayed_ground) local p=byte(L.displayed_phase)
  if u~=last then
   local clocks=0 for i=3,0,-1 do clocks=clocks*256+byte(L.gsu_clocks+i) end
   trace:write(string.format('{"frame":%d,"updates":%d,"view":%d,"mode":%d,"phase":%d,"gsu_clocks":%d,"missed":%d}\n',frame,u,v,m,p,clocks,word(L.missed)));trace:flush();last=u;stable=0
  else stable=stable+1 end
  if wanted==8 then
   if frame<pressUntil then return end
   if pauseStage==0 and u>0 and stable==1 then press={select=true};pressUntil=frame+8;pauseStage=1;return end
   if pauseStage==1 and stable==1 then assert(v==2,'view wraparound failed');press={b=true};pressUntil=frame+8;pauseStage=2;return end
   if pauseStage==2 and byte(L.paused)==1 and stable==1 then pausePhase=p;press={a=true};pressUntil=frame+8;pauseStage=3;return end
   if pauseStage==3 and stable==1 then
    assert(byte(L.paused)==1 and p==pausePhase and m==0,'renderer changed position while paused')
    press={right=true};pressUntil=frame+8;pauseStage=4;return
   end
   if pauseStage==4 and stable==1 then
    assert(p==(pausePhase+1)%64,'step did not move exactly once')
    press={left=true};pressUntil=frame+8;pauseStage=5;return
   end
   if pauseStage==5 and stable==1 then
    assert(p==pausePhase,'reverse step did not move exactly once')
    done=true;trace:close();captures:close();emu.stop(0)
   end
   return
  end
  local wantV=(2+math.floor(wanted/2))%4 local wantM=wanted%2
  if u>0 and stable==1 and v==wantV and m==wantM then
   assert(word(L.switches)==wanted,'held A repeated')
   capture(v,m,p);sample=sample+1
   if sample==SAMPLES then
    sample=0;wanted=wanted+1
    if wanted<8 then press={a=true,select=(wanted%2==0)};pressUntil=frame+8 end
   end
  end
 end)
 if not ok then local f=assert(io.open(out..'/error.txt','w'));f:write(tostring(err));f:close();emu.stop(1) end
end,emu.eventType.endFrame)
'''.replace('LABELS','{'+','.join(f'{k}={v}' for k,v in labels.items())+'}').replace('OUTDIR',json.dumps(out.as_posix())).replace('SAMPLES',str(samples))
    script=out/'test.lua';script.write_text(code,encoding='utf-8')
    settings=ROOT/'runtime/settings.json';before=settings.read_bytes();cfg=json.loads(before)
    cfg.setdefault('Debug',{}).setdefault('ScriptWindow',{})['AllowIoOsAccess']=True
    cfg.setdefault('Nes',{}).setdefault('Port1',{})['Type']='NesController'
    settings.write_text(json.dumps(cfg),encoding='utf-8');env=os.environ.copy()
    env.update(NES_GSU_MAPPER='n8pro-gsu-abi2',NES_GSU_CLOCK_HZ=str(mhz*1000000))
    try:
        with core_lock(ROOT/'runtime/MesenCore.dll'):
            proc=subprocess.run([str(ROOT/'runtime/Mesen.exe'),'--testRunner','--timeout=180','--doNotSaveSettings','--enableStdout',str(OUT/config.get('rom_name','GSU_GroundCompare_v001.nes')),str(script)],cwd=ROOT/'runtime',env=env,capture_output=True,timeout=190,creationflags=getattr(subprocess,'CREATE_NO_WINDOW',0))
    finally:settings.write_bytes(before)
    (out/'emulator.log').write_bytes(proc.stdout+proc.stderr)
    if proc.returncode:raise RuntimeError((out/'error.txt').read_text() if (out/'error.txt').exists() else proc.stdout)
    records=[json.loads(s) for s in (out/'captures.jsonl').read_text().splitlines()]
    trace=[json.loads(s) for s in (out/'trace.jsonl').read_text().splitlines()]
    images=[]
    for r in records:
        stem=out/f"{r['profile']:02d}_{r['sample']:02d}";actual=Image.frombytes('RGB',(256,240),stem.with_suffix('.rgb').read_bytes())
        expected,im,_=reference(config,r['view'],r['mode'],r['phase'])
        assert decode(stem.with_suffix('.ram').read_bytes())==expected,(r,'RAM')
        canvas=Image.new('RGB',(256,240),tuple(config['palette'][0]));canvas.paste(im)
        lines=[(8,200,('T' if r['mode'] else 'P')+' V='+str(r['view']+1)),(8,212,'C='+str(mhz)),(80,212,'F='+str(min(9,r['fields'])))]
        for x,y,text in lines:
            for col,c in enumerate(text):
                for dy,row in enumerate(config['font'][c]):
                    for dx,bit in enumerate(row):
                        if bit=='1':canvas.putpixel((x+col*8+dx+1,y+dy+1),(255,254,255))
        if canvas.tobytes()!=actual.tobytes():
            canvas.save(out/'expected.png');actual.save(out/'actual.png');raise AssertionError((r,'PPU mismatch'))
        actual.save(stem.with_suffix('.png'));images.append(actual)
    durations=[max(20,round(((records[i+1]['frame']-r['frame']) if i+1<len(records) else 4)*16.639/10)*10) for i,r in enumerate(records)]
    images[0].save(out/'demo.gif',save_all=True,append_images=images[1:],duration=durations,loop=0,optimize=False)
    return {'status':'pass','mhz':mhz,'captures':records,'trace':trace,'held_a_repeats':False,'pause_and_step':True,'gsu_pixels_checked':len(records)*256*192,'ppu_pixels_checked':len(records)*256*240}

def main():
    global OUT
    parser=argparse.ArgumentParser();parser.add_argument('--mhz',type=int,choices=[25,50],default=50)
    parser.add_argument('--samples',type=int,default=8);parser.add_argument('--frontend-only',action='store_true')
    parser.add_argument('--directory',type=Path,default=OUT);args=parser.parse_args();OUT=args.directory.resolve()
    config=json.loads((OUT/'config.json').read_text())
    result={'native':None if args.frontend_only else native(config,args.mhz),'frontend':frontend(config,args.mhz,args.samples)}
    (OUT/f'verification_{args.mhz}.json').write_text(json.dumps(result,indent=2)+'\n')
    print(json.dumps({'status':'pass','mhz':args.mhz,'native_frames':len(result['native']['frames']) if result['native'] else 0,'frontend_images':len(result['frontend']['captures'])}))

if __name__=='__main__':main()
