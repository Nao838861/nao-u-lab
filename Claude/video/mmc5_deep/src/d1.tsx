import React from 'react';
import {Img, staticFile, useCurrentFrame} from 'remotion';
import {Bg, C, FPS, SceneTitle, Tag, cueOf, sceneFrames, sceneOrder, useIn} from './common';
import {Big, Box2, Card, Code, Grid, HArrow, MONO, Nes, Pic, Txt, fmt, ramp} from './parts';
import tpl from './data/template.json';
import blocks0 from './data/blocks0.json';
import probe from './data/oam_probe.json';

const K = (id: string) => (i: number) => cueOf(id, i);
const show = (f: number, a: number, b?: number) => ramp(f, a - 4, a + 12) * (b === undefined ? 1 : 1 - ramp(f, b - 10, b));

// ---------------- P00 前置き ----------------
const CHAPTERS: [string, string][] = [['A1', '1　背景の表示と転送'], ['C1', '2　縦分割とスプライト'], ['D1', '3　物理と最適化'], ['E1', '4　サウンド'], ['F1', '5　メモリと開発環境'], ['A3', 'おまけ　転送の細部と、ここに至るまで']];
const startOf = (id: string) => { let t = 0; for (const s of sceneOrder) { if (s === id) return t; t += sceneFrames(s); } return t; };
const mmss = (fr: number) => { const s = Math.round(fr / FPS); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
export const P00: React.FC = () => {
  const f = useCurrentFrame(), k = K('P00');
  return (
    <Bg>
      <Nes src="drift1" from={600} x={1080} y={60} w={780} />
      <Txt x={110} y={90} size={34} color={C.violet} o={useIn(k(0))}>MMC5 RACING ／ 技術詳解</Txt>
      <Txt x={110} y={150} size={76} o={useIn(k(0) + 6)}>{'今回の動画は、\nかなりマニアックです。'}</Txt>
      <div style={{position: 'absolute', left: 110, top: 380, display: 'flex', gap: 16, opacity: useIn(k(1))}}>
        {['ネームテーブル', 'ExRAM', 'IRQ', 'サイクル数'].map((t) => <Tag key={t} color={C.cyan}>{t}</Tag>)}
      </div>
      <Card x={110} y={480} w={860} color={C.line} o={useIn(k(4))}>
        {CHAPTERS.map(([id, label]) => (
          <div key={id} style={{display: 'flex', gap: 28, fontSize: 32, fontWeight: 800, lineHeight: 1.6}}>
            <span style={{fontFamily: MONO, color: C.cyan, minWidth: 110}}>{mmss(startOf(id))}</span><span>{label}</span>
          </div>
        ))}
      </Card>
    </Bg>
  );
};

// ---------------- A1 タイル語 ----------------
const ExBits: React.FC<{x: number; y: number; o: number}> = ({x, y, o}) => (
  <div style={{position: 'absolute', left: x, top: y, opacity: o, fontFamily: MONO}}>
    <div style={{display: 'flex', gap: 30}}>
      <div>
        <div style={{fontSize: 24, color: C.sub, fontFamily: 'inherit'}}>ネームテーブル（PPU $2000〜）</div>
        <div style={{display: 'flex', marginTop: 8}}>{[7, 6, 5, 4, 3, 2, 1, 0].map((b) => <div key={b} style={{width: 46, height: 64, border: `3px solid ${C.cyan}`, marginRight: -3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: C.cyan}}>T</div>)}</div>
        <div style={{fontSize: 24, color: C.cyan, marginTop: 6}}>タイル番号 0〜255</div>
      </div>
      <div>
        <div style={{fontSize: 24, color: C.sub}}>ExRAM（$5C00〜、拡張属性モード）</div>
        <div style={{display: 'flex', marginTop: 8}}>{[7, 6, 5, 4, 3, 2, 1, 0].map((b) => <div key={b} style={{width: 46, height: 64, border: `3px solid ${b > 5 ? C.green : C.amber}`, marginRight: -3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: b > 5 ? C.green : C.amber}}>{b > 5 ? 'P' : 'B'}</div>)}</div>
        <div style={{fontSize: 24, marginTop: 6}}><span style={{color: C.green}}>パレット2bit</span>　<span style={{color: C.amber}}>4KBバンク6bit</span></div>
      </div>
    </div>
  </div>
);
export const A1: React.FC = () => {
  const f = useCurrentFrame(), k = K('A1');
  const c = [0, 1, 2, 3, 4].map(k);
  const s = 640 / 256;
  return (
    <Bg>
      <SceneTitle label="1　背景：今の仕組み" />
      <Big o={useIn(c[0]) * (1 - ramp(f, c[1] - 10, c[1]))} size={84}>第1章　背景の表現と転送</Big>
      <div style={{opacity: ramp(f, c[1] - 4, c[1] + 12)}}>
        <Nes src="drift1" from={900} loop={1200} x={60} y={130} w={640}>
          <div style={{position: 'absolute', left: 0, top: 32 * s, width: 144 * s, height: 192 * s, outline: `3px solid ${C.cyan}`}}>
            <Grid cell={8 * s} color="rgba(63,224,255,.45)" />
          </div>
        </Nes>
        <Txt x={60} y={760} size={30} color={C.cyan}>18列 × 24行 ＝ 432タイル／毎フレーム</Txt>
        <ExBits x={760} y={160} o={ramp(f, c[2], c[2] + 14)} />
        <Card x={760} y={420} w={1080} color={C.amber} o={ramp(f, c[3], c[3] + 14)}>
          <div style={{fontSize: 40, fontWeight: 900}}>256 × 64バンク ＝ <span style={{color: C.amber}}>16,384</span>通り／タイル</div>
          <div style={{fontSize: 26, color: C.sub, marginTop: 6, fontFamily: MONO}}>{`実例（DRIFT 1位の走り）: ExRAM $3A → パレット0・バンク58（道路）`}</div>
        </Card>
        <Card x={760} y={600} w={1080} color={C.violet} o={ramp(f, c[4], c[4] + 14)}>
          <div style={{fontSize: 34, fontWeight: 900}}>$5130 で CHR の上位ビット ＝ 向き の下位2bit</div>
          <div style={{display: 'flex', gap: 14, marginTop: 14}}>
            {[0, 1, 2, 3].map((q) => <div key={q} style={{flex: 1, height: 58, borderRadius: 8, background: '#2a2050', border: `2px solid ${C.violet}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800}}>{`組${q}　256KB`}</div>)}
          </div>
          <div style={{fontSize: 26, color: C.violet, marginTop: 10, fontWeight: 800}}>CHR 1MB をすべて背景に</div>
        </Card>
      </div>
    </Bg>
  );
};

// ---------------- A2 地図と辞書 ----------------
const KCOL: Record<string, string> = {G: '#2e6b1e', D: '#6d6d6d', S: C.cyan, E: C.amber, R: C.red, O: '#111', U: '#8a5'};
export const A2: React.FC = () => {
  const f = useCurrentFrame(), k = K('A2');
  const c = [1, 2, 3, 4, 5].map(k); // 0行目は CHR の話からのつなぎ
  const intro = useIn(k(0)) * (1 - ramp(f, c[0] - 10, c[0])), mainO = ramp(f, c[0] - 6, c[0] + 10);
  const g = (blocks0 as {grid: string[]}).grid;
  const cell = 22;
  const dimUniform = ramp(f, c[1], c[1] + 20);
  const showDict = ramp(f, c[2], c[2] + 20);
  return (
    <Bg>
      <SceneTitle label="1　地図と辞書" />
      <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, opacity: intro}}>
        <Box2 x={160} y={300} w={640} h={220} color={C.sub} title="CHR ＝ 模様" sub="ここまでの話（1MB をすべて背景に）" fs={40} />
        <HArrow x={830} y={410} w={220} color={C.cyan} />
        <Box2 x={1080} y={300} w={680} h={220} color={C.cyan} title="ネームテーブル＋ExRAM" sub="どの模様をどこに置くか（毎フレーム432タイル）" fs={40} />
        <Txt x={1080} y={560} w={680} size={30} color={C.cyan} align="center">ここから：この中身を何から作るか</Txt>
      </div>
      <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, opacity: mainO}}>
      <Pic a={0} x={70} y={130} scale={0.7} style={{borderRadius: 10, opacity: 1 - ramp(f, c[0] + 60, c[0] + 90) * 0.85}} />
      <div style={{position: 'absolute', left: 70, top: 130, width: 29 * cell, height: 29 * cell, opacity: ramp(f, c[0] + 60, c[0] + 90), display: 'grid', gridTemplateColumns: `repeat(29, ${cell}px)`}}>
        {g.flatMap((row, y) => row.split('').map((kk, x) => {
          const uni = kk === 'G' || kk === 'D';
          return <div key={`${x}-${y}`} style={{width: cell - 2, height: cell - 2, margin: 1, borderRadius: 3, background: KCOL[kk] ?? '#333',
            opacity: uni ? 1 - 0.7 * dimUniform : 0.35 + 0.65 * showDict}} />;
        }))}
      </div>
      <Txt x={70} y={782} size={22} color={C.sub} w={680} o={ramp(f, c[0] + 60, c[0] + 90)}>{'向き000の地図（29×29ブロック、1ブロック＝4×4タイル）\n最新ROMから読み出し'}</Txt>
      <Card x={780} y={140} w={1060} color={C.red} o={ramp(f, c[0] + 20, c[0] + 34)}>
        <div style={{fontSize: 30, color: C.sub, fontWeight: 700}}>そのまま持つと</div>
        <div style={{fontSize: 44, fontWeight: 900}}>128方向 × 116 × 116 語 × 2バイト ＝ <span style={{color: C.red}}>約3.3MB</span></div>
        <div style={{fontSize: 28, color: C.amber, fontWeight: 800, marginTop: 6, opacity: ramp(f, c[0] + 200, c[0] + 214)}}>PRG 1MB には入らない → 圧縮が必要</div>
      </Card>
      <Card x={780} y={330} w={1060} color="#4c8a3a" o={ramp(f, c[1], c[1] + 14)}>
        <div style={{fontSize: 34, fontWeight: 900}}><span style={{color: '#7fd06a'}}>■芝生</span>・<span style={{color: '#aaa'}}>■道路</span>だけのブロック＝一様セル（直値）　<span style={{color: C.amber}}>約8割</span></div>
      </Card>
      <Card x={780} y={460} w={1060} color={C.amber} o={showDict}>
        {[['S', 'special：1列だけ模様', '8バイト', '3,923'], ['E', 'extra：半分だけ模様', '16バイト', '4,929'], ['R', 'regular', '32バイト', '10,910']].map(([kk, n, b, cnt]) => (
          <div key={kk} style={{display: 'flex', gap: 20, fontSize: 32, fontWeight: 800, lineHeight: 1.55}}>
            <span style={{color: KCOL[kk]}}>■</span><span style={{minWidth: 400}}>{n}</span><span style={{color: C.cyan, minWidth: 150}}>{b}</span><span style={{color: C.sub}}>{cnt}個</span>
          </div>
        ))}
      </Card>
      <Card x={780} y={680} w={510} color={C.green} o={ramp(f, c[3], c[3] + 14)}>
        <div style={{fontSize: 26, color: C.sub, fontWeight: 700}}>辞書 約2万ブロック</div>
        <div style={{fontSize: 36, fontWeight: 900}}>約620KB → <span style={{color: C.green}}>約450KB</span></div>
      </Card>
      <Card x={1330} y={680} w={510} color={C.cyan} o={ramp(f, c[4], c[4] + 14)}>
        <div style={{fontSize: 26, color: C.sub, fontWeight: 700}}>地図の行＝スパン形式</div>
        <div style={{fontSize: 28, fontWeight: 900, fontFamily: MONO}}>[左端][右端][ptr lo][ptr hi]</div>
        <div style={{fontSize: 24, color: C.cyan, fontWeight: 800}}>PRG 18バンク</div>
      </Card>
      </div>
    </Bg>
  );
};

// ---------------- A3 転置した辞書 ----------------
export const A3: React.FC = () => {
  const f = useCurrentFrame(), k = K('A3');
  const c = [0, 1, 2].map(k);
  const yIdx = Math.floor(ramp(f, c[1], c[2] + 60, 0, 12)) * 19 % 256;
  const kRow = Math.floor((f / 40) % 8) + 1;
  const W = 900, rows = 32, cols = 64;
  return (
    <Bg>
      <SceneTitle label="おまけ　転置した辞書" />
      <div style={{position: 'absolute', left: 80, top: 160, width: W, height: 640, opacity: useIn(c[0])}}>
        <Txt x={0} y={-40} size={26} color={C.sub} w={960}>辞書バンクを $8000 に出したときの配置（縦＝k、横＝i）</Txt>
        <div style={{position: 'absolute', left: 60, top: 10, width: W - 60, height: 620, display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)`, gap: 1}}>
          {Array.from({length: rows * cols}).map((_, n) => {
            const r = Math.floor(n / cols), cc = n % cols;
            const isCol = cc === Math.floor(yIdx / 4);
            const isRow = r === kRow;
            return <div key={n} style={{background: isCol && isRow ? C.amber : isCol ? 'rgba(255,181,71,.55)' : isRow ? 'rgba(63,224,255,.45)' : '#2a3a68'}} />;
          })}
        </div>
        {[0, 8, 16, 24].map((r) => <div key={r} style={{position: 'absolute', left: 0, top: 10 + r * 19.4, fontFamily: MONO, fontSize: 18, color: C.sub}}>{`$${(0x80 + r).toString(16).toUpperCase()}00`}</div>)}
      </div>
      <Code x={1030} y={170} w={820} o={ramp(f, c[1], c[1] + 14)} size={30} title="ブロック i の k バイト目 ＝ $8000 + k×256 + i"
        lines={[{s: `LDY #$${yIdx.toString(16).toUpperCase().padStart(2, '0')}       ; i（ブロック番号）`, c: C.amber},
          {s: `LDA $8${kRow.toString(16).toUpperCase()}00,Y    ; k=${kRow} のバイト`, c: C.cyan}, {s: 'STA $2007'}]} />
      <Card x={1030} y={470} w={820} color={C.green} o={ramp(f, c[2], c[2] + 14)}>
        <div style={{fontSize: 32, fontWeight: 900}}>オペランドは固定。Yを変えるだけで、どのブロックも読める</div>
      </Card>
    </Bg>
  );
};

// ---------------- A4 自己書き換え ----------------
type L = {a: string; b: string; s: string};
const T = tpl as {chunk: string[][]; uniform: string[][]; address: string; uniform_stub: string};
const chunkLines = (T.chunk.slice(0, 13).map(([a, b, s]) => ({a, b, s})) as L[]).concat([{a: '…', b: '', s: '（以下 ExRAM 側 4組）'}]);
export const A4: React.FC = () => {
  const f = useCurrentFrame(), k = K('A4');
  const c = [0, 1, 2, 3, 4, 5].map(k);
  const mode = f < c[3] ? 'normal' : f < c[4] ? 'uniform' : 'edge';
  const blk = 0x1f + (Math.floor(f / 30) % 6) * 23;
  const lines: L[] = chunkLines.map((l, i) => {
    if (i === 0 && f >= c[2] && mode === 'normal') return {...l, b: `A0 ${blk.toString(16).toUpperCase().padStart(2, '0')}`, s: `LDY #$${blk.toString(16).toUpperCase().padStart(2, '0')}`};
    if (i === 0 && mode === 'uniform') return {...l, b: `4C ${T.uniform_stub.slice(2)} ${T.uniform_stub.slice(0, 2)}`, s: `JMP $${T.uniform_stub}   ; → 定数ルーチン`};
    if (i === 1 && f >= c[2] && mode === 'normal') return {...l, b: 'A2 9B', s: 'LDX #$9B        ; 辞書バンク'};
    return l;
  });
  return (
    <Bg>
      <SceneTitle label="おまけ　毎フレーム書き換える転送の型" />
      <Code x={60} y={130} w={980} size={25} o={useIn(c[0])} title={`WRAM の型（1ブロックの1列分、実際の機械語）`} lines={lines}
        patch={f >= c[2] ? [0, 1] : []} />
      <div style={{opacity: show(f, c[3], c[4])}}>
        <Code x={1080} y={130} w={780} size={25} title="一様ブロック用の共有ルーチン（道路）" color={C.amber}
          lines={T.uniform.slice(0, 11).map(([a, b, s]) => ({a, b, s}))} />
      </div>
      <Card x={1080} y={150} w={780} color={C.amber} o={show(f, c[2], c[3])}>
        <div style={{fontSize: 30, fontWeight: 900}}>普通のブロック</div>
        <div style={{fontSize: 26, marginTop: 8, lineHeight: 1.6}}>LDY のオペランド ← ブロック番号<br />LDX のオペランド ← 辞書バンク<br />先頭のオペコード ← $A0（LDY）</div>
      </Card>
      <Card x={1080} y={150} w={780} color={C.red} o={show(f, c[4], c[5])}>
        <div style={{fontSize: 30, fontWeight: 900}}>表示幅の右端</div>
        <div style={{fontSize: 26, marginTop: 8, fontFamily: MONO}}>次の列の先頭 ← $60（RTS）</div>
      </Card>
      <Card x={1080} y={430} w={780} color={C.cyan} o={ramp(f, c[5], c[5] + 14)}>
        <div style={{fontSize: 28, fontWeight: 800, lineHeight: 1.6}}>下部IRQ（画面を消している間）<br /><span style={{fontFamily: MONO, color: C.cyan}}>JSR $A000</span> → 432タイル分を一気に</div>
      </Card>
    </Bg>
  );
};

// ---------------- A6 転送のしくみ（概要。細部はおまけの A3・A4） ----------------
export const A6: React.FC = () => {
  const f = useCurrentFrame(), k = K('A6');
  const c = [0, 1, 2].map(k);
  return (
    <Bg>
      <SceneTitle label="1　転送のしくみ" />
      <Box2 x={80} y={200} w={340} h={150} color={C.amber} title="地図＋辞書" sub="PRG" o={useIn(c[0])} />
      <HArrow x={430} y={275} w={1000} color={C.cyan} label="毎フレーム 432タイル" o={useIn(c[0] + 10)} />
      <Box2 x={1440} y={200} w={400} h={150} color={C.cyan} title="PPU / ExRAM" o={useIn(c[0] + 16)} />
      <Box2 x={560} y={470} w={400} h={170} color={C.violet} title="準備処理" sub="地図を読んで命令を書き換える" fs={34} o={useIn(c[1])} />
      <HArrow x={970} y={555} w={150} color={C.violet} o={useIn(c[1] + 10)} />
      <Box2 x={1130} y={470} w={460} h={170} color={C.green} title="WRAMの転送の型" sub="ループのない命令列" fs={34} o={useIn(c[1] + 16)} />
      <Txt x={1130} y={380} w={460} size={26} color={C.green} align="center" o={useIn(c[1] + 60)}>画面を消している間に一気に流れる ↑</Txt>
      <div style={{position: 'absolute', left: 560, top: 680, display: 'flex', gap: 16, opacity: useIn(c[2])}}>
        <Tag color={C.violet}>準備処理も Python が生成した 6502 コード</Tag>
        <Tag color={C.sub}>細部は最後のおまけで</Tag>
      </div>
    </Bg>
  );
};

// ---------------- A5 PRGの内訳 ----------------
const PRG: [string, number, number, string][] = [['辞書', 0, 61, C.amber], ['地図', 61, 18, C.cyan], ['準備処理（生成コード）', 79, 13, C.violet], ['起動データ', 92, 1, '#5d6b8f'], ['準備処理', 93, 12, C.violet], ['投影・起動', 105, 3, '#5d6b8f'], ['音・結果', 108, 1, C.green], ['物理・ゲーム・UI・固定', 109, 19, C.red]];
export const A5: React.FC = () => {
  const f = useCurrentFrame(), c0 = K('A5')(0);
  return (
    <Bg>
      <SceneTitle label="1　PRGの内訳" />
      <div style={{opacity: ramp(f, c0 - 4, c0 + 12)}}>
        <Txt x={60} y={170} size={40}>PRG 1MB（8KB × 128バンク）の内訳</Txt>
        <div style={{position: 'absolute', left: 60, top: 260, width: 1800, height: 120, display: 'flex', borderRadius: 10, overflow: 'hidden'}}>
          {PRG.map(([n, s0, len, col], i) => <div key={i} style={{width: (len / 128) * 1800 * ramp(f, c0 + i * 6, c0 + i * 6 + 20), background: col, borderRight: '2px solid #0a0f1e'}} />)}
        </div>
        {[['辞書', 61, C.amber], ['地図', 18, C.cyan], ['準備処理（生成コード）', 25, C.violet], ['物理・ゲーム・UI・音・固定など', 24, C.red]].map(([n, len, col], i) => (
          <Txt key={i} x={60 + (i % 2) * 900} y={420 + Math.floor(i / 2) * 80} size={38} color={col as string}>{`■ ${n}　${len}バンク`}</Txt>
        ))}
        <Txt x={60} y={620} size={46}>PRG の約8割が、背景のためのデータと生成コード</Txt>
      </div>
    </Bg>
  );
};
export const _probe = probe;
