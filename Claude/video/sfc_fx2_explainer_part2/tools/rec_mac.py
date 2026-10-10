"""Record MonoSH FX2 / 4bpp30 / SA-1 ROMs with Mesen 2 on macOS for the part-2 explainer.

The ROM is never modified. Lua only supplies pad input and reads memory.

  --mode auto   : autopilot (needs --labels, the game.lbl of that exact ROM). Logs every field's pad input.
  --mode replay : replays the pad input log of an earlier auto run (no labels needed), so different ROMs
                  can be compared under the same input.
  --mono        : press SELECT right after boot until the 2bpp ROM latches monochrome (auto mode only).
  --hide        : comma list of bg1,bg2,bg3,bg4,obj to hide (layer footage).
Outputs: frames.rgb (256x239 RGB per field), inputs.txt (one pad bitmask per field), log.jsonl.
"""
import argparse, json, os, re, subprocess
from pathlib import Path

MESEN = Path(os.environ.get('MESEN_APP', '/private/tmp/claude-503/-Users-Nao-u-nao-u-lab-Claude/15d39158-6e62-4156-aae6-a905bcf24a95/scratchpad/mesen/Mesen.app/Contents/MacOS/Mesen'))
KEYS = ['a', 'b', 'x', 'y', 'l', 'r', 'up', 'down', 'left', 'right', 'select', 'start']


def lua(v):
    if isinstance(v, bool):
        return 'true' if v else 'false'
    if isinstance(v, (int, float)):
        return repr(v)
    if isinstance(v, str):
        return json.dumps(v)
    if isinstance(v, dict):
        return '{' + ','.join(f'[{lua(k)}]={lua(x)}' for k, x in v.items()) + '}'
    if isinstance(v, (list, tuple)):
        return '{' + ','.join(lua(x) for x in v) + '}'
    raise TypeError(v)


SCRIPT = r'''
local labels=LABELS
local out=OUTDIR
local maxfield=MAXFIELD
local mode=MODE
local mono=MONO
local dump=DUMP
local P=PARAMS
local KEYS=KEYLIST
local replay=REPLAY
local field=0
local frames=dump and assert(io.open(out..'/frames.rgb','wb')) or nil
local logf=assert(io.open(out..'/log.jsonl','w'))
local inf=assert(io.open(out..'/inputs.txt','w'))
local function rd(name,off) return emu.read(0x7e0000+labels[name]+(off or 0),emu.memType.snesMemory) end
local function rw(name,off) return rd(name,off)|(rd(name,(off or 0)+1)<<8) end
local function sw(v) if v>=0x8000 then return v-0x10000 end return v end
local mono_at,color_seen=-1,-1
local ENEMY={[3]=true,[11]=true,[12]=true,[32]=true,[33]=true,[34]=true,[35]=true,[36]=true}
local DANGER={[4]=true,[6]=true,[7]=true,[8]=true,[31]=true,[37]=true}
local function guard(fn) return function(...)
  local ok,err=pcall(fn,...)
  if not ok then local f=io.open(out..'/error.txt','w');f:write(tostring(err));f:close();emu.stop(1) end
end end
local cur={}
local function auto_input()
  local inp={}
  if mono and mono_at<0 then
    local cm=rd('fx_color_mode')
    if cm==1 and color_seen<0 then color_seen=field end
    if color_seen>=0 and cm==0 then mono_at=field
    elseif color_seen>=0 and (field-color_seen)%12<4 then inp.select=true end
  end
  if field>=60 then
    inp.a=true
    local x=rw('_monosh_player_x');local y=rw('_monosh_player_bottom')
    local t=field/60
    local tx=128+math.floor(P.wx*math.sin(t*0.9+P.ph)+25*math.sin(t*2.3))
    local ty=P.wy0+math.floor(40*math.sin(t*0.55+1.0+P.ph))
    if rd('_monosh_boss_state')==1 then
      local z=rd('_boss_part_z')
      tx=rd('_boss_part_x')
      ty=rd('_boss_part_bottom')-rd('_monosh_boss_face_geometry',math.min(z,110)*2+1)//2+P.boss_dy
    else
      local n=rd('_fx_draw_count');local best=-1
      for i=0,n-1 do
        local o=i*10
        local ex,ey=sw(rw('_fx_draw',o)),sw(rw('_fx_draw',o+2))
        local w,h,a=rd('_fx_draw',o+4),rd('_fx_draw',o+5),rd('_fx_draw',o+6)
        if ENEMY[a] and w>=P.minw and w<=P.maxw and w>best and ex>16 and ex<240 then
          best=w;tx=ex;ty=ey-h//2+P.aim_dy
        end
      end
      for i=0,n-1 do
        local o=i*10
        local ex,ey=sw(rw('_fx_draw',o)),sw(rw('_fx_draw',o+2))
        local w,h,a=rd('_fx_draw',o+4),rd('_fx_draw',o+5),rd('_fx_draw',o+6)
        if DANGER[a] and w>=P.danger_w and math.abs(ex-x)<w//2+20 and ey>y-48-8 and ey-h<y+8 then
          if ex>=x then tx=math.max(24,ex-w//2-40) else tx=math.min(232,ex+w//2+40) end
          if a~=4 then ty=(ey-h//2<y-24) and math.min(200,y+50) or math.max(70,y-50) end
        end
      end
    end
    tx=math.max(20,math.min(236,tx));ty=math.max(P.ty_min,math.min(205,ty))
    inp.up=y<ty-3;inp.down=y>ty+3
    inp.right=x<tx-3;inp.left=x>tx+3
  end
  return inp
end
emu.addEventCallback(guard(function()
  local inp
  if mode=='auto' then
    if field~=cur.f then cur={f=field,inp=auto_input()} end
    inp=cur.inp
  else
    inp={}
    local m=replay[field+1] or 0
    for i,k in ipairs(KEYS) do if (m>>(i-1))&1==1 then inp[k]=true end end
  end
  emu.setInput(inp,0)
  cur.used=inp
end),emu.eventType.inputPolled)
emu.addEventCallback(guard(function()
  local m=0
  local u=cur.used or {}
  for i,k in ipairs(KEYS) do if u[k] and k~='select' then m=m|(1<<(i-1)) end end
  inf:write(m..'\n')
  cur.used=nil
  field=field+1
  if frames then
    local buf=emu.getScreenBuffer()
    local t={}
    for i,v in ipairs(buf) do t[i]=string.char((v>>16)&255,(v>>8)&255,v&255) end
    frames:write(table.concat(t))
  end
  if field==P.cgram_at then
    local f=assert(io.open(out..'/cgram.bin','wb'));local b={}
    for i=0,511 do b[#b+1]=string.char(emu.read(i,emu.memType.snesCgRam)) end
    f:write(table.concat(b));f:close()
  end
  if mode=='auto' then
    logf:write(string.format('{"f":%d,"boss":%d,"ps":%d,"mono_at":%d}\n',field,rd('_monosh_boss_state'),rd('_monosh_player_state'),mono_at))
  else
    logf:write(string.format('{"f":%d}\n',field))
  end
  if field>=maxfield then
    if frames then frames:close() end
    logf:close();inf:close();emu.stop(0)
  end
end),emu.eventType.endFrame)
'''

