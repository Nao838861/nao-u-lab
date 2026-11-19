-- 録画用の試射モード。登録するのはパッドと観測コールバックだけ。
local frame,first=0,0
local peak,missed,writes,closed,opened=0,0,0,false,false
local captures={ [23]=1,[260]=1, [55]=1,[87]=1,[105]=1,[145]=1,[181]=1,[201]=1,[332]=1,[544]=1,[560]=1 }
local lateVRAM,lateScroll=0,0
local function visible()
 local line=emu.getState()['ppu.scanline'];return frame>35 and line>=0 and line<240
end
emu.addMemoryCallback(function()if visible() then lateVRAM=lateVRAM+1 end end,emu.callbackType.write,0x2007)
emu.addMemoryCallback(function()if visible() then lateScroll=lateScroll+1 end end,emu.callbackType.write,0x2005)
local volley={}
local previousTick=nil
local repeatedTicks=0
local repeatsAt={}
local function rd(k,i)return emu.read(L[k]+(i or 0),emu.memType.nesMemory)end
local function shot(name)
 local f=assert(io.open(DIR..'/'..name..'.png','wb'));f:write(emu.takeScreenshot());f:close()
end
emu.addMemoryCallback(function()writes=writes+1 end,emu.callbackType.write,0x4014)
emu.addEventCallback(function()
 local y=rd('py')
 local target=frame<240 and 153 or frame<475 and 83 or (frame>740 and not VICTORYFIRE) and 175 or 150
 emu.setInput({up=y>target+1,down=y<target-1,a=frame>745 and frame<1020,b=frame>=1020 and frame<1240},0)
end,emu.eventType.inputPolled)
emu.addEventCallback(function()
 frame=frame+1
 local t=rd('boss_clock')+256*rd('boss_clock',1)
 -- The first tick also initializes the cartridge and both name tables.
 if t==2 and first==0 then first=frame end
 if first==0 then return end
 local elapsed=frame-first
 local cur=rd('tick')
 if previousTick==cur then repeatedTicks=repeatedTicks+1;table.insert(repeatsAt,elapsed) end
 previousTick=cur
 if elapsed>0 and writes~=1 then missed=missed+1 end
 writes=0
 local pose=rd('core_pose')
 if t>20 and t<45 then assert(pose==0 and rd('enemy_live',6)==0) end
 if pose>=2 then opened=true;assert(rd('enemy_live',6)==7) end
 if opened and t>=556 and pose==0 then closed=true;assert(rd('enemy_live',6)==0) end
 local count=0
 for i=0,8 do
  local age=rd('bubble_age',i)
  if age~=0 then
   count=count+1
   if age==2 then table.insert(volley,t) end
   if age==30 then assert(math.abs(rd('bubble_y',i)-133)<=2) end
   if age==75 then assert(rd('bubble_y',i)<114) end
  end
 end
 peak=math.max(peak,count)
 if captures[t] and elapsed<616 then shot('attack-'..t) end
 if FILM and elapsed<740 then shot(string.format('attackfilm%04d',elapsed)) end
 if elapsed==1240 then
  local result=assert(io.open(DIR..'/attack-result.txt','w'))
  result:write('peak='..peak..' missed='..missed..' repeatsAt='..table.concat(repeatsAt,',')..' repeatedTicks='..repeatedTicks..' lateVRAM='..lateVRAM..' lateScroll='..lateScroll..' salvos='..rd('salvos')..' closed='..tostring(closed)..' launches='..table.concat(volley,','));result:close()
  local ok=peak==9 and missed==0 and repeatedTicks==0 and closed and lateVRAM==0 and lateScroll==0
  -- Fire through the eye in the victory run and keep shooting during cleanup.
  if VICTORYFIRE then ok=ok and rd('boss_cleared')~=0 else ok=ok and #volley==54 end
  ok=ok and volley[1]==137 and volley[10]==275 and volley[19]==414
  emu.stop(ok and 0 or 1)
 end
end,emu.eventType.endFrame)
