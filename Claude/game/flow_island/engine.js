// 流通の島 v0 エンジン (spatial/engine.py の較正値を移植・ブラウザ/Node両用)
export const GOODS = ['fish','veg','wheat','pres','pick','tools','salt','char','meat','meal','stone','oil','iron','cloth'];
export const PERISH = ['fish','veg','meat','pres','pick','wheat','meal'];
// pick=漬物(野菜の保存・野菜枠の多様性が冬も立つ)
export const FOODS = ['fish','veg','wheat','pres','pick','meat'];
const KIND = {fish:'fish',veg:'veg',wheat:'wheat',pres:'fish',pick:'veg',meat:'meat'};
export const P = {
  EAT:9, PANTRY_FOOD_D:6, CULT_D:240, RATION:0.15,
  Y_FISH:13, Y_FISH_W:3.2, FISH_LIFE:3, VEG_LIFE:30, PICK_SALT:0.1, PR_PICK:0.85, Y_VEG:10, Y_WHEAT:4500, Y_TOOLS:8, Y_CHAR:8, Y_SALT:12, Y_MEAT:16, Y_CLOTH:0.35, D_CLOTH:0.03, D_IRON:0.03,
  SALT_CHAR:1, PR_SALT:0.6, PR_SMOKE:0.95, SMOKE_CHAR:0.1, PRES_SALT:0.125,
  D_TOOL:0.2, D_SALT:0.06, D_CHAR:0.4, LV_MULT:1.585, UP_DAYS:45, DOWN_DAYS:60,
  TRAVEL_RATE:0.016, ROAD_F:0.6, TRAVEL_MAX:0.7, HAUL:40,
  IMP:{wheat:2.8,tools:3.8,salt:3.2,iron:4.0}, IMP_COST:{wheat:1.6,tools:2.8,salt:2.2,iron:3.0},  // 麦2.6=輸入パリティが島の麦を殺す幼稚産業問題の修正
  EXP:{pres:0.6,pick:0.55,tools:1.0,stone:0.4,oil:2.4,salt:0.9}, EXP_CAP:{pres:25,pick:15,tools:20,stone:15,oil:12,salt:15}, EXP_ML:{pres:0.66,pick:0.6,tools:1.1,stone:0.44,oil:2.64,salt:1.0},
  PUB0:120, DOLE_RATION:1.1, GRAN_BID:{wheat:1.5,pres:1.4,salt:2.0,char:1.5},  // 塩=公共備蓄の要・炭=冬の救恤燃料(通貨の入口を広げ相互貧困デッドロックを解く)
  FREE_M:42, IRATE:0.012, LIMIT0:20000, LIMIT_G:1500, LIMIT_FREEZE:24, LIMIT_PC:250,
  BAIL_N:3, BAIL_TRIG:-2000, BAIL_AMT:8000, TREASURY0:3000, PURSE0:60, PASSAGE:60,
  SHIP_COST:8000, SHIP_CAP:2, SHIP_PRICE:1.2,
  BAY0:600000, BAY_R:0.00175, RESEED:0.3, GROVE0:60000, GROVE_R:0.0006,
  MEAL_FISH:8, FERT_NEED:3, FERT_BOOST:0.15, Y_STONE:8, Y_OIL:6,
  PAVE_STONE:200, PAVE_ROAD_F:0.45, DISTRESS:40, COOLDOWN:360,
  BELIEF0:{fish:1,veg:1,wheat:1.2,pres:1.2,pick:1.3,tools:2,salt:2,char:1.5,meat:1.3,meal:1,stone:1,oil:3,iron:3.5,cloth:2.5},
};
export const LADDER={farm:['food1','tools','saltchar','food2','iron','food3'],
  fish:['grain','tools','salt','char','food2','iron'],
  lumber:['food1','tools','food2','salt','char','iron'],
  artisan:['food1','food2','salt','char','cloth','iron']};
