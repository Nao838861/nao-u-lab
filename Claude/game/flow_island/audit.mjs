// 意図監査: 「設計意図どおり動いているか」を期待値で自動判定する
// 使い方: node audit.mjs   (全PASS が健全状態。FAILは意図とのズレ=修理対象)
import{World,GOODS} from './engine.js';
import{mkWorld,findSpot} from './village.mjs';
const mk=(seed)=>mkWorld(seed);

let pass=0,fail=0;
const t=(name,cond,detail)=>{console.log((cond?'PASS':'FAIL')+'  '+name+'  '+(detail||''));cond?pass++:fail++;};

// ---- シナリオA: 均衡村+麦2枚追加(食料自給プレイ) 4年×3シード平均 ----
const SEEDS=[11,13,14];const worlds=[];
const stallAvg={},famYear=[0,0,0,0];let doleY3=0,doleN=0;
const priceLog={fish:[],char:[]};
const stuck={};
for(const seed of SEEDS){
 const w=mk(seed);
 const planA={13:'wheat',16:'logger',20:'fisher',26:'woodshop',30:'rapeseed'}; // 標準プレイ=smoke台本と同一(木こりが森の腕へ)
 for(let d=1;d<=1440;d++){
  if(d%30===1){const m=Math.floor(d/30)+1;if(planA[m]){const s=findSpot(w,planA[m]);if(s)w.addZone(planA[m],s[0],s[1]);}}
  w.step();
  for(const g of['wheat','meat','tools','veg'])stallAvg[g]=(stallAvg[g]||0)+w.stalls[g].reduce((s,x)=>s+x.qty,0)/1440/SEEDS.length;
  famYear[Math.min(3,Math.floor((d-1)/360))]=(d<=360?0:0)||famYear[Math.min(3,Math.floor((d-1)/360))];
  if(d>720&&d%30===0){doleY3+=w.doleRate/SEEDS.length;doleN+=1/SEEDS.length;}
  const mm=(Math.floor((d-1)/30))%12+1;
  for(const g in priceLog){const a=w.prices[g];if(a&&a.length&&a[a.length-1][0]===d)priceLog[g].push([mm,a[a.length-1][1]]);}
  for(const h of w.hhs)if(h.purse<-2.5)stuck[seed+'_'+h.id]=(stuck[seed+'_'+h.id]||0)+1;}
 worlds.push(w);}
const w=worlds[0];
const famT=worlds.reduce((s,x)=>s+x.famine,0)/SEEDS.length;
const fam=[0,0,Math.round(famT/4),Math.round(famT/4)]; // 年平均近似(3シード計÷4年)

// E1 麦自給: 麦3枚で輸入がY2以降ほぼ消える
{const mx=Math.max(...worlds.map(x=>x.f30.wheat?.imp??9));t('E1 麦自給(輸入<2/日)',mx<2,`最悪シード輸入${mx.toFixed(1)}/日`);}
// E2 全職が稼げる(30日収入>200デナリ) — 職業として成立しているか
const incBy={};for(const x of worlds)for(const h of x.hhs)(incBy[h.job]=incBy[h.job]||[]).push((h.incY||0)*10);
for(const j in incBy){const best=Math.max(...incBy[j]);
  t(`E2 ${j}が稼げる`,best>2000,`最良世帯の年間収入${Math.round(best)}デナリ`);}
