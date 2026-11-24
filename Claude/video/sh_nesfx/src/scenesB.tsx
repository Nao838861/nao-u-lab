import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {Bg, C, FONT, SceneTitle, cueOf, sceneFrames} from './common';
import {Bar, CLIP, Card, Clip, Label, win} from './parts';

const GAME = {x: 60, y: 112, w: 875, h: 820};

// ───────────────── S06 30コマから60コマへ
const Ticks: React.FC<{y: number; label: string; every: number; color: string; o: number; f: number}> = ({y, label, every, color, o, f}) => (
  <div style={{position: 'absolute', left: 80, top: y, opacity: o}}>
    <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 34, color, marginBottom: 14}}>{label}</div>
    <div style={{display: 'flex', gap: 14}}>
      {Array.from({length: 16}, (_, i) => {
        const logic = i % every === 0;
        const now = Math.floor(f / 12) % 16 === i;
        return (
          <div key={i} style={{width: 92, height: 92, borderRadius: 10, boxSizing: 'border-box', border: `3px solid ${color}`, background: logic ? `${color}cc` : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 22, color: logic ? '#06101e' : color, transform: now ? 'translateY(-8px)' : 'none'}}>
            {logic ? '更新' : '補間'}
          </div>
        );
      })}
    </div>
  </div>
);

const StepChart: React.FC<{x: number; y: number; w: number; h: number; steps: number; color: string; label: string; p: number}> = ({x, y, w, h, steps, color, label, p}) => {
  // 奥行き 0..1 を steps 段階に丸めた大きさ（遠近：手前ほど急に大きくなる）
  const N = 400;
  const size = (z: number) => 1 / (0.18 + 0.82 * z);
  const smax = size(0), smin = size(1);
  const pts: string[] = [];
  // 手前側（奥行き 0〜0.3）だけを拡大して見せる
  const Z = 0.3;
  const lo = size(Z), hi = smax;
  for (let i = 0; i <= N * p; i++) {
    const z = Z * (1 - i / N);
    const q = Math.min(steps - 1, Math.floor(z * steps)) / (steps - 1);
    const s = (size(q) - lo) / (hi - lo);
    pts.push(`${x + (i / N) * w},${y + h - Math.max(0, s) * h}`);
  }
  return (
    <svg style={{position: 'absolute', left: 0, top: 0}} width={1920} height={1080}>
      <rect x={x} y={y} width={w} height={h} fill="#0d1428" stroke={C.line} strokeWidth={2} />
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth={4} />
      <text x={x + 14} y={y + 44} fill={color} fontFamily={FONT} fontWeight={800} fontSize={36}>{label}</text>
      <text x={x + w - 10} y={y + h + 40} fill={C.sub} fontFamily={FONT} fontWeight={700} fontSize={26} textAnchor="end">手前 →</text>
      <text x={x} y={y + h + 40} fill={C.sub} fontFamily={FONT} fontWeight={700} fontSize={26}>やや奥</text>
      <text x={x - 12} y={y + 30} fill={C.sub} fontFamily={FONT} fontWeight={700} fontSize={26} textAnchor="end">大</text>
    </svg>
  );
};

