import React from 'react';
import {AbsoluteFill, Img, Loop, Sequence, interpolate, staticFile, useCurrentFrame, Easing} from 'remotion';
import {Arrow, Bg, Box, C, Fade, Game, SceneTitle, SeqImg, Tag, cueOf, useIn, usePop} from './common';
import tiles from './tiles.json';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const TILES = (tiles as {tiles: number[]}).tiles;

const Bar: React.FC<{label: string; value: number; max: number; color: string; p: number; unit: string; width?: number; note?: React.ReactNode; y: number; x?: number}> = ({label, value, max, color, p, unit, width = 1100, note, y, x = 520}) => (
  <div style={{position: 'absolute', left: 100, top: y, width: 1720, opacity: Math.min(1, p * 3)}}>
    <div style={{position: 'absolute', left: 0, top: 6, width: x - 130, fontSize: 30, fontWeight: 800, textAlign: 'right'}}>{label}</div>
    <div style={{position: 'absolute', left: x - 100, top: 0, width: (width * value * p) / max, height: 56, background: color, borderRadius: 8}} />
    <div style={{position: 'absolute', left: x - 100 + (width * value * p) / max + 16, top: 6, fontSize: 32, fontWeight: 900, color, whiteSpace: 'nowrap'}}>
      {Math.round(value * p).toLocaleString()} {unit} {note}
    </div>
  </div>
);

