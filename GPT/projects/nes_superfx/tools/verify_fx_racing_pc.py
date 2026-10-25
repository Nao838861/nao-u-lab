"""実ROMのタイトル開始、敵車状態、60秒超のレース進行を専用Mesenで検査。"""
import argparse
import json
import os
from pathlib import Path
import subprocess

from launch_fx_racing_pc import ROOT, DEFAULT_ROM, checked_rom, prepare_runtime
from native_lock import core_lock


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--frames', type=int, default=4500)
    p.add_argument('--mode', type=int, choices=[0, 1], default=0)
    args = p.parse_args()
    runtime = prepare_runtime()
    rom = checked_rom(DEFAULT_ROM)
    out = ROOT / f'build/fx_racing_pc/mode{args.mode}'
    out.mkdir(parents=True, exist_ok=True)
    lua = r'''
local out=OUT local duration=DURATION local wantedMode=MODE local frame=0 local started=nil local tapUntil=0
local history={} local lastSample=-1 local raceSeen=false local titleCaptured=false
local function b(a)
 if a>=0x6000 and a<0x8000 then return emu.read(a-0x6000,emu.memType.nesWorkRam) end
 return emu.read(a,emu.memType.nesMemory)
end
local function w(a) return b(a)+256*b(a+1) end
local function clock() return b(0x6726)+256*b(0x6727)+65536*b(0x6728) end
local function save(name)
 local f=assert(io.open(out..'/'..name..'.png','wb'));f:write(emu.takeScreenshot());f:close()
end
local function write_result(status,err)
 local f=assert(io.open(out..'/result.json','w'))
 f:write('{"status":"'..status..'","frames":'..frame..',"race_clock":'..clock()..',"scene":'..b(0x6720)..',"fault":'..b(0x4fe3)..',"dsp_status":'..b(0x4fb0)..',"generation":'..w(0x4fe4)..',"error":'..string.format('%q',err or '')..',"samples":[')
 for i,v in ipairs(history) do if i>1 then f:write(',') end;f:write(v) end
 f:write(']}');f:close()
end
emu.addEventCallback(function()
 local input={}
 if frame>=600 and frame<612 and b(0x674d)~=wantedMode then input.select=true end
 if frame>=630 and frame<642 then input.start=true end
 emu.setInput(input,0)
end,emu.eventType.inputPolled)
emu.addEventCallback(function()
 frame=frame+1
 local ok,err=pcall(function()
  local scene=b(0x6720)
  if frame==600 then save('boot');titleCaptured=true;tapUntil=frame+12 end
  if scene==1 and not started then started=frame;raceSeen=true end
  if not raceCaptured and clock()>1 and b(0x4fb0)>=8 then save('race');raceCaptured=true end
  if frame%120==0 then
   local rival={} for a=0x6110,0x612f do rival[#rival+1]=b(a) end
   history[#history+1]='{"frame":'..frame..',"pc":'..emu.getState()['cpu.pc']..',"stage":'..b(2)..',"scene":'..scene..',"clock":'..clock()..',"generation":'..w(0x4fe4)..',"rivals":['..table.concat(rival,',')..']}'
  end
  if frame>=duration then
   save('final')
   assert(titleCaptured and raceSeen,'race never started')
   assert(scene==1,'race exited unexpectedly')
   assert(clock()>3600,'race clock did not advance beyond 60 seconds')
   assert(b(0x674d)==wantedMode,'mode selection failed')
   assert(b(0x4fe3)==0,'GSU fault')
   assert(math.floor(b(0x4fb0)/4)%2==0,'DSP fault')
   write_result('pass');emu.stop(0)
  end
 end)
 if not ok then write_result('fail',tostring(err));emu.stop(1) end
end,emu.eventType.endFrame)
'''.replace('OUT', json.dumps(out.as_posix())).replace('DURATION', str(args.frames)).replace('MODE',str(args.mode))
    script = out / 'test.lua'
    script.write_text(lua, encoding='utf-8')
    env = os.environ.copy()
    env['NES_GSU_MAPPER'] = 'fx-racing-pc-20261025'
    with core_lock(runtime / 'MesenCore.dll'):
        run = subprocess.run([str(runtime / 'Mesen.exe'), '--testRunner', '--timeout=180', '--doNotSaveSettings',
                              '--debug.scriptWindow.allowIoOsAccess=true', str(rom), str(script)],
                             cwd=runtime, env=env, capture_output=True, timeout=190,
                             creationflags=getattr(subprocess, 'CREATE_NO_WINDOW', 0))
    (out / 'emulator.log').write_bytes(run.stdout + run.stderr)
    result = json.loads((out / 'result.json').read_text())
    print(json.dumps({k: v for k, v in result.items() if k != 'samples'}))
    assert run.returncode == 0 and result['status'] == 'pass', result['samples'][-3:]
    samples = result['samples']
    assert len({tuple(s['rivals']) for s in samples if s['scene'] == 1}) > 1, '敵車状態が進行していません'


if __name__ == '__main__':
    main()
