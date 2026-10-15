"""元の車体比率と実6502の物理状態接続、実ROMへの任意状態入力を検証。"""
import argparse,copy,json,math,random,re,struct
from pathlib import Path
from PIL import Image,ImageDraw
from py65.devices.mpu6502 import MPU
from build_ground import ROOT,VIEWS
from mmc5_state import CAR,direction,pose,snapshot,unpack
from ground_reference import reference
from verify_ground import decode

OUT=ROOT/'build/ground/v003'
DEMO=ROOT/'demos/ground/v003'

def labels():return {n:int(a,16) for a,n in re.findall(r'al ([0-9A-Fa-f]+) \.([^\s]+)',(OUT/'cpu.lbl').read_text())}

def geometry(config):
    data=json.loads((DEMO/'car_source.json').read_text())
    art=data['F1'];pixels=[(x,y) for y,row in enumerate(art) for x,c in enumerate(row) if c!='.']
    bounds=[min(x for x,y in pixels),min(y for x,y in pixels),max(x for x,y in pixels)+1,max(y for x,y in pixels)+1]
    assert bounds==CAR['source_opaque_bounds_exclusive']
    local=config['vertices'][config['own_first_vertex']:]
    w=(max(p[0] for p in local)-min(p[0] for p in local))*5/128
    length=(max(p[2] for p in local)-min(p[2] for p in local))*5/128
    assert abs(w-12)<=5/128 and abs(length-13)<=5/128
    # Original source and rendered footprint shown against the same 64px road.
    canvas=Image.new('RGB',(160,96),(12,147,0));d=ImageDraw.Draw(canvas)
    d.rectangle((8,0,71,95),fill=(102,102,102));d.rectangle((88,0,151,95),fill=(102,102,102))
    for x,y in pixels:
        color=(0,0,0) if art[y][x] in 'Kt' else (255,254,255)
        canvas.putpixel((32+x,40+y),color)
    d.rectangle((114,42,125,54),fill=(255,254,255))
    d.text((10,8),'ORIGINAL',fill=(255,255,255));d.text((90,8),'3D PLAN',fill=(255,255,255))
    canvas.resize((640,384),Image.Resampling.NEAREST).save(OUT/'car_scale.png')
    return {'source_opaque_bounds_exclusive':bounds,'source_width_px':12,'source_length_px':13,
            'render_width_source_px':w,'render_length_source_px':length,
            'source_width_to_asphalt':12/64,'render_width_to_asphalt':w/64,
            'source_length_to_asphalt':13/64,'render_length_to_asphalt':length/64,
            'source_files':data['source_files'],'source_revision':data['source_revision']}

