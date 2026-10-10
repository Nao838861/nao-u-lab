import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame, Easing} from 'remotion';
import {Arrow, Bg, Box, C, Fade, Game, SceneTitle, Tag, clamp, cueEnd, cueOf, useIn, usePop} from './common';
import {CLIP} from './clips';

// ───────────────────────── C13 音はそのまま鳴らせない
export const C13: React.FC = () => {
  const f = useCurrentFrame();
  const q = (i: number) => cueOf('C13', i);
  const cards = useIn(q(1));
  const size = interpolate(f, [q(2), q(2) + 60], [0, 1], clamp);
  const flow = useIn(q(3));
  const mute = usePop(q(0) + 30);
  return (
    <Bg>
      <SceneTitle label="音　原作の音はそのまま鳴らせない" color={C.cyan} />
      <div style={{position: 'absolute', left: 120, top: 170, opacity: 1 - cards, display: 'flex', alignItems: 'center', gap: 50}}>
        <Game clip="mono" field={CLIP.opening} w={900} />
        <div style={{opacity: Math.min(1, mute * 1.4), transform: `scale(${0.8 + 0.2 * mute})`}}>
          <div style={{fontSize: 120}}>🔇</div>
          <div style={{fontSize: 40, fontWeight: 900}}>前回のゲームは無音</div>
        </div>
      </div>
      <div style={{opacity: cards * (1 - flow)}}>
        <Box x={120} y={170} w={760} h={330} color={C.amber} title="アーケード版" sub="">
          <div style={{fontSize: 32, lineHeight: 1.6, marginTop: 6}}>FM音源 YM2203<br />＋ セガのPCM音源</div>
        </Box>
        <Box x={1040} y={170} w={760} h={330} color={C.cyan} title="スーパーファミコン" sub="">
          <div style={{fontSize: 32, lineHeight: 1.6, marginTop: 6}}>SPC700 ＋ サンプル再生 <b>8声</b><br />音のRAM 64KB</div>
        </Box>
        <Arrow x1={885} y1={335} x2={1035} y2={335} color={C.red} p={1} dashed label="命令は移せない" />
        <div style={{position: 'absolute', left: 120, top: 580, opacity: size, fontSize: 30, fontWeight: 800}}>曲を録音のまま入れると（32kHz・モノラル）</div>
        {[['2分の曲', 2.06, C.red], ['ゲームのROM全体', 2.0, '#7c8db8']].map(([l, v, col], i) => (
          <div key={i} style={{position: 'absolute', left: 120, top: 650 + i * 90, opacity: size, whiteSpace: 'nowrap'}}>
            <div style={{position: 'absolute', left: 0, top: 10, width: 330, fontSize: 30, fontWeight: 800, textAlign: 'right'}}>{l}</div>
            <div style={{position: 'absolute', left: 360, top: 0, width: (v as number) * 500 * size, height: 60, borderRadius: 8, background: col as string}} />
            <div style={{position: 'absolute', left: 360 + (v as number) * 500 * size + 16, top: 10, fontSize: 34, fontWeight: 900, color: col as string}}>約{v}MB</div>
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', inset: 0, opacity: flow}}>
        <Box x={120} y={220} w={460} h={220} color={C.green} title="楽器の音" sub="短いサンプル（BRR）" />
        <Box x={120} y={500} w={460} h={220} color={C.amber} title="曲" sub="楽譜（音符の列）" />
        <Box x={860} y={330} w={500} h={280} color={C.cyan} title="音源のCPU" sub="SPC700が自分で演奏" />
        <Arrow x1={585} y1={330} x2={850} y2={440} color={C.green} p={1} />
        <Arrow x1={585} y1={610} x2={850} y2={510} color={C.amber} p={1} />
        <Fade at={q(3) + 180} style={{position: 'absolute', left: 1420, top: 360, width: 440, fontSize: 32, lineHeight: 1.6, fontWeight: 800}}>
          起動時に一度送るだけ<br /><span style={{color: C.green}}>描画の邪魔をしない</span>
        </Fade>
      </div>
    </Bg>
  );
};

// ───────────────────────── C14 測る相手を間違えた
const Harmonics: React.FC<{p: number}> = ({p}) => {
  const db = [0, -13, -17, -21, -21, -21, -21, -21, -21, -21, -21, -21];
  return (
    <div style={{position: 'relative', width: 760, height: 360}}>
      {db.map((d, i) => (
        <div key={i} style={{position: 'absolute', left: i * 62, bottom: 40, width: 46, height: (300 + d * 9) * Math.min(1, Math.max(0, p * 12 - i)), background: i === 0 ? C.cyan : C.green, borderRadius: '6px 6px 0 0'}}>
          <div style={{position: 'absolute', top: -34, width: 70, left: -12, textAlign: 'center', fontSize: 20, color: C.sub}}>{d === 0 ? '0dB' : `${d}`}</div>
        </div>
      ))}
      <div style={{position: 'absolute', left: 0, bottom: 0, fontSize: 22, color: C.sub, width: 760, display: 'flex'}}>
        {db.map((_, i) => <div key={i} style={{width: 62, textAlign: 'left', paddingLeft: 12}}>{i + 1}</div>)}
      </div>
    </div>
  );
};
const Listen: React.FC<{label: string; color: string; p: number}> = ({label, color, p}) => {
  const f = useCurrentFrame();
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 380, display: 'flex', justifyContent: 'center', opacity: p}}>
      <div style={{padding: '26px 50px', borderRadius: 20, background: 'rgba(5,8,18,.92)', border: `4px solid ${color}`, display: 'flex', alignItems: 'center', gap: 30}}>
        <div style={{display: 'flex', gap: 6, alignItems: 'flex-end', height: 70}}>
          {Array.from({length: 9}, (_, i) => <div key={i} style={{width: 12, borderRadius: 4, background: color, height: 15 + 50 * Math.abs(Math.sin(f / 7 + i * 1.3))}} />)}
        </div>
        <div style={{fontSize: 48, fontWeight: 900, color}}>{label}</div>
      </div>
    </div>
  );
};
export const C14: React.FC = () => {
  const f = useCurrentFrame();
  const q = (i: number) => cueOf('C14', i);
  const e0 = cueEnd('C14', 0), e2 = cueEnd('C14', 2);
  const l1 = interpolate(f, [e0 + 10, e0 + 25, q(1) - 20, q(1)], [0, 1, 1, 0], clamp);
  const l2 = interpolate(f, [e2 + 10, e2 + 25, q(3) - 20, q(3)], [0, 1, 1, 0], clamp);
  const fire = useIn(q(0) + 200);
  const harm = interpolate(f, [q(2), q(2) + 120], [0, 1], clamp);
  const voices = useIn(q(3));
  const wave = (x: number, vib: number) => 150 + 60 * Math.sin(x / 9 + vib * Math.sin(x / 40) * 3);
  const path = (vib: number, spikes: number) => {
    let s = '';
    for (let x = 0; x <= 700; x += 4) {
      let y = wave(x + f * 2, vib);
      if (spikes && x % 70 < 8) y += spikes * (x % 140 < 8 ? -1 : 1);
      s += `${x === 0 ? 'M' : 'L'}${x},${y.toFixed(1)} `;
    }
    return s;
  };
  return (
    <Bg>
      <SceneTitle label="音　測る相手を間違えた" color={C.cyan} />
      <Sequence from={e0 + 15} durationInFrames={Math.round(5.4 * 60)} layout="none">
        <Audio src={staticFile('audio/bgm_v1.mp3')} startFrom={0} volume={(t) => Math.min(1, t / 15, (5.4 * 60 - t) / 30) * 0.8} />
      </Sequence>
      <Sequence from={e2 + 15} durationInFrames={Math.round(6.4 * 60)} layout="none">
        <Audio src={staticFile('audio/bgm_v2.mp3')} startFrom={0} volume={(t) => Math.min(1, t / 15, (6.4 * 60 - t) / 30) * 0.8} />
      </Sequence>
      <div style={{position: 'absolute', left: 100, top: 160, opacity: 1 - harm}}>
        <div style={{fontSize: 32, fontWeight: 800}}>第1版：ゲームの録画を測った</div>
        <svg width={760} height={300} style={{marginTop: 20, background: '#0b1124', borderRadius: 12}}>
          <path d={path(1, fire * 70)} stroke={C.amber} strokeWidth={4} fill="none" />
        </svg>
        <div style={{fontSize: 30, marginTop: 14, fontWeight: 800, opacity: fire}}>揺れの正体は <span style={{color: C.red}}>連射音</span>（ビブラートではなかった）</div>
      </div>
      <Fade at={q(1)} style={{position: 'absolute', left: 1000, top: 160, width: 820, opacity: 1 - harm}}>
        <div style={{fontSize: 32, fontWeight: 800}}>第2版：<span style={{color: C.green}}>効果音のないサウンドトラック</span>で測り直す</div>
        <svg width={760} height={300} style={{marginTop: 20, background: '#0b1124', borderRadius: 12}}>
          <path d={path(0, 0)} stroke={C.green} strokeWidth={4} fill="none" />
        </svg>
      </Fade>
      <div style={{position: 'absolute', left: 100, top: 170, opacity: harm * (1 - voices)}}>
        <div style={{fontSize: 32, fontWeight: 800, marginBottom: 50}}>主旋律の倍音（サウンドトラックで測定・20倍音まで）</div>
        <Harmonics p={harm} />
      </div>
      <div style={{position: 'absolute', left: 980, top: 230, width: 860, opacity: harm * (1 - voices), fontSize: 32, lineHeight: 1.9, fontWeight: 700}}>
        <div><span style={{color: C.green}}>▸</span> 倍音を足し合わせて音色を作る</div>
        <div><span style={{color: C.green}}>▸</span> 約9セント上の音を重ねて厚みを出す</div>
        <div><span style={{color: C.green}}>▸</span> 薄いノイズでFM音源のざらつき</div>
        <div><span style={{color: C.green}}>▸</span> 減衰はADSRで合わせる</div>
      </div>
      <div style={{position: 'absolute', left: 120, top: 180, width: 1680, opacity: voices}}>
        <div style={{fontSize: 32, fontWeight: 800, marginBottom: 20}}>音源の8声の割り振り</div>
        {['A 主旋律', 'B スネア・ハット・クラッシュ', 'C 刻みの和音', 'D 刻みの和音', 'E ベース', 'F キック・タム', 'G 主旋律の1オクターブ下', 'H 後半のパッド'].map((v, i) => {
          const se = i >= 6;
          const ph = Math.floor((f - q(3)) / 40);
          const blink = (i === 7 && ph % 3 === 1) || (i === 6 && ph % 6 === 1);
          return (
            <div key={v} style={{display: 'flex', alignItems: 'center', gap: 20, marginBottom: 12}}>
              <div style={{width: 600, fontSize: 30, fontWeight: 800, color: se ? C.amber : C.text}}>{v}</div>
              <div style={{flex: 1, height: 40, borderRadius: 8, background: blink ? C.red : se ? `${C.amber}66` : `${C.cyan}55`, display: 'flex', alignItems: 'center', paddingLeft: 16, fontSize: 24, fontWeight: 800}}>{se ? (blink ? '効果音が借りている' : '曲') : ''}</div>
            </div>
          );
        })}
        <div style={{fontSize: 28, color: C.sub, marginTop: 10}}>連射音はH、二つ同時のときだけGも借りる。主旋律とドラムは消えない</div>
      </div>
      <Listen label="第1版（録画を測った音色）" color={C.amber} p={l1} />
      <Listen label="第2版（サウンドトラックで測った音色）" color={C.green} p={l2} />
    </Bg>
  );
};

