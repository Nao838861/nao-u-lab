import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, Easing} from 'remotion';
import {Arrow, Bg, Box, C, Fade, Game, SceneTitle, SeqImg, Tag, cueOf, useIn, usePop, W} from './common';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// ───────────────────────── S01 オープニング
export const S01: React.FC = () => {
  const f = useCurrentFrame();
  const q = (i: number) => cueOf('S01', i);
  const titleO = interpolate(f, [0, 20, q(1) - 10, q(1) + 10], [0, 1, 1, 0], clamp);
  const zoom = interpolate(f, [0, q(2)], [1.08, 1], {...clamp, easing: Easing.out(Easing.quad)});
  const endTitle = useIn(q(2) + 150, 24);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', transform: `scale(${zoom})`}}>
        <Game field={1380} w={1536} style={{borderRadius: 0}} />
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,.65) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,0) 70%, rgba(0,0,0,.5) 100%)'}} />
      <div style={{position: 'absolute', top: 300, width: '100%', textAlign: 'center', opacity: titleO}}>
        <div style={{fontSize: 34, fontWeight: 700, color: C.cyan, letterSpacing: 6}}>SUPER FAMICOM × SUPER FX2</div>
        <div style={{fontSize: 92, fontWeight: 900, color: '#fff', textShadow: '0 6px 30px rgba(0,0,0,.8)', marginTop: 10}}>スーパーファミコンで<br />スペースハリアーを動かす</div>
      </div>
      <div style={{position: 'absolute', top: 40, right: 56, display: 'flex', gap: 12, opacity: interpolate(f, [q(1), q(1) + 20], [0, 1], clamp)}}>
        <Tag color={C.green}>60 fps</Tag>
        <Tag color={C.amber}>SuperFX2</Tag>
        <Tag color="#ffffff">モノクロ表示</Tag>
      </div>
      <div style={{position: 'absolute', top: 120, width: '100%', textAlign: 'center', opacity: endTitle}}>
        <div style={{display: 'inline-block', background: 'rgba(5,8,18,.8)', padding: '18px 40px', borderRadius: 16, fontSize: 52, fontWeight: 900}}>
          SuperFXで<span style={{color: C.cyan}}>何を</span>して、<span style={{color: C.amber}}>何が大変</span>だったのか
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ───────────────────────── S02 なぜ難しいのか
const ScalerArt: React.FC = () => {
  const f = useCurrentFrame();
  const items = Array.from({length: 14}, (_, i) => i);
  return (
    <svg width={460} height={260} style={{overflow: 'hidden'}}>
      <rect width={460} height={260} fill="#0d1428" />
      <rect y={130} width={460} height={130} fill="#173a2a" />
      {items.map((i) => {
        const t = ((f / 90 + i / items.length) % 1);
        const z = Math.pow(t, 2.2);
        const ang = i * 2.39;
        const x = 230 + Math.cos(ang) * 210 * z;
        const y = 130 + (40 + Math.sin(ang) * 60) * z;
        const s = 6 + 90 * z;
        return <rect key={i} x={x - s / 2} y={y - s} width={s} height={s} rx={s * 0.18} fill={i % 3 === 0 ? C.amber : i % 3 === 1 ? C.cyan : C.violet} opacity={0.85} />;
      })}
    </svg>
  );
};
const PixelTree: React.FC<{px: number}> = ({px}) => {
  const rows = ['....##....', '...####...', '..######..', '.########.', '..######..', '.########.', '##########', '....##....', '....##....', '...####...'];
  return (
    <svg width={px * 10} height={px * 10}>
      {rows.flatMap((r, y) => r.split('').map((ch, x) => (ch === '#' ? <rect key={`${x}-${y}`} x={x * px} y={y * px} width={px} height={px} fill={y > 6 ? '#c08a4a' : C.green} /> : null)))}
    </svg>
  );
};
const Card: React.FC<{at: number; x: number; y: number; w: number; h: number; color: string; head: string; children: React.ReactNode; foot: React.ReactNode}> = ({at, x, y, w, h, color, head, children, foot}) => {
  const p = usePop(at);
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 18, background: C.panel, border: `3px solid ${color}`, opacity: Math.min(1, p * 1.4), transform: `scale(${0.85 + 0.15 * p})`, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 22, boxSizing: 'border-box'}}>
      <div style={{fontSize: 34, fontWeight: 800, color}}>{head}</div>
      <div style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'}}>{children}</div>
      <div style={{fontSize: 30, fontWeight: 700, color: C.text, textAlign: 'center', lineHeight: 1.35}}>{foot}</div>
    </div>
  );
};
export const S02: React.FC = () => {
  const f = useCurrentFrame();
  const q = (i: number) => cueOf('S02', i);
  const xs = usePop(q(1) + 40);
  const cpuBar = interpolate(f, [q(3) + 10, q(3) + 200], [0, 0.32], clamp);
  return (
    <Bg>
      <SceneTitle label="そもそも、何が難しいのか" />
      <Card at={q(0)} x={70} y={140} w={420} h={700} color={C.amber} head="1985 アーケード版" foot={<>拡大縮小の<br />専用ハードウェア</>}>
        <div style={{transform: 'scale(0.82)'}}><ScalerArt /></div>
      </Card>
      <Card at={q(1)} x={530} y={140} w={420} h={700} color={C.red} head="SFCのスプライト" foot={<>大きさは<br />固定サイズだけ</>}>
        <div style={{position: 'relative'}}>
          <PixelTree px={22} />
          <svg width={260} height={260} style={{position: 'absolute', left: -20, top: -20, opacity: xs, transform: `scale(${xs})`}}>
            <line x1={30} y1={30} x2={230} y2={230} stroke={C.red} strokeWidth={22} strokeLinecap="round" />
            <line x1={230} y1={30} x2={30} y2={230} stroke={C.red} strokeWidth={22} strokeLinecap="round" />
          </svg>
          <div style={{position: 'absolute', top: -70, left: -40, right: -40, textAlign: 'center', fontSize: 30, fontWeight: 800, color: C.red, opacity: xs, whiteSpace: 'nowrap'}}>拡大縮小できない</div>
        </div>
      </Card>
      <Card at={q(2)} x={990} y={140} w={420} h={700} color={C.violet} head="モード7" foot={<>拡大・回転できるのは<br /><span style={{color: C.violet}}>背景1枚だけ</span></>}>
        <div style={{perspective: 500}}>
          <div style={{width: 300, height: 300, transform: `rotateX(62deg) rotateZ(${f * 0.4}deg)`, backgroundImage: `conic-gradient(${C.violet} 25%, #2a2050 0 50%, ${C.violet} 0 75%, #2a2050 0)`, backgroundSize: '60px 60px', borderRadius: 8}} />
        </div>
      </Card>
      <Card at={q(3)} x={1450} y={140} w={400} h={700} color={C.sub} head="本体CPUで描く？" foot={<>65816 約3.58MHz<br /><span style={{color: C.red}}>遅すぎて間に合わない</span></>}>
        <div style={{width: 300}}>
          <div style={{fontSize: 24, color: C.sub, marginBottom: 8}}>1コマ分の描画</div>
          <div style={{height: 34, borderRadius: 8, background: '#0b1124', border: `2px solid ${C.line}`, overflow: 'hidden'}}>
            <div style={{width: `${cpuBar * 100}%`, height: '100%', background: C.red}} />
          </div>
          <div style={{fontSize: 24, color: C.red, marginTop: 8, opacity: cpuBar > 0.3 ? 1 : 0, fontWeight: 700}}>…まだ終わらない</div>
        </div>
      </Card>
    </Bg>
  );
};

