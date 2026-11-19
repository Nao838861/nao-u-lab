-- 通常のパッド入力で腹部にフォースを当て、撃破後の部屋を確かめる。
local f=0
local cleared=0
local low=24
local function rd(key) return emu.read(L[key],emu.memType.nesMemory) end
emu.addEventCallback(function()
    -- ボス開始版は試射モードから始まる。Selectで通常操作に戻す。
    emu.setInput({select=f==36,down=f>=42 and f<45,b=f==65,a=false},0)
end,emu.eventType.inputPolled)
emu.addEventCallback(function()
    f=f+1
    if f>50 then low=math.min(low,rd('boss_hp')) end
    if rd('boss_cleared')~=0 then
        cleared=cleared+1
        if cleared==65 then
            local p=assert(io.open(DIR..'/boss-clear.png','wb'))
            p:write(emu.takeScreenshot());p:close()
            local result=assert(io.open(DIR..'/boss-result.txt','w'))
            result:write('frame='..f..' hp='..low);result:close();emu.stop(0)
        end
    end
    if f==3000 then emu.stop(1) end
end,emu.eventType.endFrame)