def cpu(config):
    lab=labels();rom=(OUT/config['rom_name']).read_bytes();rng=random.Random(0x5f3)
    mem=bytearray(65536);mem[0x8000:]=rom[16:16+32768]
    mem[0x700:0x704]=bytes([0x20,lab['render_from_mmc5_state']&255,lab['render_from_mmc5_state']>>8,0xea])
    protected=bytes(rng.randrange(256) for _ in range(192));mem[0x40:0x100]=protected
    cases=[]
    for v in range(4):
        cases += [(snapshot(568*256+128,392*256,h*64,(h*64+8192)&65535,23),v) for h in range(1024)]
    for _ in range(1024):
        cases.append((snapshot(rng.randrange(-128*256,800*256),rng.randrange(-128*256,800*256),rng.randrange(65536),rng.randrange(65536),rng.randrange(65536)),rng.randrange(4)))
    # Boundary fractions at the origin and the 0xffff heading wrap.
    for raw in [-11,-10,-9,-1,0,1,9,10,11]:
        for h in [0,31,32,63,64,16384,32768,49152,65503,65504,65535]:
            cases.append((snapshot(320*256+raw,320*256-raw,h),2))
    cycles=[];max_position_error=0
    for state,v in cases:
        mem[0x300:0x30c]=state;mem[lab['view']]=v
        m=MPU(memory=mem,pc=0x700);m.sp=0xff
        for _ in range(5000):
            m.step()
            if m.pc==0x703:break
        else:raise AssertionError('6502 conversion did not return')
        assert not m.p&1 and mem[0x311]==0
        actual=list(struct.unpack('<11h',mem[0x6008:0x601e]));expected=pose(state,VIEWS[v])
        assert actual==expected,(unpack(state),v,actual,expected)
        assert mem[0x300:0x30c]==state and mem[0x40:0x100]==protected
        assert mem[0x320:0x32c]==state
        x,y,h,cam,tick=unpack(state)
        for raw,out in [(x,actual[7]),(y,actual[8])]:
            error=abs(out/128*5+320-raw/256)
            max_position_error=max(max_position_error,error)
            assert error<5/128
        # Angular reference uses the source angle, independently of LUT indexing.
        for heading,cs,sn in [(h,actual[9],actual[10]),(cam,actual[3],actual[4])]:
            angle=math.atan2(sn,-cs);err=abs((angle-heading*math.tau/65536+math.pi)%math.tau-math.pi)
            assert err<math.radians(.34)
        cycles.append(m.processorCycles)
    # Reject positions outside the output range without overwriting a pose.
    for state in [snapshot(1700*256,0,0),snapshot(-1000*256,0,0)]:
        before=bytes(mem[0x6008:0x601e]);mem[0x300:0x30c]=state
        m=MPU(memory=mem,pc=0x700);m.sp=0xff
        while m.pc!=0x703:m.step()
        assert m.p&1 and mem[0x311]==1 and mem[0x6008:0x601e]==before
    # Snapshot helper reads the actual original ABI, including all position bytes.
    mem[0x700:0x704]=bytes([0x20,lab['capture_mmc5_state']&255,lab['capture_mmc5_state']>>8,0xea])
    before=bytes(mem[0x40:0x100]);m=MPU(memory=mem,pc=0x700);m.sp=0xff
    while m.pc!=0x703:m.step()
    assert mem[0x300:0x306]==mem[0x41:0x47] and mem[0x306:0x308]==mem[0x48:0x4a]
    assert mem[0x308:0x30a]==mem[0x48:0x4a] and mem[0x40:0x100]==before
    return {'cases':len(cases),'status':'pass','physics_zp_unchanged':True,'snapshot_unchanged':True,
            'position_error_source_px_max':max_position_error,
            'conversion_cycles_min':min(cycles),'conversion_cycles_max':max(cycles),
            'conversion_ms_max_at_ntsc_cpu':max(cycles)/1789.7727,
            'out_of_range_rejected':2,'original_abi_capture_pass':True}

