import React from 'react';
import {Audio, Img, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Bg, C, FPS, SceneTitle, Tag, cueEnd, cueOf, useIn} from './common';
import {Big, Box2, Card, HArrow, MONO, Nes, Txt, ramp} from './parts';
import apu from './data/apu.json';

const K = (id: string) => (i: number) => cueOf(id, i);
const A = apu as {start: number; frames: number[]; ch: Record<string, number[][]>};
const CLIP_FRAME = 700; // 記録の700コマ目から（タイヤ音が途切れず鳴る区間）
const CLIP_SEC = CLIP_FRAME / 60.0988;
const CH: [string, string, string][] = [
  ['apu_pulse1', 'APU 矩形波1', 'エンジンの主音'], ['mmc5_pulse1', 'MMC5 矩形波1', '低い排気音'], ['mmc5_pulse2', 'MMC5 矩形波2', '排気音の倍音'],
  ['noise', 'APU ノイズ', '燃焼の音・ブローオフ'], ['apu_pulse2', 'APU 矩形波2', 'タイヤの音'],
];
const COL = [C.amber, C.cyan, C.violet, '#9fb0d6', C.green];

const Spark: React.FC<{key2: string; x: number; y: number; w: number; h: number; col: string; cur: number; maxHz: number}> = ({key2, x, y, w, h, col, cur, maxHz}) => {
  const series = A.ch[key2];
  const i0 = A.frames.indexOf(CLIP_FRAME), n = 252;
  const pts = Array.from({length: n}, (_, j) => { const v = series[i0 + j] ?? [0, 0]; return `${(j / (n - 1)) * w},${h - (v[1] > 0 ? Math.min(1, v[0] / maxHz) : 0) * h}`; }).join(' ');
  return (
    <svg width={w} height={h} style={{position: 'absolute', left: x, top: y}}>
      <rect width={w} height={h} fill="#0b1226" stroke="#2c3b63" />
      <polyline points={pts} fill="none" stroke={col} strokeWidth={3} />
      {cur >= 0 ? <line x1={cur * w} x2={cur * w} y1={0} y2={h} stroke="#fff" strokeWidth={2} /> : null}
    </svg>
  );
};

