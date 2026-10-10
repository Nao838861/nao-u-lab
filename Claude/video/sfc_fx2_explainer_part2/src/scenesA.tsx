import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, Easing} from 'remotion';
import {Arrow, Bg, Box, C, Fade, Game, Pix, SceneTitle, Tag, clamp, cueOf, useIn, usePop} from './common';
import {CLIP} from './clips';
import pal from './palgrid.json';

const PG = pal as unknown as {start: number; cols: number; rows: number; y0: number; frames: string[]; palettes: string[][]};

// ───────────────────────── shared pieces
const ROADS = [
  {key: 'A', name: '2bpp ＋ パレット', color: C.green, fps: '60fps', colors: '8×8ごとに3色＋透明', state: '完成', clip: 'color'},
  {key: 'B', name: '4bpp ・ 30fps', color: C.amber, fps: '30fps', colors: '共通15色＋透明', state: '転送は成立・絵はこれから', clip: 'fourbpp'},
  {key: 'C', name: 'SA-1 ・ 4bpp', color: C.violet, fps: '60fps未達', colors: '共通15色＋透明', state: '挑戦中', clip: 'sa1'},
];

/** Palette-number overlay for the gsu_color clip: one cell per 8×8 tile, colored by its palette. */
export const PalGrid: React.FC<{w: number; field: number; mode: 'outline' | 'number' | 'fill'; o?: number; only?: (i: number) => boolean}> = ({w, field, mode, o = 1, only}) => {
  const f = useCurrentFrame();
  const idx = Math.max(0, Math.min(PG.frames.length - 1, field + f - PG.start));
  const s = PG.frames[idx];
  const sc = w / 256;
  const cells: React.ReactNode[] = [];
  for (let r = 0; r < PG.rows; r++) for (let c = 0; c < PG.cols; c++) {
    const ch = s[r * PG.cols + c];
    if (ch === '.') continue;
    const p = Number(ch);
    if (only && !only(r * PG.cols + c)) continue;
    const col = PG.palettes[p]?.[3] ?? '#fff';
    const x = c * 8 * sc, y = (r * 8 + PG.y0) * sc;
    cells.push(
      <g key={r * 64 + c}>
        <rect x={x + 1} y={y + 1} width={8 * sc - 2} height={8 * sc - 2} fill={mode === 'fill' ? `${col}aa` : 'none'} stroke={col} strokeWidth={2} />
        {mode !== 'outline' && <text x={x + 4 * sc} y={y + 5.6 * sc} fontSize={4.6 * sc} fill="#fff" fontWeight={800} textAnchor="middle" style={{paintOrder: 'stroke', stroke: '#000', strokeWidth: 3}}>{p}</text>}
      </g>,
    );
  }
  return (
    <svg width={w} height={(w * 180) / 256} style={{position: 'absolute', left: 0, top: 0, opacity: o}}>
      {Array.from({length: 33}, (_, i) => <line key={`v${i}`} x1={i * 8 * sc} y1={0} x2={i * 8 * sc} y2={180 * sc} stroke="rgba(255,255,255,.13)" strokeWidth={1} />)}
      {Array.from({length: 25}, (_, i) => <line key={`h${i}`} x1={0} y1={(i * 8 + PG.y0) * sc} x2={256 * sc} y2={(i * 8 + PG.y0) * sc} stroke="rgba(255,255,255,.13)" strokeWidth={1} />)}
      {cells}
    </svg>
  );
};

const Swatch: React.FC<{colors: string[]; size?: number; label?: string; dimFirst?: boolean}> = ({colors, size = 40, label, dimFirst = true}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
    {label && <div style={{width: 120, fontSize: 26, color: C.sub, fontWeight: 700}}>{label}</div>}
    {colors.map((c, i) => (
      <div key={i} style={{width: size, height: size, borderRadius: 6, background: i === 0 && dimFirst ? 'repeating-conic-gradient(#555 0 25%, #222 0 50%) 0 0/12px 12px' : c, border: '2px solid rgba(255,255,255,.25)'}} />
    ))}
  </div>
);

