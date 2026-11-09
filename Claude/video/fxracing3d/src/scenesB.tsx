import React from 'react';
import {Img, staticFile, useCurrentFrame} from 'remotion';
import {Arrow, Bg, C, SceneTitle, Tag, cueOf, useIn} from './common';
import {Card, Grid, Label, NES, Nes, Px, PxCrop, Swatch, Txt, ramp} from './parts';
import rows3200 from './data/mode7_3200.json';

const K = (id: string) => (i: number) => cueOf(id, i);
type Seg = {y: number; valid: number; sky: number; a?: number[]; b?: number[]};
const ROWS = rows3200 as Seg[];
const F = 3200; // 解説に使うコマ（木が地平線をまたぐ）

// ---------------- S05 できないこと2：地面を回せない ----------------
const MapScan: React.FC<{x: number; y: number; size: number; row: number; o: number}> = ({x, y, size, row, o}) => {
  const s = size / 640;
  const valid = ROWS.filter((r) => r.valid);
  return (
    <div style={{position: 'absolute', left: x, top: y, width: size, height: size, opacity: o, borderRadius: 8, overflow: 'hidden', boxShadow: '0 12px 44px rgba(0,0,0,.6)'}}>
      <Img src={staticFile('img/course_map.png')} style={{width: size, height: size, imageRendering: 'pixelated'}} />
      <svg width={size} height={size} style={{position: 'absolute', left: 0, top: 0}}>
        {valid.filter((r) => r.y <= row && r.y % 3 === 0).map((r) => (
          <line key={r.y} x1={r.a![0] * s} y1={r.a![1] * s} x2={r.b![0] * s} y2={r.b![1] * s} stroke={C.amber} strokeOpacity={0.35} strokeWidth={2} />
        ))}
        {valid.filter((r) => r.y === row).map((r) => (
          <line key="now" x1={r.a![0] * s} y1={r.a![1] * s} x2={r.b![0] * s} y2={r.b![1] * s} stroke={C.red} strokeWidth={6} strokeLinecap="round" />
        ))}
      </svg>
    </div>
  );
};

export const S05: React.FC = () => {
  const f = useCurrentFrame(), k = K('S05');
  const a1 = useIn(k(1)), a2 = ramp(f, k(2), k(2) + 16), a3 = useIn(k(3)), a4 = ramp(f, k(4), k(4) + 20);
  const first = ROWS.find((r) => r.valid)!.y;
  const row = Math.min(191, first + Math.floor(Math.max(0, f - k(2) - 10) / 3) % (192 - first));
  const scan = a2 * (1 - ramp(f, k(3) - 8, k(3) + 8));
  return (
    <Bg>
      <SceneTitle label="できないこと2　地面を回せない" color={C.green} />
      {/* 地面だけの映像 */}
      <div style={{opacity: 1 - a2}}>
        <Nes src="main" from={2700} x={110} y={170} w={720} crop={[0, 0, 256, 192]} />
        <Txt x={110} y={730} size={32} color={C.sub} w={720} align="center">ファミコン：背景を回す・傾ける機能はない</Txt>
        <div style={{opacity: a1}}>
          <Nes src="ground" from={2700} x={1000} y={170} w={720} crop={[0, 0, 256, 192]} />
          <Label x={1020} y={190} color={C.green}>Mode7が描いた地面だけ</Label>
          <Txt x={1000} y={730} size={32} color={C.green} w={720} align="center">Mode7のアルゴリズムを再現した回路</Txt>
        </div>
      </div>
      {/* 1行ずつ地図を読む */}
      <div style={{opacity: scan}}>
        <div style={{position: 'absolute', left: 90, top: 190, width: 256 * 3, height: 192 * 3, overflow: 'hidden', borderRadius: 8}}>
          <Px src={`img/layer_${F}_ground.png`} x={0} y={0} w={256 * 3} h={240 * 3} />
          <div style={{position: 'absolute', left: 0, right: 0, top: row * 3, height: 3, background: C.red, boxShadow: `0 0 12px ${C.red}`}} />
        </div>
        <Txt x={90} y={790} size={30} color={C.sub}>{`画面の${row}行目`}</Txt>
        <MapScan x={1000} y={150} size={660} row={row} o={1} />
        <Txt x={1000} y={820} size={30} color={C.sub}>ROMに入っているコースの地図（640×640）</Txt>
        <Arrow x1={870} y1={190 + row * 3} x2={990} y2={480} color={C.red} width={4} />
      </div>
      {/* 地面＋物体＝画面 */}
      <div style={{opacity: a3 * (1 - a4)}}>
        <div style={{position: 'absolute', left: 560, top: 190, width: 256 * 3, height: 192 * 3, background: '#0b1226', borderRadius: 8, overflow: 'hidden', border: `3px solid ${C.cyan}`}}>
          <Px src={`img/layer_${F}_fx.png`} x={0} y={0} w={256 * 3} h={240 * 3} />
        </div>
        <Label x={580} y={210} color={C.cyan}>SuperFX：車・木・家だけ</Label>
      </div>
      <div style={{opacity: a4}}>
        {[['ground', '地面（Mode7）', C.green], ['fx', '車・木・家（SuperFX）', C.cyan], ['full', '画面', C.amber]].map(([n, label, col], i) => (
          <React.Fragment key={n}>
            <div style={{position: 'absolute', left: 80 + i * 600, top: 260, width: 512, height: 384, background: '#0b1226', borderRadius: 8, overflow: 'hidden',
              border: `3px solid ${col}`, opacity: ramp(f, k(4) + i * 18, k(4) + i * 18 + 16)}}>
              <Px src={`img/layer_${F}_${n}.png`} x={0} y={0} w={512} h={480} />
            </div>
            <Txt x={80 + i * 600} y={665} size={32} color={col} w={512} align="center" o={ramp(f, k(4) + i * 18, k(4) + i * 18 + 16)}>{label}</Txt>
          </React.Fragment>
        ))}
        <Txt x={572} y={400} size={70} color={C.text} o={ramp(f, k(4) + 18, k(4) + 30)}>＋</Txt>
        <Txt x={1172} y={400} size={70} color={C.text} o={ramp(f, k(4) + 36, k(4) + 48)}>＝</Txt>
        <Txt x={80} y={760} size={34} w={1760} align="center" o={ramp(f, k(4) + 50, k(4) + 70)}>8ドットずつ重ねて、1枚の画面に</Txt>
      </div>
    </Bg>
  );
};

