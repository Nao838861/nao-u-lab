"""Showcase play of the released ROM: SELECT right after boot (monochrome), then an autopilot that aims at
enemies read from the GSU draw list and steps away from near obstacles / enemy shots.

The ROM is not modified and no game state is written; Lua only supplies pad input and reads memory.
Logs per field: boss state, player state, SFX ids queued to the sound driver (for the audio mix).
--dump also writes the final RGB frames (frames.rgb, 256x239).
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
local dump=DUMP
local P=PARAMS
local field=0
local frames=dump and assert(io.open(out..'/frames.rgb','wb')) or nil
local logf=assert(io.open(out..'/log.jsonl','w'))
local function rd(name,off) return emu.read(0x7e0000+labels[name]+(off or 0),emu.memType.snesMemory) end
local function rw(name,off) return rd(name,off)|(rd(name,(off or 0)+1)<<8) end
local function sw(v) if v>=0x8000 then return v-0x10000 end return v end
local mono_at,color_seen=-1,-1
local sfx={}
local done_at=-1
local ENEMY={[3]=true,[11]=true,[12]=true,[32]=true,[33]=true,[34]=true,[35]=true,[36]=true}
local DANGER={[4]=true,[6]=true,[7]=true,[8]=true,[31]=true,[37]=true}
local function guard(fn) return function(...)
  local ok,err=pcall(fn,...)
  if not ok then local f=io.open(out..'/error.txt','w');f:write(tostring(err));f:close();emu.stop(1) end
end end
emu.addMemoryCallback(guard(function(addr,value)
  if value~=255 then sfx[#sfx+1]=value end
end),emu.callbackType.write,0x7e0000+labels.fx_audio_last_sfx,0x7e0000+labels.fx_audio_last_sfx,emu.cpuType.snes,emu.memType.snesMemory)
local snap_req,snap_done=false,false
local function dumpm(name,mt,count)
  local f=assert(io.open(out..'/'..name,'wb'));local b={}
  for i=0,count-1 do b[#b+1]=string.char(emu.read(i,mt)) end
  f:write(table.concat(b));f:close()
end
-- SPC snapshot at an opcode boundary of the driver main loop (same point as tools/test_audio.py)
emu.addMemoryCallback(guard(function()
  if snap_req and not snap_done then
    snap_done=true
    dumpm('snap.ram',emu.memType.spcRam,65536)
    dumpm('snap.dsp',emu.memType.spcDspRegisters,128)
    local f=assert(io.open(out..'/snap.state','w'))
    for k,v in pairs(emu.getState()) do
      if k:sub(1,4)=='spc.' and (type(v)=='number' or type(v)=='boolean') then f:write(k..'='..tostring(v)..'\n') end
    end
    f:write('field='..field..'\n');f:close()
  end
end),emu.callbackType.exec,0x0394,0x0394,emu.cpuType.spc,emu.memType.spcMemory)
local dodge=0
emu.addEventCallback(guard(function()
  local inp={}
  local cm=rd('fx_color_mode')
  if mono_at<0 then
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
      -- step away from a near obstacle or enemy shot that overlaps the player
      for i=0,n-1 do
        local o=i*10
        local ex,ey=sw(rw('_fx_draw',o)),sw(rw('_fx_draw',o+2))
        local w,h,a=rd('_fx_draw',o+4),rd('_fx_draw',o+5),rd('_fx_draw',o+6)
        if DANGER[a] and w>=P.danger_w and math.abs(ex-x)<w//2+20 and ey>y-48-8 and ey-h<y+8 then
          dodge=P.dodge_frames
          if ex>=x then tx=math.max(24,ex-w//2-40) else tx=math.min(232,ex+w//2+40) end
          if a~=4 then ty=(ey-h//2<y-24) and math.min(200,y+50) or math.max(70,y-50) end
        end
      end
    end
    tx=math.max(20,math.min(236,tx));ty=math.max(P.ty_min,math.min(205,ty))
    inp.up=y<ty-3;inp.down=y>ty+3
    inp.right=x<tx-3;inp.left=x>tx+3
  end
  emu.setInput(inp,0)
end),emu.eventType.inputPolled)
emu.addEventCallback(guard(function()
  field=field+1
  if field==P.snap then snap_req=true end
  if frames then
    local buf=emu.getScreenBuffer()
    local t={}
    for i,v in ipairs(buf) do t[i]=string.char((v>>16)&255,(v>>8)&255,v&255) end
    frames:write(table.concat(t))
  end
  local b=rd('_monosh_boss_state')
  logf:write(string.format('{"f":%d,"boss":%d,"ps":%d,"mono_at":%d,"tk":%d,"sfx":[%s]}\n',field,b,rd('_monosh_player_state'),mono_at,emu.read16(3,emu.memType.spcRam),table.concat(sfx,',')))
  sfx={}
  if b==3 and done_at<0 then done_at=field end
  if field>=maxfield or (done_at>0 and field>=done_at+P.tail) then
    if frames then frames:close() end
    logf:close();emu.stop(0)
  end
end),emu.eventType.endFrame)
'''

DEFAULT = {'wx': 60, 'wy0': 140, 'ph': 0.0, 'boss_dy': 20, 'aim_dy': 24, 'minw': 6, 'maxw': 70, 'danger_w': 28, 'dodge_frames': 20, 'tail': 300, 'ty_min': 88, 'snap': 120}


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--out', type=Path, required=True)
    p.add_argument('--fields', type=int, default=6000)
    p.add_argument('--params', default='{}')
    p.add_argument('--dump', action='store_true')
    p.add_argument('--timeout', type=int, default=1200)
    a = p.parse_args()
    params = {**DEFAULT, **json.loads(a.params)}
    rom = FX2 / 'releases/MonoSHFX2_v001.sfc'
    # labels saved with the release ROM's own verification run (build/ may hold a different build)
    res = FX2 / 'game/v001/results/native_audio_v2_20261009'
    sha = hashlib.sha256(rom.read_bytes()).hexdigest()
    assert sha in (res / 'natural_profile/summary.json').read_text(), 'release ROM does not match the saved labels'
    labels = {m[2]: int(m[1], 16) for m in re.finditer(r'al ([0-9A-Fa-f]+) \.([^\s]+)', (res / 'game.lbl').read_text())}
    out = a.out.resolve(); out.mkdir(parents=True, exist_ok=True)
    (out / 'error.txt').unlink(missing_ok=True)
    s = (SCRIPT.replace('LABELS', lua(labels)).replace('OUTDIR', lua(out.as_posix())).replace('MAXFIELD', str(a.fields))
         .replace('DUMP', 'true' if a.dump else 'false').replace('PARAMS', lua(params)))
    (out / 'play.lua').write_text(s, encoding='utf-8')
    mesen = prepare_runtime(MESEN_EXE)
    st = mesen.parent / 'settings.json'
    cfg = json.loads(st.read_text())
    cfg['Snes'].update({'Port1': {'Type': 'SnesController'}, 'DisableFrameSkipping': True, 'Region': 'Ntsc', 'RamPowerOnState': 'AllZeros'})
    cfg['Debug']['ScriptWindow']['ScriptTimeout'] = 30
    st.write_text(json.dumps(cfg))
    r = subprocess.run([str(mesen), '--testRunner', f'--timeout={a.timeout}', '--doNotSaveSettings', '--enableStdout', str(rom), str(out / 'play.lua')],
                       cwd=mesen.parent, capture_output=True, timeout=a.timeout + 30, creationflags=getattr(subprocess, 'CREATE_NO_WINDOW', 0))
    err = (out / 'error.txt').read_text() if (out / 'error.txt').exists() else ''
    rows = [json.loads(l) for l in (out / 'log.jsonl').read_text().splitlines()]
    ev = [(r['f'], v) for r in rows for v in r['sfx']]
    boss_on = next((r['f'] for r in rows if r['boss'] == 1), None)
    done = next((r['f'] for r in rows if r['boss'] == 3), None)
    summary = {'params': params, 'exit': r.returncode, 'error': err, 'fields': len(rows), 'boss_on': boss_on, 'boss_done': done,
               'deaths': sum(1 for f, v in ev if v == 0 and f > 60), 'stumbles': sum(1 for _, v in ev if v == 2),
               'explosions': sum(1 for _, v in ev if v == 3), 'reflects': sum(1 for _, v in ev if v == 4),
               'mono_at': rows[-1]['mono_at'], 'rom_sha256': hashlib.sha256(rom.read_bytes()).hexdigest()}
    (out / 'summary.json').write_text(json.dumps(summary, indent=1))
    print(json.dumps({k: summary[k] for k in ('exit', 'error', 'fields', 'boss_on', 'boss_done', 'deaths', 'stumbles', 'explosions', 'reflects', 'mono_at')}))


if __name__ == '__main__':
    main()