const Bar: React.FC<{y: number; x?: number; label: string; value: number; max: number; width: number; color: string; p: number; unit: string; note?: React.ReactNode; lw?: number}> = ({y, x = 100, label, value, max, width, color, p, unit, note, lw = 380}) => (
  <div style={{position: 'absolute', left: x, top: y, opacity: Math.min(1, p * 3), whiteSpace: 'nowrap'}}>
    <div style={{position: 'absolute', left: 0, top: 8, width: lw, fontSize: 30, fontWeight: 800, textAlign: 'right'}}>{label}</div>
    <div style={{position: 'absolute', left: lw + 30, top: 0, width: (width * value * p) / max, height: 56, background: color, borderRadius: 8}} />
    <div style={{position: 'absolute', left: lw + 30 + (width * value * p) / max + 16, top: 8, fontSize: 32, fontWeight: 900, color}}>
      {(value * p).toLocaleString(undefined, {maximumFractionDigits: value < 100 ? 1 : 0})} {unit} {p > 0.99 ? note : null}
    </div>
  </div>
);

// ───────────────────────── C01 オープニング
export const C01: React.FC = () => {
  const f = useCurrentFrame();
  const q = (i: number) => cueOf('C01', i);
  const split = interpolate(f, [q(1) - 10, q(1) + 40], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const titleO = interpolate(f, [0, 20, q(1) - 30, q(1)], [0, 1, 1, 0], clamp);
  const w = interpolate(split, [0, 1], [1536, 600]);
  const items = [
    {clip: 'mono', label: '前回：2bpp 白黒', sub: '60fps', color: '#ffffff'},
    {clip: 'color', label: '2bpp ＋ パレット', sub: '60fps', color: C.green},
    {clip: 'fourbpp', label: '4bpp 16色', sub: '30fps', color: C.amber},
  ];
  const endTitle = useIn(q(1) + 160, 24);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 30 * split}}>
        {items.map((it, i) => {
          const show = i === 0 ? 1 : split;
          return (
            <div key={it.clip} style={{width: i === 0 ? w : 600 * split, opacity: show, overflow: 'hidden', display: i > 0 && split < 0.01 ? 'none' : 'block'}}>
              <Game clip={it.clip} field={CLIP.opening} w={i === 0 ? w : 600} style={{borderRadius: split > 0.5 ? 8 : 0}} />
              <div style={{marginTop: 18, textAlign: 'center', opacity: split, whiteSpace: 'nowrap'}}>
                <div style={{fontSize: 36, fontWeight: 900, color: it.color}}>{it.label}</div>
                <div style={{fontSize: 30, color: C.sub, fontWeight: 700}}>{it.sub}</div>
              </div>
            </div>
          );
        })}
      </div>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,.7) 0%, rgba(0,0,0,0) 35%)', opacity: titleO}} />
      <div style={{position: 'absolute', top: 120, width: '100%', textAlign: 'center', opacity: titleO}}>
        <div style={{fontSize: 34, fontWeight: 700, color: C.cyan, letterSpacing: 6}}>SUPER FAMICOM × SUPER FX2　第2回</div>
        <div style={{fontSize: 88, fontWeight: 900, color: '#fff', textShadow: '0 6px 30px rgba(0,0,0,.8)', marginTop: 10}}>捨てた色と、無かった音</div>
      </div>
      <div style={{position: 'absolute', top: 90, width: '100%', textAlign: 'center', opacity: endTitle}}>
        <div style={{display: 'inline-block', background: 'rgba(5,8,18,.85)', padding: '18px 40px', borderRadius: 16, fontSize: 52, fontWeight: 900}}>
          <span style={{color: C.green}}>色</span>をどう取り戻したか　／　<span style={{color: C.cyan}}>音</span>をどう付けたか
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ───────────────────────── C02 おさらい
export const C02: React.FC = () => {
  const f = useCurrentFrame();
  const q = (i: number) => cueOf('C02', i);
  const flow = interpolate(f, [q(0) + 20, q(0) + 60], [0, 1], clamp);
  const b4 = interpolate(f, [q(1), q(1) + 60], [0, 1], clamp);
  const b2 = interpolate(f, [q(1) + 200, q(1) + 250], [0, 1], clamp);
  const gap = interpolate(f, [q(0) + 120, q(0) + 170], [0, 1], clamp);
  const ng = interpolate(f, [q(1) + 120, q(1) + 140], [0, 1], clamp);
  const see = useIn(q(2), 24);
  const tilt = Math.sin((f - q(2)) / 40) * 9 * see;
  return (
    <Bg>
      <SceneTitle label="おさらい：なぜ白黒だったのか" />
      <div style={{opacity: 1 - see}}>
        <Box x={100} y={170} w={360} h={150} color={C.cyan} title="カートリッジRAM" sub="SuperFXが描いた絵" fs={30} />
        <Box x={760} y={170} w={360} h={150} color={C.green} title="ビデオメモリ" sub="画面チップが読む" fs={30} />
        <Arrow x1={465} y1={245} x2={750} y2={245} color={C.amber} p={flow} label="すき間でだけ転送" />
        <div style={{position: 'absolute', left: 100, top: 400, fontSize: 28, color: C.sub, opacity: b4}}>256×192ドットの絵 1枚</div>
        <Bar y={450} label="16色（4bpp）" value={24576} max={24576} width={700} color={C.red} p={b4} unit="バイト" note={<span style={{opacity: ng, marginLeft: 8}}>✕ 60fpsでは送れない</span>} />
        <Bar y={540} label="4色（2bpp）" value={12288} max={24576} width={700} color={C.amber} p={b2} unit="バイト" note={<Tag color="#fff" style={{background: '#000', marginLeft: 12}}>白黒に</Tag>} />
        <Bar y={630} label="1回のすき間" value={11296} max={24576} width={700} color={C.green} p={gap} unit="バイト" note={<span style={{color: C.sub, fontSize: 26, marginLeft: 8}}>上下の黒帯を足して</span>} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 230, opacity: see, display: 'flex', justifyContent: 'center'}}>
        <div style={{position: 'relative', width: 1200, height: 520}}>
          <div style={{position: 'absolute', left: 560, top: 300, width: 0, height: 0, borderLeft: '40px solid transparent', borderRight: '40px solid transparent', borderBottom: `70px solid ${C.sub}`}} />
          <div style={{position: 'absolute', left: 100, top: 280, width: 1000, height: 16, background: C.line, borderRadius: 8, transform: `rotate(${tilt}deg)`, transformOrigin: '500px 8px'}}>
            <div style={{position: 'absolute', left: -20, top: -150, width: 300, textAlign: 'center'}}>
              <div style={{fontSize: 60, fontWeight: 900, color: C.green}}>色数</div>
            </div>
            <div style={{position: 'absolute', right: -20, top: -150, width: 300, textAlign: 'center'}}>
              <div style={{fontSize: 60, fontWeight: 900, color: C.cyan}}>転送量</div>
            </div>
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 420, textAlign: 'center', fontSize: 40, fontWeight: 800}}>
            色を増やす → 転送が増える　／　転送を守る → 色が減る
          </div>
        </div>
      </div>
    </Bg>
  );
};

