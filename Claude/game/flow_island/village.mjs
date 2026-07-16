import{World,GOODS,stdTerrain} from './engine.js';
// 地形拘束適合の基準村: 漁師=水際/木工炭焼=雑木林の際/その他=市場周辺の草地
export const BASE=[['fisher',23,32],['fisher',27,32],['veg',22,30],['wheat',21,28],['woodshop',27,26],['charburner',31,28],['saltworks',26,31],['shepherd',24,28],['veg',22,28],['fisher',21,33]];
export function mkWorld(seed){const w=new World(seed);w.market={x:25,y:32};w.port={x:25,y:35};
  w.setTerrain(stdTerrain());
  for(const[j,x,y]of BASE){if(!w.addZone(j,x,y))throw new Error('基準村の配置不可: '+j+'@'+x+','+y);}
  return w;}
// 職業ごとに建設可能な最寄りの空き地を市場から外へ探す(自動プレイ用)
export function findSpot(w,job){const mx=w.market.x,my=w.market.y;
  for(let r=2;r<26;r++)for(let a=0;a<24;a++){const th=a/24*6.283;
    const x=Math.round(mx+Math.cos(th)*r),y=Math.round(my+Math.sin(th)*r);
    const[ok]=w.canPlace(job,x,y);
    const woodJob=job==='woodshop'||job==='charburner';
    const crowd=woodJob&&w.hhs.some(h=>(h.job==='woodshop'||h.job==='charburner')&&Math.hypot(h.x-x,h.y-y)<6); // 伐採業は同じ森パッチに密集させない(局所再生量の限界)
    if(ok&&!crowd&&!w.zones.some(z=>Math.abs(z.x-x)<1.5&&Math.abs(z.y-y)<1.5)&&!w.hhs.some(h=>Math.abs(h.x-x)<1.5&&Math.abs(h.y-y)<1.5))return[x,y];}
  return null;}
