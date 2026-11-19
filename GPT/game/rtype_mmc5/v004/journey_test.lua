local frame=0
local stats=io.open(DIR..'/journey.csv','w')
local function rd(k,i)return emu.read(L[k]+(i or 0),emu.memType.nesMemory) end
local function word(k,i)return rd(k,i)+256*rd(k,(i or 0)+1) end
local function save(name)
 local fp=assert(io.open(DIR..'/'..name..'.png','wb'));fp:write(emu.takeScreenshot());fp:close()
end
local function approach(x,y,tx,ty)
 return {right=x<tx-1,left=x>tx+1,down=y<ty-1,up=y>ty+1}
end
local seen={blue=0,red=0,bit=0,medium=0,large=0,charge=0,ion=0,detached=0,returned=0,restored=0}
local taken,lastDeath=0,0
local lastPickup=0

emu.addEventCallback(function()
 local cam=word('camera');local x,y=rd('px'),rd('py')
 local tx,ty=32,117
 local fire=(frame%13==0)
 if cam<66 then tx=math.max(9,170-cam);ty=x>=tx-3 and 200 or 164;fire=frame%8==0 end
 if cam>=66 and cam<165 then ty=95+math.floor(math.sin(frame/40)*28);tx=55 end
 if cam>=395 and cam<462 then tx=math.max(20,646-cam);ty=x>=tx-5 and 200 or 163;fire=frame%8==0 end
 if cam>=462 and cam<500 then tx=142;ty=163;fire=frame%8==0 end
 if cam>=500 and cam<663 then tx=95;ty=167;fire=frame%8==0 end
 if cam>=700 and cam<832 then tx=12;ty=116;fire=frame%11==0 end
 if cam>=832 and cam<970 then tx=48;ty=110;fire=frame%8==0 end
 if cam>=970 and cam<1070 then tx=60;ty=110;fire=frame%12==0 end
 if cam>=1070 then tx=16;ty=cam>=1260 and 122 or 114;fire=frame%12==0 end
 if cam<491 then
  for i=0,5 do
   if rd('enemy_live',i)==1 then
    tx=math.min(216,math.max(3,rd('enemy_x',i)-13))
    ty=math.abs(x-tx)<=3 and rd('enemy_y',i)+8 or 161
    fire=frame%6==0;break
   end
  end
 end
 for i=0,2 do
  local k=rd('items',4*i+3)
  if k~=0 then
   local target=word('items',4*i)-cam
   if target>=0 and target<249 then tx=math.min(216,math.max(3,target-10));ty=rd('items',4*i+2);break end
  end
 end
 if frame-lastPickup<28 and lastPickup>0 then tx=x;ty=155 end
 if cam<12 then ty=174;fire=frame%5==0 end
 if cam<68 and rd('pickups')>=1 then tx=x;ty=140 end
 -- Pass below the returning volley before climbing to the blue capsule.
 if cam>=923 and cam<942 and rd('pickups')==3 then ty=134 end
 local pad=approach(x,y,tx,ty);pad.a=fire
 if cam>=515 and (cam<932 or cam<985 and rd('pickups')<4) then
  -- Roll each of the nine pad directions forward a short distance. All
  -- movement, pickups and hits still go through the real controller port.
  local best=1e9;local bestX,bestY=0,0
  for dx=-2,2,2 do for dy=-2,2,2 do
   local cost=0
   for t=3,18,3 do
    local nx=math.min(217,math.max(2,x+dx*t))
    local ny=math.min(211,math.max(30,y+dy*t))
    local col=math.floor((cam+t*.305+nx+10)/4)+1
    if ny<TOP[col]+5 or ny>BOTTOM[col]-5 then cost=cost+1000 end
    for i=0,5 do
     local off=7*i
     if rd('bullets',off+6)>0 then
      local vx=rd('bullets',off+4);local vy=rd('bullets',off+5)
      if vx>=128 then vx=vx-256 end;if vy>=128 then vy=vy-256 end
      local bx=rd('bullet_x',i)+vx*t/16;local by=rd('bullet_y',i)+vy*t/16
      if math.abs(bx-(nx+10))<8 and math.abs(by-ny)<6 then cost=cost+1000/(t+2) end
     end
    end
    for i=0,ENCOUNTER_SLOTS-1 do
     if rd('enemy_live',i)>0 and math.abs(rd('enemy_x',i)+8-nx-10)<13
        and math.abs(rd('enemy_y',i)+8-ny)<12 then cost=cost+20 end
    end
    cost=cost+(math.abs(nx-tx)+math.abs(ny-ty))*.02
   end
   if cost<best then best=cost;bestX=dx;bestY=dy end
  end end
  pad.left=bestX<0;pad.right=bestX>0;pad.up=bestY<0;pad.down=bestY>0
 end
 if cam>=170 and cam<204 then pad.a=true end
 if cam>=227 and cam<230 or cam>=250 and cam<253 then pad.b=true end
 emu.setInput(pad,0)
end,emu.eventType.inputPolled)
local lastDma=0;local dma=0;local missed=0;local first=nil
emu.addMemoryCallback(function() dma=dma+1;if first==nil and rd('tick')==1 then first=frame end end,emu.callbackType.write,0x4014)
local previous={}
local salvo={bare=0,blue=0,red=0,bit=0,normal=0,turn=0,straight=0}
local clip=SALVOCLIP and assert(io.open(DIR..'/salvo-frames.csv','w'))
local function checkSalvo()
 local w,b=rd('weapon'),rd('bit_owned')
 local capture=SALVOCLIP and frame>=150 and frame<=4400
 if capture and frame%2==0 then save(string.format('salvo%04d',frame)) end
 for slot=0,9 do
  local p=rd('bolts',3*slot+2)
  local x,y=rd('bolts',3*slot),rd('bolts',3*slot+1)
  local prev=previous[slot]
  if p~=0 then
   if slot>=8 then
    local age=rd('missile_age',slot-8)
    if age==1 then
     assert(w~=0 and rd('drill')==0)
     if slot==8 and rd('bolts',29)==6 then
      assert(rd('bolts',27)==x and rd('bolts',28)-y==14)
      local color=w==1 and 'red' or 'blue'
      salvo[color]=salvo[color]+1
      if capture then clip:write(string.format('launch,%d,%d,%d,%d\n',frame,w,rd('px'),rd('py'))) end
     end
    elseif prev and prev.p==6 then
     local vy=rd('missile_vy',slot-8)
     if vy>=128 then vy=vy-256 end
     assert(math.abs(vy)<=4)
     local dy=age<=6 and (slot==8 and -1 or 1) or vy
     if vy~=0 then
      salvo.turn=1
      if capture and prev.vy==0 then clip:write(string.format('turn,%d,%d,%d,%d\n',frame,slot,x,y)) end
     elseif age>40 then salvo.straight=1 end
     assert(y==prev.y+dy)
     assert(x-prev.x>=1 and x-prev.x<=6)
    end
   elseif prev and p==prev.p and x>prev.x then
    if p==1 then
     assert(x-prev.x==10)
     if w==0 then salvo.bare=1 else salvo.normal=1 end
    elseif p==5 then assert(b==1 and x-prev.x==5);salvo.bit=1 end
   end
  end
  previous[slot]={p=p,x=x,y=y,vy=slot>=8 and rd('missile_vy',slot-8) or 0}
 end
