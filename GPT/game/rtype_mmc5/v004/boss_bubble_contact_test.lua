-- 1列目はフォースで全弾を受ける。2列目は射出したフォースの下へ入る。
local frame=0
local function rd(k,i)return emu.read(L[k]+(i or 0),emu.memType.nesMemory)end
local function clock()return rd('boss_clock')+256*rd('boss_clock',1)end
local blocked,impact
emu.addEventCallback(function()
 local t,y=clock(),rd('py')
 local target=t<246 and 116 or t<286 and 72 or 110
 emu.setInput({select=t==30,b=t==275,up=y>target+1,down=y<target-1},0)
end,emu.eventType.inputPolled)
emu.addEventCallback(function()
 frame=frame+1
 if clock()==242 then blocked=rd('deflected')==9 and rd('deaths')==0 end
 if rd('deaths')==1 and rd('death_cause')==2 and not impact then impact=clock() end
 if frame==540 then
  local out=assert(io.open(DIR..'/bubble-contact.txt','w'))
  out:write('shielded='..tostring(blocked)..' shipHit='..tostring(impact));out:close()
  emu.stop(blocked and impact and impact>275 and impact<400 and 0 or 1)
 end
end,emu.eventType.endFrame)
