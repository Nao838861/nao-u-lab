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