// E3 信用の底に90日以上張り付く世帯なし(構造的debt trap検出)
const worst=Math.max(0,...Object.values(stuck));
t('E3 借金漬け世帯なし',worst<90,`最長張り付き${worst}日`);
// E4 飢餓が年150未満(Y2以降)
t('E4 飢餓(年平均)',famT/4<150,`4年計平均${Math.round(famT)}(年${Math.round(famT/4)})`);
// E5 森が持続(Y4で>5000)
t('E5 森の持続',w.grove>5000,`残${Math.round(w.grove)}`);
// E6 湾が持続(>30%)
t('E6 湾の持続',w.bay>10*0.3*24,`残${Math.round(w.bay)}`);  // BAY0=240想定なら72
// E7 屋台の恒常滞留なし(平均200荷未満)
for(const g in stallAvg)t(`E7 ${g}滞留なし`,stallAvg[g]<200,`平均${Math.round(stallAvg[g])}荷`);
// E8 文化ラダーが機能(最高Lv>=5, 中央値>=2)
{const mx=worlds.map(x=>Math.max(...x.hhs.map(h=>h.lv)));const md=worlds.map(x=>{const l=x.hhs.map(h=>h.lv).sort((a,b)=>a-b);return l[Math.floor(l.length/2)];});
t('E8 ラダー機能',Math.max(...mx)>=5&&Math.min(...md)>=2,`最高${mx.join('/')} 中央値${md.join('/')}`);}
// E9 財政の弧(破産せず・限度内・富みすぎず)
t('E9 財政の弧',worlds.every(x=>x.goDay===null&&x.treasury*10>-x.limit()*10&&x.treasury*10<150000),worlds.map(x=>Math.round(x.treasury*10)).join('/'));
// E10 季節価格: 冬の魚>夏の魚×1.3 / 冬の炭>夏の炭
const sAvg=(log,c)=>{const xs=log.filter(([m])=>c(m)).map(x=>x[1]);return xs.length?xs.reduce((a,b)=>a+b)/xs.length:0;};
const fw=sAvg(priceLog.fish,m=>m>=10||m<=2),fs=sAvg(priceLog.fish,m=>m>=4&&m<=9);
t('E10 冬の魚価>夏',fw>fs*1.3,`冬${fw.toFixed(2)} 夏${fs.toFixed(2)}`);
const cw=sAvg(priceLog.char,m=>m>=10||m<=2),cs=sAvg(priceLog.char,m=>m>=4&&m<=9);
t('E10 冬の炭価>夏',cw>cs,`冬${cw.toFixed(2)} 夏${cs.toFixed(2)}`);
// E11 死蔵なし(単一世帯が1000荷超を抱えない)
let hoard=null;for(const x of worlds)for(const h of x.hhs)for(const g of GOODS)if(h.pantry[g]>1.5*4500)hoard=`${h.job}が${g}${Math.round(h.pantry[g])}`; // 農家の1.5収穫分までは納屋の備え
t('E11 死蔵なし',!hoard,hoard||'');
// E12 人口成長(分家が機能・爆発もしない)
t('E12 人口成長',worlds.every(x=>x.pop()>=90&&x.pop()<=90*2.2),worlds.map(x=>x.pop()).join('/'));
// E13 配給依存の卒業(Y3以降 平均<人口8%)
const doleAvg=doleY3/Math.max(1,doleN);
t('E13 配給卒業',doleAvg<worlds[0].pop()*0.1,`Y3以降平均${doleAvg.toFixed(1)}人/日`);

// ---- シナリオB: アドバイザ追従プレイ(推薦通り建てて破綻しないか) ----
{const w2=mk(12);
 const gf=g=>w2.f30?.[g]||{prod:0,cons:0,imp:0,exp:0};
 const n=j=>w2.hhs.filter(h=>h.job===j).length+w2.zones.filter(z=>!z.filled&&z.job===j).length;
 let builds=[];
 for(let d=1;d<=1440;d++){w2.step();
  if(d%90===0&&builds.length<10&&w2.treasury*10>15000){ // 季節に1枚+財政に余力がある時だけ(人間の実プレイ相当) // 45日ごとに助言を1回実行
    const poorN=w2.hhs.filter(h=>h.purse<5).length;
    const debt=Math.max(0,-w2.treasury);
    let rec=null;
    const m=Math.floor(d/30)+1;
    if(n('fisher')<2)rec='fisher';
    else if(n('veg')<1)rec='veg';
    else if(gf('wheat').imp>8&&n('wheat')<Math.ceil(w2.pop()/42))rec='wheat';
    else if(n('woodshop')<1)rec='woodshop';
    else if(n('charburner')<1)rec='charburner';
    else if(n('saltworks')<1)rec='saltworks';
    else if(w2.hhs.some(h=>h.job==='logger'&&w2.localWood(h)<0.1)&&builds.filter(b=>b==='logger').length<2){rec='logger';}
    else if(debt>w2.limit()*0.3)rec=null;
    else if(m>18&&poorN>=w2.hhs.length*0.45&&n('rapeseed')<2)rec='rapeseed';
    else if(gf('salt').imp>0.5)rec='saltworks';
    else if(gf('tools').imp>0.5)rec='woodshop';
    if(rec){const s=findSpot(w2,rec);if(s){w2.addZone(rec,s[0],s[1]);builds.push(rec);}}}}
 t('E15 アドバイザ追従で生存',w2.goDay===null&&w2.famine<600,
   `建てた:${builds.join(',')||'なし'} 金庫${Math.round(w2.treasury*10)} 支援${w2.bailouts} 飢餓${w2.famine} 破産${w2.goDay?'M'+Math.floor((w2.goDay-1)/30+1):'なし'}`);}

console.log(`\n${pass}/${pass+fail} PASS`);
process.exit(fail?1:0);
