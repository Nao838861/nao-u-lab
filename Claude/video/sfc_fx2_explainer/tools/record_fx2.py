"""Record the released MonoSH FX2 ROM in Mesen: SELECT right after boot (monochrome), scripted play.

Writes per-field final RGB (frames.rgb), GSU framebuffer (fb.bin) and state log (log.jsonl).
The ROM is not modified; Lua only supplies pad input and reads memory.
"""
import argparse, hashlib, json, re, subprocess, sys
from pathlib import Path

FX2 = Path('D:/AI/Nao_u_BOT/GPT/projects/monosh_fx2')
sys.path.insert(0, str(FX2 / 'tools'))
from run_probe import prepare_runtime, MESEN_EXE, lua  # noqa: E402

SCRIPT = r'''
local labels=LABELS
local out=OUTDIR
local maxfield=MAXFIELD
local savefb=SAVEFB
local field=0
local frames=assert(io.open(out..'/frames.rgb','wb'))
local fbf=savefb and assert(io.open(out..'/fb.bin','wb')) or nil
local logf=assert(io.open(out..'/log.jsonl','w'))
local function read(name,n) local v=0 for i=0,(n or 1)-1 do v=v|(emu.read(0x7e0000+labels[name]+i,emu.memType.snesMemory)<<(8*i)) end return v end
local function readw(name,n) local a=labels[name]; if a<0x10000 then return read(name,n) end return read(name,n) end
local function byte(name,i) return emu.read(0x7e0000+labels[name]+i,emu.memType.snesMemory) end
local function cmode() return emu.read(0x7e0000+labels.fx_color_mode,emu.memType.snesMemory) end
local selpress=0
local mono_at=-1
local color_seen=-1
local function guard(fn) return function(...)
  local ok,err=pcall(fn,...)
  if not ok then local f=io.open(out..'/error.txt','w');f:write(tostring(err));f:close();emu.stop(1) end
end end
emu.addEventCallback(guard(function()
  local inp={}
  -- SELECT right after boot until monochrome is latched.
  if mono_at<0 then
    if cmode()==1 and color_seen<0 then color_seen=field end
    if color_seen>=0 and cmode()==0 then mono_at=field
    elseif color_seen>=0 then
      local ph=(field-color_seen)%12
      if ph<4 then inp.select=true end
    end
  end
  if field>=60 then
    inp.a=true
    local x=read('_monosh_player_x',2);local y=read('_monosh_player_bottom',2)
    local tx,ty
    if read('_monosh_boss_state')==1 then
      local z=byte('_boss_part_z',0)
      tx=byte('_boss_part_x',0)
      ty=byte('_boss_part_bottom',0)-byte('_monosh_boss_face_geometry',math.min(z,110)*2+1)//2+20
    else
      local t=field/60
      tx=128+math.floor(70*math.sin(t*0.9)+25*math.sin(t*2.3))
      ty=150+math.floor(45*math.sin(t*0.55+1.0))
    end
    inp.up=y<ty-3;inp.down=y>ty+3
    inp.right=x<tx-3;inp.left=x>tx+3
  end
  emu.setInput(inp,0)
end),emu.eventType.inputPolled)
emu.addEventCallback(guard(function()
  field=field+1
  local buf=emu.getScreenBuffer()
  local t={}
  for i,v in ipairs(buf) do t[i]=string.char((v>>16)&255,(v>>8)&255,v&255) end
  frames:write(table.concat(t))
  if fbf then
    local b={}
    for i=0,12287 do b[i+1]=string.char(emu.read(0x2000+i,emu.memType.gsuWorkRam)) end
    fbf:write(table.concat(b))
  end
  logf:write(string.format('{"f":%d,"n":%d,"boss":%d,"mode":%d,"mono_at":%d,"px":%d,"py":%d}\n',field,#buf,read('_monosh_boss_state'),cmode(),mono_at,read('_monosh_player_x',2),read('_monosh_player_bottom',2)))
  if field>=maxfield then frames:close(); if fbf then fbf:close() end; logf:close(); emu.stop(0) end
end),emu.eventType.endFrame)
'''


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--out', type=Path, required=True)
    p.add_argument('--fields', type=int, default=600)
    p.add_argument('--hide', default='', help='comma list: bg1,bg2,bg3,bg4,obj')
    p.add_argument('--fb', action='store_true')
    p.add_argument('--timeout', type=int, default=3000)
    a = p.parse_args()
    rom = FX2 / 'releases/MonoSHFX2_v001.sfc'
    build = FX2 / 'build/game_v001'
    assert hashlib.sha256(rom.read_bytes()).digest() == hashlib.sha256((build / 'MonoSHFX2_v001.sfc').read_bytes()).digest()
    labels = {m[2]: int(m[1], 16) for m in re.finditer(r'al ([0-9A-Fa-f]+) \.([^\s]+)', (build / 'game.lbl').read_text())}
    out = a.out.resolve(); out.mkdir(parents=True, exist_ok=True)
    for f in ('error.txt',):
        if (out / f).exists(): (out / f).unlink()
    s = SCRIPT.replace('LABELS', lua(labels)).replace('OUTDIR', lua(out.as_posix())).replace('MAXFIELD', str(a.fields)).replace('SAVEFB', 'true' if a.fb else 'false')
    (out / 'rec.lua').write_text(s, encoding='utf-8')
    mesen = prepare_runtime(MESEN_EXE)
    st = mesen.parent / 'settings.json'
    cfg = json.loads(st.read_text())
    hide = set(x for x in a.hide.split(',') if x)
    cfg['Snes'].update({'Port1': {'Type': 'SnesController'}, 'DisableFrameSkipping': True, 'Region': 'Ntsc',
                        'RamPowerOnState': 'AllZeros',
                        'HideBgLayer1': 'bg1' in hide, 'HideBgLayer2': 'bg2' in hide, 'HideBgLayer3': 'bg3' in hide,
                        'HideBgLayer4': 'bg4' in hide, 'HideSprites': 'obj' in hide})
    cfg['Debug']['ScriptWindow']['ScriptTimeout'] = 30
    st.write_text(json.dumps(cfg))
    r = subprocess.run([str(mesen), '--testRunner', f'--timeout={a.timeout}', '--doNotSaveSettings', '--enableStdout', str(rom), str(out / 'rec.lua')],
                       cwd=mesen.parent, capture_output=True, timeout=a.timeout + 30, creationflags=getattr(subprocess, 'CREATE_NO_WINDOW', 0))
    (out / 'emulator.log').write_bytes(r.stdout + r.stderr)
    print('exit', r.returncode, (out / 'error.txt').read_text() if (out / 'error.txt').exists() else '')
    meta = {'rom': str(rom), 'rom_sha256': hashlib.sha256(rom.read_bytes()).hexdigest(), 'hide': sorted(hide), 'fields': a.fields}
    (out / 'meta.json').write_text(json.dumps(meta, indent=1))


if __name__ == '__main__':
    main()
