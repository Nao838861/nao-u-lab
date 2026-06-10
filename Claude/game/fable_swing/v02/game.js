'use strict';
/* ============================================================
   FABLE SWING v02
   ホールドでフックに掴まり、離して飛ぶ。
   一番気持ちいい瞬間 = 最高のタイミングで手を離して大きく飛ぶ。
   v02: オンボーディング改善 — 最初のホールドがゲーム開始。
        ホバー待機 / 「離すと飛ぶ」体験直後ヒント / 落下レスキュー表示
   ============================================================ */

const cvs = document.getElementById('c');
const ctx = cvs.getContext('2d');

// ---- 論理解像度 960x540 / レターボックス ----
const VW = 960, VH = 540;
let sc = 1, ox = 0, oy = 0;
function resize() {
  cvs.width = innerWidth;
  cvs.height = innerHeight;
  sc = Math.min(innerWidth / VW, innerHeight / VH);
  ox = (innerWidth - VW * sc) / 2;
  oy = (innerHeight - VH * sc) / 2;
}
addEventListener('resize', resize);
resize();

// ---- 定数（チューニングの心臓部） ----
const G      = 1700;  // 重力 px/s^2
const RANGE  = 360;   // フック射程
const REEL   = 55;    // 掴まり中のロープ自動巻き取り px/s（振りが加速する）
const MINR   = 70;    // ロープ最短
const WINCH  = 1400;  // 射程外掴みの引き寄せ速度
const LAVA   = 505;   // 溶岩面 y
const VMAX   = 1500;  // 速度上限
const PR     = 11;    // プレイヤー半径

// ---- サウンド（WebAudio 直叩き） ----
let ac = null;
function initAudio() {
  if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} }
  if (ac && ac.state === 'suspended') ac.resume();
}
function tone(f, d, type, v, f2) {
  if (!ac) return;
  const t = ac.currentTime;
  const o = ac.createOscillator(), g = ac.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f, t);
  if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
  g.gain.setValueAtTime(v, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  o.connect(g); g.connect(ac.destination);
  o.start(t); o.stop(t + d);
}
const SCALE = [523, 587, 659, 784, 880, 1046, 1175, 1318]; // コンボ音階（ペンタ寄り）

// ---- 状態 ----
let mode = 'title'; // title | play | dead
let P, rope, holding, nodes, crystals, parts, pops, trail;
let genX, dist, crys, combo, comboT, bestCombo;
let shake, hitstop, deadT, camX, time = 0;
let started, attaches, runT, releaseHintDone; // v02 オンボーディング用
let best = 0, newBest = false;
try { best = +(localStorage.getItem('fable_swing_best') || 0); } catch (e) {}

function lerp(a, b, t) { return a + (b - a) * t; }
function rand(a, b) { return a + Math.random() * (b - a); }
function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
function hash(i) { const x = Math.sin(i * 127.1) * 43758.5453; return x - Math.floor(x); }

function reset() {
  P = { x: 0, y: 230, vx: 0, vy: 0 };
  rope = null; holding = false;
  nodes = []; crystals = []; parts = []; pops = []; trail = [];
  dist = 0; crys = 0; combo = 0; comboT = 0; bestCombo = 0;
  shake = 0; hitstop = 0; deadT = 0; camX = -280; newBest = false;
  started = false; attaches = 0; runT = 0; releaseHintDone = false;
  // 最初のノードはホバー位置から確実に届く場所に固定
  nodes.push({ x: 250, y: 160, ph: rand(0, 6) });
  genX = 250;
  gen(P.x + 1500);
}

// ---- 地形生成: フックノード列 + その下に結晶のアーチ ----
function gen(upto) {
  while (genX < upto) {
    const prev = nodes[nodes.length - 1];
    const opening = nodes.length < 4; // 序盤は素直な高さ・間隔で助走させる
    const gap = opening ? rand(215, 255)
                        : rand(210, 300 + Math.min(50, genX / 800)); // 進むほど少し広く
    const nx = genX + gap;
    const ny = opening ? rand(130, 210) : rand(90, 310);
    const n = { x: nx, y: ny, ph: rand(0, 6) };
    if (prev) {
      const m = 4 + (Math.random() * 3 | 0);
      for (let k = 0; k < m; k++) {
        const t = (k + 1) / (m + 1);
        const cy = Math.min(lerp(prev.y, ny, t) + 150 + Math.sin(t * Math.PI) * 130, LAVA - 70);
        crystals.push({ x: lerp(prev.x, nx, t), y: cy, ph: rand(0, 6) });
      }
    }
    nodes.push(n);
    genX = nx;
  }
  nodes = nodes.filter(n => n.x > camX - 400);
  crystals = crystals.filter(c => c.x > camX - 400);
}

