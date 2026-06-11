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
  let ac = null, master = null, comp = null, musicBus = null, sfxBus = null;
  let reverb = null, revGain = null, delay = null, delayFb = null, delayMix = null;
  let enabled = true, headless = false;
  let seq = null, step = 0, nextNoteTime = 0;

  function makeImpulse(dur, decay) {
    const rate = ac.sampleRate, len = Math.floor(rate * dur);
    const buf = ac.createBuffer(2, len, rate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (rnd()*2-1) * Math.pow(1 - i/len, decay);
    }
    return buf;
  }
  function init() {
    if (headless || ac) return;
    try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ac = null; return; }
    master = ac.createGain(); master.gain.value = 0.8;
    comp = ac.createDynamicsCompressor();
    comp.threshold.value = -15; comp.knee.value = 24; comp.ratio.value = 3.2;
    comp.attack.value = 0.004; comp.release.value = 0.18;
    master.connect(comp); comp.connect(ac.destination);
    // 空間系: リバーブ
    reverb = ac.createConvolver(); reverb.buffer = makeImpulse(2.6, 2.4);
    revGain = ac.createGain(); revGain.gain.value = 0.32;
    reverb.connect(revGain); revGain.connect(master);
    // 空間系: ピンポン風ディレイ
    delay = ac.createDelay(0.8); delay.delayTime.value = 0.26;
    delayFb = ac.createGain(); delayFb.gain.value = 0.36;
    delayMix = ac.createGain(); delayMix.gain.value = 0.28;
    delay.connect(delayFb); delayFb.connect(delay);
    delay.connect(delayMix); delayMix.connect(master);
    // バス
    musicBus = ac.createGain(); musicBus.gain.value = 0.5; musicBus.connect(master); musicBus.connect(reverb);
    sfxBus = ac.createGain(); sfxBus.gain.value = 0.6; sfxBus.connect(master);
  }
  function resume() { if (ac && ac.state === 'suspended') ac.resume(); }
  function setHeadless(v) { headless = v; }
  function midi(n) { return 440 * Math.pow(2, (n - 69) / 12); }

  // --- スケジュール型ノイズ ---
  function noise(t, dur, vol, ftype, ffreq, dest) {
    const len = Math.max(1, Math.floor(ac.sampleRate * dur));
    const buf = ac.createBuffer(1, len, ac.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (rnd()*2-1) * (1 - i/len);
    const src = ac.createBufferSource(); src.buffer = buf;
    const f = ac.createBiquadFilter(); f.type = ftype || 'lowpass'; f.frequency.value = ffreq || 2000;
    const g = ac.createGain(); g.gain.value = vol;
    src.connect(f); f.connect(g); g.connect(dest || sfxBus); src.start(t);
  }

  //==================== 楽器（スケジュール時刻 t を受ける） ====================
  // 厚いベース: デチューン鋸2 + サブ正弦 + ローパス包絡
  function vBass(freq, t, dur, vol) {
    const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.Q.value = 7;
    f.frequency.setValueAtTime(1000, t); f.frequency.exponentialRampToValueAtTime(240, t + dur);
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    f.connect(g); g.connect(musicBus);
    for (let i = 0; i < 2; i++) { const o = ac.createOscillator(); o.type='sawtooth'; o.frequency.value=freq; o.detune.value=(i?9:-9); o.connect(f); o.start(t); o.stop(t+dur+0.05); }
    const sub = ac.createOscillator(); sub.type='sine'; sub.frequency.value=freq/2;
    const sg = ac.createGain(); sg.gain.setValueAtTime(0.0001,t); sg.gain.exponentialRampToValueAtTime(vol*0.9,t+0.02); sg.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    sub.connect(sg); sg.connect(musicBus); sub.start(t); sub.stop(t+dur+0.05);
  }
  // リード: スーパーソウ(3デチューン) + フィルタ包絡 + ディレイ送り
  function vLead(freq, t, dur, vol) {
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    const f = ac.createBiquadFilter(); f.type='lowpass'; f.Q.value=5;
    f.frequency.setValueAtTime(freq*6 + 1400, t); f.frequency.exponentialRampToValueAtTime(freq*2 + 500, t + dur);
    f.connect(g); g.connect(musicBus); g.connect(delay);
    for (let i = 0; i < 3; i++) { const o = ac.createOscillator(); o.type='sawtooth'; o.frequency.value=freq; o.detune.value=(i-1)*14; o.connect(f); o.start(t); o.stop(t+dur+0.05); }
  }
  // パッド: 緩やかな倍音の層（空気感）
  function vPad(freq, t, dur, vol) {
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + dur*0.4);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    const f = ac.createBiquadFilter(); f.type='lowpass'; f.frequency.value=freq*4+600;
    f.connect(g); g.connect(musicBus); g.connect(reverb);
    [0,7,12].forEach((semi,i)=>{ const o=ac.createOscillator(); o.type='triangle'; o.frequency.value=freq*Math.pow(2,semi/12); o.detune.value=(i-1)*6; o.connect(f); o.start(t); o.stop(t+dur+0.05); });
  }
  function dKick(t, vol) {
    const o = ac.createOscillator(); o.type='sine';
    o.frequency.setValueAtTime(160, t); o.frequency.exponentialRampToValueAtTime(46, t + 0.13);
    const g = ac.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.22);
    noise(t, 0.015, 0.25, 'highpass', 2600, master); // click
  }
  function dSnare(t, vol) {
    noise(t, 0.2, vol*0.85, 'highpass', 1400, master);
    noise(t, 0.06, vol*0.4, 'bandpass', 2400, reverb);
    const o = ac.createOscillator(); o.type='triangle'; o.frequency.value=340;
    const g = ac.createGain(); g.gain.setValueAtTime(vol*0.5, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.14);
  }
  function dHat(t, vol) { noise(t, 0.045, vol*0.5, 'highpass', 8000, sfxBus); }

  //==================== SE ====================
  function blip(freq, dur, type, vol, slideTo, dest, rev) {
    if (!ac) return; const t = ac.currentTime;
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest || sfxBus); if (rev) g.connect(reverb);
    o.start(t); o.stop(t + dur + 0.02);
  }
  function nz(dur, vol, lp, rev) { if (!ac) return; noise(ac.currentTime, dur, vol, 'lowpass', lp, rev ? reverb : sfxBus); }
  const SFX = {
    shot()   { blip(1300, 0.05, 'square', 0.05, 2400); blip(760, 0.04, 'sawtooth', 0.035, 1500); },
    enemyShot(){ blip(440, 0.12, 'sawtooth', 0.05, 180); },
    hit()    { nz(0.04, 0.14, 3200); blip(1800, 0.03, 'square', 0.04, 2600); },
    pop()    { nz(0.16, 0.32, 1600, true); blip(520, 0.16, 'triangle', 0.12, 110); blip(300, 0.18, 'sawtooth', 0.1, 80, null, true); },
    bigboom(){ nz(0.6, 0.55, 800, true); blip(130, 0.6, 'sawtooth', 0.3, 38, null, true); blip(70, 0.8, 'sine', 0.28, 28); },
    power()  { [660,990,1320,1760].forEach((f,i)=>setTimeout(()=>blip(f,0.16,'triangle',0.2,null,null,true),i*55)); },
    bomb()   { nz(0.7, 0.45, 1400, true); blip(180, 0.7, 'sine', 0.32, 1400); blip(900, 0.5, 'sawtooth', 0.18, 60, null, true); },
    extend() { [523,659,784,1046,1318].forEach((f,i)=>setTimeout(()=>blip(f,0.2,'triangle',0.22,null,null,true),i*85)); },
    coin(f)  { blip(f || 1200, 0.07, 'square', 0.1, (f||1200)*1.5); },
    warning(){ blip(466,0.32,'sawtooth',0.16,null,null,true); blip(440,0.32,'square',0.1); setTimeout(()=>{blip(466,0.32,'sawtooth',0.16,null,null,true);blip(440,0.32,'square',0.1);},400); },
    damage() { nz(0.35, 0.42, 600, true); blip(220, 0.35, 'sawtooth', 0.3, 55); },
    select() { blip(880, 0.08, 'square', 0.14, 1320, null, true); },
  };
  function sfx(name, arg) { if (!ac || !enabled) return; try { SFX[name] && SFX[name](arg); } catch (e) {} }

  //==================== BGM ステップシーケンサ ====================
  // seq = { bpm, len, bass[], lead[], drums[], pad?[] } 数値=半音 / null=休符
  function playMusic(s) { seq = s; step = 0; nextNoteTime = ac ? ac.currentTime : 0; }
  function stopMusic() { seq = null; }
  function tickMusic(dt) {
    if (!ac || !seq || !enabled) return;
    const spb = 60 / seq.bpm / 2; // 8分音符
    while (nextNoteTime < ac.currentTime + 0.12) {
      const t = Math.max(nextNoteTime, ac.currentTime + 0.001);
      const i = step % seq.len;
      const bn = seq.bass[i % seq.bass.length];
      if (bn != null) vBass(midi(bn), t, spb*1.7, 0.5);
      const ln = seq.lead[i % seq.lead.length];
      if (ln != null) vLead(midi(ln), t, spb*1.25, 0.16);
      if (seq.pad) { const pn = seq.pad[i % seq.pad.length]; if (pn != null) vPad(midi(pn), t, spb*4, 0.05); }
      if (seq.drums) { const dr = seq.drums[i % seq.drums.length];
        if (dr === 1) dHat(t, 0.5); else if (dr === 2) dKick(t, 0.95); else if (dr === 3) dSnare(t, 0.6); }
      nextNoteTime += spb; step++;
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
    pad:  [57,B,B,B,64,B,B,B,55,B,B,B,60,B,B,B],
    drums:[2,1,3,1,2,1,3,1,2,1,3,1,2,1,3,1] },
  stage1: { bpm: 132, len: 16,
    bass: [45,45,57,45,50,50,57,50,43,43,55,43,48,48,55,48],
    lead: [69,B,76,B,72,B,69,72,74,B,77,B,76,B,72,B],
    pad:  [57,B,B,B,62,B,B,B,55,B,B,B,60,B,B,B],
    drums:[2,1,1,3,2,1,1,3,2,1,1,3,2,1,3,1] },
  stage2: { bpm: 144, len: 16,
    bass: [40,40,47,40,43,43,50,43,38,38,45,38,41,41,48,41],
    lead: [64,67,71,67,72,71,67,64,65,69,72,69,67,B,64,B],
    pad:  [52,B,B,B,55,B,B,B,50,B,B,B,53,B,B,B],
    drums:[2,1,3,1,2,3,1,3,2,1,3,1,2,3,3,1] },
  stage3: { bpm: 152, len: 16,
    bass: [33,33,40,45,35,35,42,47,31,31,38,43,36,36,43,48],
    lead: [69,72,76,79,77,76,72,69,71,74,77,81,79,77,74,71],
    pad:  [57,B,B,B,59,B,B,B,55,B,B,B,60,B,B,B],
    drums:[2,1,3,1,2,1,3,1,2,3,1,3,2,1,3,3] },
  boss: { bpm: 160, len: 16,
    bass: [40,40,40,47,40,40,46,45,38,38,38,45,43,42,41,40],
    lead: [76,79,83,79,77,80,B,76,74,77,81,77,76,B,72,B],
    pad:  [52,B,B,B,53,B,B,B,50,B,B,B,52,B,B,B],
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
  let pbullets, ebullets, enemies, items, parts, texts, missiles, stars, shocks;
  let player, stageMgr, time;

  //--- グロー用スプライト（加算合成で発光を表現、色別にプリレンダ） ---
  const GLOW = {};
  function buildGlows() {
    if (headless) return;
    const cols = { white:'255,255,255', cyan:'130,245,255', blue:'90,160,255',
      red:'255,80,110', orange:'255,150,70', yellow:'255,225,90', magenta:'255,120,235', green:'150,255,160' };
    for (const k in cols) {
      const c = document.createElement('canvas'); c.width = c.height = 64;
      const g = c.getContext('2d');
      const gr = g.createRadialGradient(32,32,0,32,32,32);
      gr.addColorStop(0, `rgba(${cols[k]},1)`);
      gr.addColorStop(0.4, `rgba(${cols[k]},0.45)`);
      gr.addColorStop(1, `rgba(${cols[k]},0)`);
      g.fillStyle = gr; g.fillRect(0,0,64,64);
      GLOW[k] = c;
    }
  }
  function glow(sprite, x, y, size, alpha) {
    if (!sprite) return;
    ctx.globalAlpha = alpha;
    ctx.drawImage(sprite, x - size/2, y - size/2, size, size);
    ctx.globalAlpha = 1;
  }
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
    parts = []; texts = []; missiles = []; stars = makeStars(); shocks = [];
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
  function addShock(x,y,r0,r1,life,col,lw){ shocks.push({x,y,r:r0,r1,life,max:life,col:col||'#fff',lw:lw||3}); }
  function explosion(x,y,s){
    // 中心フラッシュ
    parts.push({x,y,vx:0,vy:0,life:0.14,max:0.14,col:'#fff',size:10*s,grav:0,kind:'flash'});
    // 衝撃波リング
    addShock(x,y,4*s,42*s,0.3,'rgba(255,210,120,', 2.5*s);
    // 火花（加算）
    for(let i=0;i<14*s+5;i++){ const a=rr(0,TAU),v=rr(60,320)*s; parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:rr(0.3,0.7),max:0.7,col:rnd()<0.5?'#ffe65a':'#ff8c3b',size:rr(2,5)*s,grav:120,kind:'spark'}); }
    // 煙（通常合成・暗め）
    for(let i=0;i<5*s+2;i++){ const a=rr(0,TAU),v=rr(10,60)*s; parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-20,life:rr(0.5,1.0),max:1.0,col:'#3a2a28',size:rr(5,11)*s,grav:-10,kind:'smoke'}); }
    // 残骸
    for(let i=0;i<4*s;i++){ const a=rr(0,TAU),v=rr(80,200)*s; parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:rr(0.4,0.8),max:0.8,col:'#9a7a5a',size:rr(1.5,3)*s,grav:300,kind:'debris',rot:rr(0,TAU),vr:rr(-10,10)}); }
  }
  function bigExplosion(x,y,s){
    explosion(x,y,s*1.5);
    addShock(x,y,8,120*s,0.6,'rgba(255,180,90,',5*s);
    addShock(x,y,4,70*s,0.45,'rgba(255,255,255,',3*s);
    parts.push({x,y,vx:0,vy:0,life:0.22,max:0.22,col:'#fff',size:40*s,grav:0,kind:'flash'});
    for(let k=0;k<6;k++) setTimeout(()=>{ if(!headless) explosion(x+rr(-46,46),y+rr(-46,46),s*0.8); },k*90);
    Audio.sfx('bigboom'); shake=Math.max(shake,9);
  }

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
    for (let i=parts.length-1;i>=0;i--){ const p=parts[i]; p.life-=dt; if(p.life<=0){parts.splice(i,1);continue;}
      p.vy+=(p.grav||0)*dt; p.x+=p.vx*dt; p.y+=p.vy*dt;
      if(p.kind==='smoke'){ p.vx*=0.94; p.vy*=0.94; }
      if(p.kind==='debris'){ p.rot+=(p.vr||0)*dt; }
    }
    if (shocks) for (let i=shocks.length-1;i>=0;i--){ const s=shocks[i]; s.life-=dt; if(s.life<=0){shocks.splice(i,1);continue;} s.r=lerp(s.r1,s.r,Math.max(0,s.life/s.max)); }
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
    { top:'#08182f', mid:'#0a2c4c', bot:'#0c4566', neb:'rgba(60,140,210,0.16)' }, // 蒼穹
    { top:'#2a0a08', mid:'#46110a', bot:'#6e220c', neb:'rgba(230,90,40,0.18)' },  // 熔鉄
    { top:'#120824', mid:'#1e0a36', bot:'#0a0820', neb:'rgba(150,70,220,0.18)' }, // 星核
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
    drawMissiles();
    drawBullets();
    drawPlayer();
    drawParticles();
    drawShocks();
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

  function rr2(i){ const x=Math.sin(i*91.7)*43758.5; return x-Math.floor(x); } // 安定擬似乱数(背景用)
  function drawBackground() {
    const idx = clamp(stageMgr?stageMgr.idx:0,0,2);
    const bg = stageBg[idx];
    const t = stageMgr ? stageMgr.bgT : time;
    // ベースグラデ
    const grad = ctx.createLinearGradient(0,0,0,VH);
    grad.addColorStop(0,bg.top); grad.addColorStop(0.5,bg.mid); grad.addColorStop(1,bg.bot);
    ctx.fillStyle=grad; ctx.fillRect(0,0,VW,VH);

    // 漂う星雲（巨大な放射グラデを加算）
    ctx.globalCompositeOperation='lighter';
    for (let i=0;i<4;i++){
      const nx = (rr2(i)*VW + Math.sin(t*0.1+i)*40);
      const ny = ((rr2(i+5)*VH*2 + t*22*(0.5+rr2(i)))%(VH+300))-150;
      const rad = 150 + rr2(i+2)*120;
      const ng = ctx.createRadialGradient(nx,ny,0,nx,ny,rad);
      ng.addColorStop(0, bg.neb); ng.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=ng; ctx.fillRect(nx-rad,ny-rad,rad*2,rad*2);
    }
    ctx.globalCompositeOperation='source-over';

    if (idx === 0) { // 蒼穹: 雲＋海面のうねりに光沢
      ctx.globalCompositeOperation='lighter';
      for (let i=0;i<6;i++){ const cy=((t*30 + i*150)%(VH+200))-100; const cx=rr2(i)*VW; const cr=60+rr2(i+3)*70;
        const cg=ctx.createRadialGradient(cx,cy,0,cx,cy,cr); cg.addColorStop(0,'rgba(150,200,255,0.10)'); cg.addColorStop(1,'rgba(150,200,255,0)'); ctx.fillStyle=cg; ctx.fillRect(cx-cr,cy-cr,cr*2,cr*2); }
      ctx.globalCompositeOperation='source-over';
      ctx.strokeStyle='rgba(90,180,230,0.5)'; ctx.lineWidth=2;
      for (let i=0;i<7;i++){ const y=((t*70 + i*110)%(VH+120))-60; ctx.beginPath(); for(let x=0;x<=VW;x+=18){ ctx.lineTo(x, y+Math.sin(x*0.03+t*2+i)*8); } ctx.stroke(); }
    } else if (idx === 1) { // 熔鉄: 下からの溶岩光＋上昇する火の粉＋岩シルエット
      const lava = ctx.createLinearGradient(0,VH,0,VH*0.55);
      const pulse = 0.4+Math.sin(t*2)*0.12;
      lava.addColorStop(0,`rgba(255,90,30,${pulse})`); lava.addColorStop(1,'rgba(255,90,30,0)');
      ctx.fillStyle=lava; ctx.fillRect(0,VH*0.55,VW,VH*0.45);
      ctx.fillStyle='#1a0805';
      for (let i=0;i<8;i++){ const y=((t*120+i*120)%(VH+160))-80; const w=rr2(i)*90+50; const x=rr2(i+9)*(VW-w); ctx.fillRect(x,y,w,18); ctx.fillRect(x+w*0.3,y-10,w*0.4,12); }
      ctx.globalCompositeOperation='lighter';
      for (let i=0;i<22;i++){ const ex=(rr2(i)*VW + Math.sin(t*1.5+i)*16); const ey=((VH - (t*90 + i*60)%(VH+100))); const a=0.5+0.5*Math.sin(t*4+i);
        glow(GLOW.orange, ex, ey, 7, a*0.5); }
      ctx.globalCompositeOperation='source-over';
    } else { // 星核要塞: 奥行きグリッド＋スクロールする構造物＋エネルギー導管
      ctx.strokeStyle='rgba(120,80,200,0.35)'; ctx.lineWidth=1;
      const off=(t*120)%60;
      for (let y=-60+off;y<VH;y+=60){ const p=(y/VH); ctx.globalAlpha=0.2+p*0.3; ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(VW,y); ctx.stroke(); }
      for (let x=0;x<=VW;x+=60){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,VH); ctx.stroke(); }
      ctx.globalAlpha=1;
      // 両端の構造物
      ctx.fillStyle='#160a26';
      for (let i=0;i<10;i++){ const y=((t*150+i*150)%(VH+200))-100; const h=60+rr2(i)*60; const w=20+rr2(i+4)*30;
        ctx.fillRect(0,y,w,h); ctx.fillRect(VW-w-rr2(i+1)*20,y+30,w,h);
        ctx.fillStyle='rgba(180,120,255,0.5)'; ctx.fillRect(w-3,y+6,2,h-12); ctx.fillStyle='#160a26'; }
      // 中央エネルギー導管
      ctx.globalCompositeOperation='lighter';
      for (let i=0;i<3;i++){ const cx=VW*(0.3+i*0.2); glow(GLOW.magenta, cx, ((t*200+i*240)%(VH+100))-50, 30, 0.3); }
      ctx.globalCompositeOperation='source-over';
    }
  }

  function drawStars() {
    ctx.globalCompositeOperation='lighter';
    for (const s of stars) {
      const tw = 0.6 + 0.4*Math.sin(time*3 + s.x);
      const a = (0.3 + s.z*0.6) * tw;
      const sz = s.layer*0.9 + 0.7;
      if (s.layer===2) { glow(GLOW.white, s.x, s.y, sz*4, a*0.5); }
      ctx.fillStyle = `rgba(200,230,255,${a})`;
      ctx.fillRect(s.x, s.y, sz, sz);
    }
    ctx.globalCompositeOperation='source-over';
  }
  function drawShocks() {
    ctx.globalCompositeOperation='lighter';
    for (const s of shocks) {
      const a = clamp(s.life/s.max,0,1);
      ctx.strokeStyle = s.col + (a*0.9).toFixed(3) + ')';
      ctx.lineWidth = s.lw*a + 0.5;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, TAU); ctx.stroke();
    }
    ctx.globalCompositeOperation='source-over';
  }

  function drawPlayer() {
    const p = player;
    if (!p.alive) return;
    if (p.inv>0 && Math.floor(time*20)%2===0) ctx.globalAlpha=0.45;
    // 機体下の発光オーラ
    ctx.globalCompositeOperation='lighter';
    glow(GLOW.cyan, p.x, p.y, 56, 0.35);
    // エンジン炎（多層・揺らぎ）
    const fl = 14 + Math.sin(p.exhaust*45)*5;
    glow(GLOW.cyan, p.x, p.y+16, 22, 0.6);
    ctx.fillStyle='rgba(180,240,255,0.9)';
    ctx.beginPath(); ctx.moveTo(p.x-4,p.y+8); ctx.lineTo(p.x+4,p.y+8); ctx.lineTo(p.x,p.y+8+fl); ctx.closePath(); ctx.fill();
    ctx.fillStyle='#ffffff';
    ctx.beginPath(); ctx.moveTo(p.x-2,p.y+8); ctx.lineTo(p.x+2,p.y+8); ctx.lineTo(p.x,p.y+8+fl*0.6); ctx.closePath(); ctx.fill();
    ctx.globalCompositeOperation='source-over';

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.bankX*0.32);
    // 翼（後方）
    ctx.fillStyle='#3a6ea8';
    ctx.beginPath(); ctx.moveTo(-7,2); ctx.lineTo(-17,9); ctx.lineTo(-14,12); ctx.lineTo(-5,9); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(7,2); ctx.lineTo(17,9); ctx.lineTo(14,12); ctx.lineTo(5,9); ctx.closePath(); ctx.fill();
    // 機体本体（金属グラデ）
    const bg = ctx.createLinearGradient(-12,0,12,0);
    bg.addColorStop(0,'#6f9fc8'); bg.addColorStop(0.5,'#eaf6ff'); bg.addColorStop(1,'#6f9fc8');
    ctx.fillStyle=bg; ctx.strokeStyle='#bfeaff'; ctx.lineWidth=1.2;
    ctx.beginPath();
    ctx.moveTo(0,-17); ctx.lineTo(5,-4); ctx.lineTo(9,8); ctx.lineTo(4,7);
    ctx.lineTo(2,13); ctx.lineTo(-2,13); ctx.lineTo(-4,7); ctx.lineTo(-9,8);
    ctx.lineTo(-5,-4); ctx.closePath(); ctx.fill(); ctx.stroke();
    // パネルライン
    ctx.strokeStyle='rgba(40,70,110,0.6)'; ctx.lineWidth=0.8;
    ctx.beginPath(); ctx.moveTo(0,-14); ctx.lineTo(0,11); ctx.stroke();
    // ノーズの発光
    ctx.fillStyle='#bff0ff'; ctx.beginPath(); ctx.moveTo(0,-17); ctx.lineTo(2,-9); ctx.lineTo(-2,-9); ctx.closePath(); ctx.fill();
    // コックピット（発光）
    const cg = ctx.createRadialGradient(0,-3,0,0,-3,5);
    cg.addColorStop(0,'#bff0ff'); cg.addColorStop(1,'#1d5da8');
    ctx.fillStyle=cg; ctx.beginPath(); ctx.ellipse(0,-3,3,5,0,0,TAU); ctx.fill();
    ctx.restore();
    ctx.globalAlpha=1;
    // 当たり判定点（被弾範囲の可視化 = 小判定の明示）
    if (Input.down('ShiftLeft')||Input.down('ShiftRight')) {
      ctx.globalCompositeOperation='lighter'; glow(GLOW.red, p.x,p.y, 22, 0.8); ctx.globalCompositeOperation='source-over';
      ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(p.x,p.y,p.r-1,0,TAU); ctx.fill();
      ctx.strokeStyle='#ff3355'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.arc(p.x,p.y,p.r+2,0,TAU); ctx.stroke();
    }
  }

  const TINTS = ['#6fd0ff','#ff9a5a','#c98aff'];
  const TINTGLOW = ['cyan','orange','magenta'];
  function drawEnemies() {
    for (const e of enemies) {
      const col = TINTS[e.tint%3];
      // グローオーラ
      ctx.globalCompositeOperation='lighter';
      glow(GLOW[TINTGLOW[e.tint%3]], e.x, e.y, e.r*(e.kind==='zako'?2.4:4), e.kind==='zako'?0.4:0.5);
      ctx.globalCompositeOperation='source-over';
      ctx.save(); ctx.translate(e.x,e.y);
      if (e.kind === 'boss' || e.kind === 'midboss') drawBoss(e, col);
      else drawZako(e, col);
      ctx.restore();
      if (e.kind!=='zako') drawBossHP(e);
    }
  }
  function drawZako(e, col) {
    const flash = e.flash>0;
    ctx.rotate(Math.sin(e.t*2)*0.1);
    const r = e.r;
    // 金属グラデ本体
    const g = ctx.createLinearGradient(-r,0,r,0);
    g.addColorStop(0,'#1a2436'); g.addColorStop(0.5, flash?'#fff':col); g.addColorStop(1,'#1a2436');
    ctx.fillStyle = flash ? '#fff' : g;
    ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth=1.2;
    ctx.beginPath();
    ctx.moveTo(0, r); ctx.lineTo(r*0.9, -r*0.3); ctx.lineTo(r*0.45,-r);
    ctx.lineTo(-r*0.45,-r); ctx.lineTo(-r*0.9,-r*0.3); ctx.closePath();
    ctx.fill(); ctx.stroke();
    // パネルライン
    ctx.strokeStyle='rgba(255,255,255,0.25)'; ctx.lineWidth=0.7;
    ctx.beginPath(); ctx.moveTo(0,r); ctx.lineTo(0,-r); ctx.stroke();
    // 発光する目
    const eye = ctx.createRadialGradient(0,-r*0.2,0,0,-r*0.2,r*0.4);
    eye.addColorStop(0,'#fff'); eye.addColorStop(0.5, flash?'#fff':'#ffe65a'); eye.addColorStop(1,'rgba(255,120,40,0)');
    ctx.fillStyle=eye; ctx.beginPath(); ctx.arc(0,-r*0.2,r*0.42,0,TAU); ctx.fill();
  }
  function drawBoss(e, col) {
    const flash = e.flash>0;
    const r = e.r;
    // 回転リング2枚（反対回り）
    ctx.strokeStyle = flash?'#fff':'rgba(255,255,255,0.35)'; ctx.lineWidth=2;
    for (let k=0;k<2;k++){
      ctx.save(); ctx.rotate(e.t*(k?-0.8:1.1));
      ctx.beginPath();
      const rr0=r*(1.2+k*0.18), seg=k?5:7;
      for(let i=0;i<seg;i++){ const a0=i/seg*TAU, a1=a0+0.5; ctx.moveTo(Math.cos(a0)*rr0,Math.sin(a0)*rr0); ctx.arc(0,0,rr0,a0,a1); }
      ctx.stroke(); ctx.restore();
    }
    ctx.rotate(Math.sin(e.t*0.6)*0.06);
    // 外殻（金属＋スパイク）
    const g = ctx.createRadialGradient(-r*0.2,-r*0.2,r*0.1,0,0,r);
    g.addColorStop(0, flash?'#fff':'#e8f2ff'); g.addColorStop(0.35, flash?'#fff':col); g.addColorStop(1, '#10101e');
    ctx.fillStyle = g; ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 2;
    ctx.beginPath();
    const spikes = e.kind==='boss'?9:6;
    for (let i=0;i<spikes*2;i++){ const ang=i/(spikes*2)*TAU; const rad = (i%2===0)?r:r*0.66; ctx.lineTo(Math.cos(ang)*rad, Math.sin(ang)*rad); }
    ctx.closePath(); ctx.fill(); ctx.stroke();
    // パネル装甲
    ctx.strokeStyle='rgba(0,0,0,0.4)'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.arc(0,0,r*0.62,0,TAU); ctx.stroke();
    // 脈動コア（多層）
    const pulse = r*0.16 + Math.sin(e.t*6)*r*0.05;
    ctx.globalCompositeOperation='lighter';
    glow(GLOW.red, 0,0, r*1.1, 0.6);
    glow(GLOW.yellow, 0,0, pulse*4, 0.7);
    ctx.globalCompositeOperation='source-over';
    const core = ctx.createRadialGradient(0,0,0,0,0,r*0.34);
    core.addColorStop(0,'#fff'); core.addColorStop(0.4,'#ffd23b'); core.addColorStop(1,'#ff3355');
    ctx.fillStyle = flash?'#fff':core; ctx.beginPath(); ctx.arc(0,0,r*0.34,0,TAU); ctx.fill();
    ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(0,0,pulse,0,TAU); ctx.fill();
  }
  function drawBossHP(e) {
    const big = e.kind==='boss';
    const w = big?VW-40:150;
    const x = big?20:(e.x-w/2);
    const y = big?20:(e.y-e.r-16);
    const h = big?9:4;
    const frac = clamp(e.hp/e.maxhp,0,1);
    ctx.fillStyle='rgba(0,0,0,0.55)'; ctx.fillRect(x-1,y-1,w+2,h+2);
    const hg = ctx.createLinearGradient(x,0,x+w,0);
    if (big){ hg.addColorStop(0,'#ff3355'); hg.addColorStop(0.5,'#ff7a4a'); hg.addColorStop(1,'#ffd23b'); }
    else { hg.addColorStop(0,'#ff9a5a'); hg.addColorStop(1,'#ffd23b'); }
    ctx.fillStyle=hg; ctx.fillRect(x,y,w*frac,h);
    ctx.fillStyle='rgba(255,255,255,0.5)'; ctx.fillRect(x,y,w*frac,2);
    if (big) { ctx.fillStyle='#fff'; ctx.font='700 11px ui-monospace,monospace'; ctx.textAlign='left'; ctx.fillText('BOSS',x,y-4); }
  }

  function drawBullets() {
    // プレイヤー弾（発光＋伸び）
    ctx.globalCompositeOperation='lighter';
    for (const b of pbullets){
      glow(GLOW.cyan, b.x, b.y-2, 14, 0.6);
      ctx.fillStyle='#cdf4ff'; ctx.fillRect(b.x-1.6, b.y-8, 3.2, 13);
      ctx.fillStyle='#fff'; ctx.fillRect(b.x-0.8,b.y-7,1.6,10);
    }
    // 敵弾（外周グロー＋飽和中間＋白核）
    const gk = ['red','orange','magenta'];
    for (const b of ebullets){
      glow(GLOW[gk[b.tint%3]], b.x, b.y, b.r*3.6, 0.55);
    }
    ctx.globalCompositeOperation='source-over';
    for (const b of ebullets){
      const col = ['#ff4a6e','#ffa83a','#cf7aff'][b.tint%3];
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,TAU); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(b.x-b.r*0.25,b.y-b.r*0.25,b.r*0.4,0,TAU); ctx.fill();
    }
  }
  function drawMissiles() {
    ctx.globalCompositeOperation='lighter';
    for (const m of missiles){ glow(GLOW.yellow, m.x, m.y, 16, 0.6); }
    ctx.globalCompositeOperation='source-over';
    for (const m of missiles){ ctx.save(); ctx.translate(m.x,m.y); ctx.rotate(Math.atan2(m.vy,m.vx)+Math.PI/2);
      ctx.fillStyle='#fff'; ctx.fillRect(-1.6,-6,3.2,8); ctx.fillStyle='#ffce6a'; ctx.fillRect(-1.6,-2,3.2,5); ctx.restore(); }
  }
  function drawItems() {
    for (const it of items){
      const pulse = 1+Math.sin(it.t*8)*0.14;
      let col='#7df9ff', label='P', gk='cyan';
      if (it.type==='point_s'){col='#9fffa0';label='';gk='green';} else if(it.type==='point_l'){col='#ffe65a';label='';gk='yellow';}
      else if(it.type==='power'){col='#7df9ff';label='P';gk='cyan';} else if(it.type==='bomb_item'){col='#ffb84a';label='B';gk='orange';}
      else if(it.type==='extend_item'){col='#ff7ce5';label='1';gk='magenta';}
      ctx.globalCompositeOperation='lighter'; glow(GLOW[gk], it.x, it.y, 22, 0.5); ctx.globalCompositeOperation='source-over';
      ctx.save(); ctx.translate(it.x,it.y); ctx.scale(pulse,pulse);
      if (label){
        ctx.fillStyle=col; ctx.strokeStyle='#fff'; ctx.lineWidth=1;
        ctx.fillRect(-7,-7,14,14); ctx.strokeRect(-7,-7,14,14);
        ctx.fillStyle='#06121f'; ctx.font='800 11px ui-monospace,monospace'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(label,0,1); ctx.textBaseline='alphabetic';
      } else {
        ctx.fillStyle=col; ctx.beginPath();
        for(let i=0;i<8;i++){ const a=i/8*TAU; const rad=i%2?2.5:5.5; ctx.lineTo(Math.cos(a)*rad,Math.sin(a)*rad); }
        ctx.closePath(); ctx.fill();
      }
      ctx.restore();
    }
  }
  function drawParticles() {
    // 煙（通常合成・下層）
    for (const p of parts){ if(p.kind!=='smoke')continue; ctx.globalAlpha=Math.max(0,p.life/p.max)*0.5; ctx.fillStyle=p.col; ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,TAU); ctx.fill(); }
    ctx.globalAlpha=1;
    // 残骸（回転する破片）
    for (const p of parts){ if(p.kind!=='debris')continue; ctx.globalAlpha=Math.max(0,p.life/p.max); ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot||0); ctx.fillStyle=p.col; ctx.fillRect(-p.size,-p.size*0.5,p.size*2,p.size); ctx.restore(); }
    ctx.globalAlpha=1;
    // 火花・フラッシュ（加算）
    ctx.globalCompositeOperation='lighter';
    for (const p of parts){ if(p.kind==='smoke'||p.kind==='debris')continue; const a=Math.max(0,p.life/p.max);
      if(p.kind==='flash'){ glow(GLOW.white, p.x,p.y, p.size*4, a); continue; }
      glow(GLOW.yellow, p.x, p.y, p.size*3, a*0.5);
      ctx.globalAlpha=a; ctx.fillStyle=p.col; ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,TAU); ctx.fill();
    }
    ctx.globalAlpha=1; ctx.globalCompositeOperation='source-over';
  }
  function drawTexts() {
    ctx.textAlign='center';
    for (const t of texts){ ctx.globalAlpha=clamp(t.life,0,1); ctx.fillStyle=t.col; ctx.font=`800 ${t.size}px ui-monospace,Consolas,monospace`; ctx.fillText(t.txt,t.x,t.y); }
    ctx.globalAlpha=1;
  }

  function gtext(txt,x,y,col,glowCol,blur){ ctx.save(); ctx.shadowColor=glowCol||col; ctx.shadowBlur=blur||8; ctx.fillStyle=col; ctx.fillText(txt,x,y); ctx.restore(); }
  function drawHUD() {
    if (state==='title') return;
    // 上部パネル
    ctx.fillStyle='rgba(6,12,24,0.45)'; ctx.fillRect(0,0,VW,42);
    ctx.fillStyle='rgba(125,249,255,0.3)'; ctx.fillRect(0,42,VW,1);
    ctx.textAlign='left';
    ctx.fillStyle='#7da8c8'; ctx.font='700 11px ui-monospace,Consolas,monospace';
    ctx.fillText('SCORE', 12, 15);
    ctx.font='800 21px ui-monospace,Consolas,monospace';
    gtext(pad(score,8), 12, 35, '#eaf6ff', '#7df9ff', 6);
    ctx.textAlign='right';
    ctx.font='700 11px ui-monospace,Consolas,monospace'; ctx.fillStyle='#c8a85a';
    ctx.fillText('HI-SCORE', VW-12, 15);
    ctx.font='800 16px ui-monospace,Consolas,monospace';
    gtext(pad(hiscore,8), VW-12, 34, '#ffe65a', '#ffaa00', 6);
    // 下部パネル
    ctx.fillStyle='rgba(6,12,24,0.45)'; ctx.fillRect(0,VH-30,VW,30);
    ctx.fillStyle='rgba(125,249,255,0.3)'; ctx.fillRect(0,VH-31,VW,1);
    ctx.textAlign='left';
    // ライフ（機体アイコン）
    ctx.fillStyle='#ff7ce5';
    for (let i=0;i<Math.min(lives,6);i++){ const ix=16+i*16; ctx.beginPath(); ctx.moveTo(ix,VH-20); ctx.lineTo(ix+5,VH-10); ctx.lineTo(ix,VH-12); ctx.lineTo(ix-5,VH-10); ctx.closePath(); ctx.fill(); }
    if (lives>6){ ctx.font='700 12px ui-monospace,monospace'; ctx.fillText('×'+lives, 16+6*16, VH-11); }
    // ボム（アイコン）
    ctx.fillStyle='#ffb84a';
    for (let i=0;i<Math.min(bombs,6);i++){ const ix=130+i*15; ctx.beginPath(); ctx.arc(ix,VH-14,4,0,TAU); ctx.fill(); }
    if (bombs>6){ ctx.font='700 12px ui-monospace,monospace'; ctx.fillText('×'+bombs, 130+6*15, VH-10); }
    // パワーゲージ（発光セグメント）
    ctx.textAlign='right'; ctx.fillStyle='#7da8c8'; ctx.font='700 11px ui-monospace,monospace';
    ctx.fillText('POWER', VW-104, VH-11);
    for (let i=0;i<4;i++){ const gx=VW-96+i*22;
      if (i<=power){ ctx.save(); ctx.shadowColor='#7df9ff'; ctx.shadowBlur=8; ctx.fillStyle= i===3?'#ff7ce5':'#7df9ff'; ctx.fillRect(gx, VH-22, 18, 13); ctx.restore(); }
      else { ctx.fillStyle='rgba(40,70,100,0.8)'; ctx.fillRect(gx, VH-22, 18, 13); }
    }
    // コンボ（スケールポップ）
    if (combo>=3) {
      const pop = 1 + Math.max(0, (comboTimer>2 ? (comboTimer-2)*2 : 0));
      ctx.textAlign='center'; ctx.save(); ctx.translate(VW/2,60); ctx.scale(pop,pop);
      ctx.font='800 20px ui-monospace,monospace';
      gtext(combo+' HIT', 0, 0, '#ffe65a', '#ff8800', 10);
      ctx.font='800 14px ui-monospace,monospace';
      gtext('×'+comboMult().toFixed(1), 0, 18, '#fff', '#ff8800', 8);
      ctx.restore();
    }
    // WARNING
    if (stageMgr && stageMgr.phase==='warning') {
      const a = 0.5+Math.sin(time*12)*0.5;
      ctx.fillStyle=`rgba(120,0,20,${a*0.25})`; ctx.fillRect(0,VH/2-60,VW,120);
      ctx.fillStyle='#ff3355'; ctx.fillRect(0,VH/2-60,VW,2); ctx.fillRect(0,VH/2+58,VW,2);
      ctx.textAlign='center';
      ctx.font='800 46px ui-monospace,monospace';
      gtext('WARNING', VW/2, VH/2-12, `rgba(255,70,90,${0.6+a*0.4})`, '#ff0033', 16);
      ctx.font='700 18px ui-monospace,monospace';
      gtext('BOSS APPROACHING', VW/2, VH/2+18, '#fff', '#ff3355', 8);
    }
  }
  function pad(n, w){ n=Math.floor(n)+''; while(n.length<w) n='0'+n; return n; }

  function drawState() {
    ctx.textAlign='center';
    if (state==='title') {
      // ロゴ背後のグロー
      ctx.globalCompositeOperation='lighter';
      glow(GLOW.cyan, VW/2, VH*0.27, 360, 0.25);
      ctx.globalCompositeOperation='source-over';
      // タイトルロゴ（発光）
      const grad = ctx.createLinearGradient(0,VH*0.2,0,VH*0.30);
      grad.addColorStop(0,'#bff4ff'); grad.addColorStop(1,'#2d7bd6');
      ctx.save(); ctx.shadowColor='#7df9ff'; ctx.shadowBlur=24;
      ctx.fillStyle=grad; ctx.font='800 56px ui-monospace,Consolas,monospace';
      ctx.fillText('FABLE', VW/2, VH*0.27);
      ctx.fillStyle='#fff'; ctx.font='800 58px ui-monospace,Consolas,monospace';
      ctx.fillText('STRIKER', VW/2, VH*0.27+60);
      ctx.restore();
      ctx.fillStyle='#7df9ff'; ctx.font='700 15px ui-monospace,monospace';
      ctx.fillText('縦スクロールシューティング ／ 全3面', VW/2, VH*0.27+92);
      // 操作説明（枠つき）
      ctx.fillStyle='rgba(8,18,34,0.5)'; ctx.fillRect(VW*0.12, VH*0.52, VW*0.76, 92);
      ctx.strokeStyle='rgba(125,249,255,0.3)'; ctx.strokeRect(VW*0.12, VH*0.52, VW*0.76, 92);
      ctx.fillStyle='#cfe8ff'; ctx.font='700 13px ui-monospace,monospace';
      const lines=['移動: 矢印 / WASD / ドラッグ','ショット: Z / Space / タッチ（オートショット）','ボム: X  ／  低速+判定表示: Shift'];
      lines.forEach((l,i)=>ctx.fillText(l, VW/2, VH*0.52+26+i*24));
      ctx.font='800 22px ui-monospace,monospace';
      gtext('クリック / SPACE で START', VW/2, VH*0.80, `rgba(255,255,255,${0.55+Math.sin(time*4)*0.4})`, '#7df9ff', 12);
      ctx.fillStyle='#ffe65a'; ctx.font='700 13px ui-monospace,monospace';
      ctx.fillText('HI-SCORE  '+pad(hiscore,8), VW/2, VH*0.87);
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
    buildGlows();
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

  // 描画スモークテスト用フック: モックctxで全描画パスを1フレーム実行（例外検出用）
  function _renderTest(mockCtx, st) {
    const wasHeadless = headless; headless = false;
    ctx = mockCtx; cvs = { width: VW, height: VH }; sc = 1; ox = 0; oy = 0;
    const stub = mockCtx._stubImg || {};
    for (const k of ['white','cyan','blue','red','orange','yellow','magenta','green']) GLOW[k] = stub;
    resetRun();
    if (st !== 'title') { startStage(0); }
    // 描画対象を一通り出す
    spawnBoss(0); spawnMidboss(0); spawnWave('spinner', 0); spawnWave('turret', 1);
    for (let i=0;i<30;i++) eb(rr(0,VW), rr(0,VH), rr(0,TAU), 150, ri(0,2));
    explosion(VW/2, VH/2, 1.5); bigExplosion(120, 200, 1.0);
    spawnItem(200,300,'power'); spawnItem(220,300,'point_l'); spawnItem(240,300,'extend_item'); spawnItem(260,300,'bomb_item');
    missiles.push(makeMissile(100,200,1));
    addText(VW/2,VH/2,'TEST','#fff',1,20);
    combo = 25; comboTimer = 2.6;
    if (stageMgr) stageMgr.phase = 'warning';
    pauseFlag = (st === 'play');
    state = st;
    render();
    state = st; stageMgr && (stageMgr.phase = 'boss');
    render(); // boss フェーズ版もう一度
    headless = wasHeadless; pauseFlag = false;
  }

  return { boot, headlessInit, headlessStep, snapshot, _renderTest,
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
