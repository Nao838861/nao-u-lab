import React from 'react';
import {Img, staticFile, useCurrentFrame} from 'remotion';
import {Bg, C, SceneTitle, Tag, cueOf, useIn} from './common';
import {Big, Card, D, G, Grid, MONO, Nes, Pic, Txt, at, fmt, idx, pad3, ramp} from './parts';

const K = (id: string) => (i: number) => cueOf(id, i);

// ---------------- S06 壁2 書き換える時間 ----------------
const LINES = 262;
const Timeline: React.FC<{x: number; y: number; w: number; top: number; bottom: number; o?: number}> = ({x, y, w, top, bottom, o = 1}) => {
  const px = w / LINES;
  const seg = (a: number, b: number, color: string, label: string, tc = '#0a0f1e') => (
    <div style={{position: 'absolute', left: a * px, top: 0, width: (b - a) * px, height: 70, background: color, display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontSize: 24, fontWeight: 800, color: tc, overflow: 'hidden', whiteSpace: 'nowrap', borderRight: '2px solid #0a0f1e'}}>{label}</div>
  );
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: 110, opacity: o}}>
      {top > 0 && seg(0, top, C.amber, '書ける')}
      {seg(top, 240 - bottom, '#5d6b8f', '画面を描いている（書けない）', '#eef3ff')}
      {bottom > 0 && seg(240 - bottom, 240, C.amber, '書ける')}
      {seg(240, LINES, C.amber, '休み')}
      <div style={{position: 'absolute', top: 78, left: 0, fontSize: 22, color: C.sub, fontWeight: 700}}>1コマ＝262ライン（横向きに並べた図）</div>
    </div>
  );
};

