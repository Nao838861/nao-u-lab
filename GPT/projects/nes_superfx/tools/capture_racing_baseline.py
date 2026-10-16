"""原版を通常mapper5で起動し、最初の物理開始状態と走行状態列を読む。"""
import argparse,json,hashlib,os,subprocess,shutil
from pathlib import Path
from build_ground import ROOT
from native_lock import core_lock

OUT=ROOT/'build/racing/v001'
GAME=Path('D:/HomeBrew/MMC5Racing')

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--rom',type=Path);args=parser.parse_args()
    OUT.mkdir(parents=True,exist_ok=True)
    release=json.loads((GAME/'releases/main-release.json').read_text(encoding='utf-8'))
    previous=json.loads((OUT/'baseline.json').read_text()) if (OUT/'baseline.json').exists() else None
    rom=args.rom or (Path(previous['original_path']) if previous else GAME/release['file'])
    if args.rom:release['rom_sha256']=hashlib.sha256(rom.read_bytes()).hexdigest()
    elif previous:release['rom_sha256']=previous['rom_sha256']
    assert hashlib.sha256(rom.read_bytes()).hexdigest()==release['rom_sha256']
    shutil.copy2(rom,OUT/'baseline.nes')
    meta={'rom_sha256':release['rom_sha256'],'original_path':str(rom),
          'source_revision':subprocess.check_output(['git','-C',str(GAME),'log','-1','--format=%H','--',rom.relative_to(GAME).as_posix()],text=True).strip(),
          'simulation_entry':0xf78a,'simulation_end':0xf7a9}
    for mode in ['grip','drift']:
        folder=OUT/mode;folder.mkdir(exist_ok=True)
        code=r'''local out=OUTDIR local mode=MODE local frame=0 local tick=0 local saved=false
local trace=assert(io.open(out..'/native.jsonl','w'))
local function byte(a) return emu.read(a,emu.memType.nesMemory) end
local function dump(name,a,n,kind)
 local t={} for i=0,n-1 do t[#t+1]=string.char(emu.read(a+i,kind)) end
 local f=assert(io.open(out..'/'..name,'wb'));f:write(table.concat(t));f:close()
end
emu.addEventCallback(function()
 local k={}
 if mode=='drift' and frame>=101 and frame<106 then k.down=true end
 if frame==130 then k.a=true end
 if tick>0 then k.a=true;if tick%160>=55 and tick%160<100 then k.right=true;k.b=true elseif tick%160>=100 and tick%160<135 then k.left=true end end
 emu.setInput(k,0)
end,emu.eventType.inputPolled)
emu.addMemoryCallback(function()
 if tick==55 then dump('pre56-cpu.bin',0,2048,emu.memType.nesMemory);dump('pre56-wram.bin',0,131072,emu.memType.nesSaveRam) end
 if not saved then
  dump('initial-cpu.bin',0,2048,emu.memType.nesMemory)
  dump('initial-wram.bin',0,131072,emu.memType.nesSaveRam)
  saved=true
 end
end,emu.callbackType.exec,0xf78a)
emu.addMemoryCallback(function()
 tick=tick+1
 local t={} for a=0x40,0xff do t[#t+1]=byte(a) end
 trace:write('{"tick":'..tick..',"frame":'..frame..',"delta":'..byte(0x6740)..',"buttons":'..byte(0x40)..',"state":['..table.concat(t,',')..']}\n');trace:flush()
 if tick==128 then trace:close();emu.stop(0) end
end,emu.callbackType.exec,0xf7a9)
emu.addEventCallback(function() frame=frame+1;if frame>2500 then error('baseline timeout') end end,emu.eventType.endFrame)
'''.replace('OUTDIR',json.dumps(folder.as_posix())).replace('MODE',json.dumps(mode))
        script=folder/'capture.lua';script.write_text(code)
        settings=ROOT/'runtime/settings.json';before=settings.read_bytes();cfg=json.loads(before)
        cfg.setdefault('Debug',{}).setdefault('ScriptWindow',{})['AllowIoOsAccess']=True
        cfg.setdefault('Nes',{}).setdefault('Port1',{})['Type']='NesController'
        settings.write_text(json.dumps(cfg));env=os.environ.copy();env.pop('NES_GSU_MAPPER',None)
        try:
            with core_lock(ROOT/'runtime/MesenCore.dll'):
                proc=subprocess.run([str(ROOT/'runtime/Mesen.exe'),'--testRunner','--timeout=90','--doNotSaveSettings',str(OUT/'baseline.nes'),str(script)],cwd=ROOT/'runtime',env=env,capture_output=True,timeout=100,creationflags=getattr(subprocess,'CREATE_NO_WINDOW',0))
        finally:settings.write_bytes(before)
        (folder/'capture.log').write_bytes(proc.stdout+proc.stderr);assert proc.returncode==0,proc.stdout
        rows=[json.loads(x) for x in (folder/'native.jsonl').read_text().splitlines()]
        assert len(rows)==128 and (folder/'initial-wram.bin').stat().st_size==131072
        assert (folder/'initial-wram.bin').read_bytes()[0x74d]==(1 if mode=='grip' else 0),'baseline title mode differs from the pinned version'
        meta[mode]={'ticks':len(rows),'deltas':sorted(set(r['delta'] for r in rows)),'initial_state_sha256':hashlib.sha256((folder/'initial-cpu.bin').read_bytes()).hexdigest()}
    (OUT/'baseline.json').write_text(json.dumps(meta,indent=2)+'\n');print(json.dumps(meta))

if __name__=='__main__':main()
