import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {Bg, C, FONT, SceneTitle, cueOf, sceneFrames} from './common';
import {Bar, CLIP, Card, Clip, Label, win} from './parts';
import meters from './meters.json';

const GAME = {x: 60, y: 112, w: 875, h: 820};
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// ───────────────── S06 30コマから60コマへ
const Ticks: React.FC<{y: number; label: string; every: number; color: string; o: number; f: number; mark: boolean}> = ({y, label, every, color, o, f, mark}) => (
  <div style={{position: 'absolute', left: 80, top: y, opacity: o}}>
    <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 34, color, marginBottom: 14}}>{label}</div>
    <div style={{display: 'flex', gap: 14}}>
      {Array.from({length: 16}, (_, i) => {
        const logic = i % every === 0;
        const now = Math.floor(f / 12) % 16 === i;
        return (
          <div key={i} style={{width: 92, height: 92, borderRadius: 10, boxSizing: 'border-box', border: `3px solid ${color}`, background: !mark || logic ? `${color}cc` : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 22, color: !mark || logic ? '#06101e' : color, transform: now ? 'translateY(-8px)' : 'none'}}>
            {mark ? (logic ? '更新' : '補間') : '表示'}
          </div>
        );
      })}
    </div>
  </div>
);

const StepChart: React.FC<{x: number; y: number; w: number; h: number; steps: number; color: string; label: string; p: number}> = ({x, y, w, h, steps, color, label, p}) => {
  // 奥行きを steps 段階に丸めた大きさ（手前側を拡大して表示）
  const N = 400, Z = 0.3;
  const size = (z: number) => 1 / (0.18 + 0.82 * z);
  const lo = size(Z), hi = size(0);
  const pts: string[] = [];
  for (let i = 0; i <= N * p; i++) {
    const z = Z * (1 - i / N);
    const q = Math.min(steps - 1, Math.floor(z * steps)) / (steps - 1);
    pts.push(`${x + (i / N) * w},${y + h - Math.max(0, (size(q) - lo) / (hi - lo)) * h}`);
  }
  return (
    <svg style={{position: 'absolute', left: 0, top: 0}} width={1920} height={1080}>
      <rect x={x} y={y} width={w} height={h} fill="#0d1428" stroke={C.line} strokeWidth={2} />
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth={5} />
      <text x={x + 14} y={y + 46} fill={color} fontFamily={FONT} fontWeight={800} fontSize={38}>{label}</text>
      <text x={x + w - 10} y={y + h + 40} fill={C.sub} fontFamily={FONT} fontWeight={700} fontSize={26} textAnchor="end">手前 →</text>
      <text x={x} y={y + h + 40} fill={C.sub} fontFamily={FONT} fontWeight={700} fontSize={26}>やや奥</text>
      <text x={x - 12} y={y + 30} fill={C.sub} fontFamily={FONT} fontWeight={700} fontSize={26} textAnchor="end">大</text>
    </svg>
  );
};