// ───────────────────────── C03 三つの道
export const C03: React.FC = () => {
  const q = (i: number) => cueOf('C03', i);
  return (
    <Bg>
      <SceneTitle label="色を取り戻す、三つの道" />
      {ROADS.map((r, i) => {
        const p = usePop(q(i));
        return (
          <div key={r.key} style={{position: 'absolute', left: 80 + i * 600, top: 150, width: 560, height: 740, borderRadius: 20, background: C.panel, border: `4px solid ${r.color}`, opacity: Math.min(1, p * 1.4), transform: `translateY(${(1 - p) * 40}px)`, padding: 26, boxSizing: 'border-box'}}>
            <div style={{fontSize: 30, fontWeight: 900, color: r.color}}>道{r.key}</div>
            <div style={{fontSize: 44, fontWeight: 900, marginTop: 4}}>{r.name}</div>
            <div style={{marginTop: 22}}>
              <Game clip={r.clip} field={r.clip === 'sa1' ? CLIP.sa1 : CLIP.roads} w={508} />
            </div>
            <div style={{marginTop: 26, fontSize: 30, lineHeight: 1.7}}>
              <div><span style={{color: C.sub}}>色：</span>{r.colors}</div>
              <div><span style={{color: C.sub}}>速さ：</span><b style={{color: r.color}}>{r.fps}</b></div>
              <div><span style={{color: C.sub}}>状態：</span>{r.state}</div>
            </div>
          </div>
        );
      })}
    </Bg>
  );
};

