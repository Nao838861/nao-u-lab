import React from 'react';
import {useCurrentFrame} from 'remotion';
import {Bg, C, SceneTitle, Tag, cueOf, useIn} from './common';
import {Big, Card, G, MONO, Nes, Pic, Txt, at, fmt, idx, ramp} from './parts';
import line from './data/gripline.json';

const K = (id: string) => (i: number) => cueOf(id, i);
const GL = line as {pts: number[][]; start: number};

/** 1本のタイヤの摩擦円（円＝限界、点＝要求、超過で赤）。値はGRIP 1位の走りの毎フレームのRAM */
const Wheel: React.FC<{x: number; y: number; cap: number; lon: number; lat: number; over: number; label: string; k?: number; showLoad?: boolean}> =
  ({x, y, cap, lon, lat, over, label, k = 1.25, showLoad}) => {
    const r = 18 + cap * k;
    const col = over ? C.red : C.text;
    const dx = Math.max(-r * 1.3, Math.min(r * 1.3, lat * 1.1)), dy = Math.max(-r * 1.3, Math.min(r * 1.3, -lon * 1.1));
    return (
      <div style={{position: 'absolute', left: x, top: y}}>
        <div style={{position: 'absolute', left: -r, top: -r, width: r * 2, height: r * 2, borderRadius: '50%', border: `6px solid ${col}`, boxShadow: over ? `0 0 26px ${C.red}` : undefined}} />
        <div style={{position: 'absolute', left: dx - 13, top: dy - 13, width: 26, height: 26, borderRadius: 13, background: col}} />
        <div style={{position: 'absolute', left: -110, top: 150, width: 220, textAlign: 'center', fontSize: 28, fontWeight: 800, color: C.sub}}>
          {label}{showLoad ? <span style={{color: C.amber}}>{`　重さ ${cap}`}</span> : null}
        </div>
      </div>
    );
  };
const wheels = (i: number) => [0, 1, 2, 3].map((n) => ({cap: at(G.cap, i)[n], lon: at(G.lon, i)[n], lat: at(G.lat, i)[n], over: at(G.over, i)[n]}));
const LABEL = ['左前', '右前', '左後', '右後'];

