'use strict';
/* ============================================================================
   FABLE STRIKER  —  縦スクロールシューティング / 全3面
   作者: Fable 5 (2026-06-11)
   Canvas 2D + WebAudio。外部依存ゼロ。540x720 仮想解像度。
   設計核: 弾はプレイヤー速度より遅く「見て避けられる」/ クイックキル連鎖 /
           ボムで弾を得点化 / フェーズ制ボス弾幕。
   ============================================================================ */

//============================================================================
// 0. 乱数・ユーティリティ（seeded PRNG, Math.random 不使用で再現性確保）
//============================================================================
let RNG_STATE = 0x9e3779b9 >>> 0;
function srand(seed) { RNG_STATE = (seed >>> 0) || 1; }
function rnd() { // xorshift32 -> [0,1)
  let x = RNG_STATE;
  x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
  RNG_STATE = x >>> 0;
  return RNG_STATE / 4294967296;
}
function rr(a, b) { return a + rnd() * (b - a); }
function ri(a, b) { return a + Math.floor(rnd() * (b - a + 1)); }
function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
function lerp(a, b, t) { return a + (b - a) * t; }
function approach(a, b, d) { return a < b ? Math.min(a + d, b) : Math.max(a - d, b); }
const TAU = Math.PI * 2;

//============================================================================
// 1. 仮想解像度 / レンダーターゲット
//============================================================================
const VW = 540, VH = 720;

//============================================================================
// 2. WebAudio エンジン — 合成BGM(ステップシーケンサ) + SE
//============================================================================
const Audio = (() => {
  let ac = null, master = null, musicGain = null, sfxGain = null;
  let enabled = true, headless = false;
  let seq = null;          // 現在のシーケンス
  let seqTimer = 0, step = 0, stepDur = 0.13;
  let nextNoteTime = 0;

  function init() {
    if (headless || ac) return;
    try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ac = null; return; }
    master = ac.createGain(); master.gain.value = 0.9; master.connect(ac.destination);
    musicGain = ac.createGain(); musicGain.gain.value = 0.34; musicGain.connect(master);
    sfxGain = ac.createGain(); sfxGain.gain.value = 0.5; sfxGain.connect(master);
  }
  function resume() { if (ac && ac.state === 'suspended') ac.resume(); }
  function setHeadless(v) { headless = v; }

  // --- 単音合成 ---
  function note(freq, dur, type, vol, dest, slideTo, attack) {
    if (!ac) return;
    const t = ac.currentTime;
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    const a = attack || 0.005;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest || sfxGain);
    o.start(t); o.stop(t + dur + 0.02);
  }
  function noiseHit(dur, vol, lp) {
    if (!ac) return;
    const t = ac.currentTime;
    const n = Math.floor(ac.sampleRate * dur);
    const buf = ac.createBuffer(1, n, ac.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (rnd() * 2 - 1) * (1 - i / n);
    const src = ac.createBufferSource(); src.buffer = buf;
    const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = lp || 1800;
    const g = ac.createGain(); g.gain.value = vol;
    src.connect(f); f.connect(g); g.connect(sfxGain);
    src.start(t);
  }

  // --- SE 群 ---
  const SFX = {
    shot()   { note(880, 0.06, 'square', 0.10, sfxGain, 1500); },
    enemyShot(){ note(330, 0.10, 'sawtooth', 0.06, sfxGain, 220); },
    hit()    { noiseHit(0.05, 0.18, 2600); },
    pop()    { noiseHit(0.12, 0.28, 1400); note(420, 0.12, 'triangle', 0.10, sfxGain, 120); },
    bigboom(){ noiseHit(0.5, 0.5, 700); note(110, 0.5, 'sawtooth', 0.25, sfxGain, 40); },
    power()  { note(660, 0.1, 'triangle', 0.2, sfxGain); setTimeout(()=>note(990,0.12,'triangle',0.2,sfxGain),70); setTimeout(()=>note(1320,0.16,'triangle',0.2,sfxGain),150); },
    bomb()   { noiseHit(0.6, 0.4, 1200); note(160, 0.6, 'sine', 0.3, sfxGain, 1200); },
    extend() { [523,659,784,1046].forEach((f,i)=>setTimeout(()=>note(f,0.18,'triangle',0.22,sfxGain),i*90)); },
    coin(f)  { note(f || 1200, 0.07, 'square', 0.12, sfxGain, (f||1200)*1.4); },
    warning(){ note(440,0.3,'square',0.16,sfxGain); setTimeout(()=>note(440,0.3,'square',0.16,sfxGain),380); },
    damage() { noiseHit(0.3, 0.4, 500); note(200, 0.3, 'sawtooth', 0.3, sfxGain, 60); },
    select() { note(880, 0.08, 'square', 0.16, sfxGain, 1320); },
  };
  function sfx(name, arg) { if (!ac || !enabled) return; try { SFX[name] && SFX[name](arg); } catch (e) {} }

  // --- BGM: ステップシーケンサ ---
  // seq = { bpm, bass:[..], lead:[..], drums:[..], len } 数値は半音(0=休符表現はnull)
  function playMusic(s) { seq = s; step = 0; nextNoteTime = ac ? ac.currentTime : 0; }
  function stopMusic() { seq = null; }
  const SCALE = [0,2,3,5,7,8,10,12]; // 自然短音階
  function midi(n) { return 440 * Math.pow(2, (n - 69) / 12); }
  function tickMusic(dt) {
    if (!ac || !seq || !enabled) return;
    const spb = 60 / seq.bpm / 2; // 8分
    while (nextNoteTime < ac.currentTime + 0.1) {
      const i = step % seq.len;
      const bn = seq.bass[i % seq.bass.length];
      if (bn != null) note(midi(bn), spb * 1.6, 'triangle', 0.30, musicGain, null, 0.01);
      const ln = seq.lead[i % seq.lead.length];
      if (ln != null) note(midi(ln), spb * 1.1, 'square', 0.12, musicGain, null, 0.01);
      if (seq.drums) {
        const dr = seq.drums[i % seq.drums.length];
        if (dr === 1) noiseHit(0.06, 0.22, 6000);        // hat
        else if (dr === 2) { noiseHit(0.12, 0.4, 200); }  // kick
        else if (dr === 3) noiseHit(0.18, 0.3, 3000);     // snare
      }
      nextNoteTime += spb;
      step++;
    }
  }

  return { init, resume, setHeadless, sfx, playMusic, stopMusic, tickMusic,
    setEnabled(v){enabled=v;}, get ctx(){return ac;} };
})();

// 面別BGMデータ（半音番号、null=休符）
const B = null;
const MUSIC = {
  title: { bpm: 96, len: 16,
    bass: [45,B,45,B,52,B,50,B,43,B,43,B,50,B,48,B],
    lead: [69,72,76,72,74,77,B,76,67,71,74,B,72,B,71,B],
    drums:[2,1,3,1,2,1,3,1,2,1,3,1,2,1,3,1] },
  stage1: { bpm: 132, len: 16,
    bass: [45,45,57,45,50,50,57,50,43,43,55,43,48,48,55,48],
    lead: [69,B,76,B,72,B,69,72,74,B,77,B,76,B,72,B],
    drums:[2,1,1,3,2,1,1,3,2,1,1,3,2,1,3,1] },
  stage2: { bpm: 144, len: 16,
    bass: [40,40,47,40,43,43,50,43,38,38,45,38,41,41,48,41],
    lead: [64,67,71,67,72,71,67,64,65,69,72,69,67,B,64,B],
    drums:[2,1,3,1,2,3,1,3,2,1,3,1,2,3,3,1] },
  stage3: { bpm: 152, len: 16,
    bass: [33,33,40,45,35,35,42,47,31,31,38,43,36,36,43,48],
    lead: [69,72,76,79,77,76,72,69,71,74,77,81,79,77,74,71],
    drums:[2,1,3,1,2,1,3,1,2,3,1,3,2,1,3,3] },
  boss: { bpm: 160, len: 16,
    bass: [40,40,40,47,40,40,46,45,38,38,38,45,43,42,41,40],
    lead: [76,79,83,79,77,80,B,76,74,77,81,77,76,B,72,B],
    drums:[2,3,1,3,2,3,1,3,2,3,1,3,2,3,1,3] },
  clear: { bpm: 120, len: 8,
    bass: [45,52,57,64,45,52,57,64],
    lead: [81,84,88,93,B,88,84,81],
    drums:[1,1,1,1,1,1,1,1] },
};