export const JOBCLS={fisher:'fish',fisher2:'fish',wheat:'farm',veg:'farm',shepherd:'farm',rapeseed:'farm',woodshop:'lumber',charburner:'lumber',quarryman:'lumber',saltworks:'artisan'};
export const JOBS=Object.keys(JOBCLS);
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
    this.hunger=0;this.wheatWork=0;this.unsold=new Set();this.income30=0;this.incomeLog=[];this.walk=0;
    this.px=x;this.py=y;this.state='home';this.cargo=null;this.buildDays=0;
    // 開拓キット(移民は道具と生業の入力を持参する): 創業デッドロック防止
    this.pantry.tools=5;this.pantry.wheat=90;  // 兵糧(9人×約10日=普請期間を自弁。配給=輸入価格で治療するより船で運ぶ方が安い)
    if(job==='saltworks')this.pantry.char=15;
    if(job==='fisher'){this.pantry.salt=4;this.pantry.char=2;}
    if(job==='veg')this.pantry.salt=3;
    if(job==='fisher2')this.pantry.salt=2;}
  mult(){return Math.pow(P.LV_MULT,this.lv);}
  eat(){return this.members.length;}
  haul(){return this.members.length*4;}   // 1人1荷(荷=4食分)×家族
  cls(){return JOBCLS[this.job];}
}
export class World{
  constructor(seed=11){this.rng=mulberry(seed);HID=0;this.hhs=[];this.day=0;this.treasury=P.TREASURY0;
    this.bay=P.BAY0;this.bay2=P.BAY0;this.grove=P.GROVE0;this.paving=false;this.paved=false;this.granary={wheat:0,pres:0};this.doleRate=10;this.outBy={dole:0,pass:0};this.led={prod:{},eat:{},spoil:{},dole:0,need:0};this.co={pub:0,gran:0,expBuy:0,expSell:0,impMargin:0,doleC:0,bail:0};this.doleQty=0;
    this.bailouts=0;this.goDay=null;this.shipping=false;this.pub=P.PUB0;this.pubLeft=P.PUB0;this.famine=0;
    this.mainlandIn=0;this.mainlandOut=0;this.imported={};this.exported={};this.events=[];this.prices={};
    this.market={x:0,y:0};this.roadTiles=new Set();this.money0=P.TREASURY0;this.paveBought=0;
    this.zones=[];this.port=null;this.t=0;this.flow=null;this.terrCost=null;this.MW=48;this.MH=40;
    this.stalls={};for(const g of GOODS)this.stalls[g]=[];
    this.deskUsed={};}
  setTerrain(terr){this.terr=terr;}
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
    const x=Math.round(h.px),y=Math.round(h.py);
    let bx=x,by=y,bd=this.flow[y*W+x];
    for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1]]){
      const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=W||ny>=this.MH)continue;
      const d=this.flow[ny*W+nx];if(d<bd){bd=d;bx=nx;by=ny;}}
    const sp=1/Math.max(0.45,this.tileCost(x,y));
    h.px+=(bx-h.px)*Math.min(1,sp*0.9);h.py+=(by-h.py)*Math.min(1,sp*0.9);this.tread(h.px,h.py);
    return Math.hypot(h.px-this.market.x,h.py-this.market.y)<1.2;}
  stepTo(h,tx,ty){const d=Math.hypot(tx-h.px,ty-h.py);if(d<0.8)return true;
    h.px+=(tx-h.px)/d*0.8;h.py+=(ty-h.py)/d*0.8;this.tread(h.px,h.py);return false;}
  pop(){return this.hhs.reduce((s,h)=>s+h.members.length,0);}
  addZone(job,x,y){this.zones.push({job,x,y,filled:false});this.log(`区画指定: ${job}`);}
  log(msg){this.events.push([this.day,msg]);if(this.events.length>400)this.events.shift();}
  addHH(job,x,y){const h=new HH(job,x,y);this.hhs.push(h);this.mainlandIn+=h.purse;
    this.treasury-=P.PASSAGE;this.mainlandOut+=P.PASSAGE;this.log(`入植: ${job}`);this.updRoads();return h;}
  investPaving(){if(this.paving||this.paved)return false;this.paving=true;
    this.log('★石畳プロジェクト開始(石200を公費で買い上げ)');return true;}
  investShipping(){if(this.shipping||this.treasury<-this.limit())return false;
    this.treasury-=P.SHIP_COST;this.mainlandOut+=P.SHIP_COST;this.shipping=true;
    for(const g in P.EXP_CAP)P.EXP_CAP[g]*=P.SHIP_CAP;for(const g in P.EXP_ML)P.EXP_ML[g]*=P.SHIP_PRICE;
    this.log('★沿岸海運に投資(輸出天井×2・本土価+20%)');return true;}
  updRoads(){this.flow=null;for(const h of this.hhs){h.road=false;
    for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++)
      if(this.roadTiles.has(`${Math.round(h.x)+dx},${Math.round(h.y)+dy}`)){h.road=true;break;}}}
  dist(h){return Math.hypot(h.x-this.market.x,h.y-this.market.y);}
  travel(h){return Math.min(P.TRAVEL_MAX,this.dist(h)*2*P.TRAVEL_RATE*(h.road?P.ROAD_F:1));}
  limit(){const m=Math.floor((this.day-1)/30)+1;
    return Math.min(P.LIMIT0+P.LIMIT_G*Math.min(m,P.LIMIT_FREEZE),Math.max(6000,this.hhs.length*9*P.LIMIT_PC));}
  clear(g,bids,asks){bids.sort((a,b)=>b[2]-a[2]);asks.sort((a,b)=>a[2]-b[2]);
    let bi=0,ai=0,bq=bids[0]?.[1]??0,aq=asks[0]?.[1]??0;const tr=[];let pair=null;
    while(bi<bids.length&&ai<asks.length&&bids[bi][2]>=asks[ai][2]){
      const q=Math.min(bq,aq);tr.push([bids[bi][0],asks[ai][0],q]);pair=[bids[bi][2],asks[ai][2]];
      bq-=q;aq-=q;if(bq<=1e-12){bi++;bq=bids[bi]?.[1]??0;}if(aq<=1e-12){ai++;aq=asks[ai]?.[1]??0;}}
    this.unfilled=bi<bids.length?bids[bi][2]:null;
    if(!tr.length)return[0,0];
    const nb=bi<bids.length?bids[bi][2]:null;
    const price=Math.min(pair[0],Math.max(pair[1],nb??pair[1]));let vol=0;
    for(let[buyer,seller,q]of tr){let cost=q*price;
      if(buyer instanceof HH){q=Math.min(q,price>0?buyer.purse/price:q,buyer._cap??1e9);cost=q*price;buyer._cap=(buyer._cap??1e9)-q;
        buyer.purse-=cost;buyer.pantry[g]+=q;buyer.belief[g]+=(price-buyer.belief[g])*0.2;}
      else{this.treasury-=cost;
        if(buyer==='EXP'){this.exported[g]=(this.exported[g]||0)+q;
          const rev=q*P.EXP_ML[g];this.treasury+=rev;this.mainlandIn+=rev;}
        else if(buyer==='GRAN'){this.granary[g]=(this.granary[g]||0)+q;}
        else if(buyer==='PAVE'){this.paveBought+=q;}}
      if(seller instanceof HH){seller.purse+=cost;seller.pantry[g]-=q;seller.income30+=cost;
        seller.belief[g]+=(price-seller.belief[g])*0.2;seller.unsold.delete(g);}
      else{this.treasury+=cost;const c=q*(P.IMP_COST[g]??P.IMP[g]*0.7);
        this.treasury-=c;this.mainlandOut+=c;this.imported[g]=(this.imported[g]||0)+q;}
      vol+=q;}
    return[price,vol];}
  buyTargets(h){const t={};const doleOn=this.goDay===null;
    const foodDays=FOODS.reduce((s,g)=>s+h.pantry[g],0)/P.EAT;
    const cheapest=Math.min(h.belief.veg,h.belief.wheat,h.belief.pres);
    const mmT=(Math.floor((this.day-1)/30))%12+1;
    const autumn=mmT>=7&&mmT<=9;   // 秋=冬支度(正典ルール3「備えを保つ」の季節スケール)
    const tgtD=autumn?(doleOn?8:60):(doleOn?2:P.PANTRY_FOOD_D);  // 依存期の冬支度は控えめ(輸入で積むと本土流出が膨らむ)
    if(foodDays<tgtD){const starving=foodDays<1.5;
      for(const g of['veg','wheat','pres','pick'])
        t[g]=[(tgtD-foodDays)*P.EAT/4,starving?99:Math.min(h.belief[g]*1.5,cheapest*2.2)];}
    if(h.job!=='fisher')t.fish=[P.EAT*0.5,foodDays<1.5?99:Math.min(h.belief.fish*1.5,cheapest*2.2)];
    if(h.job!=='wheat'&&h.pantry.wheat<P.EAT*P.RATION*10&&!t.wheat)
      t.wheat=[P.EAT*P.RATION*15-h.pantry.wheat,h.belief.wheat*1.3];
    if(h.job!=='veg'&&h.pantry.veg<P.EAT*P.RATION*6&&!t.veg)
      t.veg=[P.EAT*P.RATION*10-h.pantry.veg,h.belief.veg*1.3];
    if(h.job!=='shepherd'&&h.pantry.meat<P.EAT*P.RATION*4&&!t.meat)
      t.meat=[P.EAT*P.RATION*8-h.pantry.meat,Math.min(h.belief.meat*1.4,cheapest*2.2)];
    if((h.job==='wheat'||h.job==='rapeseed')&&h.pantry.meal<P.FERT_NEED*10){
      const mmn=(Math.floor((this.day-1)/30))%12+1;
      if(mmn>=3&&mmn<=8){const bv=(h.job==='wheat'?P.Y_WHEAT*h.mult():P.Y_OIL*h.mult()*540)*P.FERT_BOOST*(h.job==='wheat'?h.belief.wheat:h.belief.oil)/(P.FERT_NEED*180);
        t.meal=[P.FERT_NEED*20-h.pantry.meal,bv*0.7];}}
    if(h.job==='saltworks'&&h.pantry.char<P.SALT_CHAR*5)
      t.char=[P.SALT_CHAR*10-h.pantry.char,P.Y_SALT*h.belief.salt*0.5];
    if(h.job==='veg'&&h.pantry.salt<1.5)
      t.salt=[4-h.pantry.salt,h.belief.pick*P.PR_PICK/P.PICK_SALT*0.4];  // 漬物の導出需要
    if(h.job==='fisher'){if(h.pantry.salt<3)t.salt=[6-h.pantry.salt,h.belief.pres*P.PR_SALT/P.PRES_SALT*0.5];
      if(h.pantry.char<2)t.char=[4-h.pantry.char,(P.PR_SMOKE-P.PR_SALT)*h.belief.pres/P.SMOKE_CHAR*0.5];}
    // 依存期(配給中)は文化財を溜め込まない(60日分)。240日分を輸入で買うと開幕の
    // 手持ちが即座に会社へ吸われ、市中から通貨が消える(財布ゼロ問題の主因)
    const cd=(this.goDay===null&&this.doleRate>0.5)?60:P.CULT_D;
    // 文化財の購買=ラダーの現在位置(次Lvまで)が要求する財だけ(階段の先食い禁止:
    // Lv0世帯が鉄@40を買う無駄が配給依存の主因だった)
    const reqsNow=(LADDER[JOBCLS[h.job]]||[]).slice(0,h.lv+1);
    const needSet=new Set();
    for(const r of reqsNow){if(r==='saltchar'){needSet.add('salt');needSet.add('char');}
      else if(['tools','salt','char','cloth','iron'].includes(r))needSet.add(r);}
    needSet.add('char');   // 暖は全階層の基礎需要(冬)
    for(const[g,dd,val]of[['tools',P.D_TOOL,2.5],['salt',P.D_SALT,2.5],['char',P.D_CHAR,2.5],['cloth',P.D_CLOTH,2.8],['iron',P.D_IRON,4.0]]){
      if(!needSet.has(g))continue;
      if(t[g])continue;
      if(h.pantry[g]<dd*cd*0.5)t[g]=[dd*cd-h.pantry[g],val];}
    return t;}
  sellOffers(h){const out={};const doleOn=this.goDay===null;
    const cooled=g=>P.EXP[g]===undefined&&(h.noSell?.[g]||0)>this.day; // 輸出台のない財だけ季節休業(輸出財は台が常に買う)
    const my={fisher:'fish',veg:'veg',wheat:'wheat',shepherd:'meat',woodshop:'tools',charburner:'char',saltworks:'salt',fisher2:'meal',quarryman:'stone',rapeseed:'oil'}[h.job];
    if(my==='meal'){if(h.pantry.meal>=15)return{meal:Math.min(h.pantry.meal,P.HAUL)};return{};}
    if(my==='fish'){let keep=P.EAT;
      const alt=Math.min(h.belief.veg,h.belief.wheat,h.belief.pres);
      if(h.belief.fish>alt*1.5)keep=P.EAT*0.3;
      // 塩がある分は保存に回す(今夜の塩蔵用に魚を残す。保存は買付台で確実に売れる)
      keep+=Math.min(h.pantry.salt/P.PRES_SALT,12);
      const s=Math.max(0,h.pantry.fish-keep);if(s>1e-9)out.fish=Math.min(s,h.haul());}
    else{let keep=FOODS.includes(my)?P.EAT*2:2,rate=0.5;
      if(my==='wheat'){rate=doleOn?0.1:0.04;if(doleOn)keep=P.EAT*P.RATION*10;}
      if(my==='veg'&&doleOn)keep=P.EAT*P.RATION*10;
      const s=Math.max(0,h.pantry[my]-keep);if(s>1e-9&&!cooled(my))out[my]=Math.min(s*rate+2,s,h.haul());}
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
      else if(h.state==='toHome'){if(this.stepTo(h,h.x,h.y))h.state='home';}
      else if(h.state==='home'){this.produceTick(h,1/30);}}
    if(tod===16)for(const h of this.hhs){if(h.state!=='home')continue;
      const fd=FOODS.reduce((s,g)=>s+h.pantry[g],0)/P.EAT;
      const offers=this.sellOffers(h);const sellSum=Object.values(offers).reduce((a,b)=>a+b,0);
      const lowCult=['tools','salt','char'].some(g=>h.pantry[g]<[P.D_TOOL,P.D_SALT,P.D_CHAR][['tools','salt','char'].indexOf(g)]*4);
      const inputLow=(h.job==='saltworks'&&h.pantry.char<2)||(h.job==='fisher'&&h.pantry.salt<1)||((h.job==='wheat'||h.job==='rapeseed')&&h.pantry.meal<1&&this.day%7===0);
      // 食料の自産者(漁/菜/牧)は日々の食いつなぎで出発しない(在庫が薄いのは仕様)。
      // 本当に空の時だけ買いに行く。これが無いと毎日通勤し実効生産<自家消費で永久赤字
      const fdThr=(h.job==='fisher'||h.job==='shepherd'||h.job==='veg')?1.2:3;
      // 買い物トリップは財布に金がある時だけ(貧乏通勤トラップ防止: 買えないのに毎日通い労働が消える)
      // 空腹トリップも一文なしなら行かない(買えずに手ぶらで帰る無駄通勤。配給は家に届く)
      if(offers.fish>0||sellSum>=10||(fd<fdThr&&h.purse>2)||(lowCult&&h.purse>15)||(inputLow&&h.purse>-20))h.state='toMarket';}

    if(tod===29)this.dayEnd();}
  fl(g,k,v){const f=this.fday[g]=this.fday[g]||{prod:0,cons:0,imp:0,exp:0};f[k]+=v;}
  dayStart(){this.day++;this.deskUsed={};this.fday={};
    for(const g of GOODS){const st=this.stalls[g];
      const perishable=PERISH.includes(g);
      for(let i=st.length-1;i>=0;i--){const s=st[i];
        if(perishable)s.price*=0.985;s.age=(s.age||0)+1;   // 生鮮は値下げして捌く。保存財は値持ち(投げ売る理由がない)
        // 3日売れ残ったら輸出台へ流す(端数は黙って本土行き=定常収入。信念ペナルティは生鮮のみ)
        if(s.age>=3&&s.hh instanceof HH&&P.EXP[g]!==undefined){
          const price=P.EXP[g],cap=P.EXP_CAP[g];
          const used=this.deskUsed['EXP'+g]||0;const can=Math.min(s.qty,Math.max(0,cap-used));
          if(can>1e-9){
            this.deskUsed['EXP'+g]=used+can;
            s.qty-=can;s.hh.purse+=can*price;s.hh.income30+=can*price;this.treasury-=can*price;
            this.co.expBuy+=can*price;
            if(perishable)s.hh.belief[g]=Math.max(s.hh.belief[g]*0.9,price);
            this.exported[g]=(this.exported[g]||0)+can;this.fl(g,'exp',can);
            const rev=can*P.EXP_ML[g];this.treasury+=rev;this.mainlandIn+=rev;this.co.expSell+=rev;}}
        if(s.hh instanceof HH&&perishable)s.hh.belief[g]=Math.min(s.hh.belief[g],s.price*1.05); // 売れない現実が信念を下げる(生鮮のみ)
        if(s.hh instanceof HH&&!perishable&&s.age>=6)s.hh.belief[g]*=0.97; // 保存財は撤収時に少しだけ学習
        if(s.age>=6&&s.hh instanceof HH&&g!=='fish'&&g!=='veg'){s.hh.pantry[g]+=s.qty;s.qty=0;
          if(P.EXP[g]===undefined&&!PERISH.includes(g))(s.hh.noSell=s.hh.noSell||{})[g]=this.day+15;} // 休業=保存が利いて台もない財(炭布鉄)のみ。生鮮(麦肉)は売り続ける——麦農家が15日ストに入り蔵に9万荷眠るバグの修正
        if(s.hh instanceof HH&&g==='salt'&&s.hh.job==='saltworks'){const floor=s.hh.belief.char*(P.SALT_CHAR/P.Y_SALT)*1.2;
          s.hh.belief.salt=Math.max(s.hh.belief.salt,floor);s.price=Math.max(s.price,floor);} // 原価割れの値付けはしない(売るより持つ)
        if(g==='fish'){const rot=s.qty/P.FISH_LIFE;s.qty-=rot;this.led.spoil.fish=(this.led.spoil.fish||0)+rot;}
        if(s.qty<0.5||s.price<0.05){          // 空/捨て値→撤収(残りは持ち主の帳尻へ)
          if(s.hh instanceof HH)s.hh.pantry[g]+=Math.max(0,s.qty);
          st.splice(i,1);}}}const d=this.day,m=Math.floor((d-1)/30)+1,mm=(m-1)%12+1;
    // 船(15日ごと): 未充足の区画へ移民を運ぶ(最大2世帯/便)
    if(d%15===0&&this.port){let n=0;
      for(const z of this.zones){if(z.filled||n>=2)continue;
        const h=new HH(z.job,z.x,z.y);h.px=this.port.x;h.py=this.port.y;h.state='arriving';
        this.hhs.push(h);this.mainlandIn+=h.purse;this.treasury-=P.PASSAGE;this.mainlandOut+=P.PASSAGE;this.outBy.pass+=P.PASSAGE;
        z.filled=true;n++;this.updRoads();}
      if(n>0)this.log(`入植船が着いた(${n}世帯)`);}
    // 建設の進行
    for(const h of this.hhs)if(h.state==='building'){h.buildDays--;
      if(h.buildDays<=0){h.state='home';this.log(`${h.job}#${h.id} 家が建った`);}}
  }
  produceTick(h,f){
    let stall=false;for(const g of GOODS){if(this.stalls[g].some(s=>s.hh===h)){stall=true;break;}}
    if(stall)f*=(h.members.length-1)/h.members.length;const d=this.day,m=Math.floor((d-1)/30)+1,mm=(m-1)%12+1;const winter=mm>=10;
    // 供給の自己調整: 職人は倉+自分の屋台残が日産10日分を超えたら手を止める(売れない山に投げ続けて信念崩落するのを防ぐ)
    const craftG={saltworks:'salt',woodshop:'tools',charburner:'char',quarryman:'stone',rapeseed:'oil',fisher2:'meal'}[h.job];
    if(craftG){const daily={salt:P.Y_SALT,tools:P.Y_TOOLS,char:P.Y_CHAR,stone:P.Y_STONE,oil:P.Y_OIL,meal:P.Y_FISH/P.MEAL_FISH}[craftG]*h.mult();
      const out=this.stalls[craftG].reduce((a,s)=>a+(s.hh===h?s.qty:0),0);
      if(h.pantry[craftG]+out>daily*5)return;}
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
    else if(h.job==='wheat'){h.wheatWork+=f;
      if(mm>=3&&mm<=8){const u=Math.min(h.pantry.meal,P.FERT_NEED*f);h.pantry.meal-=u;h.fert=(h.fert||0)+u;this.fl('meal','cons',u);}}
    else if(h.job==='woodshop'){const dep=this.grove/P.GROVE0;const q=P.Y_TOOLS*w*dep;
      this.grove=Math.min(P.GROVE0,this.grove-q*2+f*P.GROVE_R*this.grove*(1-dep));h.pantry.tools+=q;this.fl('tools','prod',q);}
    else if(h.job==='charburner'){const dep=this.grove/P.GROVE0;const q=P.Y_CHAR*w*dep;
      this.grove=Math.min(P.GROVE0,this.grove-q*1.0+f*P.GROVE_R*this.grove*(1-dep));h.pantry.char+=q;this.fl('char','prod',q);}
    else if(h.job==='saltworks'){const fuel=Math.min(P.SALT_CHAR*f,h.pantry.char);
      h.pantry.char-=fuel;h.pantry.salt+=P.Y_SALT*h.mult()*fuel/P.SALT_CHAR/1;this.fl('salt','prod',P.Y_SALT*h.mult()*fuel/P.SALT_CHAR);this.fl('char','cons',fuel);}}
  transact(h){const doleOn=this.goDay===null;
    // --- 売り: まず会社の買付台(輸出/御蔵/公費)・値が合わなければ屋台に置く ---
    const offers=this.sellOffers(h);
    for(const g in offers){let q=offers[g];
      const desks=[];
      if(P.EXP[g]!==undefined)desks.push(['EXP',P.EXP[g],P.EXP_CAP[g]]);
      if(g==='tools'&&this.pubLeft>0)desks.push(['PUB',1.8,this.pubLeft/1.8]);
      if(g==='stone'&&this.paving&&!this.paved)desks.push(['PAVE',1.4,1e9]);
      desks.sort((a,b)=>b[1]-a[1]);
      for(const[kind,price,cap]of desks){
        if(q<1e-9)break;
        if(price<h.belief[g]*0.98)continue;  // 信念未満の公的台には売らず屋台へ(公的買値の天井化=高い支払意思に物が回らない問題の修正)
        const used=this.deskUsed[kind+g]||0;const can=Math.min(q,Math.max(0,cap-used));
        if(can<1e-9)continue;
        this.deskUsed[kind+g]=used+can;
        h.pantry[g]-=can;h.purse+=can*price;h.income30+=can*price;
        this.treasury-=can*price;
        if(kind==='PUB')this.pubLeft-=can*price;
        if(kind==='GRAN')this.co.gran+=can*price;else if(kind==='PUB')this.co.pub+=can*price;else if(kind==='EXP')this.co.expBuy+=can*price;
        if(kind==='EXP'){this.exported[g]=(this.exported[g]||0)+can;this.fl(g,'exp',can);
          const rev=can*P.EXP_ML[g];this.treasury+=rev;this.mainlandIn+=rev;this.co.expSell+=rev;}
        else if(kind==='GRAN')this.granary[g]=(this.granary[g]||0)+can;
        else if(kind==='PAVE')this.paveBought+=can;
        else this.pubworksBought=(this.pubworksBought||0)+can;
        h.belief[g]+=(price-h.belief[g])*0.1;q-=can;}
      if(q>1e-9){ // 屋台に出す(店番=家族が残る扱い。委託中は生産効率減)
        h.pantry[g]-=q;
        const jit=PERISH.includes(g)?(1.0+this.rng()*0.1):(0.85+this.rng()*0.3); // 保存財は±15%の探索的値付け
        const base=PERISH.includes(g)?h.belief[g]:Math.max(h.belief[g],(h.bestSale?.[g]?.[0]||0)*0.9); // 最良成約の記憶(季節の谷で信念が沈んでも冬値を忘れない)
        this.stalls[g].push({hh:h,qty:q,price:base*jit,age:0});}}
    // --- 買い: 安い屋台(+会社の輸入棚)から。持ち帰り容量まで ---
    let cap=h.haul();
    const targets=this.buyTargets(h);
    const doleOrder=['salt','char','tools','cloth','iron','meal','stone','oil','fish','veg','wheat','pres','meat'].filter(g=>targets[g]);
    for(const g of(doleOn?doleOrder:Object.keys(targets))){
      let[want,ceil]=targets[g];want=Math.min(want,cap);
      const shelves=[...this.stalls[g]];
      if(P.IMP[g]!==undefined)shelves.push({hh:'CO',qty:1e9,price:P.IMP[g]});
      shelves.sort((a,b)=>a.price-b.price); // 輸入棚も価格競争に参加=輸入パリティが真の天井になる
      const isInput=(h.job==='saltworks'&&g==='char')||(h.job==='fisher'&&(g==='salt'||g==='char'))||(h.job==='veg'&&g==='salt')||((h.job==='wheat'||h.job==='rapeseed')&&g==='meal');
      for(const s of shelves){if(want<1e-9)break;
        if(s.price>ceil||s.price<=0)continue;
        const q=Math.min(want,s.qty,(h.purse+(isInput?30:0))/s.price); // 仕入れは-30まで信用買い(前貸し)
        if(q<1e-9)continue;
        h.purse-=q*s.price;h.pantry[g]+=q;want-=q;cap-=q;
        h.belief[g]+=(s.price-h.belief[g])*0.2;
        if(s.hh==='CO'){this.treasury+=q*s.price;
          const c=q*(P.IMP_COST[g]??P.IMP[g]*0.7);this.treasury-=c;this.mainlandOut+=c;
          this.co.impMargin+=q*s.price-c;this.fl(g,'imp',q);
          this.outBy['imp_'+g]=(this.outBy['imp_'+g]||0)+(c-q*s.price);
          this.imported[g]=(this.imported[g]||0)+q;}
        else if(s.hh==='GRANSELL'){this.treasury+=q*s.price;this.granary[g]-=q;s.qty-=q;}
        else{s.qty-=q;s.hh.purse+=q*s.price;s.hh.income30+=q*s.price;
          if(PERISH.includes(g))s.hh.belief[g]+=(s.price-s.hh.belief[g])*0.1;
          else{if(s.price>s.hh.belief[g])s.hh.belief[g]+=(s.price-s.hh.belief[g])*0.25; // 高札の成約だけ強く学ぶ(安札から売れる選択バイアス対策)
            const bs=s.hh.bestSale=s.hh.bestSale||{};if(!bs[g]||s.price>bs[g][0]||this.day-bs[g][1]>120)bs[g]=[s.price,this.day];}}
        (this.prices[g]=this.prices[g]||[]).push([this.day,s.price,q]);}
      if(want>1e-6&&targets[g])h.belief[g]=Math.min(h.belief[g]*1.04,12);}}
  marketSessionOld(){const d=this.day,m=Math.floor((d-1)/30)+1;
    const doleOn=this.goDay===null;
    const here=this.hhs.filter(h=>h.state==='atMarket');
    for(const h of here)h._cap=h.haul();   // 持ち帰り容量=同行の家族の手
    const order=doleOn?['salt','char','tools','cloth','iron','fish','veg','wheat','pres','pick','meat']:GOODS;
    for(const g of order){const bids=[],asks=[];
      for(const h of here){const tgt=this.buyTargets(h)[g];
        if(tgt){let[qty,ceil]=tgt;const price=Math.min(h.belief[g]*(0.95+this.rng()*0.2),ceil);
          qty=Math.min(qty,price>0?h.purse*0.9/price:0);
          if(qty>1e-9&&price>1e-9)bids.push([h,qty,price]);}
        const sq=this.sellOffers(h)[g]||0;
        if(sq>1e-9){asks.push([h,sq,h.belief[g]*(0.95+this.rng()*0.15)]);h.unsold.add(g);}}
      if(P.IMP[g])asks.push(['CO',1e9,P.IMP[g]]);
      if(P.EXP[g])bids.push(['EXP',P.EXP_CAP[g],P.EXP[g]]);
      if(g==='tools'&&this.pub>0)bids.push(['PUB',this.pub/3.4,1.8]);
      if(g==='stone'&&this.paving&&!this.paved)bids.push(['PAVE',5,1.4]);
      if(P.GRAN_BID[g]&&doleOn)bids.push(['GRAN',Math.max(5,this.doleRate),P.GRAN_BID[g]]);
      const pre={},want={};for(const[b,q]of bids.map(x=>[x[0],x[1]]))if(b instanceof HH){pre[b.id]=b.pantry[g];want[b.id]=q;}
      const[pr,vol]=this.clear(g,bids,asks);
      for(const h of here)if(want[h.id]>1e-6&&h.pantry[g]-pre[h.id]<want[h.id]*0.3)
        h.belief[g]=Math.min(h.belief[g]*1.04,12);
      if(this.unfilled!==null){const myG={fisher:'fish',veg:'veg',wheat:'wheat',shepherd:'meat',woodshop:'tools',charburner:'char',saltworks:'salt'};
        for(const h of here)if(myG[h.job]===g&&this.unfilled>h.belief[g])h.belief[g]+=(this.unfilled-h.belief[g])*0.1;}
      if(vol>1e-9)(this.prices[g]=this.prices[g]||[]).push([d,pr,vol]);}
    for(const h of here){for(const g of h.unsold)h.belief[g]*=0.98;h.unsold.clear();h.state='toHome';}
  }
  dayEnd(){const d=this.day,m=Math.floor((d-1)/30)+1,mm=(m-1)%12+1;
    const doleOn=this.goDay===null;
    if(mm===9&&d%30===15)for(const h of this.hhs)if(h.job==='wheat'){
      const fill=Math.min(1,(h.fert||0)/(P.FERT_NEED*180));
      {const hv=P.Y_WHEAT*h.mult()*Math.min(1,h.wheatWork/300)*(1+P.FERT_BOOST*fill);h.pantry.wheat+=hv;this.led.prod.wheat=(this.led.prod.wheat||0)+hv;this.fl('wheat','prod',hv);(this.harvestLog=this.harvestLog||[]).push([d,hv]);}
      if(fill>0.05)this.log(`麦畑#${h.id} 施肥${Math.round(fill*100)}%→+${Math.round(P.FERT_BOOST*fill*100)}%`);
      h.wheatWork=0;h.fert=0;}
    // 配給
    if(doleOn){let doleToday=0;
      for(const h of this.hhs){const fd=FOODS.reduce((s,g)=>s+h.pantry[g],0)/P.EAT;
        if(fd<1){let q=h.eat()*P.DOLE_RATION;
          for(const g of['wheat','pres']){const u=Math.min(this.granary[g],q);this.granary[g]-=u;q-=u;h.pantry[g]+=u;doleToday+=u;}
          // 地元調達: 輸入パリティ以下の屋台から買う(村に金が落ちる。売り手が配給対象自身でも可=買い上げ)
          for(const g of['wheat','pres','veg','meat']){if(q<1e-9)break;
            for(const s of[...this.stalls[g]].sort((a,b)=>a.price-b.price)){if(q<1e-9)break;
              if(!(s.hh instanceof HH)||s.price>P.IMP_COST.wheat*1.3)continue;
              const u=Math.min(s.qty,q);if(u<1e-9)continue;
              s.qty-=u;q-=u;h.pantry[g]+=u;doleToday+=u;
              const c=u*s.price;s.hh.purse+=c;s.hh.income30+=c;this.treasury-=c;this.co.gran+=c;this.led.dole+=u;}}
          if(q>1e-9){const c=q*P.IMP_COST.wheat;this.treasury-=c;this.mainlandOut+=c;this.outBy.dole+=c;this.led.dole+=q;this.co.doleC+=c;
            h.pantry.wheat+=q;doleToday+=q;this.fl('wheat','imp',q);}}}
      this.doleQty+=doleToday;this.doleRate+=(doleToday-this.doleRate)*0.1;}
    // 食事
    for(const h of this.hhs){let need=h.eat();this.led.need+=need;const kinds=new Set();
      for(const g of['pres','wheat','pick']){const u=Math.min(h.pantry[g],need*P.RATION*0.85);
        h.pantry[g]-=u;need-=u;if(u>1e-9){kinds.add(KIND[g]);this.led.eat[g]=(this.led.eat[g]||0)+u;}}
      for(let i=0;i<2;i++){const act=['fish','veg','meat'].filter(g=>h.pantry[g]>1e-9);
        if(!act.length||need<=1e-9)break;const share=need/act.length;
        for(const g of act){const u=Math.min(h.pantry[g],share);h.pantry[g]-=u;need-=u;if(u>1e-9){kinds.add(KIND[g]);this.led.eat[g]=(this.led.eat[g]||0)+u;this.fl(g,'cons',u);}}}
      for(const g of['pres','wheat','pick']){if(need<=1e-9)break;
        const u=Math.min(h.pantry[g],need);h.pantry[g]-=u;need-=u;if(u>1e-9){kinds.add(KIND[g]);this.led.eat[g]=(this.led.eat[g]||0)+u;this.fl(g,'cons',u);}}
      const hgy=need>0.5;if(hgy){h.hunger++;this.famine++;h.hungerRun=(h.hungerRun||0)+1;}else h.hungerRun=0;
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
          else if(h.purse<0){this.treasury+=h.purse;h.purse=0;} // 信用買いの借りは会社の貸し倒れ
          this.hhs.splice(this.hhs.indexOf(h),1);}}
      h.kindLog.push([d,[...kinds]]);for(const k of kinds)h.kindDays[k]=(h.kindDays[k]||0)+1;
      while(h.kindLog.length&&h.kindLog[0][0]<=d-45){for(const k of h.kindLog[0][1])h.kindDays[k]--;h.kindLog.shift();}
      // 文化消費+保存加工
      const sat={};const mmW=(Math.floor((d-1)/30))%12+1;const chMul=mmW>=10||mmW<=2?2.0:0.6;
      for(const[g,dd0]of[['tools',P.D_TOOL],['salt',P.D_SALT],['char',P.D_CHAR*chMul],['cloth',P.D_CLOTH],['iron',P.D_IRON]]){const dd=dd0;
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
      h.incomeLog.push(h.income30);h.income30=0;if(h.incomeLog.length>30)h.incomeLog.shift();}
    if(this.paving&&!this.paved&&this.paveBought>=P.PAVE_STONE){this.paved=true;
      P.ROAD_F=P.PAVE_ROAD_F;this.log('★石畳完成——全ての道が格上げ(0.6→0.45・永続)');}
    // 分家(90日ごと・繁栄+自立ゲート・観測所得で職選び)
    if(d%90===0&&this.hhs.length>=8&&this.goDay===null){
      const parent=this.hhs.reduce((a,b)=>a.purse>b.purse?a:b);
      const fed=this.doleRate<this.hhs.length*9*0.05;
      if(parent.purse>=900&&fed){const inc={};
        for(const h of this.hhs)(inc[h.job]=inc[h.job]||[]).push(h.incomeLog.reduce((a,b)=>a+b,0));
        let best=null,bv=-1;for(const j in inc){const v=inc[j].reduce((a,b)=>a+b,0)/inc[j].length;if(v>bv){bv=v;best=j;}}
        if(best){const src=this.hhs.filter(h=>h.job===best).reduce((a,b)=>a.purse>b.purse?a:b);
          const dowry=Math.min(300,parent.purse*0.3);parent.purse-=dowry;
          const nh=new HH(best,src.x+(this.rng()-0.5)*3,src.y+(this.rng()-0.5)*3);
          nh.purse=dowry;this.hhs.push(nh);this.updRoads();
          this.log(`分家: ${best}(持参金${Math.round(dowry)})`);}}}
    // 破綻転職(飢え40/180日+1年クールダウン)
    if(d%30===0){for(const h of this.hhs){
      h.hungerHist=(h.hungerHist||[]);
      if(h.hungerHist.length>180)h.hungerHist.splice(0,h.hungerHist.length-180);
      const distress=h.hungerHist.reduce((a,b)=>a+b,0)>=P.DISTRESS;
      if(distress&&d-(h.lastSwitch||-9e9)>=P.COOLDOWN&&this.rng()<0.5){
        const inc={};for(const x of this.hhs)(inc[x.job]=inc[x.job]||[]).push(x.incomeLog.reduce((a,b)=>a+b,0));
        let best=null,bv=-1;for(const j in inc){const v=inc[j].reduce((a,b)=>a+b,0)/inc[j].length;if(v>bv){bv=v;best=j;}}
        if(best&&best!==h.job){this.log(`破綻転職: ${h.job}#${h.id}→${best}`);
          h.job=best;h.lv=Math.min(h.lv,1);h.lastSwitch=d;h.hungerHist=[];}}}}
    // 公費の既定テーパー(標準プレイの模写・UIで上書き可)
    if(d%30===1){if(m===26)this.pub=Math.min(this.pub,60);if(m===34)this.pub=Math.min(this.pub,20);
      if(this.doleRate<this.pop()*0.06&&m>12)this.pub=Math.min(this.pub,10);this.pubLeft=this.pub;}
    // 財政(月末)
    if(d%30===0){
      if(this.treasury<P.BAIL_TRIG&&this.bailouts<P.BAIL_N&&this.goDay===null){
        this.bailouts++;this.treasury+=P.BAIL_AMT;this.mainlandIn+=P.BAIL_AMT;
        const gr=['「これが最後と思いなさい」','「株主にどう説明しろと…」','「次はもう無い。肝に銘じよ」'][Math.min(this.bailouts-1,2)];
        this.log(`★本国の追加支援#${this.bailouts} +${P.BAIL_AMT} ${gr}`);}
      const debt=Math.max(0,-this.treasury);
      if(m>P.FREE_M&&debt>0){const i=debt*P.IRATE;this.treasury-=i;this.mainlandOut+=i;}
      if(this.goDay===null&&-this.treasury>this.limit()){this.goDay=d;
        this.log(`★破産(債務${Math.round(-this.treasury)}>限度${Math.round(this.limit())})——最終通告。配給停止`);}}
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