export const S06: React.FC = () => {
  const f = useCurrentFrame();
  const c = Array.from({length: 5}, (_, i) => cueOf('S06', i));
  const ph = f < c[2] - 8 ? 0 : f < c[3] - 8 ? 1 : f < c[4] - 8 ? 2 : 3;
  return (
    <Bg>
      <SceneTitle label="30コマから60コマへ" color={C.amber} />
      {ph === 0 && (
        <>
          <Ticks y={170} label={f < c[1] ? '画面は毎秒60コマ …… でも、もっさりする' : '中身：ゲームロジックは2コマに1回、間は補間した絵'} every={2} color={f < c[1] ? C.green : C.sub} o={win(f, 0)} f={f} mark={f >= c[1] + 30} />
          <div style={{opacity: win(f, c[1] + 360)}}><Card x={80} y={470} w={1760} color={C.red} title="ボタンを押しても、反応は30コマ単位" on={1} fs={40} /></div>
        </>
      )}
      {ph === 1 && (
        <div style={{opacity: win(f, c[2] - 8)}}>
          <Clip src="video/cmp30.mp4" from={0} x={60} y={150} w={875} h={820} color={C.sub} label="30コマ（説明用に1コマおきに間引き）" />
          <Clip src="video/main.mp4" from={CLIP.cmp} x={985} y={150} w={875} h={820} color={C.amber} label="60コマ（ロジックも60Hz）" />
        </div>
      )}
      {ph === 2 && (
        <div style={{opacity: win(f, c[3] - 8)}}>
          <Label x={80} y={140} size={36}>木や草の大きさの表（模式図・手前側を拡大）</Label>
          <StepChart x={240} y={240} w={1440} h={560} steps={56} color={C.red} label="56段階：30コマでは隠れていた段差" p={interpolate(f, [c[3], c[3] + 90], [0, 1], clamp)} />
        </div>
      )}
      {ph === 3 && (
        <div style={{opacity: win(f, c[4] - 8)}}>
          <StepChart x={80} y={200} w={700} h={460} steps={111} color={C.green} label="111段階に戻す" p={interpolate(f, [c[4], c[4] + 60], [0, 1], clamp)} />
          <Clip src="video/trees.mp4" from={0} x={840} y={150} w={1020} h={700} color={C.green} label="根元は地面と同じ式で計算" />
        </div>
      )}
    </Bg>
  );
};

// ───────────────── S07 60コマに収める
const FPS_STEPS = [57.95, 58.73, 58.98, 59.37, 59.55, 59.73, 59.9];
const DROP_STEPS = [205, 131, null, 72, 52, 35, 17];

const TwoLanes: React.FC<{f: number; at: number; parallel: boolean}> = ({f, at, parallel}) => {
  const S = 50, X0 = 360;
  const p = interpolate(f, [at, at + 70], [0, 1], clamp);
  const prep = {ms: 11.4, color: C.green, label: '6502：描画データの準備 11.4ms'};
  const draw = {ms: 11.3, color: C.cyan, label: 'SuperFX：描画 11.3ms'};
  return (
    <>
      <Label x={80} y={300} size={32} color={C.green}>6502</Label>
      <Label x={80} y={470} size={32} color={C.cyan}>SuperFX</Label>
      <Bar x={X0} y={280} scale={S} p={p} segs={[prep]} />
      <Bar x={X0 + (parallel ? 0 : 11.4 * S)} y={450} scale={S} p={interpolate(f, [at + (parallel ? 20 : 70), at + (parallel ? 90 : 140)], [0, 1], clamp)} segs={[draw]} />
      <div style={{position: 'absolute', left: X0 + 16.6 * S, top: 230, width: 5, height: 340, background: parallel ? C.green : C.red}} />
      <Label x={X0 + 16.6 * S - 150} y={186} size={30} color={parallel ? C.green : C.red} w={300} align="center">1フレーム 16.6ms</Label>
      {!parallel && <Label x={X0 + 22.7 * S + 20} y={470} size={34} color={C.red} o={win(f, at + 150)}>入りきらない</Label>}
      {parallel && <Label x={X0} y={600} size={30} color={C.sub} o={win(f, at + 100)} w={1300}>SuperFXが今のコマを描いている間に、6502は次のコマを準備（描画は1フレーム遅れて出る）</Label>}
    </>
  );
};

