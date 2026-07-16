import{mkWorld,findSpot} from './village.mjs';
import{GOODS} from './engine.js';
// 世帯健全性バッテリー: 3年目の職業別収入/財布/死蔵/屋台滞留を検査
const w=mkWorld(11);
const plan={13:'wheat',16:'charburner',20:'fisher',26:'woodshop',30:'rapeseed'};
for(let d=1;d<=1080;d++){if(d%30===1){const m=Math.floor(d/30)+1;
  if(plan[m]){const s=findSpot(w,plan[m]);if(s)w.addZone(plan[m],s[0],s[1]);}}
 w.step();}
console.log('=== 世帯健全性(3年目) ===');
let warn=0;
const by={};for(const h of w.hhs)(by[h.job]=by[h.job]||[]).push(h);
for(const j in by){const hs=by[j];
  const inc=hs.map(h=>Math.round((h.incY||0)*10));
  const purse=hs.map(h=>Math.round(h.purse*10));
  const dead=hs.map(h=>{for(const g of GOODS)if(h.pantry[g]>800)return g+Math.round(h.pantry[g]);return '-';});
  const bad=inc.every(v=>v<500)&&purse.every(v=>v<100);
  if(bad){console.log('⚠ '+j+': 全世帯が年収500未満+無一文 (在庫: '+dead.join(',')+')');warn++;}
  else console.log('  '+j+': 年収'+inc.join(',')+' 財布'+purse.join(',')+' 死蔵'+dead.join(','));}
for(const g of GOODS){const st=w.stalls[g].reduce((a,x)=>a+x.qty,0);
  if(st>250){console.log('⚠ 屋台に'+g+'が'+Math.round(st)+'荷滞留(買い手不在)');warn++;}}
console.log(warn?('検出 '+warn+'件'):'健全');
