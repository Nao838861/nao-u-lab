import{mkWorld,findSpot} from './village.mjs';
// 基準村(地形拘束適合)+食料先行の拡張。貨幣保存則はエンジン内で毎日assert
const w=mkWorld(11);
const plan={13:'wheat',16:'logger',20:'fisher',26:'woodshop',30:'rapeseed'}; // 食料先行。M16=雑木林が痩せ木こりが森の腕へ(設計の弧)
const road=(x1,y1,x2,y2)=>{const n=Math.max(Math.abs(x2-x1),Math.abs(y2-y1));
  for(let i=0;i<=n;i++)w.planRoad(Math.round(x1+(x2-x1)*i/n),Math.round(y1+(y2-y1)*i/n));}; // 普請計画(困窮世帯が実際に働いて完成する)
let roadDone=false;
for(let d=1;d<=1440;d++){if(d%30===1){const m=Math.floor(d/30)+1;
   if(plan[m]){const s=findSpot(w,plan[m]);if(s){w.addZone(plan[m],s[0],s[1]);
     if(!roadDone&&plan[m]==='logger'){road(w.market.x,w.market.y,s[0],s[1]);roadDone=true;}}}}
 // プレイヤーの商館運用の模写: 注文が来たら目標を注文数まで・麦は人口×2を常備
 if(d%5===0){if(w.order)w.stockTgt[w.order.g]=Math.max(w.stockTgt[w.order.g]||0,Math.ceil((w.stock[w.order.g]||0)+w.order.left));
  w.stockTgt.wheat=Math.max(w.stockTgt.wheat||0,Math.round(w.pop()*2));}
 w.step();
 if(d%360===0)console.log('Y'+d/360,'金庫',Math.round(w.treasury*10),'飢餓',w.famine,'支援',w.bailouts,'破産',w.goDay,'Lv最高',Math.max(...w.hhs.map(h=>h.lv)),'森計',Math.round(w.grove));}
console.log('SMOKE OK (貨幣保存則も全日通過)');