//============================================================================
// 3. 入力
//============================================================================
const Input = (() => {
  const keys = {};
  let px = VW / 2, py = VH - 120, pointerActive = false, focusGrab = false;
  let firePointer = false;
  function on() {
    addEventListener('keydown', e => {
      keys[e.code] = true;
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','KeyZ','KeyX','Enter'].includes(e.code)) e.preventDefault();
    });
    addEventListener('keyup', e => { keys[e.code] = false; });
    const cvs = document.getElementById('c');
    const toV = (cx, cy) => {
      const r = cvs.getBoundingClientRect();
      return { x: (cx - r.left) / r.width * VW, y: (cy - r.top) / r.height * VH };
    };
    cvs.addEventListener('pointerdown', e => { e.preventDefault(); pointerActive = true; firePointer = true; const v = toV(e.clientX, e.clientY); px = v.x; py = v.y; });
    cvs.addEventListener('pointermove', e => { if (pointerActive) { const v = toV(e.clientX, e.clientY); px = v.x; py = v.y; } });
    addEventListener('pointerup', () => { pointerActive = false; firePointer = false; });
  }
  return {
    on, keys,
    get pointerActive(){return pointerActive;},
    get pointer(){return {x:px,y:py};},
    get firePointer(){return firePointer;},
    down(c){return !!keys[c];},
  };
})();