// ---- フック対象の選択: 前方・上方のノードを優先 ----
function pickTarget() {
  let bestN = null, bs = -1e9;
  for (const n of nodes) {
    const dx = n.x - P.x, dy = n.y - P.y;
    const d = Math.hypot(dx, dy);
    if (d > RANGE || d < 30) continue;
    if (dx < -40) continue;          // ほぼ前方のみ
    if (n.y > P.y + 60) continue;    // 足元より下は掴まない
    const s = dx - d * 0.3 + (P.y - n.y) * 0.8;
    if (s > bs) { bs = s; bestN = n; }
  }
  return bestN;
}

function attach(n) {
  const d = Math.hypot(P.x - n.x, P.y - n.y);
  // 溶岩に弧が刺さらない長さに制限 → 長すぎる時はウィンチで引き寄せられる
  const len = Math.max(MINR, Math.min(d, LAVA - 30 - n.y));
  rope = { n, len };
  attaches++;
  hitstop = 0.03;
  shake = Math.max(shake, 3);
  burst(n.x, n.y, 8, '#7df9ff', 120);
  tone(170, 0.1, 'square', 0.13, 95);
}

function release() {
  if (!rope) return;
  const node = rope.n;
  rope = null;
  releaseHintDone = true;
  P.vx *= 1.07; P.vy *= 1.07; // リリースの「伸び」
  burst(P.x, P.y, 12, '#ffffff', 220);
  burst(node.x, node.y, 5, '#7df9ff', 90);
  tone(280, 0.18, 'sine', 0.12, 760);
}

function burst(x, y, num, col, spd) {
  for (let i = 0; i < num; i++) {
    const a = rand(0, Math.PI * 2), v = rand(spd * 0.3, spd);
    parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v,
                 life: rand(0.3, 0.7), max: 0.7, col, size: rand(1.5, 3.5), grav: 0 });
  }
}

function pop(x, y, txt, col) {
  pops.push({ x, y, txt, col, life: 1 });
}

function die() {
  if (mode !== 'play') return;
  mode = 'dead'; deadT = 0; rope = null;
  shake = 14;
  burst(P.x, LAVA, 36, '#ff8c3b', 420);
  burst(P.x, LAVA, 20, '#ffd23b', 300);
  tone(110, 0.6, 'sawtooth', 0.22, 38);
  tone(60, 0.8, 'sine', 0.2, 30);
  const m = meters();
  if (m > best) {
    best = m; newBest = true;
    try { localStorage.setItem('fable_swing_best', String(best)); } catch (e) {}
    setTimeout(() => { tone(660, 0.12, 'triangle', 0.15); }, 250);
    setTimeout(() => { tone(880, 0.12, 'triangle', 0.15); }, 380);
    setTimeout(() => { tone(1320, 0.25, 'triangle', 0.15); }, 510);
  }
}

function meters() { return Math.floor(dist / 40); }

function start() {
  reset();
  mode = 'play';
  tone(440, 0.1, 'triangle', 0.1, 660);
}

// ---- 入力: ホールド = 掴まる / 離す = 飛ぶ ----
function press() {
  initAudio();
  // タイトル/リトライではゲームを「ホバー待機」で開く。落下は最初のホールドから
  if (mode === 'title') { start(); return; }
  if (mode === 'dead') { if (deadT > 0.5) start(); return; }
  holding = true;
  if (!rope && started) { const t = pickTarget(); if (t) attach(t); }
}
function unpress() {
  holding = false;
  if (mode === 'play' && started) release();
}
addEventListener('pointerdown', e => { e.preventDefault(); press(); });
addEventListener('pointerup',   e => { e.preventDefault(); unpress(); });
addEventListener('keydown', e => {
  if (e.repeat) return;
  if (e.code === 'Space') { e.preventDefault(); press(); }
  if (e.code === 'KeyR' && mode === 'dead') { start(); }
});
addEventListener('keyup', e => { if (e.code === 'Space') unpress(); });

