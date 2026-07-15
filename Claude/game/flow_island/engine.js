// 流通の島 v0 エンジン (spatial/engine.py の較正値を移植・ブラウザ/Node両用)
export const GOODS = ['fish','veg','wheat','pres','tools','salt','char','meat','meal','stone','oil'];
export const FOODS = ['fish','veg','wheat','pres','meat'];
const KIND = {fish:'fish',veg:'veg',wheat:'wheat',pres:'fish',meat:'meat'};
export const P = {
  EAT:9, PANTRY_FOOD_D:6, CULT_D:240, RATION:0.15,
  Y_FISH:13, Y_FISH_W:3.2, FISH_LIFE:3, Y_VEG:10, Y_WHEAT:1600, Y_TOOLS:5, Y_CHAR:1.8, Y_SALT:12, Y_MEAT:16,
  SALT_CHAR:1, PR_SALT:0.6, PR_SMOKE:0.95, SMOKE_CHAR:0.1, PRES_SALT:0.125,
  D_TOOL:0.2, D_SALT:0.06, D_CHAR:0.12, LV_MULT:1.585, UP_DAYS:45, DOWN_DAYS:60,
  TRAVEL_RATE:0.016, ROAD_F:0.6, TRAVEL_MAX:0.7, HAUL:40,
  IMP:{wheat:2.0,tools:3.5,salt:3.0}, IMP_COST:{wheat:1.0,tools:2.5,salt:2.0},
  EXP:{pres:0.8,tools:1.5,stone:0.6,oil:3.2}, EXP_CAP:{pres:25,tools:20,stone:15,oil:12}, EXP_ML:{pres:1.3,tools:2.0,stone:0.9,oil:4.0},
  PUB0:200, DOLE_RATION:1.1, GRAN_BID:{wheat:1.9,pres:1.7,salt:1.8,char:1.2},  // 塩=公共備蓄の要・炭=冬の救恤燃料(通貨の入口を広げ相互貧困デッドロックを解く)
  FREE_M:42, IRATE:0.012, LIMIT0:34000, LIMIT_G:2000, LIMIT_FREEZE:24, LIMIT_PC:400,
  BAIL_N:3, BAIL_TRIG:-2000, BAIL_AMT:8000, TREASURY0:3000, PURSE0:60, PASSAGE:60,
  SHIP_COST:8000, SHIP_CAP:2, SHIP_PRICE:1.2,
  BAY0:600000, BAY_R:0.00175, RESEED:0.3, GROVE0:60000, GROVE_R:0.0006,
  MEAL_FISH:8, FERT_NEED:3, FERT_BOOST:0.15, Y_STONE:3, Y_OIL:2.5,
  PAVE_STONE:200, PAVE_ROAD_F:0.45, DISTRESS:40, COOLDOWN:360,
  BELIEF0:{fish:1,veg:1,wheat:1.2,pres:1.2,tools:2,salt:2,char:1.5,meat:1.3,meal:1,stone:1,oil:3},
};
export const LADDER={farm:['food1','tools','salt','food2','char'],fish:['grain','tools','salt','char','food2'],
  lumber:['food1','tools','food2','salt','char'],artisan:['food1','food2','salt','char']};
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
    this.px=x;this.py=y;this.state='home';this.cargo=null;this.buildDays=0;}
  mult(){return Math.pow(P.LV_MULT,this.lv);}
  eat(){return this.members.length;}
  haul(){return this.members.length*4;}   // 1人1荷(荷=4食分)×家族
  cls(){return JOBCLS[this.job];}
}
export class World{
  constructor(seed=11){this.rng=mulberry(seed);HID=0;this.hhs=[];this.day=0;this.treasury=P.TREASURY0;
    this.bay=P.BAY0;this.bay2=P.BAY0;this.grove=P.GROVE0;this.paving=false;this.paved=false;this.granary={wheat:0,pres:0};this.doleRate=10;this.doleQty=0;
    this.bailouts=0;this.goDay=null;this.shipping=false;this.pub=P.PUB0;this.famine=0;
    this.mainlandIn=0;this.mainlandOut=0;this.imported={};this.exported={};this.events=[];this.prices={};
    this.market={x:0,y:0};this.roadTiles=new Set();this.money0=P.TREASURY0;this.paveBought=0;
    this.zones=[];this.port=null;this.t=0;this.flow=null;this.terrCost=null;this.MW=48;this.MH=40;
    this.stalls={};for(const g of GOODS)this.stalls[g]=[];
    this.deskUsed={};}
  setTerrain(terr){this.terr=terr;}
  tileCost(x,y){if(x<0||y<0||x>=this.MW||y>=this.MH)return Infinity;
    if(this.terr&&this.terr[y][x]==='water')return Infinity;
    if(this.roadTiles.has(x+','+y))return this.paved?0.45:0.6;
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
  stepToMarket(h){if(!this.flow)this.buildFlow();const W=this.MW;
    const x=Math.round(h.px),y=Math.round(h.py);
    let bx=x,by=y,bd=this.flow[y*W+x];
    for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1]]){
      const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=W||ny>=this.MH)continue;
      const d=this.flow[ny*W+nx];if(d<bd){bd=d;bx=nx;by=ny;}}
    const sp=1/Math.max(0.45,this.tileCost(x,y));
    h.px+=(bx-h.px)*Math.min(1,sp*0.9);h.py+=(by-h.py)*Math.min(1,sp*0.9);
    return Math.hypot(h.px-this.market.x,h.py-this.market.y)<1.2;}
  stepTo(h,tx,ty){const d=Math.hypot(tx-h.px,ty-h.py);if(d<0.8)return true;
    h.px+=(tx-h.px)/d*0.8;h.py+=(ty-h.py)/d*0.8;return false;}
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
    const tgtD=doleOn?2:P.PANTRY_FOOD_D;
    if(foodDays<tgtD){const starving=foodDays<1.5;
      for(const g of['veg','wheat','pres'])
        t[g]=[(tgtD-foodDays)*P.EAT/3,starving?99:Math.min(h.belief[g]*1.5,cheapest*2.2)];}
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
    if(h.job==='fisher'){if(h.pantry.salt<3)t.salt=[6-h.pantry.salt,h.belief.pres*P.PR_SALT/P.PRES_SALT*0.5];
      if(h.pantry.char<2)t.char=[4-h.pantry.char,(P.PR_SMOKE-P.PR_SALT)*h.belief.pres/P.SMOKE_CHAR*0.5];}
    // 依存期(配給中)は文化財を溜め込まない(60日分)。240日分を輸入で買うと開幕の
    // 手持ちが即座に会社へ吸われ、市中から通貨が消える(財布ゼロ問題の主因)
    const cd=(this.goDay===null&&this.doleRate>0.5)?60:P.CULT_D;
    for(const[g,dd,val]of[['tools',P.D_TOOL,2.5],['salt',P.D_SALT,2.5],['char',P.D_CHAR,2.0]]){
      if(t[g])continue;
      if(h.pantry[g]<dd*cd*0.5)t[g]=[dd*cd-h.pantry[g],val];}
    return t;}
  sellOffers(h){const out={};const doleOn=this.goDay===null;
    const my={fisher:'fish',veg:'veg',wheat:'wheat',shepherd:'meat',woodshop:'tools',charburner:'char',saltworks:'salt',fisher2:'meal',quarryman:'stone',rapeseed:'oil'}[h.job];
    if(my==='meal'){if(h.pantry.meal>=15)return{meal:Math.min(h.pantry.meal,P.HAUL)};return{};}
    if(my==='fish'){let keep=P.EAT;
      const alt=Math.min(h.belief.veg,h.belief.wheat,h.belief.pres);
      if(h.belief.fish>alt*1.5)keep=P.EAT*0.3;
      const s=Math.max(0,h.pantry.fish-keep);if(s>1e-9)out.fish=Math.min(s,h.haul());}
    else{let keep=FOODS.includes(my)?P.EAT*2:2,rate=0.5;
      if(my==='wheat'){rate=doleOn?0.1:0.04;if(doleOn)keep=P.EAT*P.RATION*10;}
      if(my==='veg'&&doleOn)keep=P.EAT*P.RATION*10;
      const s=Math.max(0,h.pantry[my]-keep);if(s>1e-9)out[my]=Math.min(s*rate+2,s,h.haul());}
    if(h.job==='fisher'&&h.pantry.pres>P.EAT*P.PANTRY_FOOD_D)
      out.pres=Math.min(h.pantry.pres-P.EAT*P.PANTRY_FOOD_D,h.haul());
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
      if(offers.fish>0||sellSum>=10||fd<fdThr||(lowCult&&h.purse>15)||(inputLow&&h.purse>5))h.state='toMarket';}

    if(tod===29)this.dayEnd();}
  dayStart(){this.day++;this.deskUsed={};
    for(const g of GOODS){const st=this.stalls[g];
      for(let i=st.length-1;i>=0;i--){const s=st[i];
        s.price*=0.985;                       // 売れ残りは徐々に値下げ(店番の判断)
        if(g==='fish'){const rot=s.qty/P.FISH_LIFE;s.qty-=rot;}
        if(s.qty<0.5||s.price<0.05){          // 空/捨て値→撤収(残りは持ち主の帳尻へ)
          if(s.hh instanceof HH)s.hh.pantry[g]+=Math.max(0,s.qty);
          st.splice(i,1);}}}const d=this.day,m=Math.floor((d-1)/30)+1,mm=(m-1)%12+1;
    // 船(15日ごと): 未充足の区画へ移民を運ぶ(最大2世帯/便)
    if(d%15===0&&this.port){let n=0;
      for(const z of this.zones){if(z.filled||n>=2)continue;
        const h=new HH(z.job,z.x,z.y);h.px=this.port.x;h.py=this.port.y;h.state='arriving';
        this.hhs.push(h);this.mainlandIn+=h.purse;this.treasury-=P.PASSAGE;this.mainlandOut+=P.PASSAGE;
        z.filled=true;n++;this.updRoads();}
      if(n>0)this.log(`入植船が着いた(${n}世帯)`);}
    // 建設の進行
    for(const h of this.hhs)if(h.state==='building'){h.buildDays--;
      if(h.buildDays<=0){h.state='home';this.log(`${h.job}#${h.id} 家が建った`);}}
  }
  produceTick(h,f){
    let stall=false;for(const g of GOODS){if(this.stalls[g].some(s=>s.hh===h)){stall=true;break;}}
    if(stall)f*=(h.members.length-1)/h.members.length;const d=this.day,m=Math.floor((d-1)/30)+1,mm=(m-1)%12+1;const winter=mm>=10;
    const w=f*h.mult();
    if(h.job==='fisher2'){const dep=this.bay2/P.BAY0;
      if(!winter){const q=P.Y_FISH*w*dep;
        this.bay2=Math.min(P.BAY0,this.bay2-q+f*(P.BAY_R*this.bay2*(1-dep)+P.RESEED*(1-dep)));
        h.pantry.meal+=q/P.MEAL_FISH;}}
    else if(h.job==='quarryman')h.pantry.stone+=P.Y_STONE*w;
    else if(h.job==='rapeseed'){if(mm>=3&&mm<=8){const u=Math.min(h.pantry.meal,P.FERT_NEED*f);h.pantry.meal-=u;h.fert=(h.fert||0)+u;
        const fill=Math.min(1,(h.fert||0)/Math.max(1,P.FERT_NEED*(mm-2)*30));
        h.pantry.oil+=P.Y_OIL*w*(1+P.FERT_BOOST*fill);}}
    else if(h.job==='fisher'){const dep=this.bay/P.BAY0;
      const q=(winter?P.Y_FISH_W:P.Y_FISH)*w*dep;
      this.bay=Math.min(P.BAY0,this.bay-q+f*(P.BAY_R*this.bay*(1-dep)+P.RESEED*(1-dep)));
      h.pantry.fish+=q;}
    else if(h.job==='veg'&&mm>=3&&mm<=10)h.pantry.veg+=P.Y_VEG*w;
    else if(h.job==='shepherd')h.pantry.meat+=P.Y_MEAT*w;
    else if(h.job==='wheat'){h.wheatWork+=f;
      if(mm>=3&&mm<=8){const u=Math.min(h.pantry.meal,P.FERT_NEED*f);h.pantry.meal-=u;h.fert=(h.fert||0)+u;}}
    else if(h.job==='woodshop'){const dep=this.grove/P.GROVE0;const q=P.Y_TOOLS*w*dep;
      this.grove=Math.min(P.GROVE0,this.grove-q*2+f*P.GROVE_R*this.grove*(1-dep));h.pantry.tools+=q;}
    else if(h.job==='charburner'){const dep=this.grove/P.GROVE0;const q=P.Y_CHAR*w*dep;
      this.grove=Math.min(P.GROVE0,this.grove-q*1.5+f*P.GROVE_R*this.grove*(1-dep));h.pantry.char+=q;}
    else if(h.job==='saltworks'){const fuel=Math.min(P.SALT_CHAR*f,h.pantry.char);
      h.pantry.char-=fuel;h.pantry.salt+=P.Y_SALT*h.mult()*fuel/P.SALT_CHAR/1;}}
  transact(h){const doleOn=this.goDay===null;
    // --- 売り: まず会社の買付台(輸出/御蔵/公費)・値が合わなければ屋台に置く ---
    const offers=this.sellOffers(h);
    for(const g in offers){let q=offers[g];
      const desks=[];
      if(P.EXP[g]!==undefined)desks.push(['EXP',P.EXP[g],P.EXP_CAP[g]]);
      if(P.GRAN_BID[g]&&doleOn&&(this.granary[g]||0)<300)desks.push(['GRAN',P.GRAN_BID[g],Math.max(10,this.doleRate)]);  // 備蓄目標300で買い止め
      if(g==='tools'&&this.pub>0)desks.push(['PUB',P.PUB===0?0:1.8,this.pub/1.8]);
      if(g==='stone'&&this.paving&&!this.paved)desks.push(['PAVE',1.4,1e9]);
      desks.sort((a,b)=>b[1]-a[1]);
      for(const[kind,price,cap]of desks){
        if(q<1e-9)break;
        if(price<h.belief[g]*0.8)continue;   // 安すぎる台には売らない
        const used=this.deskUsed[kind+g]||0;const can=Math.min(q,Math.max(0,cap-used));
        if(can<1e-9)continue;
        this.deskUsed[kind+g]=used+can;
        h.pantry[g]-=can;h.purse+=can*price;h.income30+=can*price;
        this.treasury-=can*price;
        if(kind==='EXP'){this.exported[g]=(this.exported[g]||0)+can;
          const rev=can*P.EXP_ML[g];this.treasury+=rev;this.mainlandIn+=rev;}
        else if(kind==='GRAN')this.granary[g]=(this.granary[g]||0)+can;
        else if(kind==='PAVE')this.paveBought+=can;
        else this.pubworksBought=(this.pubworksBought||0)+can;
        h.belief[g]+=(price-h.belief[g])*0.1;q-=can;}
      if(q>1e-9){ // 屋台に出す(店番=家族が残る扱い。委託中は生産効率減)
        h.pantry[g]-=q;
        this.stalls[g].push({hh:h,qty:q,price:h.belief[g]*(1.0+this.rng()*0.1)});}}
    // --- 買い: 安い屋台(+会社の輸入棚)から。持ち帰り容量まで ---
    let cap=h.haul();
    const targets=this.buyTargets(h);
    const doleOrder=['salt','char','tools','cloth','iron','meal','stone','oil','fish','veg','wheat','pres','meat'].filter(g=>targets[g]);
    for(const g of(doleOn?doleOrder:Object.keys(targets))){
      let[want,ceil]=targets[g];want=Math.min(want,cap);
      const shelves=[...this.stalls[g]].sort((a,b)=>a.price-b.price);
      if(P.IMP[g]!==undefined)shelves.push({hh:'CO',qty:1e9,price:P.IMP[g]});
      for(const s of shelves){if(want<1e-9)break;
        if(s.price>ceil||s.price<=0)continue;
        const q=Math.min(want,s.qty,h.purse/s.price);
        if(q<1e-9)continue;
        h.purse-=q*s.price;h.pantry[g]+=q;want-=q;cap-=q;
        h.belief[g]+=(s.price-h.belief[g])*0.2;
        if(s.hh==='CO'){this.treasury+=q*s.price;
          const c=q*(P.IMP_COST[g]??P.IMP[g]*0.7);this.treasury-=c;this.mainlandOut+=c;
          this.imported[g]=(this.imported[g]||0)+q;}
        else{s.qty-=q;s.hh.purse+=q*s.price;s.hh.income30+=q*s.price;
          s.hh.belief[g]+=(s.price-s.hh.belief[g])*0.1;}
        (this.prices[g]=this.prices[g]||[]).push([this.day,s.price,q]);}
      if(want>1e-6&&targets[g])h.belief[g]=Math.min(h.belief[g]*1.04,12);}}
  marketSessionOld(){const d=this.day,m=Math.floor((d-1)/30)+1;
    const doleOn=this.goDay===null;
    const here=this.hhs.filter(h=>h.state==='atMarket');
    for(const h of here)h._cap=h.haul();   // 持ち帰り容量=同行の家族の手
    const order=doleOn?['salt','char','tools','fish','veg','wheat','pres','meat']:GOODS;
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
      h.pantry.wheat+=P.Y_WHEAT*h.mult()*Math.min(1,h.wheatWork/300)*(1+P.FERT_BOOST*fill);
      if(fill>0.05)this.log(`麦畑#${h.id} 施肥${Math.round(fill*100)}%→+${Math.round(P.FERT_BOOST*fill*100)}%`);
      h.wheatWork=0;h.fert=0;}
    // 配給
    if(doleOn){let doleToday=0;
      for(const h of this.hhs){const fd=FOODS.reduce((s,g)=>s+h.pantry[g],0)/P.EAT;
        if(fd<1){let q=h.eat()*P.DOLE_RATION;
          for(const g of['wheat','pres']){const u=Math.min(this.granary[g],q);this.granary[g]-=u;q-=u;h.pantry[g]+=u;doleToday+=u;}
          if(q>1e-9){const c=q*P.IMP_COST.wheat;this.treasury-=c;this.mainlandOut+=c;
            h.pantry.wheat+=q;doleToday+=q;}}}
      this.doleQty+=doleToday;this.doleRate+=(doleToday-this.doleRate)*0.1;}
    // 食事
    for(const h of this.hhs){let need=h.eat();const kinds=new Set();
      for(const g of['pres','wheat']){const u=Math.min(h.pantry[g],need*P.RATION);
        h.pantry[g]-=u;need-=u;if(u>1e-9)kinds.add(KIND[g]);}
      for(let i=0;i<2;i++){const act=['fish','veg','meat'].filter(g=>h.pantry[g]>1e-9);
        if(!act.length||need<=1e-9)break;const share=need/act.length;
        for(const g of act){const u=Math.min(h.pantry[g],share);h.pantry[g]-=u;need-=u;if(u>1e-9)kinds.add(KIND[g]);}}
      for(const g of['pres','wheat']){if(need<=1e-9)break;
        const u=Math.min(h.pantry[g],need);h.pantry[g]-=u;need-=u;if(u>1e-9)kinds.add(KIND[g]);}
      const hgy=need>0.5;if(hgy){h.hunger++;this.famine++;}(h.hungerHist=h.hungerHist||[]).push(hgy?1:0);
      h.kindLog.push([d,[...kinds]]);for(const k of kinds)h.kindDays[k]=(h.kindDays[k]||0)+1;
      while(h.kindLog.length&&h.kindLog[0][0]<=d-45){for(const k of h.kindLog[0][1])h.kindDays[k]--;h.kindLog.shift();}
      // 文化消費+保存加工
      const sat={};for(const[g,dd]of[['tools',P.D_TOOL],['salt',P.D_SALT],['char',P.D_CHAR]]){
        const u=Math.min(h.pantry[g],dd);h.pantry[g]-=u;sat[g]=u>=dd*0.95;}
      const kd=h.kindDays;sat.food1=Object.values(kd).some(v=>v>0);
      sat.food2=Object.values(kd).filter(v=>v>5).length>=2;
      sat.grain=(kd.wheat||0)>5;
      if(h.job==='fisher'&&h.pantry.fish>1e-9){
        const raw=Math.min(h.pantry.fish,h.pantry.salt/P.PRES_SALT);
        const smoked=Math.min(raw,h.pantry.char/P.SMOKE_CHAR);
        h.pantry.fish-=raw;h.pantry.salt-=raw*P.PRES_SALT;h.pantry.char-=smoked*P.SMOKE_CHAR;
        h.pantry.pres+=smoked*P.PR_SMOKE+(raw-smoked)*P.PR_SALT;}
      {const rot=h.pantry.fish/P.FISH_LIFE;h.pantry.fish-=rot;}
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
    if(d%30===1){if(m===26)this.pub=Math.min(this.pub,100);if(m===34)this.pub=Math.min(this.pub,40);}
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
    // 貨幣保存則
    const total=this.treasury+this.hhs.reduce((s,h)=>s+h.purse,0);
    const drift=total-this.money0-(this.mainlandIn-this.mainlandOut);
    if(Math.abs(drift)>1e-4)throw new Error(`貨幣保存則違反 drift=${drift} day=${d}`);}
}
