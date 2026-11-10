import React from 'react';
import {Loop, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Bg, C, FONT, SceneTitle, Tag, cueOf, useIn} from './common';
import {Nes, Txt, fmt, ramp} from './parts';
import clips from './data/car_clips.json';

const K = (id: string) => (i: number) => cueOf(id, i);

// ---------------- D00 詳細編の前置きと目次 ----------------
const TOC = ['ライティングのかわりに塗り分ける・車を作る', '1フレームに描くポリゴンの数', 'SuperFXの中身', 'Mode7の中身', 'FPGAの中身'];
export const D00: React.FC = () => {
  const f = useCurrentFrame(), k = K('D00');
  return (
    <Bg>
      <div style={{opacity: 0.35}}><Nes src="main" from={1500} x={0} y={0} w={1920} crop={[0, 12, 256, 135]} style={{borderRadius: 0}} /></div>
      <Txt x={120} y={150} size={40} color={C.cyan} o={useIn(k(0))}>ファミコンで3Dレース</Txt>
      <Txt x={120} y={210} size={96} o={useIn(k(0) + 10)}>詳細編</Txt>
      <div style={{position: 'absolute', left: 120, top: 380, display: 'flex', flexDirection: 'column', gap: 16}}>
        {TOC.map((t, i) => (
          <div key={t} style={{display: 'flex', alignItems: 'center', gap: 20, opacity: ramp(f, k(1) + i * 22, k(1) + i * 22 + 16), fontFamily: FONT}}>
            <div style={{width: 56, height: 56, borderRadius: 12, background: C.amber, color: '#0a0f1e', fontSize: 34, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{i + 1}</div>
            <div style={{fontSize: 42, fontWeight: 900, textShadow: '0 3px 14px #000'}}>{t}</div>
          </div>
        ))}
      </div>
    </Bg>
  );
};

// ---------------- D01 ライティングのかわりに塗り分ける ----------------
// ROMの車・家・木のモデルをY軸回転。上は全ポリゴンを単色、下はROMの材質（くり返し再生で1周がつながる）
export const D01: React.FC = () => {
  const f = useCurrentFrame(), k = K('D01');
  const a0 = useIn(k(0)), a1 = ramp(f, k(1), k(1) + 18);
  const lw = clips.lighting.size[0], lh = clips.lighting.size[1];
  return (
    <Bg>
      <SceneTitle label="ライティングのかわりに塗り分ける" color={C.amber} />
      <div style={{position: 'absolute', left: 300, top: 120, width: lw, height: lh, opacity: a0}}>
        <Loop durationInFrames={clips.lighting.frames} layout="none"><OffthreadVideo src={staticFile('video/obj_flat.mp4')} muted style={{width: lw, height: lh}} /></Loop>
      </div>
      <div style={{position: 'absolute', left: 300, top: 130 + lh, width: lw, height: lh, opacity: a1}}>
        <Loop durationInFrames={clips.lighting.frames} layout="none"><OffthreadVideo src={staticFile('video/obj_tiled.mp4')} muted style={{width: lw, height: lh}} /></Loop>
      </div>
      <Txt x={60} y={290} size={34} color={C.red} w={240} o={a0}>{'全部\n同じ色'}</Txt>
      <Txt x={60} y={684} size={34} color={C.green} w={240} o={a1}>{'実際の\n塗り分け'}</Txt>
      <Txt x={1250} y={130} size={24} color={C.sub} w={600} o={a0} align="right">ライティングなし（ROMの車・家・木のモデル）</Txt>
    </Bg>
  );
};

// ---------------- D90 FPGAの中身 ----------------
// LE数は 2026-11-01 採用版のFit結果（6,248 / 6,272）。回路ごとの配置・大きさは記録がないので模式図。
const TOTAL = 6272, USED = 6248, COLS = 112, CS = 10;
const hash = (i: number, seed: number) => { let x = (i * 2654435761 + seed * 40503) >>> 0; x ^= x >>> 15; x = Math.imul(x, 2246822519) >>> 0; x ^= x >>> 13; return (x >>> 0) / 4294967296; };
// 今回の中身（模式図の区切り）
const BLOCKS = [
  {name: 'SuperFX', sub: '3Dの絵を描く', color: C.cyan, end: 2500},
  {name: 'Mode7の表示回路', sub: 'テクスチャを読んで合成', color: C.green, end: 3900},
  {name: 'ラインごとの計算回路', sub: 'マリオカートのDSP-1と同じような仕事', color: C.amber, end: 4900},
  {name: 'MMC5の拡張音源', sub: '', color: C.violet, end: 5350},
  {name: 'つなぎの回路', sub: 'バス・表示の切り替えなど', color: '#7d8fb8', end: USED},
];
const MAPPERS = [['MMC3', 3], ['MMC5', 7]] as const;

const Chip: React.FC<{fill: (i: number) => string}> = ({fill}) => {
  const cells = [];
  for (let i = 0; i < TOTAL; i++) cells.push(<rect key={i} x={(i % COLS) * CS} y={Math.floor(i / COLS) * CS} width={CS - 2} height={CS - 2} fill={fill(i)} />);
  return <svg width={COLS * CS} height={Math.ceil(TOTAL / COLS) * CS}>{cells}</svg>;
};

export const D90: React.FC = () => {
  const f = useCurrentFrame(), k = K('D90');
  const a4 = ramp(f, k(4), k(4) + 18), a5 = ramp(f, k(5), k(5) + 18);
  const OFF = '#1b2643';
  // 0) 設計図を読み込む：左から光が走って、回路になる
  const load = ramp(f, k(0) + 120, k(0) + 300);
  // 1) MMC3 → MMC5 と回路を書き換える
  const span1 = Math.max(1, k(2) - k(1)), mi = Math.min(1, Math.floor(Math.max(0, f - k(1) - 60) / (span1 / 2)));
  // 2〜3) 今回の中身を埋めていく
  const fill2 = Math.round(ramp(f, k(2), k(2) + 420, 0, BLOCKS[2].end));
  const fill3 = Math.round(ramp(f, k(3), k(3) + 200, BLOCKS[2].end, USED));
  const filled = f < k(3) ? fill2 : fill3;
  const stage = f < k(1) ? 0 : f < k(2) ? 1 : 2;
  const cell = (i: number) => {
    if (stage === 0) return (i % COLS) / COLS < load && hash(i, 1) < 0.3 ? '#5fe38d' : OFF;
    if (stage === 1) return hash(i, MAPPERS[mi][1]) < (mi ? 0.28 : 0.16) ? (mi ? C.amber : C.violet) : OFF;
    if (i >= filled) return OFF;
    return BLOCKS.find((b) => i < b.end)!.color;
  };
  const shownBlocks = BLOCKS.filter((b, i) => (i < 3 ? fill2 >= (i ? BLOCKS[i - 1].end : 0) + 30 : f >= k(3) + (i - 3) * 40));
  return (
    <Bg>
      <SceneTitle label="FPGAの中身" color={C.green} />
      <div style={{opacity: 1 - a4}}>
        <div style={{position: 'absolute', left: 70, top: 150, padding: 14, borderRadius: 18, background: '#0b1226', border: `4px solid ${C.line}`, opacity: useIn(k(0))}}>
          <Chip fill={cell} />
          <div style={{position: 'absolute', left: 14, top: -46, fontSize: 30, fontWeight: 900, fontFamily: FONT, color: C.text}}>FPGA（EverDrive N8 Pro）</div>
        </div>
        {/* 説明の欄 */}
        <div style={{position: 'absolute', left: 1240, top: 150, width: 620, fontFamily: FONT}}>
          {stage === 0 && (
            <div style={{opacity: useIn(k(0) + 60)}}>
              <div style={{fontSize: 40, fontWeight: 900}}>中の回路を、<br />後から作り替えられるチップ</div>
              <div style={{marginTop: 24, fontSize: 30, fontWeight: 800, color: C.green}}>回路の設計図を読み込む → その回路として動く</div>
            </div>
          )}
          {stage === 1 && (
            <div>
              <div style={{fontSize: 30, fontWeight: 800, color: C.sub}}>回路を書き換えて、いろいろなカートリッジを再現</div>
              <div style={{display: 'flex', gap: 16, marginTop: 20}}>
                {MAPPERS.map(([n], i) => <Tag key={n} color={i === mi ? (i ? C.amber : C.violet) : C.line} style={{fontSize: 44, opacity: i <= mi ? 1 : 0.4}}>{n}</Tag>)}
                <Tag color={C.line} style={{fontSize: 44, opacity: 0.4}}>…</Tag>
              </div>
              <div style={{fontSize: 30, fontWeight: 900, color: C.green, marginTop: 30, opacity: ramp(f, k(2) - 60, k(2) - 30)}}>今回は、この仕組みを利用</div>
            </div>
          )}
          {stage === 2 && (
            <div style={{display: 'flex', flexDirection: 'column', gap: 14}}>
              {shownBlocks.map((b) => (
                <div key={b.name} style={{display: 'flex', alignItems: 'center', gap: 16}}>
                  <div style={{width: 34, height: 34, borderRadius: 6, background: b.color, flex: 'none'}} />
                  <div>
                    <div style={{fontSize: 32, fontWeight: 900}}>{b.name}</div>
                    {b.sub && <div style={{fontSize: 24, fontWeight: 700, color: b.color === '#7d8fb8' ? C.sub : b.color}}>{b.sub}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {stage === 2 && (
          <div style={{position: 'absolute', left: 70, top: 760, width: 1150, textAlign: 'center', fontFamily: FONT}}>
            <span style={{fontSize: 44, fontWeight: 900, color: filled >= USED ? C.red : C.text}}>{`ロジックエレメント ${fmt(filled)} / ${fmt(TOTAL)}`}</span>
            <span style={{fontSize: 44, fontWeight: 900, color: C.red, marginLeft: 24, opacity: ramp(f, k(3) + 200, k(3) + 220)}}>ほぼいっぱい</span>
            <div style={{fontSize: 22, color: C.sub, fontWeight: 700}}>回路ごとの配置・大きさは模式図</div>
          </div>
        )}
      </div>
      {/* ROM */}
      <div style={{opacity: a4 * (1 - a5)}}>
        {[['前回の2D版', 2097152, '2MB（128方向の絵を全部入れる）', C.red], ['今回の3D版', 1179648, '約1.1MB（毎回計算して描く）', C.green]].map(([t, b, s, c], i) => (
          <div key={String(t)} style={{position: 'absolute', left: 160, top: 260 + i * 220, fontFamily: FONT}}>
            <div style={{fontSize: 36, fontWeight: 900, marginBottom: 10}}>{t as string}</div>
            <div style={{display: 'flex', alignItems: 'center', gap: 24}}>
              <div style={{width: (1100 * (b as number) / 2097152) * ramp(f, k(4) + i * 20, k(4) + i * 20 + 40), height: 70, background: c as string, borderRadius: 8}} />
              <div style={{fontSize: 38, fontWeight: 900, color: c as string}}>{s as string}</div>
            </div>
          </div>
        ))}
        <Txt x={160} y={720} size={28} color={C.sub}>ROM容量（3D版：PRG 1MB＋CHR 128KB）</Txt>
      </div>
      {/* 締め */}
      <div style={{opacity: a5}}>
        <Sequence from={k(5)} layout="none"><Nes src="main" from={2400} x={510} y={130} w={900} crop={[0, 0, 256, 192]} /></Sequence>
        <Txt x={0} y={830} size={40} w={1920} align="center">ゲームはファミコンのCPU、3Dの描画はカートリッジの回路</Txt>
      </div>
    </Bg>
  );
};
