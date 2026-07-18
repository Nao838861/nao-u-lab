// 流通の島 v0 エンジン (spatial/engine.py の較正値を移植・ブラウザ/Node両用)
export const GOODS = ['fish','veg','wheat','pres','pick','tools','salt','char','meat','meal','stone','oil','iron','cloth','log'];
export const PERISH = ['fish','veg','meat','pres','pick','wheat','meal'];
// pick=漬物(野菜の保存・野菜枠の多様性が冬も立つ)
export const FOODS = ['fish','veg','wheat','pres','pick','meat'];
const KIND = {fish:'fish',veg:'veg',wheat:'wheat',pres:'fish',pick:'veg',meat:'meat'};
export const P = {
  EAT:9, PANTRY_FOOD_D:6, CULT_D:60, RATION:0.15,
  Y_FISH:20, Y_FISH_W:5, FISH_LIFE:3, VEG_LIFE:30, PICK_SALT:0.1, PR_PICK:0.85, Y_VEG:16, Y_WHEAT:6000, /* 配給なき島の再較正: 麦=冬を越す貯蔵食の柱。摩擦(腐敗・分配)込みで自給が立つ余裕 */ Y_LOG:16, LOG_TOOL:1.5, LOG_CHAR:1.0, Y_TOOLS:8, Y_CHAR:8, Y_SALT:12, Y_MEAT:16, Y_CLOTH:0.35, D_CLOTH:0.03, D_IRON:0.03,
  SALT_CHAR:1, PR_SALT:0.6, PR_SMOKE:0.95, SMOKE_CHAR:0.1, PRES_SALT:0.125,
  CMULT:1.35, D_TOOL:0.2, D_SALT:0.06, D_CHAR:0.4, LV_MULT:1.585, UP_DAYS:45, DOWN_DAYS:60,
  TRAVEL_RATE:0.012, ROAD_F:0.55, TRAVEL_MAX:0.45, HAUL:40,
  IMP:{wheat:4.0,tools:6.0,salt:5.0,iron:4.5}, IMP_COST:{wheat:2.4,tools:4.2,salt:3.5,iron:3.2},  // 懲罰価格=持続不可能な緊急措置  // 麦2.6=輸入パリティが島の麦を殺す幼稚産業問題の修正
  EXP:{pres:0.6,pick:0.55,oil:2.4}, /* 特産のみ。他財の輸出台は対症療法だったので撤去 */ EXP_CAP:{pres:25,pick:15,oil:12}, EXP_ML:{pres:0.66,pick:0.6,oil:2.64},
  FREE_M:42, IRATE:0.012, LIMIT0:20000, LIMIT_G:1500, LIMIT_FREEZE:24, LIMIT_PC:250,
  TREASURY0:5500, PURSE0:60, PASSAGE:60, BUILD_COST:250, FEE:0.04,
  SHIP_COST:8000, SHIP_CAP:2, SHIP_PRICE:1.2,
  BAY0:600000, BAY_R:0.00175, RESEED:0.3, GROVE0:60000, GROVE_R:0.0006,
  MEAL_FISH:8, FERT_NEED:3, FERT_BOOST:0.15, Y_STONE:8, Y_OIL:6,
  WOOD0:350, WOOD_R:0.7, ROAD_WORK:3, PAVE_STONE:200, PAVE_ROAD_F:0.45, DISTRESS:40, COOLDOWN:360,
  BELIEF0:{fish:1,veg:1,wheat:1.2,pres:1.2,pick:1.3,tools:2,salt:2,char:1.5,meat:1.3,meal:1,stone:1,oil:3,iron:3.5,cloth:2.5},
};
export const LADDER={farm:['food1','tools','saltchar','food2','iron','food3'],
  fish:['grain','tools','salt','char','food2','iron'],
  lumber:['food1','tools','food2','salt','char','iron'],
  artisan:['food1','food2','salt','char','cloth','iron']};
export const JOBCLS={fisher:'fish',fisher2:'fish',wheat:'farm',veg:'farm',shepherd:'farm',rapeseed:'farm',logger:'lumber',woodshop:'lumber',charburner:'lumber',quarryman:'lumber',saltworks:'artisan'};
// Claude側で較正されたv0.24を、v002の表示・物語層から利用する。
export const VERSION='v002-core-v0.24';
export const JOBS=Object.keys(JOBCLS);
export function stdTerrain(MW=48,MH=40){const terr=[];
  for(let y=0;y<MH;y++){terr.push([]);for(let x=0;x<MW;x++){
    let t='grass';
    if(y>MH-4||(y>MH-7&&x>18&&x<32))t='water';else if(y>MH-8&&y<=MH-4)t='sand';
    if(x<16&&y<16&&((x*7+y*13)%5<3))t='forest';          // 大森林(遠い=取りきれない)
    if(x>=10&&x<=18&&y>=15&&y<=25&&((x*7+y*13)%5<3))t='forest'; // 森の腕(中距離=道を引けば届く第二フロンティア)
    if(x>=28&&x<=33&&y>=23&&y<=27&&((x*5+y*11)%4<3))t='forest'; // 町外れの雑木林(近い・小さい=序盤用、やがて禿げる)
    if(x>38&&y<10)t='rock';
    terr[y].push(t);}}
  return terr;}
