"""修正前後の実ROMを同じ入力で比較し、4視点・長押し・ゲーム状態を検証。"""
import hashlib
import json
import os
import subprocess
from launch_fx_racing_pc import ROOT, checked_rom, prepare_runtime
from build_fx_racing_select_fix import SOURCE_ROM, OUTPUT
from native_lock import core_lock


def run_case(runtime, rom, mode, fixed):
    out=ROOT/f'build/fx_racing_camera_fix/{"fixed" if fixed else "original"}_{mode}'
    out.mkdir(parents=True,exist_ok=True)
    script=out/'test.lua'
    lua=r'''
local out=OUT local mode=MODE local frame=0 local rows={}
local trace=assert(io.open(out..'/native_trace.jsonl','w'))
local function b(a) return emu.read(a,emu.memType.nesMemory) end
local function game(a) return emu.read(a-0x6000,emu.memType.nesWorkRam) end
local function hexrange(a,n,fn)
 local s={} for i=0,n-1 do s[#s+1]=string.format('%02x',fn(a+i)) end
 return table.concat(s)
end
emu.addMemoryCallback(function()
 if b(0x5117)~=0x80 then return end
 trace:write(hexrange(0x40,46,b)..hexrange(0x6100,48,game)..hexrange(0x6720,48,game)..hexrange(0x440,96,b)..'\n')
end,emu.callbackType.exec,0xe668)
emu.addEventCallback(function()
 local input={}
 if frame>=600 and frame<612 and game(0x674d)~=mode then input.select=true end
 if frame>=630 and frame<642 then input.start=true end
 if (frame>=1100 and frame<1112) or (frame>=1200 and frame<1212) or (frame>=1300 and frame<1312) or (frame>=1400 and frame<1412) or (frame>=1700 and frame<1780) or (frame>=1800 and frame<1812) then input.select=true end
 emu.setInput(input,0)
end,emu.eventType.inputPolled)
local wanted={ [1080]=true,[1180]=true,[1280]=true,[1380]=true,[1480]=true,[1740]=true,[1780]=true,[1880]=true }
emu.addEventCallback(function()
 frame=frame+1
 if wanted[frame] then
  local c={} for a=0x4fa0,0x4fad do c[#c+1]=b(a) end
  rows[#rows+1]='{"frame":'..frame..',"view":'..b(0x650)..',"render_view":'..b(4)..',"mode":'..game(0x674d)..',"scene":'..game(0x6720)..',"fault":'..b(0x4fe3)..',"dsp":'..b(0x4fb0)..',"camera":['..table.concat(c,',')..']}'
  local f=assert(io.open(out..'/frame'..frame..'.png','wb'));f:write(emu.takeScreenshot());f:close()
 end
 if frame==1900 then
  trace:close()
  local f=assert(io.open(out..'/result.json','w'));f:write('{"rows":['..table.concat(rows,',')..']}');f:close();emu.stop(0)
 end
end,emu.eventType.endFrame)
'''.replace('OUT',json.dumps(out.as_posix())).replace('MODE',str(mode))
    script.write_text(lua,encoding='utf-8')
    env=os.environ.copy();env['NES_GSU_MAPPER']='fx-racing-pc-20261025'
    with core_lock(runtime/'MesenCore.dll'):
        proc=subprocess.run([str(runtime/'Mesen.exe'),'--testRunner','--timeout=90','--doNotSaveSettings',
                             '--debug.scriptWindow.allowIoOsAccess=true',str(checked_rom(rom)),str(script)],
                            cwd=runtime,env=env,capture_output=True,timeout=100,
                            creationflags=getattr(subprocess,'CREATE_NO_WINDOW',0))
    assert proc.returncode==0,proc.stdout+proc.stderr
    report=json.loads((out/'result.json').read_text())
    rows=report['rows'];expected=[2,3,0,1,2,3,3,0] if fixed else [2]*8
    assert [r['view'] for r in rows]==expected,rows
    assert [r['render_view'] for r in rows]==expected,rows
    assert all(r['mode']==mode and r['scene']==1 and r['fault']==0 and not(r['dsp']&4) for r in rows),rows
    distinct=len({tuple(r['camera']) for r in rows})
    assert distinct==(4 if fixed else 1),rows
    report.update(mode=mode,fixed=fixed,view_sequence=expected,distinct_camera_states=distinct,
                  rom_sha256=hashlib.sha256(rom.read_bytes()).hexdigest(),status='pass')
    return report,out


def main():
    runtime=prepare_runtime();reports=[]
    for mode in [0,1]:
        original,base=run_case(runtime,SOURCE_ROM,mode,False)
        fixed,out=run_case(runtime,OUTPUT,mode,True)
        before=(base/'native_trace.jsonl').read_text().splitlines()
        after=(out/'native_trace.jsonl').read_text().splitlines()
        differences=[i for i,(a,b) in enumerate(zip(before,after)) if a!=b]
        comparison=dict(original_ticks=len(before),fixed_ticks=len(after),different_ticks=differences[:10],
                        trace_equal=before==after,trace_sha256=hashlib.sha256((out/'native_trace.jsonl').read_bytes()).hexdigest())
        fixed['canonical_game_state_comparison']=comparison
        assert comparison['trace_equal'],comparison
        (out/'verification.json').write_text(json.dumps(fixed,indent=2)+'\n',encoding='utf-8')
        reports.append(fixed)
        print(json.dumps({k:v for k,v in fixed.items() if k!='rows'}),flush=True)
    (ROOT/'build/fx_racing_camera_fix/verification.json').write_text(json.dumps(reports,indent=2)+'\n',encoding='utf-8')


if __name__=='__main__':
    main()