// ---------------- S06 できないこと3：色が足りない ----------------
const ZOOM: [number, number, number, number] = [176, 56, 64, 40]; // 木が地平線をまたぐあたり（実画素）
const PalRow: React.FC<{x: number; y: number; title: string; colors: string[]; o: number; mark?: number; color: string}> = ({x, y, title, colors, o, mark, color}) => (
  <div style={{position: 'absolute', left: x, top: y, opacity: o, display: 'flex', alignItems: 'center', gap: 18}}>
    <div style={{width: 250, fontSize: 32, fontWeight: 900, color}}>{title}</div>
    {colors.map((c, i) => (
      <div key={i} style={{position: 'relative'}}>
        <Swatch a={c} size={92} />
        {mark === i && <div style={{position: 'absolute', inset: -8, border: `5px solid ${C.amber}`, borderRadius: 14}} />}
      </div>
    ))}
  </div>
);

export const S06: React.FC = () => {
  const f = useCurrentFrame(), k = K('S06');
  const a1 = useIn(k(1)), a2 = useIn(k(2)), a3 = useIn(k(3)), a4 = ramp(f, k(4), k(4) + 18), a5 = ramp(f, k(5), k(5) + 18);
  const intro = 1 - ramp(f, k(4) - 10, k(4) + 6);
  const zs = 9; // 64×40 を 576×360
  return (
    <Bg>
      <SceneTitle label="できないこと3　色が足りない" color={C.amber} />
      <div style={{opacity: intro}}>
        <PxCrop src={`img/layer_${F}_full.png`} iw={256} ih={240} crop={ZOOM} x={90} y={170} w={64 * zs} o={a1}>
          <Grid cw={8 * zs} ch={zs} o={0.45} lw={1} color="rgba(0,0,0,.6)" />
          <Grid cw={8 * zs} ch={8 * zs} o={0.9} lw={3} color="rgba(255,255,255,.75)" />
        </PxCrop>
        <Txt x={90} y={545} size={30} color={C.sub} o={a1} w={576}>8ドットのかたまりごとに、4色の組を1つ選ぶ</Txt>
        <div style={{position: 'absolute', left: 760, top: 175, opacity: a2}}>
          <div style={{fontSize: 36, fontWeight: 900, marginBottom: 18}}>この画面に出ている色</div>
          <div style={{display: 'flex', gap: 22}}>
            {[[NES.sky, '空の青'], [NES.green, '草の緑'], [NES.gray, '道の灰色'], [NES.red, '赤'], [NES.white, '白']].map(([c, n], i) => (
              <div key={n} style={{textAlign: 'center', opacity: ramp(f, k(2) + i * 8, k(2) + i * 8 + 12)}}>
                <Swatch a={c} size={150} />
                <div style={{fontSize: 28, fontWeight: 800, marginTop: 8}}>{n}</div>
              </div>
            ))}
          </div>
          <div style={{fontSize: 44, fontWeight: 900, color: C.amber, marginTop: 20}}>5色。でも1つの組は4色まで</div>
        </div>
        <PalRow x={760} y={600} title="地面の組" colors={[NES.gray, NES.green, NES.white, NES.red]} o={a3} color={C.green} mark={2} />
        <PalRow x={760} y={730} title="空の行の組" colors={[NES.gray, NES.green, NES.sky, NES.red]} o={ramp(f, k(3) + 50, k(3) + 66)} color={C.cyan} mark={2} />
        <Txt x={1520} y={660} size={30} color={C.amber} o={ramp(f, k(3) + 80, k(3) + 96)} w={360}>{'白のかわりに\n青を入れる'}</Txt>
      </div>
      {/* 8ドットごとの色の組の地図 */}
      <div style={{opacity: a4 * (1 - a5)}}>
        <PxCrop src={`img/layer_${F}_full.png`} iw={256} ih={240} crop={[0, 0, 256, 192]} x={90} y={170} w={768} />
        <PxCrop src={`img/layer_${F}_blocks.png`} iw={256} ih={240} crop={[0, 0, 256, 192]} x={960} y={170} w={768} />
        <div style={{position: 'absolute', left: 960, top: 760, display: 'flex', gap: 16, flexWrap: 'wrap', width: 900}}>
          {[['rgb(70,78,96)', '地面'], ['rgb(150,200,255)', '空'], ['rgb(255,181,71)', '地面＋車や木'], ['rgb(255,91,200)', '空＋車や木']].map(([c, n]) => (
            <div key={n} style={{display: 'flex', alignItems: 'center', gap: 8, fontSize: 26, fontWeight: 800}}><Swatch a={c} size={34} />{n}</div>
          ))}
        </div>
        <Txt x={90} y={760} size={30} color={C.sub} w={800}>カートリッジが8ドットごとに色の組を選ぶ（実際に選んだ組）</Txt>
      </div>
      {/* 16×16 と 8×1 */}
      <div style={{opacity: a5}}>
        {[['本来のファミコン：16×16ドットごと', 16, 16, C.red], ['今回：8×1ドットごと', 8, 1, C.green]].map(([t, w, h, col], i) => (
          <React.Fragment key={String(t)}>
            <PxCrop src={`img/layer_${F}_full.png`} iw={256} ih={240} crop={ZOOM} x={110 + i * 880} y={200} w={64 * 12}>
              <Grid cw={(w as number) * 12} ch={(h as number) * 12} o={0.9} lw={2} color={i ? 'rgba(0,0,0,.45)' : 'rgba(255,255,255,.9)'} />
            </PxCrop>
            <Txt x={110 + i * 880} y={700} size={36} color={col as string} w={768} align="center">{t as string}</Txt>
          </React.Fragment>
        ))}
      </div>
    </Bg>
  );
};

