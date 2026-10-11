import React from 'react';
import {interpolate, useCurrentFrame, Easing} from 'remotion';
import {Bg, C, Fade, Game, Pix, SceneTitle, Tag, clamp, cueOf, useIn, usePop} from './common';
import {CLIP} from './clips';
import iv from './intervals.json';

const IV = iv as unknown as Record<string, {start: number; seq: string; hist: Record<string, number>; images: number; fields: number}>;

const MsBar: React.FC<{y: number; label: string; ms: number; color: string; p: number; sc: number; note?: React.ReactNode}> = ({y, label, ms, color, p, sc, note}) => (
  <div style={{position: 'absolute', left: 80, top: y, opacity: Math.min(1, p * 3), whiteSpace: 'nowrap'}}>
    <div style={{position: 'absolute', left: 0, top: 8, width: 340, fontSize: 30, fontWeight: 800, textAlign: 'right'}}>{label}</div>
    <div style={{position: 'absolute', left: 370, top: 0, width: ms * sc * p, height: 60, background: color, borderRadius: 8}} />
    <div style={{position: 'absolute', left: 370 + ms * sc * p + 14, top: 8, fontSize: 34, fontWeight: 900, color}}>{(ms * p).toFixed(1)} ms {p > 0.99 ? note : null}</div>
  </div>
);

/** One cell per displayed image: width = fields it stayed on screen (1 = 60fps). */
const IntervalStrip: React.FC<{clip: string; at: number; x: number; y: number; w: number; label: string; color: string}> = ({clip, at, x, y, w, label, color}) => {
  const f = useCurrentFrame();
  const d = IV[clip];
  const shown = Math.max(0, f - at);
  let used = 0;
  const cells: React.ReactNode[] = [];
  const unit = w / 240;
  for (let i = 0; i < d.seq.length && used < Math.min(240, shown); i++) {
    const n = Number(d.seq[i]);
    cells.push(<div key={i} style={{position: 'absolute', left: used * unit, top: 0, width: n * unit - 2, height: 44, borderRadius: 3, background: n === 1 ? C.green : n === 2 ? C.amber : C.red}} />);
    used += n;
  }
  return (
    <div style={{position: 'absolute', left: x, top: y}}>
      <div style={{fontSize: 26, fontWeight: 800, color, marginBottom: 8}}>{label}</div>
      <div style={{position: 'relative', width: w, height: 44, background: '#0b1124', borderRadius: 6}}>{cells}</div>
    </div>
  );
};