// ---- 更新 ----
function update(dt) {
  time += dt;
  if (hitstop > 0) { hitstop -= dt; return; }
  shake *= Math.pow(0.001, dt); if (shake < 0.1) shake = 0;
  updParts(dt);

  if (mode === 'dead') { deadT += dt; return; }
  if (mode !== 'play') return;

  // ---- ホバー待機: 最初のホールドが来るまで落ちない ----
  if (!started) {
    P.y = 230 + Math.sin(time * 1.8) * 8;
    if (holding) {
      const t = pickTarget();
      if (t) {
        attach(t);
        started = true;
        P.vx = 180; // 振りの初動を与える
      }
    }
    return;
  }

  runT += dt;
  comboT -= dt;
  if (comboT <= 0) combo = 0;

  // ホールド中で未接続なら、射程に入り次第すぐ掴む
  if (holding && !rope) { const t = pickTarget(); if (t) attach(t); }

  // 物理（3 サブステップで振り子を安定させる）
  const N = 3, h = dt / N;
  for (let i = 0; i < N; i++) {
    P.vy += G * h;
    if (rope) rope.len = Math.max(MINR, rope.len - REEL * h);
    P.x += P.vx * h;
    P.y += P.vy * h;
    if (rope) {
      const dx = P.x - rope.n.x, dy = P.y - rope.n.y;
      const d = Math.hypot(dx, dy);
      if (d > rope.len) {
        const ux = dx / d, uy = dy / d;
        const corr = Math.min(d - rope.len, WINCH * h);
        P.x -= ux * corr; P.y -= uy * corr;
        const vr = P.vx * ux + P.vy * uy;
        if (vr > 0) { P.vx -= vr * ux; P.vy -= vr * uy; }
      }
    }
    if (P.y < 26) { P.y = 26; if (P.vy < 0) P.vy = -P.vy * 0.45; }
    const sp = Math.hypot(P.vx, P.vy);
    if (sp > VMAX) { P.vx *= VMAX / sp; P.vy *= VMAX / sp; }
    if (P.y > LAVA - 8) { die(); return; }
  }

  // 軌跡
  trail.push({ x: P.x, y: P.y });
  if (trail.length > 22) trail.shift();

  // 結晶の取得（取るたびにコンボ音階が上がる）
  for (let i = crystals.length - 1; i >= 0; i--) {
    const c = crystals[i];
    if (Math.abs(c.x - P.x) > 30) continue;
    const dy = c.y + Math.sin(time * 2 + c.ph) * 4 - P.y;
    if (Math.hypot(c.x - P.x, dy) < 26) {
      crystals.splice(i, 1);
      combo++; comboT = 2.0; crys++;
      if (combo > bestCombo) bestCombo = combo;
      pop(c.x, c.y - 14, combo > 1 ? '✦ ×' + combo : '✦', '#ff7ce5');
      burst(c.x, c.y, 7, '#ff7ce5', 140);
      tone(SCALE[Math.min(combo - 1, SCALE.length - 1)], 0.14, 'triangle', 0.16);
    }
  }

  dist = Math.max(dist, P.x);
  gen(P.x + 1600);

  // 溶岩の火の粉
  if (Math.random() < dt * 8) {
    parts.push({ x: camX + rand(0, VW), y: LAVA, vx: rand(-20, 20), vy: rand(-120, -50),
                 life: rand(0.5, 1.2), max: 1.2, col: '#ff8c3b', size: rand(1, 2.5), grav: 60 });
  }

  // カメラ: 速度に応じて先読み
  const target = P.x - 330 - clamp(P.vx * 0.15, 0, 170);
  camX += (target - camX) * Math.min(1, 5 * dt);
}

function updParts(dt) {
  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i];
    p.life -= dt;
    if (p.life <= 0) { parts.splice(i, 1); continue; }
    p.vy += (p.grav || 0) * dt;
    p.x += p.vx * dt; p.y += p.vy * dt;
  }
  for (let i = pops.length - 1; i >= 0; i--) {
    const p = pops[i];
    p.life -= dt * 0.9; p.y -= 28 * dt;
    if (p.life <= 0) pops.splice(i, 1);
  }
}