// ---------------- S09 見た目だけじゃない ----------------
export const S09: React.FC = () => {
  const f = useCurrentFrame(), k = K('S09');
  const c = [0, 1, 2, 3, 4, 5].map(k);
  const from = 1200, loop = 2200, i = idx(from, f, loop), w = wheels(i);
  const s = 700 / 256;
  const sum = w.reduce((a, b) => a + b.cap, 0) || 1;
  const pitch = ((w[0].cap + w[1].cap) - (w[2].cap + w[3].cap)) / sum;
  const roll = ((w[1].cap + w[3].cap) - (w[0].cap + w[2].cap)) / sum;
  const carO = ramp(f, c[2], c[2] + 14) * (1 - ramp(f, c[3] - 8, c[3] + 4));
  const circO = ramp(f, c[3], c[3] + 14);
  return (
    <Bg>
      <SceneTitle label="見た目だけじゃない：4輪の物理" />
      <Nes src="grip1" from={from} loop={loop} x={60} y={130} w={700}>
        <div style={{position: 'absolute', left: 160 * s, top: 120 * s, width: 80 * s, height: 60 * s, border: `4px solid ${C.amber}`, borderRadius: 10, opacity: useIn(c[0])}} />
      </Nes>
      <div style={{position: 'absolute', left: 60, top: 810, opacity: useIn(c[1])}}>
        <Tag color={C.cyan}>毎コマ、物理の計算で動きを決める（再生ではない）</Tag>
      </div>
      <div style={{opacity: carO}}>
        <div style={{position: 'absolute', left: 1080, top: 200, width: 480, height: 560, perspective: 900}}>
          <div style={{position: 'absolute', left: 120, top: 60, width: 240, height: 440, borderRadius: 60, background: '#c63b3b', border: '6px solid #fff',
            transform: `rotateX(${pitch * 70}deg) rotateY(${roll * 70}deg)`, boxShadow: '0 30px 60px rgba(0,0,0,.6)'}}>
            {[0, 1, 2, 3].map((n) => (
              <div key={n} style={{position: 'absolute', left: n % 2 ? 196 : -46, top: n < 2 ? 50 : 320, width: 80, height: 80, borderRadius: 40, background: '#0a0f1e',
                border: `4px solid ${C.amber}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 900, color: C.amber}}>{w[n].cap}</div>
            ))}
          </div>
        </div>
        <Txt x={900} y={770} size={32} w={860} align="center">前後・左右の傾きを2つのばねで計算 → タイヤごとの重さ</Txt>
      </div>
      <div style={{opacity: circO}}>
        {w.map((v, n) => <Wheel key={n} x={1130 + (n % 2) * 470} y={330 + Math.floor(n / 2) * 350} {...v} label={LABEL[n]} showLoad />)}
        <Txt x={860} y={110} size={30} color={C.sub} w={1000} align="center">{'円の大きさ＝出せる力の限界（重さ × 摩擦係数）'}</Txt>
        <Txt x={860} y={150} size={30} color={C.cyan} w={1000} align="center" o={ramp(f, c[4], c[4] + 14)}>{'点＝進む・止まる力と曲がる力の要求　はみ出すと赤＝滑る'}</Txt>
      </div>
      <div style={{position: 'absolute', left: 60, top: 870, opacity: useIn(c[5])}}>
        <Tag color={C.amber}>4本の力の合計 → 車の加速と回転</Tag>
      </div>
    </Bg>
  );
};

// ---------------- S10 そこから生まれる走り ----------------
const STATE = [C.amber, C.green, C.red];
export const S10: React.FC = () => {
  const f = useCurrentFrame(), k = K('S10');
  const c = [0, 1, 2, 3, 4].map(k);
  const from = 2820, bl = 180, i = idx(from, f, bl), w = wheels(i);
  const part1 = 1 - ramp(f, c[1] - 8, c[1]);
  const part2 = ramp(f, c[1] - 4, c[1] + 10) * (1 - ramp(f, c[3] - 8, c[3]));
  const sc = 2.4, sx = 150, sy = 160, sw = 380, sh = 320;
  const n0 = 800 - GL.start, n1 = 1060 - GL.start;
  const draw = n0 + Math.floor(ramp(f, c[2], c[2] + 420, 0, n1 - n0));
  const segs: React.ReactNode[] = [];
  for (let n = n0 + 1; n < draw; n++) {
    const a = GL.pts[n - 1], b = GL.pts[n];
    segs.push(<line key={n} x1={(a[0] - sx) * sc} y1={(a[1] - sy) * sc} x2={(b[0] - sx) * sc} y2={(b[1] - sy) * sc} stroke={STATE[b[2]]} strokeWidth={9} strokeLinecap="round" />);
  }
  return (
    <Bg>
      <SceneTitle label="そこから生まれる走り" />
      <div style={{opacity: part1}}>
        <Nes src="grip1" from={from} loop={bl} x={60} y={130} w={700} />
        <Txt x={60} y={800} size={26} color={C.sub}>ブレーキの瞬間を3秒ごとに繰り返し表示</Txt>
        <div style={{position: 'absolute', left: 1180, top: 480, opacity: (w[0].cap + w[1].cap) - (w[2].cap + w[3].cap) > 40 ? 1 : 0.12}}>
          <Tag color={C.amber}>ブレーキ中：前が重い</Tag>
        </div>
        <Wheel x={1120} y={330} {...w[0]} label="左前" />
        <Wheel x={1590} y={330} {...w[1]} label="右前" />
        <Wheel x={1120} y={680} {...w[2]} label="左後" />
        <Wheel x={1590} y={680} {...w[3]} label="右後" />
        <Txt x={880} y={120} size={36} w={960} align="center" color={C.amber}>ブレーキ → 前のタイヤが重くなる → 前の円が大きくなる</Txt>
      </div>
      <div style={{opacity: part2}}>
        <Card x={60} y={130} w={820} color={C.sub} o={ramp(f, c[1], c[1] + 14)}>
          <div style={{fontSize: 28, color: C.sub, fontWeight: 700}}>多くの2D・疑似3Dのレースゲーム</div>
          <div style={{fontSize: 38, fontWeight: 900}}>アクセルを踏んだまま曲がるのが速い</div>
        </Card>
        <Card x={60} y={300} w={820} color={C.cyan} o={ramp(f, c[2], c[2] + 14)}>
          <div style={{fontSize: 30, color: C.sub, fontWeight: 700}}>このゲーム</div>
          <div style={{fontSize: 36, fontWeight: 900, lineHeight: 1.45}}>手前で減速 → ラインを整える →<br />コーナーの頂点から加速<span style={{fontSize: 26, color: C.sub}}>（クリッピングポイント）</span></div>
          <div style={{fontSize: 30, color: C.cyan, fontWeight: 800, marginTop: 10}}>タイヤの限界を本当に計算しているから</div>
        </Card>
        <div style={{position: 'absolute', left: 930, top: 110, width: sw * sc, height: sh * sc, borderRadius: 12, overflow: 'hidden', opacity: ramp(f, c[2], c[2] + 14)}}>
          <Pic a={0} x={0} y={0} scale={sc} sx={sx} sy={sy} sw={sw} sh={sh} />
          <svg width={sw * sc} height={sh * sc} style={{position: 'absolute', left: 0, top: 0}}>{segs}</svg>
        </div>
        <div style={{position: 'absolute', left: 60, top: 640, display: 'flex', gap: 16, opacity: ramp(f, c[2] + 30, c[2] + 44)}}>
          <Tag color={C.red}>ブレーキ</Tag><Tag color={C.amber}>アクセルを離す</Tag><Tag color={C.green}>アクセル</Tag>
        </div>
        <Txt x={60} y={720} size={26} color={C.sub} w={800} o={ramp(f, c[2] + 30, c[2] + 44)}>{'GRIP 1位の走り・2周目の実際の走行ライン\n（ゲームのメモリから毎コマ記録）'}</Txt>
      </div>
      <div style={{opacity: ramp(f, c[3] - 4, c[3] + 10)}}>
        <Nes src="grip1" from={1000} loop={2200} x={60} y={160} w={500} />
        <Nes src="drift1" from={300} loop={1880} x={600} y={160} w={500} />
        <Txt x={60} y={650} size={34} color={C.green} w={520}>{'GRIP：補助なし\n計算だけで走る'}</Txt>
        <Txt x={600} y={650} size={34} color={C.amber} w={520}>{'DRIFT：後輪を\n滑らせやすくする補正'}</Txt>
        <Card x={1150} y={200} w={720} color={C.violet} o={ramp(f, c[4], c[4] + 16)}>
          <div style={{fontSize: 30, color: C.sub, fontWeight: 700}}>32ビット機の時代に登場した</div>
          <div style={{fontSize: 46, fontWeight: 900, lineHeight: 1.35}}>シミュレーション志向の<br />車の挙動を</div>
          <div style={{fontSize: 56, fontWeight: 900, color: C.violet, marginTop: 10}}>8ビットのファミコンで</div>
        </Card>
      </div>
    </Bg>
  );
};

// ---------------- S11 壁4 物理が重い ----------------
export const S11: React.FC = () => {
  const f = useCurrentFrame(), k = K('S11');
  const c = [0, 1, 2, 3, 4, 5, 6, 7].map(k);
  const show = (a: number, b?: number) => ramp(f, c[a] - 4, c[a] + 12) * (b === undefined ? 1 : 1 - ramp(f, c[b] - 10, c[b]));
  const BW = 1700 / 29780;
  const parts = [
    {v: 9602, label: '物理', col: C.amber},
    {v: 2935, label: '背景の準備', col: '#5d6b8f'},
    {v: 3728, label: 'その他', col: '#3f4c70'},
    {v: 7449, label: '書き込み（最大）', col: C.cyan},
  ];
  let acc = 0;
  return (
    <Bg>
      <SceneTitle label="壁4　物理が重い" color={C.red} />
      <Big o={useIn(c[0]) * (1 - ramp(f, c[1] - 10, c[1]))} color={C.red}>壁4</Big>
      <div style={{opacity: show(1, 3)}}>
        <Txt x={110} y={170} size={34} color={C.sub}>1コマのCPU時間 約29,780サイクル（開発途中のある重い場面の内訳）</Txt>
        <div style={{position: 'absolute', left: 110, top: 240, width: 1700, height: 110, background: '#131b31', borderRadius: 12, overflow: 'hidden', display: 'flex'}}>
          {parts.map((p, n) => {
            const wd = p.v * BW * ramp(f, c[1] + n * 10, c[1] + n * 10 + 20);
            acc += p.v;
            return <div key={n} style={{width: wd, height: '100%', background: p.col, borderRight: '3px solid #0a0f1e', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 30, fontWeight: 900, color: '#0a0f1e', whiteSpace: 'nowrap', overflow: 'hidden'}}>{p.label}</div>;
          })}
        </div>
        <Txt x={110} y={370} size={56}>物理だけで <span style={{color: C.amber}}>約9,600サイクル</span></Txt>
        <Card x={110} y={500} w={1100} color={C.violet} o={ramp(f, c[2], c[2] + 14)}>
          <div style={{fontSize: 32, fontWeight: 800}}>6502には掛け算の命令がない → MMC5の掛け算回路を借りる</div>
          <div style={{fontFamily: MONO, fontSize: 32, marginTop: 12, color: C.cyan, lineHeight: 1.5}}>
            STA $5205 ; かけられる数<br />STA $5206 ; かける数<br />LDA $5205 ; 答え（下位）　LDA $5206 ; 答え（上位）
          </div>
        </Card>
      </div>
      <div style={{opacity: show(3, 6)}}>
        <Txt x={110} y={150} size={34} color={C.sub}>開発途中：1コマの処理（画面の更新に間に合わせる上限との比較）</Txt>
        <div style={{position: 'absolute', left: 110, top: 220, width: 24959 * 0.065, height: 90, background: C.red, borderRadius: 10}} />
        <div style={{position: 'absolute', left: 110 + 20843 * 0.065, top: 200, width: 6, height: 130, background: C.amber}} />
        <Txt x={110} y={330} size={44}>{'24,959 / 上限 20,843　'}<span style={{color: C.red}}>約4,100サイクルはみ出す</span></Txt>
        <Card x={110} y={440} w={820} color={C.cyan} o={ramp(f, c[4], c[4] + 14)}>
          <div style={{fontSize: 36, fontWeight: 800, lineHeight: 1.6}}>・割り算 → 表引きへ<br />・重なった計算を省く<br />・左右で同じ計算は1回に</div>
        </Card>
        <Card x={980} y={440} w={830} color={C.amber} o={ramp(f, c[4] + 30, c[4] + 44)}>
          <div style={{fontSize: 30, color: C.sub, fontWeight: 700}}>条件</div>
          <div style={{fontSize: 52, fontWeight: 900, color: C.amber}}>車の動きを1ビットも変えない</div>
        </Card>
        <div style={{opacity: ramp(f, c[5], c[5] + 14)}}>
          <Card x={110} y={680} w={1700} color={C.green}>
            <div style={{fontSize: 34, fontWeight: 800}}>同じ状態 → 旧コード／新コード → 結果を全部比較 → <span style={{color: C.green}}>一致</span></div>
            <div style={{fontSize: 30, color: C.sub, fontWeight: 700, marginTop: 6}}>多いものは数千通り、ある計算は入力 65,536通りをすべて確認</div>
          </Card>
        </div>
      </div>
      <div style={{opacity: show(6, 7)}}>
        <div style={{position: 'absolute', left: 250, top: 200, width: 400, height: 560}}>
          <div style={{position: 'absolute', left: 120, top: 40, width: 160, height: 480, borderRadius: 50, background: '#c63b3b', border: '5px solid #fff'}} />
          {[0, 1, 2, 3].map((n) => (
            <div key={n} style={{position: 'absolute', left: n % 2 ? 300 : 0, top: n < 2 ? 80 : 380, width: 100, height: 100, borderRadius: 50, border: `5px solid ${C.text}`}} />
          ))}
          {[130, 430].map((y) => <div key={y} style={{position: 'absolute', left: 50, top: y, width: 300, height: 6, background: C.cyan, boxShadow: `0 0 18px ${C.cyan}`}} />)}
        </div>
        <Txt x={780} y={300} size={48} w={1000}>同じ車軸の左右で、接地点の速度を共有</Txt>
        <Txt x={780} y={400} size={56} color={C.cyan} w={1000}>約1,000サイクル減</Txt>
        <Txt x={780} y={500} size={34} color={C.sub} w={1000}>唯一、意図して動きを変えた近似（4輪それぞれの重さ・力・摩擦円は残す）</Txt>
      </div>
      <div style={{opacity: show(7)}}>
        <Nes src="drift1" from={300} loop={1880} x={110} y={150} w={700} />
        <Card x={900} y={260} w={900} color={C.green}>
          <div style={{fontSize: 32, color: C.sub, fontWeight: 700}}>ランキング1位の走りで</div>
          <div style={{fontSize: 60, fontWeight: 900}}>画面の更新 <span style={{color: C.green}}>{fmt(Math.min(2216, Math.round(ramp(f, c[7], c[7] + 60, 1800, 2216))))} / 2,216</span></div>
          <div style={{fontSize: 32, color: C.green, fontWeight: 800}}>取りこぼし 0</div>
        </Card>
      </div>
    </Bg>
  );
};

// ---------------- S12 まとめ ----------------
export const S12: React.FC = () => {
  const f = useCurrentFrame(), k = K('S12');
  const from = 850;
  const items = ['回さない。', '128枚、描き溜める。', '黒い帯の時間に、毎秒60回書き込む。', '残りの時間で、4つのタイヤを計算する。', '2MBのROMと、1ラインずつ削り出した時間。'];
  return (
    <Bg>
      <Nes src="drift1" from={from} x={70} y={40} w={900} volume={0.4} />
      {items.map((s, n) => (
        <Txt key={n} x={1010} y={110 + n * 125} size={n === 4 ? 38 : 42} w={880} color={n === 4 ? C.amber : C.text} o={useIn(k(n))}>{s}</Txt>
      ))}
      <Txt x={1010} y={760} size={26} color={C.sub} w={880} o={useIn(k(5))}>{'走行：keitoushi（Web版ランキング DRIFT 1位）\n　　　Nao_u（Web版ランキング GRIP 1位）'}</Txt>
    </Bg>
  );
};