export const S06: React.FC = () => {
  const f = useCurrentFrame(), k = K('S06');
  const c = [0, 1, 2, 3, 4, 5, 6, 7].map(k);
  const from = 200, loop = 1990, i = idx(from, f, loop);
  const bands = ramp(f, c[4], c[4] + 30);
  const part1 = 1 - ramp(f, c[6] - 10, c[6]);
  const s = 760 / 256;
  // 実測の書き込み時間グラフ（直近360コマ）
  const N = 360, gx = 840, gy = 540, gw = 1000, gh = 280, lo = 4000, hi = 8000;
  const yv = (v: number) => gy + gh - ((v - lo) / (hi - lo)) * gh;
  const pts: string[] = [];
  let mx = 0;
  for (let n = 0; n < N; n++) {
    const j = i - N + 1 + n; if (j < from) continue;
    const v = at(D.cost, j); if (at(D.scene, j) !== 1) continue;
    mx = Math.max(mx, v);
    pts.push(`${gx + (n / (N - 1)) * gw},${yv(v)}`);
  }
  let runMax = 0;
  for (let j = from; j <= Math.min(from + Math.min(f, loop - 1), D.cost.length - 1); j++) if (D.scene[j] === 1) runMax = Math.max(runMax, D.cost[j]);
  return (
    <Bg>
      <SceneTitle label="壁2　書き換える時間がない" color={C.red} />
      <div style={{opacity: part1}}>
        <Nes src="drift1" from={from} loop={loop} x={60} y={130} w={760}>
          <Grid cell={8 * s} o={0.5 * ramp(f, c[1], c[1] + 10) * (0.6 + 0.4 * Math.sin(f / 4))} />
          <div style={{position: 'absolute', left: 0, top: 0, width: '100%', height: 32 * s, background: C.amber, opacity: 0.55 * bands}} />
          <div style={{position: 'absolute', left: 0, top: 216 * s, width: '100%', height: 24 * s, background: C.amber, opacity: 0.55 * bands}} />
        </Nes>
        <Card x={880} y={140} w={960} color={C.cyan} o={ramp(f, c[1], c[1] + 14)}>
          <div style={{fontSize: 30, color: C.sub, fontWeight: 700}}>毎コマ、画面のタイルを全部入れ替える</div>
          <div style={{fontSize: 54, fontWeight: 900}}>432マス ＝ <span style={{color: C.cyan}}>864バイト</span></div>
        </Card>
        <Timeline x={880} y={360} w={960} top={bands > 0.5 ? 32 : 0} bottom={bands > 0.5 ? 24 : 0} o={ramp(f, c[2], c[2] + 14)} />
        <Card x={880} y={520} w={960} color={C.red} o={ramp(f, c[3], c[3] + 14) * (1 - bands)}>
          <div style={{fontSize: 30, color: C.sub, fontWeight: 700}}>普段の休み時間（約20ライン ≈ 2,270サイクル）</div>
          <div style={{fontSize: 50, fontWeight: 900}}>書けるのは <span style={{color: C.red}}>300バイト弱</span>　必要なのは 864</div>
        </Card>
        <Card x={880} y={520} w={960} color={C.amber} o={bands}>
          <div style={{fontSize: 30, color: C.sub, fontWeight: 700}}>上32ライン・下24ラインを黒く塗りつぶす</div>
          <div style={{fontSize: 50, fontWeight: 900}}>書ける時間 <span style={{color: C.amber}}>78ライン ＝ 予算 7,449サイクル</span></div>
        </Card>
        <Big o={ramp(f, c[5], c[5] + 12) * (1 - ramp(f, c[6] - 20, c[6] - 8))} color={C.amber} size={96} y={760}>黒い帯 ＝ 書き込むための時間</Big>
      </div>
      <div style={{opacity: ramp(f, c[6] - 6, c[6] + 10)}}>
        <Card x={60} y={130} w={720} h={660} color={C.violet}>
          <div style={{fontSize: 30, color: C.sub, fontWeight: 700, marginBottom: 12}}>書き込みプログラム（ループなし）</div>
          <div style={{height: 470, overflow: 'hidden', fontFamily: MONO, fontSize: 34, lineHeight: 1.45}}>
            <div style={{transform: `translateY(${-((f - c[6]) * 2.2) % 290}px)`}}>
              {Array.from({length: 24}).map((_, n) => (
                <div key={n} style={{color: n % 2 ? C.cyan : C.text}}>{n % 2 ? 'STA $2007      ; 書く 4' : `LDA $8${(n * 2).toString(16).padStart(3, '0')},Y    ; 読む 4`}</div>
              ))}
            </div>
          </div>
          <div style={{fontSize: 32, fontWeight: 900, color: C.violet, marginTop: 10}}>× 864回を一直線に　1バイト ≈ 8サイクル</div>
        </Card>
        <div style={{opacity: ramp(f, c[7], c[7] + 14)}}>
          <Nes src="drift1" from={from} loop={loop} x={1440} y={130} w={400} />
          <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
            <rect x={gx} y={gy} width={gw} height={gh} fill="#131b31" stroke="#2c3b63" strokeWidth={2} rx={10} />
            <line x1={gx} x2={gx + gw} y1={yv(7449)} y2={yv(7449)} stroke={C.red} strokeWidth={4} strokeDasharray="14 10" />
            <text x={gx + 12} y={yv(7449) - 12} fill={C.red} fontSize={30} fontWeight={800}>上限 7,449</text>
            <polyline points={pts.join(' ')} fill="none" stroke={C.cyan} strokeWidth={3} />
            <text x={gx + 12} y={gy + gh - 14} fill={C.sub} fontSize={24}>1コマごとの書き込み時間（サイクル）・直近6秒</text>
          </svg>
          <Txt x={840} y={835} size={38}>{`このコマ ${fmt(at(D.cost, i))}　これまでの最大 `}<span style={{color: C.amber}}>{fmt(runMax)}</span></Txt>
        </div>
      </div>
    </Bg>
  );
};