end
emu.addEventCallback(function()
 frame=frame+1
 checkSalvo()
 if frame>60 and dma==lastDma then missed=missed+1 end
 lastDma=dma
 local cam=word('camera')
 local a=rd('pickups');local b=rd('deaths')
 if frame%20==0 or a~=taken or b~=lastDeath then
  local line=string.format('%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d',frame,cam,rd('px'),rd('py'),rd('weapon'),rd('bit_owned'),a,b,rd('deflected'),rd('boss_hp'),rd('boss_cleared'),missed)
  for i=0,5 do line=line..string.format(',%d/%d/%d',rd('enemy_live',i),rd('enemy_x',i),rd('enemy_y',i)) end
  for i=0,2 do line=line..string.format(',%d/%d/%d',rd('items',i*4+3),word('items',i*4)-cam,rd('items',i*4+2)) end
  stats:write(line..'\n')
 end
 if a~=taken then lastPickup=frame;save('pickup'..a) end
 if b~=lastDeath then save('loss'..b) end
 taken=a;lastDeath=b
 if FILM and frame>=14 and frame<4500 and frame%2==0 then save(string.format('play%04d',(frame-14)/2)) end
 local level=rd('force_level')
 if level==2 then seen.medium=1 elseif level==3 then seen.large=1 end
 local w=rd('weapon')
 if w==2 then seen.blue=1 elseif w==1 then seen.red=1 end
 if rd('bit_owned')==1 then seen.bit=1 end
 if lastDeath>0 and rd('invulnerable')>0 then seen.restored=1 end
 if cam>228 and cam<260 and math.abs(rd('fx')-rd('px')-14)>30 then seen.detached=1 end
 if cam>252 and seen.detached==1 and math.abs(rd('fx')-rd('px')-14)<=1 then seen.returned=1 end
 for i=0,7 do
  local power=rd('bolts',3*i+2)
  if power>=2 and power<=4 then seen.charge=1 end
  if power==5 then seen.ion=1 end
 end
 if frame==4490 then
  local guns=0
  for i=0,MOUNT_TOTAL-1 do if rd('gun_dead',i)>0 then guns=guns+1 end end
  local result=assert(io.open(DIR..'/journey-result.txt','w'))
  for k,v in pairs(seen) do result:write(k..'='..v..' ') end
  result:write('first='..first..' guns='..guns..' deflected='..rd('deflected')..' pickups='..rd('pickups')..' deaths='..rd('deaths')..' missed='..missed)
  for k,v in pairs(salvo) do result:write(' salvo_'..k..'='..v) end
  result:close();stats:close();if clip then clip:close() end;emu.stop(0)
 end
end,emu.eventType.endFrame)