// ───────────────────────── S03 SuperFXとは
const Chip: React.FC<{x: number; y: number; w: number; h: number; label: string; sub: string; color: string; glow?: number}> = ({x, y, w, h, label, sub, color, glow = 0}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h, background: '#1a1a1f', border: `3px solid ${color}`, borderRadius: 10, boxShadow: `0 0 ${glow * 50}px ${color}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
    <div style={{fontSize: 34, fontWeight: 900, color}}>{label}</div>
    <div style={{fontSize: 22, color: C.sub, marginTop: 4}}>{sub}</div>
    {[0, 1, 2, 3, 4, 5].map((i) => <div key={i} style={{position: 'absolute', bottom: -14, left: 14 + i * ((w - 40) / 5), width: 10, height: 14, background: '#c9b26b'}} />)}
  </div>
);
const TilePlot: React.FC<{at: number}> = ({at}) => {
  const f = useCurrentFrame();
  const n = Math.max(0, Math.floor((f - at) * 1.6));
  const px = 22;
  const cells = [] as React.ReactNode[];
  // 16x16 pixels = 2x2 tiles; plotted in raster order, stored per tile
  for (let k = 0; k < Math.min(n, 256); k++) {
    const x = k % 16, y = Math.floor(k / 16);
    const v = ((x - 7.5) ** 2 + (y - 7.5) ** 2) < 49 ? ((x + y) % 3 === 0 ? 2 : 1) : 0;
    if (!v) continue;
    cells.push(<rect key={k} x={x * px} y={y * px} width={px - 2} height={px - 2} fill={v === 2 ? '#fff' : '#7a8cbf'} />);
  }
  return (
    <svg width={16 * px} height={16 * px} style={{overflow: 'visible'}}>
      <rect width={16 * px} height={16 * px} fill="#0b1124" />
      {cells}
      {[0, 1].map((i) => [0, 1].map((j) => <rect key={`${i}${j}`} x={i * 8 * px} y={j * 8 * px} width={8 * px} height={8 * px} fill="none" stroke={C.amber} strokeWidth={4} />))}
    </svg>
  );
};
export const S03: React.FC = () => {
  const f = useCurrentFrame();
  const q = (i: number) => cueOf('S03', i);
  const cart = usePop(q(0));
  const glow = interpolate(f, [q(2), q(2) + 20], [0, 1], clamp);
  const tags = useIn(q(1) + 30);
  const machine = useIn(q(4));
  return (
    <Bg>
      <SceneTitle label="SuperFXとは" color={C.amber} />
      {/* cartridge */}
      <div style={{position: 'absolute', left: 90, top: 150, width: 820, height: 640, transform: `scale(${0.9 + 0.1 * cart})`, opacity: cart}}>
        <div style={{position: 'absolute', inset: 0, background: '#4d5361', borderRadius: '36px 36px 12px 12px', border: '4px solid #6b7282'}} />
        <div style={{position: 'absolute', left: 40, top: 30, right: 40, height: 70, background: '#3a3f4a', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 800, color: '#cfd5e2', letterSpacing: 4}}>カートリッジ</div>
        <div style={{position: 'absolute', left: 40, top: 130, right: 40, bottom: 40, background: '#1e5a3a', borderRadius: 10}} />
        <Chip x={90} y={200} w={250} h={150} label="ROM" sub="プログラム・絵 2MB" color="#9fb0d6" />
        <Chip x={420} y={180} w={300} h={200} label="SuperFX2" sub="GSU-2 約21MHz" color={C.amber} glow={glow} />
        <Chip x={420} y={440} w={300} h={130} label="RAM" sub="絵を描く場所" color={C.cyan} glow={glow * 0.6} />
        <Arrow x1={570} y1={385} x2={570} y2={430} color={C.amber} p={glow} />
      </div>
      <div style={{position: 'absolute', left: 980, top: 170, opacity: tags, display: 'flex', flexDirection: 'column', gap: 18}}>
        <div style={{fontSize: 30, color: C.sub}}>SuperFXを使ったソフトの例</div>
        <Tag color={C.amber}>スターフォックス（1993）… ポリゴン</Tag>
        <Tag color={C.green}>ヨッシーアイランド（1995）… 拡大・回転</Tag>
      </div>
      <Fade at={q(2) + 20} style={{position: 'absolute', left: 980, top: 380, fontSize: 34, fontWeight: 800}}>
        PLOT命令で <span style={{color: C.cyan}}>1画素ずつ</span> RAMへ描く
      </Fade>
      <Fade at={q(3)} style={{position: 'absolute', left: 1000, top: 450, display: 'flex', gap: 30, alignItems: 'center'}}>
        <TilePlot at={q(3)} />
        <div style={{fontSize: 30, lineHeight: 1.5, width: 420}}>
          描いた結果が<br /><span style={{color: C.amber, fontWeight: 800}}>8×8のタイル形式</span>で並ぶ<br />
          <span style={{color: C.sub, fontSize: 26}}>→ 並べ替えなしで<br />そのまま画面に出せる</span>
        </div>
      </Fade>
      <div style={{position: 'absolute', left: 0, right: 0, top: 120, bottom: 120, background: 'rgba(10,15,30,.97)', opacity: machine, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 60}}>
        <div style={{width: 768, height: 540, position: 'relative', background: 'repeating-conic-gradient(#1a2038 0 25%, #121829 0 50%) 0 0/32px 32px', borderRadius: 8, overflow: 'hidden', border: `3px solid ${C.amber}`}}>
          <SeqImg layer="gsu" offset={0} style={{width: 768, height: 540}} />
        </div>
        <div style={{fontSize: 46, fontWeight: 900, lineHeight: 1.5}}>
          今回の使い方<br />
          <span style={{color: C.sub, textDecoration: 'line-through', fontSize: 38}}>ポリゴン</span><br />
          <span style={{color: C.amber}}>拡大縮小スプライト<br />専用の描画マシン</span>
        </div>
      </div>
    </Bg>
  );
};

// ───────────────────────── S04 画面を分解する
export const S04: React.FC = () => {
  const f = useCurrentFrame();
  const q = (i: number) => cueOf('S04', i);
  const open = interpolate(f, [q(0) + 40, q(0) + 100, q(4) - 10, q(4) + 50], [0, 1, 1, 0], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const hl = (i: number) => interpolate(f, [q(i), q(i) + 15, q(i + 1) - 5, q(i + 1) + 10], [0, 1, 1, 0], clamp);
  const hBg = hl(1), hObj = hl(2), hGsu = hl(3);
  const pw = 896, ph = 630;
  const plane = (z: number, idx: number, h: number, color: string, content: React.ReactNode) => (
    <div style={{position: 'absolute', left: 0, top: 0, width: pw, height: ph, transform: `translate3d(${idx * 120 * open}px, ${-idx * 40 * open}px, ${z}px)`, outline: open > 0.05 ? `${3 + h * 4}px solid ${color}` : 'none', boxShadow: h > 0 ? `0 0 ${60 * h}px ${color}` : 'none', opacity: open > 0.05 ? 0.35 + 0.65 * Math.max(h, open < 0.5 ? 1 : 0.55) : 1}}>
      {content}
    </div>
  );
  const label = (text: string, sub: string, color: string, h: number, y: number) => (
    <div style={{position: 'absolute', right: 70, top: y, width: 520, opacity: open * (0.4 + 0.6 * h), transform: `scale(${1 + 0.06 * h})`, transformOrigin: 'left center'}}>
      <div style={{fontSize: 38, fontWeight: 900, color}}>{text}</div>
      <div style={{fontSize: 27, color: C.sub, marginTop: 4}}>{sub}</div>
    </div>
  );
  return (
    <Bg>
      <SceneTitle label="画面を3つに分解する" />
      <div style={{position: 'absolute', left: 140 + (1 - open) * 372, top: 200, width: pw, height: ph, perspective: 2400}}>
        <div style={{position: 'absolute', inset: 0, transformStyle: 'preserve-3d', transform: `rotateY(${-32 * open}deg) rotateX(${8 * open}deg)`}}>
          {plane(-260 * open, 0, hBg, C.green, <SeqImg layer="bg" style={{width: pw, height: ph}} />)}
          {plane(0, 1, hGsu, C.amber, <SeqImg layer="gsu" style={{width: pw, height: ph}} />)}
          {plane(260 * open, 2, hObj, C.cyan, <SeqImg layer="obj" style={{width: pw, height: ph}} />)}
        </div>
      </div>
      {label('背景機能（BG）', '地面・遠くの山・空　HDMAで走査線ごとに変化', C.green, hBg, 640)}
      {label('ハードウェアスプライト', '自機・自分の弾　17ポーズ・16サイズを事前に用意', C.cyan, hObj, 260)}
      {label('SuperFXが描く絵', '木・敵・ボス・敵弾　256×192ドット 4色', C.amber, hGsu, 450)}
    </Bg>
  );
};

// ───────────────────────── S05 役割分担
const ListRows: React.FC<{at: number}> = ({at}) => {
  const f = useCurrentFrame();
  const rows = [
    ['木', 'X 43', 'Y 198', '61×142'],
    ['敵', 'X 166', 'Y 91', '28×30'],
    ['木', 'X 206', 'Y 181', '67×31'],
    ['ボス顔', 'X 120', 'Y 126', '48×32'],
    ['敵弾', 'X 99', 'Y 89', '10×10'],
  ];
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
      {rows.map((r, i) => {
        const o = interpolate(f, [at + i * 8, at + i * 8 + 10], [0, 1], clamp);
        return (
          <div key={i} style={{display: 'flex', gap: 10, opacity: o, fontSize: 22, fontFamily: 'Consolas, monospace'}}>
            <span style={{width: 70, color: C.amber}}>#{i}</span>
            {r.map((c, j) => <span key={j} style={{width: j === 0 ? 90 : 100, color: j === 0 ? C.text : C.sub, fontFamily: j === 0 ? 'inherit' : undefined}}>{c}</span>)}
          </div>
        );
      })}
      <div style={{fontSize: 20, color: C.sub, marginTop: 6}}>1体 10バイト × 最大64体（奥 → 手前の順）</div>
    </div>
  );
};
export const S05: React.FC = () => {
  const f = useCurrentFrame();
  const q = (i: number) => cueOf('S05', i);
  const a1 = interpolate(f, [q(2), q(2) + 30], [0, 1], clamp);
  const a2 = interpolate(f, [q(3), q(3) + 30], [0, 1], clamp);
  const a3 = interpolate(f, [q(3) + 60, q(3) + 90], [0, 1], clamp);
  const g = (i: number) => interpolate(f, [q(i), q(i) + 12, q(i + 1), q(i + 1) + 12], [0, 1, 1, 0], clamp);
  const cycle = useIn(q(4));
  const spin = (f - q(4)) * 3;
  return (
    <Bg>
      <SceneTitle label="CPU・SuperFX・画面チップの分担" />
      <Box x={80} y={170} w={420} h={300} color={C.green} title="本体CPU" sub="65816" glow={g(1)}>
        <div style={{fontSize: 24, color: C.text, marginTop: 14, lineHeight: 1.5}}>ゲーム進行・当たり判定<br />奥行き → 位置と大きさ</div>
      </Box>
      <div style={{position: 'absolute', left: 580, top: 160, width: 560, padding: 24, borderRadius: 16, background: C.panel2, border: `2px dashed ${C.amber}`, opacity: a1}}>
        <div style={{fontSize: 30, fontWeight: 800, marginBottom: 12, color: C.amber}}>描画リスト</div>
        <ListRows at={q(2) + 10} />
      </div>
      <Arrow x1={500} y1={320} x2={575} y2={320} color={C.green} p={a1} />
      <Box x={1230} y={170} w={420} h={300} color={C.amber} title="SuperFX2" sub="GSU-2" glow={g(3)}>
        <div style={{fontSize: 24, color: C.text, marginTop: 14, lineHeight: 1.5}}>画面を消す<br />奥から順に拡大縮小して描く</div>
      </Box>
      <Arrow x1={1145} y1={320} x2={1225} y2={320} color={C.amber} p={a2} />
      <div style={{position: 'absolute', left: 1230, top: 520, width: 420, height: 300, opacity: a3, borderRadius: 8, overflow: 'hidden', border: `3px solid ${C.amber}`, background: 'repeating-conic-gradient(#1a2038 0 25%, #121829 0 50%) 0 0/24px 24px'}}>
        <SeqImg layer="gsu" style={{width: 420, height: 296}} />
      </div>
      <Arrow x1={1440} y1={475} x2={1440} y2={515} color={C.amber} p={a3} />
      <Box x={600} y={590} w={420} h={220} color={C.cyan} title="画面チップ（PPU）" sub="背景・スプライト・SuperFXの絵を重ねる" glow={0} dim={1 - a3} fs={32} />
      <Arrow x1={1225} y1={670} x2={1025} y2={690} color={C.cyan} p={a3} label="転送" />
      <div style={{position: 'absolute', inset: 0, background: 'rgba(10,15,30,.97)', opacity: cycle, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{position: 'relative', width: 700, height: 700, top: -30}}>
          {[['考える', 'CPU', C.green], ['描く', 'SuperFX', C.amber], ['表示する', 'PPU', C.cyan]].map(([t, s, col], i) => {
            const ang = ((spin + i * 120) * Math.PI) / 180;
            return (
              <div key={i} style={{position: 'absolute', left: 350 + Math.cos(ang) * 230 - 120, top: 350 + Math.sin(ang) * 230 - 80, width: 240, height: 160, borderRadius: 80, border: `4px solid ${col}`, background: C.panel, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
                <div style={{fontSize: 44, fontWeight: 900, color: col}}>{t}</div>
                <div style={{fontSize: 26, color: C.sub}}>{s}</div>
              </div>
            );
          })}
          <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
            <div style={{fontSize: 30, color: C.sub}}>1秒間に</div>
            <div style={{fontSize: 96, fontWeight: 900}}>60<span style={{fontSize: 44}}>回</span></div>
          </div>
        </div>
      </div>
    </Bg>
  );
};

// ───────────────────────── S06 壁1 同時に使えない
export const S06: React.FC = () => {
  const f = useCurrentFrame();
  const q = (i: number) => cueOf('S06', i);
  const lock = interpolate(f, [q(1), q(1) + 20], [0, 1], clamp);
  const stall = interpolate(f, [q(2) + 60, q(2) + 80], [0, 1], clamp);
  const copy = interpolate(f, [q(3), q(3) + 90], [0, 1], clamp);
  const pipe = useIn(q(4) - 10, 24);
  const lag = useIn(q(5) + 20);
  const busy = Math.sin(f / 6) > 0 ? 1 : 0.6;
  const stallFix = copy > 0.99 ? 1 : 0;
  return (
    <Bg>
      <SceneTitle label="壁1　CPUとSuperFXが同時に動けない" color={C.red} />
      <div style={{opacity: 1 - pipe}}>
        <Box x={110} y={250} w={360} h={220} color={stall && !stallFix ? C.red : C.green} title="本体CPU" sub={stallFix ? '作業用RAMのプログラムを実行' : 'ROMのプログラムを実行'} glow={stallFix} />
        <Box x={110} y={560} w={360} h={200} color={C.green} title="本体の作業用RAM" sub="WRAM 128KB" glow={copy > 0 ? copy : 0} />
        {stall > 0 && !stallFix && <div style={{position: 'absolute', left: 130, top: 190, fontSize: 40, fontWeight: 900, color: C.red, opacity: stall}}>停止…</div>}
        <div style={{position: 'absolute', left: 820, top: 170, width: 960, height: 640, borderRadius: 24, border: `3px dashed ${C.line}`}} />
        <div style={{position: 'absolute', left: 850, top: 185, fontSize: 28, color: C.sub, fontWeight: 700}}>カートリッジ</div>
        <Box x={880} y={260} w={360} h={200} color="#9fb0d6" title="ROM" sub="プログラム・表・絵" dim={0} />
        <Box x={880} y={540} w={360} h={200} color={C.cyan} title="RAM" sub="描画リスト・絵" />
        <Box x={1360} y={360} w={360} h={260} color={C.amber} title="SuperFX2" sub={lock > 0.5 ? '描画中' : '待機'} glow={lock * busy} />
        <Arrow x1={1355} y1={430} x2={1245} y2={380} color={C.amber} p={lock} />
        <Arrow x1={1355} y1={560} x2={1245} y2={630} color={C.amber} p={lock} />
        <Arrow x1={475} y1={360} x2={870} y2={360} color={lock > 0.5 ? C.red : C.green} p={1} dashed={lock > 0.5} />
        {lock > 0 && (
          <svg style={{position: 'absolute', left: 620, top: 300, opacity: lock}} width={120} height={120}>
            <circle cx={60} cy={60} r={52} fill={C.bg} stroke={C.red} strokeWidth={8} />
            <line x1={25} y1={25} x2={95} y2={95} stroke={C.red} strokeWidth={10} />
          </svg>
        )}
        {copy > 0 && <Arrow x1={880} y1={430} x2={475} y2={640} color={C.green} p={copy} label="起動時にコピー" />}
      </div>
      {/* pipeline */}
      <div style={{position: 'absolute', left: 120, top: 200, width: 1680, opacity: pipe}}>
        {(() => {
          const lane = (label: string, color: string, y: number, shift: number, text: (n: number) => string) => (
            <div style={{position: 'absolute', top: y, left: 0, width: 1680, height: 150}}>
              <div style={{position: 'absolute', left: 0, top: 40, fontSize: 36, fontWeight: 900, color, width: 220}}>{label}</div>
              {[0, 1, 2, 3].map((k) => {
                const p = interpolate(f, [q(4) + 20 + k * 30, q(4) + 40 + k * 30], [0, 1], clamp);
                return (
                  <div key={k} style={{position: 'absolute', left: 240 + (k + shift) * 300, top: 20, width: 280, height: 110, borderRadius: 14, background: `${color}22`, border: `3px solid ${color}`, opacity: p, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 800}}>
                    {text(k)}
                  </div>
                );
              })}
            </div>
          );
          return (
            <>
              {lane('CPU', C.green, 60, 0, (k) => `コマ${k + 2}の計算`)}
              {lane('SuperFX', C.amber, 230, 0, (k) => `コマ${k + 1}を描く`)}
              {lane('画面', C.cyan, 400, 1, (k) => `コマ${k + 1}を表示`)}
              <div style={{position: 'absolute', top: 600, left: 240, fontSize: 32, color: C.sub}}>時間 →　　（1マス = 1/60秒）</div>
              <div style={{position: 'absolute', top: 640, left: 240, fontSize: 38, fontWeight: 800, color: C.amber, opacity: lag}}>代償：表示が1コマ遅れる　／　得たもの：2つのプロセッサーが同時に働く</div>
            </>
          );
        })()}
      </div>
    </Bg>
  );
};

export const unusedW = W;