export const S06: React.FC = () => {
  const f = useCurrentFrame();
  const c = Array.from({length: 7}, (_, i) => cueOf('S06', i));
  const ph = f < c[3] - 8 ? 0 : f < c[4] - 8 ? 1 : f < c[6] - 8 ? 2 : 3;
  return (
    <Bg>
      <SceneTitle label="30コマから60コマへ" color={C.amber} />
      {ph === 0 && (
        <>
          <Ticks y={170} label="最初の版：ゲームロジック 30Hz ＋ 補間して60コマ表示" every={2} color={C.sub} o={win(f, c[0])} f={f} />
          <Label x={80} y={420} size={32} color={C.sub} o={win(f, c[1])}>入力への反応・敵の動きは 30コマ単位</Label>
          <Ticks y={540} label="ゲームロジックそのものを 60Hz に" every={1} color={C.amber} o={win(f, c[2])} f={f} />
          <Label x={80} y={790} size={32} color={C.amber} o={win(f, c[2] + 90)}>自機・敵・弾・ボス・当たり判定を毎フレーム。1回の移動量は半分、速さは元のまま</Label>
        </>
      )}
      {ph === 1 && (
        <div style={{opacity: win(f, c[3] - 8)}}>
          <Clip src="video/cmp30.mp4" from={0} x={60} y={150} w={875} h={820} color={C.sub} label="30コマ（説明用に間引き）" />
          <Clip src="video/main.mp4" from={CLIP.trees} x={985} y={150} w={875} h={820} color={C.amber} label="60コマ" />
        </div>
      )}
      {ph === 2 && (
        <div style={{opacity: win(f, c[4] - 8)}}>
          <Label x={80} y={140} size={36}>木や草の大きさの表（模式図・手前側を拡大）</Label>
          <StepChart x={140} y={240} w={780} h={520} steps={56} color={C.red} label="56段階（間引かれていた）" p={interpolate(f, [c[4], c[4] + 60], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />
          <div style={{opacity: win(f, c[5])}}>
            <StepChart x={1060} y={240} w={780} h={520} steps={111} color={C.green} label="111段階（SFC版と同じ）" p={interpolate(f, [c[5], c[5] + 60], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />
          </div>
          <Label x={1060} y={840} size={30} color={C.green} o={win(f, c[5] + 90)}>ボスや敵の弾：16段階 → 細かく</Label>
        </div>
      )}
      {ph === 3 && (
        <div style={{opacity: win(f, c[6] - 8)}}>
          <Clip src="video/trees.mp4" from={0} x={60} y={150} w={1100} h={760} color={C.green} />
          <Card x={1200} y={200} w={660} color={C.green} title="根元の位置" sub="地面と同じ投影の式で計算する" on={1} />
          <Card x={1200} y={420} w={660} color={C.green} title="地面の上で波打たない" sub="大きさと根元の位置を一緒に補正" on={1} />
        </div>
      )}
    </Bg>
  );
};

// ───────────────── S07 60コマに収める
const Lane: React.FC<{y: number; name: string; color: string; items: string[]; shift: number; o: number}> = ({y, name, color, items, shift, o}) => (
  <div style={{position: 'absolute', left: 80, top: y, opacity: o}}>
    <div style={{position: 'absolute', left: 0, top: 18, width: 220, fontFamily: FONT, fontWeight: 900, fontSize: 34, color}}>{name}</div>
    {items.map((t, i) => (
      <div key={i} style={{position: 'absolute', left: 250 + (i + shift) * 390, top: 0, width: 370, height: 84, borderRadius: 10, background: `${color}33`, border: `3px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 28, color: '#fff'}}>{t}</div>
    ))}
  </div>
);

const FPS_STEPS = [57.95, 58.73, 58.98, 59.37, 59.55, 59.73, 59.9];
const DROP_STEPS = [205, 131, null, 72, 52, 35, 17];

export const S07: React.FC = () => {
  const f = useCurrentFrame();
  const c = Array.from({length: 7}, (_, i) => cueOf('S07', i));
  const ph = f < c[2] - 8 ? 0 : f < c[4] - 8 ? 1 : f < c[5] - 8 ? 2 : f < c[6] - 8 ? 3 : 4;
  const S = 56;
  return (
    <Bg>
      {ph < 4 && <SceneTitle label="60コマに収める" color={C.red} />}
      {ph === 0 && (
        <div style={{opacity: win(f, c[0])}}>
          <Label x={80} y={150} size={36}>描画を1フレーム遅らせて、6502とSuperFXを並列に</Label>
          {[0, 1, 2, 3].map((i) => <Label key={i} x={330 + i * 390} y={250} size={28} color={C.sub} w={370} align="center">フレーム {i + 1}</Label>)}
          <Lane y={310} name="6502" color={C.green} items={['2コマ目の準備', '3コマ目の準備', '4コマ目の準備', '5コマ目の準備']} shift={0} o={1} />
          <Lane y={440} name="SuperFX" color={C.cyan} items={['1コマ目を描く', '2コマ目を描く', '3コマ目を描く', '4コマ目を描く']} shift={0} o={win(f, c[1] + 40)} />
          <Lane y={570} name="画面" color={C.amber} items={['…', '1コマ目を表示', '2コマ目を表示', '3コマ目を表示']} shift={0} o={win(f, c[1] + 80)} />
        </div>
      )}
      {ph === 1 && (
        <div style={{opacity: win(f, c[2] - 8)}}>
          <Label x={80} y={150} size={36}>敵が多い場面の実測（専用Mesen）</Label>
          <Label x={80} y={240} size={30}>6502</Label>
          <Bar x={80} y={290} scale={S} p={interpolate(f, [c[2] + 20, c[2] + 120], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} segs={[
            {ms: 6.15, color: C.green, label: 'ゲームロジック 約6.2ms'},
            {ms: 11.3, color: C.cyan, label: '描画データの準備 約11.3ms'},
          ]} />
          <div style={{position: 'absolute', left: 80 + 16.64 * S, top: 230, width: 5, height: 360, background: C.red}} />
          <Label x={80 + 16.64 * S - 100} y={190} size={30} color={C.red} w={200} align="center">16.64ms</Label>
          <Label x={80 + 17.45 * S + 24} y={300} size={34} color={C.red} o={win(f, c[2] + 120)}>合計 約17.5ms → 超えている</Label>
          <div style={{opacity: win(f, c[3])}}>
            <Label x={80} y={420} size={30}>SuperFX</Label>
            <Bar x={80} y={470} scale={S} segs={[{ms: 4.01, color: C.violet, label: '平均 約4ms'}]} />
            <Card x={500} y={640} w={1000} color={C.red} title="足りないのは 6502 の時間" sub="SuperFXの描画には余裕がある" on={1} fs={40} />
          </div>
        </div>
      )}
      {ph === 2 && (
        <div style={{opacity: win(f, c[4] - 8)}}>
          <Label x={80} y={150} size={36}>見た目と動きを変えずに、6502の処理を削る</Label>
          {['敵の更新', '描画データの作り方', '転送', 'スプライトのコピー'].map((t, i) => (
            <div key={t} style={{opacity: win(f, c[4] + i * 30)}}><Card x={160 + (i % 2) * 820} y={270 + Math.floor(i / 2) * 230} w={760} h={190} color={C.cyan} title={t} on={1} fs={44} /></div>
          ))}
        </div>
      )}
      {ph === 3 && <FpsChart start={c[5]} />}
      {ph === 4 && (
        <AbsoluteFill style={{opacity: win(f, c[6] - 8)}}>
          <OffthreadVideo src={staticFile('video/hw.mp4')} trimBefore={CLIP.hwEnd} volume={0.4} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          <div style={{position: 'absolute', left: 50, top: 40, padding: '10px 26px', borderRadius: 12, background: 'rgba(0,0,0,.7)', fontFamily: FONT, fontWeight: 900, fontSize: 48, color: C.green, border: `3px solid ${C.green}`}}>実機 60fps</div>
        </AbsoluteFill>
      )}
    </Bg>
  );
};

const FpsChart: React.FC<{start: number}> = ({start}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [start, start + 150], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const n = FPS_STEPS.length;
  const X = (i: number) => 220 + i * 230, Yf = (v: number) => 640 - (v - 57.5) / 2.6 * 420;
  const Yd = (v: number) => 640 - v / 260 * 380;
  const vis = Math.max(1, Math.floor(p * n + 0.999));
  return (
    <div style={{opacity: win(f, start - 8)}}>
      <Label x={80} y={140} size={36}>同じ100秒のプレイ（専用Mesen）</Label>
      <svg style={{position: 'absolute', left: 0, top: 0}} width={1920} height={1080}>
        <line x1={200} y1={640} x2={1680} y2={640} stroke={C.line} strokeWidth={2} />
        <line x1={200} y1={Yf(60)} x2={1680} y2={Yf(60)} stroke={C.green} strokeDasharray="10 8" strokeWidth={2} />
        <text x={1690} y={Yf(60) + 10} fill={C.green} fontFamily={FONT} fontWeight={800} fontSize={28}>60</text>
        {DROP_STEPS.slice(0, vis).map((d, i) => d === null ? null : <rect key={i} x={X(i) - 40} y={Yd(d)} width={80} height={640 - Yd(d)} fill={`${C.red}66`} stroke={C.red} />)}
        <polyline points={FPS_STEPS.slice(0, vis).map((v, i) => `${X(i)},${Yf(v)}`).join(' ')} fill="none" stroke={C.green} strokeWidth={6} />
        {FPS_STEPS.slice(0, vis).map((v, i) => <circle key={i} cx={X(i)} cy={Yf(v)} r={10} fill={C.green} />)}
      </svg>
      <Label x={X(0) - 120} y={Yf(57.95) - 70} size={40} color={C.green} w={240} align="center">57.95</Label>
      <Label x={X(n - 1) - 120} y={Yf(59.9) - 80} size={48} color={C.green} w={240} align="center" o={p >= 1 ? 1 : 0}>59.90</Label>
      <Label x={X(0) - 120} y={Yd(205) - 50} size={34} color={C.red} w={240} align="center">205回</Label>
      <Label x={X(n - 1) - 120} y={Yd(17) - 50} size={34} color={C.red} w={240} align="center" o={p >= 1 ? 1 : 0}>17回</Label>
      <div style={{position: 'absolute', left: 200, top: 700, display: 'flex', gap: 50, fontFamily: FONT, fontWeight: 800, fontSize: 30}}>
        <span style={{color: C.green}}>● 平均コマ数（fps）</span><span style={{color: C.red}}>■ 間に合わなかったコマ</span>
      </div>
    </div>
  );
};

// ───────────────── S08 音
export const S08: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Bg>
      <SceneTitle label="音" color={C.violet} />
      <Clip src="video/main.mp4" from={CLIP.sound} {...GAME} color={C.violet} volume={(fr) => interpolate(fr, [0, 20, sceneFrames('S08') - 40, sceneFrames('S08')], [0, 0.55, 0.55, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />
      <div style={{opacity: win(f, 20)}}><Card x={980} y={250} w={880} color={C.violet} title="ファミコン本体の音源" sub="矩形波×2・三角波・ノイズ" on={1} /></div>
      <div style={{opacity: win(f, 60)}}><Card x={980} y={470} w={880} color={C.violet} title="MMC5の拡張音源" sub="矩形波×2" on={1} /></div>
    </Bg>
  );
};

// ───────────────── S09 まとめ
export const S09: React.FC = () => {
  const f = useCurrentFrame();
  const c = [0, 1].map((i) => cueOf('S09', i));
  const end = sceneFrames('S09');
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <OffthreadVideo src={staticFile('video/hw.mp4')} trimBefore={CLIP.hwEnd + 600} volume={(fr) => interpolate(fr, [0, 30, end - 90, end], [0, 0.45, 0.45, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 60, display: 'flex', justifyContent: 'center', gap: 30, opacity: win(f, c[0], c[1] + 160)}}>
        {[['ゲーム', '6502', C.red], ['地面', 'Mode7', C.green], ['敵や木', 'SuperFX', C.cyan]].map(([a, b, col]) => (
          <div key={a} style={{padding: '14px 34px', borderRadius: 14, background: 'rgba(5,8,18,.85)', border: `3px solid ${col}`, fontFamily: FONT, fontWeight: 900, fontSize: 42, color: '#fff'}}>{a}<span style={{color: col, marginLeft: 16}}>{b}</span></div>
        ))}
      </div>
      <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: interpolate(f, [end - 200, end - 160, end - 20, end], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}), background: 'rgba(0,0,0,.55)'}}>
        <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 84, color: '#fff', textShadow: '0 4px 18px #000'}}>ファミコンで スペースハリアー</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const Thumbnail: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <Img src={staticFile('img/thumb_frame.png')} style={{width: '100%', height: '100%', objectFit: 'cover', imageRendering: 'pixelated'}} />
    <AbsoluteFill style={{background: 'linear-gradient(0deg, rgba(0,0,0,.8) 0%, rgba(0,0,0,0) 55%)'}} />
    <div style={{position: 'absolute', left: 70, bottom: 70, fontFamily: FONT, color: '#fff'}}>
      <div style={{fontSize: 110, fontWeight: 900, textShadow: '0 6px 20px #000'}}>ファミコンで スペースハリアー</div>
      <div style={{fontSize: 58, fontWeight: 800, color: C.cyan, marginTop: 12}}>SuperFX＋Mode7 ／ カラー 60fps</div>
    </div>
  </AbsoluteFill>
);
