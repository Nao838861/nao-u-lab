import React from 'react';
import {AbsoluteFill, OffthreadVideo, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {Bg, C, FONT, SceneTitle, cueOf} from './common';
import {Bar, CLIP, Card, Clip, Label, Pic, win} from './parts';

const GAME = {x: 60, y: 112, w: 875, h: 820};  // 256×240 を約3.4倍

// ───────────────── S01 オープニング：実機 → 白黒版と今回を並べる
export const S01: React.FC = () => {
  const f = useCurrentFrame();
  const c = [0, 1, 2].map((i) => cueOf('S01', i));
  const t = interpolate(f, [20, 50, 140, 170], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const cmp = win(f, c[2] - 6);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <OffthreadVideo src={staticFile('video/hw.mp4')} trimBefore={CLIP.hwOpen} volume={(fr) => (fr < c[2] ? 0.45 : 0)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      <AbsoluteFill style={{background: `rgba(0,0,0,${0.55 * t})`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: t, fontFamily: FONT}}>
        <div style={{fontSize: 92, fontWeight: 900, color: '#fff', letterSpacing: 4, textShadow: '0 4px 18px #000'}}>ファミコンで スペースハリアー</div>
        <div style={{marginTop: 22, fontSize: 46, fontWeight: 800, color: C.cyan, textShadow: '0 3px 10px #000'}}>SuperFX ＋ Mode7（FPGAカートリッジ）／ 60fps</div>
      </AbsoluteFill>
      <div style={{position: 'absolute', right: 40, top: 34, padding: '6px 18px', borderRadius: 8, background: 'rgba(0,0,0,.6)', color: '#fff', fontFamily: FONT, fontWeight: 700, fontSize: 26, opacity: (1 - t) * (1 - cmp)}}>ファミコン実機（ブラウン管）</div>
      {f >= c[2] - 6 && (
        <AbsoluteFill style={{opacity: cmp}}>
          <Bg>
            <Clip src="video/mono.mp4" from={60 * 30} x={60} y={112} w={875} h={820} color="#d8d8d8" label="以前：白黒・30コマ" volume={0} />
            <Clip src="video/main.mp4" from={CLIP.opening} x={985} y={112} w={875} h={820} color={C.green} label="今回：カラー・60コマ" volume={0.35} />
          </Bg>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

// ───────────────── S02 白黒版からの道のり
const STEPS = [
  {label: 'ファミコン 白黒版', sub: '6502だけで描画・30fps', color: '#d8d8d8'},
  {label: 'スーパーファミコン版', sub: 'SuperFXで敵や木を描画', color: C.violet},
  {label: '前回 FX Racing 3D', sub: 'FPGAカートリッジに SuperFX＋Mode7', color: C.amber},
  {label: '今回', sub: 'ファミコンでカラー・60fps', color: C.green},
];
export const S02: React.FC = () => {
  const f = useCurrentFrame();
  const c = [0, 1, 2, 3].map((i) => cueOf('S02', i));
  const step = f < c[1] - 6 ? 0 : f < c[2] - 6 ? 1 : f < c[3] - 6 ? 2 : 3;
  const box = {x: 540, y: 112};
  return (
    <Bg>
      <SceneTitle label="白黒版からの道のり" />
      {STEPS.map((s, i) => (
        <Card key={i} x={60} y={150 + i * 190} w={440} h={160} color={s.color} title={s.label} sub={s.sub} on={i === step ? 1 : i < step ? 0.45 : 0.15} fs={32} />
      ))}
      {step === 0 && <Clip src="video/mono.mp4" from={60 * 20} x={box.x + 222} y={box.y} w={875} h={820} color={STEPS[0].color} volume={0.25} />}
      {step === 1 && <Clip src="video/sfc_color.mp4" from={60 * 40} x={box.x} y={box.y + 40} w={1320} h={742} color={STEPS[1].color} volume={0.25} />}
      {step === 2 && <Clip src="video/fxracing_hw.mp4" from={60 * 30} x={box.x} y={box.y + 40} w={1320} h={742} color={STEPS[2].color} volume={0.25} />}
      {step === 3 && <Clip src="video/main.mp4" from={CLIP.opening + 600} x={box.x + 222} y={box.y} w={875} h={820} color={STEPS[3].color} volume={0.3} />}
    </Bg>
  );
};

// ───────────────── S03 ファミコン本体に残したもの ＋ 8ms の見積もり
const ROLES = [
  {title: '6502（ファミコン本体）', sub: 'ゲームロジック：敵の動き・弾・出現順・当たり判定', color: C.red, layer: '', lab: ''},
  {title: 'スプライト', sub: '自機と自機の弾', color: C.amber, layer: 'video/layer_spr.mp4', lab: 'スプライトだけ'},
  {title: 'Mode7相当の回路', sub: '地面：1ラインごとの遠近', color: C.green, layer: 'video/layer_ground.mp4', lab: '地面と遠景'},
  {title: 'SuperFX相当の回路', sub: '敵・木・敵の弾を拡大縮小 → 背景に合成', color: C.cyan, layer: 'video/layer_fx.mp4', lab: 'SuperFXの絵（画素の色から抜き出し）'},
];
export const S03: React.FC = () => {
  const f = useCurrentFrame();
  const c = [0, 1, 2, 3, 4, 5].map((i) => cueOf('S03', i));
  const phase = f < c[4] - 10 ? 0 : f < c[5] - 10 ? 1 : 2;
  const k = f < c[1] - 6 ? 0 : f < c[2] - 6 ? 1 : f < c[3] - 6 ? 2 : f < c[4] - 60 ? 3 : 0;
  const logicPulse = phase === 1 && f >= c[4] + 60 ? 0.5 + 0.5 * Math.sin((f - c[4]) / 9) : 0;
  const S = 60;  // px per ms
  return (
    <Bg>
      <SceneTitle label={phase === 0 ? 'ファミコン本体に残したもの' : phase === 1 ? '白黒版：6502がすべてを描く（30fps）' : '今回：描画はカートリッジへ'} />
      {phase === 0 && (
        <div style={{opacity: win(f, 0, c[4] - 24)}}>
          <Clip key={k} src={k === 0 ? 'video/main.mp4' : ROLES[k].layer} from={CLIP.layers} {...GAME} color={k === 0 ? C.line : ROLES[k].color} volume={k === 0 ? 0.2 : 0} label={k === 0 ? undefined : ROLES[k].lab} />
          {ROLES.map((r, i) => <Card key={i} x={980} y={112 + i * 207} w={880} h={190} color={r.color} title={r.title} sub={r.sub} on={i === k && f < c[4] - 60 ? 1 : f >= c[i] - 6 ? 0.55 : 0.12} fs={36} />)}
        </div>
      )}
      {phase === 1 && (
        <div style={{opacity: win(f, c[4] - 10, c[5] - 24)}}>
          <Label x={80} y={150} size={34} color={C.sub}>1フレーム ＝ 16.7ms ／ 2フレームで1枚の画面（以前の解説動画の図より）</Label>
          <Label x={80} y={232} size={30}>1フレーム目</Label>
          <Bar x={80} y={280} scale={S} p={interpolate(f, [c[4], c[4] + 50], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} segs={[
            {ms: 1.7, color: '#c050b8', label: '消去'},
            {ms: 2.6, color: '#c050b8', label: '地面・遠景'},
            {ms: 8.0, color: C.green, label: 'ゲームロジック 約8ms'},
          ]} />
          <div style={{position: 'absolute', left: 80 + 4.3 * S, top: 274, width: 8 * S, height: 96, borderRadius: 10, boxShadow: `0 0 ${40 * logicPulse}px ${C.green}`, border: `4px solid rgba(95,227,141,${logicPulse})`}} />
          <Label x={80} y={402} size={30}>2フレーム目</Label>
          <Bar x={80} y={450} scale={S} p={interpolate(f, [c[4] + 40, c[4] + 80], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} segs={[
            {ms: 12.3, color: '#c050b8', label: '敵や木の絵を描く（最大 約12.3ms）'},
          ]} />
          <div style={{position: 'absolute', left: 80 + 16.7 * S, top: 220, width: 4, height: 330, background: C.sub}} />
          <Label x={80 + 16.7 * S - 120} y={560} size={26} color={C.sub} w={240} align="center">16.7ms</Label>
          <Clip src="video/mono.mp4" from={60 * 30} x={1150} y={600} w={330} h={310} color="#d8d8d8" />
          <Label x={1500} y={640} size={30} color={C.sub}>白黒版</Label>
          <Label x={1500} y={700} size={42} color={C.green} o={logicPulse > 0 ? 1 : 0}>ゲームロジック 約8ms</Label>
          <Label x={80} y={640} size={34} color={'#e090d8'} o={win(f, c[4] + 200)} w={1000}>残りの時間は、全部「絵を描く」ため</Label>
        </div>
      )}
      {phase === 2 && (
        <div style={{opacity: win(f, c[5] - 10)}}>
          <Label x={80} y={150} size={34} color={C.sub}>1フレーム ＝ 16.6ms</Label>
          <Label x={80} y={232} size={30}>6502</Label>
          <Bar x={80} y={280} scale={S} p={interpolate(f, [c[5], c[5] + 50], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} segs={[
            {ms: 8.0, color: C.green, label: 'ゲームロジック 約8ms'},
            {ms: 8.6, color: C.cyan, label: '描画データの準備 残り約8ms', dashed: true},
          ]} />
          <Label x={80} y={402} size={30}>カートリッジ</Label>
          <Bar x={80} y={450} scale={S} p={interpolate(f, [c[5] + 30, c[5] + 70], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} segs={[
            {ms: 16.6, color: C.violet, label: 'SuperFX：敵や木を描く ／ Mode7：地面'},
          ]} />
          <div style={{position: 'absolute', left: 80 + 16.6 * S, top: 220, width: 4, height: 330, background: C.amber, opacity: win(f, c[5] + 60)}} />
          <div style={{opacity: win(f, c[5] + 220)}}>
            <Card x={300} y={650} w={1320} h={200} color={C.amber} title="8ms ＋ 8ms ≦ 16.6ms なら、毎フレーム更新できる" sub="→ 計算上は 60fps" fs={44} />
          </div>
        </div>
      )}
    </Bg>
  );
};

// ───────────────── S04 地面と遠景
export const S04: React.FC = () => {
  const f = useCurrentFrame();
  const c = [0, 1, 2].map((i) => cueOf('S04', i));
  const seg = f < c[1] - 6 ? 0 : f < c[2] - 6 ? 1 : 2;
  return (
    <Bg>
      <SceneTitle label="地面と遠景" color={C.green} />
      {seg === 0 && <Clip src="video/main.mp4" from={CLIP.ground} {...GAME} color={C.green} volume={0.2} />}
      {seg === 1 && <Clip src="video/main.mp4" from={CLIP.vertical} {...GAME} color={C.green} volume={0.2} />}
      {seg === 2 && <Clip src="video/horizon.mp4" from={0} x={60} y={250} w={1800} h={450} color={C.green} volume={0.2} />}
      {seg < 2 && (
        <>
          <Card x={980} y={150} w={880} color={C.green} title="Mode7相当の回路" sub="1ラインごとに、テクスチャのどこを読むかを計算" on={seg === 0 ? 1 : 0.5} />
          <div style={{opacity: win(f, c[1])}}>
            <Card x={980} y={380} w={880} color={C.amber} title="上下の移動 ＝ 視点の高さ" sub="地面をずらすのではなく、遠近を計算し直す。地平線と格子の角度が変わる" on={seg === 1 ? 1 : 0.5} />
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
  {name: '空', color: '#c676ff', sub: '空と、空の前の物体'},
  {name: '地面', color: '#5ce430', sub: '地面と、地面の前の物体'},
  {name: '赤', color: '#e0503c', sub: '目・爆発・ボスの弾'},
  {name: '黒', color: '#dddddd', sub: '輪郭や影'},
];
const Swatch: React.FC<{c: string; label?: string; s?: number}> = ({c, label, s = 70}) => (
  <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6}}>
    <div style={{width: s, height: s, borderRadius: 8, background: c, border: '3px solid #ffffff44'}} />
    {label && <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 28, color: C.text}}>{label}</div>}
  </div>
);

export const S05: React.FC = () => {
  const f = useCurrentFrame();
  const c = Array.from({length: 7}, (_, i) => cueOf('S05', i));
  const ph = f < c[1] - 8 ? 0 : f < c[3] - 8 ? 1 : f < c[4] - 8 ? 2 : f < c[5] - 8 ? 3 : f < c[6] - 8 ? 4 : 5;
  return (
    <Bg>
      <SceneTitle label="限られた色をどう使うか" color={C.violet} />
      {ph === 0 && (
        <div style={{opacity: win(f, 0)}}>
          <Clip src="video/sfc_color.mp4" from={60 * 55} x={60} y={150} w={1100} h={619} color={C.violet} label="スーパーファミコン版" />
          <Card x={1200} y={150} w={660} color={C.violet} title="2bpp ＝ 透明＋3色" on={1} />
          <Card x={1200} y={330} w={660} color={C.violet} title="色の組をタイルごとに8種類から選ぶ" on={1} fs={30} />
        </div>
      )}
      {ph === 1 && (
        <div style={{opacity: win(f, c[1] - 8)}}>
          <Pic src="img/attr16.png" x={60} y={130} w={1100} h={800} color={C.violet} />
          {/* 1文目は「普通は16×16」だけを見せ、8×1 の側は2文目で明るくする */}
          <div style={{position: 'absolute', left: 60 + 568, top: 130 + 20, width: 560, height: 480, background: 'rgba(10,15,30,.85)', opacity: 1 - win(f, c[2] - 6)}} />
          <Card x={1200} y={130} w={660} color={C.amber} title="背景も 2bpp、パレットは4本" sub="普通は 16×16ドットごとにしか切り替えられない" on={f < c[2] - 6 ? 1 : 0.5} fs={32} />
          <div style={{opacity: win(f, c[2])}}><Card x={1200} y={380} w={660} color={C.cyan} title="今回の回路：8×1ドットごと" sub="横8ドット × 縦1ライン。32倍細かい" on={1} fs={36} /></div>
        </div>
      )}
      {ph === 2 && (
        <div style={{opacity: win(f, c[3] - 8)}}>
          <Pic src="img/pal81.png" x={60} y={130} w={1100} h={800} color={C.violet} label="説明用：画面の色から選択を推定して色分け" />
          {PALS.map((p, i) => (
            <div key={p.name} style={{opacity: win(f, c[3] + i * 14)}}>
              <div style={{position: 'absolute', left: 1210, top: 150 + i * 120, display: 'flex', alignItems: 'center', gap: 20, fontFamily: FONT}}>
                <Swatch c={p.color} s={64} />
                <div><div style={{fontSize: 40, fontWeight: 900, color: C.text}}>{p.name}</div><div style={{fontSize: 24, fontWeight: 700, color: C.sub}}>{p.sub}</div></div>
              </div>
            </div>
          ))}
          <div style={{opacity: win(f, c[3] + 150)}}><Card x={1200} y={660} w={660} color={C.violet} title="背景がのぞく所は背景を優先" sub="それ以外の所で、赤い目や黒い輪郭を出す" on={1} fs={30} /></div>
        </div>
      )}
      {ph === 3 && <SharedColor before c8={c[4]} />}
      {ph === 4 && <SharedColor before={false} c8={c[5]} />}
      {ph === 5 && (
        <div style={{opacity: win(f, c[6] - 8)}}>
          <Pic src="img/darkgreen.png" x={320} y={140} w={1280} h={853} color={C.violet} label="地平線をまたぐ木（実際の画面）" />
        </div>
      )}
    </Bg>
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
      <Label x={80} y={140} size={40}>{before ? 'パレットの0番は、4本すべてで共通の1色' : '共通の色を、画面に出ない白に'}</Label>
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
            <Card x={0} y={0} w={840} color={C.amber} title="白は画面に出てこない" sub="空いた枠に暗い緑を入れ直す" on={1} fs={36} />
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