// ───────────────────────── S07 壁2 転送
const ScanTimeline: React.FC<{p: number; bands: number}> = ({p, bands}) => {
  // 262 lines/frame; visible 224 (or 224 - bands); DMA allowed only outside visible lines
  const f = useCurrentFrame();
  const total = 262, h = 560, sc = h / total;
  const visTop = bands, visBot = 224 - bands;
  const beam = (f * 4) % total;
  return (
    <div style={{position: 'absolute', left: 1320, top: 190, width: 560, height: h + 40, opacity: p}}>
      <div style={{position: 'absolute', left: 0, top: -40, fontSize: 26, color: C.sub}}>1コマ（262ライン）の中身</div>
      <div style={{position: 'absolute', left: 0, top: 0, width: 300, height: h, background: '#0b1124', border: `2px solid ${C.line}`}}>
        <div style={{position: 'absolute', left: 0, top: visTop * sc, width: '100%', height: (visBot - visTop) * sc, background: '#24406a'}} />
        {bands > 0 && <div style={{position: 'absolute', left: 0, top: 0, width: '100%', height: visTop * sc, background: `${C.green}55`}} />}
        {bands > 0 && <div style={{position: 'absolute', left: 0, top: visBot * sc, width: '100%', height: bands * sc, background: `${C.green}55`}} />}
        <div style={{position: 'absolute', left: 0, top: 224 * sc, width: '100%', height: (total - 224) * sc, background: `${C.green}88`}} />
        <div style={{position: 'absolute', left: 0, top: beam * sc, width: '100%', height: 3, background: '#fff', opacity: 0.8}} />
      </div>
      <div style={{position: 'absolute', left: 320, top: ((visTop + visBot) / 2) * sc - 40, fontSize: 28, lineHeight: 1.3}}>画面を描いている<br /><span style={{color: C.red}}>転送できない</span></div>
      <div style={{position: 'absolute', left: 320, top: 232 * sc, fontSize: 28, color: C.green, fontWeight: 800}}>すき間 → 転送OK</div>
      {bands > 0 && <div style={{position: 'absolute', left: 320, top: 0, fontSize: 26, color: C.green, fontWeight: 800}}>黒帯 → 転送OK</div>}
    </div>
  );
};
export const S07: React.FC = () => {
  const f = useCurrentFrame();
  const q = (i: number) => cueOf('S07', i);
  const phaseA = interpolate(f, [q(1), q(1) + 20, q(7) - 15, q(7)], [0, 1, 1, 0], clamp);
  const flow = interpolate(f, [q(1) + 20, q(1) + 60], [0, 1], clamp);
  const scan = interpolate(f, [q(2), q(2) + 20], [0, 1], clamp);
  const bands = interpolate(f, [q(6), q(6) + 60], [0, 16], clamp);
  const b4 = interpolate(f, [q(3) + 60, q(3) + 120], [0, 1], clamp);
  const ng = interpolate(f, [q(3) + 200, q(3) + 220], [0, 1], clamp);
  const b2 = interpolate(f, [q(4) + 90, q(4) + 140], [0, 1], clamp);
  const mono = usePop(q(4) + 260);
  const bn = interpolate(f, [q(5) + 60, q(5) + 110], [0, 1], clamp);
  const bb = interpolate(f, [q(6) + 70, q(6) + 130], [0, 1], clamp);
  const short = interpolate(f, [q(6) + 140, q(6) + 160], [0, 1], clamp);
  const phaseB = interpolate(f, [q(7), q(7) + 20], [0, 1], clamp);
  const idx = Math.max(0, f - q(7));
  const n = TILES[idx % TILES.length];
  const fallback = useIn(q(9));
  const MAX = 24576, BW = 480, BX = 400;
  return (
    <Bg>
      <SceneTitle label="壁2　転送が間に合わない" color={C.red} />
      <div style={{opacity: phaseA}}>
        <Box x={100} y={180} w={330} h={150} color={C.cyan} title="カートリッジRAM" sub="SuperFXが描いた絵" fs={30} />
        <Box x={700} y={180} w={330} h={150} color={C.green} title="ビデオメモリ" sub="画面チップが読む" fs={30} />
        <Arrow x1={435} y1={255} x2={690} y2={255} color={C.amber} p={flow} label="DMA転送" />
        {scan > 0 && <ScanTimeline p={scan} bands={bands} />}
        <div style={{position: 'absolute', left: 100, top: 375, fontSize: 28, color: C.sub, opacity: b4}}>256×192ドットの絵 1枚の大きさ</div>
        <Bar y={430} label="16色（4bpp）" value={24576} max={MAX} color={C.red} p={b4} unit="バイト" width={BW} x={BX} note={<span style={{opacity: ng, marginLeft: 8}}>✕ 60fpsでは無理</span>} />
        <Bar y={520} label="4色（2bpp）" value={12288} max={MAX} color={C.amber} p={b2} unit="バイト" width={BW} x={BX} />
        <div style={{position: 'absolute', left: 950, top: 516, opacity: Math.min(1, mono * 1.4), transform: `scale(${0.8 + 0.2 * mono})`, transformOrigin: 'left center'}}>
          <Tag color="#ffffff" style={{background: '#000'}}>白黒に</Tag>
        </div>
        <Bar y={610} label="普通のすき間" value={6051} max={MAX} color="#7c8db8" p={bn} unit="バイト" width={BW} x={BX} note={<span style={{color: C.red}}>約半分</span>} />
        <Bar y={700} label="黒帯で拡張" value={11296} max={MAX} color={C.green} p={bb} unit="バイト" width={BW} x={BX} />
        <div style={{position: 'absolute', left: 420, top: 790, fontSize: 40, fontWeight: 900, color: C.red, opacity: short, transform: `scale(${0.8 + 0.2 * short})`}}>あと 992バイト 足りない！</div>
      </div>
      <div style={{position: 'absolute', inset: 0, opacity: phaseB}}>
        <div style={{position: 'absolute', left: 90, top: 150, width: 1024, height: 720, borderRadius: 6, overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,.5)'}}>
          <SeqImg layer="bg" offset={-q(7)} style={{position: 'absolute', width: 1024, height: 720}} />
          <SeqImg layer="gsu" offset={-q(7)} style={{position: 'absolute', width: 1024, height: 720}} />
          <SeqImg layer="obj" offset={-q(7)} style={{position: 'absolute', width: 1024, height: 720}} />
          <SeqImg layer="tiles" offset={-q(7)} style={{position: 'absolute', width: 1024, height: 720, imageRendering: 'auto'}} />
        </div>
        <div style={{position: 'absolute', left: 1180, top: 170, width: 660}}>
          <div style={{fontSize: 30, color: C.sub}}>送るタイル（8×8ドット）</div>
          <div style={{fontSize: 110, fontWeight: 900, color: C.cyan, lineHeight: 1.1}}>{n}<span style={{fontSize: 44, color: C.sub}}> / 768枚</span></div>
          <div style={{height: 40, marginTop: 10, borderRadius: 8, background: '#0b1124', border: `2px solid ${C.line}`, overflow: 'hidden'}}>
            <div style={{width: `${(n / 768) * 100}%`, height: '100%', background: C.cyan}} />
          </div>
          <div style={{fontSize: 34, marginTop: 14, fontWeight: 800}}>{(n * 16).toLocaleString()} バイト <span style={{color: C.sub, fontSize: 28}}>（全体の{Math.round((n / 768) * 100)}%）</span></div>
          <div style={{fontSize: 26, color: C.sub, marginTop: 22, lineHeight: 1.5}}>前のコマ・今のコマで<br />物体があるタイルだけを送る</div>
          <div style={{marginTop: 30, opacity: fallback, display: 'flex', flexDirection: 'column', gap: 14}}>
            <Tag color={C.amber}>多すぎる時は全体転送に切り替え</Tag>
            <Tag color={C.green}>表示は180ラインに絞って確実に</Tag>
          </div>
        </div>
      </div>
    </Bg>
  );
};

// ───────────────────────── S08 壁3 描く速さ
const SC = 58; // px per ms
const MsBar: React.FC<{y: number; label: string; ms: number; color: string; p: number; note?: string}> = ({y, label, ms, color, p, note}) => (
  <div style={{position: 'absolute', left: 80, top: y, opacity: Math.min(1, p * 3)}}>
    <div style={{position: 'absolute', left: 0, top: 8, width: 300, fontSize: 30, fontWeight: 800, textAlign: 'right'}}>{label}</div>
    <div style={{position: 'absolute', left: 330, top: 0, width: ms * SC * p, height: 60, background: color, borderRadius: 8}} />
    <div style={{position: 'absolute', left: 330 + ms * SC * p + 14, top: 8, fontSize: 34, fontWeight: 900, color, whiteSpace: 'nowrap'}}>{(ms * p).toFixed(ms < 10 ? 2 : 1)} ms {p > 0.99 && note ? <span style={{fontSize: 26}}>{note}</span> : null}</div>
  </div>
);
export const S08: React.FC = () => {
  const f = useCurrentFrame();
  const q = (i: number) => cueOf('S08', i);
  const budget = useIn(q(1));
  const clr = interpolate(f, [q(1) + 90, q(1) + 140], [0, 1], clamp);
  const boss = interpolate(f, [q(2) + 10, q(2) + 70], [0, 1], clamp);
  const listO = interpolate(f, [q(3), q(3) + 20], [0, 1], clamp);
  const after = interpolate(f, [q(8), q(8) + 60], [0, 1], clamp);
  const items = [
    {at: 4, t: '前のコマで描いた所だけ消す'},
    {at: 5, t: '大きさ別の専用ルーチンを使い分け'},
    {at: 6, t: 'ボスの部品は縮小済みの絵をROMに'},
    {at: 7, t: '描画の中心を命令キャッシュに収める'},
  ];
  const cacheO = interpolate(f, [q(7), q(7) + 20], [0, 1], clamp);
  const cache = interpolate(f, [q(7) + 30, q(7) + 140], [0, 511], clamp);
  const gameO = interpolate(f, [q(2), q(2) + 20], [0, 1], clamp);
  const bx = 80 + 330 + 13.76 * SC;
  return (
    <Bg>
      <SceneTitle label="壁3　描くのが間に合わない" color={C.red} />
      <div style={{position: 'absolute', left: bx, top: 150, width: 4, height: 310, background: C.green, opacity: budget}} />
      <div style={{position: 'absolute', left: bx - 160, top: 112, width: 320, textAlign: 'center', fontSize: 28, fontWeight: 800, color: C.green, opacity: budget, whiteSpace: 'nowrap'}}>使える時間 約13.8ms</div>
      <div style={{position: 'absolute', left: 0, top: 170, width: 1920, height: 300}}>
        <MsBar y={0} label="画面を消すだけ" ms={2.87} color="#7c8db8" p={clr} />
        <MsBar y={95} label="ボス戦（最悪）" ms={19.13} color={C.red} p={boss} note="→ 毎秒49コマ" />
        <MsBar y={190} label="最適化後" ms={12.94} color={C.green} p={after} note="→ 毎秒60コマ" />
      </div>
      <div style={{position: 'absolute', left: 120, top: 510, width: 760, opacity: listO}}>
        <div style={{fontSize: 34, fontWeight: 900, color: C.amber, marginBottom: 16}}>測る → 直す → また測る</div>
        {items.map((it, i) => {
          const p = interpolate(f, [q(it.at), q(it.at) + 16], [0, 1], clamp);
          return (
            <div key={i} style={{fontSize: 32, fontWeight: 700, marginBottom: 12, opacity: p, transform: `translateX(${(1 - p) * 30}px)`, display: 'flex', alignItems: 'center', gap: 14}}>
              <span style={{color: C.green, fontSize: 36}}>✔</span>{it.t}
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: 860, top: 540, width: 420, opacity: cacheO}}>
        <div style={{fontSize: 28, color: C.sub}}>SuperFXの命令キャッシュ</div>
        <div style={{position: 'relative', height: 56, marginTop: 10, borderRadius: 10, border: `3px solid ${C.amber}`, overflow: 'hidden', background: '#0b1124'}}>
          <div style={{width: `${(cache / 512) * 100}%`, height: '100%', background: C.amber}} />
        </div>
        <div style={{fontSize: 44, fontWeight: 900, marginTop: 10}}>{Math.round(cache)} <span style={{fontSize: 30, color: C.sub}}>/ 512 バイト</span></div>
        <div style={{fontSize: 30, fontWeight: 800, color: C.amber, opacity: cache > 510 ? 1 : 0}}>残り 1バイト！</div>
      </div>
      <div style={{position: 'absolute', left: 1370, top: 500, opacity: gameO}}>
        <Sequence from={q(2)} layout="none">
          <Loop durationInFrames={240} layout="none">
            <Game field={4340} w={480} />
          </Loop>
        </Sequence>
        <div style={{fontSize: 24, color: C.sub, marginTop: 8}}>現在のROMのボス戦（60fps）</div>
      </div>
    </Bg>
  );
};

// ───────────────────────── S09 地面は描かない
export const S09: React.FC = () => {
  const f = useCurrentFrame();
  const q = (i: number) => cueOf('S09', i);
  const big = useIn(q(0));
  const scan = interpolate(f, [q(2), q(2) + 30], [0, 1], clamp);
  const lineY = 432 + ((f * 2) % 286);
  const mode7 = useIn(q(4));
  return (
    <Bg>
      <SceneTitle label="一番効いた最適化：描かない" color={C.green} />
      <div style={{position: 'absolute', left: 90, top: 150, width: 1024, height: 720, borderRadius: 6, overflow: 'hidden', opacity: big, boxShadow: '0 10px 40px rgba(0,0,0,.5)'}}>
        <Game src="video/bgonly.mp4" field={1700} w={1024} style={{borderRadius: 0, boxShadow: 'none'}} />
        <div style={{position: 'absolute', left: 0, top: lineY, width: '100%', height: 4, background: C.amber, boxShadow: `0 0 16px ${C.amber}`, opacity: scan}} />
      </div>
      <Fade at={q(1)} style={{position: 'absolute', left: 1180, top: 170, width: 660}}>
        <div style={{fontSize: 40, fontWeight: 900}}>地面は<span style={{color: C.green}}>SuperFXで<br />1画素も描いていない</span></div>
      </Fade>
      <Fade at={q(2)} style={{position: 'absolute', left: 1180, top: 330, width: 660}}>
        <div style={{fontSize: 30, lineHeight: 1.6}}>
          背景1枚に<b style={{color: C.amber}}>奥行きごとの縞模様</b><br />
          HDMAで<b style={{color: C.amber}}>走査線ごと</b>に<br />
          ・横スクロール位置<br />・色<br />を切り替える
        </div>
        <div style={{marginTop: 20, fontSize: 26, color: C.amber, background: '#0b1124', padding: 14, borderRadius: 10, border: `2px solid ${C.line}`}}>
          黄色の線 ＝ 今描いているライン。ラインが変わるたびに、スクロール位置と色を差し替える
        </div>
      </Fade>
      <div style={{position: 'absolute', left: 1180, top: 700, width: 660, opacity: mode7}}>
        <Tag color={C.violet}>モード7は不採用</Tag>
        <div style={{fontSize: 26, color: C.sub, marginTop: 10, lineHeight: 1.5}}>SuperFXの絵を重ねる普通の背景と<br />同時に使えないため</div>
      </div>
    </Bg>
  );
};

// ───────────────────────── S11 60fps達成（軽いつなぎ）
export const S11: React.FC = () => {
  const f = useCurrentFrame();
  const q = (i: number) => cueOf('S11', i);
  const stamp = usePop(q(0) + 200);
  const words = ['転送', '描く速さ', '描かない工夫'];
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <Game field={8500} w={1536} style={{borderRadius: 0}} />
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,.55) 0%, rgba(0,0,0,0) 40%)'}} />
      <div style={{position: 'absolute', top: 70, width: '100%', display: 'flex', justifyContent: 'center', gap: 24}}>
        {words.map((w, i) => {
          const p = interpolate(f, [q(0) + i * 40, q(0) + i * 40 + 16], [0, 1], clamp);
          return <Tag key={w} color={[C.cyan, C.amber, C.green][i]} style={{background: 'rgba(5,8,18,.75)', fontSize: 34, opacity: p * (1 - stamp * 0.5)}}>✔ {w}</Tag>;
        })}
      </div>
      <div style={{position: 'absolute', top: 330, width: '100%', textAlign: 'center', opacity: Math.min(1, stamp * 1.3), transform: `scale(${1.6 - 0.6 * stamp}) rotate(-4deg)`}}>
        <span style={{display: 'inline-block', padding: '10px 50px', border: `10px solid ${C.green}`, borderRadius: 24, color: C.green, fontSize: 150, fontWeight: 900, background: 'rgba(5,8,18,.7)', textShadow: '0 4px 20px rgba(0,0,0,.6)'}}>60fps</span>
      </div>
    </AbsoluteFill>
  );
};