//============================================================================
// 4. ゲーム本体
//============================================================================
const Game = (() => {
  let ctx, cvs, sc = 1, ox = 0, oy = 0;
  let headless = false;

  // --- 描画スケール ---
  function fitScreen() {
    if (headless) return;
    cvs.width = innerWidth; cvs.height = innerHeight;
    sc = Math.min(innerWidth / VW, innerHeight / VH);
    ox = (innerWidth - VW * sc) / 2;
    oy = (innerHeight - VH * sc) / 2;
  }

  //--- エンティティ配列 ---
  let pbullets, ebullets, enemies, items, parts, texts, missiles, stars;
  let player, stageMgr, time;
  let state;        // 'title' | 'play' | 'dead' | 'stageclear' | 'gameover' | 'allclear'
  let score, hiscore, lives, bombs, power, credit;
  let combo, comboTimer, comboBest;
  let stateT, scrollY, freeze, shake, bombFlash, nextExtend;
  let pauseFlag;
  let stats; // ヘッドレス検証用

  try { hiscore = +(localStorage.getItem('fable_striker_hi') || 0); } catch (e) { hiscore = 0; }
  if (!hiscore) hiscore = 30000;

  //========================================================================
  // プレイヤー
  //========================================================================
  function makePlayer() {
    return {
      x: VW / 2, y: VH - 120, r: 4,        // 当たり判定は小さい(被弾は中心の小円のみ)
      vx: 0, vy: 0, fireT: 0, missileT: 0,
      inv: 2.0,                            // 復活時無敵
      alive: true, bankX: 0, exhaust: 0,
    };
  }

  function resetRun() {
    pbullets = []; ebullets = []; enemies = []; items = [];
    parts = []; texts = []; missiles = []; stars = makeStars();
    player = makePlayer();
    score = 0; lives = 2; bombs = 3; power = 0; credit = 2;
    combo = 0; comboTimer = 0; comboBest = 0;
    scrollY = 0; freeze = 0; shake = 0; bombFlash = 0;
    nextExtend = 50000;
    stats = { shots:0, kills:0, bossKills:0, deaths:0, frames:0, maxScore:0, bombsUsed:0, stagesCleared:0 };
    stageMgr = makeStage(0);
  }

  //========================================================================
  // 背景星 / 面ごとの装飾
  //========================================================================
  function makeStars() {
    const a = [];
    for (let i = 0; i < 90; i++) a.push({ x: rr(0,VW), y: rr(0,VH), z: rr(0.3,1), layer: ri(0,2) });
    return a;
  }

  //========================================================================
  // ステージ進行マネージャ（スクリプト駆動）
  //========================================================================
  // 各面: ザコ波 → 中ボス → ザコ → WARNING → ボス
  function makeStage(idx) {
    return {
      idx,
      t: 0,            // 面内経過(秒)
      cursor: 0,       // スクリプトカーソル
      phase: 'intro',  // intro|wave|midboss|wave2|warning|boss|cleared
      boss: null, midboss: null,
      warnT: 0,
      spawnQ: buildScript(idx),
      bgT: 0,
    };
  }

  // 面スクリプト: {at: 秒, fn}
  function buildScript(idx) {
    const q = [];
    const add = (at, fn) => q.push({ at, fn, done:false });
    const S = idx; // 0,1,2

    // --- 導入ザコ波 ---
    let t = 1.5;
    const waveCount = 7 + S;
    for (let w = 0; w < waveCount; w++) {
      const tt = t;
      const kind = ['stream','vee','sine','popcorn','turret','diver','weaver','spinner'][ri(0, Math.min(7, 3 + S*2))];
      add(tt, () => spawnWave(kind, S));
      t += rr(1.6, 2.4) - S * 0.12;
    }
    // --- 中ボス ---
    add(t + 0.5, () => spawnMidboss(S));
    // 中ボス撃破は phase 遷移で待つ（スクリプトはここで一旦止まる）

    // 中ボス後のザコ波（midbossClear フラグ後に解放）
    const after = [];
    let t2 = 0.5;
    for (let w = 0; w < waveCount - 2; w++) {
      const kind = ['weaver','spinner','turret','diver','sine','vee'][ri(0,5)];
      const tt = t2;
      after.push({ at: tt, fn: () => spawnWave(kind, S), done:false });
      t2 += rr(1.4, 2.0) - S * 0.1;
    }
    return { intro: q, after, afterDur: t2 + 1.5 };
  }

  //========================================================================
  // ザコ生成
  //========================================================================
  function spawnWave(kind, S) {
    const hp = 2 + S;
    const tint = S; // 面で色味
    switch (kind) {
      case 'stream': { // 上から直線、間隔
        const x = rr(60, VW-60);
        for (let i = 0; i < 6; i++) addEnemy(enemyStream(x, -20 - i*46, hp, tint));
        break; }
      case 'vee': { // V字編隊
        const cx = rr(120, VW-120);
        for (let i = 0; i < 5; i++) { addEnemy(enemyDiver(cx - 50 + i*25, -20 - Math.abs(i-2)*30, hp, tint, (i-2)*0.4)); }
        break; }
      case 'sine': { // 横から蛇行
        const dir = rnd()<0.5?1:-1;
        for (let i = 0; i < 5; i++) addEnemy(enemySine(dir<0?VW+20:-20, 80 + i*8, hp, tint, dir, i*0.5));
        break; }
      case 'popcorn': { // ばらまき、低HP高得点
        for (let i = 0; i < 8; i++) addEnemy(enemyPopcorn(rr(40,VW-40), -20 - i*20, 1, tint));
        break; }
      case 'turret': { // 止まって狙い撃ち
        for (let i = 0; i < 3; i++) addEnemy(enemyTurret(rr(80,VW-80), -20 - i*60, hp+2, tint));
        break; }
      case 'diver': { // 突っ込んで弧を描く
        const x = rr(60,VW-60);
        for (let i = 0; i < 4; i++) addEnemy(enemyDiver(x, -20 - i*40, hp, tint, rr(-0.5,0.5)));
        break; }
      case 'weaver': { // 左右に波打ちながら降下、ばらまき弾
        for (let i = 0; i < 5; i++) addEnemy(enemyWeaver(rr(60,VW-60), -20 - i*50, hp+1, tint));
        break; }
      case 'spinner': { // 回転しながらリング弾
        addEnemy(enemySpinner(rr(120,VW-120), -30, hp+4, tint));
        addEnemy(enemySpinner(rr(120,VW-120), -90, hp+4, tint));
        break; }
    }
  }

  // --- 敵ファクトリ（軌道と射撃を関数で持たせる） ---
  function baseEnemy(x, y, hp, tint, score) {
    return { x, y, vx:0, vy:0, r:13, hp, maxhp:hp, tint, score, fireT: rr(0.4,1.2),
      t:0, dead:false, kind:'zako', flash:0, born:0 };
  }
  function enemyStream(x,y,hp,tint){ const e=baseEnemy(x,y,hp,tint,120); e.vy=120; e.update=(e,dt)=>{ e.y+=e.vy*dt; if(e.fireT<=0&&e.y>0&&e.y<VH*0.7){aimShot(e,1,190);e.fireT=1.3;} }; return e; }
  function enemyPopcorn(x,y,hp,tint){ const e=baseEnemy(x,y,hp,tint,80); e.r=10; e.vy=170; e.update=(e,dt)=>{ e.y+=e.vy*dt; }; return e; }
  function enemySine(x,y,hp,tint,dir,ph){ const e=baseEnemy(x,y,hp,tint,150); e.dir=dir; e.ph=ph; e.update=(e,dt)=>{ e.t+=dt; e.x+=dir*130*dt; e.y+=Math.sin(e.t*3+ph)*40*dt+30*dt; if(e.fireT<=0&&rnd()<0.5){aimShot(e,1,200);} if(e.fireT<=0)e.fireT=0.9; }; return e; }
  function enemyDiver(x,y,hp,tint,curve){ const e=baseEnemy(x,y,hp,tint,160); e.curve=curve; e.update=(e,dt)=>{ e.t+=dt; e.vy=approach(e.vy,200,300*dt); e.x+=Math.sin(e.t*1.5)*curve*120*dt; e.y+=e.vy*dt; if(e.fireT<=0&&e.y>0&&e.y<VH*0.6){aimShot(e,1,210);e.fireT=1.1;} }; return e; }
  // turret/spinner は一定時間「居座って」撃つが、寿命を過ぎたら退避（画面下へ）して詰みを防ぐ
  function enemyTurret(x,y,hp,tint){ const e=baseEnemy(x,y,hp,tint,260); e.r=15; e.hold=rr(5,6.5); e.update=(e,dt)=>{ e.t+=dt; if(e.t<e.hold){ e.y=approach(e.y, 70+(e.slot||0), 90*dt); if(e.y>=68){ if(e.fireT<=0){ fanShot(e,3,0.32,200); e.fireT=1.5; } } } else { e.y+=160*dt; } }; e.slot=rr(0,120); return e; }
  function enemyWeaver(x,y,hp,tint){ const e=baseEnemy(x,y,hp,tint,200); e.amp=rr(40,90); e.x0=x; e.update=(e,dt)=>{ e.t+=dt; e.y+=80*dt; e.x=e.x0+Math.sin(e.t*2.2)*e.amp; if(e.fireT<=0&&e.y>0){ spreadShot(e,2,160); e.fireT=1.2; } }; return e; }
  function enemySpinner(x,y,hp,tint){ const e=baseEnemy(x,y,hp,tint,420); e.r=16; e.ang=0; e.hold=rr(5,6.5); e.update=(e,dt)=>{ e.t+=dt; e.ang+=2.2*dt; if(e.t<e.hold){ e.y=approach(e.y, 110, 70*dt); if(e.y>=108){ if(e.fireT<=0){ ringShot(e,8,150,e.ang); e.fireT=0.9; } } } else { e.y+=150*dt; } }; return e; }

  function addEnemy(e){ e.born = time; enemies.push(e); }

  //========================================================================
  // 中ボス / ボス
  //========================================================================
  function spawnMidboss(S) {
    const hp = 70 + S * 40;
    const e = baseEnemy(VW/2, -80, hp, S, 5000 + S*2000);
    e.r = 30; e.kind = 'midboss'; e.maxhp = hp;
    e.phase = 0; e.pt = 0;
    e.update = (e, dt) => {
      e.t += dt; e.pt += dt;
      e.y = approach(e.y, 130, 60*dt);
      e.x = VW/2 + Math.sin(e.t*0.8) * 130;
      if (e.y < 128) return;
      // 2フェーズ: 扇連射 / リング+狙い
      const p = e.hp < e.maxhp*0.5 ? 1 : 0;
      if (p === 0) { if (e.fireT<=0){ fanShot(e, 5, 0.4, 200); e.fireT = 1.0; } }
      else { if (e.fireT<=0){ ringShot(e, 12, 170, e.t); aimShot(e,1,260); e.fireT = 0.8; shake=Math.max(shake,2); } }
    };
    e.onDeath = () => { stageMgr.phase = 'wave2'; stageMgr.afterClock = 0; bigExplosion(e.x,e.y,1.4); };
    stageMgr.midboss = e;
    addEnemy(e);
    stageMgr.phase = 'midboss';
  }

  // ボス定義（面ごとに弾幕パターンが違う）
  function spawnBoss(S) {
    const hp = 240 + S * 130;
    const e = baseEnemy(VW/2, -120, hp, S, 30000 + S*20000);
    e.r = 40; e.kind = 'boss'; e.maxhp = hp; e.phase = 0; e.pt = 0; e.entered = false;
    e.subT = 0;
    e.update = (e, dt) => {
      e.t += dt; e.pt += dt; e.subT += dt;
      if (!e.entered) { e.y = approach(e.y, 150, 50*dt); if (e.y>=148) e.entered = true; return; }
      // 横移動
      e.x = VW/2 + Math.sin(e.t*0.5) * 150;
      const frac = e.hp / e.maxhp;
      const newPhase = frac > 0.66 ? 0 : frac > 0.33 ? 1 : 2;
      if (newPhase !== e.phase) { e.phase = newPhase; e.pt = 0; ebullets.length = Math.min(ebullets.length, 40); Audio.sfx('warning'); shake=Math.max(shake,4); }
      bossPattern(e, S, dt);
    };
    e.onDeath = () => { stats.bossKills++; bossDefeated(); };
    stageMgr.boss = e;
    addEnemy(e);
  }

  // ボス弾幕: 面 x フェーズ で別パターン
  function bossPattern(e, S, dt) {
    const ph = e.phase;
    if (e.fireT > 0) return;
    // 面1 ボス: 蒼穹の守護機
    if (S === 0) {
      if (ph === 0) { fanShot(e, 7, 0.5, 175); e.fireT = 0.9; }
      else if (ph === 1) { ringShot(e, 16, 165, e.t*1.3); e.fireT = 0.7; }
      else { aimSpread(e, 5, 0.3, 230); spiralShot(e, 3, 150, e.t); e.fireT = 0.45; }
    }
    // 面2 ボス: 熔鉄の巨蟲
    else if (S === 1) {
      if (ph === 0) { spiralShot(e, 4, 160, e.t*2); e.fireT = 0.18; }
      else if (ph === 1) { wallShot(e, 190, 1); e.fireT = 1.1; }
      else { ringShot(e, 20, 175, e.t); aimShot(e,1,300); e.fireT = 0.5; }
    }
    // 面3 ボス: 星核の支配者
    else {
      if (ph === 0) { spiralShot(e, 4, 165, e.t*2.4); aimShot(e,1,260); e.fireT = 0.2; }
      else if (ph === 1) { wallShot(e, 200, 2); ringShot(e,10,150,e.t); e.fireT = 1.0; }
      else { aimSpread(e, 6, 0.28, 240); spiralShot(e, 5, 170, -e.t*3); e.fireT = 0.34; }
    }
  }

  //========================================================================
  // 敵弾発射ヘルパ（全弾「見て避けられる」速度域に収める）
  //========================================================================
  function eb(x, y, ang, spd, tint) {
    if (ebullets.length > 700) return;
    ebullets.push({ x, y, vx: Math.cos(ang)*spd, vy: Math.sin(ang)*spd, r: 5, tint: tint||0, t:0 });
  }
  function angTo(e, tx, ty) { return Math.atan2(ty - e.y, tx - e.x); }
  function aimShot(e, n, spd) {
    const a = angTo(e, player.x, player.y);
    eb(e.x, e.y, a, spd, e.tint); Audio.sfx('enemyShot');
  }
  function fanShot(e, n, spread, spd) {
    const a0 = angTo(e, player.x, player.y) - spread*(n-1)/2;
    for (let i = 0; i < n; i++) eb(e.x, e.y, a0 + spread*i, spd, e.tint);
    Audio.sfx('enemyShot');
  }
  function aimSpread(e, n, spread, spd) { fanShot(e, n, spread, spd); }
  function spreadShot(e, n, spd) { for (let i=0;i<n;i++) eb(e.x,e.y, Math.PI/2 + rr(-0.5,0.5), spd*rr(0.8,1.1), e.tint); Audio.sfx('enemyShot'); }
  function ringShot(e, n, spd, off) {
    for (let i = 0; i < n; i++) eb(e.x, e.y, off + i/n*TAU, spd, e.tint);
    Audio.sfx('enemyShot');
  }
  function spiralShot(e, arms, spd, phase) {
    for (let a = 0; a < arms; a++) eb(e.x, e.y, phase + a/arms*TAU, spd, e.tint);
    Audio.sfx('enemyShot');
  }
  function wallShot(e, spd, gaps) {
    // 横一列の壁に隙間（避けられる窓を作る）
    const cols = 11;
    const gapIdx = []; for (let g=0; g<gaps; g++) gapIdx.push(ri(1, cols-2));
    for (let i = 0; i < cols; i++) {
      if (gapIdx.includes(i)) continue;
      const x = (i+0.5)/cols * VW;
      eb(x, e.y, Math.PI/2, spd, e.tint);
    }
    Audio.sfx('enemyShot');
  }

  //========================================================================
  // プレイヤー弾 / ミサイル / ボム
  //========================================================================
  function playerFire() {
    const p = player;
    if (p.fireT > 0) return;
    const lv = power;
    const baseY = p.y - 16;
    Audio.sfx('shot'); stats.shots++;
    const mk = (x, ang, spd, dmg) => pbullets.push({ x, y: baseY, vx: Math.sin(ang)*spd, vy: -Math.cos(ang)*spd*1, r:4, dmg, t:0 });
    // パワー段階で弾増加
    if (lv === 0) { mk(p.x, 0, 560, 1); }
    else if (lv === 1) { mk(p.x-6, 0, 600, 1); mk(p.x+6, 0, 600, 1); }
    else if (lv === 2) { mk(p.x, 0, 640, 1.2); mk(p.x-9, -0.12, 600, 1); mk(p.x+9, 0.12, 600, 1); }
    else { mk(p.x, 0, 680, 1.4); mk(p.x-9, -0.10, 640, 1); mk(p.x+9, 0.10, 640, 1); mk(p.x-16,-0.24,580,1); mk(p.x+16,0.24,580,1); }
    p.fireT = lv >= 3 ? 0.06 : 0.08;
    // ホーミングミサイル（power>=2）
    if (lv >= 2 && p.missileT <= 0) {
      missiles.push(makeMissile(p.x-14, p.y, -1));
      missiles.push(makeMissile(p.x+14, p.y, 1));
      p.missileT = 0.5;
    }
  }
  function makeMissile(x,y,side){ return { x,y, vx: side*60, vy:-120, r:6, dmg:3, t:0, target:null, life: 3 }; }

  function doBomb() {
    if (bombs <= 0 || !player.alive || player.bombLock) return;
    bombs--; stats.bombsUsed++;
    bombFlash = 0.6; shake = Math.max(shake, 6); freeze = 0.05;
    Audio.sfx('bomb');
    player.inv = Math.max(player.inv, 1.4);
    // 画面内の敵弾を得点アイテムに変換
    let n = 0;
    for (const b of ebullets) { spawnItem(b.x, b.y, 'point_s'); n++; }
    ebullets.length = 0;
    // 敵に大ダメージ
    for (const e of enemies) { if (e.kind==='zako') { e.hp -= 6; } else { e.hp -= 40; e.flash = 0.2; } }
    addText(VW/2, VH/2-40, 'BOMB!', '#ffe65a', 1.2, 30);
  }

  //========================================================================
  // アイテム / 得点 / コンボ
  //========================================================================
  function spawnItem(x, y, type) {
    items.push({ x, y, vx: rr(-30,30), vy: -40, type, t:0, r:11, mag:false });
  }
  function dropItems(e) {
    // 撃破ドロップ
    if (e.kind === 'zako') {
      if (rnd() < 0.12) spawnItem(e.x, e.y, 'power');
      else if (rnd() < 0.5) spawnItem(e.x, e.y, 'point_s');
    } else {
      // ボス/中ボスは大量ドロップ
      for (let i=0;i<6;i++) spawnItem(e.x+rr(-30,30), e.y+rr(-20,20), 'point_l');
      spawnItem(e.x, e.y, 'power'); spawnItem(e.x-20, e.y, 'bomb_item');
      if (e.kind==='boss') spawnItem(e.x+20, e.y, 'extend_item');
    }
  }
  function collectItem(it) {
    switch (it.type) {
      case 'power':
        if (power < 3) { power++; Audio.sfx('power'); addText(it.x,it.y,'POWER UP','#7df9ff',0.9,18); }
        else { addScore(2000); Audio.sfx('coin'); }
        break;
      case 'point_s': addScore(150 + combo*10); Audio.sfx('coin', 1100); break;
      case 'point_l': addScore(800 + combo*20); Audio.sfx('coin', 1500); break;
      case 'bomb_item': if (bombs<6){bombs++;Audio.sfx('power');addText(it.x,it.y,'BOMB +1','#ffb84a',0.9,18);} else addScore(3000); break;
      case 'extend_item': lives++; Audio.sfx('extend'); addText(it.x,it.y,'1UP','#ff7ce5',1.1,22); break;
    }
  }
  function addScore(v) {
    score += v;
    if (score > hiscore) hiscore = score;
    if (score >= nextExtend) { lives++; nextExtend += 80000; Audio.sfx('extend'); addText(VW/2,VH/2,'EXTEND!','#ff7ce5',1.2,26); }
    if (score > stats.maxScore) stats.maxScore = score;
  }
  function onKill(e) {
    stats.kills++;
    combo++; comboTimer = 2.2;
    if (combo > comboBest) comboBest = combo;
    const mult = comboMult();
    addScore(Math.floor(e.score * mult));
    if (combo > 1 && combo % 5 === 0) addText(e.x, e.y-10, '×'+mult.toFixed(1), '#ffe65a', 0.7, 15);
    dropItems(e);
    if (e.kind === 'zako') { explosion(e.x, e.y, 0.7); Audio.sfx('pop'); }
  }
  function comboMult() { return combo >= 40 ? 4 : combo >= 20 ? 3 : combo >= 8 ? 2 : combo >= 3 ? 1.5 : 1; }

  //========================================================================
  // エフェクト
  //========================================================================
  function addText(x,y,txt,col,scale,size){ texts.push({x,y,txt,col,scale:scale||1,size:size||16,life:1}); }
  function explosion(x,y,s){ for(let i=0;i<14*s+4;i++){ const a=rr(0,TAU),v=rr(40,260)*s; parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:rr(0.3,0.7),max:0.7,col:rnd()<0.5?'#ffd23b':'#ff8c3b',size:rr(2,5)*s,grav:60}); } }
  function bigExplosion(x,y,s){ explosion(x,y,s*2); for(let k=0;k<5;k++) setTimeout(()=>{ if(!headless) explosion(x+rr(-40,40),y+rr(-40,40),s); },k*80); Audio.sfx('bigboom'); shake=Math.max(shake,8); }

  //========================================================================
  // 更新
  //========================================================================
  function update(dt) {
    if (pauseFlag && state === 'play') { return; } // ポーズ中は時間も止める
    time += dt;
    if (state === 'play') stats.frames++;
    Audio.tickMusic(dt);
    if (freeze > 0) { freeze -= dt; if (state==='play') { updateParticles(dt); return; } }
    shake = Math.max(0, shake - dt*16);
    bombFlash = Math.max(0, bombFlash - dt*1.6);

    updateStars(dt);

    if (state === 'title') { stateT += dt; return; }
    if (state === 'gameover') { stateT += dt; updateParticles(dt); return; }
    if (state === 'allclear') { stateT += dt; updateParticles(dt); return; }
    if (state === 'stageclear') {
      stateT += dt; updateParticles(dt);
      if (stateT > 3.2) startStage(stageMgr.idx + 1);
      return;
    }
    if (state === 'dead') {
      stateT += dt; updateParticles(dt); updateBullets(dt);
      if (stateT > 1.2) {
        if (lives > 0) { lives--; respawn(); }
        else { toGameOver(); }
      }
      return;
    }

    // --- play ---
    updatePlayer(dt);
    updateStage(dt);
    updateEnemies(dt);
    updateBullets(dt);
    updateMissiles(dt);
    updateItems(dt);
    updateParticles(dt);
    updateTexts(dt);

    if (comboTimer > 0) { comboTimer -= dt; if (comboTimer <= 0) combo = 0; }

    collisions();
  }

  function updateStars(dt) {
    const spd = state==='play'?1:0.5;
    for (const s of stars) {
      s.y += (40 + s.layer*60) * s.z * dt * spd;
      if (s.y > VH) { s.y = -2; s.x = rr(0, VW); }
    }
  }

  function updatePlayer(dt) {
    const p = player;
    if (!p.alive) return;
    p.inv = Math.max(0, p.inv - dt);
    p.fireT -= dt; p.missileT -= dt;
    let dx=0, dy=0, slow=false;
    if (Input.pointerActive) {
      const tx = Input.pointer.x, ty = Input.pointer.y - 36;
      dx = clamp((tx - p.x), -1, 1) * Math.min(1, Math.abs(tx-p.x)/30);
      dy = clamp((ty - p.y), -1, 1) * Math.min(1, Math.abs(ty-p.y)/30);
    } else {
      if (Input.down('ArrowLeft')||Input.down('KeyA')) dx=-1;
      if (Input.down('ArrowRight')||Input.down('KeyD')) dx=1;
      if (Input.down('ArrowUp')||Input.down('KeyW')) dy=-1;
      if (Input.down('ArrowDown')||Input.down('KeyS')) dy=1;
    }
    if (Input.down('ShiftLeft')||Input.down('ShiftRight')) slow=true;
    const spd = slow ? 150 : 330;
    p.x = clamp(p.x + dx*spd*dt, 12, VW-12);
    p.y = clamp(p.y + dy*spd*dt, 30, VH-20);
    p.bankX = approach(p.bankX, dx, 6*dt);
    p.exhaust += dt;
    // 発射（常時 or ボタン）
    const firing = Input.down('Space')||Input.down('KeyZ')||Input.pointerActive || autoFire;
    if (firing) playerFire();
    // ボム
    if ((Input.down('KeyX')||Input.down('ShiftRight')&&false)) { if(!p._bombHeld){doBomb();p._bombHeld=true;} } else p._bombHeld=false;
    // 被弾後ボムでの自動キー
    if (bombKeyOnce) { doBomb(); bombKeyOnce=false; }
  }

  function updateStage(dt) {
    const sm = stageMgr;
    sm.t += dt; sm.bgT += dt;
    if (sm.phase === 'intro' || sm.phase === 'midboss') {
      // intro スクリプト消化（midboss を spawn したら止まる）
      for (const ev of sm.spawnQ.intro) {
        if (!ev.done && sm.t >= ev.at) { ev.fn(); ev.done = true; }
      }
    }
    if (sm.phase === 'wave2') {
      sm.afterClock = (sm.afterClock||0) + dt;
      for (const ev of sm.spawnQ.after) {
        if (!ev.done && sm.afterClock >= ev.at) { ev.fn(); ev.done = true; }
      }
      // 波を撒き終え、敵が掃けたらボスへ。掃け残っても猶予(8秒)でボスへ進める(詰み防止)
      const noEnemy = enemies.length === 0;
      const grace = sm.afterClock >= sm.spawnQ.afterDur + 8;
      if (sm.afterClock >= sm.spawnQ.afterDur && (noEnemy || grace)) {
        sm.phase = 'warning'; sm.warnT = 0; Audio.sfx('warning'); Audio.stopMusic();
      }
    }
    if (sm.phase === 'warning') {
      sm.warnT += dt;
      if (sm.warnT > 2.4) { sm.phase = 'boss'; spawnBoss(sm.idx); Audio.playMusic(MUSIC.boss); }
    }
  }

  function updateEnemies(dt) {
    for (let i = enemies.length-1; i>=0; i--) {
      const e = enemies[i];
      e.fireT -= dt; e.flash = Math.max(0, e.flash - dt*5);
      e.update(e, dt);
      // 画面外（下）で消滅（ザコのみ）
      if (e.kind === 'zako' && (e.y > VH+40 || e.x < -60 || e.x > VW+60)) { enemies.splice(i,1); continue; }
      if (e.hp <= 0 && !e.dead) {
        e.dead = true;
        if (e.kind === 'boss') { bigExplosion(e.x,e.y,2); e.onDeath && e.onDeath(); enemies.splice(i,1); }
        else if (e.kind === 'midboss') { onKill(e); e.onDeath && e.onDeath(); enemies.splice(i,1); }
        else { onKill(e); enemies.splice(i,1); }
      }
    }
  }

  function updateBullets(dt) {
    for (let i = pbullets.length-1;i>=0;i--){ const b=pbullets[i]; b.x+=b.vx*dt; b.y+=b.vy*dt; if(b.y<-10||b.x<-10||b.x>VW+10) pbullets.splice(i,1); }
    for (let i = ebullets.length-1;i>=0;i--){ const b=ebullets[i]; b.t+=dt; b.x+=b.vx*dt; b.y+=b.vy*dt; if(b.y<-20||b.y>VH+20||b.x<-20||b.x>VW+20) ebullets.splice(i,1); }
  }

  function updateMissiles(dt) {
    for (let i = missiles.length-1;i>=0;i--){
      const m = missiles[i]; m.t+=dt; m.life-=dt;
      // ターゲット探索
      if (!m.target || m.target.dead || m.target.hp<=0) {
        let best=null,bd=1e9;
        for (const e of enemies){ const d=(e.x-m.x)**2+(e.y-m.y)**2; if(d<bd){bd=d;best=e;} }
        m.target=best;
      }
      if (m.target) {
        const a = Math.atan2(m.target.y-m.y, m.target.x-m.x);
        const ca = Math.atan2(m.vy, m.vx);
        let da = a - ca; while(da>Math.PI)da-=TAU; while(da<-Math.PI)da+=TAU;
        const na = ca + clamp(da, -4*dt, 4*dt);
        const sp = 360;
        m.vx = Math.cos(na)*sp; m.vy = Math.sin(na)*sp;
      } else { m.vy -= 200*dt; }
      m.x+=m.vx*dt; m.y+=m.vy*dt;
      if (rnd()<0.6) parts.push({x:m.x,y:m.y,vx:0,vy:30,life:0.3,max:0.3,col:'#ffce6a',size:2,grav:0});
      if (m.life<=0||m.y<-20||m.y>VH+20) missiles.splice(i,1);
    }
  }

  function updateItems(dt) {
    const p = player;
    for (let i = items.length-1;i>=0;i--){
      const it = items[i]; it.t+=dt;
      // 上部に吸い寄せ範囲 or プレイヤー上部でマグネット
      if (p.alive && (it.mag || p.y < 130 || Math.hypot(it.x-p.x,it.y-p.y)<70)) {
        it.mag = true;
        const a = Math.atan2(p.y-it.y, p.x-it.x);
        it.vx = approach(it.vx, Math.cos(a)*360, 1200*dt);
        it.vy = approach(it.vy, Math.sin(a)*360, 1200*dt);
      } else {
        it.vy = approach(it.vy, 70, 200*dt);
      }
      it.x += it.vx*dt; it.y += it.vy*dt;
      if (p.alive && Math.hypot(it.x-p.x, it.y-p.y) < 16) { collectItem(it); items.splice(i,1); continue; }
      if (it.y > VH+30) items.splice(i,1);
    }
  }

  function updateParticles(dt) {
    for (let i=parts.length-1;i>=0;i--){ const p=parts[i]; p.life-=dt; if(p.life<=0){parts.splice(i,1);continue;} p.vy+=(p.grav||0)*dt; p.x+=p.vx*dt; p.y+=p.vy*dt; }
  }
  function updateTexts(dt) {
    for (let i=texts.length-1;i>=0;i--){ const t=texts[i]; t.life-=dt*0.8; t.y-=20*dt; if(t.life<=0) texts.splice(i,1); }
  }

  //========================================================================
  // 当たり判定
  //========================================================================
  function collisions() {
    const p = player;
    // プレイヤー弾 → 敵
    for (let i=pbullets.length-1;i>=0;i--){
      const b=pbullets[i]; let hit=false;
      for (const e of enemies){
        if (e.dead) continue;
        if (Math.abs(b.x-e.x)<e.r+b.r && Math.abs(b.y-e.y)<e.r+b.r){
          e.hp -= b.dmg; e.flash=0.12; hit=true;
          parts.push({x:b.x,y:b.y-4,vx:rr(-30,30),vy:rr(-60,-10),life:0.2,max:0.2,col:'#fff',size:2,grav:0});
          Audio.sfx('hit');
          break;
        }
      }
      if (hit) pbullets.splice(i,1);
    }
    // ミサイル → 敵
    for (let i=missiles.length-1;i>=0;i--){
      const m=missiles[i];
      for (const e of enemies){ if(e.dead)continue; if(Math.hypot(m.x-e.x,m.y-e.y)<e.r+m.r){ e.hp-=m.dmg; e.flash=0.12; explosion(m.x,m.y,0.4); missiles.splice(i,1); break; } }
    }
    if (!p.alive || p.inv>0) return;
    // 敵弾 → プレイヤー（中心小円）
    for (const b of ebullets){
      if (Math.hypot(b.x-p.x,b.y-p.y) < b.r + p.r) { playerHit(); return; }
    }
    // 敵接触
    for (const e of enemies){ if(e.dead)continue; if(Math.hypot(e.x-p.x,e.y-p.y) < e.r + p.r + 2){ playerHit(); return; } }
  }

  function playerHit() {
    if (!player.alive || player.inv>0) return;
    player.alive = false; state='dead'; stateT=0;
    stats.deaths++;
    combo = 0;
    bigExplosion(player.x, player.y, 1.0);
    Audio.sfx('damage');
    shake = Math.max(shake, 7);
    // 被弾でパワーを少し落とす（ペナルティだが復帰可能）
    power = Math.max(0, power-1);
  }

  function respawn() {
    player = makePlayer();
    state = 'play';
    // 復活時、近くの敵弾を消す（理不尽連続死の防止）
    ebullets = ebullets.filter(b => Math.hypot(b.x-player.x, b.y-player.y) > 120);
  }

  //========================================================================
  // 状態遷移
  //========================================================================
  function startStage(idx) {
    if (idx > 2) { toAllClear(); return; }
    stageMgr = makeStage(idx);
    state = 'play'; stateT = 0;
    player.alive = true; player.inv = 1.5; player.x = VW/2; player.y = VH-120;
    ebullets = [];
    Audio.playMusic([MUSIC.stage1, MUSIC.stage2, MUSIC.stage3][idx]);
    addText(VW/2, VH/2-30, 'STAGE '+(idx+1), '#fff', 1.4, 34);
    addText(VW/2, VH/2+8, ['蒼穹回廊','熔鉄峡谷','星核要塞'][idx], '#7df9ff', 1.0, 22);
  }

  function bossDefeated() {
    stageMgr.phase = 'cleared';
    stats.stagesCleared++;
    if (stageMgr.idx >= 2) { toAllClear(); }
    else { state = 'stageclear'; stateT = 0; Audio.playMusic(MUSIC.clear); addText(VW/2,VH/2-20,'STAGE CLEAR','#ffe65a',1.4,34); addScore(20000); }
  }

  function toGameOver() { state='gameover'; stateT=0; Audio.stopMusic(); player.alive=false; saveHi(); }
  function toAllClear() { state='allclear'; stateT=0; Audio.playMusic(MUSIC.clear); addScore(100000); saveHi(); }
  function saveHi(){ try{ localStorage.setItem('fable_striker_hi', String(hiscore)); }catch(e){} }

  function startGame() {
    resetRun();
    Audio.init(); Audio.resume();
    startStage(0);
  }
  function continueGame() {
    if (credit <= 0) return;
    credit--; lives = 2; bombs = 3; power = Math.max(power,1); score = Math.floor(score/2);
    combo = 0; ebullets = [];
    state = 'play'; player.alive = true; player.inv = 2;
  }

  //========================================================================
  // 描画
  //========================================================================
  const stageBg = [
    { top:'#0a1f3a', bot:'#0a3a5e', accent:'#1d5e8c' }, // 蒼穹
    { top:'#3a0f0a', bot:'#5e1a0a', accent:'#9c3a1d' }, // 熔鉄
    { top:'#1a0a2e', bot:'#2e0a3a', accent:'#5e1d8c' }, // 星核
  ];

  function render() {
    if (headless) return;
    ctx.setTransform(1,0,0,1,0,0);
    ctx.fillStyle = '#000'; ctx.fillRect(0,0,cvs.width,cvs.height);
    ctx.setTransform(sc,0,0,sc,ox,oy);
    ctx.save();
    ctx.beginPath(); ctx.rect(0,0,VW,VH); ctx.clip();

    const sx = (rnd()-0.5)*shake, sy=(rnd()-0.5)*shake;
    ctx.translate(sx, sy);

    drawBackground();
    drawStars();
    drawItems();
    drawEnemies();
    drawBullets();
    drawMissiles();
    drawPlayer();
    drawParticles();
    drawTexts();

    ctx.translate(-sx,-sy);
    if (bombFlash > 0) { ctx.fillStyle = `rgba(255,255,255,${bombFlash*0.6})`; ctx.fillRect(0,0,VW,VH); }
    drawHUD();
    drawState();

    // ビネット
    const vg = ctx.createRadialGradient(VW/2,VH/2,VH*0.4,VW/2,VH/2,VH*0.85);
    vg.addColorStop(0,'rgba(0,0,0,0)'); vg.addColorStop(1,'rgba(0,0,0,0.5)');
    ctx.fillStyle=vg; ctx.fillRect(0,0,VW,VH);
    if (pauseFlag && state==='play') {
      ctx.fillStyle='rgba(0,0,0,0.5)'; ctx.fillRect(0,0,VW,VH);
      ctx.fillStyle='#fff'; ctx.textAlign='center'; ctx.font='800 40px ui-monospace,monospace';
      ctx.fillText('PAUSE', VW/2, VH/2);
      ctx.font='700 14px ui-monospace,monospace'; ctx.fillStyle='#9fb8d0';
      ctx.fillText('P で再開', VW/2, VH/2+30);
    }
    ctx.restore();
  }

  function drawBackground() {
    const idx = clamp(stageMgr?stageMgr.idx:0,0,2);
    const bg = stageBg[idx];
    const grad = ctx.createLinearGradient(0,0,0,VH);
    grad.addColorStop(0,bg.top); grad.addColorStop(1,bg.bot);
    ctx.fillStyle=grad; ctx.fillRect(0,0,VW,VH);
    // 流れる地形ストライプ（面で表情を変える）
    const t = stageMgr ? stageMgr.bgT : time;
    ctx.globalAlpha = 0.5;
    if (idx === 0) { // 海面のうねり
      ctx.strokeStyle = bg.accent; ctx.lineWidth=2;
      for (let i=0;i<8;i++){ const y=((t*60 + i*100)%(VH+100))-50; ctx.beginPath(); for(let x=0;x<=VW;x+=20){ ctx.lineTo(x, y+Math.sin(x*0.03+t*2+i)*8); } ctx.stroke(); }
    } else if (idx === 1) { // 溶岩の割れ目
      ctx.fillStyle = bg.accent;
      for (let i=0;i<10;i++){ const y=((t*90+i*90)%(VH+120))-60; const w=rr2(i)*120+40; const x=rr2(i+9)*VW; ctx.globalAlpha=0.35; ctx.fillRect(x,y, 6, w); }
    } else { // 要塞のグリッド
      ctx.strokeStyle = bg.accent; ctx.lineWidth=1; ctx.globalAlpha=0.4;
      const off = (t*100)%60;
      for (let y=-60+off;y<VH;y+=60){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(VW,y); ctx.stroke(); }
      for (let x=0;x<VW;x+=60){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,VH); ctx.stroke(); }
    }
    ctx.globalAlpha=1;
  }
  function rr2(i){ const x=Math.sin(i*91.7)*43758.5; return x-Math.floor(x); } // 安定擬似乱数(背景用)

  function drawStars() {
    for (const s of stars) {
      const a = 0.3 + s.z*0.6;
      ctx.fillStyle = `rgba(180,220,255,${a})`;
      const sz = s.layer*0.8 + 0.6;
      ctx.fillRect(s.x, s.y, sz, sz*2.5);
    }
  }

  function drawPlayer() {
    const p = player;
    if (!p.alive) return;
    if (p.inv>0 && Math.floor(time*20)%2===0) ctx.globalAlpha=0.4;
    ctx.save();
    ctx.translate(p.x, p.y);
    // 排気炎
    const fl = 8 + Math.sin(p.exhaust*40)*3;
    const fg = ctx.createLinearGradient(0,8,0,8+fl+10);
    fg.addColorStop(0,'#9fe8ff'); fg.addColorStop(1,'rgba(125,200,255,0)');
    ctx.fillStyle = fg;
    ctx.beginPath(); ctx.moveTo(-5,8); ctx.lineTo(5,8); ctx.lineTo(0,8+fl+10); ctx.closePath(); ctx.fill();
    ctx.rotate(p.bankX*0.3);
    // 機体（多角形ストライカー）
    ctx.fillStyle = '#dff3ff';
    ctx.strokeStyle = '#7df9ff'; ctx.lineWidth=1.5;
    ctx.beginPath();
    ctx.moveTo(0,-16); ctx.lineTo(6,-2); ctx.lineTo(14,8); ctx.lineTo(6,6);
    ctx.lineTo(3,12); ctx.lineTo(-3,12); ctx.lineTo(-6,6); ctx.lineTo(-14,8);
    ctx.lineTo(-6,-2); ctx.closePath(); ctx.fill(); ctx.stroke();
    // コックピット
    ctx.fillStyle = '#2d7bd6'; ctx.beginPath(); ctx.ellipse(0,-4,3,5,0,0,TAU); ctx.fill();
    ctx.restore();
    ctx.globalAlpha=1;
    // 当たり判定点（被弾範囲の可視化 = R-C 準拠）
    if (Input.down('ShiftLeft')||Input.down('ShiftRight')) {
      ctx.fillStyle = '#ff3355'; ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,TAU); ctx.fill();
      ctx.strokeStyle='rgba(255,255,255,0.7)'; ctx.beginPath(); ctx.arc(p.x,p.y,p.r+3,0,TAU); ctx.stroke();
    }
  }

  function drawEnemies() {
    for (const e of enemies) {
      ctx.save(); ctx.translate(e.x,e.y);
      const tintCol = ['#6fd0ff','#ff9a5a','#c98aff'][e.tint%3];
      if (e.kind === 'boss' || e.kind === 'midboss') drawBoss(e, tintCol);
      else drawZako(e, tintCol);
      ctx.restore();
      // HPバー（中ボス/ボス）
      if (e.kind!=='zako') drawBossHP(e);
    }
  }
  function drawZako(e, col) {
    const flash = e.flash>0;
    ctx.rotate(Math.sin(e.t*2)*0.1);
    ctx.fillStyle = flash ? '#fff' : col;
    ctx.strokeStyle = '#ffffff88'; ctx.lineWidth=1;
    const r = e.r;
    ctx.beginPath();
    // 下向きの楔形メカ
    ctx.moveTo(0, r); ctx.lineTo(r*0.9, -r*0.3); ctx.lineTo(r*0.4,-r);
    ctx.lineTo(-r*0.4,-r); ctx.lineTo(-r*0.9,-r*0.3); ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = flash?'#fff':'#ffe65a';
    ctx.beginPath(); ctx.arc(0,-r*0.2,r*0.28,0,TAU); ctx.fill();
  }
  function drawBoss(e, col) {
    const flash = e.flash>0;
    const r = e.r;
    ctx.rotate(Math.sin(e.t*0.6)*0.06);
    // 外殻
    const g = ctx.createRadialGradient(0,0,r*0.2,0,0,r);
    g.addColorStop(0, flash?'#fff':'#ffffff'); g.addColorStop(0.3, flash?'#fff':col); g.addColorStop(1, '#1a1a2e');
    ctx.fillStyle = g;
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
    ctx.beginPath();
    const spikes = e.kind==='boss'?8:6;
    for (let i=0;i<spikes*2;i++){ const ang=i/(spikes*2)*TAU; const rad = (i%2===0)?r:r*0.7; ctx.lineTo(Math.cos(ang)*rad, Math.sin(ang)*rad); }
    ctx.closePath(); ctx.fill(); ctx.stroke();
    // コア
    ctx.fillStyle = flash?'#fff':'#ff3355';
    ctx.beginPath(); ctx.arc(0,0,r*0.32,0,TAU); ctx.fill();
    ctx.fillStyle = '#ffd23b';
    ctx.beginPath(); ctx.arc(0,0,r*0.16+Math.sin(e.t*6)*2,0,TAU); ctx.fill();
  }
  function drawBossHP(e) {
    const w = e.kind==='boss'?VW-40:160;
    const x = e.kind==='boss'?20:(e.x-w/2);
    const y = e.kind==='boss'?18:(e.y-e.r-14);
    const frac = clamp(e.hp/e.maxhp,0,1);
    ctx.fillStyle='rgba(0,0,0,0.5)'; ctx.fillRect(x,y,w,e.kind==='boss'?8:4);
    ctx.fillStyle = e.kind==='boss'?'#ff3355':'#ff9a5a';
    ctx.fillRect(x,y,w*frac,e.kind==='boss'?8:4);
    if (e.kind==='boss') { ctx.fillStyle='#fff'; ctx.font='700 11px ui-monospace,monospace'; ctx.textAlign='left'; ctx.fillText('BOSS',x,y-3); }
  }

  function drawBullets() {
    // プレイヤー弾
    ctx.globalCompositeOperation='lighter';
    for (const b of pbullets){
      ctx.fillStyle='#bfefff';
      ctx.fillRect(b.x-2, b.y-7, 4, 12);
      ctx.fillStyle='#fff'; ctx.fillRect(b.x-1,b.y-6,2,9);
    }
    ctx.globalCompositeOperation='source-over';
    // 敵弾
    for (const b of ebullets){
      const col = ['#ff5a7a','#ffb04a','#d98aff'][b.tint%3];
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,TAU); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(b.x,b.y,b.r*0.45,0,TAU); ctx.fill();
    }
  }
  function drawMissiles() {
    for (const m of missiles){ ctx.fillStyle='#ffce6a'; ctx.save(); ctx.translate(m.x,m.y); ctx.rotate(Math.atan2(m.vy,m.vx)+Math.PI/2); ctx.fillRect(-2,-5,4,10); ctx.restore(); }
  }
  function drawItems() {
    for (const it of items){
      const pulse = 1+Math.sin(it.t*8)*0.12;
      ctx.save(); ctx.translate(it.x,it.y); ctx.scale(pulse,pulse);
      let col='#7df9ff', label='P';
      if (it.type==='point_s'){col='#9fffa0';label='';} else if(it.type==='point_l'){col='#ffe65a';label='';}
      else if(it.type==='power'){col='#7df9ff';label='P';} else if(it.type==='bomb_item'){col='#ffb84a';label='B';}
      else if(it.type==='extend_item'){col='#ff7ce5';label='1';}
      ctx.fillStyle=col;
      if (label){ ctx.fillRect(-7,-7,14,14); ctx.fillStyle='#06121f'; ctx.font='700 11px ui-monospace,monospace'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(label,0,1); ctx.textBaseline='alphabetic'; }
      else { ctx.beginPath(); ctx.arc(0,0,5,0,TAU); ctx.fill(); }
      ctx.restore();
    }
  }
  function drawParticles() {
    ctx.globalCompositeOperation='lighter';
    for (const p of parts){ ctx.globalAlpha=Math.max(0,p.life/p.max); ctx.fillStyle=p.col; ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,TAU); ctx.fill(); }
    ctx.globalAlpha=1; ctx.globalCompositeOperation='source-over';
  }
  function drawTexts() {
    ctx.textAlign='center';
    for (const t of texts){ ctx.globalAlpha=clamp(t.life,0,1); ctx.fillStyle=t.col; ctx.font=`800 ${t.size}px ui-monospace,Consolas,monospace`; ctx.fillText(t.txt,t.x,t.y); }
    ctx.globalAlpha=1;
  }

  function drawHUD() {
    if (state==='title') return;
    ctx.textAlign='left';
    ctx.fillStyle='#eaf6ff'; ctx.font='700 13px ui-monospace,Consolas,monospace';
    ctx.fillText('SCORE', 12, 16);
    ctx.font='800 20px ui-monospace,Consolas,monospace';
    ctx.fillText(pad(score,8), 12, 36);
    ctx.textAlign='right';
    ctx.font='700 13px ui-monospace,Consolas,monospace';
    ctx.fillStyle='#ffe65a';
    ctx.fillText('HI '+pad(hiscore,8), VW-12, 16);
    // 下部: ライフ/ボム/パワー
    ctx.textAlign='left';
    ctx.fillStyle='#ff7ce5'; ctx.font='700 14px ui-monospace,monospace';
    let s='';
    for (let i=0;i<lives;i++) s+='♥'; ctx.fillText('REST '+lives, 12, VH-12);
    ctx.fillStyle='#ffb84a'; ctx.fillText('BOMB '+bombs, 110, VH-12);
    // パワーゲージ
    ctx.fillStyle='#eaf6ff'; ctx.fillText('PWR', VW-150, VH-12);
    for (let i=0;i<4;i++){ ctx.fillStyle = i<=power?'#7df9ff':'#234'; ctx.fillRect(VW-110+i*22, VH-22, 18, 12); }
    // コンボ
    if (combo>=3) {
      ctx.textAlign='center'; ctx.fillStyle='#ffe65a';
      ctx.font='800 18px ui-monospace,monospace';
      ctx.fillText(combo+' HIT  ×'+comboMult().toFixed(1), VW/2, 56);
    }
    // WARNING
    if (stageMgr && stageMgr.phase==='warning') {
      const a = 0.5+Math.sin(time*12)*0.5;
      ctx.textAlign='center'; ctx.fillStyle=`rgba(255,60,80,${a})`;
      ctx.font='800 44px ui-monospace,monospace';
      ctx.fillText('WARNING', VW/2, VH/2-20);
      ctx.font='700 18px ui-monospace,monospace'; ctx.fillStyle='#fff';
      ctx.fillText('BOSS APPROACHING', VW/2, VH/2+12);
    }
  }
  function pad(n, w){ n=Math.floor(n)+''; while(n.length<w) n='0'+n; return n; }

  function drawState() {
    ctx.textAlign='center';
    if (state==='title') {
      // タイトルロゴ
      const grad = ctx.createLinearGradient(0,VH*0.2,0,VH*0.42);
      grad.addColorStop(0,'#7df9ff'); grad.addColorStop(1,'#2d7bd6');
      ctx.fillStyle=grad; ctx.font='800 54px ui-monospace,Consolas,monospace';
      ctx.fillText('FABLE', VW/2, VH*0.30);
      ctx.fillStyle='#fff'; ctx.font='800 56px ui-monospace,Consolas,monospace';
      ctx.fillText('STRIKER', VW/2, VH*0.30+58);
      ctx.fillStyle='#7df9ff'; ctx.font='700 15px ui-monospace,monospace';
      ctx.fillText('縦スクロールシューティング ／ 全3面', VW/2, VH*0.30+92);
      // 操作説明
      ctx.fillStyle='#cfe8ff'; ctx.font='700 14px ui-monospace,monospace';
      const lines=['移動: 矢印 / WASD / ドラッグ','ショット: Z / Space / 画面タッチ（押しっぱOK）','ボム: X  ／  低速+判定表示: Shift'];
      lines.forEach((l,i)=>ctx.fillText(l, VW/2, VH*0.60+i*24));
      ctx.fillStyle=`rgba(255,255,255,${0.5+Math.sin(time*4)*0.4})`;
      ctx.font='800 22px ui-monospace,monospace';
      ctx.fillText('クリック / SPACE で START', VW/2, VH*0.82);
      ctx.fillStyle='#ffe65a'; ctx.font='700 13px ui-monospace,monospace';
      ctx.fillText('HI-SCORE  '+pad(hiscore,8), VW/2, VH*0.88);
    } else if (state==='gameover') {
      ctx.fillStyle='rgba(0,0,0,0.6)'; ctx.fillRect(0,0,VW,VH);
      ctx.fillStyle='#ff3355'; ctx.font='800 48px ui-monospace,monospace';
      ctx.fillText('GAME OVER', VW/2, VH*0.4);
      ctx.fillStyle='#fff'; ctx.font='700 18px ui-monospace,monospace';
      ctx.fillText('SCORE '+pad(score,8), VW/2, VH*0.4+40);
      if (credit>0) {
        ctx.fillStyle=`rgba(255,255,255,${0.5+Math.sin(time*4)*0.4})`;
        ctx.fillText('CONTINUE? (C)  残り'+credit, VW/2, VH*0.55);
      }
      ctx.fillStyle='#9fb8d0'; ctx.font='700 14px ui-monospace,monospace';
      ctx.fillText('クリック / SPACE でタイトルへ', VW/2, VH*0.62);
    } else if (state==='allclear') {
      ctx.fillStyle='rgba(0,0,30,0.55)'; ctx.fillRect(0,0,VW,VH);
      ctx.fillStyle='#ffe65a'; ctx.font='800 40px ui-monospace,monospace';
      ctx.fillText('ALL CLEAR!', VW/2, VH*0.34);
      ctx.fillStyle='#7df9ff'; ctx.font='700 17px ui-monospace,monospace';
      ctx.fillText('銀河に平和が戻った——', VW/2, VH*0.34+34);
      ctx.fillStyle='#fff'; ctx.font='800 22px ui-monospace,monospace';
      ctx.fillText('SCORE '+pad(score,8), VW/2, VH*0.5);
      ctx.font='700 15px ui-monospace,monospace'; ctx.fillStyle='#ffe65a';
      ctx.fillText('最高コンボ ×'+comboBest, VW/2, VH*0.5+28);
      ctx.fillStyle=`rgba(255,255,255,${0.5+Math.sin(time*4)*0.4})`;
      ctx.font='700 16px ui-monospace,monospace';
      ctx.fillText('クリック / SPACE でタイトルへ', VW/2, VH*0.66);
    }
  }

  //========================================================================
  // 入力（状態遷移用キーフック）
  //========================================================================
  let autoFire = true;       // 押しっぱ不要のオートショット
  let bombKeyOnce = false;

  function handleStateKeys() {
    // タイトル/GO/クリア でのクリック・スペース・C は press()/keydown 経由
  }

  function clickAdvance() {
    Audio.init(); Audio.resume();
    if (state==='title') { startGame(); }
    else if (state==='gameover') { state='title'; stateT=0; Audio.playMusic(MUSIC.title); }
    else if (state==='allclear') { state='title'; stateT=0; Audio.playMusic(MUSIC.title); }
  }

  //========================================================================
  // メインループ
  //========================================================================
  let last = 0, raf;
  function frame(now) {
    const dt = Math.min((now-last)/1000, 1/30) || 0;
    last = now;
    update(dt);
    render();
    raf = requestAnimationFrame(frame);
  }

  //========================================================================
  // 起動
  //========================================================================
  function boot() {
    cvs = document.getElementById('c');
    ctx = cvs.getContext('2d');
    fitScreen();
    addEventListener('resize', fitScreen);
    Input.on();
    // 状態遷移クリック
    cvs.addEventListener('pointerdown', () => { if (state!=='play') clickAdvance(); });
    addEventListener('keydown', e => {
      if (e.code==='Space' && state!=='play') clickAdvance();
      if (e.code==='KeyC' && state==='gameover') continueGame();
      if (e.code==='KeyP' && state==='play') pauseFlag=!pauseFlag;
    });
    resetRun();
    state = 'title'; stateT = 0; time = 0;
    Audio.init(); Audio.playMusic(MUSIC.title);
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }

  //========================================================================
  // ヘッドレス検証用 API
  //========================================================================
  function headlessInit() {
    headless = true; Audio.setHeadless(true);
    srand(12345);
    resetRun();
    state='play'; stateT=0; time=0;
    startStage(0);
  }
  function headlessStep(dt, ai) {
    // ai = {dx,dy,fire,bomb}
    // 簡易オートパイロット入力を player に直接反映
    const p = player;
    if (state==='play' && p.alive) {
      p.fireT -= dt; p.missileT -= dt; p.inv=Math.max(0,p.inv-dt);
      p.x = clamp(p.x + ai.dx*330*dt, 12, VW-12);
      p.y = clamp(p.y + ai.dy*330*dt, 30, VH-20);
      if (ai.fire) playerFire();
      if (ai.bomb && bombs>0) doBomb();
      // 以下、update の play 部分（入力以外）
      time+=dt; stats.frames++;
      Audio.tickMusic(dt);
      shake=Math.max(0,shake-dt*16);
      updateStars(dt); updateStage(dt); updateEnemies(dt); updateBullets(dt);
      updateMissiles(dt); updateItems(dt); updateParticles(dt); updateTexts(dt);
      if (comboTimer>0){comboTimer-=dt; if(comboTimer<=0)combo=0;}
      collisions();
      if (state==='dead') { // 即時復活処理（テスト継続）
        if (lives>0){lives--; respawn();} else { lives=3; respawn(); } // テストは死んでも継続
      }
    } else {
      // 非play状態は通常 update を回す（stageclear→次面へ）
      update(dt);
      if (state==='gameover') { state='play'; lives=3; respawn(); }
    }
    return snapshot();
  }
  function snapshot() {
    return {
      state, stage: stageMgr?stageMgr.idx:-1, phase: stageMgr?stageMgr.phase:'',
      score, lives, bombs, power, combo,
      enemies: enemies.length, ebullets: ebullets.length, pbullets: pbullets.length,
      bossHp: stageMgr&&stageMgr.boss&&!stageMgr.boss.dead ? stageMgr.boss.hp : null,
      stats: Object.assign({}, stats),
      playerX: player.x, playerY: player.y, playerAlive: player.alive,
    };
  }

  return { boot, headlessInit, headlessStep, snapshot,
    // テスト用に内部参照を一部公開
    _peek(){ return { enemies, ebullets, player, stageMgr, state, score }; } };
})();

//============================================================================
// 5. 起動（ブラウザ）/ ヘッドレス公開
//============================================================================
if (typeof window !== 'undefined' && document.getElementById('c')) {
  Game.boot();
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Game, srand };
}
// グローバルにも公開（ヘッドレステストが window 経由で叩けるように）
if (typeof window !== 'undefined') window.FableStriker = Game;
