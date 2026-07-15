// 流通の島 v0 エンジン (spatial/engine.py の較正値を移植・ブラウザ/Node両用)
export const GOODS = ['fish','veg','wheat','pres','tools','salt','char','meat'];
export const FOODS = ['fish','veg','wheat','pres','meat'];
const KIND = {fish:'fish',veg:'veg',wheat:'wheat',pres:'fish',meat:'meat'};
export const P = {
  EAT:9, PANTRY_FOOD_D:6, CULT_D:240, RATION:0.15,
  Y_FISH:13, Y_FISH_W:3.2, Y_VEG:10, Y_WHEAT:1600, Y_TOOLS:5, Y_CHAR:1.8, Y_SALT:12, Y_MEAT:8,
  SALT_CHAR:1, PR_SALT:0.6, PR_SMOKE:0.95, SMOKE_CHAR:0.1, PRES_SALT:0.125,
  D_TOOL:0.2, D_SALT:0.06, D_CHAR:0.12, LV_MULT:1.585, UP_DAYS:45, DOWN_DAYS:60,
  TRAVEL_RATE:0.016, ROAD_F:0.6, TRAVEL_MAX:0.7, HAUL:40,
  IMP:{wheat:2.0,tools:3.5,salt:3.0}, IMP_COST:{wheat:1.0,tools:2.5,salt:2.0},
  EXP:{pres:0.8,tools:1.5}, EXP_CAP:{pres:25,tools:20}, EXP_ML:{pres:1.3,tools:2.0},
  PUB0:200, DOLE_RATION:1.1, GRAN_BID:{wheat:1.9,pres:1.7},
  FREE_M:42, IRATE:0.012, LIMIT0:34000, LIMIT_G:2000, LIMIT_FREEZE:24, LIMIT_PC:400,
  BAIL_N:3, BAIL_TRIG:-2000, BAIL_AMT:8000, TREASURY0:3000, PURSE0:60, PASSAGE:60,
  SHIP_COST:8000, SHIP_CAP:2, SHIP_PRICE:1.2,
  BAY0:600000, BAY_R:0.00175, RESEED:0.3, GROVE0:60000, GROVE_R:0.0006,
  BELIEF0:{fish:1,veg:1,wheat:1.2,pres:1.2,tools:2,salt:2,char:1.5,meat:1.3},
};
const LADDER={farm:['food1','tools','salt','food2','char'],fish:['grain','tools','salt','char','food2'],
  lumber:['food1','tools','food2','salt','char'],artisan:['food1','food2','salt','char']};
