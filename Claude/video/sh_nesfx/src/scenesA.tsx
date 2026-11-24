import React from 'react';
import {AbsoluteFill, OffthreadVideo, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {Bg, C, FONT, SceneTitle, cueOf, useIn} from './common';
import {Bar, CLIP, Card, Clip, Label, Pic, win} from './parts';

const GAME = {x: 60, y: 112, w: 875, h: 820};  // 256×240 を約3.4倍

// ───────────────── S01 オープニング（実機映像）
export const S01: React.FC = () => {
  const f = useCurrentFrame();
  const t = interpolate(f, [20, 50, 170, 200], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <OffthreadVideo src={staticFile('video/hw.mp4')} trimBefore={CLIP.hwOpen} volume={0.45} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      <AbsoluteFill style={{background: `rgba(0,0,0,${0.55 * t})`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: t, fontFamily: FONT}}>
        <div style={{fontSize: 92, fontWeight: 900, color: '#fff', letterSpacing: 4, textShadow: '0 4px 18px #000'}}>ファミコンで スペースハリアー</div>
        <div style={{marginTop: 22, fontSize: 46, fontWeight: 800, color: C.cyan, textShadow: '0 3px 10px #000'}}>SuperFX ＋ Mode7（FPGAカートリッジ）／ 60fps</div>
      </AbsoluteFill>
      <div style={{position: 'absolute', right: 40, top: 34, padding: '6px 18px', borderRadius: 8, background: 'rgba(0,0,0,.6)', color: '#fff', fontFamily: FONT, fontWeight: 700, fontSize: 26, opacity: 1 - t}}>ファミコン実機（ブラウン管）</div>
    </AbsoluteFill>
  );
};

// ───────────────── S02 ここまでの道のり
const STEPS = [
  {label: 'ファミコン 白黒版', sub: '6502だけで描画・30fps', color: '#d8d8d8'},
  {label: 'スーパーファミコン版', sub: 'SuperFXで敵や木を描画', color: C.violet},
  {label: '前回 FX Racing 3D', sub: 'FPGAカートリッジに SuperFX＋Mode7', color: C.amber},
  {label: '今回', sub: 'ファミコンでカラー・60fps', color: C.green},
];
export const S02: React.FC = () => {
  const f = useCurrentFrame();
  const c = [0, 1, 2, 3, 4].map((i) => cueOf('S02', i));
  const step = f < c[2] ? 0 : f < c[3] ? 1 : f < c[4] ? 2 : 3;
  const o = useIn(c[0] - 10);
  const box = {x: 540, y: 112, w: 1320, h: 820};
  return (
    <Bg>
      <SceneTitle label="ここまでの道のり" />
      {STEPS.map((s, i) => (
        <div key={i} style={{opacity: o}}>
          <Card x={60} y={150 + i * 190} w={440} h={160} color={s.color} title={s.label} sub={s.sub} on={i === step ? 1 : i < step ? 0.45 : 0.15} fs={32} />
        </div>
      ))}
      {step === 0 && <Clip src="video/mono.mp4" from={60 * 20} x={box.x + 222} y={box.y} w={875} h={820} color={STEPS[0].color} volume={0.25} />}
      {step === 1 && <Clip src="video/sfc_color.mp4" from={60 * 40} x={box.x} y={box.y + 40} w={1320} h={742} color={STEPS[1].color} volume={0.25} />}
      {step === 2 && <Clip src="video/fxracing_hw.mp4" from={60 * 30} x={box.x} y={box.y + 40} w={1320} h={742} color={STEPS[2].color} volume={0.25} />}
      {step === 3 && <Clip src="video/main.mp4" from={CLIP.opening} x={box.x + 222} y={box.y} w={875} h={820} color={STEPS[3].color} volume={0.3} />}
    </Bg>
  );
};

// ───────────────── S03 ファミコン本体に残したもの ＋ 8ms の見積もり
const ROLES = [
  {cue: 1, title: '6502（ファミコン本体）', sub: 'ゲームロジック：敵・弾・出現順・当たり判定', color: C.red, thumb: '', lab: ''},
  {cue: 2, title: 'スプライト', sub: '自機と自機の弾', color: C.amber, thumb: 'video/layer_spr.mp4', lab: 'スプライトだけ'},
  {cue: 3, title: 'Mode7相当の回路', sub: '地面：1ラインごとの遠近', color: C.green, thumb: 'video/layer_ground.mp4', lab: '地面と遠景'},
  {cue: 4, title: 'SuperFX相当の回路', sub: '敵・木・敵の弾を拡大縮小 → 背景に合成', color: C.cyan, thumb: 'video/layer_fx.mp4', lab: 'SuperFXの絵（画素の色から抜き出し）'},
];
export const S03: React.FC = () => {
  const f = useCurrentFrame();
  const c = [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => cueOf('S03', i));
  const phase = f < c[5] - 10 ? 0 : f < c[7] - 10 ? 1 : 2;
  const pA = win(f, 0, c[5] - 24);
  const pB = win(f, c[5] - 10, c[7] - 24);
  const pC = win(f, c[7] - 10);
  const logicPulse = f >= c[6] && f < c[7] ? 0.5 + 0.5 * Math.sin((f - c[6]) / 9) : 0;
  const S = 60;  // px per ms
  return (
    <Bg>
      <SceneTitle label={phase === 0 ? 'ファミコン本体に残したもの' : phase === 1 ? '白黒版：6502がすべてを描く（30fps）' : '今回：6502に残る仕事は？'} />
      {phase === 0 && (
        <div style={{opacity: pA}}>
          {(() => {
            const k = f < c[2] - 6 ? -1 : f < c[3] - 6 ? 1 : f < c[4] - 6 ? 2 : f < c[5] - 40 ? 3 : -1;
            const src = k < 0 ? 'video/main.mp4' : ROLES[k].thumb;
            return <Clip key={src} src={src} from={CLIP.layers} {...GAME} color={k < 0 ? C.line : ROLES[k].color} volume={k < 0 ? 0.2 : 0} label={k < 0 ? undefined : ROLES[k].lab} />;
          })()}
          {ROLES.map((r, i) => {
            const active = f >= c[r.cue] - 6 && f < (r.cue < 4 ? c[r.cue + 1] : c[5]) - 6;
            const on = active ? 1 : f >= c[r.cue] - 6 ? 0.55 : 0.12;
            return <Card key={i} x={980} y={112 + i * 207} w={880} h={190} color={r.color} title={r.title} sub={r.sub} on={on} fs={36} />;
          })}
        </div>
      )}
      {phase === 1 && (
        <div style={{opacity: pB}}>
          <Label x={80} y={150} size={34} color={C.sub}>1フレーム ＝ 16.7ms ／ 2フレームで1枚の画面</Label>
          <Label x={80} y={232} size={30}>1フレーム目</Label>
          <Bar x={80} y={280} scale={S} p={interpolate(f, [c[5], c[5] + 50], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} segs={[
            {ms: 1.7, color: '#c050b8', label: '消去'},
            {ms: 2.6, color: '#c050b8', label: '地面・遠景'},
            {ms: 8.0, color: C.green, label: 'ゲームロジック 約8ms'},
          ]} />
          <div style={{position: 'absolute', left: 80 + 4.3 * S, top: 274, width: 8 * S, height: 96, borderRadius: 10, boxShadow: `0 0 ${40 * logicPulse}px ${C.green}`, border: `4px solid rgba(95,227,141,${logicPulse})`}} />
          <Label x={80} y={402} size={30}>2フレーム目</Label>
          <Bar x={80} y={450} scale={S} p={interpolate(f, [c[5] + 40, c[5] + 80], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} segs={[
            {ms: 12.3, color: '#c050b8', label: '敵や木の絵を描く（最大 約12.3ms）'},
          ]} />
          <div style={{position: 'absolute', left: 80 + 16.7 * S, top: 220, width: 4, height: 330, background: C.sub}} />
          <Label x={80 + 16.7 * S - 120} y={560} size={26} color={C.sub} w={240} align="center">16.7ms</Label>
          <Clip src="video/mono.mp4" from={60 * 30} x={1150} y={600} w={330} h={310} color="#d8d8d8" />
          <Label x={1500} y={640} size={30} color={C.sub}>白黒版（以前の解説動画より）</Label>
          <Label x={1500} y={700} size={42} color={C.green} o={logicPulse > 0 || f >= c[6] ? 1 : 0}>ゲームロジック 約8ms</Label>
        </div>
      )}
      {phase === 2 && (
        <div style={{opacity: pC}}>
          <Label x={80} y={150} size={34} color={C.sub}>描画はカートリッジへ。1フレーム ＝ 16.6ms</Label>
          <Label x={80} y={232} size={30}>6502</Label>
          <Bar x={80} y={280} scale={S} p={interpolate(f, [c[7], c[7] + 50], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} segs={[
            {ms: 8.0, color: C.green, label: 'ゲームロジック 約8ms'},
            {ms: 8.6, color: C.cyan, label: '描画データの準備 残り約8ms', dashed: true},
          ]} />
          <Label x={80} y={402} size={30}>カートリッジ</Label>
          <Bar x={80} y={450} scale={S} p={interpolate(f, [c[7] + 30, c[7] + 70], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} segs={[
            {ms: 16.6, color: C.violet, label: 'SuperFX：敵や木を描く ／ Mode7：地面'},
          ]} />
          <div style={{position: 'absolute', left: 80 + 16.6 * S, top: 220, width: 4, height: 330, background: C.amber, opacity: win(f, c[8])}} />
          <Label x={80 + 16.6 * S - 160} y={560} size={30} color={C.amber} w={320} align="center" o={win(f, c[8])}>16.6ms ＝ 1フレーム</Label>
          <div style={{opacity: win(f, c[8] + 60)}}>
            <Card x={300} y={650} w={1320} h={200} color={C.amber} title="8ms ＋ 8ms ≦ 16.6ms なら、毎フレーム更新できる" sub="→ 60fps のはず" fs={44} />
          </div>
        </div>
      )}
    </Bg>
  );
};

// ───────────────── S04 地面と遠景
export const S04: React.FC = () => {
  const f = useCurrentFrame();
  const c = [0, 1, 2, 3].map((i) => cueOf('S04', i));
  const seg = f < c[2] - 6 ? 0 : f < c[3] - 6 ? 1 : 2;
  return (
    <Bg>
      <SceneTitle label="地面と遠景" color={C.green} />
      {seg === 0 && <Clip src="video/main.mp4" from={CLIP.ground} {...GAME} color={C.green} volume={0.2} />}
      {seg === 1 && <Clip src="video/main.mp4" from={CLIP.vertical} {...GAME} color={C.green} volume={0.2} />}
      {seg === 2 && <Clip src="video/horizon.mp4" from={0} x={60} y={250} w={1800} h={450} color={C.green} volume={0.2} />}
      {seg < 2 && (
        <>
          <Card x={980} y={150} w={880} color={C.green} title="Mode7相当の回路" sub="1ラインごとに、地面のどこを読むかを計算" on={1} />
          <div style={{opacity: win(f, c[1])}}>
            <Card x={980} y={360} w={880} color={C.green} title="格子は3色の緑" sub="奥ほど細かく、手前ほど大きく" on={seg === 0 ? 1 : 0.5} />
          </div>
          <div style={{opacity: win(f, c[2])}}>
            <Card x={980} y={570} w={880} color={C.amber} title="上下の移動 ＝ 視点の高さ" sub="地面をずらすのではなく、遠近を計算し直す。地平線と格子の角度が変わる" on={seg === 1 ? 1 : 0.5} />
          </div>
        </>
      )}
      {seg === 2 && (
        <>
          <Label x={80} y={160} size={40}>遠くの山と森：2枚に分けて横スクロール</Label>
          <Card x={300} y={740} w={600} color={C.sub} title="山" sub="× 1 の速さ" on={1} />
          <Card x={1020} y={740} w={600} color={C.green} title="森" sub="× 2 の速さ（山の2倍）" on={1} />
        </>
      )}
    </Bg>
  );
};

// ───────────────── S05 限られた色をどう使うか
const PALS = [
  {name: '空', color: '#c676ff', sub: '空の紫と、空の前の物体', sw: ['#c676ff', '#0b4800', '#adadad']},
  {name: '地面', color: '#5ce430', sub: '地面の緑3色', sw: ['#5ce430', '#388700', '#cfef96']},
  {name: '赤', color: '#b53120', sub: '目・爆発・ボスの弾', sw: ['#b53120', '#0b4800', '#adadad']},
  {name: '黒', color: '#000000', sub: '輪郭や影', sw: ['#000000', '#0b4800', '#adadad']},
];
const Swatch: React.FC<{c: string; label?: string; s?: number; ring?: string}> = ({c, label, s = 70, ring}) => (
  <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4}}>
    <div style={{width: s, height: s, borderRadius: 8, background: c, border: `3px solid ${ring ?? '#ffffff44'}`, boxShadow: ring ? `0 0 18px ${ring}` : 'none'}} />
    {label && <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 24, color: C.text}}>{label}</div>}
  </div>
);
const GALLERY = ['palette_rough_01.png', 'palette_ground_2_vs_3.png', 'SpaceHarrier_NES_4_candidates.png', 'SpaceHarrier_tree_1A_mid_2A_2B_comparison.png', 'fixed_sky_ground_enemy_eye_comparison.png', 'B_v002_comparison.png'];

export const S05: React.FC = () => {
  const f = useCurrentFrame();
  const c = Array.from({length: 11}, (_, i) => cueOf('S05', i));
  const ph = f < c[2] - 8 ? 0 : f < c[4] - 8 ? 1 : f < c[8] - 8 ? 2 : f < c[10] - 8 ? 3 : 4;
  const galleryEnd = c[10] + 200;
  return (
    <Bg>
      <SceneTitle label="限られた色をどう使うか" color={C.violet} />
      {ph === 0 && (
        <div style={{opacity: win(f, c[0])}}>
          <Clip src="video/sfc_color.mp4" from={60 * 55} x={60} y={150} w={1100} h={619} color={C.violet} label="スーパーファミコン版" />
          <Card x={1200} y={150} w={660} color={C.violet} title="2bpp ＝ 透明＋3色" on={1} />
          <Card x={1200} y={330} w={660} color={C.violet} title="色の組をタイルごとに8種類から選ぶ" on={1} fs={30} />
          <Card x={1200} y={510} w={660} color={C.violet} title="CPUが奥から順にタイルの色を上書き" on={1} fs={30} />
        </div>
      )}
      {ph === 1 && (
        <div style={{opacity: win(f, c[2] - 8)}}>
          <Label x={80} y={150} size={40}>ファミコンの背景も 2bpp（透明＋3色）。パレットは4本</Label>
          {PALS.map((p, i) => {
            const on = win(f, c[2] + 50 + i * 12);
            return (
              <div key={i} style={{position: 'absolute', left: 80 + i * 450, top: 280, width: 420, opacity: on, fontFamily: FONT}}>
                <div style={{fontSize: 56, fontWeight: 900, color: p.color === '#000000' ? '#ddd' : p.color}}>{p.name}</div>
                <div style={{fontSize: 28, fontWeight: 700, color: C.sub, margin: '8px 0 18px'}}>{p.sub}</div>
                <div style={{display: 'flex', gap: 14}}>{p.sw.map((s, k) => <Swatch key={k} c={s} s={90} />)}</div>
              </div>
            );
          })}
          <Label x={80} y={620} size={26} color={C.sub} o={win(f, c[3] + 40)}>色見本は代表色（各パレットの中身すべてではありません）</Label>
        </div>
      )}
      {ph === 2 && (
        <div style={{opacity: win(f, c[4] - 8)}}>
          <Pic src="img/pal81.png" x={60} y={130} w={1100} h={800} color={C.violet} label="説明用：画面の色から選択を推定して色分け" />
          <Card x={1200} y={130} w={660} color={C.violet} title="単位は 8×1" sub="横8ドット × 縦1ライン ごとにパレットを選ぶ" on={f < c[5] - 6 ? 1 : 0.5} fs={32} />
          <div style={{opacity: win(f, c[5])}}><Card x={1200} y={330} w={660} color={'#c676ff'} title="背景が見えるなら背景を優先" sub="透明から空や地面がのぞく 8×1 は、空・地面のパレット" on={f < c[6] - 6 ? 1 : 0.5} fs={32} /></div>
          <div style={{opacity: win(f, c[6])}}><Card x={1200} y={530} w={660} color={'#e0503c'} title="赤：目" sub="爆発とボスの弾も同じ赤" on={f < c[7] - 6 ? 1 : 0.5} fs={32} /></div>
          <div style={{opacity: win(f, c[7])}}><Card x={1200} y={700} w={660} color={'#aaaaaa'} title="黒：輪郭や影" sub="背景を優先した 8×1 では暗い緑で代用" on={1} fs={32} /></div>
        </div>
      )}
      {ph === 3 && <SharedColor before c8={c[8]} />}
      {ph === 4 && (f < galleryEnd ? <Gallery start={c[10]} end={galleryEnd} /> : <SharedColor before={false} c8={galleryEnd} />)}
    </Bg>
  );
};

const Gallery: React.FC<{start: number; end: number}> = ({start, end}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [start - 8, start + 6, end - 12, end], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div style={{opacity: o}}>
      <Label x={80} y={130} size={36}>配色の比較（開発中に作った比較画像）</Label>
      {GALLERY.map((g, i) => {
        const a = interpolate(f, [start + i * 22, start + i * 22 + 14], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
        const col = i % 3, row = Math.floor(i / 3);
        return <Pic key={g} src={`img/${g}`} x={60 + col * 610} y={190 + row * 380} w={590} h={365} color={C.line} style={{opacity: a, transform: `scale(${0.9 + 0.1 * a})`}} />;
      })}
    </div>
  );
};

const SharedColor: React.FC<{before: boolean; c8: number}> = ({before, c8}) => {
  const f = useCurrentFrame();
  const o = win(f, c8 - 8);
  const rows = before
    ? [{n: '空', s: ['#0b4800', '#c676ff', '…', '…'], k: ['暗緑', '紫', '', '']}, {n: '地面', s: ['#0b4800', '#5ce430', '#388700', '#cfef96'], k: ['暗緑', '', '', '']}, {n: '赤', s: ['#0b4800', '…', '…', '#b53120'], k: ['暗緑', '', '', '赤']}, {n: '黒', s: ['#0b4800', '…', '…', '#000000'], k: ['暗緑', '', '', '黒']}]
    : [{n: '空', s: ['#fffeff', '#c676ff', '#0b4800', '…'], k: ['白', '紫', '$09', '']}, {n: '地面', s: ['#fffeff', '#5ce430', '#388700', '#cfef96'], k: ['白', '', '$19', '']}, {n: '赤', s: ['#fffeff', '…', '…', '#b53120'], k: ['白', '', '', '赤']}, {n: '黒', s: ['#fffeff', '…', '…', '#000000'], k: ['白', '', '', '黒']}];
  return (
    <div style={{opacity: o}}>
      <Label x={80} y={140} size={40}>{before ? 'パレットの0番は、4本すべてで共通の1色' : '共通の色を白に → 暗い緑を各パレットへ'}</Label>
      <div style={{position: 'absolute', left: 80, top: 230, display: 'flex', flexDirection: 'column', gap: 26}}>
        {rows.map((r) => (
          <div key={r.n} style={{display: 'flex', alignItems: 'center', gap: 22}}>
            <div style={{width: 110, fontFamily: FONT, fontWeight: 900, fontSize: 40}}>{r.n}</div>
            {r.s.map((s, k) => (
              <div key={k} style={{width: 150, height: 120, borderRadius: 10, background: s === '…' ? 'transparent' : s, border: k === 0 ? `5px solid ${C.amber}` : '3px solid #ffffff33', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', boxSizing: 'border-box'}}>
                <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 26, color: s === '#fffeff' || s === '#cfef96' || s === '#5ce430' ? '#111' : '#fff', marginBottom: 6}}>{s === '…' ? '…' : r.k[k]}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
      <Label x={250} y={830} size={28} color={C.amber}>↑ 0番（共通）</Label>
      <div style={{position: 'absolute', left: 1020, top: 260, width: 840}}>
        {before ? (
          <Card x={0} y={0} w={840} color={C.amber} title="暗い緑を共通の色にすると" sub="空の前でも地面の前でも、同じ暗い緑しか使えない" on={1} fs={36} />
        ) : (
          <>
            <Card x={0} y={0} w={840} color={C.amber} title="共通の色 ＝ 白" sub="暗い緑は各パレットの枠へ" on={1} fs={36} />
            <div style={{position: 'absolute', left: 0, top: 220, display: 'flex', gap: 60}}>
              <Swatch c="#0b4800" label="空側 $09" s={170} />
              <Swatch c="#388700" label="地面側 $19" s={170} />
            </div>
          </>
        )}
      </div>
      <Label x={1020} y={760} size={24} color={C.sub} w={840}>模式図。「…」は省略した色</Label>
    </div>
  );
};