// ───────────────────────── C15 描画とぶつからないように
export const C15: React.FC = () => {
  const f = useCurrentFrame();
  const q = (i: number) => cueOf('C15', i);
  const lock = useIn(q(0) + 60);
  const memo = useIn(q(1));
  const n = Math.floor(Math.max(0, f - q(1)) / 20) % 5;
  const flush = n === 4;
  const stat = useIn(q(2));
  return (
    <Bg>
      <SceneTitle label="音　描画とぶつからないように" color={C.cyan} />
      <Box x={100} y={200} w={420} h={220} color={C.green} title="本体CPU" sub="ゲーム進行" />
      <Box x={760} y={170} w={440} h={170} color="#9fb0d6" title="ROM" sub="音のプログラム" fs={30} />
      <Box x={1420} y={200} w={420} h={220} color={C.amber} title="SuperFX2" sub={flush ? '描き終わり' : '描画中'} glow={flush ? 0 : lock} />
      <Arrow x1={525} y1={260} x2={750} y2={255} color={C.red} p={lock} dashed />
      {lock > 0 && !flush && <div style={{position: 'absolute', left: 540, top: 360, fontSize: 30, fontWeight: 900, color: C.red, opacity: lock}}>描画中は呼べない</div>}
      <div style={{position: 'absolute', left: 100, top: 520, opacity: memo}}>
        <div style={{fontSize: 30, fontWeight: 800, marginBottom: 12}}>音のメモ（RAM）</div>
        <div style={{display: 'flex', gap: 12}}>
          {['発射', '爆発', '発射', '反射'].map((s, i) => <div key={i} style={{width: 120, height: 70, borderRadius: 10, border: `3px solid ${C.cyan}`, background: i < n && !flush ? `${C.cyan}44` : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 800, opacity: i < n || flush ? 1 : 0.25}}>{s}</div>)}
        </div>
      </div>
      <Box x={1420} y={540} w={420} h={200} color={C.cyan} title="音源 SPC700" sub="まとめて受け取る" glow={flush ? 1 : 0} fs={30} />
      <Arrow x1={650} y1={600} x2={1410} y2={640} color={C.cyan} p={flush ? 1 : 0} label="描き終わってから送る" />
      <div style={{position: 'absolute', left: 100, top: 800, width: 1720, opacity: stat, display: 'flex', gap: 60, alignItems: 'baseline'}}>
        <div style={{fontSize: 30, fontWeight: 800}}>音の処理 1コマあたり平均</div>
        <div style={{fontSize: 80, fontWeight: 900, color: C.cyan}}>0.15<span style={{fontSize: 36}}>ms</span></div>
        <Tag color={C.green} style={{fontSize: 34}}>60fpsは変わらず</Tag>
      </div>
    </Bg>
  );
};

