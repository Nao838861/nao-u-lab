// brick_log v06 — M-40 判定ハーネス: 5振幅の比較分析
// Nao_u 2026-05-01 09:58 #game-rights「人間のプレイに依存せず、ちゃんと自分で判断できるようになって」
//
// v04 (5px) = 「移動が小さい」(Nao_u指摘) / v05 (22px) = 「過剰修正の可能性」(self_judgment)
// この間 (10/14/18/22) を網羅的に数値比較し、振幅の最良値を自己判定する。
// 数値検証 + 視覚比較 (compare.html) の2系統で M-40 の「判定機構」を構築。

const W=420, H=620;
const PAD_W=72, PAD_H=8, PAD_Y=H-40;
const BALL_R=5, BALL_BASE_SPEED=4.2;
const MAX_REFLECT_ANGLE=Math.PI/3;

const BR_COLS=10, BR_ROWS=6, BR_W=36, BR_H=14, BR_GAP=2;
const BR_X0=(W-(BR_COLS*(BR_W+BR_GAP)-BR_GAP))/2;
const BR_Y0=70;

// 比較対象: v04(5)、中間値10/14/18、v05(22)
const VARIANTS = [
  { name: 'A=5  (v04)', amp: 5,  period: 240 },
  { name: 'A=10',       amp: 10, period: 200 },
  { name: 'A=14',       amp: 14, period: 200 },
  { name: 'A=18',       amp: 18, period: 200 },
  { name: 'A=22 (v05)', amp: 22, period: 180 },
];

function makeBlocks(){
  const blocks=[];
  for(let r=0;r<BR_ROWS;r++){
    for(let c=0;c<BR_COLS;c++){
      blocks.push({
        baseX: BR_X0+c*(BR_W+BR_GAP),
        baseY: BR_Y0+r*(BR_H+BR_GAP),
        phase: r*0.7 + c*0.4,
        r, c,
      });
    }
  }
  return blocks;
}

function sway(t, phase, amp, period){
  return amp * Math.sin(2*Math.PI*t/period + phase);
}

function metricsFor(amp, period){
  const blocks=makeBlocks();
  const flightFrames = Math.round((PAD_Y - BR_Y0) / BALL_BASE_SPEED); // 最上段まで

  // 1. ピーク速度 (px/sec)
  const peakPxPerFrame = 2*Math.PI*amp/period;
  const peakPxPerSec = peakPxPerFrame * 60;

  // 2. ガイド誤差 (サーブ瞬間の予測位置 vs 到達時の実位置)
  let maxGuideErr=0, avgGuideErr=0, samples=0;
  for(let startT=0;startT<period;startT+=1){
    for(const blk of blocks){
      const startPos = sway(startT, blk.phase, amp, period);
      const endPos = sway(startT+flightFrames, blk.phase, amp, period);
      const err = Math.abs(endPos - startPos);
      if(err>maxGuideErr)maxGuideErr=err;
      avgGuideErr+=err;
      samples++;
    }
  }
  avgGuideErr/=samples;

  // 3. 隣ブロック衝突率
  let overlapFrameCount=0, totalChecks=0, maxOverlap=0;
  for(let t=0;t<period;t++){
    for(let r=0;r<BR_ROWS;r++){
      for(let c=0;c<BR_COLS-1;c++){
        const left = blocks.find(b=>b.r===r&&b.c===c);
        const right = blocks.find(b=>b.r===r&&b.c===c+1);
        const lx = left.baseX + sway(t, left.phase, amp, period);
        const rx = right.baseX + sway(t, right.phase, amp, period);
        const overlap = (lx + BR_W) - rx;
        totalChecks++;
        if(overlap>0){
          overlapFrameCount++;
          if(overlap>maxOverlap)maxOverlap=overlap;
        }
      }
    }
  }
  const overlapRate = overlapFrameCount/totalChecks*100;

  // 4. 「狙える量」の指標: ガイド誤差がボール直径以下か
  const aimableRatio = avgGuideErr / (BALL_R*2); // 1.0 未満なら「狙える」、1.0 を超えると「ガイド意味薄れ」

  // 5. 「動いて見える」量: ピーク速度 / 認識閾値 (10 px/sec 経験則)
  const visibilityRatio = peakPxPerSec / 10;

  // 6. ブロック幅に対する振幅比
  const widthRatio = amp / BR_W * 100;

  return {
    amp, period,
    peakPxPerSec,
    maxGuideErr,
    avgGuideErr,
    overlapRate,
    maxOverlap,
    aimableRatio,
    visibilityRatio,
    widthRatio,
  };
}

console.log('===== M-40 判定ハーネス: 5振幅の比較 =====\n');
console.log('指標説明:');
console.log('  視認性 = ピーク速度/認識閾値10px/sec、≥1なら動きが見える');
console.log('  狙える度 = 平均ガイド誤差/ボール直径、≤1.0で「狙える」、>1.0で「ガイド意味薄れ」');
console.log('  押し合い = 隣ブロックが視覚的に重なるフレーム率%\n');

console.log('| 振幅 | 周期 | ピーク速度 | ガイド誤差(平均) | 視認性 | 狙える度 | 押し合い | 幅比 |');
console.log('|------|------|------------|-------------------|--------|----------|----------|------|');
const results = [];
for(const v of VARIANTS){
  const m = metricsFor(v.amp, v.period);
  results.push({...v, ...m});
  console.log(`| ${v.name.padEnd(11)} | ${v.period}f | ${m.peakPxPerSec.toFixed(1)} px/s | ${m.avgGuideErr.toFixed(1)} px (max ${m.maxGuideErr.toFixed(0)}) | ${m.visibilityRatio.toFixed(1)}x | ${m.aimableRatio.toFixed(2)} | ${m.overlapRate.toFixed(0)}% (max ${m.maxOverlap.toFixed(1)}) | ${m.widthRatio.toFixed(0)}% |`);
}

console.log('\n===== 自己判定基準 =====');
console.log('「狙える」を残しつつ「動いて見える」最大値を選ぶ:');
console.log('  - 視認性 ≥ 1.5 (確実に動きが見える)');
console.log('  - 狙える度 ≤ 1.5 (平均誤差がボール1.5個分以下、ガイドが意味を保つ)');
console.log('  - 押し合い率 ≤ 30% (隣同士の視覚衝突は許容範囲内)');

console.log('\n各案の判定:');
for(const r of results){
  const visOk = r.visibilityRatio >= 1.5;
  const aimOk = r.aimableRatio <= 1.5;
  const overlapOk = r.overlapRate <= 30;
  const allOk = visOk && aimOk && overlapOk;
  const marks = `${visOk?'✓':'✗'}視認 ${aimOk?'✓':'✗'}狙える ${overlapOk?'✓':'✗'}衝突`;
  console.log(`  ${r.name}: ${marks} ${allOk?'⇒ 採用候補':'⇒ 不採用'}`);
}

console.log('\n===== 注意 =====');
console.log('数値判定は「動いて見える × 狙えるが両立する範囲」を絞り込む装置に過ぎない。');
console.log('「狙う動機の質」「見飽きないか」は visual compare.html での視覚判定で別途確認。');
console.log('M-40 の判定機構として: 数値レンジ判定 ⇒ 視覚比較 ⇒ 自己結論 の3段階。');
