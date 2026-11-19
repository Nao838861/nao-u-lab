-- 同じ入力で出現位置と生存中の軌跡を測る。試射に切り替えて自機は左端に寄せる。
local frame,first,lastDMA,dma,missed=0,nil,0,0,0
local log=assert(io.open(DIR..'/encounter-path.csv','w'))
local function rd(name,n) return emu.read(L[name]+(n or 0),emu.memType.nesMemory) end
emu.addMemoryCallback(function()
 dma=dma+1
 if not first and rd('tick')==1 then first=frame end
end,emu.callbackType.write,0x4014)
emu.addEventCallback(function()
 local y=rd('py')
 local target=(frame<1050 or (frame>=1620 and frame<2020)) and 184 or 58
 emu.setInput({select=frame==34,left=frame<110,up=y>target+1,down=y<target-1},0)
end,emu.eventType.inputPolled)
emu.addEventCallback(function()
 frame=frame+1
 if frame>60 and dma==lastDMA then missed=missed+1 end
 lastDMA=dma
 if not first then return end
 local t=frame-first
 log:write(t,',',rd('camera')+256*rd('camera',1))
 for i=0,ENCOUNTER_SLOTS-1 do
  log:write(string.format(',%d/%d/%d/%d',rd('enemy_live',i),rd('age',2*i)+256*rd('age',2*i+1),rd('enemy_x',i)+8,rd('enemy_y',i)-8))
 end
 log:write('\n')
 if FILM and t%2==0 and (t>=228 and t<=410 or t>=1100 and t<=1160 or t>=1200 and t<=1440 or t>=1760 and t<=2020 or t>=2008 and t<=2128 or t>=3080 and t<=3260) then
  local f=assert(io.open(DIR..'/encounter'..t..'.png','wb'));f:write(emu.takeScreenshot());f:close()
 end
 if t==3450 then log:close();local f=assert(io.open(DIR..'/encounter-missed.txt','w'));f:write(missed);f:close();emu.stop(missed==0 and 0 or 1) end
end,emu.eventType.endFrame)
