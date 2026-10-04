local labels = LABELS
local output = OUTDIR
local maxframe = MAXFRAME
local scenario = SCENARIO
local report = assert(io.open(output..'/trace.jsonl','w'))
local field = 0
local rendered = 0
local clock_start = 0
local gsu_start = 0
local dma_start = 0
local profile={}
local failed=false
local previous_field,previous_boss,previous_player=0,0,0
local stats={fields=0,rendered=0,checked=0,deaths=0,respawns=0,bossSeen=false,dyingSeen=false,doneSeen=false,loopSeen=false,
             enemyTypes={},enemyPaths={},em1States={},stumbles=0,reflected=0,maxCommands=0,minBytes=65535,maxBytes=0,
             interval1=0,interval2=0,interval3plus=0,cpuMaxMs=0,gsuMaxMs=0,dmaMaxMs=0}
local gsu_ms=0
local cpu_ms=0
-- Mesen LuaのmasterClockはuint32。約200秒ごとのwrapを時間差で吸収する。
local function elapsed(now,started) return ((now-started)&0xffffffff)/21477.272 end
local fixture_started=false
local function dump(name,memtype,address,count)
  local f=assert(io.open(output..'/'..name,'wb'));local bytes={}
  for i=0,count-1 do bytes[#bytes+1]=string.char(emu.read(address+i,memtype)) end
  f:write(table.concat(bytes));f:close()
end
local function screenshot(name)
  local f=assert(io.open(output..'/'..name..'.rgb','wb'));local rgb={}
  for _,v in ipairs(emu.getScreenBuffer()) do rgb[#rgb+1]=string.char((v>>16)&255,(v>>8)&255,v&255) end
  f:write(table.concat(rgb));f:close()
end
local function byte(name,offset)
  return emu.read(0x7E0000+assert(labels[name])+offset,emu.memType.snesMemory)
end
local function put(name,offset,value)
  emu.write(0x7E0000+assert(labels[name])+offset,value&255,emu.memType.snesMemory)
end
local function encoded(v)
  if type(v)=='table' then local out={};for k,x in pairs(v) do out[#out+1]='"'..tostring(k)..'":'..encoded(x) end;return '{'..table.concat(out,',')..'}' end
  if type(v)=='string' then return '"'..v..'"' end
  return tostring(v)
end
local function read(name, size)
  local addr=0x7E0000+assert(labels[name],name)
  local v=emu.read(addr,emu.memType.snesMemory)
  if size==2 then v=v+256*emu.read(addr+1,emu.memType.snesMemory) end
  return v
end
local function write(name,v)
  emu.write(0x7E0000+assert(labels[name]),v&255,emu.memType.snesMemory)
  emu.write(0x7E0000+assert(labels[name])+1,v>>8,emu.memType.snesMemory)
end
local function guard(fn)
  return function(...)
    if failed then return end
    local ok,err=pcall(fn,...)
    if not ok then failed=true; local f=io.open(output..'/error.txt','w'); f:write(tostring(err)); f:close(); report:close();emu.stop(1) end
  end
end
if scenario=='profile' then
for _,name in ipairs({'_fx_frame','_fx_build_packet','_fx_build_ground','_fx_ground_native','_monosh_enemy_frame','_monosh_stage_frame'}) do
  emu.addMemoryCallback(guard(function()
    local clock=emu.getState().masterClock
    if profile.last then report:write(string.format('{"segment":"%s","ms":%.6f,"field":%d}\n',profile.last,elapsed(clock,profile.clock),field)) end
    profile.last=name;profile.clock=clock
  end),emu.callbackType.exec,0x7F0000+labels[name],0x7F0000+labels[name],emu.cpuType.snes,emu.memType.snesMemory)
end
end
emu.addMemoryCallback(guard(function()
  if scenario=='stumble' and field>=400 and not fixture_started then
    fixture_started=true
    write('_monosh_player_bottom',201)
    put('_monosh_player_invuln',0,0)
    put('_monosh_stage_spawn_index',0,read('_monosh_stage1_spawn_count',2)-1)
    for i,v in ipairs({0,0,1,3,0,0}) do put('_monosh_stage_objects',i-1,v) end
    put('_monosh_stage_object_count',0,1)
  end
  if scenario~='boss' or field<90 then return end
  if not fixture_started then
    fixture_started=true
    put('_monosh_player_invuln',0,255)
    put('_monosh_enemy_stage_complete_flag',0,1)
    put('_monosh_enemy_active_count_value',0,0);put('_monosh_enemy_bullet_count',0,0)
    put('_monosh_stage_object_count',0,0)
    put('_monosh_stage_spawn_index',0,read('_monosh_stage1_spawn_count',2)-1)
    write('_monosh_stage_frame_counter',3900)
  end
  -- 通常のボス射撃を先に観測。HPは変更せず、後半で自弾だけを命中位置へ置く。
  if read('_monosh_boss_state')==1 and field>600 then
    local z=byte('_boss_part_z',0)
    local height=byte('_monosh_boss_face_geometry',math.min(z,110)*2+1)
    if z>=8 and z<=90 then
      put('_monosh_player_bullets',0,1)
      put('_monosh_player_bullets',1,byte('_boss_part_x',0))
      put('_monosh_player_bullets',2,byte('_boss_part_bottom',0)-height//2)
      put('_monosh_player_bullets',3,math.max(0,z//2-2));put('_monosh_player_bullets',4,3)
      put('_monosh_player_bullet_count',0,1)
      stats.injectedShots=(stats.injectedShots or 0)+1
    end
  end
end),emu.callbackType.exec,0x7F0000+labels._fx_frame,0x7F0000+labels._fx_frame,emu.cpuType.snes,emu.memType.snesMemory)
emu.addMemoryCallback(guard(function()
  if scenario~='stress' then return end
  for i=0,19 do
    local x=(i%10)*32-16;local bottom=i<10 and 212 or 112
    put('_fx_draw',i*10,x);put('_fx_draw',i*10+1,(x>>8)&255)
    put('_fx_draw',i*10+2,bottom);put('_fx_draw',i*10+3,0)
    put('_fx_draw',i*10+4,68);put('_fx_draw',i*10+5,160)
    put('_fx_draw',i*10+6,4);put('_fx_draw',i*10+7,i%2==0 and 16 or 0)
    put('_fx_draw',i*10+8,i);put('_fx_draw',i*10+9,0)
  end
  put('_fx_draw_count',0,20)
end),emu.callbackType.exec,0x7F0000+labels._fx_build_packet,0x7F0000+labels._fx_build_packet,emu.cpuType.snes,emu.memType.snesMemory)
emu.addMemoryCallback(guard(function()
  gsu_ms=elapsed(emu.getState().masterClock,clock_start)
  stats.gsuMaxMs=math.max(stats.gsuMaxMs,gsu_ms)
end),emu.callbackType.exec,labels.render_stop,labels.render_stop,emu.cpuType.gsu,emu.memType.gsuMemory)
emu.addMemoryCallback(guard(function()
  local now=emu.getState().masterClock
  cpu_ms=elapsed(now,clock_start)
  if scenario=='profile' and profile.last then
    report:write(string.format('{"segment":"%s","ms":%.6f,"field":%d}\n',profile.last,elapsed(now,profile.clock),field))
    profile.last=nil
  end
end),emu.callbackType.exec,0x7F0000+labels.cpu_frame_return,0x7F0000+labels.cpu_frame_return,emu.cpuType.snes,emu.memType.snesMemory)
local function trace()
  local s=emu.getState()
  if field==60 then
    local f=io.open(output..'/state.txt','w')
    for k,v in pairs(s) do if k:find('cpu') or k:find('coprocessor') then f:write(k..'='..tostring(v)..'\n') end end
    f:write('packet='..emu.read(0,emu.memType.gsuWorkRam)..' scratch='..emu.read(4,emu.memType.gsuWorkRam)..' ptr='..emu.read(6,emu.memType.gsuWorkRam)..'\n')
    for k,v in pairs(emu.getInput(0)) do f:write('input '..k..'='..tostring(v)..'\n') end
    f:write('joy='..emu.read(0x4218,emu.memType.snesMemory)..' hi='..emu.read(0x4219,emu.memType.snesMemory)..'\n')
    f:close()
  end
  report:write(string.format('{"field":%d,"logic":%d,"x":%d,"y":%d,"player":%d,"stage":%d,"enemies":%d,"shots":%d,"enemyShots":%d,"boss":%d,"hp":%d,"commands":%d,"cpuPC":%d,"ppuLine":%d,"gsuGO":%d}\n',
    field,read('_monosh_runtime_frame_counter',2),read('_monosh_player_x',2),read('_monosh_player_bottom',2),read('_monosh_player_state'),
    read('_monosh_stage_frame_counter',2),read('_monosh_enemy_active_count_value'),read('_monosh_player_bullet_count'),read('_monosh_enemy_bullet_count'),
    read('_monosh_boss_state'),read('_monosh_boss_hp'),read('_fx_packet_count',2),s['cpu.pc'],s['ppu.scanline'],emu.read(0x3030,emu.memType.snesMemory)))
  report:flush()
end
emu.addMemoryCallback(guard(function(a,v)
  if v~=1 then return end
  local s=emu.getState()
  gsu_start=s['cart.coprocessor.cycleCount'];clock_start=s.masterClock
  profile.last=nil
  if rendered==0 then
    for i=0,15 do emu.write(0x1ff0+i,0xa5,emu.memType.gsuWorkRam);emu.write(0x5000+i,0x5a,emu.memType.gsuWorkRam) end
  end
  if rendered==0 or (rendered+1)%300==0 then
    dump(string.format('draw%05d.bin',rendered+1),emu.memType.snesMemory,0x7E0000+labels._fx_draw,640)
    local f=assert(io.open(output..string.format('/meta%05d.json',rendered+1),'w'))
    f:write(encoded({count=read('_fx_draw_count'),logic=read('_monosh_runtime_frame_counter',2)}));f:close()
  end
end),emu.callbackType.write,0x7E1DF0,0x7E1DF0)
emu.addMemoryCallback(guard(function(a,v)
  if v~=2 then return end
  local s=emu.getState()
  local joined=elapsed(s.masterClock,clock_start)
  stats.cpuMaxMs=math.max(stats.cpuMaxMs,joined)
  report:write(string.format('{"joinedMs":%.5f,"cpuMs":%.5f,"gsuMs":%.5f,"field":%d}\n',joined,cpu_ms,gsu_ms,field))
end),emu.callbackType.write,0x7E1DF0,0x7E1DF0)
emu.addMemoryCallback(guard(function(a,v)
  if v~=3 then return end
  dma_start=emu.getState().masterClock
  if rendered==0 then
    local f=io.open(output..'/descriptors.txt','w')
    for i=0,31 do
      local addr=0x7E0000+labels.fx_dma_desc+i*4
      local a=emu.read(addr,emu.memType.snesMemory)+256*emu.read(addr+1,emu.memType.snesMemory)
      local n=emu.read(addr+2,emu.memType.snesMemory)+256*emu.read(addr+3,emu.memType.snesMemory)
      f:write(i..' '..a..' '..n..'\n')
    end
    f:close()
  end
end),emu.callbackType.write,0x7E1DF0,0x7E1DF0)
emu.addMemoryCallback(guard(function(a,v)
  if v~=4 then return end
  rendered=rendered+1
  local s=emu.getState()
  local duration=elapsed(s.masterClock,dma_start)
  local bytes=read('fx_dma_bytes',2)
  stats.dmaMaxMs=math.max(stats.dmaMaxMs,duration)
  stats.minBytes=math.min(stats.minBytes,bytes);stats.maxBytes=math.max(stats.maxBytes,bytes)
  local interval=field-previous_field;previous_field=field
  if rendered>1 then if interval==1 then stats.interval1=stats.interval1+1 elseif interval==2 then stats.interval2=stats.interval2+1 else stats.interval3plus=stats.interval3plus+1 end end
  local boss=read('_monosh_boss_state');local player=read('_monosh_player_state')
  stats.enemyShotsMax=math.max(stats.enemyShotsMax or 0,read('_monosh_enemy_bullet_count'))
  if boss==1 then stats.bossSeen=true elseif boss==2 then stats.dyingSeen=true elseif boss==3 then stats.doneSeen=true end
  if previous_boss==3 and boss==0 then stats.loopSeen=true end
  if boss~=previous_boss then screenshot('boss_state'..boss) end
  if previous_player==0 and player~=0 then stats.deaths=stats.deaths+1 end
  if previous_player~=0 and player==0 then stats.respawns=stats.respawns+1 end
  if read('_monosh_player_stumble')>0 then stats.stumbles=stats.stumbles+1 end
  stats.stumbleMax=math.max(stats.stumbleMax or 0,read('_monosh_player_stumble'))
  stats.reflected=math.max(stats.reflected,read('_monosh_reflected_bullet_count'))
  previous_boss=boss;previous_player=player
  for i=0,read('_monosh_enemy_active_count_value')-1 do
    local addr=0x7E0000+labels._monosh_enemies+i*10
    local t=emu.read(addr+1,emu.memType.snesMemory);stats.enemyTypes[t]=true
    if t==5 then stats.enemyPaths[emu.read(addr+2,emu.memType.snesMemory)]=true end
    if t==6 then stats.em1States[emu.read(0x7E0000+labels._monosh_enemy_em1_phase+i*2+1,emu.memType.snesMemory)]=true end
  end
  stats.maxCommands=math.max(stats.maxCommands,read('_fx_packet_count',2))
  report:write(string.format('{"dmaMs":%.5f,"bytes":%d,"line":%d,"field":%d,"rendered":%d}\n',duration,bytes,s['ppu.scanline'],field,rendered))
  if maxframe<=720 or rendered<=10 or rendered%30==0 then
  local same=0
  for i=0,12287 do if emu.read(0x2000+i,emu.memType.gsuWorkRam)==emu.read(i,emu.memType.snesVideoRam) then same=same+1 end end
  if same~=12288 then
    local raw={};local f=io.open(output..'/vram.bin','wb')
    for i=0,12287 do raw[#raw+1]=string.char(emu.read(i,emu.memType.snesVideoRam)) end
    f:write(table.concat(raw));f:close()
    raw={};f=io.open(output..'/failed_fb.bin','wb')
    for i=0,12287 do raw[#raw+1]=string.char(emu.read(0x2000+i,emu.memType.gsuWorkRam)) end
    f:write(table.concat(raw));f:close()
    f=io.open(output..'/state_dma.txt','w')
    for k,v in pairs(s) do if k:find('dma') or k:find('ppu.vram') then f:write(k..'='..tostring(v)..'\n') end end
    f:close()
    local f=io.open(output..'/dma_debug.txt','w')
    for i=0,12287 do if emu.read(0x2000+i,emu.memType.gsuWorkRam)~=emu.read(i,emu.memType.snesVideoRam) then f:write(i..'='..emu.read(0x2000+i,emu.memType.gsuWorkRam)..' vs '..emu.read(i,emu.memType.snesVideoRam)..'\n') end end
    f:close()
  end
  assert(same==12288,'partial DMA: '..same)
  stats.checked=stats.checked+1
  assert(s['ppu.scanline']<23 or s['ppu.scanline']>=203,'DMA overlaps visible area')
  for i=0,15 do assert(emu.read(0x1ff0+i,emu.memType.gsuWorkRam)==0xa5 and emu.read(0x5000+i,emu.memType.gsuWorkRam)==0x5a,'GSU clip writes outside framebuffer') end
  assert(emu.read(0,emu.memType.snesCgRam)==0 and emu.read(1,emu.memType.snesCgRam)==0,'backdrop palette corruption')
  end
  if rendered==1 then
    local f=io.open(output..'/framebuffer.bin','wb'); local b={}
    for i=0,12287 do b[#b+1]=string.char(emu.read(0x2000+i,emu.memType.gsuWorkRam)) end
    f:write(table.concat(b));f:close()
    f=io.open(output..'/packet.bin','wb');b={}
    for i=0,1311 do b[#b+1]=string.char(emu.read(i,emu.memType.gsuWorkRam)) end
    f:write(table.concat(b));f:close()
  end
  if rendered==1 or rendered%300==0 then
    dump(string.format('frame%05d.bin',rendered),emu.memType.gsuWorkRam,0x2000,12288)
    dump(string.format('packet%05d.bin',rendered),emu.memType.gsuWorkRam,0,1312)
  end
end),emu.callbackType.write,0x7E1DF0,0x7E1DF0)
emu.addEventCallback(guard(function()
  if scenario=='play' then
    emu.setInput({a=true,up=field>150 and field<180,right=field>180 and field<210,left=field>240 and field<275},0)
  elseif scenario=='long' or scenario=='profile' then
    if read('_monosh_boss_state')==1 then
      local z=byte('_boss_part_z',0)
      local tx=byte('_boss_part_x',0)
      local ty=byte('_boss_part_bottom',0)-byte('_monosh_boss_face_geometry',math.min(z,110)*2+1)//2+20
      local x=read('_monosh_player_x',2);local y=read('_monosh_player_bottom',2)
      emu.setInput({a=true,right=x<tx-3,left=x>tx+3,up=y>ty+3,down=y<ty-3},0)
    else emu.setInput({a=true},0) end
  elseif scenario=='boss' then emu.setInput({},0)
  elseif scenario=='pause' then
    emu.setInput({a=true,start=(field>=151 and field<=154) or (field>=211 and field<=214)},0)
  elseif scenario=='controls' then
    emu.setInput({right=field>=301 and field<=330,left=field>=361 and field<=390,
                  down=field>=401 and field<=430,up=field>=461 and field<=490,y=field>=601 and field<=606},0)
  end
end),emu.eventType.inputPolled)
emu.addEventCallback(guard(function()
  field=field+1
  if rendered>0 then
    if read('_monosh_boss_state')==1 and read('_boss_age')>=100 and not stats.bossImage then screenshot('scene_boss');stats.bossImage=true end
    if read('_monosh_enemy_active_count_value')>=3 and not stats.enemyImage then screenshot('scene_enemies');stats.enemyImage=true end
    if read('_monosh_player_state')~=0 and not stats.deathImage then screenshot('scene_death');stats.deathImage=true end
  end
  if scenario=='controls' and rendered>0 then
    if field==335 then assert(read('_monosh_player_x',2)>128,'right input failed') end
    if field==435 then stats.controlUpY=read('_monosh_player_bottom',2);assert(stats.controlUpY<120,'reverse down input failed') end
    if field==495 then assert(read('_monosh_player_bottom',2)>stats.controlUpY,'reverse up input failed') end
    stats.singleShotMax=math.max(stats.singleShotMax or 0,read('_monosh_player_bullet_count'))
  end
  if scenario=='pause' then
    if field==165 then stats.pauseLogic=read('_monosh_runtime_frame_counter',2) end
    if field==195 then assert(read('_monosh_runtime_frame_counter',2)==stats.pauseLogic,'pause keeps updating logic') end
    if field==240 then assert(read('_monosh_runtime_frame_counter',2)>stats.pauseLogic,'pause did not resume') end
  end
  if field%30==0 then trace() end
  if field==120 or field==240 or field==maxframe then
    local f=assert(io.open(output..'/field'..field..'.rgb','wb'));local rgb={}
    for _,v in ipairs(emu.getScreenBuffer()) do rgb[#rgb+1]=string.char((v>>16)&255,(v>>8)&255,v&255) end
    f:write(table.concat(rgb));f:close()
  end
  if field>=maxframe then
    stats.fields=field;stats.rendered=rendered;stats.logic=read('_monosh_runtime_frame_counter',2);stats.stage=read('_monosh_stage_frame_counter',2)
    local f=assert(io.open(output..'/summary.json','w'));f:write(encoded(stats));f:close()
    assert(rendered>1,'no presented frames')
    if scenario=='boss' then assert(stats.bossSeen and stats.dyingSeen and stats.doneSeen and stats.loopSeen,'boss progression incomplete') end
    if scenario=='long' then assert(stats.bossSeen and stats.loopSeen and stats.deaths>0 and stats.respawns>0,'natural stage progression incomplete') end
    if scenario=='controls' then assert(stats.singleShotMax==1,'single shot was not exactly one slot') end
    if scenario=='stumble' then assert(stats.stumbles==39 and stats.stumbleMax==39 and read('_monosh_player_stumble')==0,'40-update bush stumble/recovery failed') end
    report:close();emu.stop(0);return
  end
  if scenario=='play' then
    emu.setInput({a=true,up=field>150 and field<180,right=field>180 and field<210,left=field>240 and field<275},0)
  end
end),emu.eventType.endFrame)
