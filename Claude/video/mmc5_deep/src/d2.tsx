import React from 'react';
import {Img, staticFile, useCurrentFrame} from 'remotion';
import {Bg, C, SceneTitle, Tag, cueOf, useIn} from './common';
import {Big, Box2, Card, Code, Grid, HArrow, MONO, Nes, Txt, fmt, ramp} from './parts';
import probe from './data/oam_probe.json';

const K = (id: string) => (i: number) => cueOf(id, i);
const show = (f: number, a: number, b?: number) => ramp(f, a - 4, a + 12) * (b === undefined ? 1 : 1 - ramp(f, b - 10, b));

const StageBar: React.FC<{x: number; y: number; items: {v: number; label: string; col: string}[]; budget: number; scale?: number; o?: number; title: string}> =
  ({x, y, items, budget, scale = 0.07, o = 1, title}) => {
    let acc = 0;
    return (
      <div style={{position: 'absolute', left: x, top: y, opacity: o}}>
        <Txt x={0} y={0} size={28} color={C.sub} w={1700}>{title}</Txt>
        <div style={{position: 'absolute', left: 0, top: 50, height: 70, display: 'flex'}}>
          {items.map((it, i) => { acc += it.v; return <div key={i} style={{width: it.v * scale, height: 70, background: it.col, borderRight: '3px solid #0a0f1e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 900, color: '#0a0f1e', whiteSpace: 'nowrap', overflow: 'hidden'}}>{`${it.label} ${fmt(it.v)}`}</div>; })}
        </div>
        <div style={{position: 'absolute', left: budget * scale, top: 36, width: 6, height: 100, background: C.red}} />
        <Txt x={budget * scale - 80} y={140} size={24} color={C.red} w={300}>{`上限 ${fmt(budget)}`}</Txt>
      </div>
    );
  };

// ---------------- B1 最初の形 ----------------
export const B1: React.FC = () => {
  const f = useCurrentFrame(), k = K('B1');
  const c = [0, 1, 2, 3].map(k);
  return (
    <Bg>
      <SceneTitle label="おまけ　ここに至るまで：最初の形" />
      <Big o={useIn(c[0]) * (1 - ramp(f, c[1] - 10, c[1]))} size={84}>おまけ　ここに至るまで</Big>
      <div style={{opacity: ramp(f, c[1] - 4, c[1] + 12)}}>
        <Box2 x={80} y={170} w={300} h={130} color={C.amber} title="辞書" sub="PRG" />
        <HArrow x={390} y={235} w={200} color={C.amber} label="メインが展開" />
        <Box2 x={600} y={170} w={340} h={130} color={C.red} title="WRAMバッファ" sub="画面ぶんのタイル" />
        <HArrow x={950} y={235} w={200} color={C.cyan} label="固定の転送コード" />
        <Box2 x={1160} y={170} w={300} h={130} color={C.cyan} title="PPU / ExRAM" />
        <Txt x={80} y={320} size={30} color={C.red}>同じデータを2回扱う（読んで書く → 読んで送る）</Txt>
      </div>
      <StageBar x={80} y={430} o={ramp(f, c[2], c[2] + 14)} title="ある重い場面のメイン処理（当時の計測）" budget={21380}
        items={[{v: 10068, label: '物理', col: C.amber}, {v: 8818, label: '背景の展開', col: C.red}, {v: 3820, label: 'その他', col: '#5d6b8f'}]} />
      <div style={{position: 'absolute', left: 80, top: 690, display: 'flex', gap: 20, opacity: ramp(f, c[3], c[3] + 14)}}>
        <Tag color={C.sub}>形が同じなら転送を省くキャッシュ</Tag><Tag color={C.sub}>1タイル縦ずれは新しい行だけ（行モード）</Tag>
        <Tag color={C.red}>向きが変わると全面 → 最悪の場面は救えない</Tag>
      </div>
    </Bg>
  );
};

// ---------------- B2 直接転送へ ----------------
export const B2: React.FC = () => {
  const f = useCurrentFrame(), k = K('B2');
  const c = [0, 1, 2].map(k);
  return (
    <Bg>
      <SceneTitle label="おまけ　バッファをやめて直接送る" />
      <div style={{opacity: show(f, c[0], c[2])}}>
        <Box2 x={80} y={170} w={300} h={130} color={C.amber} title="辞書" sub="PRG" />
        <HArrow x={390} y={235} w={760} color={C.green} label="1回だけ読んで直行" />
        <Box2 x={1160} y={170} w={300} h={130} color={C.cyan} title="PPU / ExRAM" />
        <Code x={80} y={360} w={900} size={26} title="メインが書く「記述子」＝ブロックごとの小さなプログラム" color={C.green}
          lines={[{s: 'LDA #辞書バンク / STA $5114'}, {s: 'LDY #ブロック位置'}, {s: 'LDA #カーネルのバンク / STA $5116'}, {s: 'JMP カーネル'}]} />
        <div style={{opacity: ramp(f, c[1], c[1] + 14)}}>
          <Txt x={1040} y={360} size={30} w={820}>辞書が転置されていないので、ページごとにアドレスの違うカーネルが必要</Txt>
          <div style={{position: 'absolute', left: 1040, top: 470, display: 'grid', gridTemplateColumns: 'repeat(16, 44px)', gap: 6}}>
            {Array.from({length: 16 * 4}).map((_, n) => <div key={n} style={{width: 44, height: 30, background: C.red, opacity: 0.4 + 0.6 * ramp(f, c[1] + n, c[1] + n + 10), borderRadius: 3}} />)}
          </div>
          <Txt x={1040} y={640} size={34} color={C.red}>カーネルのコピーだけで PRG 16バンク</Txt>
        </div>
      </div>
      <div style={{opacity: ramp(f, c[2] - 4, c[2] + 12)}}>
        <Txt x={80} y={150} size={40}>PPU を縦方向の +32 増分にして、列ごとに転送</Txt>
        <div style={{position: 'absolute', left: 120, top: 260, display: 'grid', gridTemplateColumns: 'repeat(18, 40px)', gap: 4}}>
          {Array.from({length: 18 * 12}).map((_, n) => {
            const col = n % 18, row = Math.floor(n / 18);
            const lit = ramp(f, c[2] + 20 + col * 8 + row * 0.6, c[2] + 28 + col * 8 + row * 0.6);
            return <div key={n} style={{width: 40, height: 30, background: lit > 0.5 ? C.cyan : '#1a2440', borderRadius: 3, outline: row === 0 ? `2px solid ${C.amber}` : undefined}} />;
          })}
        </div>
        <Txt x={120} y={680} size={30} color={C.amber}>■ PPUADDR の設定は列の先頭だけ（行ごと → 列ごと）</Txt>
        <Card x={1040} y={300} w={800} color={C.cyan}><div style={{fontSize: 40, fontWeight: 900}}>表示 160 → <span style={{color: C.cyan}}>176ライン</span></div></Card>
      </div>
    </Bg>
  );
};

// ---------------- B3 転置と書き換え ----------------
export const B3: React.FC = () => {
  const f = useCurrentFrame(), k = K('B3');
  const c = [0, 1, 2].map(k);
  const stages = [['段階0', 'WRAMバッファ＋固定コード', C.red], ['段階1', '記述子プログラム＋ページごとのカーネル', C.amber], ['段階2', '列転送・STX', C.amber], ['段階3', '辞書の転置＋オペランド書き換え', C.cyan], ['段階4', 'オペコード書き換え＋列単位の辞書', C.green]];
  const lit = f < c[1] ? 3 : 4;
  return (
    <Bg>
      <SceneTitle label="おまけ　転置と書き換え" />
      {stages.map(([s, t, col], i) => (
        <div key={i} style={{position: 'absolute', left: 80, top: 160 + i * 96, width: 1000, height: 80, borderRadius: 12, background: i <= lit ? `${col}22` : '#131b31',
          border: `3px solid ${i === lit ? col : i < lit ? `${col}88` : '#2c3b63'}`, display: 'flex', alignItems: 'center', gap: 24, padding: '0 24px', boxSizing: 'border-box', fontSize: 30, fontWeight: 800,
          opacity: ramp(f, c[0] + i * 6, c[0] + i * 6 + 10)}}>
          <span style={{color: col as string, minWidth: 110}}>{s}</span><span>{t}</span>
        </div>
      ))}
      <Card x={1140} y={170} w={720} color={C.cyan} o={show(f, c[0] + 20, c[1])}>
        <div style={{fontSize: 30, fontWeight: 900}}>転置で、1つの型がどのブロックも読める</div>
        <div style={{fontSize: 26, color: C.sub, marginTop: 8}}>16バンクのカーネルのコピーが不要に<br />型は WRAM、準備処理はオペランドだけ書き換え</div>
      </Card>
      <div style={{opacity: ramp(f, c[2] - 4, c[2] + 12)}}>
        <Txt x={1140} y={170} size={30} color={C.sub}>重い場面の背景の準備（条件は同じではない）</Txt>
        <div style={{position: 'absolute', left: 1140, top: 230, width: 8818 * 0.075, height: 70, background: C.red, borderRadius: 8}} />
        <Txt x={1140} y={310} size={32} color={C.red}>段階0の展開 8,818</Txt>
        <div style={{position: 'absolute', left: 1140, top: 380, width: 4660 * 0.075 * ramp(f, c[2], c[2] + 30), height: 70, background: C.green, borderRadius: 8}} />
        <Txt x={1140} y={460} size={32} color={C.green}>現在の準備 4,660</Txt>
      </div>
    </Bg>
  );
};

// ---------------- B4 全数検査 ----------------
export const B4: React.FC = () => {
  const f = useCurrentFrame(), k = K('B4');
  const c = [0, 1, 2].map(k);
  const n = 70 * 36;
  return (
    <Bg>
      <SceneTitle label="おまけ　全数検査" />
      <div style={{position: 'absolute', left: 80, top: 150, display: 'grid', gridTemplateColumns: 'repeat(70, 11px)', gap: 3, opacity: useIn(c[0])}}>
        {Array.from({length: n}).map((_, i) => <div key={i} style={{width: 11, height: 11, borderRadius: 2, background: i < ramp(f, c[0], c[0] + 120, 0, n) ? '#3fa9c7' : '#1a2440'}} />)}
      </div>
      <Txt x={80} y={680} size={36} o={useIn(c[0])}>128方向 × すべての位置 ＝ 2,437,120通り（1点 ≒ 約970通り）</Txt>
      <div style={{position: 'absolute', left: 1100, top: 160, display: 'flex', flexDirection: 'column', gap: 18, opacity: ramp(f, c[1], c[1] + 14)}}>
        {['予測したサイクル数', '実際の6502での実行', '独立に復号した画像'].map((t) => <Tag key={t} color={C.green}>{`✓ ${t}`}</Tag>)}
        <Txt x={0} y={0} size={26} color={C.sub} style={{position: 'relative'}}>3つが一致することを照合</Txt>
      </div>
      <Card x={1100} y={440} w={760} color={C.amber} o={ramp(f, c[2], c[2] + 14)}>
        <div style={{fontSize: 28, color: C.sub, fontWeight: 700}}>最も重い組み合わせ</div>
        <div style={{fontSize: 52, fontWeight: 900}}>7,308 / 7,449</div>
        <div style={{fontSize: 48, fontWeight: 900, color: C.amber}}>残り 141サイクル</div>
      </Card>
    </Bg>
  );
};

// ---------------- C1 画面の分解 ----------------
type OP = {oam: number[][]; ex: number[]};
const P600 = (probe as Record<string, OP>)['600'];
const sprCat = (slot: number, o: number[]): [string, string] => {
  if (o[1] === 233) return ['黒帯', '#ff5b6e'];
  if (slot >= 48 && slot <= 51) return ['自車', C.amber];
  if (slot >= 40 && slot <= 45) return ['CPU車', C.violet];
  if (slot >= 56) return ['摩擦円', C.green];
  if ([15, 19, 23, 27].includes(slot)) return ['円の点', C.green];
  if (slot === 4 || slot === 11) return ['順位', C.cyan];
  if (slot === 24) return ['地図の自車', C.cyan];
  return ['時計・表示', C.cyan];
};
export const C1: React.FC = () => {
  const f = useCurrentFrame(), k = K('C1');
  const c = [0, 1, 2, 3, 4].map(k);
  const S = 3;
  const exO = ramp(f, c[3] - 4, c[3] + 12);
  return (
    <Bg>
      <SceneTitle label="2　画面の分解" />
      <Big o={useIn(c[0]) * (1 - ramp(f, c[1] - 10, c[1]))} size={84}>第2章　縦分割とスプライト</Big>
      <div style={{opacity: ramp(f, c[1] - 4, c[1] + 12) * (1 - exO)}}>
        <div style={{position: 'absolute', left: 80, top: 150, width: 256 * S, height: 240 * S}}>
          <Img src={staticFile('gen/frame600.png')} style={{width: 256 * S, height: 240 * S, imageRendering: 'pixelated'}} />
          <div style={{position: 'absolute', left: 0, top: 32 * S, width: 136 * S, height: 184 * S, border: `4px solid ${C.cyan}`, opacity: ramp(f, c[1], c[1] + 14)}} />
          <div style={{position: 'absolute', left: 144 * S, top: 32 * S, width: 112 * S, height: 184 * S, border: `4px dashed ${C.violet}`, opacity: ramp(f, c[1] + 20, c[1] + 34)}} />
          {P600.oam.map((o, s) => o[0] < 239 ? (() => { const [n, col] = sprCat(s, o); return (
            <div key={s} title={n} style={{position: 'absolute', left: o[3] * S, top: (o[0] + 1) * S, width: 8 * S, height: 16 * S, border: `2px solid ${col}`, opacity: ramp(f, c[2] + s * 0.6, c[2] + s * 0.6 + 8)}} />); })() : null)}
        </div>
        <Txt x={900} y={170} size={34} color={C.cyan} o={ramp(f, c[1], c[1] + 14)}>■ BG：コース（毎フレーム書き換え）</Txt>
        <Txt x={900} y={230} size={34} color={C.violet} o={ramp(f, c[1] + 20, c[1] + 34)}>■ BG：MMC5 縦分割（TIME/TOTAL・ミニマップ）</Txt>
        <div style={{position: 'absolute', left: 900, top: 320, display: 'flex', flexWrap: 'wrap', gap: 12, width: 940, opacity: ramp(f, c[2], c[2] + 14)}}>
          {[['自車（車体＋前輪）', C.amber], ['CPU車', C.violet], ['黒帯', '#ff5b6e'], ['摩擦円と点', C.green], ['時計・順位・表示', C.cyan]].map(([t, col]) => <Tag key={t} color={col}>{`□ スプライト：${t}`}</Tag>)}
        </div>
      </div>
      <div style={{opacity: exO}}>
        <Txt x={80} y={140} size={30} color={C.sub}>ExRAM 1KB の中身（DRIFT 1位の走り・あるコマ、上から10行）</Txt>
        <div style={{position: 'absolute', left: 80, top: 190, display: 'grid', gridTemplateColumns: 'repeat(32, 52px)', gap: 3}}>
          {Array.from({length: 32 * 10}).map((_, n) => {
            const v = P600.ex[n], col = n % 32;
            const split = col >= 21;
            return <div key={n} style={{width: 52, height: 40, borderRadius: 4, background: split ? '#3a2a63' : v === 1 ? '#2e5a20' : '#3a3a3a', color: split ? C.violet : C.text,
              fontFamily: MONO, fontSize: 17, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{v.toString(16).toUpperCase().padStart(2, '0')}</div>;
          })}
        </div>
        <Txt x={80} y={640} size={34} color={C.cyan} o={ramp(f, c[4], c[4] + 14)}>■ 左：コースの拡張属性（$3A＝道路のバンク、$01＝芝生）</Txt>
        <Txt x={80} y={700} size={34} color={C.violet} o={ramp(f, c[4] + 15, c[4] + 29)}>■ 右：縦分割のネームテーブル（タイル番号）</Txt>
      </div>
    </Bg>
  );
};

// ---------------- C3 fine X で揺れる分割 ----------------
// 全画面（コースのスクロール）と、ミニマップの拡大を同時に見せる。x=195 がミニマップの正しい左端。
const FULL: [number, number, number, number] = [0, 24, 256, 204];
const MM: [number, number, number, number] = [168, 120, 72, 96];
const MmInset: React.FC<{src: string; x: number; y: number; w: number}> = ({src, x, y, w}) => {
  const s = w / MM[2];
  return (
    <Nes src={src} from={0} loop={240} x={x} y={y} w={w} crop={MM}>
      <div style={{position: 'absolute', left: (195 - MM[0]) * s - 2, top: 0, width: 4, height: MM[3] * s, background: C.amber, opacity: 0.9}} />
    </Nes>
  );
};
export const C3: React.FC = () => {
  const f = useCurrentFrame(), k = K('C3');
  const c = [0, 1, 2].map(k);
  const pre = 1 - ramp(f, c[2] - 10, c[2] + 4), post = ramp(f, c[2] - 4, c[2] + 12);
  return (
    <Bg>
      <SceneTitle label="2　fine X で揺れる縦分割" />
      <div style={{opacity: pre}}>
        <Nes src="shake_prefix" from={0} loop={240} x={60} y={120} w={880} crop={FULL} />
        <Txt x={60} y={835} size={30} color={C.red} w={880}>修正前：コースが横に流れると、右の分割側も一緒に揺れる</Txt>
        <MmInset src="shake_prefix" x={1040} y={120} w={520} />
        <Txt x={1600} y={120} size={26} color={C.sub} w={300} mono>{'拡大\n\n線＝正しい左端\nx=195\n\n実測\n195 → 188\n→ 195 …\n（8ドット周期）'}</Txt>
      </div>
      <div style={{opacity: post}}>
        <Nes src="shake_fixed" from={0} loop={240} x={60} y={130} w={760} crop={FULL} />
        <Txt x={60} y={760} size={30} color={C.green} w={760}>修正後：コースは流れても、分割側は止まる</Txt>
        <Txt x={900} y={130} size={32} w={960}>CHR を8種類：右へ 0〜7 ドットずらした絵</Txt>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((n) => {
          const sc = 4.5, x = 900 + (n % 4) * 240, y = 210 + Math.floor(n / 4) * 260, o = ramp(f, c[2] + 20 + n * 8, c[2] + 34 + n * 8);
          return (
            <div key={n} style={{position: 'absolute', left: x, top: y, opacity: o}}>
              <div style={{position: 'relative', width: 40 * sc, height: 32 * sc, background: '#000', borderRadius: 6, overflow: 'hidden', border: `2px solid ${C.line}`}}>
                <Img src={staticFile(`gen/finex_v${n}.png`)} style={{width: 40 * sc, height: 32 * sc, imageRendering: 'pixelated'}} />
                <Grid cell={8 * sc} color="rgba(63,224,255,.35)" />
              </div>
              <div style={{fontFamily: MONO, fontSize: 26, color: C.cyan, marginTop: 8}}>{`fine X = ${n} 用`}</div>
            </div>
          );
        })}
        <Txt x={900} y={720} size={30} w={960} o={ramp(f, c[2] + 110, c[2] + 124)}>そのフレームの fine X で選ぶ → 揺れが打ち消される</Txt>
        <Txt x={900} y={775} size={22} color={C.sub} w={960} o={ramp(f, c[2] + 110, c[2] + 124)}>※ 修正後の画面の絵から作った図（枠＝8ドットのタイル）</Txt>
      </div>
    </Bg>
  );
};

// ---------------- C4 境界の黒帯 ----------------
// 先に外した映像（崩れ）を見せ、次に12枚の配置を全画面に重ねる。座標は実OAM（x=136, Y=31〜207）。
const BAND = probe['300'].oam.map((o, i) => ({i, y: o[0], t: o[1], x: o[3]})).filter((o) => o.t === 233 && o.x === 136 && o.y < 240).sort((a, b) => a.y - b.y);
const EDGE: [number, number, number, number] = [112, 60, 40, 72];
export const C4: React.FC = () => {
  const f = useCurrentFrame(), k = K('C4');
  const c = [0, 1, 2].map(k);
  const sw = ramp(f, c[1] - 4, c[1] + 12);
  const W0 = 880, s = W0 / FULL[2];
  return (
    <Bg>
      <SceneTitle label="2　境界を隠す黒帯スプライト" />
      <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, opacity: 1 - sw}}>
        <Nes src="nomask" from={300} loop={1800} x={60} y={120} w={W0} crop={FULL} />
        <Nes src="nomask" from={300} loop={1800} x={1000} y={160} w={280} crop={EDGE} />
        <Txt x={60} y={835} size={30} color={C.red} w={880}>黒帯なし：コースの右端に崩れたタイルの列がはみ出す</Txt>
      </div>
      <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, opacity: sw}}>
        <Nes src="drift1" from={300} loop={1800} x={60} y={120} w={W0} crop={FULL}>
          {BAND.map((b, j) => (
            <div key={b.i} style={{position: 'absolute', left: (b.x - FULL[0]) * s, top: (b.y + 1 - FULL[1]) * s, width: 8 * s, height: 16 * s, boxSizing: 'border-box',
              border: `3px solid ${C.cyan}`, background: 'rgba(63,224,255,.18)', opacity: ramp(f, c[1] + 10 + j * 6, c[1] + 20 + j * 6) * (1 - ramp(f, c[2] + 60, c[2] + 90) * 0.7)}}>
              <div style={{position: 'absolute', left: 8 * s + 6, top: 4 * s, fontFamily: MONO, fontSize: 20, color: C.cyan, whiteSpace: 'nowrap'}}>{`OAM ${b.i}`}</div>
            </div>
          ))}
        </Nes>
        <Nes src="drift1" from={300} loop={1800} x={1000} y={160} w={280} crop={EDGE} />
        <Txt x={60} y={835} size={30} color={C.green} w={880}>黒帯あり（通常）：8×16 の黒スプライト × 12枚</Txt>
      </div>
      <Txt x={1000} y={115} size={26} color={C.sub} w={280}>境目の拡大</Txt>
      <Card x={1320} y={160} w={560} color={C.cyan} o={ramp(f, c[1], c[1] + 14)}>
        <div style={{fontSize: 30, fontWeight: 900}}>不透明な黒の 8×16 × 12枚</div>
        <div style={{fontSize: 24, color: C.sub, marginTop: 6, fontFamily: MONO}}>{'x=136、タイル233\nY=31〜207（16ドットおき）'}</div>
      </Card>
      <Card x={1320} y={380} w={560} color={C.amber} o={ramp(f, c[2], c[2] + 14)}>
        <div style={{fontSize: 30, fontWeight: 900}}>若いOAM番号＝先に評価</div>
        <div style={{fontSize: 24, color: C.sub, marginTop: 6}}>1ライン8枚の制限で消えないように</div>
      </Card>
    </Bg>
  );
};
