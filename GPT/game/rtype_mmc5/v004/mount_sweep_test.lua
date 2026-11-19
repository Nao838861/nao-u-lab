-- 全砲台を通常のスクロールとコントローラー入力で通過する。
local total=MOUNT_TOTAL
local frame=0
local seen,dead={},{}
local ranged=0
local function rd(k,i)return emu.read(L[k]+(i or 0),emu.memType.nesMemory)end
local function word(k)return rd(k)+256*rd(k,1)end
emu.addEventCallback(function()
 local id
 for i=0,total-1 do
  if rd('gun_live',i)~=0 and rd('gun_dead',i)==0 then id=i;break end
 end
 local x,y=rd('px'),rd('py')
 local tx,ty=90,115
 if id then
  tx=math.min(140,math.max(4,rd('gun_screen',id)-60))
  ty=8*math.floor(rd('gun_height',id)/8)
 end
 emu.setInput({select=frame==35,up=y>ty+1,down=y<ty-1,right=x<tx-1,left=x>tx+1,b=frame>36 and id~=nil and math.abs(ty-y)<20},0)
end,emu.eventType.inputPolled)
emu.addEventCallback(function()
 frame=frame+1
 for i=0,total-1 do
  if rd('gun_live',i)~=0 then seen[i]=true end
  if rd('gun_dead',i)~=0 and not dead[i] then
   if math.abs(rd('gun_screen',i)-rd('fx')-11)>20 then ranged=ranged+1 end
   dead[i]=true
  end
 end
 if word('camera')>1110 then
  local n,k=0,0
  for i=0,total-1 do if seen[i] then n=n+1 end;if dead[i] then k=k+1 end end
  local fp=assert(io.open(DIR..'/mount-sweep.txt','w'));fp:write('seen='..n..' destroyed='..k..' ranged='..ranged..' total='..total);fp:close()
  emu.stop(n==total and k==total and ranged==total and 0 or 1)
 end
end,emu.eventType.endFrame)
