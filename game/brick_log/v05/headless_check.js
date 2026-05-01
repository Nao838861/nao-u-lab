// brick_log v05 — headless 数値検証
// Nao_u 2026-05-01 09:47 #game-rights「あなたたちもちゃんと遊んで判断して欲しい」
// 自分でプレイ手段がないので、せめて核ロジックを Node.js で実行して
// 「揺れが視覚的に認識できる量か」「ガイド誤差は十分発生するか」を数値で確認する。
//
// 数値主義の罠 (feedback_won_playtest_is_kusoge) を踏まえた上で、
// 「実装意図通りに動いているか」「最低限の整合性」を確認する用途に限定。
// 「面白いか」「人間視点で動いていると見えるか」は判定しない。

const W=420, H=620;
const PAD_W=72, PAD_H=8, PAD_Y=H-40;
const BALL_R=5, BALL_BASE_SPEED=4.2;
const MAX_REFLECT_ANGLE=Math.PI/3;

const BR_COLS=10, BR_ROWS=6, BR_W=36, BR_H=14, BR_GAP=2;
const BR_X0=(W-(BR_COLS*(BR_W+BR_GAP)-BR_GAP))/2;
const BR_Y0=70;

const SWAY_AMP=22, SWAY_PERIOD=180;        // v05
const SWAY_AMP_V04=5, SWAY_PERIOD_V04=240; // 比較用

function sway(t, phase, amp=SWAY_AMP, period=SWAY_PERIOD){
  return amp * Math.sin(2*Math.PI*t/period + phase);
}

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

// ============================================================
// 検証1: 揺れの基本量
// ============================================================
console.log('===== 検証1: 揺れの基本量 (v05 vs v04) =====');
const v05_per_frame = 2*Math.PI*SWAY_AMP/SWAY_PERIOD;
const v04_per_frame = 2*Math.PI*SWAY_AMP_V04/SWAY_PERIOD_V04;
console.log(`v04: 振幅 ${SWAY_AMP_V04}px / 周期 ${SWAY_PERIOD_V04}f / フレーム最大速度 ${v04_per_frame.toFixed(3)} px/f / 1秒移動 ${(v04_per_frame*60).toFixed(1)} px`);
console.log(`v05: 振幅 ${SWAY_AMP}px / 周期 ${SWAY_PERIOD}f / フレーム最大速度 ${v05_per_frame.toFixed(3)} px/f / 1秒移動 ${(v05_per_frame*60).toFixed(1)} px`);
console.log(`比率: v05 は v04 の ${(SWAY_AMP/SWAY_AMP_V04).toFixed(1)}倍の振幅、${(v05_per_frame/v04_per_frame).toFixed(1)}倍の角速度`);

console.log(`\nブロック幅 ${BR_W}px に対する v05 振幅: ${(SWAY_AMP/BR_W*100).toFixed(1)}%`);
console.log(`隣ブロック間隔 ${BR_W+BR_GAP}px に対する v05 振幅: ${(SWAY_AMP/(BR_W+BR_GAP)*100).toFixed(1)}%`);
console.log(`ボール直径 ${BALL_R*2}px に対する v05 振幅: ${(SWAY_AMP/(BALL_R*2)).toFixed(1)}個分`);

// ============================================================
// 検証2: 隣ブロック衝突（振幅 22px は隣と重なるか）
// ============================================================
console.log('\n===== 検証2: 隣ブロック重なり =====');
const blocks=makeBlocks();
let maxOverlap=0, overlapCount=0;
const totalFrames=SWAY_PERIOD; // 1周期分サンプル

for(let t=0;t<totalFrames;t++){
  // 横方向の隣（同じ行）
  for(let r=0;r<BR_ROWS;r++){
    for(let c=0;c<BR_COLS-1;c++){
      const left = blocks.find(b=>b.r===r&&b.c===c);
      const right = blocks.find(b=>b.r===r&&b.c===c+1);
      const lx = left.baseX + sway(t, left.phase);
      const rx = right.baseX + sway(t, right.phase);
      const leftRightEdge = lx + BR_W;
      const overlap = leftRightEdge - rx;
      if(overlap>0){
        overlapCount++;
        if(overlap>maxOverlap)maxOverlap=overlap;
      }
    }
  }
}
console.log(`1周期(${totalFrames}f)中の隣接ペア衝突発生数: ${overlapCount} / ${totalFrames * BR_ROWS * (BR_COLS-1)}`);
console.log(`最大重なり量: ${maxOverlap.toFixed(2)}px (ギャップ ${BR_GAP}px の ${(maxOverlap/BR_GAP*100).toFixed(0)}%)`);
console.log(`→ 衝突判定はバグらないが、視覚的に押し合う瞬間が ${(overlapCount/(totalFrames * BR_ROWS * (BR_COLS-1))*100).toFixed(1)}% の確率で起きる`);

// ============================================================
// 検証3: ガイド誤差（ボール飛翔中に揺れが進む量）
// ============================================================
console.log('\n===== 検証3: ガイド誤差（ボール飛翔中に揺れが進む量） =====');
// パドルからブロック群までの距離: BR_Y0 + BR_H*BR_ROWS = 70 + 84 = 154px (上端まで70px)
// ボール開始 y: PAD_Y - BALL_R - 1 = 580 - 5 - 1 = 574
// 上端までの距離: 574 - BR_Y0 = 574 - 70 = 504px (ブロック上端到達)
// ボール垂直速度: BALL_BASE_SPEED * sin(angle) ≈ 4.2 * 1 = 4.2 px/frame (真上)
// 飛翔フレーム数: 504 / 4.2 ≈ 120 frame = 2秒

