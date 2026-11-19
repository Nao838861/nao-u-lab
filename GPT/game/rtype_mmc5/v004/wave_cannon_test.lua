-- 実際の入力のみで床砲台を狙い、フォース射出中と試射中にも撃つ。
local frame=0
local full,detached,medium,trial=false,false,false,false
local fired,stopped=false,true
local firstHit=0
local timerAfterHit
local function rd(k,i)return emu.read(L[k]+(i or 0),emu.memType.nesMemory)end
local function shot(file)
 local fp=assert(io.open(DIR..'/'..file..'.png','wb'));fp:write(emu.takeScreenshot());fp:close()
end
emu.addEventCallback(function()
 local y=rd('py')
 local target=frame<55 and 146 or frame<108 and 174 or frame<220 and 110 or 32
 local a=(frame>=30 and frame<99) or (frame>=130 and frame<211)
        or (frame>=259 and frame<294) or (frame>=343 and frame<418)
 emu.setInput({up=y>target+1,down=y<target-1,a=a,b=frame==119,select=frame==224},0)
end,emu.eventType.inputPolled)
emu.addEventCallback(function()
 frame=frame+1
 if frame<100 and rd('gun_timer')==154 then fired=true end
 if rd('gun_dead')>0 and firstHit==0 then
  firstHit=frame;timerAfterHit=rd('gun_timer')
 end
 if firstHit~=0 and rd('gun_timer')~=timerAfterHit then stopped=false end
 for i=0,3 do
  local x,power=rd('bolts',3*i),rd('bolts',3*i+2)
  if rd('bolt_travel',i)==1 and x==rd('px')+28 then
   if power==4 and frame<120 then full=true end
   if power==4 and frame>200 and rd('fx')>=225 and rd('drill')==0 then detached=true end
   if power==2 then medium=true end
   if power==4 and rd('drill')~=0 then trial=true end
  end
 end
 if frame==99 or frame==105 or frame==128 then
  shot('cannon-'..frame..'-x'..rd('gun_screen'))
 end
 if FILM and frame>=10 and frame<460 then shot(string.format('weaponfilm%04d',frame-10)) end
 if frame==460 then
  local out=assert(io.open(DIR..'/cannon-result.txt','w'))
  out:write('fired='..tostring(fired)..' hit='..firstHit..' stopped='..tostring(stopped)..' full='..tostring(full)..' detached='..tostring(detached)..' medium='..tostring(medium)..' trial='..tostring(trial));out:close()
  local ok=fired and firstHit>=100 and firstHit<118 and rd('gun_dead')==1 and stopped and full and detached and medium and trial
  emu.stop(ok and 0 or 1)
 end
end,emu.eventType.endFrame)