export const JOBCLS={fisher:'fish',wheat:'farm',veg:'farm',shepherd:'farm',woodshop:'lumber',charburner:'lumber',saltworks:'artisan'};
export const JOBS=Object.keys(JOBCLS);
function mulberry(seed){let s=seed>>>0;return()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
let HID=0;
export class HH{
  constructor(job,x,y){this.id=HID++;this.job=job;this.x=x;this.y=y;this.road=false;
    this.purse=P.PURSE0;this.pantry={};for(const g of GOODS)this.pantry[g]=0;
    this.belief={...P.BELIEF0};this.lv=0;this.up=0;this.down=0;this.kindDays={};this.kindLog=[];
    this.hunger=0;this.wheatWork=0;this.unsold=new Set();this.income30=0;this.incomeLog=[];this.walk=0;}
  mult(){return Math.pow(P.LV_MULT,this.lv);}
  cls(){return JOBCLS[this.job];}
}
export class World{
  constructor(seed=11){this.rng=mulberry(seed);HID=0;this.hhs=[];this.day=0;this.treasury=P.TREASURY0;
    this.bay=P.BAY0;this.grove=P.GROVE0;this.granary={wheat:0,pres:0};this.doleRate=10;this.doleQty=0;
    this.bailouts=0;this.goDay=null;this.shipping=false;this.pub=P.PUB0;this.famine=0;
    this.mainlandIn=0;this.mainlandOut=0;this.imported={};this.exported={};this.events=[];this.prices={};
    this.market={x:0,y:0};this.roadTiles=new Set();this.money0=P.TREASURY0;this.paveBought=0;}
  log(msg){this.events.push([this.day,msg]);if(this.events.length>400)this.events.shift();}
  addHH(job,x,y){const h=new HH(job,x,y);this.hhs.push(h);this.mainlandIn+=h.purse;
    this.treasury-=P.PASSAGE;this.mainlandOut+=P.PASSAGE;this.log(`入植: ${job}`);this.updRoads();return h;}
  investShipping(){if(this.shipping||this.treasury<-this.limit())return false;
    this.treasury-=P.SHIP_COST;this.mainlandOut+=P.SHIP_COST;this.shipping=true;
    for(const g in P.EXP_CAP)P.EXP_CAP[g]*=P.SHIP_CAP;for(const g in P.EXP_ML)P.EXP_ML[g]*=P.SHIP_PRICE;
    this.log('★沿岸海運に投資(輸出天井×2・本土価+20%)');return true;}
  updRoads(){for(const h of this.hhs){h.road=false;
    for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++)
      if(this.roadTiles.has(`${Math.round(h.x)+dx},${Math.round(h.y)+dy}`)){h.road=true;break;}}}
  dist(h){return Math.hypot(h.x-this.market.x,h.y-this.market.y);}
  travel(h){return Math.min(P.TRAVEL_MAX,this.dist(h)*2*P.TRAVEL_RATE*(h.road?P.ROAD_F:1));}
  limit(){const m=Math.floor((this.day-1)/30)+1;
    return Math.min(P.LIMIT0+P.LIMIT_G*Math.min(m,P.LIMIT_FREEZE),this.hhs.length*9*P.LIMIT_PC);}
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
      if(buyer instanceof HH){q=Math.min(q,price>0?buyer.purse/price:q);cost=q*price;
        buyer.purse-=cost;buyer.pantry[g]+=q;buyer.belief[g]+=(price-buyer.belief[g])*0.2;}
      else{this.treasury-=cost;
        if(buyer==='EXP'){this.exported[g]=(this.exported[g]||0)+q;
          const rev=q*P.EXP_ML[g];this.treasury+=rev;this.mainlandIn+=rev;}
        else if(buyer==='GRAN'){this.granary[g]=(this.granary[g]||0)+q;}}
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
    if(h.job==='saltworks'&&h.pantry.char<P.SALT_CHAR*5)
      t.char=[P.SALT_CHAR*10-h.pantry.char,P.Y_SALT*h.belief.salt*0.5];
    if(h.job==='fisher'){if(h.pantry.salt<3)t.salt=[6-h.pantry.salt,h.belief.pres*P.PR_SALT/P.PRES_SALT*0.5];
      if(h.pantry.char<2)t.char=[4-h.pantry.char,(P.PR_SMOKE-P.PR_SALT)*h.belief.pres/P.SMOKE_CHAR*0.5];}
    for(const[g,dd,val]of[['tools',P.D_TOOL,2.5],['salt',P.D_SALT,2.5],['char',P.D_CHAR,2.0]]){
      if(t[g])continue;
      if(h.pantry[g]<dd*P.CULT_D*0.5)t[g]=[dd*P.CULT_D-h.pantry[g],val];}
    return t;}
  sellOffers(h){const out={};const doleOn=this.goDay===null;
    const my={fisher:'fish',veg:'veg',wheat:'wheat',shepherd:'meat',woodshop:'tools',charburner:'char',saltworks:'salt'}[h.job];
    if(my==='fish'){let keep=P.EAT;
      const alt=Math.min(h.belief.veg,h.belief.wheat,h.belief.pres);
      if(h.belief.fish>alt*1.5)keep=P.EAT*0.3;
      const s=Math.max(0,h.pantry.fish-keep);if(s>1e-9)out.fish=Math.min(s,P.HAUL);}
    else{let keep=FOODS.includes(my)?P.EAT*2:2,rate=0.5;
      if(my==='wheat'){rate=doleOn?0.1:0.04;if(doleOn)keep=P.EAT*P.RATION*10;}
      if(my==='veg'&&doleOn)keep=P.EAT*P.RATION*10;
      const s=Math.max(0,h.pantry[my]-keep);if(s>1e-9)out[my]=Math.min(s*rate+2,s,P.HAUL);}
    if(h.job==='fisher'&&h.pantry.pres>P.EAT*P.PANTRY_FOOD_D)
      out.pres=Math.min(h.pantry.pres-P.EAT*P.PANTRY_FOOD_D,P.HAUL);
    return out;}
  step(){this.day++;const d=this.day,m=Math.floor((d-1)/30)+1,mm=(m-1)%12+1;
    const winter=mm>=10;const doleOn=this.goDay===null;
    // 生産
    for(const h of this.hhs){
      const going=h._going=true; // v0: 毎日市へ(簡略)
      const ts=going?this.travel(h):0;const w=(1-ts)*h.mult();h.walk=ts;
      if(h.job==='fisher'){const dep=this.bay/P.BAY0;
        const q=(winter?P.Y_FISH_W:P.Y_FISH)*w*dep;
        this.bay=Math.min(P.BAY0,this.bay-q+P.BAY_R*this.bay*(1-dep)+P.RESEED*(1-dep));
        h.pantry.fish+=q;}
      else if(h.job==='veg'&&mm>=3&&mm<=10)h.pantry.veg+=P.Y_VEG*w;
      else if(h.job==='shepherd')h.pantry.meat+=P.Y_MEAT*w;
      else if(h.job==='wheat'){h.wheatWork+=1-ts;
        if(mm===9&&d%30===15){h.pantry.wheat+=P.Y_WHEAT*h.mult()*Math.min(1,h.wheatWork/300);h.wheatWork=0;}}
      else if(h.job==='woodshop'){const dep=this.grove/P.GROVE0;const q=P.Y_TOOLS*w*dep;
        this.grove=Math.min(P.GROVE0,this.grove-q*2+P.GROVE_R*this.grove*(1-dep));h.pantry.tools+=q;}
      else if(h.job==='charburner'){const dep=this.grove/P.GROVE0;const q=P.Y_CHAR*w*dep;
        this.grove=Math.min(P.GROVE0,this.grove-q*1.5+P.GROVE_R*this.grove*(1-dep));h.pantry.char+=q;}
      else if(h.job==='saltworks'){const fuel=Math.min(P.SALT_CHAR,h.pantry.char);
        h.pantry.char-=fuel;h.pantry.salt+=P.Y_SALT*w*fuel;}}
    // 市場
    const order=doleOn?['salt','char','tools','fish','veg','wheat','pres','meat']:GOODS;
    for(const g of order){const bids=[],asks=[];
      for(const h of this.hhs){const tgt=this.buyTargets(h)[g];
        if(tgt){let[qty,ceil]=tgt;const price=Math.min(h.belief[g]*(0.95+this.rng()*0.2),ceil);
          qty=Math.min(qty,price>0?h.purse*0.9/price:0);
          if(qty>1e-9&&price>1e-9)bids.push([h,qty,price]);}
        const sq=this.sellOffers(h)[g]||0;
        if(sq>1e-9){asks.push([h,sq,h.belief[g]*(0.95+this.rng()*0.15)]);h.unsold.add(g);}}
      if(P.IMP[g])asks.push(['CO',1e9,P.IMP[g]]);
      if(P.EXP[g])bids.push(['EXP',P.EXP_CAP[g],P.EXP[g]]);
      if(g==='tools'&&this.pub>0)bids.push(['PUB',this.pub/3.4,1.8]);
      if(P.GRAN_BID[g]&&doleOn)bids.push(['GRAN',Math.max(5,this.doleRate),P.GRAN_BID[g]]);
      const pre={},want={};for(const[b,q]of bids.map(x=>[x[0],x[1]]))if(b instanceof HH){pre[b.id]=b.pantry[g];want[b.id]=q;}
      const[pr,vol]=this.clear(g,bids,asks);
      for(const h of this.hhs)if(want[h.id]>1e-6&&h.pantry[g]-pre[h.id]<want[h.id]*0.3)
        h.belief[g]=Math.min(h.belief[g]*1.04,12);
      if(this.unfilled!==null){const myG={fisher:'fish',veg:'veg',wheat:'wheat',shepherd:'meat',woodshop:'tools',charburner:'char',saltworks:'salt'};
        for(const h of this.hhs)if(myG[h.job]===g&&this.unfilled>h.belief[g])h.belief[g]+=(this.unfilled-h.belief[g])*0.1;}
      if(vol>1e-9)(this.prices[g]=this.prices[g]||[]).push([d,pr,vol]);}
    for(const h of this.hhs){for(const g of h.unsold)h.belief[g]*=0.98;h.unsold.clear();}
    // 配給
    if(doleOn){let doleToday=0;
      for(const h of this.hhs){const fd=FOODS.reduce((s,g)=>s+h.pantry[g],0)/P.EAT;
        if(fd<1){let q=P.EAT*P.DOLE_RATION;
          for(const g of['wheat','pres']){const u=Math.min(this.granary[g],q);this.granary[g]-=u;q-=u;h.pantry[g]+=u;doleToday+=u;}
          if(q>1e-9){const c=q*P.IMP_COST.wheat;this.treasury-=c;this.mainlandOut+=c;
            h.pantry.wheat+=q;doleToday+=q;}}}
      this.doleQty+=doleToday;this.doleRate+=(doleToday-this.doleRate)*0.1;}
    // 食事
    for(const h of this.hhs){let need=P.EAT;const kinds=new Set();
      for(const g of['pres','wheat']){const u=Math.min(h.pantry[g],need*P.RATION);
        h.pantry[g]-=u;need-=u;if(u>1e-9)kinds.add(KIND[g]);}
      for(let i=0;i<2;i++){const act=['fish','veg','meat'].filter(g=>h.pantry[g]>1e-9);
        if(!act.length||need<=1e-9)break;const share=need/act.length;
        for(const g of act){const u=Math.min(h.pantry[g],share);h.pantry[g]-=u;need-=u;if(u>1e-9)kinds.add(KIND[g]);}}
      for(const g of['pres','wheat']){if(need<=1e-9)break;
        const u=Math.min(h.pantry[g],need);h.pantry[g]-=u;need-=u;if(u>1e-9)kinds.add(KIND[g]);}
      if(need>0.5){h.hunger++;this.famine++;}
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
      h.pantry.fish=0;
      // ラダー(軟ストリーク)
      const reqs=LADDER[h.cls()];
      const keep=reqs.slice(0,h.lv).every(r=>sat[r]);
      const nxt=h.lv<reqs.length?sat[reqs[h.lv]]:false;
      if(keep&&nxt){h.up++;h.down=0;
        if(h.up>=P.UP_DAYS*(h.lv+1)){h.lv++;h.up=0;this.log(`${h.job}#${h.id} ▲Lv${h.lv}`);}}
      else if(keep){h.up=Math.max(0,h.up-3);h.down=0;}
      else{h.up=Math.max(0,h.up-3);h.down++;
        if(h.down>=P.DOWN_DAYS&&h.lv>0){h.lv--;h.down=0;this.log(`${h.job}#${h.id} ▼Lv${h.lv}`);}}
      h.incomeLog.push(h.income30);h.income30=0;if(h.incomeLog.length>30)h.incomeLog.shift();}
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