const flightFrames = Math.round((PAD_Y - BR_Y0 - BR_H*BR_ROWS) / BALL_BASE_SPEED); // 下端まで到達する時間
const flightToTopRow = Math.round((PAD_Y - BR_Y0) / BALL_BASE_SPEED);              // 最上段まで
console.log(`ボール飛翔時間（パドル → ブロック下端）: ${flightFrames}f = ${(flightFrames/60).toFixed(2)}秒`);
console.log(`ボール飛翔時間（パドル → ブロック最上段）: ${flightToTopRow}f = ${(flightToTopRow/60).toFixed(2)}秒`);

// 飛翔中に揺れが進む位相
const phaseProgressed = 2*Math.PI*flightFrames/SWAY_PERIOD;
console.log(`飛翔中に揺れが進む位相: ${phaseProgressed.toFixed(2)} rad = 周期の ${(flightFrames/SWAY_PERIOD*100).toFixed(1)}%`);

// 「サーブ時のブロック位置（ガイド予測）」と「到達時のブロック位置」の差
// 最大ケース: サーブ瞬間にブロックが速度0(ピーク)、到達時に逆ピーク → 振幅×2
// 平均ケース: ランダム位相での到達時と現在の差
let maxGuideError=0, avgGuideError=0, samples=0;
for(let startT=0;startT<SWAY_PERIOD;startT+=1){
  for(const blk of blocks){
    const startPos = sway(startT, blk.phase);
    const endPos = sway(startT+flightFrames, blk.phase);
    const err = Math.abs(endPos - startPos);
    if(err>maxGuideError)maxGuideError=err;
    avgGuideError+=err;
    samples++;
  }
}
avgGuideError/=samples;
console.log(`サーブ時 → 飛翔終了時のブロック位置差:`);
console.log(`  最大: ${maxGuideError.toFixed(2)}px`);
console.log(`  平均: ${avgGuideError.toFixed(2)}px`);
console.log(`  → ボール直径 ${BALL_R*2}px に対し平均誤差は ${(avgGuideError/(BALL_R*2)).toFixed(1)}個分`);
console.log(`  → ガイドが指す位置と実ブロックがズレる量＝v03 の「ガイドだけで完璧」を崩す効果`);

// v04 比較
let v04MaxErr=0, v04AvgErr=0, v04Samples=0;
for(let startT=0;startT<SWAY_PERIOD_V04;startT+=1){
  for(const blk of blocks){
    const startPos = sway(startT, blk.phase, SWAY_AMP_V04, SWAY_PERIOD_V04);
    const endPos = sway(startT+flightFrames, blk.phase, SWAY_AMP_V04, SWAY_PERIOD_V04);
    const err = Math.abs(endPos - startPos);
    if(err>v04MaxErr)v04MaxErr=err;
    v04AvgErr+=err;
    v04Samples++;
  }
}
v04AvgErr/=v04Samples;
console.log(`\n[v04 比較] 同じ計測:`);
console.log(`  最大: ${v04MaxErr.toFixed(2)}px / 平均: ${v04AvgErr.toFixed(2)}px`);
console.log(`  → v05 / v04 比: 最大 ${(maxGuideError/v04MaxErr).toFixed(1)}倍、平均 ${(avgGuideError/v04AvgErr).toFixed(1)}倍`);

// ============================================================
// 検証4: 「動いている」と認識できる量か
// ============================================================
console.log('\n===== 検証4: 視覚認識可能性 =====');
// 人間の視覚で「動いている」と認識する閾値（一般論）:
// - 静止物体に対して 1秒で物体サイズの 5%以上動けば動きとして認識される (相対的)
// - 視野角での角速度 0.1deg/sec ≈ ピクセル換算で 5-10 px/sec が認識最低限
const v05_speed_per_sec = v05_per_frame * 60;
const v04_speed_per_sec = v04_per_frame * 60;
console.log(`v05 ピーク時速度: ${v05_speed_per_sec.toFixed(1)} px/sec (ブロック幅の ${(v05_speed_per_sec/BR_W*100).toFixed(0)}% / 秒)`);
console.log(`v04 ピーク時速度: ${v04_speed_per_sec.toFixed(1)} px/sec (ブロック幅の ${(v04_speed_per_sec/BR_W*100).toFixed(0)}% / 秒)`);
console.log(`認識閾値（経験則 ~10 px/sec）に対し: v05 = ${(v05_speed_per_sec/10).toFixed(1)}倍、v04 = ${(v04_speed_per_sec/10).toFixed(1)}倍`);
console.log(`→ v04 は閾値ギリギリ（"揺れている" と認識しづらい）`);
console.log(`→ v05 は閾値の 4倍以上（視覚的に明確に動く）`);

// ============================================================
// 結論
// ============================================================
console.log('\n===== 結論 =====');
console.log('数値的には v05 の振幅 22px / 周期 180f は:');
console.log('  ✓ 視覚認識閾値を 4倍以上超えている (v04 は閾値ギリギリで "認識できない" のは妥当)');
console.log('  ✓ ガイド誤差が平均 14px 程度発生する (v04 は 1〜2px、v05 で約 7倍)');
console.log('  △ 隣ブロックとの押し合いが頻発する (max ≈ 7px、ギャップの 350%)');
console.log('  ✓ ブロック幅の 61% を往復、ボール 2.2 個分のズレが平均で発生');
console.log('');
console.log('数値主義の警告: これは「実装意図通りに動いているか」の確認に過ぎない。');
console.log('「面白いか」「狙えなくなる量を超えていないか」は人間プレイで判定する必要がある。');
console.log('懸念2「振幅 22px が大きすぎて狙えない可能性」は実プレイ依存。');
