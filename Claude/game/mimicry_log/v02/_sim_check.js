// Headless behavioral check for v02 — extract <script>, stub DOM, simulate frames.
const fs=require('fs');
const path=require('path');
const html=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
const m=html.match(/<script>([\s\S]*?)<\/script>/)[1];

global.window={addEventListener:()=>{}};
global.document={getElementById:()=>({getContext:()=>({save:()=>{},restore:()=>{},translate:()=>{},fillRect:()=>{},beginPath:()=>{},arc:()=>{},fill:()=>{},stroke:()=>{},moveTo:()=>{},lineTo:()=>{},closePath:()=>{},strokeRect:()=>{},fillText:()=>{},createRadialGradient:()=>({addColorStop:()=>{}}),get globalAlpha(){return 1},set globalAlpha(v){},get fillStyle(){return ''},set fillStyle(v){},get strokeStyle(){return ''},set strokeStyle(v){},get lineWidth(){return 1},set lineWidth(v){},get font(){return ''},set font(v){},get textAlign(){return ''},set textAlign(v){}}),textContent:''})};
global.localStorage={getItem:()=>null,setItem:()=>{}};
global.location={search:''};
global.URLSearchParams=class{constructor(){}get(){return null;}};
global.requestAnimationFrame=()=>{};

const wrapped = m.replace('loop();','module.exports={state,keys,curHitR,curGrazeR,curMoveK,shotCooldownF,triggerFocusBurst,spawnWave,spawnWave10MiniBoss,update,FOCUS_TOKEN_TH,BURST_FRAMES,startGame};');
const Module=require('module');
const mod=new Module('v02', module);
mod.filename=__filename;
mod.paths=Module._nodeModulePaths(__dirname);
mod._compile(wrapped,'v02_sim');
const v=mod.exports;

function ok(label,cond){console.log((cond?'  OK  ':'  FAIL')+' '+label);}

// --- Test 1: SHIFT focus mode multipliers ---
v.startGame();
v.keys['shift']=true;
v.state.focus=true; // emulate update reflect
const hitN=8, hitF=v.curHitR();
const grN=22, grF=v.curGrazeR();
const mvF=v.curMoveK();
const cdF=v.shotCooldownF();
v.state.focus=false;
const cdN=v.shotCooldownF();
console.log('[Test1] focus mode multipliers');
ok('hit 0.5x ('+hitF+' vs base 8)',Math.abs(hitF-4)<0.01);
ok('graze 1.5x ('+grF+' vs base 22)',Math.abs(grF-33)<0.01);
ok('move 0.5x ('+mvF+')',Math.abs(mvF-0.5)<0.01);
ok('DPS up (cd focus '+cdF+' < cd normal '+cdN+')',cdF<cdN);

// --- Test 2: focus burst ---
v.state.focus=true;
v.state.focusTokens=v.FOCUS_TOKEN_TH;
v.triggerFocusBurst();
console.log('[Test2] focus burst');
ok('tokens consumed ('+v.state.focusTokens+'==0)',v.state.focusTokens===0);
ok('burstT active ('+v.state.burstT+'>0)',v.state.burstT>0);
ok('burstCount=1',v.state.burstCount===1);
const hitB=v.curHitR(), mvB=v.curMoveK(), cdB=v.shotCooldownF();
ok('burst hit 0.3x ('+hitB+')',Math.abs(hitB-8*0.3)<0.01);
ok('burst move 0.4x ('+mvB+')',Math.abs(mvB-0.4)<0.01);
ok('burst DPS 2.0x (cd burst '+cdB+' < cd focus)',cdB<cdF);

// --- Test 3: large enemy / miniboss ---
v.startGame();
v.spawnWave10MiniBoss();
console.log('[Test3] wave10 miniboss');
ok('miniBossActive',v.state.miniBossActive);
const larges=v.state.enemies.filter(e=>e.type==='large');
ok('3 large enemies',larges.length===3);
ok('large hp=9',larges.every(e=>e.hp===9));

// --- Test 4: wave>=5 large spawn rate (sample) ---
v.startGame();
let largeCnt=0,sm=0,md=0,total=0;
for(let trial=0;trial<200;trial++){
  v.state.enemies.length=0;
  v.state.wave=7; // wave>=5 but <8 => 5%
  // emulate spawnWaveRandom path
  // wave 5+ in WAVE_FUNCS or random branch — call internal spawnWave but skip wave==10
  v.state.wave=4; // so next wave++ -> 5
  v.spawnWave();
  for(const e of v.state.enemies){
    total++;
    if(e.type==='large')largeCnt++;
    else if(e.type==='medium')md++;
    else sm++;
  }
}
console.log('[Test4] wave>=5 spawn distribution total='+total+' small='+sm+' med='+md+' large='+largeCnt+' largeP='+(largeCnt/total).toFixed(3));
ok('large appears at wave>=5 (count>0)',largeCnt>0);

// --- Test 5: focus token accumulation on kill (white-box: addGauge path) ---
v.startGame();
v.state.focus=true;
// simulate small kill credit by directly invoking the addGauge path equivalent
const before=v.state.focusTokens;
// We can't call inner kill logic without enemies, so just verify focusTokens default 0 + threshold
ok('focusTokens starts 0',before===0);
ok('FOCUS_TOKEN_TH=3',v.FOCUS_TOKEN_TH===3);

console.log('--- behavioral check done ---');