export const S07: React.FC = () => {
  const f = useCurrentFrame();
  const c = Array.from({length: 5}, (_, i) => cueOf('S07', i));
  const ph = f < c[1] - 8 ? 0 : f < c[2] - 8 ? 1 : f < c[3] - 8 ? 2 : f < c[4] - 8 ? 3 : 4;
  const hwAt = c[4] + 330;
  const S = 56;
  return (
    <Bg>
      {!(ph === 4 && f >= hwAt) && <SceneTitle label="60コマに収める" color={C.red} />}
      {ph === 0 && (
        <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: win(f, 0)}}>
          <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 110, color: C.text}}>8ms ＋ 8ms ≦ 16.6ms <span style={{color: C.amber}}>？</span></div>
        </AbsoluteFill>
      )}
      {ph === 1 && <div style={{opacity: win(f, c[1] - 8)}}><Label x={80} y={130} size={36}>最初の版：準備が終わってから描き始める（直列）</Label><TwoLanes f={f} at={c[1] + 60} parallel={false} /></div>}
      {ph === 2 && <div style={{opacity: win(f, c[2] - 8)}}><Label x={80} y={130} size={36}>描画を1フレーム遅らせて、並べて走らせる</Label><TwoLanes f={f} at={c[2] + 40} parallel /></div>}
      {ph === 3 && (
        <div style={{opacity: win(f, c[3] - 8)}}>
          <Label x={80} y={130} size={36}>ロジック60Hz化のあと、敵が多い場面（専用Mesenで計測）</Label>
          <Label x={80} y={250} size={30} color={C.green}>6502</Label>
          <Bar x={300} y={230} scale={S} p={interpolate(f, [c[3] + 120, c[3] + 220], [0, 1], clamp)} segs={[
            {ms: 6.15, color: C.green, label: 'ロジック 6.2ms'},
            {ms: 11.3, color: C.cyan, label: '描画データの準備 11.3ms'},
          ]} />
          <Label x={80} y={430} size={30} color={C.violet}>SuperFX</Label>
          <Bar x={300} y={410} scale={S} p={interpolate(f, [c[3] + 240, c[3] + 300], [0, 1], clamp)} segs={[{ms: 4.01, color: C.violet, label: '平均 4ms'}]} />
          <div style={{position: 'absolute', left: 300 + 16.64 * S, top: 190, width: 5, height: 340, background: C.red}} />
          <Label x={300 + 4.2 * S} y={430} size={30} color={C.violet} o={win(f, c[3] + 300)}>← 余裕がある</Label>
          <div style={{opacity: win(f, c[3] + 420)}}><Card x={400} y={640} w={1120} color={C.red} title="足りなかったのは 6502 の時間" on={1} fs={48} /></div>
        </div>
      )}
      {ph === 4 && f < hwAt && <FpsChart start={c[4]} />}
      {ph === 4 && f >= hwAt && (
        <AbsoluteFill style={{opacity: win(f, hwAt)}}>
          <OffthreadVideo src={staticFile('video/hw.mp4')} trimBefore={CLIP.hwEnd} volume={0.4} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          <div style={{position: 'absolute', left: 50, top: 40, padding: '10px 26px', borderRadius: 12, background: 'rgba(0,0,0,.7)', fontFamily: FONT, fontWeight: 900, fontSize: 48, color: C.green, border: `3px solid ${C.green}`}}>実機 60fps</div>
        </AbsoluteFill>
      )}
    </Bg>
  );
};

const FpsChart: React.FC<{start: number}> = ({start}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [start, start + 200], [0, 1], clamp);
  const n = FPS_STEPS.length;
  const X = (i: number) => 220 + i * 230, Yf = (v: number) => 640 - (v - 57.5) / 2.6 * 420;
  const Yd = (v: number) => 640 - v / 260 * 380;
  const vis = Math.max(1, Math.floor(p * n + 0.999));
  return (
    <div style={{opacity: win(f, start - 8)}}>
      <Label x={80} y={130} size={36}>見た目もゲームの動きも変えずに削る（同じ100秒のプレイ、専用Mesen）</Label>
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
      <Label x={200} y={770} size={26} color={C.sub} w={1500}>削ったもの：使われなくなった拡大縮小の計算・投影の無駄な掛け算・敵の配列の走査・転送・スプライトの重複コピー</Label>
    </div>
  );
};