// ---- 描画 ----
function render() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#05070f';
  ctx.fillRect(0, 0, cvs.width, cvs.height);
  ctx.setTransform(sc, 0, 0, sc, ox, oy);
  ctx.save();
  ctx.beginPath(); ctx.rect(0, 0, VW, VH); ctx.clip();

  // 背景グラデ
  const bg = ctx.createLinearGradient(0, 0, 0, VH);
  bg.addColorStop(0, '#0a1228'); bg.addColorStop(0.7, '#0c0f22'); bg.addColorStop(1, '#1a0c12');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, VW, VH);

  const shx = (Math.random() - 0.5) * shake * 2, shy = (Math.random() - 0.5) * shake * 2;

  // パララックス鍾乳石(2層)
  drawStalactites(0.25, 130, 170, 'rgba(22,32,60,1)');
  drawStalactites(0.5, 90, 110, 'rgba(34,46,84,1)');

  ctx.save();
  ctx.translate(-camX + shx, shy);

  // 天井
  ctx.fillStyle = '#1c2440';
  ctx.fillRect(camX - 10, 0, VW + 20, 22);

  // フックノード
  const tgt = (mode === 'play' && !rope) ? pickTarget() : null;
  for (const n of nodes) {
    const pulse = 10 + Math.sin(time * 3 + n.ph) * 2;
    const glow = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, 34);
    glow.addColorStop(0, 'rgba(125,249,255,0.25)'); glow.addColorStop(1, 'rgba(125,249,255,0)');
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(n.x, n.y, 34, 0, 7); ctx.fill();
    ctx.strokeStyle = n === tgt ? '#ffffff' : '#7df9ff';
    ctx.lineWidth = n === tgt ? 3 : 2;
    ctx.beginPath(); ctx.arc(n.x, n.y, pulse, 0, 7); ctx.stroke();
    ctx.fillStyle = '#bffcff';
    ctx.beginPath(); ctx.arc(n.x, n.y, 3, 0, 7); ctx.fill();
    if (n === tgt) {
      // 次に掴むノードの照準
      const rr = pulse + 8 + Math.sin(time * 8) * 2;
      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(n.x, n.y, rr, 0, 7); ctx.stroke();
      ctx.setLineDash([4, 8]);
      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.beginPath(); ctx.moveTo(P.x, P.y); ctx.lineTo(n.x, n.y); ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  // 結晶
  for (const c of crystals) {
    const cy = c.y + Math.sin(time * 2 + c.ph) * 4;
    const r = 7;
    ctx.save();
    ctx.translate(c.x, cy);
    ctx.rotate(Math.sin(time * 1.5 + c.ph) * 0.4);
    const cg = ctx.createRadialGradient(0, 0, 0, 0, 0, 18);
    cg.addColorStop(0, 'rgba(255,124,229,0.3)'); cg.addColorStop(1, 'rgba(255,124,229,0)');
    ctx.fillStyle = cg;
    ctx.beginPath(); ctx.arc(0, 0, 18, 0, 7); ctx.fill();
    ctx.fillStyle = '#ff7ce5';
    ctx.beginPath();
    ctx.moveTo(0, -r); ctx.lineTo(r * 0.7, 0); ctx.lineTo(0, r); ctx.lineTo(-r * 0.7, 0);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.5); ctx.lineTo(r * 0.3, 0); ctx.lineTo(0, r * 0.5); ctx.lineTo(-r * 0.3, 0);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  // ロープ
  if (rope) {
    ctx.strokeStyle = 'rgba(125,249,255,0.9)';
    ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(rope.n.x, rope.n.y); ctx.lineTo(P.x, P.y); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(rope.n.x, rope.n.y); ctx.lineTo(P.x, P.y); ctx.stroke();
  }

  // 軌跡
  if (mode === 'play') {
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < trail.length; i++) {
      const t = i / trail.length;
      ctx.fillStyle = `rgba(140,200,255,${t * 0.25})`;
      ctx.beginPath(); ctx.arc(trail[i].x, trail[i].y, PR * t * 0.8, 0, 7); ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  // プレイヤー（速度方向に伸びる）
  if (mode !== 'dead') {
    const sp = Math.hypot(P.vx, P.vy);
    const ang = Math.atan2(P.vy, P.vx);
    ctx.save();
    ctx.translate(P.x, P.y);
    ctx.rotate(ang);
    ctx.scale(1 + sp / 2800, Math.max(0.7, 1 - sp / 4500));
    const pg = ctx.createRadialGradient(0, 0, 0, 0, 0, PR * 2.2);
    pg.addColorStop(0, 'rgba(255,255,255,0.35)'); pg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = pg;
    ctx.beginPath(); ctx.arc(0, 0, PR * 2.2, 0, 7); ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(0, 0, PR, 0, 7); ctx.fill();
    ctx.restore();
  }

  // ---- v02 オンボーディングヒント（ワールド座標系） ----
  if (mode === 'play') {
    ctx.textAlign = 'center';
    if (!started) {
      // ホバー待機: 押しっぱなし誘導
      const a = 0.6 + Math.sin(time * 4) * 0.35;
      ctx.fillStyle = `rgba(255,255,255,${a})`;
      ctx.font = '800 26px ui-monospace,Consolas,monospace';
      ctx.fillText('押しっぱなしで フックに掴まる', P.x + 130, P.y - 70);
      ctx.font = '700 18px ui-monospace,Consolas,monospace';
      ctx.fillStyle = `rgba(125,249,255,${a})`;
      ctx.fillText('（クリック / SPACE を押したまま）', P.x + 130, P.y - 42);
    } else if (!releaseHintDone && rope && attaches === 1 && Math.hypot(P.vx, P.vy) > 420) {
      // 最初の振りが加速した瞬間にだけ「離す」を教える
      const a = 0.6 + Math.sin(time * 5) * 0.35;
      ctx.fillStyle = `rgba(255,210,59,${a})`;
      ctx.font = '800 26px ui-monospace,Consolas,monospace';
      ctx.fillText('離すと飛ぶ！', P.x, P.y - 50);
    }
  }

  // パーティクル
  for (const p of parts) {
    ctx.globalAlpha = Math.max(0, p.life / p.max);
    ctx.fillStyle = p.col;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, 7); ctx.fill();
  }
  ctx.globalAlpha = 1;

  // 溶岩
  const lg = ctx.createLinearGradient(0, LAVA - 60, 0, LAVA);
  lg.addColorStop(0, 'rgba(255,110,40,0)'); lg.addColorStop(1, 'rgba(255,110,40,0.35)');
  ctx.fillStyle = lg;
  ctx.fillRect(camX - 10, LAVA - 60, VW + 20, 60);
  ctx.beginPath();
  ctx.moveTo(camX - 10, VH + 10);
  for (let x = camX - 10; x <= camX + VW + 10; x += 24) {
    ctx.lineTo(x, LAVA + Math.sin(x * 0.02 + time * 2.2) * 4);
  }
  ctx.lineTo(camX + VW + 10, VH + 10);
  ctx.closePath();
  const lf = ctx.createLinearGradient(0, LAVA, 0, VH);
  lf.addColorStop(0, '#ff7a2e'); lf.addColorStop(0.3, '#e83a1f'); lf.addColorStop(1, '#7a0f14');
  ctx.fillStyle = lf;
  ctx.fill();

  // 浮かぶテキスト
  ctx.textAlign = 'center';
  ctx.font = '700 18px ui-monospace,Consolas,monospace';
  for (const p of pops) {
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = p.col;
    ctx.fillText(p.txt, p.x, p.y);
  }
  ctx.globalAlpha = 1;

  ctx.restore(); // world

  // ---- v02 落下レスキュー: 序盤、未接続で落下中なら大きく合図 ----
  if (mode === 'play' && started && !rope && runT < 30 && P.vy > 180 && P.y > 360) {
    const a = 0.55 + Math.sin(time * 10) * 0.4;
    ctx.textAlign = 'center';
    ctx.fillStyle = `rgba(255,140,59,${a})`;
    ctx.font = '800 52px ui-monospace,Consolas,monospace';
    ctx.fillText('ホールド！', VW / 2, VH / 2 - 40);
  }

  // ---- HUD ----
  ctx.textAlign = 'left';
  if (mode !== 'title') {
    ctx.fillStyle = '#eaf6ff';
    ctx.font = '700 34px ui-monospace,Consolas,monospace';
    ctx.fillText(meters() + 'm', 24, 48);
    ctx.fillStyle = '#ff7ce5';
    ctx.font = '700 20px ui-monospace,Consolas,monospace';
    ctx.fillText('✦ ' + crys, 24, 78);
    if (combo > 1 && mode === 'play') {
      ctx.fillStyle = '#ffd23b';
      ctx.fillText('×' + combo, 92, 78);
    }
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(234,246,255,0.55)';
    ctx.font = '700 20px ui-monospace,Consolas,monospace';
    ctx.fillText('BEST ' + best + 'm', VW - 24, 44);
  }

  // ---- タイトル / リザルト ----
  ctx.textAlign = 'center';
  if (mode === 'title') {
    ctx.fillStyle = 'rgba(5,7,15,0.45)';
    ctx.fillRect(0, 0, VW, VH);
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 64px ui-monospace,Consolas,monospace';
    ctx.fillText('FABLE SWING', VW / 2, 200);
    ctx.fillStyle = '#7df9ff';
    ctx.font = '700 24px ui-monospace,Consolas,monospace';
    ctx.fillText('ホールド: フックに掴まる ／ 離す: 飛ぶ', VW / 2, 268);
    ctx.fillStyle = `rgba(255,255,255,${0.5 + Math.sin(time * 4) * 0.4})`;
    ctx.font = '700 22px ui-monospace,Consolas,monospace';
    ctx.fillText('クリック / SPACE で開始', VW / 2, 330);
    if (best > 0) {
      ctx.fillStyle = 'rgba(234,246,255,0.5)';
      ctx.font = '700 18px ui-monospace,Consolas,monospace';
      ctx.fillText('BEST ' + best + 'm', VW / 2, 372);
    }
  } else if (mode === 'dead') {
    const a = Math.min(1, deadT * 2);
    ctx.fillStyle = `rgba(5,7,15,${a * 0.55})`;
    ctx.fillRect(0, 0, VW, VH);
    if (deadT > 0.3) {
      ctx.fillStyle = '#ff8c3b';
      ctx.font = '800 44px ui-monospace,Consolas,monospace';
      ctx.fillText('溶岩に落下', VW / 2, 200);
      ctx.fillStyle = '#eaf6ff';
      ctx.font = '700 26px ui-monospace,Consolas,monospace';
      ctx.fillText(meters() + 'm ／ ✦ ' + crys + ' ／ 最高コンボ ×' + Math.max(bestCombo, 1), VW / 2, 252);
      if (newBest) {
        ctx.fillStyle = `rgba(255,210,59,${0.6 + Math.sin(time * 6) * 0.4})`;
        ctx.font = '800 30px ui-monospace,Consolas,monospace';
        ctx.fillText('NEW BEST!', VW / 2, 300);
      }
      if (deadT > 0.5) {
        ctx.fillStyle = `rgba(255,255,255,${0.5 + Math.sin(time * 4) * 0.4})`;
        ctx.font = '700 22px ui-monospace,Consolas,monospace';
        ctx.fillText('クリック / R でもう一度', VW / 2, 356);
      }
    }
  }

  // ビネット
  const vg = ctx.createRadialGradient(VW / 2, VH / 2, VH * 0.45, VW / 2, VH / 2, VH * 0.95);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.45)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, VW, VH);

  ctx.restore(); // clip
}

function drawStalactites(par, spacing, maxLen, col) {
  ctx.fillStyle = col;
  const offs = camX * par;
  const i0 = Math.floor(offs / spacing) - 1;
  for (let i = i0; i < i0 + Math.ceil(VW / spacing) + 2; i++) {
    const sx = i * spacing - offs + hash(i * 3.7) * spacing * 0.5;
    const len = 30 + hash(i * 7.3 + par * 100) * maxLen;
    const w = 18 + hash(i * 11.9) * 26;
    ctx.beginPath();
    ctx.moveTo(sx - w / 2, 0);
    ctx.lineTo(sx + w / 2, 0);
    ctx.lineTo(sx, len);
    ctx.closePath();
    ctx.fill();
  }
}

// ---- メインループ ----
let last = performance.now();
function frame(now) {
  let dt = Math.min((now - last) / 1000, 1 / 30);
  last = now;
  if (mode === 'dead' && deadT < 0.45) dt *= 0.35; // 死亡直後スローモーション
  update(dt);
  render();
  requestAnimationFrame(frame);
}
reset();
mode = 'title';
requestAnimationFrame(frame);
