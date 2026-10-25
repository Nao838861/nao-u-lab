"""配布ROMのレース中Select入力と地面カメラの変化を観測する。ROMは無変更。"""
import json
import os
import subprocess
from launch_fx_racing_pc import ROOT, DEFAULT_ROM, checked_rom, prepare_runtime
from native_lock import core_lock


def main():
    runtime = prepare_runtime()
    rom = checked_rom(DEFAULT_ROM)
    out = ROOT / 'build/fx_racing_select'
    out.mkdir(parents=True, exist_ok=True)
    script = out / 'test.lua'
    script.write_text(r'''
local out=OUT local frame=0 local rows={} local padSamples={}
local function b(a) return emu.read(a,emu.memType.nesMemory) end
local function game(a) return emu.read(a-0x6000,emu.memType.nesWorkRam) end
local function snapshot()
 local cam={} for a=0x4fa0,0x4fad do cam[#cam+1]=b(a) end
 local row='{"frame":'..frame..',"mode":'..game(0x674d)..',"scene":'..game(0x6720)..',"camera":['..table.concat(cam,',')..']}'
 rows[#rows+1]=row
 local f=assert(io.open(out..'/frame'..frame..'.png','wb'));f:write(emu.takeScreenshot());f:close()
end
emu.addEventCallback(function()
 local input={}
 if frame>=630 and frame<642 then input.start=true end
 if (frame>=1100 and frame<1112) or (frame>=1200 and frame<1212) or (frame>=1300 and frame<1312) or (frame>=1400 and frame<1412) then input.select=true end
 emu.setInput(input,0)
end,emu.eventType.inputPolled)
emu.addEventCallback(function()
 frame=frame+1
 if frame>=1100 and frame<=1114 then padSamples[#padSamples+1]='{"frame":'..frame..',"pad16":'..b(0x16)..',"pad640":'..b(0x640)..'}' end
 if frame==1080 or frame==1180 or frame==1280 or frame==1380 or frame==1480 then snapshot() end
 if frame==1500 then
  local f=assert(io.open(out..'/result.json','w'))
  f:write('{"rows":['..table.concat(rows,',')..'],"input_samples":['..table.concat(padSamples,',')..']}');f:close();emu.stop(0)
 end
end,emu.eventType.endFrame)
'''.replace('OUT', json.dumps(out.as_posix())), encoding='utf-8')
    env = os.environ.copy()
    env['NES_GSU_MAPPER'] = 'fx-racing-pc-20261025'
    with core_lock(runtime / 'MesenCore.dll'):
        run = subprocess.run([str(runtime/'Mesen.exe'), '--testRunner', '--timeout=90', '--doNotSaveSettings',
                              '--debug.scriptWindow.allowIoOsAccess=true', str(rom), str(script)],
                             cwd=runtime, env=env, capture_output=True, timeout=100,
                             creationflags=getattr(subprocess,'CREATE_NO_WINDOW',0))
    assert run.returncode==0, run.stdout+run.stderr
    result = json.loads((out/'result.json').read_text())
    result['distinct_camera_states'] = len({tuple(r['camera']) for r in result['rows']})
    result['rom_sha256'] = 'b893f680e22fbd38b5aa47516bc7aef3564fb8e292b0403ab38aa33cba3b74dc'
    (out/'result.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(result))


if __name__=='__main__':
    main()
