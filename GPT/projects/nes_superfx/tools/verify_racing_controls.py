"""走行ROMの実パッドによる視点・地面・モード・リセットを確認。"""
import argparse,json,os,re,subprocess
from build_ground import ROOT
from build_racing import OUT
from native_lock import core_lock

def main():
    global OUT
    p=argparse.ArgumentParser();p.add_argument('--version',choices=['001','002','003','004','005'],default='001');args=p.parse_args()
    runtime=ROOT/('runtime_mode7' if args.version in ['004','005'] else 'runtime')
    OUT=ROOT/f'build/racing/v{args.version}'
    lab={n:int(a,16) for a,n in re.findall(r'al ([0-9A-Fa-f]+) \.([^\s]+)',(OUT/'cpu.lbl').read_text())}
    out=OUT/'controls';out.mkdir(exist_ok=True)
    code=r'''local L=LABELS local out=OUTDIR local frame=0 local phase=0 local untilFrame=0 local press={} local mark=0 local lastView=0 local done=false
local function byte(a) return emu.read(a,emu.memType.nesMemory) end
local function word(a) return byte(a)+256*byte(a+1) end
local function tap(k) press=k;untilFrame=frame+8 end
emu.addEventCallback(function() emu.setInput(frame<untilFrame and press or {},0) end,emu.eventType.inputPolled)
emu.addEventCallback(function()
 if done then return end
 frame=frame+1
 local ok,err=pcall(function()
 assert(frame<1800,'controls timeout phase='..phase)
 if frame<untilFrame then return end
 local ticks=word(L.physics_ticks) local updates=word(L.updates)
 if phase==0 and updates>1 then
  assert(byte(L.drive_mode)==0);lastView=byte(L.displayed_view);tap({select=true});phase=1
 elseif phase==1 and byte(L.displayed_view)==(lastView+1)%4 then
  assert(byte(L.desired_view)==(lastView+1)%4,'held SELECT repeated');tap({up=true});phase=2
 elseif phase==2 and byte(L.displayed_ground)==1 then
  assert(byte(L.desired_ground)==1,'held UP repeated');tap({down=true});phase=3
 elseif phase==3 and byte(L.drive_mode)==1 and ticks>20 then
  assert(byte(L.desired_mode)==1,'held DOWN repeated')
  local f=assert(io.open(out..'/drift.png','wb'));f:write(emu.takeScreenshot());f:close()
  mark=ticks;tap({start=true});phase=4
 elseif phase==4 and ticks<mark and ticks>0 then
  assert(byte(L.drive_mode)==1,'START changed mode');phase=5;mark=frame
 elseif phase==5 and frame>mark+30 then
  -- A display-range failure must still allow START to recover; physics keeps running.
  emu.write(0x41,0,emu.memType.nesMemory);emu.write(0x42,0xa4,emu.memType.nesMemory);emu.write(0x43,6,emu.memType.nesMemory);phase=6
 elseif phase==6 and byte(L.stage)==0xe1 then tap({start=true});phase=7
 elseif phase==7 and byte(L.stage)~=0xe1 and ticks>0 then
  assert(byte(0x4fe3)==0,'bitmap fault after restart')
  local f=assert(io.open(out..'/pass.json','w'));f:write('{"status":"pass","held_edges":true,"view_switch":true,"ground_switch":true,"mode_switch":true,"start_reset":true,"range_reset_recovery":true}');f:close();done=true;emu.stop(0)
 end
 end)
 if not ok then local f=assert(io.open(out..'/error.txt','w'));f:write(tostring(err));f:close();emu.stop(1) end
end,emu.eventType.endFrame)
'''.replace('LABELS','{'+','.join(f'{k}={v}' for k,v in lab.items())+'}').replace('OUTDIR',json.dumps(out.as_posix()))
    script=out/'test.lua';script.write_text(code)
    settings=runtime/'settings.json';before=settings.read_bytes();cfg=json.loads(before)
    cfg.setdefault('Debug',{}).setdefault('ScriptWindow',{})['AllowIoOsAccess']=True
    cfg.setdefault('Nes',{}).setdefault('Port1',{})['Type']='NesController'
    settings.write_text(json.dumps(cfg));env=os.environ.copy();env.update(NES_GSU_MAPPER='n8pro-racing-gsu',NES_GSU_CLOCK_HZ='50000000')
    try:
        with core_lock(runtime/'MesenCore.dll'):
            p=subprocess.run([str(runtime/'Mesen.exe'),'--testRunner','--timeout=90','--doNotSaveSettings',str(OUT/f'GSU_MMC5Racing3D_v{args.version}.nes'),str(script)],cwd=runtime,env=env,capture_output=True,timeout=100,creationflags=getattr(subprocess,'CREATE_NO_WINDOW',0))
    finally:settings.write_bytes(before)
    (out/'emulator.log').write_bytes(p.stdout+p.stderr)
    assert p.returncode==0,(out/'error.txt').read_text() if (out/'error.txt').exists() else p.stdout
    print((out/'pass.json').read_text())

if __name__=='__main__':main()