DEFAULT = {'wx': 60, 'wy0': 140, 'ph': 0.0, 'boss_dy': 20, 'aim_dy': 24, 'minw': 6, 'maxw': 70, 'danger_w': 28, 'ty_min': 88, 'cgram_at': 600}


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--rom', type=Path, required=True)
    p.add_argument('--labels', type=Path)
    p.add_argument('--out', type=Path, required=True)
    p.add_argument('--fields', type=int, default=600)
    p.add_argument('--mode', choices=('auto', 'replay'), default='auto')
    p.add_argument('--inputs', type=Path, help='inputs.txt of an earlier auto run (replay mode)')
    p.add_argument('--mono', action='store_true')
    p.add_argument('--hide', default='')
    p.add_argument('--params', default='{}')
    p.add_argument('--no-dump', action='store_true')
    p.add_argument('--timeout', type=int, default=3000)
    a = p.parse_args()
    params = {**DEFAULT, **json.loads(a.params)}
    labels = {}
    if a.mode == 'auto':
        labels = {m[2]: int(m[1], 16) for m in re.finditer(r'al ([0-9A-Fa-f]+) \.([^\s]+)', a.labels.read_text())}
    replay = [int(x) for x in a.inputs.read_text().split()] if a.mode == 'replay' else []
    out = a.out.resolve()
    out.mkdir(parents=True, exist_ok=True)
    (out / 'error.txt').unlink(missing_ok=True)
    s = (SCRIPT.replace('LABELS', lua(labels)).replace('OUTDIR', lua(out.as_posix())).replace('MAXFIELD', str(a.fields))
         .replace('MODE', lua(a.mode)).replace('MONO', lua(a.mono)).replace('DUMP', lua(not a.no_dump))
         .replace('PARAMS', lua(params)).replace('KEYLIST', lua(KEYS)).replace('REPLAY', lua(replay)))
    (out / 'rec.lua').write_text(s, encoding='utf-8')
    hide = set(x for x in a.hide.split(',') if x)
    st = MESEN.parent / 'settings.json'
    cfg = {'Debug': {'ScriptWindow': {'AllowIoOsAccess': True, 'ScriptTimeout': 30}},
           'Snes': {'GsuClockSpeed': 100, 'Port1': {'Type': 'SnesController'}, 'DisableFrameSkipping': True, 'Region': 'Ntsc',
                    'RamPowerOnState': 'AllZeros', 'HideBgLayer1': 'bg1' in hide, 'HideBgLayer2': 'bg2' in hide,
                    'HideBgLayer3': 'bg3' in hide, 'HideBgLayer4': 'bg4' in hide, 'HideSprites': 'obj' in hide}}
    st.write_text(json.dumps(cfg))
    r = subprocess.run([str(MESEN), '--testRunner', f'--timeout={a.timeout}', '--doNotSaveSettings', '--enableStdout', str(a.rom), str(out / 'rec.lua')],
                       cwd=MESEN.parent, capture_output=True, timeout=a.timeout + 60)
    (out / 'emulator.log').write_bytes(r.stdout + r.stderr)
    err = (out / 'error.txt').read_text() if (out / 'error.txt').exists() else ''
    rows = [json.loads(l) for l in (out / 'log.jsonl').read_text().splitlines()] if (out / 'log.jsonl').exists() else []
    summary = {'rom': str(a.rom), 'mode': a.mode, 'exit': r.returncode, 'error': err, 'fields': len(rows), 'hide': sorted(hide)}
    if a.mode == 'auto' and rows:
        summary['boss_on'] = next((x['f'] for x in rows if x['boss'] == 1), None)
        summary['boss_done'] = next((x['f'] for x in rows if x['boss'] == 3), None)
        summary['mono_at'] = rows[-1]['mono_at']
    (out / 'summary.json').write_text(json.dumps(summary, indent=1))
    print(json.dumps(summary))


if __name__ == '__main__':
    main()