// ---------------- S07 壁3 1ラインの値段 ----------------
const BUDGET: Record<number, number> = {160: 9822, 168: 9273, 176: 8365, 184: 7449};
export const S07: React.FC = () => {
  const f = useCurrentFrame(), k = K('S07');
  const c = [0, 1, 2, 3, 4, 5, 6, 7].map(k);
  const h = Math.round(ramp(f, c[1] + 10, c[2] + 40, 160, 184));
  const budget = 9822 - (h - 160) * ((9822 - 7449) / 24);
  const S = 2.6;
  // 向き0の絵で、スタート直線の自車位置（絵の座標）を下端に合わせる
  const carX = 697, carY = 512;
  const part1 = 1 - ramp(f, c[3] - 8, c[3]);
  const part2 = ramp(f, c[3] - 4, c[3] + 10) * (1 - ramp(f, c[5] - 8, c[5]));
  const part3 = ramp(f, c[5] - 4, c[5] + 10);
  const dots = 60 * 34, red = Math.round((68515 / 2437120) * dots);
  const isRed = (n: number) => ((n * 2654435761) >>> 0) % dots < red;
  return (
    <Bg>
      <SceneTitle label="壁3　1ラインの値段" color={C.red} />
      <div style={{opacity: part1}}>
        <Pic a={0} x={140} y={150 + (184 - h) * S} scale={S} sx={carX - 68} sy={carY - 188 + 32 + (184 - h)} sw={136} sh={h} style={{borderRadius: 6, boxShadow: `0 0 0 4px ${C.cyan}`}} />
        <Txt x={140} y={110} size={34} color={C.cyan} o={ramp(f, c[1], c[1] + 10)}>{`縦 ${h} ライン`}</Txt>
        <Card x={700} y={180} w={1100} color={C.amber} o={ramp(f, c[1], c[1] + 14)}>
          <div style={{fontSize: 30, color: C.sub, fontWeight: 700}}>書き込みに使える時間</div>
          <div style={{height: 56, background: '#1b2643', borderRadius: 8, marginTop: 12, overflow: 'hidden'}}>
            <div style={{width: `${(budget / 10000) * 100}%`, height: '100%', background: C.amber}} />
          </div>
          <div style={{fontSize: 46, fontWeight: 900, color: C.amber, marginTop: 10}}>{`${fmt(budget)} サイクル`}<span style={{fontSize: 30, color: C.sub}}>　1ライン広げるごとに −114</span></div>
        </Card>
        <Txt x={700} y={470} size={52} w={1100} o={ramp(f, c[2], c[2] + 14)}>{'先が見えるほど遊びやすい。\nでも、見せるほど時間がない。'}</Txt>
      </div>
      <div style={{opacity: part2}}>
        <Card x={120} y={160} w={760} color={C.red}>
          <div style={{fontSize: 34, fontWeight: 800}}>160 → 168ライン</div>
          <div style={{fontSize: 56, fontWeight: 900, color: C.red}}>スタート直後に処理落ち</div>
        </Card>
        <div style={{position: 'absolute', left: 980, top: 160, display: 'grid', gridTemplateColumns: 'repeat(60, 12px)', gap: 3, opacity: ramp(f, c[4], c[4] + 14)}}>
          {Array.from({length: dots}).map((_, n) => (
            <div key={n} style={{width: 12, height: 12, borderRadius: 3, background: isRed(n) && f > c[4] + 40 ? C.red : '#3a4a78'}} />
          ))}
        </div>
        <Txt x={980} y={710} size={36} w={900} o={ramp(f, c[4], c[4] + 14)}>{'向き128 × 位置の組み合わせ ＝ 2,437,120通り'}</Txt>
        <Txt x={980} y={760} size={40} color={C.red} w={900} o={ramp(f, c[4] + 40, c[4] + 54)}>{'うち 68,515通りで時間が足りない'}</Txt>
        <Txt x={120} y={420} size={30} color={C.sub} w={760} o={ramp(f, c[4], c[4] + 14)}>{'1枚の点 ≒ 約1,000通り\n赤：書き込みが間に合わない組み合わせ'}</Txt>
      </div>
      <div style={{opacity: part3}}>
        <Pic a={0} x={160} y={150 + 24 * S} scale={S} sx={carX - 68} sy={carY - 188 + 56} sw={144} sh={160} style={{borderRadius: 6, boxShadow: `0 0 0 4px ${C.sub}`}} />
        <Txt x={160} y={640} size={32} color={C.sub}>最初：144 × 160</Txt>
        <Pic a={0} x={620} y={150} scale={S} sx={carX - 68} sy={carY - 188 + 32} sw={144} sh={184} style={{borderRadius: 6, boxShadow: `0 0 0 4px ${C.cyan}`}}>
          <div style={{position: 'absolute', left: 136 * S, top: 0, width: 8 * S, height: 184 * S, opacity: ramp(f, c[5] + 20, c[5] + 34),
            background: 'repeating-linear-gradient(45deg, rgba(255,91,110,.95) 0 6px, rgba(10,15,30,.95) 6px 12px)'}} />
        </Pic>
        <Txt x={620} y={640} size={32} color={C.cyan} o={ramp(f, c[6], c[6] + 14)}>現在：136 × 184</Txt>
        <Card x={1080} y={150} w={760} color={C.red} o={ramp(f, c[5] + 20, c[5] + 34)}>
          <div style={{fontSize: 38, fontWeight: 900}}>右端8ドットを削る</div>
          <div style={{fontSize: 30, color: C.sub, fontWeight: 700}}>タイル 19列 → 18列</div>
        </Card>
        <Card x={1080} y={330} w={760} color={C.cyan} o={ramp(f, c[6], c[6] + 14)}>
          <div style={{fontSize: 38, fontWeight: 900}}>代わりに <span style={{color: C.cyan}}>縦184ライン</span></div>
          <div style={{fontSize: 30, color: C.sub, fontWeight: 700}}>前方の視界が24ライン増えた</div>
        </Card>
        <Card x={1080} y={510} w={760} color={C.amber} o={ramp(f, c[7], c[7] + 14)}>
          <div style={{fontSize: 30, color: C.sub, fontWeight: 700}}>243万通りで最も重い場面</div>
          <div style={{fontSize: 46, fontWeight: 900}}>7,347 / 7,449</div>
          <div style={{fontSize: 46, fontWeight: 900, color: C.amber}}>残り 102サイクル</div>
        </Card>
      </div>
    </Bg>
  );
};