def external(config):
    import os,subprocess
    from native_lock import core_lock
    lab=labels();out=OUT/'state_frontend';out.mkdir(exist_ok=True)
    # Arbitrary off-route positions, subpixel motion, reverse and sideways body yaw.
    records=[]
    for i,(x,y,h,cam) in enumerate([(568,392,0,0),(568.5,392.25,8192,0),
                                  (568.50390625,392.25,16384,0),(560,350,65535,8192),
                                  (300,320,32768,49152),(72,217,49152,32768),
                                  (507,567,49152,65535),(32,58,0,32768)]):
        state=snapshot(round(x*256),round(y*256),h,cam,200+i)
        for mode in range(2):records.append({'state':list(state),'mode':mode,'view':2,'tick':200+i})
    code=r'''local L=LABELS local cases=CASES local out=OUTDIR local frame=0 local index=1 local armed=false local done=false local minimumUpdate=0
local function byte(a) return emu.read(a,emu.memType.nesMemory) end
local function word(a) return byte(a)+256*byte(a+1) end
local function put(a,v) emu.write(a,v,emu.memType.nesMemory) end
emu.addEventCallback(function()
 if done then return end
 local ok,err=pcall(function()
 frame=frame+1;assert(frame<1500,'timeout');assert(byte(L.stage)~=0xe1,'state rejected');assert(byte(0x5fe3)==0,'mapper fault')
 if word(L.updates)==0 then return end
 local c=cases[index]
 if not armed then
  put(L.external_state,1);put(L.paused,1);put(L.ground,c.mode)
  for i,v in ipairs(c.state) do put(L.original_state+i-1,v) end
  -- A control write during GO must not be mistaken for an already-started frame.
  minimumUpdate=word(L.updates)+2
  armed=true;return
 end
 if word(L.updates)<minimumUpdate then return end
 if word(L.displayed_tick)~=c.tick or byte(L.displayed_ground)~=c.mode then return end
 local ram={} local front=byte(0x5fe2)
 for i=0,16383 do ram[#ram+1]=string.char(emu.read(front*16384+i,emu.memType.nesMapperRam)) end
 local f=assert(io.open(out..'/'..index..'.ram','wb'));f:write(table.concat(ram));f:close()
 index=index+1;armed=false
 if index>#cases then done=true;emu.stop(0) end
 end)
 if not ok then local f=assert(io.open(out..'/error.txt','w'));f:write(tostring(err));f:close();emu.stop(1) end
end,emu.eventType.endFrame)
'''.replace('LABELS','{'+','.join(f'{k}={v}' for k,v in lab.items())+'}').replace('OUTDIR',json.dumps(out.as_posix()))
    lua_cases='{'+','.join('{mode='+str(r['mode'])+',tick='+str(r['tick'])+',state={'+','.join(map(str,r['state']))+'}}' for r in records)+'}'
    code=code.replace('CASES',lua_cases);script=out/'test.lua';script.write_text(code)
    settings=ROOT/'runtime/settings.json';before=settings.read_bytes();cfg=json.loads(before)
    cfg.setdefault('Debug',{}).setdefault('ScriptWindow',{})['AllowIoOsAccess']=True
    settings.write_text(json.dumps(cfg));env=os.environ.copy();env.update(NES_GSU_MAPPER='n8pro-gsu-abi2',NES_GSU_CLOCK_HZ='50000000')
    try:
        with core_lock(ROOT/'runtime/MesenCore.dll'):
            proc=subprocess.run([str(ROOT/'runtime/Mesen.exe'),'--testRunner','--timeout=90','--doNotSaveSettings','--enableStdout',str(OUT/config['rom_name']),str(script)],cwd=ROOT/'runtime',env=env,capture_output=True,timeout=100,creationflags=getattr(subprocess,'CREATE_NO_WINDOW',0))
    finally:settings.write_bytes(before)
    (out/'emulator.log').write_bytes(proc.stdout+proc.stderr)
    assert proc.returncode==0,(out/'error.txt').read_text() if (out/'error.txt').exists() else proc.stdout
    for i,r in enumerate(records,1):
        c=copy.deepcopy(config);c['views'][2]['poses'][0]=pose(bytes(r['state']),VIEWS[2])
        expected,im,_=reference(c,2,r['mode'],0)
        actual=decode((out/f'{i}.ram').read_bytes())
        assert actual==expected,('external state pixels',i,sum(a!=b for a,b in zip(actual,expected)))
        im.save(out/f'{i}.png')
    return {'status':'pass','mhz':50,'frames':len(records),'pixels_checked':len(records)*256*192,'records':records}

def main():
    p=argparse.ArgumentParser();p.add_argument('--frontend',action='store_true');args=p.parse_args()
    config=json.loads((OUT/'config.json').read_text())
    report={'status':'pass','geometry':geometry(config),'cpu':cpu(config)}
    if args.frontend:report['external_state_frontend']=external(config)
    (OUT/'state_validation.json').write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps(report))

if __name__=='__main__':main()