function mulberry(seed){let s=seed>>>0;return()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
let HID=0;
const FIRST=['ハンス','グレタ','ヤン','マリア','ピム','ロッテ','カレル','アンナ','ブラム','エルス','テオ','ヨハンナ','ミーナ','クラース','フェム','ダーン','ソフィー','ヘンク','リーケ','ヨープ'];
const SUR=['ヤンセン','デ・フリース','バッカー','フィッセル','スミット','デッケル','ブラウワー','ファン・ダイク','メイヤー','ボス','ペーテルス','ハウトマン'];
function genFamily(id){const r=mulberry(id*7919+13);
  const n=7+Math.floor(r()*5);   // 7-11人
  const sur=SUR[Math.floor(r()*SUR.length)];
  const mem=[];for(let i=0;i<n;i++){const sex=r()<0.5?'♂':'♀';
    const age=i<2?25+Math.floor(r()*20):3+Math.floor(r()*18);
    mem.push({name:FIRST[Math.floor(r()*FIRST.length)],sex,age});}
  return{sur,mem};}
export class HH{
  constructor(job,x,y){this.id=HID++;
    const f=genFamily(this.id);this.sur=f.sur;this.members=f.mem;this.job=job;this.x=x;this.y=y;this.road=false;
    this.purse=P.PURSE0;this.pantry={};for(const g of GOODS)this.pantry[g]=0;
    this.belief={...P.BELIEF0};this.lv=0;this.up=0;this.down=0;this.kindDays={};this.kindLog=[];
    this.hunger=0;this.wheatWork=0;this.jobCycleDone=job!=='wheat';this.unsold=new Set();this.income30=0;this.incomeLog=[];this.purseLog=[];this.incM=0;this.incMonths=[];this.walk=0;
    this.px=x;this.py=y;this.state='home';this.cargo=null;this.buildDays=0;
    // 開拓キット(移民は道具と生業の入力を持参する): 創業デッドロック防止
    this.pantry.tools=5;this.pantry.wheat=240;  // 兵糧(ひと季節分を持参。飢えを輸入価格で治療するより船で運ぶ方が安い——配給なき島の初期補給)
    if(job==='saltworks')this.pantry.char=15;
    if(job==='woodshop'||job==='charburner')this.pantry.log=20; // 開業在庫(丸太)——価格形成が回り出すまでの種
    if(job==='fisher'){this.pantry.salt=4;this.pantry.char=2;}
    if(job==='veg')this.pantry.salt=3;
    if(job==='fisher2')this.pantry.salt=2;}
  mult(){const raw=Math.pow(P.LV_MULT,this.lv);
    const primary={fisher:1,fisher2:1,veg:1,wheat:1,shepherd:1,rapeseed:1}[this.job];
    return primary?Math.min(raw,2.0):raw;} // 一次産業は複利で伸びない(畑と舟の物理)。食料をラダーの人質にしない
  eat(){return this.members.length;}
  haul(){return this.members.length*4;}   // 1人1荷(荷=4食分)×家族
  cls(){return JOBCLS[this.job];}
}
export class World{
  constructor(seed=11){this.rng=mulberry(seed);HID=0;this.hhs=[];this.day=0;this.treasury=P.TREASURY0;
    this.bay=P.BAY0;this.bay2=P.BAY0;this.grove=P.GROVE0;this.paving=false;this.paved=false;this.outBy={pass:0};this.led={prod:{},eat:{},spoil:{},need:0};this.co={pub:0,expBuy:0,expSell:0,impMargin:0,bail:0};this.hungryN=0;
    this.bailouts=0;this.goDay=null;this.shipping=false;this.famine=0;this.order=null;this.orderDone=0;this.stock={};this.stockTgt={};
    this.mainlandIn=0;this.mainlandOut=0;this.imported={};this.exported={};this.events=[];this.prices={};
    this.px={...P.BELIEF0};this.sites=[];this.market={x:0,y:0};this.roadTiles=new Set();this.money0=P.TREASURY0;this.paveBought=0;
    this.zones=[];this.port=null;this.t=0;this.flow=null;this.terrCost=null;this.MW=48;this.MH=40;
    this.stalls={};for(const g of GOODS)this.stalls[g]=[];
    this.expCap={...P.EXP_CAP};this.expMl={...P.EXP_ML}; // 海運投資はこの世界だけを変える(P直変異は別ワールドを汚染するバグだった)
    this.deskUsed={};}
  setTerrain(terr){this.terr=terr;this.wood={};
    for(let y=0;y<terr.length;y++)for(let x=0;x<terr[y].length;x++)
      if(terr[y][x]==='forest')this.wood[x+','+y]=P.WOOD0;}
  near(x,y,type,r=2){if(!this.terr)return true; // 地形なし(旧テスト)は制約なし
    for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){
      const t=this.terr[Math.round(y)+dy]?.[Math.round(x)+dx];
      if(t===type)return true;}return false;}
  canPlace(job,x,y){if(!this.terr)return[true,''];
    const rx=Math.round(x),ry=Math.round(y);
    const t=this.terr[ry]?.[rx];
    if(!t||t==='water')return[false,'水の上には建てられません'];
    if(this.zones.some(z=>Math.round(z.x)===rx&&Math.round(z.y)===ry)||this.hhs.some(h=>Math.round(h.x)===rx&&Math.round(h.y)===ry))return[false,'この土地には既に建物があります'];
    if(this.roadTiles.has(rx+','+ry)||this.sites.some(s=>s.x===rx&&s.y===ry))return[false,'道の上には建てられません'];
    if(Math.round(this.market.x)===rx&&Math.round(this.market.y)===ry)return[false,'ここは市場です'];
    if(t==='forest')return[false,'森を切り開く仕組みはまだありません——森の際に'];
    if(t==='rock')return[false,'岩場の上には建てられません——際に'];
    if((job==='fisher'||job==='fisher2')&&!this.near(x,y,'water',2))return[false,'漁師は水際にしか住めません'];
    if(job==='logger'&&!this.near(x,y,'forest',2))return[false,'木こりは森の際でないと立ち行きません'];
    if(job==='quarryman'&&!this.near(x,y,'rock',2))return[false,'採石は岩場の際でないと立ち行きません'];
    return[true,''];}
  chopWood(h,amount){ // 択伐: 種木(15%)を残して伐る。足りない時だけ皆伐→禿山(乱獲の可視化・正典⑦)
    if(!this.terr)return amount; // 旧テスト互換: 地形なしなら無制限
    let got=0;const cx=Math.round(h.x),cy=Math.round(h.y);const seed=P.WOOD0*0.15;
    for(let pass=0;pass<2&&got<amount;pass++)
    for(let r=0;r<=5&&got<amount;r++)for(let dy=-r;dy<=r&&got<amount;dy++)for(let dx=-r;dx<=r&&got<amount;dx++){
      const k=(cx+dx)+','+(cy+dy);const s=this.wood[k];
      const floor=pass===0?seed:0;
      if(s>floor){const u=Math.min(s-floor,amount-got);this.wood[k]-=u;got+=u;
        if(this.wood[k]<=0.5){this.wood[k]=0;this.terr[cy+dy][cx+dx]='bald';this.log('森が禿げた——伐り尽くされた丘');}}}
    return got;}
  localWood(h){if(!this.terr)return 1;let s=0;const cx=Math.round(h.x),cy=Math.round(h.y);
    for(let dy=-5;dy<=5;dy++)for(let dx=-5;dx<=5;dx++)s+=this.wood[(cx+dx)+','+(cy+dy)]||0;
    return Math.min(1,s/(P.WOOD0*8));}
  tileCost(x,y){if(x<0||y<0||x>=this.MW||y>=this.MH)return Infinity;
    if(this.terr&&this.terr[y][x]==='water')return Infinity;
    if(this.roadTiles.has(x+','+y))return this.paved?0.45:0.6;
    if((this.traffic||{})[x+','+y]>400)return 0.85;   // 獣道(踏み分け道): 通行が地面を固める
    if(this.terr&&this.terr[y][x]==='forest')return 1.4;return 1;}
  buildFlow(){const W=this.MW,H=this.MH;const dist=new Float32Array(W*H).fill(1e9);
    const mx=Math.round(this.market.x),my=Math.round(this.market.y);
    dist[my*W+mx]=0;const q=[[mx,my]];
    while(q.length){q.sort((a,b)=>dist[a[1]*W+a[0]]-dist[b[1]*W+b[0]]);const[x,y]=q.shift();
      const d0=dist[y*W+x];
      for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1]]){
        const nx=x+dx,ny=y+dy;const c=this.tileCost(nx,ny);if(c===Infinity)continue;
        const nd=d0+c*(dx&&dy?1.4:1);
        if(nd<dist[ny*W+nx]-1e-6){dist[ny*W+nx]=nd;q.push([nx,ny]);}}}
    this.flow=dist;}
  tread(x,y){const k=Math.round(x)+','+Math.round(y);
    this.traffic=this.traffic||{};this.traffic[k]=Math.min(2000,(this.traffic[k]||0)+1);}
  stepToMarket(h){if(!this.flow)this.buildFlow();const W=this.MW;
    // 移動速度=1/tileCost(経路探索と同じ地形尺度)。これが崩れると「探索が選ぶのに実際は速くない道」へ全員が迂回する
    // 草・森は旧来の0.9掛けそのまま(既存較正を保つ)。道の速度剰余(f>1)だけ多段ホップで実際に消化する
    let f=Math.min(2.2,0.9/Math.max(0.45,this.tileCost(Math.round(h.px),Math.round(h.py))));
    for(let hop=0;hop<4&&f>1e-6;hop++){
      const x=Math.round(h.px),y=Math.round(h.py);
      let bx=x,by=y,bd=this.flow[y*W+x];
      for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1]]){
        const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=W||ny>=this.MH)continue;
        const d=this.flow[ny*W+nx];if(d<bd){bd=d;bx=nx;by=ny;}}
      if(bx===x&&by===y)break;
      const step=Math.min(1,f);
      h.px+=(bx-h.px)*step;h.py+=(by-h.py)*step;f-=step;}
    this.tread(h.px,h.py);
    return Math.hypot(h.px-this.market.x,h.py-this.market.y)<1.2;}
  stepTo(h,tx,ty){const d=Math.hypot(tx-h.px,ty-h.py);if(d<0.8)return true;
    // 道の上なら帰路・普請行きも速い。地形では遅くしない(港=水際の入植者が速度0で立ち往生し餓死する)
    const f=this.roadTiles.has(Math.round(h.px)+','+Math.round(h.py))?(this.paved?1.55:1.35):1;
    const mv=Math.min(d,0.8*f);
    h.px+=(tx-h.px)/d*mv;h.py+=(ty-h.py)/d*mv;this.tread(h.px,h.py);return false;}
  pop(){return this.hhs.reduce((s,h)=>s+h.members.length,0);}
  planRoad(x,y){const k=x+','+y;
    if(this.roadTiles.has(k)||this.sites.some(s=>s.x===x&&s.y===y))return false;
    if(this.terr&&(this.terr[y]?.[x])==='water')return false;
    if(this.zones.some(z=>Math.round(z.x)===x&&Math.round(z.y)===y)||this.hhs.some(h=>Math.round(h.x)===x&&Math.round(h.y)===y))return false; // 建物の上に道は引けない
    this.sites.push({x,y,left:P.ROAD_WORK});this.log('道普請を計画');return true;}
  addZone(job,x,y){const[ok,why]=this.canPlace(job,x,y);
    if(!ok){this.log(`区画不可(${job}): ${why}`);return false;}
    if(this.treasury-P.BUILD_COST<-this.limit()){this.log(`会社資金不足——支度金 ${P.BUILD_COST*10} を用意できない`);return false;}
    this.treasury-=P.BUILD_COST;this.mainlandOut+=P.BUILD_COST;this.co.build=(this.co.build||0)+P.BUILD_COST; // 建築リズムの支出側(資材は本土調達。将来=地元の材木+普請賃金へ)
    this.zones.push({job,x,y,filled:false});this.log(`区画指定: ${job}（支度金 -${P.BUILD_COST*10}）`);return true;}
  log(msg){this.events.push([this.day,msg]);if(this.events.length>400)this.events.shift();}
  addHH(job,x,y){const h=new HH(job,x,y);this.hhs.push(h);this.mainlandIn+=h.purse;
    this.treasury-=P.PASSAGE;this.mainlandOut+=P.PASSAGE;this.log(`入植: ${job}`);this.updRoads();return h;}
  investPaving(){if(this.paving||this.paved)return false;this.paving=true;
    this.log('★石畳プロジェクト開始(石200を公費で買い上げ)');return true;}
  investShipping(){if(this.shipping||this.treasury<-this.limit())return false;
    this.treasury-=P.SHIP_COST;this.mainlandOut+=P.SHIP_COST;this.shipping=true;
    for(const g in this.expCap)this.expCap[g]*=P.SHIP_CAP;for(const g in this.expMl)this.expMl[g]*=P.SHIP_PRICE;
    this.log('★沿岸海運に投資(輸出天井×2・本土価+20%)');return true;}
  updRoads(){this.flow=null;for(const h of this.hhs){h.road=false;
    for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++)
      if(this.roadTiles.has(`${Math.round(h.x)+dx},${Math.round(h.y)+dy}`)){h.road=true;break;}}}
  staple(){return Math.max(1.0,Math.min(this.px.wheat??2,this.px.veg??9,this.px.pres??9,P.IMP.wheat));} // 床1.0=名目の錨。信用枠-30/文化購買門15等の名目定数はこの物価水準を前提とする(撤去実験は全名目閾値を壊した)
  cost(h,g){const mm=(Math.floor((Math.max(1,this.day)-1)/30))%12+1;const winter=mm>=10||mm<=2;
    const YD={fish:winter?P.Y_FISH_W:P.Y_FISH,veg:(mm>=3&&mm<=10)?P.Y_VEG:0.01,wheat:P.Y_WHEAT/360,
      meat:P.Y_MEAT,cloth:P.Y_CLOTH,tools:P.Y_TOOLS,char:P.Y_CHAR,salt:P.Y_SALT,stone:P.Y_STONE,
      oil:(mm>=3&&mm<=8)?P.Y_OIL:0.01,meal:P.Y_FISH/P.MEAL_FISH,log:P.Y_LOG,
      pres:winter?P.Y_FISH_W*P.PR_SALT:P.Y_FISH*P.PR_SALT,pick:P.Y_VEG*P.PR_PICK}[g]??1;
    const scar={log:this.localWood(h),fish:this.bay/P.BAY0,pres:this.bay/P.BAY0}[g]??1; // 資源の希少性は伐る本人(木こり)の丸太原価に乗る
    const labor=h.eat()*this.staple()/(YD*h.mult()*Math.max(0.5,scar)); // 地代の転嫁は2倍まで。それ以上の枯渇は価格でなく休業で現れる(天井超えの在庫凍結を防ぐ)
    const inp={salt:(P.SALT_CHAR/P.Y_SALT)*(this.px.char??2),
      tools:P.LOG_TOOL*(this.px.log??1),char:P.LOG_CHAR*(this.px.log??1),
      pres:P.PRES_SALT*(this.px.salt??2)/P.PR_SALT,pick:P.PICK_SALT*(this.px.salt??2)/P.PR_PICK}[g]??0;
    return labor+inp;}
  dist(h){return Math.hypot(h.x-this.market.x,h.y-this.market.y);}
  pickJob(exclude,h){ // 職選び=直近12ヶ月の観測年収に比例した抽選。30日窓は麦を0に見せ・argmaxは殺到(コブウェブ)
    // 候補は全職業: 「現在いる職」だけだと絶滅職が吸収状態になり、麦が一度消えると二度と再参入できず村が壊死する
    const inc={};for(const x of this.hhs)(inc[x.job]=inc[x.job]||[]).push(x.incMonths.reduce((a,b)=>a+b,0)+x.incM);
    const avgs=Object.values(inc).map(v=>v.reduce((a,b)=>a+b,0)/v.length).filter(v=>v>0).sort((a,b)=>a-b);
    const med=avgs.length?avgs[Math.floor(avgs.length/2)]:1; // 絶滅職の期待所得=島の中央値(再参入の窓)
    const NEED={fisher:'water',fisher2:'water',logger:'forest',quarryman:'rock'};
    const cand=[];
    for(const j of JOBS){if(j===exclude)continue;
      if(h&&NEED[j]&&!this.near(h.x,h.y,NEED[j],2))continue; // 転職は自宅の地形に縛る(内陸の漁師を作らない)
      if(!h&&NEED[j]&&!this.hhs.some(x=>x.job===j))continue;  // 分家は絶滅した地形職に入らない(湧き先が無い)
      const v=inc[j];const w=v&&v.length?Math.max(0,v.reduce((a,b)=>a+b,0)/v.length):med;
      if(w>0)cand.push([j,w]);}
    if(!cand.length)return null;
    const s=cand.reduce((a,[,w])=>a+w*w,0);let r=this.rng()*s;
    for(const[j,w]of cand){r-=w*w;if(r<=0)return j;}
    return cand[cand.length-1][0];}
  travel(h){return Math.min(P.TRAVEL_MAX,this.dist(h)*2*P.TRAVEL_RATE*(h.road?P.ROAD_F:1));}
  limit(){const m=Math.floor((this.day-1)/30)+1;
    return Math.min(P.LIMIT0+P.LIMIT_G*Math.min(m,P.LIMIT_FREEZE),Math.max(6000,this.hhs.length*9*P.LIMIT_PC));}
  buyTargets(h){const t={};
    const foodDays=FOODS.reduce((s,g)=>s+h.pantry[g],0)/P.EAT;
    const px=this.px;const cheapest=Math.min(px.veg??9,px.wheat??9,px.pres??9);
    const mmT=(Math.floor((this.day-1)/30))%12+1;
    const autumn=mmT>=7&&mmT<=9;   // 秋=冬支度(正典ルール3「備えを保つ」の季節スケール)。配給は無い——備えは自分で持つ
    let tgtD=autumn?10:P.PANTRY_FOOD_D;
    tgtD=Math.max(tgtD,Math.min(12,this.dist(h)*0.9)); // 遠い家ほど大きな貯蔵(まとめ買いで通いを減らす)
    if(foodDays<tgtD){const starving=foodDays<1.5;
      for(const g of['veg','wheat','pres','pick'])
        t[g]=[(tgtD-foodDays)*P.EAT/4,starving?99:Math.min((px[g]??9)*1.5,cheapest*2.2)];}
    if(h.job!=='fisher')t.fish=[P.EAT*0.5,Math.min((px.fish??9)*1.5,cheapest*2.5)]; // 飢えても魚に99は払わない(主食が隣の棚にある)
    if(h.job!=='wheat'&&h.pantry.wheat<P.EAT*P.RATION*10&&!t.wheat)
      t.wheat=[P.EAT*P.RATION*15-h.pantry.wheat,(px.wheat??3)*1.3];
    if(h.job!=='veg'&&h.pantry.veg<P.EAT*P.RATION*6&&!t.veg)
      t.veg=[P.EAT*P.RATION*10-h.pantry.veg,(px.veg??3)*1.3];
    if(h.job!=='shepherd'&&h.pantry.meat<P.EAT*P.RATION*4&&!t.meat)
      t.meat=[P.EAT*P.RATION*8-h.pantry.meat,Math.min((px.meat??3)*1.4,cheapest*2.2)];
    if((h.job==='wheat'||h.job==='rapeseed')&&h.pantry.meal<P.FERT_NEED*10){
      const mmn=(Math.floor((this.day-1)/30))%12+1;
      if(mmn>=3&&mmn<=8){const bv=(h.job==='wheat'?P.Y_WHEAT*h.mult():P.Y_OIL*h.mult()*540)*P.FERT_BOOST*(h.job==='wheat'?(px.wheat??2):(px.oil??3))/(P.FERT_NEED*180);
        t.meal=[P.FERT_NEED*20-h.pantry.meal,bv*0.7];}}
    if(h.job==='saltworks'&&h.pantry.char<P.SALT_CHAR*5)
      t.char=[P.SALT_CHAR*10-h.pantry.char,P.Y_SALT*(px.salt??2)*0.5];
    if(h.job==='woodshop'&&h.pantry.log<P.LOG_TOOL*8)
      t.log=[P.LOG_TOOL*16-h.pantry.log,Math.max(0.9,(px.tools??2)/P.LOG_TOOL*0.6)];
    if(h.job==='charburner'&&h.pantry.log<P.LOG_CHAR*8)
      t.log=[P.LOG_CHAR*16-h.pantry.log,Math.max(0.9,(px.char??2)/P.LOG_CHAR*0.6)];
    if(h.job==='veg'&&h.pantry.salt<1.5)
      t.salt=[4-h.pantry.salt,(px.pick??2)*P.PR_PICK/P.PICK_SALT*0.4];  // 漬物の導出需要
    if(h.job==='fisher'){if(h.pantry.salt<3)t.salt=[6-h.pantry.salt,(px.pres??2)*P.PR_SALT/P.PRES_SALT*0.5];
      if(h.pantry.char<2)t.char=[4-h.pantry.char,(P.PR_SMOKE-P.PR_SALT)*(px.pres??2)/P.SMOKE_CHAR*0.5];}
    // 文化財は溜め込まない(60日分)。長期分を輸入で買うと開幕の手持ちが即座に会社へ吸われ、
    // 市中から通貨が消える(財布ゼロ問題の主因)
    const cd=P.CULT_D;
    // 文化財の購買=ラダーの現在位置(次Lvまで)が要求する財だけ(階段の先食い禁止:
    // Lv0世帯が鉄@40を買う無駄が貧困の主因だった)
    const reqsNow=(LADDER[JOBCLS[h.job]]||[]).slice(0,h.lv+1);
    const needSet=new Set();
    for(const r of reqsNow){if(r==='saltchar'){needSet.add('salt');needSet.add('char');}
      else if(['tools','salt','char','cloth','iron'].includes(r))needSet.add(r);}
    needSet.add('char');   // 暖は全階層の基礎需要(冬)
    for(let[g,dd,val]of[['tools',P.D_TOOL,2.5],['salt',P.D_SALT,2.5],['char',P.D_CHAR,2.5],['cloth',P.D_CLOTH,2.8],['iron',P.D_IRON,5.0]]){ // 鉄5.0>輸入4.5(4.0では構造的に買えずLv5が達成不能だった)
      if(!needSet.has(g))continue;dd*=Math.pow(P.CMULT,h.lv); /* 消費のLv階段 */
      if(t[g])continue;
      let tgt=dd*cd;
      if(g==='char'&&autumn)tgt=dd*2.0*100; // 炭の冬支度: 秋に冬需要(×2)の100日分を積む——冬のLv鋸歯の根治
      if(h.pantry[g]<tgt*0.5)t[g]=[tgt-h.pantry[g],val];}
    return t;}
  sellOffers(h){const out={};
    const my={fisher:'fish',veg:'veg',wheat:'wheat',shepherd:'meat',logger:'log',woodshop:'tools',charburner:'char',saltworks:'salt',fisher2:'meal',quarryman:'stone',rapeseed:'oil'}[h.job];
    if(my==='meal'){if(h.pantry.meal>=15)return{meal:Math.min(h.pantry.meal,P.HAUL)};return{};}
    if(my==='fish'){let keep=h.eat()*1.2;
      const alt=Math.min(this.px.veg??9,this.px.wheat??9,this.px.pres??9);
      if((this.px.fish??2)>alt*1.5)keep=h.eat()*0.4;
      // 塩がある分は保存に回す(今夜の塩蔵用に魚を残す。保存は買付台で確実に売れる)
      keep+=Math.min(h.pantry.salt/P.PRES_SALT,12);
      const s=Math.max(0,h.pantry.fish-keep);if(s>1e-9)out.fish=Math.min(s,h.haul());}
    else{let keep=FOODS.includes(my)?h.eat()*2:2,rate=0.5;
      if(my==='wheat'){rate=0.1;keep=h.eat()*P.RATION*10;}
      if(my==='veg')keep=h.eat()*P.RATION*10;
      const s=Math.max(0,h.pantry[my]-keep);if(s>1e-9)out[my]=Math.min(s*rate+2,s,my==='log'?h.haul()/2:h.haul());} // 丸太は重い(運搬2枠)
    if(h.job==='fisher'&&h.pantry.pres>P.EAT*P.PANTRY_FOOD_D)
      out.pres=Math.min(h.pantry.pres-P.EAT*P.PANTRY_FOOD_D,h.haul());
    if(h.job==='veg'&&h.pantry.pick>10)out.pick=Math.min(h.pantry.pick-5,h.haul());
    if(h.job==='shepherd'&&h.pantry.cloth>2)out.cloth=Math.min(h.pantry.cloth-1,h.haul());
    return out;}
  step(){for(let i=0;i<30;i++)this.tickOnce();}
  tickOnce(){this.t++;
    const tod=this.t%30;             // time of day
    if(tod===1)this.dayStart();
    // 移動と労働
    for(const h of this.hhs){
      if(h.state==='arriving'){if(this.stepTo(h,h.x,h.y)){h.state='building';h.buildDays=10;this.log(`${h.job}#${h.id} 入居——普請開始`);}}
      else if(h.state==='building'){/* 日次で減算 */}
      else if(h.state==='toMarket'){if(this.stepToMarket(h)){h.state='atMarket';this.transact(h);h.state='toHome';}}
      else if(h.state==='toWork'){if(this.stepTo(h,h.wx,h.wy)){
        const wage=h.eat()*this.staple()*1.0 /* 日傭の賃金=家族の食い扶持。0.6では死を遅らせるだけで浮上できない */;
        if(h.emp){ // 民間: 雇い主の財布から賃金、雇い主は翌日の生産に人手ブースト
          const emp=h.emp;const pay=Math.min(wage,Math.max(0,emp.purse));
          emp.purse-=pay;h.purse+=pay;h.income30+=pay;emp.boost=1.4;emp.hand=null;h.emp=null;}
        else{const si=this.sites.findIndex(s=>s.x===h.wx&&s.y===h.wy);
          if(si>=0){const s=this.sites[si];s.left--;
            h.purse+=wage;h.income30+=wage;this.treasury-=wage;this.co.pub+=wage;
            if(s.left<=0){this.roadTiles.add(s.x+','+s.y);this.sites.splice(si,1);this.updRoads();this.log('道が一区画通じた');}}}
        h.state='toMarket';}} // 賃金を持って帰りに市場へ寄る(貧困層の消費が市場の土台)
      else if(h.state==='toHome'){if(this.stepTo(h,h.x,h.y))h.state='home';}
      else if(h.state==='home'){this.produceTick(h,1/30);}}
    if(tod===16)for(const h of this.hhs){if(h.state!=='home')continue;
      const fd=FOODS.reduce((s,g)=>s+h.pantry[g],0)/P.EAT;
      const offers=this.sellOffers(h);const sellSum=Object.values(offers).reduce((a,b)=>a+b,0);
      const lowCult=['tools','salt','char'].some(g=>h.pantry[g]<[P.D_TOOL,P.D_SALT,P.D_CHAR][['tools','salt','char'].indexOf(g)]*4);
      const inputLow=(h.job==='saltworks'&&h.pantry.char<2)||(h.job==='fisher'&&h.pantry.salt<1)||((h.job==='woodshop'||h.job==='charburner')&&h.pantry.log<2)||((h.job==='wheat'||h.job==='rapeseed')&&h.pantry.meal<1&&this.day%7===0);
      // 食料の自産者(漁/菜/牧)は日々の食いつなぎで出発しない(在庫が薄いのは仕様)。
      // 本当に空の時だけ買いに行く。これが無いと毎日通勤し実効生産<自家消費で永久赤字
      const fdThr=(h.job==='fisher'||h.job==='shepherd'||h.job==='veg')?1.2:3;
      // 買い物トリップは財布に金がある時だけ(貧乏通勤トラップ防止: 買えないのに毎日通い労働が消える)
      // 空腹トリップも一文なしなら行かない(買えずに手ぶらで帰る無駄通勤。飢えたら働きに出る)
      const needy=h.purse<h.eat()*0.8&&fd<4;
      if(needy&&this.sites.length){ // 公共普請があればそちらへ(賃金=公費)
        const s=this.sites.reduce((a,b)=>Math.hypot(a.x-h.x,a.y-h.y)<Math.hypot(b.x-h.x,b.y-h.y)?a:b);
        h.wx=s.x;h.wy=s.y;h.state='toWork';h.emp=null;continue;}
      if(needy){ // 民間の雇用: 豊かな世帯の手伝い(農繁期の日傭・奉公)。賃金は雇い主から=村内循環
        const wage=h.eat()*this.staple()*1.0;
        const emp=this.hhs.filter(x=>x!==h&&x.purse>wage*4&&!x.hand&&x.state!=='building')
          .sort((a,b)=>Math.hypot(a.x-h.x,a.y-h.y)-Math.hypot(b.x-h.x,b.y-h.y))[0];
        if(emp){emp.hand=h;h.emp=emp;h.wx=emp.x;h.wy=emp.y;h.state='toWork';continue;}}
      const tripCost=Math.min(Math.max(10,this.dist(h)*2.2),h.haul()*0.8); // 遠い家ほどまとめて商う(週1の大荷)。運搬上限の8割でキャップ
      if(offers.fish>0||sellSum>=tripCost||(fd<fdThr&&h.purse>2)||(lowCult&&h.purse>15)||(inputLow&&h.purse>-20))h.state='toMarket';}

    if(tod===29)this.dayEnd();}
  fl(g,k,v){const f=this.fday[g]=this.fday[g]||{prod:0,cons:0,imp:0,exp:0};f[k]+=v;}
  dayStart(){this.day++;this.deskUsed={};this.fday={};
    if(this.terr)this.grove=Object.values(this.wood).reduce((a,b)=>a+b,0);
    for(const g of GOODS){const st=this.stalls[g];
      const perishable=PERISH.includes(g);
      for(let i=st.length-1;i>=0;i--){const s=st[i];
        s.age=(s.age||0)+1;   // 価格は毎回の出店で抽選し直す(記憶なし)。店先での値下げ学習はしない
        // 3日売れ残ったら輸出台へ流す(端数は黙って本土行き=定常収入。信念ペナルティは生鮮のみ)
        if(s.age>=3&&s.hh instanceof HH&&P.EXP[g]!==undefined){
          const price=P.EXP[g],cap=this.expCap[g];
          const used=this.deskUsed['EXP'+g]||0;const can=Math.min(s.qty,Math.max(0,cap-used));
          if(can>1e-9){
            this.deskUsed['EXP'+g]=used+can;
            s.qty-=can;s.hh.purse+=can*price;s.hh.income30+=can*price;this.treasury-=can*price;
            this.co.expBuy+=can*price;
            this.exported[g]=(this.exported[g]||0)+can;this.fl(g,'exp',can);
            const rev=can*this.expMl[g];this.treasury+=rev;this.mainlandIn+=rev;this.co.expSell+=rev;}}
        if(s.age>=6&&s.hh instanceof HH&&g!=='fish'&&g!=='veg'){s.hh.pantry[g]+=s.qty;s.qty=0;} // 6日で店を畳む(次の出店で新たに抽選)
        if(g==='fish'){const rot=s.qty/P.FISH_LIFE;s.qty-=rot;this.led.spoil.fish=(this.led.spoil.fish||0)+rot;}
        if(g==='veg'){const rot=s.qty/P.VEG_LIFE;s.qty-=rot;this.led.spoil.veg=(this.led.spoil.veg||0)+rot;}
        if(s.qty<0.5||s.price<0.05){          // 空/捨て値→撤収(残りは持ち主の帳尻へ)
          if(s.hh instanceof HH)s.hh.pantry[g]+=Math.max(0,s.qty);
          st.splice(i,1);}}}const d=this.day,m=Math.floor((d-1)/30)+1,mm=(m-1)%12+1;
    // 本国注文(オルドル): 島の産物を会社が買い上げ本国へ納める——外貨の入口・金庫→村の還流(C3のシーザーの要求)
    if(!this.order&&d>60&&d%15===0&&this.rng()<0.5){
      const GN={tools:'道具',char:'炭',salt:'塩',pres:'保存食',pick:'漬物',oil:'油',cloth:'布',stone:'石'};
      const GP={tools:2.5,char:1.2,salt:1.5,pres:0.9,pick:0.8,oil:2.6,cloth:2.0,stone:1.2}; // 本国の相場(島の物価と独立。本国注文=常設の外貨の入口)
      const cand=Object.keys(GN).filter(g=>(this.f30?.[g]?.prod||0)>0.3);
      if(cand.length){const g=cand[Math.floor(this.rng()*cand.length)];
        const qty=Math.round(30+this.rng()*50);const price=GP[g];
        this.order={g,qty,left:qty,price,due:d+90};
        this.log(`★本国より注文状: ${GN[g]} ${qty}荷（単価 ${Math.round(price*10)}・90日以内）`);}}
    if(this.order&&d>=this.order.due){this.log(`注文の期限切れ——本国重役たちの心証を損ねた(残${Math.round(this.order.left)}荷)`);this.order=null;}
    // 注文の出荷: 商館在庫から自動で積む(本来は貯まったら確認ダイアログ。今は全自動)
    if(this.order){const og=this.order.g;const can=Math.min(this.stock[og]||0,this.order.left);
      if(can>1e-9){const avgC=(this.stockCost?.[og]||0)/Math.max(1e-9,this.stock[og]||0);
        this.stockCost=this.stockCost||{};this.stockCost[og]=Math.max(0,(this.stockCost[og]||0)-can*avgC);
        this.stock[og]-=can;this.order.left-=can;
        const rev=can*this.order.price*1.25;this.treasury+=rev;this.mainlandIn+=rev;this.co.ordSell=(this.co.ordSell||0)+rev;
        this.exported[og]=(this.exported[og]||0)+can;this.fl(og,'exp',can);
        if(this.order.left<=1e-9){this.log('★注文を納めた——本国での評判が上がった');this.orderDone++;this.order=null;}}}
    // 空き区画の充足(15日ごと・最大2世帯/便): 島内の余剰人口(8人以上の大家族の半分)が先。
    // 本土からの移民は「余剰が無く、かつ島が飢えていない」時だけ来る(空き家=絶対に移民が湧く蛇口、をやめる)
    if(d%15===0&&this.port){let n=0;
      for(const z of this.zones){if(z.filled||n>=2)continue;
        const donor=this.hhs.filter(x=>x.members.length>=8&&x.state==='home').sort((a,b)=>b.members.length-a.members.length)[0];
        if(donor){ // 島内の余剰人口: 家族が割れ、納屋と財布を頭数比で持参(物資は無から湧かない)
          const k=Math.floor(donor.members.length/2);const moved=donor.members.splice(donor.members.length-k,k);
          const f=k/(k+donor.members.length);
          const nh=new HH(z.job,z.x,z.y);nh.sur=donor.sur;nh.members=moved;
          for(const g of GOODS){nh.pantry[g]=donor.pantry[g]*f;donor.pantry[g]*=(1-f);}
          nh.purse=donor.purse*f;donor.purse*=(1-f);
          nh.px=donor.x;nh.py=donor.y;nh.state='arriving';
          this.hhs.push(nh);z.filled=true;n++;this.updRoads();
          this.log(`${donor.sur}家の${k}人が分かれて${z.job}の区画へ移り住む`);}
        else if(this.hungryN<Math.max(1,this.hhs.length*0.2)){ // 移民の代替(渡航費+キットは船で持参)
          const h=new HH(z.job,z.x,z.y);h.px=this.port.x;h.py=this.port.y;h.state='arriving';
          this.hhs.push(h);this.mainlandIn+=h.purse;this.treasury-=P.PASSAGE;this.mainlandOut+=P.PASSAGE;this.outBy.pass+=P.PASSAGE;
          z.filled=true;n++;this.updRoads();this.log('入植船が着いた——本土からの移民');}}}
    // 建設の進行
    for(const h of this.hhs)if(h.state==='building'){h.buildDays--;
      if(h.buildDays<=0){h.state='home';this.log(`${h.job}#${h.id} 家が建った`);}}
  }
  produceTick(h,f){
    if(h.boost){f*=h.boost;if(this.t%30===29)h.boost=null;}
    let stall=false;for(const g of GOODS){if(this.stalls[g].some(s=>s.hh===h)){stall=true;break;}}
    if(stall)f*=(h.members.length-1)/h.members.length;const d=this.day,m=Math.floor((d-1)/30)+1,mm=(m-1)%12+1;const winter=mm>=10;
    // 普遍則: 自分の売れ残り(倉+店)が10日分を超えたら手を止める(損して作らない・全生産財共通)
    const myG={saltworks:'salt',logger:'log',woodshop:'tools',charburner:'char',quarryman:'stone',rapeseed:'oil',fisher2:'meal',shepherd:'meat'}[h.job];
    if(myG){const daily={salt:P.Y_SALT,log:P.Y_LOG,tools:P.Y_TOOLS,char:P.Y_CHAR,stone:P.Y_STONE,oil:P.Y_OIL,meal:P.Y_FISH/P.MEAL_FISH,meat:P.Y_MEAT,veg:P.Y_VEG}[myG]*h.mult();
      const out=this.stalls[myG].reduce((a,s)=>a+(s.hh===h?s.qty:0),0);
      if(h.pantry[myG]+out>daily*10)return;}
    const w=f*h.mult();
    if(h.job==='fisher2'){const dep=this.bay2/P.BAY0;
      if(!winter){const q=P.Y_FISH*w*dep;
        this.bay2=Math.min(P.BAY0,this.bay2-q+f*(P.BAY_R*this.bay2*(1-dep)+P.RESEED*(1-dep)));
        h.pantry.meal+=q/P.MEAL_FISH;this.fl('meal','prod',q/P.MEAL_FISH);}}
    else if(h.job==='quarryman'){h.pantry.stone+=P.Y_STONE*w;this.fl('stone','prod',P.Y_STONE*w);}
    else if(h.job==='rapeseed'){if(mm>=3&&mm<=8){const u=Math.min(h.pantry.meal,P.FERT_NEED*f);h.pantry.meal-=u;h.fert=(h.fert||0)+u;this.fl('meal','cons',u);
        const fill=Math.min(1,(h.fert||0)/Math.max(1,P.FERT_NEED*(mm-2)*30));
        h.pantry.oil+=P.Y_OIL*w*(1+P.FERT_BOOST*fill);this.fl('oil','prod',P.Y_OIL*w*(1+P.FERT_BOOST*fill));}}
    else if(h.job==='fisher'){const dep=this.bay/P.BAY0;
      const q=(winter?P.Y_FISH_W:P.Y_FISH)*w*dep;
      this.bay=Math.min(P.BAY0,this.bay-q+f*(P.BAY_R*this.bay*(1-dep)+P.RESEED*(1-dep)));
      h.pantry.fish+=q;this.led.prod.fish=(this.led.prod.fish||0)+q;this.fl('fish','prod',q);}
    else if(h.job==='veg'&&mm>=3&&mm<=10){h.pantry.veg+=P.Y_VEG*w;this.led.prod.veg=(this.led.prod.veg||0)+P.Y_VEG*w;this.fl('veg','prod',P.Y_VEG*w);}
    else if(h.job==='shepherd'){h.pantry.meat+=P.Y_MEAT*w;this.led.prod.meat=(this.led.prod.meat||0)+P.Y_MEAT*w;h.pantry.cloth+=P.Y_CLOTH*w;this.fl('meat','prod',P.Y_MEAT*w);this.fl('cloth','prod',P.Y_CLOTH*w);}
    else if(h.job==='wheat'){if(h.pantry.wheat>P.Y_WHEAT*h.mult()*0.8)return; // 納屋が溢れたら休耕(働いても売れない年は畑を休ませる)
      h.wheatWork+=f;
      if(mm>=3&&mm<=8){const u=Math.min(h.pantry.meal,P.FERT_NEED*f);h.pantry.meal-=u;h.fert=(h.fert||0)+u;this.fl('meal','cons',u);}}
    else if(h.job==='logger'){const q=this.chopWood(h,P.Y_LOG*w);h.pantry.log+=q;this.fl('log','prod',q);}
    else if(h.job==='woodshop'){const q=Math.min(P.Y_TOOLS*w,h.pantry.log/P.LOG_TOOL);
      h.pantry.log-=q*P.LOG_TOOL;h.pantry.tools+=q;this.fl('tools','prod',q);this.fl('log','cons',q*P.LOG_TOOL);}
    else if(h.job==='charburner'){const q=Math.min(P.Y_CHAR*w,h.pantry.log/P.LOG_CHAR);
      h.pantry.log-=q*P.LOG_CHAR;h.pantry.char+=q;this.fl('char','prod',q);this.fl('log','cons',q*P.LOG_CHAR);}
    else if(h.job==='saltworks'){const fuel=Math.min(P.SALT_CHAR*f,h.pantry.char);
      h.pantry.char-=fuel;h.pantry.salt+=P.Y_SALT*h.mult()*fuel/P.SALT_CHAR/1;this.fl('salt','prod',P.Y_SALT*h.mult()*fuel/P.SALT_CHAR);this.fl('char','cons',fuel);}}
  transact(h){
    // --- 売り: まず会社の買付台(輸出/石畳)・値が合わなければ屋台に置く ---
    const offers=this.sellOffers(h);
    for(const g in offers){let q=offers[g];
      const desks=[];
      if(P.EXP[g]!==undefined)desks.push(['EXP',P.EXP[g],this.expCap[g]]);
      if(g==='stone'&&this.paving&&!this.paved)desks.push(['PAVE',1.4,1e9]);
      desks.sort((a,b)=>b[1]-a[1]);
      for(const[kind,price,cap]of desks){
        if(q<1e-9)break;
        if(price<this.cost(h,g))continue;  // 原価割れの台には売らない(原理A)。原価以上なら黙って売る
        const used=this.deskUsed[kind+g]||0;const can=Math.min(q,Math.max(0,cap-used));
        if(can<1e-9)continue;
        this.deskUsed[kind+g]=used+can;
        h.pantry[g]-=can;h.purse+=can*price;h.income30+=can*price;
        this.treasury-=can*price;
        if(kind==='EXP'){this.co.expBuy+=can*price;this.exported[g]=(this.exported[g]||0)+can;this.fl(g,'exp',can);
          const rev=can*this.expMl[g];this.treasury+=rev;this.mainlandIn+=rev;this.co.expSell+=rev;}
        else if(kind==='PAVE')this.paveBought+=can;
        q-=can;}
      if(q>1e-9){ // 屋台に出す(店番=家族が残る扱い。委託中は生産効率減)
        h.pantry[g]-=q;
        const c=this.cost(h,g);
        let ask=c*(1.05+this.rng()*1.25);                    // 原価の床から記憶なしの試行
        if(P.IMP[g])ask=Math.min(ask,P.IMP[g]*0.97);         // 輸入小売の下=実質天井
        ask=Math.max(ask,c*1.05);                            // それでも原価は割らない(売るより持つ)
        this.stalls[g].push({hh:h,qty:q,price:ask,age:0});}}
    // --- 買い: 安い屋台(+会社の輸入棚)から。持ち帰り容量まで ---
    let cap=h.haul();
    const targets=this.buyTargets(h);
    const buyOrder=['log','salt','char','tools','cloth','iron','meal','stone','oil','fish','veg','wheat','pres','meat'].filter(g=>targets[g]); // 生産インプット(丸太)は最優先
    for(const g of buyOrder){
      let[want,ceil]=targets[g];want=Math.min(want,cap);
      const shelves=[...this.stalls[g]];
      if(P.IMP[g]!==undefined)shelves.push({hh:'CO',qty:1e9,price:P.IMP[g]});
      const freeStock=(this.stock[g]||0)-((this.order&&this.order.g===g)?this.order.left:0);
      if(freeStock>1e-9){const avg=(this.stockCost?.[g]||0)/Math.max(1e-9,this.stock[g]||0);
        shelves.push({hh:'STOCK',qty:freeStock,price:Math.min(Math.max(avg*1.2,0.3),(P.IMP[g]??9e9)*0.97)});} // 蔵出し=仕入原価×1.2(コストプラス)。px連動は飢饉の便乗値上げになり備蓄が保険にならない
      shelves.sort((a,b)=>a.price-b.price); // 輸入棚も価格競争に参加=輸入パリティが真の天井になる
      const isInput=(h.job==='saltworks'&&g==='char')||(h.job==='fisher'&&(g==='salt'||g==='char'))||(h.job==='veg'&&g==='salt')||((h.job==='wheat'||h.job==='rapeseed')&&g==='meal')||((h.job==='woodshop'||h.job==='charburner')&&g==='log');
      for(const s of shelves){if(want<1e-9)break;
        if(s.price>ceil||s.price<=0)continue;
        const q=Math.min(want,s.qty,(h.purse+(isInput?30:0))/s.price); // 仕入れは-30まで信用買い(前貸し)
        if(q<1e-9)continue;
        h.purse-=q*s.price;h.pantry[g]+=q;want-=q;cap-=q;
        if(s.hh==='CO'){this.treasury+=q*s.price;
          const c=q*(P.IMP_COST[g]??P.IMP[g]*0.7);this.treasury-=c;this.mainlandOut+=c;
          this.co.impMargin+=q*s.price-c;this.fl(g,'imp',q);
          this.outBy['imp_'+g]=(this.outBy['imp_'+g]||0)+(c-q*s.price);
          this.imported[g]=(this.imported[g]||0)+q;}
        else if(s.hh==='STOCK'){this.treasury+=q*s.price;
          const avg=(this.stockCost?.[g]||0)/Math.max(1e-9,this.stock[g]||0);this.stockCost[g]=Math.max(0,(this.stockCost[g]||0)-q*avg);
          this.stock[g]-=q;s.qty-=q;this.co.stockSell=(this.co.stockSell||0)+q*s.price;}
        else{s.qty-=q;const fee=q*s.price*P.FEE; // 市場口銭: 金庫の貯まる速さ=村の取引量(良い配置ほど速い)
          s.hh.purse+=q*s.price-fee;s.hh.income30+=q*s.price-fee;this.treasury+=fee;this.co.fee=(this.co.fee||0)+fee;}
        (this.prices[g]=this.prices[g]||[]).push([this.day,s.price,q]);
        this.px[g]=(this.px[g]??s.price)*0.9+s.price*0.1;}
      }}
  dayEnd(){const d=this.day,m=Math.floor((d-1)/30)+1,mm=(m-1)%12+1;
    // 商館の買上げ: その日の全世帯の買い物が済んだ後の余剰を、安い屋台から順に(=必須の人が先・逆選抜なし。
    // 熟成待ち方式は「市場が拒否した高値の抽選」だけを掴む逆選抜で実測350%過払いだった)
    this.stockCost=this.stockCost||{};
    for(const g in this.stockTgt){let lack=(this.stockTgt[g]||0)-(this.stock[g]||0);
      if(lack<=1e-9||this.treasury<=-this.limit())continue;
      for(const s of[...this.stalls[g]].sort((a,b)=>a.price-b.price)){if(lack<=1e-9)break;
        if(!(s.hh&&s.hh.purse!==undefined))continue;
        const can=Math.min(s.qty,lack);if(can<1e-9)continue;
        s.qty-=can;s.hh.purse+=can*s.price;s.hh.income30+=can*s.price;
        this.treasury-=can*s.price;this.co.procBuy=(this.co.procBuy||0)+can*s.price;
        this.stock[g]=(this.stock[g]||0)+can;this.stockCost[g]=(this.stockCost[g]||0)+can*s.price;
        lack-=can;}}
    if(mm===9&&d%30===15)for(const h of this.hhs)if(h.job==='wheat'){
      const fill=Math.min(1,(h.fert||0)/(P.FERT_NEED*180));
      {const hv=P.Y_WHEAT*h.mult()*Math.min(1,h.wheatWork/300)*(1+P.FERT_BOOST*fill);h.pantry.wheat+=hv;this.led.prod.wheat=(this.led.prod.wheat||0)+hv;this.fl('wheat','prod',hv);(this.harvestLog=this.harvestLog||[]).push([d,hv]);}
      if(fill>0.05)this.log(`麦畑#${h.id} 施肥${Math.round(fill*100)}%→+${Math.round(P.FERT_BOOST*fill*100)}%`);
      h.wheatWork=0;h.fert=0;h.jobCycleDone=true;}
    // 食事(配給という制度は無い。飢えの出口は採集の床・民間の雇用・転職——それでも足りなければ人は死ぬ)
    this.hungryN=0;
    for(const h of this.hhs){let need=h.eat();this.led.need+=need;const kinds=new Set();
      for(const g of['pres','wheat','pick']){const u=Math.min(h.pantry[g],need*P.RATION*0.85);
        h.pantry[g]-=u;need-=u;if(u>1e-9){kinds.add(KIND[g]);this.led.eat[g]=(this.led.eat[g]||0)+u;this.fl(g,'cons',u);}} // fl漏れ=需給パネルの麦消費が過少表示されていた(E20が検出)
      for(let i=0;i<2;i++){const act=['fish','veg','meat'].filter(g=>h.pantry[g]>1e-9);
        if(!act.length||need<=1e-9)break;const share=need/act.length;
        for(const g of act){const u=Math.min(h.pantry[g],share);h.pantry[g]-=u;need-=u;if(u>1e-9){kinds.add(KIND[g]);this.led.eat[g]=(this.led.eat[g]||0)+u;this.fl(g,'cons',u);}}}
      for(const g of['pres','wheat','pick']){if(need<=1e-9)break;
        const u=Math.min(h.pantry[g],need);h.pantry[g]-=u;need-=u;if(u>1e-9){kinds.add(KIND[g]);this.led.eat[g]=(this.led.eat[g]||0)+u;this.fl(g,'cons',u);}}
      if(need>0.5){const forage=Math.min(need,h.eat()*0.75);need-=forage;this.fl('veg','prod',forage*0.3);} // 自給の床: 採集・落穂拾い(島の地力。金庫は関与しない——配給なき島の生存線)
      const hgy=need>0.5;if(hgy){h.hunger++;this.famine++;this.hungryN++;h.hungerRun=(h.hungerRun||0)+1;}else h.hungerRun=0;
      (h.hungerHist=h.hungerHist||[]).push(hgy?1:0);
      if(h.hungerRun>=60){h.hungerRun=30;
        const dead=h.members.pop();
        this.log('☠ '+h.sur+'家の'+(dead?dead.name:'一人')+'が餓えで亡くなった');
        if(h.members.length<=2){this.log('☠ '+h.sur+'家は離散した——家は廃屋になった');
          (this.ruins=this.ruins||[]).push({x:h.x,y:h.y});
          // 相続: 財布は近所3世帯に広く薄く(子→近所の正典・貨幣を蒸発させない)
          for(const g of GOODS){const st=this.stalls[g];
            for(let i=st.length-1;i>=0;i--)if(st[i].hh===h)st.splice(i,1);} // 幽霊屋台の撤去(集計外の財布に金が漏れる)
          const rest=this.hhs.filter(x=>x!==h);
          if(rest.length&&h.purse>0){
            const near=rest.sort((a,b)=>Math.hypot(a.x-h.x,a.y-h.y)-Math.hypot(b.x-h.x,b.y-h.y)).slice(0,3);
            const share=h.purse/near.length;
            for(const n of near)n.purse+=share;
            h.purse=0;}
          else{this.treasury+=h.purse;h.purse=0;} // 借りは会社の貸し倒れ・相続人なき遺産は金庫へ(貨幣を蒸発させない)
          this.hhs.splice(this.hhs.indexOf(h),1);}}
      h.kindLog.push([d,[...kinds]]);for(const k of kinds)h.kindDays[k]=(h.kindDays[k]||0)+1;
      while(h.kindLog.length&&h.kindLog[0][0]<=d-45){for(const k of h.kindLog[0][1])h.kindDays[k]--;h.kindLog.shift();}
      // 文化消費+保存加工
      const sat={};const mmW=(Math.floor((d-1)/30))%12+1;const chMul=mmW>=10||mmW<=2?2.0:0.6;
      for(const[g,dd0]of[['tools',P.D_TOOL],['salt',P.D_SALT],['char',P.D_CHAR*chMul],['cloth',P.D_CLOTH],['iron',P.D_IRON]]){const dd=dd0*Math.pow(P.CMULT,h.lv); // 消費のLv階段(生産1.585より緩い1.35=質の向上)
        const u=Math.min(h.pantry[g],dd);h.pantry[g]-=u;sat[g]=u>=dd*0.95;if(u>1e-9)this.fl(g,'cons',u);}
      const kd=h.kindDays;sat.food1=Object.values(kd).some(v=>v>0);
      sat.food2=Object.values(kd).filter(v=>v>5).length>=2;
      sat.grain=(kd.wheat||0)>5;
      sat.saltchar=sat.salt&&sat.char;
      sat.food3=Object.values(kd).filter(v=>v>5).length>=3;
      if(h.job==='veg'&&h.pantry.veg>h.eat()*2&&h.pantry.salt>0.2){
        // 漬け込み: 余り野菜+塩→漬物(冬の売り物・野菜枠の越冬)
        const raw=Math.min(h.pantry.veg-h.eat()*2,h.pantry.salt/P.PICK_SALT,15);
        h.pantry.veg-=raw;h.pantry.salt-=raw*P.PICK_SALT;h.pantry.pick+=raw*P.PR_PICK;this.fl('veg','cons',raw);this.fl('salt','cons',raw*P.PICK_SALT);this.fl('pick','prod',raw*P.PR_PICK);}
      if(h.job==='fisher'&&h.pantry.fish>1e-9){
        const raw=Math.min(h.pantry.fish,h.pantry.salt/P.PRES_SALT);
        const smoked=Math.min(raw,h.pantry.char/P.SMOKE_CHAR);
        h.pantry.fish-=raw;h.pantry.salt-=raw*P.PRES_SALT;h.pantry.char-=smoked*P.SMOKE_CHAR;
        h.pantry.pres+=smoked*P.PR_SMOKE+(raw-smoked)*P.PR_SALT;this.fl('fish','cons',raw);this.fl('salt','cons',raw*P.PRES_SALT);this.fl('char','cons',smoked*P.SMOKE_CHAR);this.fl('pres','prod',smoked*P.PR_SMOKE+(raw-smoked)*P.PR_SALT);}
      {const rot=h.pantry.fish/P.FISH_LIFE;h.pantry.fish-=rot;this.led.spoil.fish=(this.led.spoil.fish||0)+rot;
       const vrot=h.pantry.veg/P.VEG_LIFE;h.pantry.veg-=vrot;this.led.spoil.veg=(this.led.spoil.veg||0)+vrot;}
      // ラダー(軟ストリーク)
      h.satLast=sat;
      const reqs=LADDER[h.cls()];
      const keep=reqs.slice(0,h.lv).every(r=>sat[r]);
      const nxt=h.lv<reqs.length?sat[reqs[h.lv]]:false;
      if(keep&&nxt){h.up++;h.down=0;
        if(h.up>=P.UP_DAYS*(h.lv+1)){h.lv++;h.up=0;this.log(`${h.job}#${h.id} ▲Lv${h.lv}`);}}
      else if(keep){h.up=Math.max(0,h.up-3);h.down=0;}
      else{h.up=Math.max(0,h.up-3);h.down++;
        if(h.down>=P.DOWN_DAYS&&h.lv>0){h.lv--;h.down=0;this.log(`${h.job}#${h.id} ▼Lv${h.lv}`);}}
      if((d-1)%360===0)h.incY=0;
      h.incY=(h.incY||0)+h.income30;h.incomeLog.push(h.income30);h.incM+=h.income30;h.income30=0;if(h.incomeLog.length>30)h.incomeLog.shift();
      if(d%30===0){h.incMonths.push(h.incM);h.incM=0;if(h.incMonths.length>12)h.incMonths.shift();}
      h.purseLog.push(h.purse);if(h.purseLog.length>31)h.purseLog.shift();}
    if(this.paving&&!this.paved&&this.paveBought>=P.PAVE_STONE){this.paved=true;
      this.log('★石畳完成——全ての道が格上げ(0.6→0.45・永続)');}
    // 出生(月次): 飢えていない家族は増える——余剰人口の源泉。人口の受け皿(区画)はプレイヤーが用意する
    if(d%30===0)for(const h of this.hhs){
      if(h.members.length<11&&h.hungerRun===0&&FOODS.reduce((s,g)=>s+h.pantry[g],0)/P.EAT>2&&this.rng()<0.12){
        const FIRSTN=['ハンス','グレタ','ヤン','マリア','ピム','ロッテ','カレル','アンナ','ブラム','エルス'];
        h.members.push({name:FIRSTN[Math.floor(this.rng()*FIRSTN.length)],sex:this.rng()<0.5?'♂':'♀',age:0});
        this.log(`${h.sur}家に子が生まれた(家族${h.members.length}人)`);}}
    // 破綻転職(飢え40/180日+1年クールダウン)
    if(d%30===0){for(const h of this.hhs){
      h.insolvM=(h.purse<-2)?(h.insolvM||0)+1:0;
      h.hungerHist=(h.hungerHist||[]);
      if(h.hungerHist.length>180)h.hungerHist.splice(0,h.hungerHist.length-180);
      // 年1収穫の麦は、少なくとも最初の収穫を観測してから転職評価する。
      // 観測前の所得ゼロを失敗と誤認すると、収穫前に離職→麦職絶滅→飢餓の吸収状態になる。
      const distress=h.jobCycleDone&&(h.hungerHist.reduce((a,b)=>a+b,0)>=P.DISTRESS||(h.insolvM||0)>=3);
      if((h.insolvM||0)>=6&&h.purse<0){this.treasury+=h.purse;h.purse=0;h.insolvM=0;this.log(`${h.sur}家の借財を帳消しに(徳政)`);}
      if(distress&&d-(h.lastSwitch||-9e9)>=P.COOLDOWN&&this.rng()<0.5){
        const best=this.pickJob(h.job,h);
        if(best&&best!==h.job){this.log(`破綻転職: ${h.job}#${h.id}→${best}`);
          if(h.purse<0){this.treasury+=h.purse;h.purse=0;} // 徳政: 借金は会社の貸し倒れ(再出発)
          h.job=best;h.jobCycleDone=best!=='wheat';h.lv=Math.min(h.lv,1);h.lastSwitch=d;h.hungerHist=[];h.insolvM=0;}}}}
    // 財政(月末)
    if(d%30===0){
      const debt=Math.max(0,-this.treasury);
      if(m>P.FREE_M&&debt>0){const i=debt*P.IRATE;this.treasury-=i;this.mainlandOut+=i;}
      if(this.goDay===null&&-this.treasury>this.limit()){this.goDay=d;
        this.log(`★破産(債務${Math.round(-this.treasury)}>限度${Math.round(this.limit())})——最終通告`);}}
    // 森の成長と遷移(禿山は隣に森が残っていれば数年で還る=取りきれない森の実装)
    if(this.terr&&d%5===0){for(const k in this.wood){const s=this.wood[k];
        if(s>0&&s<P.WOOD0)this.wood[k]=Math.min(P.WOOD0,s+P.WOOD_R*5);}
      if(d%30===0){const[MW,MH]=[this.terr[0].length,this.terr.length];
        for(let y=0;y<MH;y++)for(let x=0;x<MW;x++)if(this.terr[y][x]==='bald'){
          let adj=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(this.terr[y+dy]?.[x+dx]==='forest'&&this.wood[(x+dx)+','+(y+dy)]>P.WOOD0*0.3)adj++;
          if(adj>=2&&this.rng()<0.06){this.terr[y][x]='forest';this.wood[x+','+y]=P.WOOD0*0.25;}}}}
    // 需給フロー20日EMA
    this.f30=this.f30||{};
    for(const g of GOODS){const t=this.fday[g]||{prod:0,cons:0,imp:0,exp:0};
      const f=this.f30[g]=this.f30[g]||{prod:0,cons:0,imp:0,exp:0};
      for(const k in t)f[k]=f[k]*0.95+t[k]*0.05;}
    // 貨幣保存則
    const total=this.treasury+this.hhs.reduce((s,h)=>s+h.purse,0);
    const drift=total-this.money0-(this.mainlandIn-this.mainlandOut);
    if(Math.abs(drift)>1e-4)throw new Error(`貨幣保存則違反 drift=${drift} day=${d}`);}
}
