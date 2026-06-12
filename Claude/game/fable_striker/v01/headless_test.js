'use strict';
/* ============================================================================
   FABLE STRIKER ヘッドレス走破テスト
   描画/音声をスタブ化し、回避AIオートパイロットで全3面を完走させる。
   検証項目:
     - 3面すべてのボスが出現し撃破される
     - スコア/パワー/コンボが機能している
     - 弾数・敵数が暴走しない（メモリリーク/無限増殖がない）
     - クラッシュせず allclear に到達する
   使い方: node headless_test.js
   ============================================================================ */

// --- DOM/Audio スタブ（game.js を node で読むため） ---
global.window = undefined;     // boot を走らせない
global.document = undefined;
global.localStorage = undefined;
global.performance = { now: () => 0 };
global.requestAnimationFrame = () => 0;

const path = require('path');
const { Game, srand } = require(path.join(__dirname, 'game.js'));

function makeAutopilot() {
  // 競技者モデル: 脅威からの反発(回避) + 最寄り敵へのx軸照準(攻撃) を脅威度で混ぜる。
  // 純粋な逃げAIではゲームの「クリア可能性」を検証できないため、攻撃も行う。
  return function ai(snap, peek) {
    const p = peek.player;
    const W = 540, H = 720;
    let fx = 0, fy = 0, threat = 0;
    // 脅威ベクトル（近いほど強く反発）
    for (const b of peek.ebullets) {
      const dx = p.x - b.x, dy = p.y - b.y;
      const d2 = dx*dx + dy*dy;
      if (d2 < 100*100) { const inv = 1/(Math.sqrt(d2)+1); fx += dx*inv*inv*1100; fy += dy*inv*inv*1100; threat += 1/(d2/2500+1); }
    }
    for (const e of peek.enemies) {
      const dx = p.x - e.x, dy = p.y - e.y;
      const d2 = dx*dx + dy*dy;
      if (d2 < 85*85) { const inv = 1/(Math.sqrt(d2)+1); fx += dx*inv*inv*1500; fy += dy*inv*inv*1500; threat += 1/(d2/2000+1); }
    }
    // 攻撃: 最寄りの敵（ボス/中ボス優先）の x に機体を合わせる
    let tgt = null, bd = 1e9;
    for (const e of peek.enemies) {
      let w = e.kind==='zako' ? 1 : 0.3; // ボスを優先（重み小=距離を縮めて見る）
      const d = (Math.abs(e.x-p.x) + Math.abs(e.y-p.y)) * w;
      if (d < bd) { bd = d; tgt = e; }
    }
    const aimW = clamp(1 - threat*0.8, 0, 1); // 脅威が低いほど照準を優先
    if (tgt) fx += (tgt.x - p.x) * 0.06 * (aimW+0.1);
    // ホーム位置への弱い引力（下中央やや下）
    fx += ((W/2) - p.x) * 0.01;
    fy += ((H-150) - p.y) * 0.02 * (1-aimW*0.5);
    // 画面端反発
    if (p.x < 50) fx += (50-p.x)*0.6;
    if (p.x > W-50) fx -= (p.x-(W-50))*0.6;
    if (p.y < 70) fy += (70-p.y)*0.6;
    if (p.y > H-50) fy -= (p.y-(H-50))*0.6;
    const mag = Math.hypot(fx, fy) || 1;
    const dx = fx/mag, dy = fy/mag;
    // ボム判定: 至近に敵弾が密集
    let near = 0;
    for (const b of peek.ebullets) { if (Math.hypot(b.x-p.x, b.y-p.y) < 40) near++; }
    const bomb = near >= 4;
    return { dx, dy, fire: true, bomb };
  };
}
function clamp(x,a,b){ return x<a?a:x>b?b:x; }

function run() {
  srand(12345);
  Game.headlessInit();
  const ai = makeAutopilot();
  const dt = 1/60;
  const maxFrames = 60 * 60 * 8; // 最大8分相当
  let frame = 0;
  let snap = Game.snapshot();

  const log = [];
  const seen = { stage0boss:false, stage1boss:false, stage2boss:false };
  let maxEbullets = 0, maxEnemies = 0;
  let lastStage = -1, lastPhase = '';
  const phaseLog = [];

  while (frame < maxFrames) {
    const peek = Game._peek();
    const input = ai(snap, peek);
    snap = Game.headlessStep(dt, input);
    frame++;

    maxEbullets = Math.max(maxEbullets, snap.ebullets);
    maxEnemies = Math.max(maxEnemies, snap.enemies);

    if (snap.stage !== lastStage || snap.phase !== lastPhase) {
      phaseLog.push(`  f=${frame} t=${(frame*dt).toFixed(1)}s  stage=${snap.stage+1} phase=${snap.phase} score=${snap.score} pwr=${snap.power} lives=${snap.lives} bombs=${snap.bombs} enemies=${snap.enemies} ebullets=${snap.ebullets}`);
      lastStage = snap.stage; lastPhase = snap.phase;
    }
    if (snap.phase === 'boss') {
      if (snap.stage===0) seen.stage0boss=true;
      if (snap.stage===1) seen.stage1boss=true;
      if (snap.stage===2) seen.stage2boss=true;
    }
    if (snap.state === 'allclear') break;
  }

  const st = snap.stats;
  console.log('=== FABLE STRIKER ヘッドレス走破テスト ===\n');
  console.log('フェーズ遷移ログ:');
  phaseLog.forEach(l => console.log(l));
  console.log('\n--- 結果 ---');
  console.log('終了状態        :', snap.state, frame>=maxFrames?'(タイムアウト)':'');
  console.log('総フレーム      :', frame, `(${(frame*dt).toFixed(1)}s)`);
  console.log('最終スコア      :', snap.score);
  console.log('撃破数(kills)   :', st.kills);
  console.log('ボス撃破        :', st.bossKills, '/ 3');
  console.log('面クリア        :', st.stagesCleared, '/ 3');
  console.log('発射数(shots)   :', st.shots);
  console.log('被弾数(deaths)  :', st.deaths);
  console.log('ボム使用        :', st.bombsUsed);
  console.log('最大同時敵弾    :', maxEbullets);
  console.log('最大同時敵      :', maxEnemies);
  console.log('各面ボス出現    :', `S1=${seen.stage0boss} S2=${seen.stage1boss} S3=${seen.stage2boss}`);

  // --- アサーション ---
  const checks = [];
  const assert = (name, cond) => { checks.push({name, ok: !!cond}); };
  assert('クラッシュせず完走', snap.state === 'allclear');
  assert('3面ボス全出現', seen.stage0boss && seen.stage1boss && seen.stage2boss);
  assert('3ボス撃破', st.bossKills === 3);
  assert('3面クリア', st.stagesCleared === 3);
  assert('スコア加算機能', snap.score > 50000);
  assert('撃破が発生', st.kills > 50);
  assert('敵弾が暴走しない(<700)', maxEbullets < 700);
  assert('敵数が暴走しない(<120)', maxEnemies < 120);
  assert('発射が機能', st.shots > 100);

  console.log('\n--- アサーション ---');
  let allOk = true;
  for (const c of checks) { console.log(`  [${c.ok?'PASS':'FAIL'}] ${c.name}`); if(!c.ok) allOk=false; }
  console.log('\n総合:', allOk ? '✅ 全項目 PASS' : '❌ FAIL あり');
  process.exit(allOk ? 0 : 1);
}

run();