// ───────────────────────── C08 16色のために30fps
const Strips: React.FC<{phase: number; p: number}> = ({phase, p}) => {
  const W0 = 640, H0 = 450;
  return (
    <div style={{position: 'relative', width: W0, height: H0, opacity: p}}>
      {[0, 1, 2, 3].map((i) => {
        const mine = i % 2 === phase;
        return (
          <div key={i} style={{position: 'absolute', left: i * (W0 / 4), top: 0, width: W0 / 4 - 6, height: H0, borderRadius: 8, background: mine ? `${C.amber}55` : '#16213d', border: `3px solid ${mine ? C.amber : C.line}`, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 16, boxSizing: 'border-box'}}>
            <div style={{fontSize: 26, fontWeight: 800, color: mine ? C.amber : C.sub}}>64ドット</div>
          </div>
        );
      })}
    </div>
  );
};
export const C08: React.FC = () => {
  const f = useCurrentFrame();
  const q = (i: number) => cueOf('C08', i);
  const half = useIn(q(0) + 20);
  const strips = useIn(q(2));
  const phase = Math.floor(Math.max(0, f - q(2)) / 45) % 2;
  const lanes = useIn(q(3));
  const art = useIn(q(4));
  return (
    <Bg>
      <SceneTitle label="道B　16色のために30fps" color={C.amber} />
      <div style={{position: 'absolute', left: 100, top: 160, opacity: half * (1 - strips)}}>
        <div style={{fontSize: 40, fontWeight: 900}}>16色の絵 1枚 ＝ <span style={{color: C.red}}>24,576バイト</span></div>
        <div style={{display: 'flex', gap: 20, marginTop: 40}}>
          {[0, 1].map((i) => <div key={i} style={{width: 600, height: 80, borderRadius: 10, background: C.amber, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 900, color: '#000'}}>すき間 {i + 1}回目：12,288バイト</div>)}
        </div>
        <div style={{fontSize: 34, marginTop: 30, fontWeight: 800}}>1回では無理でも、<span style={{color: C.green}}>2回に分ければ送れる</span></div>
      </div>
      <div style={{position: 'absolute', left: 100, top: 160, opacity: strips}}>
        <Strips phase={phase} p={1} />
        <div style={{fontSize: 32, fontWeight: 800, marginTop: 18}}>{phase === 0 ? '1フィールド目：1本目と3本目を描いて送る' : '2フィールド目：2本目と4本目を描いて送る'}</div>
      </div>
      <div style={{position: 'absolute', left: 820, top: 160, opacity: strips, display: 'flex', gap: 30}}>
        {['A', 'B'].map((n, i) => {
          const showing = Math.floor(Math.max(0, f - q(2)) / 90) % 2 === i;
          return (
            <div key={n} style={{width: 460, height: 260, borderRadius: 16, border: `4px solid ${showing ? C.green : C.amber}`, background: C.panel, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
              <div style={{fontSize: 34, fontWeight: 900}}>ビデオメモリ 画面{n}</div>
              <div style={{fontSize: 30, fontWeight: 800, marginTop: 10, color: showing ? C.green : C.amber}}>{showing ? '完成・表示中' : '組み立て中'}</div>
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: 820, top: 480, width: 1000, opacity: lanes}}>
        {[['ゲーム進行・入力', 1, C.cyan], ['絵の更新', 2, C.amber]].map(([label, every, col], li) => (
          <div key={li} style={{display: 'flex', alignItems: 'center', gap: 20, marginBottom: 22}}>
            <div style={{width: 250, fontSize: 28, fontWeight: 800, color: col as string}}>{label}</div>
            <div style={{display: 'flex', gap: 6}}>
              {Array.from({length: 12}, (_, k) => {
                const on = k % (every as number) === 0;
                return <div key={k} style={{width: on ? (every as number) * 52 - 6 : 0, height: 46, borderRadius: 6, background: on ? `${col}` : 'transparent', display: on ? 'block' : 'none'}} />;
              })}
            </div>
          </div>
        ))}
        <div style={{fontSize: 30, fontWeight: 800}}>進行は1秒に<span style={{color: C.cyan}}>60回</span>、絵だけが<span style={{color: C.amber}}>30回</span></div>
      </div>
      <div style={{position: 'absolute', left: 820, top: 700, width: 1000, opacity: art, display: 'flex', alignItems: 'flex-end', gap: 26}}>
        <div style={{fontSize: 30, fontWeight: 800, width: 200, flexShrink: 0}}>共通の<br /><span style={{color: C.amber}}>15色＋透明</span></div>
        {['04', '03', '12', '00', '05', '14'].map((n) => <Pix key={n} src={`art4_${n}.png`} scale={1} style={{height: n === '03' || n === '00' ? 60 : 110}} />)}
      </div>
    </Bg>
  );
};

// ───────────────────────── C09 転送は成立、絵はこれから
export const C09: React.FC = () => {
  const q = (i: number) => cueOf('C09', i);
  const ok = usePop(q(1));
  const art = useIn(q(2));
  return (
    <Bg>
      <SceneTitle label="道B　転送は成立、絵はこれから" color={C.amber} />
      <div style={{position: 'absolute', left: 90, top: 150, opacity: 1 - art}}>
        <Game clip="fourbpp" field={CLIP.fourbppBoss} w={900} />
      </div>
      <div style={{position: 'absolute', left: 1060, top: 170, width: 780, opacity: 1 - art}}>
        <div style={{fontSize: 30, color: C.sub}}>通常プレイ 1万8千フィールドの平均</div>
        <div style={{fontSize: 110, fontWeight: 900, color: C.amber, lineHeight: 1.1}}>30.0<span style={{fontSize: 46}}>fps</span></div>
        <div style={{fontSize: 28, lineHeight: 1.6, marginTop: 10}}>8,974回の更新のうち27回は<br /><span style={{color: C.red, fontWeight: 800}}>3フィールド（1コマ遅れ）</span><br /><span style={{color: C.sub, fontSize: 24}}>ボスが近づく重い場面</span></div>
        <div style={{marginTop: 40, opacity: Math.min(1, ok * 1.4), transform: `scale(${0.8 + 0.2 * ok})`, transformOrigin: 'left center'}}>
          <Tag color={C.green} style={{fontSize: 34}}>16色・30fps は技術的に成立</Tag>
        </div>
      </div>
      <div style={{opacity: 1 - art}}><IntervalStrip clip="fourbpp" at={q(0) + 20} x={90} y={800} w={900} label="この録画の表示間隔（4秒分）　緑＝1/60秒　橙＝2/60秒　赤＝3/60秒" color={C.sub} /></div>
      <div style={{position: 'absolute', inset: 0, opacity: art}}>
        <Fade at={q(2)} style={{position: 'absolute', left: 100, top: 160, width: 1720}}>
          <div style={{fontSize: 36, fontWeight: 800}}>最初の版：録画の<span style={{color: C.red}}>別の姿勢</span>から絵を作った → 白黒にすると<span style={{color: C.red}}>輪郭まで別物</span></div>
        </Fade>
        <Fade at={q(3)} style={{position: 'absolute', left: 100, top: 260, width: 1720}}>
          <div style={{fontSize: 36, fontWeight: 800}}>今の版：<span style={{color: C.green}}>元の絵の輪郭を保った切り抜き</span>に戻した</div>
          <div style={{display: 'flex', gap: 80, marginTop: 50, alignItems: 'flex-end', justifyContent: 'center'}}>
            {[['04', '04'], ['13', '13'], ['14', '14']].map(([m, c]) => (
              <div key={m} style={{display: 'flex', gap: 24, alignItems: 'flex-end'}}>
                <div style={{textAlign: 'center'}}><Pix src={`art_${m}_mono.png`} scale={1} style={{height: 260}} /><div style={{fontSize: 24, color: C.sub}}>2bpp 白黒</div></div>
                <div style={{textAlign: 'center'}}><Pix src={`art4_${c}.png`} scale={1} style={{height: 260}} /><div style={{fontSize: 24, color: C.amber}}>4bpp 16色</div></div>
              </div>
            ))}
          </div>
          <div style={{fontSize: 32, marginTop: 40, textAlign: 'center', fontWeight: 800}}>16色を生かした絵の仕上げは <span style={{color: C.amber}}>これから</span></div>
        </Fade>
      </div>
    </Bg>
  );
};

// ───────────────────────── C10 SA-1
export const C10: React.FC = () => {
  const f = useCurrentFrame();
  const q = (i: number) => cueOf('C10', i);
  const table = useIn(q(0) + 20);
  const no = useIn(q(2));
  const bars = interpolate(f, [q(3) + 20, q(3) + 120], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const rows = [
    ['', 'SuperFX2', 'SA-1'],
    ['中身', '描画向きの独自CPU', '本体と同じ65816'],
    ['速さ', '約21MHz', '約10.7MHz（本体の約3倍）'],
    ['絵の描き方', '画面形式で1画素ずつ描く命令', 'その命令はない'],
    ['使われた例', 'スターフォックス', 'スーパーマリオRPG'],
  ];
  return (
    <Bg>
      <SceneTitle label="道C　SA-1で16色・60fpsに挑む" color={C.violet} />
      <div style={{position: 'absolute', left: 120, top: 160, opacity: table * (1 - bars)}}>
        {rows.map((r, i) => (
          <div key={i} style={{display: 'flex', borderBottom: `2px solid ${C.line}`, padding: '16px 0', opacity: i === 3 ? 0.4 + 0.6 * Math.max(no, 0.6) : 1}}>
            {r.map((c, j) => <div key={j} style={{width: j === 0 ? 300 : 680, fontSize: i === 0 ? 40 : 32, fontWeight: i === 0 || j === 0 ? 900 : 700, color: i === 0 ? (j === 1 ? C.amber : C.violet) : j === 0 ? C.sub : i === 3 && j === 2 ? C.red : C.text}}>{c}</div>)}
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', inset: 0, opacity: bars}}>
        <div style={{position: 'absolute', left: 80, top: 190, fontSize: 30, color: C.sub}}>一番重い場面の描画時間（SuperFXと同じ方法をSA-1で）</div>
        <div style={{position: 'absolute', left: 450 + 16.7 * 5.2, top: 260, width: 4, height: 260, background: C.green}} />
        <div style={{position: 'absolute', left: 450 + 16.7 * 5.2 - 120, top: 530, width: 240, textAlign: 'center', fontSize: 28, fontWeight: 800, color: C.green}}>60fpsの枠<br />16.7ms</div>
        <MsBar y={330} label="SA-1で1画素ずつ" ms={216.2} color={C.red} p={bars} sc={5.2} note={<span style={{fontSize: 28}}>＝ 枠の約13倍</span>} />
      </div>
    </Bg>
  );
};

// ───────────────────────── C11 コンパイルドスプライト
const CodeRow: React.FC<{at: number}> = ({at}) => {
  const f = useCurrentFrame();
  const px = ['.', '.', 'a', 'a', 'b', 'b', 'a', 'c', 'c', 'c', 'c', 'a', '.', '.', '.', '.'];
  const colors: Record<string, string> = {a: '#5fe38d', b: '#2f8f55', c: '#c08a4a'};
  const lines = [
    ['書く 番地+0', '透明2画素を残して2画素', 'AND/OR'],
    ['書く 番地+1', '不透明4画素', 'そのまま'],
    ['書く 番地+2', '不透明4画素', 'そのまま'],
    ['書く 番地+3', '透明を残して…', 'AND/OR'],
  ];
  return (
    <div style={{display: 'flex', gap: 60, alignItems: 'center'}}>
      <div>
        <div style={{fontSize: 26, color: C.sub, marginBottom: 10}}>絵の1行（データ）</div>
        <div style={{display: 'flex'}}>
          {px.map((c, i) => <div key={i} style={{width: 34, height: 34, margin: 1, background: c === '.' ? 'repeating-conic-gradient(#333 0 25%, #1a1a1a 0 50%) 0 0/10px 10px' : colors[c], outline: i % 4 === 0 ? `2px solid ${C.line}` : 'none'}} />)}
        </div>
      </div>
      <div style={{fontSize: 60, color: C.amber}}>→</div>
      <div style={{fontFamily: 'Menlo, Consolas, monospace'}}>
        <div style={{fontSize: 26, color: C.sub, marginBottom: 10, fontFamily: 'inherit'}}>命令の列（プログラム）</div>
        {lines.map((l, i) => {
          const p = interpolate(f, [at + i * 20, at + i * 20 + 12], [0, 1], clamp);
          return (
            <div key={i} style={{fontSize: 28, opacity: p, marginBottom: 6}}>
              <span style={{color: C.cyan}}>{l[0]}</span>　<span style={{color: C.sub}}>; {l[1]}</span>　<span style={{color: l[2] === 'AND/OR' ? C.amber : C.green}}>{l[2]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export const C11: React.FC = () => {
  const f = useCurrentFrame();
  const q = (i: number) => cueOf('C11', i);
  const b1 = interpolate(f, [q(0), q(0) + 40], [0, 1], clamp);
  const b2 = interpolate(f, [q(0) + 30, q(0) + 90], [0, 1], clamp);
  const code = useIn(q(1));
  const b3 = interpolate(f, [q(2), q(2) + 50], [0, 1], clamp);
  const cap = useIn(q(3));
  const fit = interpolate(f, [q(3) + 360, q(3) + 420], [0, 1], clamp);
  const sc = 5.2;
  return (
    <Bg>
      <SceneTitle label="道C　絵をプログラムにする" color={C.violet} />
      <div style={{opacity: 1 - cap}}>
        <div style={{position: 'absolute', left: 450 + 16.7 * sc, top: 150, width: 4, height: 300, background: C.green}} />
        <div style={{position: 'absolute', left: 450 + 16.7 * sc + 12, top: 150, fontSize: 24, fontWeight: 800, color: C.green}}>60fpsの枠 16.7ms</div>
        <MsBar y={190} label="1画素ずつ" ms={216.2} color={C.red} p={b1} sc={sc} />
        <MsBar y={280} label="縮小済みの絵を読む" ms={240.3} color={C.red} p={b2} sc={sc} />
        <MsBar y={370} label="コンパイルドスプライト" ms={16.8} color={C.green} p={b3} sc={sc} note={<span style={{fontSize: 30}}>＝ 約13分の1</span>} />
        <div style={{position: 'absolute', left: 120, top: 480, opacity: code}}><CodeRow at={q(1) + 30} /></div>
        <Fade at={q(1) + 140} style={{position: 'absolute', left: 120, top: 740, fontSize: 32, fontWeight: 800}}>
          実行するだけで絵が描かれる　<span style={{color: C.sub, fontSize: 26}}>（4画素単位。不透明はそのまま書き、透明を含む所はAND/ORで合成）</span>
        </Fade>
      </div>
      <div style={{position: 'absolute', inset: 0, opacity: cap}}>
        <div style={{position: 'absolute', left: 120, top: 190, fontSize: 34, fontWeight: 800}}>拡大縮小の全段階 <span style={{color: C.violet}}>1,492種類</span>の大きさを全部プログラムにすると</div>
        {[
          {label: '素朴に全部作る', v: 23.8, col: C.red, at: 0},
          {label: 'ROMの容量', v: 8.0, col: '#7c8db8', at: 120},
          {label: '使う向きだけ・行を共有', v: 5.73, col: C.green, at: 360},
        ].map((b, i) => {
          const p = interpolate(f, [q(3) + b.at, q(3) + b.at + 50], [0, 1], clamp);
          return (
            <div key={i} style={{position: 'absolute', left: 120, top: 300 + i * 120, opacity: p, whiteSpace: 'nowrap'}}>
              <div style={{position: 'absolute', left: 0, top: 10, width: 420, fontSize: 30, fontWeight: 800, textAlign: 'right'}}>{b.label}</div>
              <div style={{position: 'absolute', left: 450, top: 0, width: b.v * 42 * p, height: 64, borderRadius: 8, background: b.col}} />
              <div style={{position: 'absolute', left: 450 + b.v * 42 * p + 16, top: 10, fontSize: 36, fontWeight: 900, color: b.col}}>約{b.v}MB</div>
            </div>
          );
        })}
        <div style={{position: 'absolute', left: 120, top: 700, fontSize: 36, fontWeight: 900, opacity: fit}}>→ <span style={{color: C.green}}>8MBのROMに収まった</span>　<span style={{color: C.sub, fontSize: 26, fontWeight: 700}}>（ゲームでは反転を使わないので、その分を省いた）</span></div>
      </div>
    </Bg>
  );
};

// ───────────────────────── C12 残り数ミリ秒
export const C12: React.FC = () => {
  const f = useCurrentFrame();
  const q = (i: number) => cueOf('C12', i);
  const tries = useIn(q(1));
  const qm = usePop(q(2));
  const items: [string, boolean][] = [
    ['消す範囲を減らす（変わった所を帯にまとめる）', true],
    ['送る量を減らす（固定配置＋部分転送）', true],
    ['先に描いておく（表示より先に描く）', true],
    ['タイル単位で転送 → 遅くなった', false],
    ['占有マスクで消去 → 遅くなった', false],
    ['範囲計算を本体CPUへ → 遅くなった', false],
  ];
  return (
    <Bg>
      <SceneTitle label="道C　残り数ミリ秒" color={C.violet} />
      <div style={{position: 'absolute', left: 90, top: 150}}>
        <Game clip="sa1" field={CLIP.sa1} w={880} />
        <div style={{fontSize: 24, color: C.sub, marginTop: 6}}>SA-1版（開発中のROM）</div>
      </div>
      <IntervalStrip clip="sa1" at={q(0) + 30} x={90} y={830} w={880} label="この録画の表示間隔（4秒分）　緑＝1/60秒　橙＝2/60秒　赤＝3/60秒" color={C.sub} />
      <Fade at={q(0) + 150} style={{position: 'absolute', left: 1030, top: 170, width: 820}}>
        <div style={{fontSize: 28, fontWeight: 800}}>重い場面の転送量　<span style={{color: C.red}}>最大 約10.6KB</span>　<span style={{color: C.sub, fontSize: 24}}>（平均 約4.7KB）</span></div>
        <div style={{fontSize: 24, color: C.sub, marginTop: 6}}>1回のすき間で送れる量の限界に近い</div>
      </Fade>
      <div style={{position: 'absolute', left: 1030, top: 290, width: 820, opacity: tries}}>
        <div style={{fontSize: 32, fontWeight: 900, marginBottom: 16}}>試したこと（一部）</div>
        {items.map(([t, good], i) => {
          const p = interpolate(f, [q(1) + i * 25, q(1) + i * 25 + 14], [0, 1], clamp);
          return <div key={t} style={{fontSize: 27, fontWeight: 700, marginBottom: 12, opacity: p, color: good ? C.text : C.sub}}><span style={{color: good ? C.green : C.red, fontWeight: 900}}>{good ? '✔' : '✕'}</span> {t}</div>;
        })}
      </div>
      <div style={{position: 'absolute', left: 1030, top: 680, width: 820, opacity: Math.min(1, qm * 1.3), transform: `scale(${0.8 + 0.2 * qm})`, transformOrigin: 'left center'}}>
        <div style={{fontSize: 44, fontWeight: 900, color: C.violet}}>16色 × 60fps は</div>
        <div style={{fontSize: 64, fontWeight: 900}}>まだ挑戦中</div>
      </div>
    </Bg>
  );
};