// ---------------- S07 タイリングで色を増やす ----------------
const COLS: [string, string][] = [[NES.red, '赤'], [NES.green, '緑'], [NES.gray, '灰'], [NES.white, '白']];
const PAIRS = [[0, 2], [1, 2], [2, 3], [0, 1], [0, 3], [1, 3]];
export const S07: React.FC = () => {
  const f = useCurrentFrame(), k = K('S07');
  const a0 = useIn(k(0)), a1 = useIn(k(1));
  return (
    <Bg>
      <SceneTitle label="タイリングで色を増やす" color={C.amber} />
      <PxCrop src={`img/layer_${F}_full.png`} iw={256} ih={240} crop={[96, 122, 64, 44]} x={90} y={170} w={64 * 9} o={a0} />
      <Txt x={90} y={590} size={30} color={C.sub} o={a0} w={576}>1つの面を、2色の市松模様で塗る</Txt>
      <div style={{position: 'absolute', left: 760, top: 170, opacity: a1}}>
        <div style={{fontSize: 34, fontWeight: 900, marginBottom: 12}}>単色 4</div>
        <div style={{display: 'flex', gap: 18}}>
          {COLS.map(([c, n]) => <div key={n} style={{textAlign: 'center'}}><Swatch a={c} size={120} /><div style={{fontSize: 26, fontWeight: 800}}>{n}</div></div>)}
        </div>
        <div style={{fontSize: 34, fontWeight: 900, margin: '26px 0 12px'}}>2色の市松模様 6</div>
        <div style={{display: 'flex', gap: 18}}>
          {PAIRS.map(([a, b], i) => (
            <div key={i} style={{textAlign: 'center', opacity: ramp(f, k(1) + i * 10, k(1) + i * 10 + 12)}}>
              <Swatch a={COLS[a][0]} b={COLS[b][0]} size={120} dot={8} />
              <div style={{fontSize: 26, fontWeight: 800}}>{COLS[a][1]}＋{COLS[b][1]}</div>
            </div>
          ))}
        </div>
        <div style={{fontSize: 46, fontWeight: 900, color: C.amber, marginTop: 24, opacity: ramp(f, k(1) + 80, k(1) + 100)}}>4 ＋ 6 ＝ 10通りの色に見える</div>
      </div>
    </Bg>
  );
};