// ---------------- S08 木が少ない理由 ----------------
const TREES = [[160, 170], [136, 328], [280, 436], [482, 502], [500, 320], [210, 43], [168, 470], [520, 630]];
export const S08: React.FC = () => {
  const f = useCurrentFrame(), k = K('S08');
  const c = [0, 1, 2, 3, 4].map(k);
  const a = Math.floor(f / 4) % 128;
  const show = (n: number, m?: number) => ramp(f, c[n] - 4, c[n] + 12) * (m === undefined ? 1 : 1 - ramp(f, c[m] - 10, c[m]));
  const sprites = ['自車', '自車', 'CPU車', 'CPU車', 'ゴースト', '時計', '時計', '円'];
  return (
    <Bg>
      <SceneTitle label="木が少ない理由" />
      <Big o={useIn(c[0]) * (1 - ramp(f, c[1] - 10, c[1]))}>なぜ、木は8本だけ？</Big>
      <div style={{opacity: show(1, 2)}}>
        <Txt x={160} y={200} size={46}>スプライト（自由に動かせる部品）は横一列に8個まで</Txt>
        <div style={{position: 'absolute', left: 160, top: 330, display: 'flex', gap: 22}}>
          {sprites.map((s, n) => (
            <div key={n} style={{width: 170, height: 170, borderRadius: 16, border: `4px solid ${C.cyan}`, background: '#1b2643', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 32, fontWeight: 800, opacity: ramp(f, c[1] + n * 5, c[1] + n * 5 + 8)}}>{s}</div>
          ))}
        </div>
        <Txt x={160} y={560} size={40} color={C.cyan} o={ramp(f, c[1] + 50, c[1] + 64)}>車と表示で、ほぼ埋まっている</Txt>
      </div>
      <div style={{opacity: show(2, 3)}}>
        <Img src={staticFile('gen/tree128.png')} style={{position: 'absolute', left: 160, top: 150, width: 1120, height: 560, imageRendering: 'pixelated', borderRadius: 10}} />
        <Txt x={1320} y={200} size={46} w={520}>{'木1本 ＝\n128通りの絵'}</Txt>
        <Txt x={1320} y={380} size={32} color={C.sub} w={520}>{'128枚すべての絵に、\n向きごとに描き込む'}</Txt>
      </div>
      <div style={{opacity: show(3, 4)}}>
        <Img src={staticFile(`gen/jitter18/${pad3(a)}.png`)} style={{position: 'absolute', left: 140, top: 160, width: 760, height: 700, imageRendering: 'pixelated', border: `4px solid ${C.red}`, borderRadius: 8}} />
        <Img src={staticFile(`gen/jitter8/${pad3(a)}.png`)} style={{position: 'absolute', left: 1020, top: 160, width: 760, height: 700, imageRendering: 'pixelated', border: `4px solid ${C.cyan}`, borderRadius: 8}} />
        <Txt x={140} y={110} size={34} color={C.red}>開発中の版：木18本（位置をずらして使い回し）</Txt>
        <Txt x={1020} y={110} size={34} color={C.cyan}>現在：木8本（1ドット単位で配置）</Txt>
        <Txt x={140} y={870} size={26} color={C.sub} w={1640}>{`どちらも回転を打ち消して表示。向き ${pad3(a)}　左は開発中ROMのデータを復号したもの`}</Txt>
      </div>
      <div style={{opacity: show(4)}}>
        <Pic a={0} x={180} y={130} scale={0.8} style={{borderRadius: 10}}>
          {TREES.map(([wx, wy], n) => (
            <div key={n} style={{position: 'absolute', left: (wx + 130) * 0.8 - 26, top: (wy + 120) * 0.8 - 26, width: 52, height: 52, borderRadius: 26,
              border: `5px solid ${n < 5 ? C.cyan : C.violet}`, boxShadow: `0 0 18px ${n < 5 ? C.cyan : C.violet}`, opacity: ramp(f, c[4] + 20 + n * 8, c[4] + 30 + n * 8)}} />
          ))}
        </Pic>
        <Txt x={980} y={250} size={44} color={C.cyan}>● カーブ内側の目印（5本）</Txt>
        <Txt x={980} y={340} size={44} color={C.violet}>● 曲がり切れないと当たる（3本）</Txt>
        <Txt x={980} y={460} size={34} color={C.sub} w={820}>ぶつかると爆発して、ゲームオーバー</Txt>
      </div>
    </Bg>
  );
};