// ───────────────────────── C16 まとめ
export const C16: React.FC = () => {
  const f = useCurrentFrame();
  const q = (i: number) => cueOf('C16', i);
  const tri = useIn(q(0));
  const thanks = interpolate(f, [q(2) - 10, q(2) + 10], [0, 1], clamp);
  const rows = [
    ['道A　2bpp＋パレット', '色が付く', '60fps', '8×8ごとの色の制約', C.green],
    ['道B　4bpp', '16色', '30fps', '絵の仕上げはこれから', C.amber],
    ['道C　SA-1', '16色', '60fps未達', '挑戦中', C.violet],
  ];
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <Game clip="color" field={CLIP.ending} w={1536} style={{borderRadius: 0}} />
      </AbsoluteFill>
      <AbsoluteFill style={{background: `rgba(5,8,18,${0.55 + thanks * 0.3})`}} />
      <div style={{position: 'absolute', top: 120, width: '100%', textAlign: 'center', opacity: tri * (1 - thanks)}}>
        <div style={{fontSize: 52, fontWeight: 900}}><span style={{color: C.green}}>色数</span>・<span style={{color: C.cyan}}>速さ</span>・<span style={{color: C.amber}}>絵の品質</span>　三つ同時はまだ取れていない</div>
      </div>
      <div style={{position: 'absolute', left: 200, top: 280, width: 1520, opacity: (1 - thanks)}}>
        {rows.map((r, i) => {
          const p = interpolate(f, [q(1) + i * 70, q(1) + i * 70 + 18], [0, 1], clamp);
          return (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 30, padding: '22px 30px', marginBottom: 20, borderRadius: 18, border: `4px solid ${r[4]}`, background: 'rgba(19,27,49,.88)', opacity: p, transform: `translateX(${(1 - p) * 40}px)`}}>
              <div style={{width: 480, fontSize: 38, fontWeight: 900, color: r[4]}}>{r[0]}</div>
              <div style={{width: 220, fontSize: 36, fontWeight: 800}}>{r[1]}</div>
              <div style={{width: 260, fontSize: 36, fontWeight: 900, color: r[4]}}>{r[2]}</div>
              <div style={{fontSize: 30, color: C.sub, fontWeight: 700}}>{r[3]}</div>
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', top: 440, width: '100%', textAlign: 'center', opacity: thanks, fontSize: 72, fontWeight: 900, color: '#fff'}}>ご視聴ありがとうございました</div>
    </AbsoluteFill>
  );
};

export const _c = [Easing];