// ---------------- E1 チャンネル ----------------
export const E1: React.FC = () => {
  const f = useCurrentFrame(), k = K('E1');
  const c = [0, 1, 2, 3, 4, 5, 6, 7].map(k);
  const playing = (j: number) => { const s = cueEnd('E1', j + 2); return f >= s && f < s + 4.2 * FPS ? (f - s) / (4.2 * FPS) : -1; };
  const mixP = f >= cueEnd('E1', 7) && f < cueEnd('E1', 7) + 5.5 * FPS ? (f - cueEnd('E1', 7)) / (4.2 * FPS) : -1;
  const files = ['apu_pulse1', 'mmc5_pulse1', 'mmc5_pulse2', 'noise', 'apu_pulse2'];
  return (
    <Bg>
      <SceneTitle label="4　サウンド：5つの音をすべてエンジンとタイヤに" />
      <Big o={useIn(c[0]) * (1 - ramp(f, c[0] + 70, c[0] + 80))} size={84}>第4章　サウンド</Big>
      {CH.map(([key2, name, role], j) => {
        const p = playing(j);
        const lit = p >= 0 || mixP >= 0;
        return (
          <div key={key2} style={{opacity: ramp(f, c[0] + 80 + j * 8, c[0] + 92 + j * 8)}}>
            <div style={{position: 'absolute', left: 80, top: 150 + j * 128, width: 760, height: 108, borderRadius: 12, border: `3px solid ${lit ? COL[j] : '#2c3b63'}`,
              background: lit ? `${COL[j]}22` : C.panel, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 24px', boxSizing: 'border-box'}}>
              <div style={{fontSize: 32, fontWeight: 900, color: COL[j]}}>{name}</div><div style={{fontSize: 26, fontWeight: 700}}>{role}</div>
            </div>
            <Spark key2={key2} x={880} y={150 + j * 128} w={960} h={108} col={COL[j]} cur={p >= 0 ? p : mixP >= 0 ? Math.min(1, mixP) : -1} maxHz={key2 === 'noise' ? 12000 : key2 === 'apu_pulse2' ? 2200 : 1000} />
          </div>
        );
      })}
      <Txt x={80} y={800} size={26} color={C.sub} o={ramp(f, c[1], c[1] + 14)}>三角波＝ジングル専用、DPCM・MMC5 PCM＝未使用（走行中の書き込みを実測）。グラフ＝周波数の推移（約4秒）</Txt>
      {files.map((name, j) => (
        <Sequence key={name} from={cueEnd('E1', j + 2)} durationInFrames={Math.round(4.2 * FPS)}>
          <Audio src={staticFile(`audio/ch_${name}.wav`)} startFrom={Math.round(CLIP_SEC * FPS)} volume={0.9} />
        </Sequence>
      ))}
      <Sequence from={cueEnd('E1', 7)} durationInFrames={Math.round(5.5 * FPS)}>
        <Audio src={staticFile('audio/ch_mix.wav')} startFrom={Math.round(CLIP_SEC * FPS)} volume={0.9} />
      </Sequence>
    </Bg>
  );
};

// ---------------- E2 エンジン音の合成 ----------------
export const E2: React.FC = () => {
  const f = useCurrentFrame(), k = K('E2');
  const c = [0, 1, 2, 3, 4].map(k);
  const p1 = A.ch.apu_pulse1, m1 = A.ch.mmc5_pulse1;
  const n = Math.min(900, p1.length), w = 1000, h = 300;
  const line = (s: number[][]) => Array.from({length: n}, (_, j) => `${(j / (n - 1)) * w},${h - Math.min(1, s[j][0] / 900) * h}`).join(' ');
  return (
    <Bg>
      <SceneTitle label="4　エンジン音の合成" />
      <div style={{position: 'absolute', left: 80, top: 160, opacity: useIn(c[0])}}>
        <svg width={w} height={h}><rect width={w} height={h} fill="#0b1226" stroke="#2c3b63" />
          <polyline points={line(p1)} fill="none" stroke={C.amber} strokeWidth={3} /><polyline points={line(m1)} fill="none" stroke={C.cyan} strokeWidth={3} /></svg>
        <Txt x={0} y={h + 10} size={26} color={C.sub}>走行中の周波数（記録から）　<span style={{color: C.amber}}>■主音 APU矩形波1</span>　<span style={{color: C.cyan}}>■排気音 MMC5矩形波1</span>　比はどの時点でも 2.0</Txt>
      </div>
      <Card x={1130} y={160} w={710} color={C.amber} o={ramp(f, c[1], c[1] + 14)}>
        <div style={{fontSize: 26, color: C.sub, fontWeight: 700}}>音程のカーブ（速度0〜85）</div>
        <div style={{fontSize: 36, fontWeight: 900, fontFamily: MONO}}>u = 1 − (1 − v/85)²</div>
        <div style={{fontSize: 24, color: C.sub}}>約55Hzから上がる</div>
      </Card>
      <Card x={80} y={540} w={860} color={C.violet} o={ramp(f, c[2], c[2] + 14)}>
        <div style={{fontSize: 26, fontWeight: 800, lineHeight: 1.6}}>アクセルOFF：回転数＝速度の半分（主音が滑り下がる）<br />高速なら短いノイズ（ブローオフ）<br />ノッキング：NMIの下位3bitで排気音の音量を約7.5Hzで揺らす</div>
      </Card>
      <Card x={980} y={420} w={860} color={C.green} o={ramp(f, c[3], c[3] + 14)}>
        <div style={{fontSize: 28, fontWeight: 800}}>タイヤ：横滑り・飽和 OR ブレーキ</div>
      </Card>
      <Card x={980} y={560} w={860} color={C.cyan} o={ramp(f, c[4], c[4] + 14)}>
        <div style={{fontSize: 30, fontWeight: 900}}>どの経路も 181サイクル</div>
        <div style={{fontSize: 24, color: C.sub, marginTop: 6}}>APUへの書き込み時刻もそろえる。ブレーキ音の追加も総サイクル不変</div>
      </Card>
    </Bg>
  );
};

// ---------------- E3 ジングル ----------------
export const E3: React.FC = () => {
  const f = useCurrentFrame(), k = K('E3');
  const c = [0, 1].map(k);
  return (
    <Bg>
      <SceneTitle label="4　ジングル" />
      <Nes src="drift1" from={2130} x={80} y={140} w={760} volume={0.9} />
      <div style={{position: 'absolute', left: 900, top: 170, display: 'flex', flexWrap: 'wrap', gap: 14, width: 940, opacity: useIn(c[0])}}>
        {['MMC5 矩形波1', 'MMC5 矩形波2', 'APU 三角波', 'APU ノイズ'].map((t) => <Tag key={t} color={C.violet}>{t}</Tag>)}
      </div>
      <Txt x={900} y={300} size={28} color={C.sub} w={940} o={useIn(c[0])}>ゴールで排気音を止めて4声に渡す（APU矩形波2本はエンジンとタイヤのまま）</Txt>
      <Card x={900} y={420} w={940} color={C.cyan} o={ramp(f, c[1], c[1] + 14)}>
        <div style={{fontSize: 28, fontWeight: 800, lineHeight: 1.6}}>ドライバー：メイン処理の先頭で1回だけ<br />NMI・IRQには触らない<br />テンポは NMI カウンターで実時間に追従</div>
      </Card>
    </Bg>
  );
};

// ---------------- F1 メモリマップとゴースト ----------------
const WRAM: [string, string][] = [['ゲーム', C.amber], ['型', C.cyan], ['型', C.cyan], ['型', C.cyan], ['型', C.cyan], ['型', C.cyan], ['型', C.cyan], ['—', '#2c3b63'], ['ゴースト', '#ff9de1'], ['ゴースト', '#ff9de1'], ['ゴースト', '#ff9de1'], ['ゴースト', '#ff9de1'], ['ゴースト', '#ff9de1'], ['ゴースト', '#ff9de1'], ['—', '#2c3b63'], ['ゲーム', C.amber]];
export const F1: React.FC = () => {
  const f = useCurrentFrame(), k = K('F1');
  const c = [0, 1, 2, 3, 4].map(k);
  return (
    <Bg>
      <SceneTitle label="5　メモリマップとゴースト" />
      <Big o={useIn(c[0]) * (1 - ramp(f, c[0] + 60, c[0] + 70))} size={84}>第5章　メモリと開発環境</Big>
      <div style={{opacity: ramp(f, c[0] + 66, c[0] + 80)}}>
        {[['PRG 1MB', '辞書61・地図18・準備処理25・物理/ゲーム/音/固定など', C.amber], ['CHR 1MB', '256KB × 4組（向きの下位2bitで切替）', C.violet], ['WRAM 128KB', '8KB × 16バンク（バッテリー付き）', C.cyan]].map(([t, s, col], i) => (
          <Card key={t} x={80} y={150 + i * 120} w={900} color={col}><div style={{fontSize: 32, fontWeight: 900}}>{t}<span style={{fontSize: 24, color: C.sub, marginLeft: 16}}>{s}</span></div></Card>
        ))}
      </div>
      <div style={{position: 'absolute', left: 1040, top: 160, display: 'grid', gridTemplateColumns: 'repeat(4, 196px)', gap: 8, opacity: ramp(f, c[1], c[1] + 14)}}>
        {WRAM.map(([t, col], i) => <div key={i} style={{height: 74, borderRadius: 8, border: `3px solid ${col}`, background: `${col}22`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800}}>
          <span style={{fontFamily: MONO, color: C.sub, fontSize: 18}}>{`bank${i}`}</span><span style={{color: col}}>{t}</span></div>)}
      </div>
      <Card x={80} y={540} w={900} color="#ff9de1" o={ramp(f, c[2], c[2] + 14)}>
        <div style={{fontSize: 28, fontWeight: 800}}>ゴースト：保存済みベスト／記録中の候補、各3バンク</div>
      </Card>
      <div style={{position: 'absolute', left: 1040, top: 540, opacity: ramp(f, c[3], c[3] + 14)}}>
        <div style={{display: 'flex'}}>
          {[['Δx', 5, C.cyan], ['Δy', 5, C.green], ['向き', 6, C.amber]].map(([t, n, col]) => <div key={t as string} style={{width: (n as number) * 48, height: 70, border: `3px solid ${col}`, marginRight: -3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 900, color: col as string}}>{`${t} ${n}bit`}</div>)}
        </div>
        <Txt x={0} y={86} size={28}>1コマ＝2バイト × 10,800コマ（180秒）</Txt>
      </div>
      <Card x={80} y={690} w={1760} color={C.line} o={ramp(f, c[4], c[4] + 14)}>
        <div style={{fontSize: 26, fontWeight: 800}}>記録できなかったコマは直前の姿勢で埋め、最後の1コマだけ現在の姿勢　／　起動時にチェックサムで全体を検査</div>
      </Card>
    </Bg>
  );
};

// ---------------- F2 AIが確かめる仕組み ----------------
export const F2: React.FC = () => {
  const f = useCurrentFrame(), k = K('F2');
  const c = [0, 1, 2].map(k);
  return (
    <Bg>
      <SceneTitle label="5　AIが自分で確かめる仕組み" />
      {[['Mesen（画面なし）＋ Lua', '毎フレームのサイクル・画素を計測'], ['6502 エミュレーター（py65）', 'same-PRE の同値照合'], ['全窓スキャン', '2,437,120通りの転送サイクル'], ['Web版と同じコア', 'リプレイを入力だけから再現（この動画の走行映像）']].map(([t, s], i) => (
        <Box2 key={t} x={80 + (i % 2) * 900} y={170 + Math.floor(i / 2) * 230} w={860} h={190} color={[C.cyan, C.amber, C.violet, C.green][i]} title={t} sub={s} fs={34} o={ramp(f, c[i < 2 ? 1 : 2] + (i % 2) * 15, c[i < 2 ? 1 : 2] + (i % 2) * 15 + 14)} />
      ))}
      <Txt x={80} y={700} size={34} o={useIn(c[0])}>人が遊んで見つけた問題を、AIが網羅的な検査で確かめる</Txt>
    </Bg>
  );
};

// ---------------- F3 Webカメラで実機を見る ----------------
export const F3: React.FC = () => {
  const f = useCurrentFrame(), k = K('F3');
  const c = [0, 1, 2, 3].map(k);
  const steps = ['Mesenで入力を確認', 'USBでN8 ProへROMを送って起動', 'ROMの固定入力で走行', '画面に診断値を表示', 'Webカメラで撮影・保存', 'メニュー復帰を確認'];
  return (
    <Bg>
      <SceneTitle label="5　Webカメラで実機を見る" />
      {steps.map((t, i) => (
        <React.Fragment key={t}>
          <Box2 x={80 + (i % 3) * 600} y={160 + Math.floor(i / 3) * 200} w={520} h={140} color={C.cyan} title={t} fs={28} o={ramp(f, c[0] + i * 12, c[0] + i * 12 + 12)} />
          {i % 3 !== 2 ? <HArrow x={605 + (i % 3) * 600} y={230 + Math.floor(i / 3) * 200} w={70} o={ramp(f, c[0] + i * 12 + 8, c[0] + i * 12 + 16)} /> : null}
        </React.Fragment>
      ))}
      <Card x={80} y={590} w={860} color={C.amber} o={ramp(f, c[1], c[1] + 14)}>
        <div style={{fontSize: 26, fontWeight: 800, lineHeight: 1.6}}>AIがリアルタイムに操作したのではない<br />リセット・カメラの向き・操作感の確認は人</div>
      </Card>
      <Card x={980} y={590} w={860} color={C.red} o={ramp(f, c[2], c[2] + 14)}>
        <div style={{fontSize: 26, fontWeight: 800, lineHeight: 1.6}}>撮影側の偽の不具合<br />H.264のBフレームで時刻が逆行 → 物理の巻き戻りと誤認しかけた</div>
      </Card>
      <div style={{position: 'absolute', left: 80, top: 790, display: 'flex', gap: 14, opacity: ramp(f, c[3], c[3] + 14)}}>
        {['エミュレーターで動く', '実機で絵が出る', 'メニューへ戻る'].map((t) => <Tag key={t} color={C.green}>{`✓ ${t}`}</Tag>)}
        <Tag color={C.sub}>＝それぞれ別の合格条件</Tag>
      </div>
    </Bg>
  );
};

// ---------------- Z9 おわりに ----------------
export const Z9: React.FC = () => (
  <Bg>
    <Nes src="drift1" from={1500} x={580} y={60} w={760} volume={0.5} />
    <Txt x={0} y={800} w={1920} align="center" size={34} color={C.sub}>走行：keitoushi（Web版ランキング DRIFT 1位）</Txt>
  </Bg>
);