// ---------------- S09 右の4つの円 ----------------
const Wheel: React.FC<{x: number; y: number; cap: number; lon: number; lat: number; over: number; label: string}> = ({x, y, cap, lon, lat, over, label}) => {
  const r = 20 + cap * 1.25;
  const col = over ? C.red : C.text;
  const dx = Math.max(-r * 1.3, Math.min(r * 1.3, lat * 1.1)), dy = Math.max(-r * 1.3, Math.min(r * 1.3, -lon * 1.1));
  return (
    <div style={{position: 'absolute', left: x, top: y}}>
      <div style={{position: 'absolute', left: -r, top: -r, width: r * 2, height: r * 2, borderRadius: '50%', border: `6px solid ${col}`, boxShadow: over ? `0 0 26px ${C.red}` : undefined}} />
      <div style={{position: 'absolute', left: dx - 13, top: dy - 13, width: 26, height: 26, borderRadius: 13, background: col}} />
      <div style={{position: 'absolute', left: -100, top: 160, width: 200, textAlign: 'center', fontSize: 30, fontWeight: 800, color: C.sub}}>{label}</div>
    </div>
  );
};
export const S09: React.FC = () => {
  const f = useCurrentFrame(), k = K('S09');
  const from = 2300, i = from + f;
  const w = (n: number) => ({cap: at(G.cap, i)[n], lon: at(G.lon, i)[n], lat: at(G.lat, i)[n], over: at(G.over, i)[n]});
  const s = 760 / 256;
  return (
    <Bg>
      <SceneTitle label="右の4つの円" />
      <Nes src="grip1" from={from} x={60} y={130} w={760}>
        <div style={{position: 'absolute', left: 160 * s, top: 120 * s, width: 80 * s, height: 60 * s, border: `4px solid ${C.amber}`, borderRadius: 10, opacity: useIn(k(0))}} />
      </Nes>
      <div style={{opacity: useIn(k(1))}}>
        <Wheel x={1120} y={350} {...w(0)} label="左前" />
        <Wheel x={1560} y={350} {...w(1)} label="右前" />
        <Wheel x={1120} y={690} {...w(2)} label="左後" />
        <Wheel x={1560} y={690} {...w(3)} label="右後" />
        <Txt x={880} y={100} size={30} color={C.sub} w={960} align="center">{'円の大きさ＝出せる力の限界（重さに比例）\n点＝タイヤに求められている力'}</Txt>
      </div>
      <div style={{position: 'absolute', left: 60, top: 860, opacity: useIn(k(2))}}>
        <Tag color={C.amber}>GRIP 1位の走り（Nao_u 0:57.38）・毎秒60回の計算をそのまま表示</Tag>
      </div>
    </Bg>
  );
};

// ---------------- S10 まとめ ----------------
export const S10: React.FC = () => {
  const f = useCurrentFrame(), k = K('S10');
  const from = 1060;
  const items = ['回さない。', '128枚、描き溜める。', '黒い帯の時間に、毎秒60回書き込む。', '2MBのROMと、1ラインずつ削り出した時間。'];
  return (
    <Bg>
      <Nes src="drift1" from={from} x={70} y={40} w={900} volume={0.4} />
      {items.map((s, n) => (
        <Txt key={n} x={1010} y={140 + n * 150} size={n === 3 ? 40 : 50} w={880} color={n === 3 ? C.amber : C.text} o={useIn(k(n))}>{s}</Txt>
      ))}
      <Txt x={1030} y={800} size={30} color={C.sub} o={useIn(k(4))}>MMC5 RACING</Txt>
    </Bg>
  );
};
