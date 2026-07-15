// 世帯健全性チェック(標準バッテリー): 収入ゼロ職・在庫の山・財布分布・死蔵を検出
import{World,GOODS} from './engine.js';
const w=new World(11);w.market={x:25,y:32};w.port={x:25,y:35};
const terr=[];for(let y=0;y<40;y++){terr.push([]);for(let x=0;x<48;x++){let t='grass';
  if(y>36||(y>33&&x>18&&x<32))t='water';else if(y>32&&y<=36)t='sand';
  if(x<16&&y<16&&((x*7+y*13)%5<3))t='forest';if(x>38&&y<10)t='rock';terr[y].push(t);}}
w.setTerrain(terr);
['fisher','fisher','veg','wheat','woodshop','charburner','saltworks','shepherd','veg','fisher','wheat','quarryman'].forEach((j,i)=>w.addZone(j,22+i%6,24+(i*2)%8));
const income={},lastIncome={};
for(let d=0;d<1080;d++){w.step();
  if(d===719)for(const h of w.hhs)lastIncome[h.id]=0;
  if(d>=719)for(const h of w.hhs)lastIncome[h.id]=(lastIncome[h.id]||0)+h.income30;}
console.log('=== 世帯健全性(3年目) ===');
let issues=0;
const byJob={};
for(const h of w.hhs){(byJob[h.job]=byJob[h.job]||[]).push(h);}
for(const j in byJob){
  const hs=byJob[j];
  const inc=hs.map(h=>Math.round(h.incomeLog.reduce((a,b)=>a+b,0)));
  const purse=hs.map(h=>Math.round(h.purse));
  const bigStock=hs.map(h=>{let m=null,q=20;for(const g of GOODS)if(h.pantry[g]>q&&g!=='wheat'){q=h.pantry[g];m=g;}return m?`${m}${Math.round(q)}`:'-';});
  const dead=inc.every(v=>v<5)&&purse.every(v=>v<20);
  if(dead){issues++;console.log(`⚠ ${j}: 全世帯が収入ほぼゼロ+無一文 (在庫: ${bigStock.join(',')})`);}
  else console.log(`  ${j}: 30日収入${inc.join(',')} 財布${purse.join(',')} 死蔵${bigStock.join(',')}`);}
// 屋台の腐れ在庫(30日以上値下げされ続けている山)
for(const g of GOODS){const st=w.stalls[g];const q=st.reduce((s,x)=>s+x.qty,0);
  if(q>100)console.log(`⚠ 屋台に${g}が${Math.round(q)}荷滞留(買い手不在)`);}
console.log(issues?`検出 ${issues}件`:'職種デッドロックなし');
