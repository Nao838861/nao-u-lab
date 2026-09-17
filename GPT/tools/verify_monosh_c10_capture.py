"""隔離したMesenで背景録画ROMを実行し、元ファイルも再照合する。"""
import hashlib, json, re, shutil, subprocess
from pathlib import Path
root = Path('D:/temp/MonoSH_C10_background_capture')
runtime = root/'test_mesen'
runtime.mkdir(exist_ok=True)
for name in ['Mesen.exe', 'MesenCore.dll', 'libHarfBuzzSharp.dll', 'libSkiaSharp.dll', 'MesenNesDB.txt']:
    shutil.copy2(Path('D:/HomeBrew/Mesen')/name, runtime/name)
(runtime/'settings.json').write_text(json.dumps({'Debug': {'ScriptWindow': {'AllowIoOsAccess': True}}, 'Nes': {'Port1': {'Type': 'NesController'}}}), encoding='utf-8')
dbg = (root/'build/C10_background_only.dbg').read_text(encoding='utf-8')
labels = {}
for line in dbg.splitlines():
    name = re.search(r'name="(_[^"]+)"', line)
    value = re.search(r'val=0x([0-9A-Fa-f]+)', line)
    if line.startswith('sym\t') and name and value:
        labels[name[1]] = int(value[1], 16)
needed = ['enemy_count','ebullet_count','bullet_count','boss_state','player_state','bgobj_count','bgobj_type','spawn_frame','player_x','stage1_title_timer']
header = '\n'.join(f'local {n} = {labels["_"+n]}' for n in needed)
script = header + r'''
local frame, trees, loops, previous, moved = 0, false, 0, 0, false
local path = "D:/temp/MonoSH_C10_background_capture/"
local function read(a) return emu.read(a, emu.memType.nesDebug, false) end
local function finish(code, message)
  local f=assert(io.open(path.."verification.txt", "w")); f:write(message); f:close(); emu.stop(code)
end
emu.addEventCallback(function()
  emu.setInput({right=frame>=200 and frame<400, left=frame>=500 and frame<800,
    up=false, down=false, a=true, b=false, start=frame==900, select=false}, 0)
end, emu.eventType.inputPolled)
emu.addEventCallback(function()
  frame=frame+1
  if frame>30 then
    for _,a in ipairs({enemy_count,ebullet_count,bullet_count,boss_state,player_state,stage1_title_timer}) do
      if read(a)~=0 then finish(1,"FAIL nonzero state "..a.." frame="..frame); return end
    end
    if read(0x204)==255 then finish(2,"FAIL hidden player frame="..frame); return end
    for a=0x274,0x2FC,4 do
      if read(a)~=255 then finish(2,"FAIL visible OAM "..a.." frame="..frame); return end
    end
    for i=0,read(bgobj_count)-1 do if read(bgobj_type+i)==1 then trees=true end end
    local current=read(spawn_frame)+256*read(spawn_frame+1)
    if current<previous then loops=loops+1 end
    previous=current
    if frame>200 and read(player_x)~=0 then moved=true end
  end
  if frame==180 or frame==360 or frame==2200 then
    local f=assert(io.open(path.."capture_check_"..frame..".png","wb"));f:write(emu.takeScreenshot());f:close()
  end
  if frame==4200 then
    if not trees or loops<2 or not moved then finish(3,"FAIL trees="..tostring(trees).." loops="..loops.." moved="..tostring(moved).." spawn="..previous); return end
    finish(0,"PASS 4200 frames; player visible; no enemies, bullets, boss, death or title; trees present; camera moves; background loops="..loops)
  end
end, emu.eventType.endFrame)
'''
lua = root/'verify_capture.lua'
lua.write_text(script, encoding='utf-8')
with (root/'emulator.log').open('w', encoding='utf-8') as log:
    result = subprocess.run([str(runtime/'Mesen.exe'), '--testRunner', str(lua), str(root/'build/C10_background_only.nes'), '--doNotSaveSettings'], cwd=runtime, stdout=log, stderr=subprocess.STDOUT, timeout=120, creationflags=subprocess.CREATE_NO_WINDOW)
print((root/'verification.txt').read_text() if (root/'verification.txt').exists() else 'No result')
assert result.returncode == 0, result.returncode
before = json.loads((root/'source_hashes.json').read_text())
assert all(hashlib.sha256((Path('D:/HomeBrew/MonoSH')/p).read_bytes()).hexdigest()==h for p,h in before.items())
print(f'PASS: original {len(before)} files unchanged')
