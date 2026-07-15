import{World}from'./engine.js';
// 基準村: 地形+addZone(入植キット支給経路)。標準プレイ=均衡配置+輸出拡張
const w=new World(11);w.market={x:25,y:32};w.port={x:25,y:35};
const terr=[];for(let y=0;y<40;y++){terr.push([]);for(let x=0;x<48;x++){let t='grass';
  if(y>36||(y>33&&x>18&&x<32))t='water';else if(y>32&&y<=36)t='sand';terr[y].push(t);}}
w.setTerrain(terr);
['fisher','fisher','veg','wheat','woodshop','charburner','saltworks','shepherd','veg','fisher'].forEach((j,i)=>w.addZone(j,23+i%5,26+(i*2)%6));
const plan={13:'fisher',14:'rapeseed',15:'quarryman',17:'rapeseed',18:'wheat',20:'veg'};
for(let d=1;d<=1440;d++){if(d%30===1){const m=Math.floor(d/30)+1;if(plan[m])w.addZone(plan[m],14+m%6,20+(m*3)%8);}w.step();
 if(d%360===0)console.log('Y'+d/360,'金庫',Math.round(w.treasury*10),'飢餓',w.famine,'支援',w.bailouts,'破産',w.goDay,'Lv最高',Math.max(...w.hhs.map(h=>h.lv)));}
console.log('SMOKE OK (貨幣保存則も全日通過)');