// ───────────────────────── S12 まとめ
export const S12: React.FC = () => {
  const f = useCurrentFrame();
  const q = (i: number) => cueOf('S12', i);
  const dim = interpolate(f, [q(0), q(0) + 30], [0.15, 0.55], clamp);
  const roles = useIn(q(1));
  const thanks = interpolate(f, [q(3) - 10, q(3) + 10], [0, 1], clamp);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <Game field={9200} w={1536} style={{borderRadius: 0}} />
      </AbsoluteFill>
      <AbsoluteFill style={{background: `rgba(5,8,18,${dim + thanks * 0.3})`}} />
      <Fade at={q(0)} out={q(3) - 20} style={{position: 'absolute', top: 180, width: '100%', textAlign: 'center'}}>
        <div style={{fontSize: 56, fontWeight: 900, color: '#fff'}}>SuperFXは<span style={{color: C.amber}}>魔法のチップ</span>ではない</div>
      </Fade>
      <div style={{position: 'absolute', top: 330, width: '100%', display: 'flex', justifyContent: 'center', gap: 40, opacity: roles * (1 - thanks)}}>
        {[['CPU', '考える', C.green], ['SuperFX', '描く', C.amber], ['PPU', '表示する', C.cyan]].map(([a, b, col]) => (
          <div key={a} style={{width: 360, padding: '26px 0', borderRadius: 20, border: `4px solid ${col}`, background: 'rgba(19,27,49,.85)', textAlign: 'center'}}>
            <div style={{fontSize: 30, color: C.sub}}>{a}</div>
            <div style={{fontSize: 64, fontWeight: 900, color: col}}>{b}</div>
          </div>
        ))}
      </div>
      <Fade at={q(1) + 200} out={q(3) - 20} style={{position: 'absolute', top: 560, width: '100%', textAlign: 'center', fontSize: 40, fontWeight: 800, color: '#fff'}}>
        転送と時間の壁を、<span style={{color: C.cyan}}>測りながら</span>一つずつ崩す
      </Fade>
      <div style={{position: 'absolute', top: 400, width: '100%', textAlign: 'center', opacity: thanks, fontSize: 72, fontWeight: 900, color: '#fff'}}>ご視聴ありがとうございました</div>
    </AbsoluteFill>
  );
};

export const _unused = [Img, staticFile, Easing, Box, Arrow];
