// 最新ROMの実画面から「向きごとのコース全体の絵」を組み立てる（図解用、リプレイとは別コア）。
// カウントダウン中に位置と向きを書き換え、自車より上の範囲 (x0..135, y32..149) を撮って敷き詰める。
// 出力: rec/pictures/angle_NNN.rgb (S x S RGB)。座標: P = R(a)(w - W0) + S/2,  R は時計回り a*2.8125°
import fs from 'node:fs';
import {makeCore, root} from './pose_lib.mjs';

const S = 920, W0 = [330, 340];
const CW = 136, CH = 118, CY = 32;
const angles = process.argv[2] ? process.argv[2].split(',').map(Number) : [...Array(128).keys()];
const {shot, setRival} = await makeCore();
const passes = [0, 400, 800];
fs.mkdirSync(root + '/rec/pictures', {recursive: true});

// 自車の画面位置 (cx,cy) は未知の定数。姿勢 p で撮った画面の点 s は P = s - c + R(p - W0) + S/2。
// c は向き0の撮影を復号データと照合して後で決めるので、ここでは c=(68,188) と置いて組み立てる。
const cx = 68, cy = 188;
for (const a of angles) {
  const th = a * 2 * Math.PI / 128, co = Math.cos(th), si = Math.sin(th);
  const imgs = [];
  for (const rv of passes) { setRival(rv);
  const img = Buffer.alloc(S * S * 3);
  for (let gy = -cy + CY - CH; gy < S; gy += CH - 2) {
    for (let gx = -CW; gx < S + CW; gx += CW - 2) {
      // 撮影範囲の左上が P=(gx,gy) に来る姿勢: R(p-W0) = (gx,gy) - (CY基準) + c - S/2
      const Gx = gx - 0 + cx - S / 2, Gy = gy - CY + cy - S / 2;
      const px = W0[0] + co * Gx + si * Gy, py = W0[1] - si * Gx + co * Gy;
      const rgb = shot(px, py, a);
      for (let y = 0; y < CH; y++) {
        const Y = gy + y; if (Y < 0 || Y >= S) continue;
        for (let x = 0; x < CW; x++) {
          const X = gx + x; if (X < 0 || X >= S) continue;
          rgb.copy(img, (Y * S + X) * 3, ((CY + y) * 256 + x) * 3, ((CY + y) * 256 + x) * 3 + 3);
        }
      }
    }
  }
  imgs.push(img); }
  // 3回の撮影でCPU車の位置だけが変わるので、画素ごとの多数決で背景を残す
  const img = Buffer.alloc(S * S * 3);
  for (let i = 0; i < S * S * 3; i += 3) {
    const [A, B, C] = imgs;
    const eq = (P, Q) => P[i] === Q[i] && P[i + 1] === Q[i + 1] && P[i + 2] === Q[i + 2];
    const src = eq(A, B) || eq(A, C) ? A : B;
    img[i] = src[i]; img[i + 1] = src[i + 1]; img[i + 2] = src[i + 2];
  }
  fs.writeFileSync(`${root}/rec/pictures/angle_${String(a).padStart(3, '0')}.rgb`, img);
  if (a % 16 === 0) console.log('angle', a);
}