// ───────────────── S08 音（各チャンネルの音量は、録画した音源レジスタの書き込みから計算）
const CH = [
  {k: 'm1', name: 'MMC5 矩形波1', role: '主旋律', color: C.cyan, cue: 1},
  {k: 'm2', name: 'MMC5 矩形波2', role: '和音', color: C.cyan, cue: 1},
  {k: 'p1', name: '本体 矩形波1', role: '対旋律・効果音', color: C.amber, cue: 2},
  {k: 'p2', name: '本体 矩形波2', role: '対旋律・効果音', color: C.amber, cue: 2},
  {k: 'tri', name: '三角波', role: 'ベース', color: C.green, cue: 1},
  {k: 'noi', name: 'ノイズ', role: 'ドラム・爆発', color: C.red, cue: 3},
];
const M = meters as unknown as Record<string, number[]>;

export const S08: React.FC = () => {
  const f = useCurrentFrame();
  const c = Array.from({length: 4}, (_, i) => cueOf('S08', i));
  const end = sceneFrames('S08');
  const focus = f < c[1] ? 0 : f < c[2] ? 1 : f < c[3] ? 2 : 3;
  return (
    <Bg>
      <SceneTitle label="音：本体の音源 ＋ MMC5" color={C.violet} />
      <Clip src="video/main.mp4" from={CLIP.sound} {...GAME} color={C.violet} volume={(fr) => interpolate(fr, [0, 20, end - 40, end], [0, 0.6, 0.6, 0], clamp)} />
      {CH.map((ch, i) => {
        const v = (M[ch.k] ?? [])[f] ?? 0;
        const hi = focus === 0 || ch.cue === focus || (focus === 1 && ch.cue !== 3 && ch.k !== 'p1' && ch.k !== 'p2');
        return (
          <div key={ch.k} style={{position: 'absolute', left: 990, top: 140 + i * 128, width: 870, height: 110, opacity: hi ? 1 : 0.35, fontFamily: FONT}}>
            <div style={{fontSize: 30, fontWeight: 900, color: C.text}}>{ch.name}<span style={{fontSize: 24, color: ch.color, marginLeft: 16}}>{ch.role}</span></div>
            <div style={{marginTop: 10, height: 34, background: '#1b2643', borderRadius: 8, overflow: 'hidden'}}>
              <div style={{width: `${Math.round(v * 100)}%`, height: '100%', background: ch.color}} />
            </div>
          </div>
        );
      })}
      <Label x={990} y={920} size={22} color={C.sub} w={870}>メーター：録画した音源への書き込みから計算した各音の大きさ</Label>
    </Bg>
  );
};

// ───────────────── S09 まとめ
export const S09: React.FC = () => {
  const f = useCurrentFrame();
  const c = [0, 1, 2, 3].map((i) => cueOf('S09', i));
  const end = sceneFrames('S09');
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <OffthreadVideo src={staticFile('video/hw.mp4')} trimBefore={CLIP.hwEnd + 600} volume={(fr) => interpolate(fr, [0, 30, end - 90, end], [0, 0.45, 0.45, 0], clamp)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 60, display: 'flex', justifyContent: 'center', gap: 30, opacity: win(f, c[0], c[3] - 20)}}>
        {[['ゲーム', '6502', C.red], ['地面', 'Mode7', C.green], ['敵や木', 'SuperFX', C.cyan]].map(([a, b, col]) => (
          <div key={a} style={{padding: '14px 34px', borderRadius: 14, background: 'rgba(5,8,18,.85)', border: `3px solid ${col}`, fontFamily: FONT, fontWeight: 900, fontSize: 42, color: '#fff'}}>{a}<span style={{color: col, marginLeft: 16}}>{b}</span></div>
        ))}
      </div>
      <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: interpolate(f, [c[3] - 10, c[3] + 20, end - 20, end], [0, 1, 1, 0], clamp), background: 'rgba(0,0,0,.55)'}}>
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