// ───────────────────────── C04 タイルごとにパレット
const Pal2: React.FC = () => (
  <div style={{display: 'flex', gap: 14}}>
    {['透明', '1', '2', '3'].map((t, i) => (
      <div key={i} style={{textAlign: 'center'}}>
        <div style={{width: 70, height: 70, borderRadius: 8, background: i === 0 ? 'repeating-conic-gradient(#555 0 25%, #222 0 50%) 0 0/14px 14px' : ['', '#000', '#aaa', '#fff'][i], border: '2px solid rgba(255,255,255,.3)'}} />
        <div style={{fontSize: 26, marginTop: 6, color: C.sub, fontWeight: 700}}>{i === 0 ? '0' : t}{i === 0 ? '＝透明' : ''}</div>
      </div>
    ))}
  </div>
);
export const C04: React.FC = () => {
  const f = useCurrentFrame();
  const q = (i: number) => cueOf('C04', i);
  const pals = useIn(q(1));
  const morph = interpolate(f, [q(2) + 30, q(2) + 90], [0, 1], clamp);
  const game = useIn(q(3) - 20, 24);
  return (
    <Bg>
      <SceneTitle label="道A　タイルごとにパレットを選ぶ" color={C.green} />
      <div style={{opacity: 1 - game}}>
        <Fade at={q(0)} style={{position: 'absolute', left: 100, top: 170}}>
          <div style={{fontSize: 34, fontWeight: 800, marginBottom: 18}}>2bpp ＝ 1画素に <span style={{color: C.amber}}>4通り</span> の番号</div>
          <Pal2 />
        </Fade>
        <div style={{position: 'absolute', left: 100, top: 400, opacity: pals}}>
          <div style={{fontSize: 34, fontWeight: 800, marginBottom: 16}}>8×8のタイルごとに <span style={{color: C.green}}>色の組を1つ選ぶ</span>（8組）</div>
          <div style={{display: 'flex', flexDirection: 'column', gap: 6}}>
            {PG.palettes.map((p, i) => <Swatch key={i} colors={p} size={32} label={`組 ${i}`} />)}
          </div>
        </div>
        <div style={{position: 'absolute', left: 1050, top: 180, width: 760, height: 640, borderRadius: 16, background: '#0b1124', border: `2px solid ${C.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 70}}>
          {['13', '03'].map((n) => (
            <div key={n} style={{position: 'relative'}}>
              <Pix src={`art_${n}_mono.png`} scale={1} style={{width: n === '13' ? 384 : 220, opacity: 1 - morph, position: 'absolute'}} />
              <Pix src={`art_${n}_color.png`} scale={1} style={{width: n === '13' ? 384 : 220, opacity: morph}} />
              <div style={{position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,.35) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,.35) 2px, transparent 2px)', backgroundSize: `${n === '13' ? 24 : 32}px ${n === '13' ? 24 : 32}px`, opacity: pals * 0.8}} />
            </div>
          ))}
        </div>
        <Fade at={q(2) + 30} style={{position: 'absolute', left: 1050, top: 840, width: 760, textAlign: 'center', fontSize: 32, fontWeight: 800}}>
          絵のデータは<span style={{color: C.amber}}>2bppのまま</span>　→　転送量は<span style={{color: C.green}}>増えない</span>
        </Fade>
      </div>
      <div style={{position: 'absolute', left: 160, top: 150, opacity: game}}>
        <Game clip="gsu_color" field={CLIP.gridScene} w={1000} style={{background: '#000'}}>
          <PalGrid w={1000} field={CLIP.gridScene} mode="outline" />
        </Game>
        <div style={{fontSize: 26, color: C.sub, marginTop: 10}}>SuperFXが描く層だけを表示。枠の色＝そのタイルが選んだ色の組</div>
      </div>
      <div style={{position: 'absolute', left: 1320, top: 170, width: 520, opacity: game, display: 'flex', flexDirection: 'column', gap: 26, alignItems: 'center'}}>
        <div style={{fontSize: 30, fontWeight: 800}}>録画の色 → 8×8ごとに3色</div>
        {['04', '14', '31'].map((n) => (
          <div key={n} style={{display: 'flex', gap: 30, alignItems: 'center'}}>
            <Pix src={`art_${n}_mono.png`} scale={1} style={{height: 150}} />
            <div style={{fontSize: 40, color: C.green}}>→</div>
            <Pix src={`art_${n}_color.png`} scale={1} style={{height: 150}} />
          </div>
        ))}
      </div>
    </Bg>
  );
};

// ───────────────────────── C05 31fpsへの転落
export const C05: React.FC = () => {
  const f = useCurrentFrame();
  const q = (i: number) => cueOf('C05', i);
  const steps = ['描く順番（奥→手前）', '拡大縮小の倍率', '左右・上下の反転', '画面の端で切れる', 'タイル中心に来る画素'];
  const fpsP = interpolate(f, [q(2) + 40, q(2) + 160], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const fps = 60 - (60 - 31.6) * fpsP;
  const slow = useIn(q(3), 20);
  const cpu = interpolate(f, [q(2), q(2) + 160], [0, 1], clamp);
  return (
    <Bg>
      <SceneTitle label="道A　色を決める計算で31fpsへ" color={C.red} />
      <div style={{position: 'absolute', left: 80, top: 190}}>
        <Game clip="gsu_color" field={CLIP.gridScene + 300} w={980} style={{background: '#000'}}>
          <PalGrid w={980} field={CLIP.gridScene + 300} mode="number" />
        </Game>
        <div style={{position: 'absolute', top: -46, display: 'flex', justifyContent: 'space-between', fontSize: 28, color: C.sub, width: 980}}>
          <span>32 × 24 ＝ <b style={{color: C.text}}>768タイル</b> の色の組を毎コマ決める</span>
        </div>
      </div>
      <div style={{position: 'absolute', left: 1120, top: 160, width: 720}}>
        <div style={{fontSize: 32, fontWeight: 900, color: C.amber, marginBottom: 14}}>SuperFXと同じ計算をもう一度</div>
        {steps.map((s, i) => {
          const p = interpolate(f, [q(1) + i * 35, q(1) + i * 35 + 16], [0, 1], clamp);
          return <div key={s} style={{fontSize: 30, fontWeight: 700, marginBottom: 10, opacity: p, transform: `translateX(${(1 - p) * 30}px)`}}><span style={{color: C.amber}}>▸</span> {s}</div>;
        })}
      </div>
      <div style={{position: 'absolute', left: 1120, top: 520, width: 720, opacity: useIn(q(2))}}>
        <div style={{fontSize: 30, fontWeight: 800}}>本体CPUで計算</div>
        <div style={{height: 46, marginTop: 10, width: 700, borderRadius: 10, background: '#0b1124', border: `2px solid ${C.line}`, overflow: 'hidden', position: 'relative'}}>
          <div style={{width: `${30 + cpu * 70}%`, height: '100%', background: cpu > 0.6 ? C.red : C.amber}} />
          <div style={{position: 'absolute', left: '50%', top: 0, bottom: 0, width: 3, background: C.green}} />
        </div>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 16, marginTop: 20}}>
          <div style={{fontSize: 130, fontWeight: 900, color: fpsP > 0.5 ? C.red : C.green, lineHeight: 1}}>{fps.toFixed(1)}</div>
          <div style={{fontSize: 40, color: C.sub, fontWeight: 800}}>fps</div>
        </div>
        <div style={{fontSize: 24, color: C.sub}}>通常操作 31.62fps ／ ボス撃破から次周 33.96fps（カラー試作ROM）</div>
      </div>
      <div style={{position: 'absolute', left: 1120, top: 860, opacity: slow}}>
        <Tag color={C.red}>表示が遅れる ＝ ゲームの進行も遅れる</Tag>
      </div>
    </Bg>
  );
};

// ───────────────────────── C06 60fpsへ戻す
const MiniGrid: React.FC<{x: number; y: number; label: string; seed: number; diff?: number; color: string}> = ({x, y, label, seed, diff = 0, color}) => {
  const cells: React.ReactNode[] = [];
  for (let r = 0; r < 12; r++) for (let c = 0; c < 16; c++) {
    const v = Math.sin(r * 12.9898 + c * 78.233 + seed) * 43758.5453;
    const k = v - Math.floor(v);
    const changed = diff > 0 && ((r * 16 + c) % 37 === 5 || (r >= 4 && r <= 6 && c >= 5 && c <= 9));
    cells.push(<div key={r * 16 + c} style={{position: 'absolute', left: c * 30, top: r * 30, width: 27, height: 27, borderRadius: 4, background: changed ? `rgba(255,181,71,${diff})` : k > 0.72 ? '#2c4a7a' : '#16213d'}} />);
  }
  return (
    <div style={{position: 'absolute', left: x, top: y}}>
      <div style={{fontSize: 28, fontWeight: 800, color, marginBottom: 10}}>{label}</div>
      <div style={{position: 'relative', width: 480, height: 360}}>{cells}</div>
    </div>
  );
};
export const C06: React.FC = () => {
  const f = useCurrentFrame();
  const q = (i: number) => cueOf('C06', i);
  const move = interpolate(f, [q(0) + 60, q(0) + 150], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const ph1 = interpolate(f, [q(2) - 20, q(2)], [1, 0], clamp);
  const ph2 = interpolate(f, [q(2) - 10, q(2) + 10, q(3) - 10, q(3) + 10], [0, 1, 1, 0], clamp);
  const diff = interpolate(f, [q(2) + 120, q(2) + 160], [0, 1], clamp);
  const runs = interpolate(f, [q(2) + 220, q(2) + 260], [0, 1], clamp);
  const ph3 = interpolate(f, [q(3), q(3) + 20, q(4) - 10, q(4) + 10], [0, 1, 1, 0], clamp);
  const flip = interpolate(f, [q(3) + 200, q(3) + 230], [0, 1], clamp);
  const ph4 = useIn(q(4));
  const cx = interpolate(move, [0, 1], [190, 1290]);
  return (
    <Bg>
      <SceneTitle label="道A　色決めをSuperFXへ移す" color={C.green} />
      <div style={{opacity: ph1}}>
        <Box x={80} y={200} w={500} h={330} color={C.green} title="本体CPU" sub="ゲーム進行・当たり判定・位置と大きさ" />
        <Box x={1180} y={200} w={560} h={330} color={C.amber} title="SuperFX2" sub="描画リストの順に拡大縮小して描く" />
        <div style={{position: 'absolute', left: cx, top: 420, width: 330, padding: '14px 0', borderRadius: 14, border: `3px solid ${C.cyan}`, background: C.panel2, textAlign: 'center', fontSize: 32, fontWeight: 900, color: C.cyan, boxShadow: `0 0 30px ${C.cyan}66`}}>タイルの色を決める</div>
        <Arrow x1={585} y1={300} x2={1170} y2={300} color={C.amber} p={1} label="描画リスト" />
        <Fade at={q(1)} style={{position: 'absolute', left: 80, top: 600, width: 1700, display: 'flex', gap: 40, alignItems: 'center'}}>
          <Box x={0} y={0} w={500} h={170} color={C.green} title="CPU" sub="出来上がった色の表を送るだけ" fs={30} />
          <div style={{position: 'absolute', left: 560, top: 50, fontSize: 34, fontWeight: 800}}>
            描くついでに色も決める → <span style={{color: C.green}}>CPUの負担が消える</span>
          </div>
        </Fade>
      </div>
      <div style={{opacity: ph2}}>
        <MiniGrid x={120} y={190} label="前のコマの色の表" seed={1} color={C.sub} />
        <MiniGrid x={700} y={190} label="今のコマの色の表" seed={1} diff={diff} color={C.amber} />
        <div style={{position: 'absolute', left: 1280, top: 200, width: 560, opacity: runs}}>
          <div style={{fontSize: 30, fontWeight: 800, marginBottom: 14}}>変わった所だけを送る</div>
          {[0, 1, 2, 3, 4].map((i) => <div key={i} style={{height: 34, marginBottom: 10, width: [380, 160, 260, 90, 200][i], borderRadius: 8, background: C.amber}} />)}
          <div style={{fontSize: 34, fontWeight: 900, color: C.amber, marginTop: 10}}>最大12区間にまとめる</div>
          <div style={{fontSize: 26, color: C.sub, marginTop: 6}}>表全体は768バイト。毎回全部は送らない</div>
        </div>
      </div>
      <div style={{opacity: ph3}}>
        {[0, 1].map((i) => {
          const shown = flip > 0.5 ? 1 - i : i;
          return (
            <div key={i} style={{position: 'absolute', left: 260 + i * 720, top: 230, width: 560, height: 380, borderRadius: 18, border: `4px solid ${shown === 0 ? C.green : C.line}`, background: C.panel, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
              <div style={{fontSize: 42, fontWeight: 900}}>色の表 {i === 0 ? '表' : '裏'}</div>
              <div style={{fontSize: 30, color: shown === 0 ? C.green : C.amber, marginTop: 14, fontWeight: 800}}>{shown === 0 ? '表示中' : '先に送っておく'}</div>
            </div>
          );
        })}
        <div style={{position: 'absolute', left: 0, right: 0, top: 680, textAlign: 'center', fontSize: 36, fontWeight: 800}}>
          絵が届いた瞬間に <span style={{color: C.green}}>表と裏を切り替える</span>
        </div>
      </div>
      <div style={{position: 'absolute', inset: 0, opacity: ph4}}>
        <div style={{position: 'absolute', left: 100, top: 170}}>
          <Game clip="color" field={CLIP.colorBoss} w={960} />
        </div>
        <div style={{position: 'absolute', left: 1120, top: 190, width: 720}}>
          <div style={{fontSize: 30, color: C.sub}}>カラーのまま</div>
          <div style={{fontSize: 120, fontWeight: 900, color: C.green, lineHeight: 1.1}}>60<span style={{fontSize: 50}}>fps</span></div>
          <div style={{fontSize: 30, lineHeight: 1.7, marginTop: 20}}>
            通常プレイ　1万8千フィールド<br />ボス戦継続　1万8千フィールド<br /><b style={{color: C.green}}>表示の遅れ 0回</b>
          </div>
          <div style={{fontSize: 22, color: C.sub, marginTop: 16}}>Mesen 2.1.1・NTSCでの計測（実機は未検証）</div>
        </div>
      </div>
    </Bg>
  );
};

// ───────────────────────── C07 8×8の代償
const Bleed: React.FC<{p: number}> = ({p}) => {
  const px = 34;
  const back = (x: number, y: number) => (x - 3.5) ** 2 / 14 + (y - 5) ** 2 / 6 < 1;
  const front = (x: number, y: number) => (x - 8.5) ** 2 / 9 + (y - 3.5) ** 2 / 9 < 1;
  const cells: React.ReactNode[] = [];
  for (let y = 0; y < 8; y++) for (let x = 0; x < 12; x++) {
    const inCell = x >= 4;
    let col = '';
    if (front(x, y)) col = C.red;
    else if (back(x, y)) col = inCell && p > 0.5 ? '#ff9aa6' : C.green;
    if (col) cells.push(<rect key={`${x}-${y}`} x={x * px} y={y * px} width={px - 2} height={px - 2} fill={col} />);
  }
  return (
    <svg width={12 * px} height={8 * px} style={{overflow: 'visible'}}>
      {cells}
      <rect x={4 * px} y={0} width={8 * px} height={8 * px} fill="none" stroke={C.amber} strokeWidth={5} />
      <text x={8 * px} y={-14} fill={C.amber} fontSize={26} fontWeight={800} textAnchor="middle">8×8のタイル1枚（色の組は1つ）</text>
    </svg>
  );
};
export const C07: React.FC = () => {
  const f = useCurrentFrame();
  const q = (i: number) => cueOf('C07', i);
  const bleed = interpolate(f, [q(1) + 40, q(1) + 60], [0, 1], clamp);
  const ph2 = interpolate(f, [q(2) - 10, q(2) + 10, q(3) - 10, q(3) + 10], [0, 1, 1, 0], clamp);
  const ph3 = useIn(q(3));
  const wipe = interpolate((f - q(3)) % 300, [60, 150, 210, 290], [0, 1, 1, 0], clamp);
  return (
    <Bg>
      <SceneTitle label="道A　8×8の代償" color={C.amber} />
      <div style={{opacity: 1 - Math.max(ph2, ph3)}}>
        <div style={{position: 'absolute', left: 300, top: 260, transform: 'scale(1.5)', transformOrigin: 'left top'}}><Bleed p={bleed} /></div>
        <Fade at={q(1)} style={{position: 'absolute', left: 1160, top: 300, width: 680, fontSize: 34, lineHeight: 1.6, fontWeight: 700}}>
          <span style={{color: C.green}}>奥の物体（緑）</span>と<span style={{color: C.red}}>手前の物体（赤）</span>が同じタイルに入ると…
          <div style={{marginTop: 20, opacity: bleed, color: '#ff9aa6', fontWeight: 900}}>奥の物体も手前の色の組で塗られる</div>
        </Fade>
      </div>
      <div style={{position: 'absolute', left: 120, top: 150, opacity: ph2}}>
        <div style={{position: 'relative', width: 1680, height: 871, overflow: 'hidden', borderRadius: 10}}>
          <Img src={staticFile('img/shadow_grass.png')} style={{width: 1680, imageRendering: 'pixelated'}} />
        </div>
        <div style={{position: 'absolute', left: 20, top: 20, display: 'flex', gap: 12}}><Tag color={C.red} style={{background: '#000c'}}>修正前：影と草が重なると色が崩れる</Tag></div>
        <div style={{position: 'absolute', left: 20, top: 455, display: 'flex', gap: 12}}><Tag color={C.green} style={{background: '#000c'}}>修正後：影の色を草と同じ組の中へ</Tag></div>
      </div>
      <div style={{position: 'absolute', inset: 0, opacity: ph3}}>
        <div style={{position: 'absolute', left: 260, top: 130, width: 1400, height: 788}}>
          <Game clip="mono" field={CLIP.monoSplit} w={1400} style={{position: 'absolute', left: 0, top: 0}} />
          <div style={{position: 'absolute', left: 0, top: 0, width: 1400 * (1 - wipe), height: 788, overflow: 'hidden'}}>
            <Game clip="color" field={CLIP.monoSplit} w={1400} />
          </div>
          <div style={{position: 'absolute', left: 1400 * (1 - wipe) - 3, top: 0, width: 6, height: 788, background: '#fff', opacity: wipe > 0.01 && wipe < 0.99 ? 1 : 0}} />
        </div>
        <div style={{position: 'absolute', top: 150, right: 280, display: 'flex', gap: 12}}><Tag color="#fff" style={{background: '#000c'}}>SELECTで白黒⇔カラー</Tag></div>
      </div>
    </Bg>
  );
};

export const _a = [Box];
