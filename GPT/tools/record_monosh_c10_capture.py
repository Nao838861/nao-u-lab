"""専用ROMを実際に操作し、Mesenの連続フレームからC10素材を録画する。"""
import json, subprocess
from pathlib import Path
root=Path('D:/temp/MonoSH_C10_background_capture')
frames=root/'recorded_frames';frames.mkdir(exist_ok=True)
script=r'''
local frame=0
local base="D:/temp/MonoSH_C10_background_capture/recorded_frames/"
emu.addEventCallback(function()
  local t=(frame-60)/60
  -- 最初は静止。その後、右・停止・左・停止を繰り返す実コントローラー入力。
  local p=(t-2)%10
  local right=t>=2 and (p<0.8 or (p>=6 and p<6.8))
  local left=t>=2 and p>=3 and p<4.6
  emu.setInput({right=right,left=left,up=false,down=false,a=false,b=false,start=false,select=false},0)
end,emu.eventType.inputPolled)
emu.addEventCallback(function()
  frame=frame+1
  if frame>60 and frame<=2460 then
    local f=assert(io.open(base..string.format("%05d.png",frame-61),"wb"))
    f:write(emu.takeScreenshot());f:close()
  end
  if frame>=2460 then emu.stop(0) end
end,emu.eventType.endFrame)
'''
lua=root/'record_capture.lua';lua.write_text(script,encoding='utf-8')
runtime=root/'test_mesen'
with (root/'recording.log').open('w') as log:
    subprocess.run([str(runtime/'Mesen.exe'),'--testRunner',str(lua),str(root/'build/C10_background_only.nes'),'--doNotSaveSettings'],cwd=runtime,stdout=log,stderr=subprocess.STDOUT,check=True,timeout=120,creationflags=subprocess.CREATE_NO_WINDOW)
assert len(list(frames.glob('*.png')))==2400
project=Path(__file__).resolve().parents[1]/'video/explainer_prototype'
ffmpeg=project/'node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe'
dest=project/'public/c10_background_capture.mp4'
subprocess.run([str(ffmpeg),'-v','error','-y','-framerate','60','-i',str(frames/'%05d.png'),'-vf','scale=1024:960:flags=neighbor','-c:v','libx264','-crf','16','-pix_fmt','yuv420p','-movflags','+faststart',str(dest)],check=True)
print(f'Recorded {dest}: 2400 frames, 40 seconds; actual emulator frames, no generated motion.')
