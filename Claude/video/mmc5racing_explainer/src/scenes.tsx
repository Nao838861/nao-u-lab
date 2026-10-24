import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {C, FPS, font, mono, clamp, fade, lerp, fmt, Heading, Panel, Label, Course, Stat, Arrow, SceneProps} from './ui';
import blocks from '../public/gen/blocks_000.json';
import win from '../public/gen/window_000.json';
import track from '../public/gen/jitter_track.json';
import commits from '../public/gen/commits.json';

const CH = ['はじめに', '第1章　回転をデータに変える', '第2章　1ラインずつの攻防', '第3章　4輪の摩擦円', '第4章　AIとの開発', 'まとめ'];
const pad3 = (n: number) => String(n).padStart(3, '0');
const hex = (n: number) => '$' + n.toString(16).toUpperCase().padStart(2, '0');
const STEP = 360 / 128;

/** 録画（Web版リプレイ、ゲーム画面 588x550）を表示する。crop で一部を拡大できる */
const Race: React.FC<{at: number; x: number; y: number; scale: number; volume?: number; crop?: [number, number, number, number]; border?: string}> =
  ({at, x, y, scale, volume = 0, crop = [0, 0, 588, 550], border}) => {
    const [cx, cy, cw, ch] = crop;
    return (
      <div style={{position: 'absolute', left: x, top: y, width: cw * scale, height: ch * scale, overflow: 'hidden', background: '#000', border: border ? `2px solid ${border}` : undefined}}>
        <OffthreadVideo src={staticFile('media/race.mp4')} startFrom={Math.round(at * FPS)} volume={volume} muted={volume === 0}
          style={{position: 'absolute', left: -cx * scale, top: -cy * scale, width: 588 * scale, height: 550 * scale}} />
      </div>
    );
  };

const Tag: React.FC<{x: number; y: number; color: string; children: React.ReactNode; o?: number}> = ({x, y, color, children, o = 1}) => (
  <div style={{position: 'absolute', left: x, top: y, padding: '4px 12px', border: `2px solid ${color}`, borderRadius: 6, color,
    fontFamily: font, fontWeight: 800, fontSize: 20, opacity: o, background: 'rgba(7,9,13,0.85)'}}>{children}</div>
);

const Quote: React.FC<{x: number; y: number; w: number; children: React.ReactNode; o?: number; who?: string}> = ({x, y, w, children, o = 1, who = 'Nao_u の指示（原文）'}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, opacity: o, transform: `translateY(${(1 - o) * 12}px)`, fontFamily: font}}>
    <div style={{color: C.dim, fontSize: 15, fontWeight: 700, marginBottom: 6}}>{who}</div>
    <div style={{background: '#1a2230', border: `1.5px solid ${C.cyan}`, borderRadius: '14px 14px 14px 4px', padding: '14px 18px',
      color: C.white, fontSize: 22, fontWeight: 600, lineHeight: 1.5}}>{children}</div>
  </div>
);

// ---------- はじめに ----------

const C01: React.FC<SceneProps> = ({beats}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Race at={1.2} x={70} y={70} scale={0.98} volume={0.35} />
      <Label x={690} y={92} color={C.mag} size={18} m o={fade(f, 6)}>FAMILY COMPUTER / 6502 / MMC5</Label>
      <Label x={690} y={124} size={46} weight={800} o={fade(f, 14)}>画面ごと回る{'\n'}レースゲーム</Label>
      <Tag x={690} y={290} color={C.red} o={fade(f, beats[2])}>画面の回転機能：なし</Tag>
      <Label x={690} y={350} size={24} color={C.cyan} o={fade(f, beats[3])}>今回のテーマ{'\n'}この回転を、どうやって60fpsで動かすか</Label>
    </AbsoluteFill>
  );
};

const C02: React.FC<SceneProps> = ({beats}) => {
  const f = useCurrentFrame();
  const b = beats[1] ?? 200;
  return (
    <AbsoluteFill>
      <Heading chapter={CH[0]} title="前回と同じ考え方" />
      <div style={{position: 'absolute', left: 70, top: 140, width: 520, height: 455, background: '#000', overflow: 'hidden', border: `1.5px solid ${C.line}`}}>
        <OffthreadVideo src={staticFile('media/prev_demo.mp4')} muted style={{width: 520, height: 455, objectFit: 'contain'}} />
      </div>
      <Label x={70} y={604} size={17} color={C.dim}>前回：ファミコンでスペースハリアー</Label>
      <Panel x={650} y={150} w={250} h={110} border={C.red} o={fade(f, 10)}>
        <div style={{fontSize: 18, color: C.red, fontWeight: 800}}>実行中の重い計算</div>
        <div style={{fontSize: 16, color: C.dim, marginTop: 8}}>描画・3D・回転…</div>
      </Panel>
      <Arrow x={915} y={205} w={50} o={fade(f, 20)} />
      <Panel x={980} y={150} w={240} h={110} border={C.cyan} o={fade(f, 24)}>
        <div style={{fontSize: 18, color: C.cyan, fontWeight: 800}}>先に作ったデータ</div>
        <div style={{fontSize: 16, color: C.dim, marginTop: 8}}>コード・テーブル・絵</div>
      </Panel>
      <Panel x={650} y={300} w={570} o={fade(f, 30)}>
        <div style={{fontSize: 17, color: C.dim, fontWeight: 700}}>前回</div>
        <div style={{fontSize: 22, marginTop: 4}}>絵を描くコード（Compiled Sprite）・3Dのテーブル</div>
      </Panel>
      <Panel x={650} y={400} w={570} border={C.mag} o={fade(f, b)}>
        <div style={{fontSize: 17, color: C.mag, fontWeight: 700}}>今回</div>
        <div style={{fontSize: 22, marginTop: 4}}>128方向の絵・タイルの辞書・地図</div>
      </Panel>
    </AbsoluteFill>
  );
};

// ---------- 第1章 ----------

const C03: React.FC<SceneProps> = ({beats}) => {
  const f = useCurrentFrame();
  const t2 = beats[2] ?? 400;
  const s = Math.max(0, f - t2);
  const sy = 240 - 36 * Math.sin(Math.min(1, s / 70) * Math.PI);
  const sx = 168 + 14 * Math.sin(Math.min(1, Math.max(0, s - 70) / 70) * Math.PI);
  const nt = (win.rows as number[][][]);
  return (
    <AbsoluteFill>
      <Heading chapter={CH[1]} title="背景はタイルの並び" />
      <Course sx={sx} sy={sy} sw={136} sh={184} scale={2.55} x={80} y={130} grid={8} gridO={fade(f, beats[0] + 6, 20)} border={C.line} />
      <Label x={80} y={604} size={16} color={C.dim}>コース表示 136×184ドット（8×8ドットのタイル 17×23枚）</Label>
      <div style={{opacity: fade(f, beats[0] + 30)}}>
        <Course sx={272} sy={288} sw={8} sh={8} scale={20} x={500} y={140} grid={1} gridColor="rgba(0,0,0,0.35)" border={C.cyan} />
        <Label x={680} y={150} size={20} color={C.cyan}>1タイル = 8×8ドット</Label>
        <Label x={680} y={182} size={18} color={C.dim}>4色まで（パレットで色を選ぶ）</Label>
        <Label x={680} y={230} size={18} color={C.dim} m>{`このタイルの番号：${hex(nt[6][13][0])}`}</Label>
      </div>
      <Panel x={500} y={330} w={720} o={fade(f, beats[1])}>
        <div style={{fontSize: 18, color: C.cyan, fontWeight: 800}}>ネームテーブル：どこに、どのタイルを置くか</div>
        <div style={{fontFamily: mono, fontSize: 19, marginTop: 10, lineHeight: 1.45, color: C.white}}>
          {nt.slice(8, 13).map((row, y) => <div key={y}>{row.slice(0, 9).map((w) => hex(w[0])).join(' ')}  …</div>)}
        </div>
      </Panel>
      <div style={{opacity: fade(f, t2)}}>
        <Tag x={500} y={548} color={C.green}>上下左右のスクロール ○</Tag>
        <Tag x={800} y={548} color={C.red}>傾ける・回す ×</Tag>
      </div>
    </AbsoluteFill>
  );
};

const C04: React.FC<SceneProps> = ({beats}) => {
  const f = useCurrentFrame();
  const b1 = beats[1] ?? 100, b2 = beats[2] ?? 200, b3 = beats[3] ?? 300;
  return (
    <AbsoluteFill>
      <Heading chapter={CH[1]} title="実行中に回すのは間に合わない" />
      <Stat x={80} y={150} w={520} label="コース表示のドット数" value={fmt(lerp(f, b1, b1 + 30, 0, 25024))} unit="ドット　(136×184)" color={C.white} o={fade(f, b1)} />
      <Stat x={680} y={150} w={520} label="1フレームに使えるCPU時間" value={fmt(lerp(f, b2, b2 + 30, 0, 29780))} unit="サイクル　(1.79MHz÷60)" o={fade(f, b2)} />
      <div style={{opacity: fade(f, b3)}}>
        <Label x={80} y={330} size={20} color={C.dim}>1ドットに使えるのは</Label>
        <Label x={80} y={358} size={60} weight={800} color={C.yellow}>約1.2サイクル</Label>
        <Panel x={680} y={330} w={520}>
          <div style={{fontSize: 18, color: C.dim, fontWeight: 700}}>参考：6502の命令</div>
          <div style={{fontFamily: mono, fontSize: 22, marginTop: 8, lineHeight: 1.6}}>
            LDA (src),Y　… 5サイクル<br />STA $2007　 … 4サイクル（PPUへ1バイト）
          </div>
        </Panel>
        <Tag x={80} y={470} color={C.red}>回転の計算どころか、書き込みも間に合わない</Tag>
      </div>
    </AbsoluteFill>
  );
};

const C05: React.FC<SceneProps> = ({beats}) => {
  const f = useCurrentFrame();
  const b1 = beats[1] ?? 200;
  const reveal = lerp(f, beats[0], beats[0] + 60, 0, 128);
  const showGrid = 1 - fade(f, b1, 14);
  const a = Math.max(0, Math.floor((f - b1) / 2)) % 128;
  return (
    <AbsoluteFill>
      <Heading chapter={CH[1]} title="128方向ぶん、先に回しておく" />
      <div style={{position: 'absolute', left: 64, top: 128, width: 1152, height: 576, opacity: showGrid}}>
        <Img src={staticFile('gen/thumbs.png')} style={{width: 1152, height: 576}} />
        <div style={{position: 'absolute', inset: 0, background: C.bg,
          clipPath: `polygon(${(reveal % 16) / 16 * 100}% ${Math.floor(reveal / 16) / 8 * 100}%, 100% ${Math.floor(reveal / 16) / 8 * 100}%, 100% 100%, 0% 100%, 0% ${(Math.floor(reveal / 16) + 1) / 8 * 100}%, ${(reveal % 16) / 16 * 100}% ${(Math.floor(reveal / 16) + 1) / 8 * 100}%)`}} />
      </div>
      <div style={{opacity: fade(f, b1, 14)}}>
        <Img src={staticFile(`gen/course/angle_${pad3(a)}.png`)} style={{position: 'absolute', left: 90, top: 125, width: 480, height: 480, imageRendering: 'pixelated'}} />
        <Label x={640} y={150} size={20} color={C.dim}>向き</Label>
        <Label x={640} y={176} size={64} weight={800} color={C.cyan} m>{`${pad3(a)} / 128`}</Label>
        <Label x={640} y={290} size={20} color={C.dim}>1方向の絵の大きさ</Label>
        <Label x={640} y={316} size={40} weight={800}>928 × 928 ドット</Label>
        <Tag x={640} y={420} color={C.mag} o={fade(f, beats[2] ?? 300)}>向きが変わったら、絵を切り替えるだけ</Tag>
      </div>
    </AbsoluteFill>
  );
};

const C06: React.FC<SceneProps> = ({beats}) => {
  const f = useCurrentFrame();
  const b1 = beats[1] ?? 150, b2 = beats[2] ?? 300;
  const pan = lerp(f, b2, b2 + 240, 0, -430);
  return (
    <AbsoluteFill>
      <Heading chapter={CH[1]} title="同じ模様のタイルをまとめる" />
      <Course sx={150} sy={180} sw={300} sh={300} scale={1.6} x={80} y={130} grid={8} gridO={fade(f, beats[0] + 10, 20)} />
      <Stat x={640} y={135} w={580} label="128方向 × 116 × 116 タイル" value={fmt(lerp(f, beats[0] + 20, beats[0] + 70, 0, 1722368))} unit="個" color={C.white} />
      <Label x={640} y={262} size={19} color={C.dim} o={fade(f, b1)}>芝生や道路の中は、同じ模様の繰り返し</Label>
      <Stat x={640} y={300} w={580} label="同じ模様をまとめた固有のタイル" value={fmt(lerp(f, b2, b2 + 40, 1722368, 61478))} unit="種類 → キャラクターROM" color={C.cyan} o={fade(f, b2)} />
      <div style={{position: 'absolute', left: 640, top: 430, width: 580, height: 175, overflow: 'hidden', border: `1.5px solid ${C.line}`, opacity: fade(f, b2 + 20)}}>
        <Img src={staticFile('gen/atlas_q0.png')} style={{position: 'absolute', top: pan, width: 580, imageRendering: 'pixelated'}} />
      </div>
    </AbsoluteFill>
  );
};

const Bits: React.FC<{x: number; y: number; label: string; cells: {t: string; w: number; c: string}[]; o?: number}> = ({x, y, label, cells, o = 1}) => (
  <div style={{position: 'absolute', left: x, top: y, opacity: o, fontFamily: font}}>
    <div style={{color: C.dim, fontSize: 16, fontWeight: 700, marginBottom: 6}}>{label}</div>
    <div style={{display: 'flex'}}>
      {cells.map((c, i) => <div key={i} style={{width: c.w, height: 52, border: `2px solid ${c.c}`, marginRight: -2, color: c.c, display: 'flex',
        alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, background: '#10151d'}}>{c.t}</div>)}
    </div>
  </div>
);

const C07: React.FC<SceneProps> = ({beats}) => {
  const f = useCurrentFrame();
  const b1 = beats[1] ?? 150, b2 = beats[2] ?? 300, b3 = beats[3] ?? 450;
  return (
    <AbsoluteFill>
      <Heading chapter={CH[1]} title="MMC5でタイルごとに区画を選ぶ" />
      <Bits x={80} y={140} label="普通のファミコン：1タイル = 1バイト" cells={[{t: 'タイル番号 8bit', w: 260, c: C.white}]} />
      <Label x={380} y={168} size={26} weight={800} o={fade(f, beats[0])}>→ 1画面で <span style={{color: C.yellow}}>256種類</span> まで</Label>
      <Bits x={80} y={260} label="MMC5の拡張RAM（ExRAM）：1タイルにもう1バイト" o={fade(f, b1)}
        cells={[{t: 'タイル番号 8bit', w: 260, c: C.white}, {t: '区画 6bit', w: 200, c: C.mag}, {t: '色 2bit', w: 110, c: C.green}]} />
      <Label x={680} y={288} size={26} weight={800} o={fade(f, b2)}>→ 256 × 64区画 = <span style={{color: C.cyan}}>16,384種類</span></Label>
      <div style={{opacity: fade(f, b3)}}>
        <Label x={80} y={390} size={18} color={C.dim}>さらに、向きに応じて4つの区画セットを切り替え（向き ÷ 4 の余り）</Label>
        {[0, 1, 2, 3].map((q) => (
          <div key={q} style={{position: 'absolute', left: 80 + q * 150, top: 425}}>
            <Img src={staticFile(`gen/course/angle_${pad3(q)}.png`)} style={{width: 128, height: 128, border: `2px solid ${C.mag}`}} />
            <Label x={0} y={134} w={132} align="center" size={16} color={C.mag} m>{`セット${q}`}</Label>
          </div>
        ))}
        <Label x={700} y={445} size={26} weight={800}>16,384 × 4 = <span style={{color: C.cyan}}>65,536種類</span></Label>
        <Label x={700} y={490} size={18} color={C.dim}>キャラクターROM 1MB をすべて背景に使う</Label>
      </div>
    </AbsoluteFill>
  );
};

const kinds = blocks.kinds as string[][];
const C08: React.FC<SceneProps> = ({beats}) => {
  const f = useCurrentFrame();
  const b1 = beats[1] ?? 150, b2 = beats[2] ?? 300, b3 = beats[3] ?? 450;
  const S = 0.5625, B = 32 * S;
  const [bx, by] = [9, 9];
  return (
    <AbsoluteFill>
      <Heading chapter={CH[1]} title="4×4タイルのブロック辞書" />
      <Course sx={0} sy={0} sw={928} sh={928} scale={S} x={70} y={125} grid={32} gridO={fade(f, beats[0] + 30, 20)} gridColor="rgba(255,255,255,0.45)">
        {kinds.map((row, y) => row.map((k, x) => (
          <div key={`${x}-${y}`} style={{position: 'absolute', left: x * B, top: y * B, width: B, height: B, boxSizing: 'border-box',
            background: k === 'u' ? `rgba(7,9,13,${0.62 * fade(f, b1, 16)})` : undefined,
            border: k === 'd' ? `1.5px solid rgba(245,82,210,${fade(f, b2, 16)})` : undefined}} />
        )))}
        <div style={{position: 'absolute', left: bx * B - 2, top: by * B - 2, width: B + 4, height: B + 4, border: `3px solid ${C.yellow}`, opacity: fade(f, b2 + 20)}} />
      </Course>
      <Label x={70} y={650 - 46} size={16} color={C.dim}>向き000の地図：29×29ブロック</Label>
      <Stat x={640} y={130} w={280} label="芝生だけのブロック" value="約8割" unit="→ 1つの値" color={C.white} o={fade(f, b1)} />
      <div style={{opacity: fade(f, b2 + 20)}}>
        <Course sx={bx * 32} sy={by * 32} sw={32} sh={32} scale={5.5} x={950} y={130} grid={8} border={C.yellow} />
        <Label x={640} y={265} size={20} color={C.yellow} w={290}>道路や木を含むブロック{'\n'}= 32バイトで辞書に登録</Label>
        <Label x={640} y={340} size={17} color={C.dim} w={290}>タイル番号16個 ＋ 拡張RAMの値16個{'\n'}地図には辞書の番号だけを書く</Label>
      </div>
      <div style={{opacity: fade(f, b3)}}>
        <Stat x={640} y={440} w={280} label="辞書のブロック" value="19,775" unit="個" color={C.mag} />
        <Stat x={940} y={440} w={280} label="地図（128方向ぶん）" value="82,924" unit="バイト" color={C.cyan} />
      </div>
    </AbsoluteFill>
  );
};

/** 角度0の絵の座標で、車の位置と向きを道に沿って動かす */
const pathAt = (u: number) => {
  // 左の直線（中心線 x=215）を北へ進み、中心(300,330)・半径85の左上カーブを右へ曲がる（道路の灰色を実測）
  if (u < 1) return {x: 215, y: 480 - 150 * u, h: 0};
  const k = Math.min(1, u - 1);
  const th = Math.PI * (1 + 0.5 * k);
  return {x: 300 + 85 * Math.cos(th), y: 330 + 85 * Math.sin(th), h: 90 * k};
};
const C09: React.FC<SceneProps> = ({beats}) => {
  const f = useCurrentFrame();
  const u = lerp(f, beats[0], beats[0] + 330, 0, 2);
  const p = pathAt(u);
  const a = Math.round(((360 - p.h) % 360) / STEP) % 128;
  const phi = (a * STEP * Math.PI) / 180;
  const dx = p.x - 464, dy = p.y - 464;
  const ix = 464 + dx * Math.cos(phi) - dy * Math.sin(phi);
  const iy = 464 + dx * Math.sin(phi) + dy * Math.cos(phi);
  const wx = Math.round(ix - 68), wy = Math.round(iy - 156);
  const M = 0.52;
  return (
    <AbsoluteFill>
      <Heading chapter={CH[1]} title="走行中は、書き込むだけ" />
      <div style={{position: 'absolute', left: 70, top: 128, width: 928 * M, height: 928 * M, overflow: 'hidden'}}>
        <Img src={staticFile(`gen/course/angle_${pad3(a)}.png`)} style={{width: 928 * M, height: 928 * M}} />
        <div style={{position: 'absolute', left: Math.floor(wx / 8) * 8 * M, top: Math.floor(wy / 8) * 8 * M, width: 144 * M, height: 192 * M, border: `1px dashed ${C.cyan}`}} />
        <div style={{position: 'absolute', left: wx * M, top: wy * M, width: 136 * M, height: 184 * M, border: `2px solid ${C.yellow}`}} />
      </div>
      <Label x={70} y={612} size={16} color={C.dim} m>{`向き ${pad3(a)} / 128　切り出し位置 (${wx}, ${wy})`}</Label>
      <Course angle={a} sx={wx} sy={wy} sw={136} sh={184} scale={2.4} x={570} y={128} border={C.yellow}>
        <div style={{position: 'absolute', left: 64 * 2.4, top: 150 * 2.4, width: 8 * 2.4, height: 12 * 2.4, background: C.red, border: '2px solid #fff'}} />
      </Course>
      <div style={{position: 'absolute', left: 920, top: 130, width: 300}}>
        <Panel x={0} y={0} w={300} o={fade(f, beats[1] ?? 100)}>
          <div style={{fontSize: 17, color: C.dim, fontWeight: 700}}>1フレームに書き込むもの</div>
          <div style={{fontSize: 30, fontWeight: 800, color: C.cyan, marginTop: 4}}>432タイル</div>
          <div style={{fontSize: 17, marginTop: 4}}>18列 × 24行{'\n'}タイル番号 432 ＋ 拡張RAM 432{'\n'}= 864バイト</div>
        </Panel>
        <Panel x={0} y={210} w={300} o={fade(f, beats[2] ?? 200)}>
          <div style={{fontSize: 17, color: C.dim, fontWeight: 700}}>いつ書き込むか</div>
          <div style={{fontSize: 19, marginTop: 4}}>画面を表示していない時間に{'\n'}まとめて書き込む</div>
        </Panel>
        <Panel x={0} y={340} w={300} border={C.mag} o={fade(f, beats[4] ?? beats[3] ?? 300)}>
          <div style={{fontSize: 19, color: C.mag, fontWeight: 800}}>背景を回す計算：0</div>
          <div style={{fontSize: 16, marginTop: 4, color: C.dim}}>1ドット未満のずれはスクロールで合わせる</div>
        </Panel>
      </div>
    </AbsoluteFill>
  );
};

const C10: React.FC<SceneProps> = ({beats}) => {
  const f = useCurrentFrame();
  const b1 = beats[1] ?? 150;
  return (
    <AbsoluteFill>
      <Heading chapter={CH[1]} title="木も回転済みの絵に描き込む" />
      <Race at={14} x={70} y={130} scale={0.86} />
      <Panel x={620} y={130} w={600} border={C.green} o={fade(f, beats[0])}>
        <div style={{fontSize: 18, color: C.green, fontWeight: 800}}>背景（128方向の回転済みの絵）</div>
        <div style={{fontSize: 21, marginTop: 6}}>芝生・道路・縁石・<span style={{color: C.yellow}}>木・建物</span></div>
      </Panel>
      <Panel x={620} y={245} w={600} border={C.cyan} o={fade(f, beats[0] + 30)}>
        <div style={{fontSize: 18, color: C.cyan, fontWeight: 800}}>スプライト（ハードウェアで重ねる）</div>
        <div style={{fontSize: 21, marginTop: 6}}>自車・CPU車3台・ゴースト・時計・摩擦円・順位</div>
      </Panel>
      <div style={{opacity: fade(f, b1)}}>
        <Label x={620} y={372} size={19} color={C.dim}>スプライトは横一列に8個まで</Label>
        {Array.from({length: 9}).map((_, i) => (
          <div key={i} style={{position: 'absolute', left: 620 + i * 64, top: 410, width: 52, height: 52, borderRadius: 6,
            background: i < 8 ? '#1d2a3a' : 'transparent', border: `2px ${i < 8 ? 'solid' : 'dashed'} ${i < 8 ? C.cyan : C.red}`,
            color: i < 8 ? C.cyan : C.red, fontFamily: mono, fontWeight: 800, fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{i < 8 ? i + 1 : '×'}</div>
        ))}
        <Label x={620} y={485} size={20} w={600}>車と表示でほぼ使い切る → 木は背景の絵に描く</Label>
      </div>
    </AbsoluteFill>
  );
};

const Chart: React.FC<{x: number; y: number; w: number; h: number; series: {v: number[]; c: string; label: string}[]; cursor: number; ymax?: number; o?: number}> =
  ({x, y, w, h, series, cursor, ymax = 10, o = 1}) => (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h + 40, opacity: o, fontFamily: font}}>
      <svg width={w} height={h} style={{background: C.panel, border: `1.5px solid ${C.line}`, borderRadius: 8}}>
        {[0, 2, 4, 6, 8, 10].filter((t) => t <= ymax).map((t) => (
          <g key={t}><line x1={36} x2={w - 8} y1={h - 20 - (t / ymax) * (h - 40)} y2={h - 20 - (t / ymax) * (h - 40)} stroke={C.line} />
            <text x={8} y={h - 15 - (t / ymax) * (h - 40)} fill={C.dim} fontSize={13}>{t}</text></g>
        ))}
        {series.map((s) => (
          <polyline key={s.label} fill="none" stroke={s.c} strokeWidth={2.5}
            points={s.v.map((v, i) => `${36 + (i / 127) * (w - 46)},${h - 20 - (Math.min(v, ymax) / ymax) * (h - 40)}`).join(' ')} />
        ))}
        <line x1={36 + (cursor / 127) * (w - 46)} x2={36 + (cursor / 127) * (w - 46)} y1={10} y2={h - 20} stroke={C.yellow} strokeWidth={2} />
      </svg>
      <div style={{color: C.dim, fontSize: 15, marginTop: 6}}>横：向き 0〜127　縦：木の中心のずれ（ドット、回転を戻して計測）　{series.map((s) => <span key={s.label} style={{color: s.c, marginLeft: 10}}>■ {s.label}</span>)}</div>
    </div>
  );

const Jitter: React.FC<{v: 'v8' | 'v18'; a: number; x: number; y: number; scale: number; color: string; label: string}> = ({v, a, x, y, scale, color, label}) => (
  <div style={{position: 'absolute', left: x, top: y}}>
    <Img src={staticFile(`gen/jitter/${v}/${pad3(a)}.png`)} style={{width: 380 * scale, height: 350 * scale, imageRendering: 'pixelated', border: `2px solid ${color}`, display: 'block'}} />
    <div style={{color, fontFamily: font, fontSize: 18, fontWeight: 800, marginTop: 6}}>{label}</div>
  </div>
);

const C11: React.FC<SceneProps> = ({beats}) => {
  const f = useCurrentFrame();
  const a = Math.floor(f / 3) % 128;
  return (
    <AbsoluteFill>
      <Heading chapter={CH[1]} title="18本の木は、ガタついた" />
      <Jitter v="v18" a={a} x={70} y={130} scale={1.2} color={C.red} label={`18本版（回転を打ち消して表示）　向き ${pad3(a)}`} />
      <Label x={600} y={135} size={20} w={620} o={fade(f, beats[0] + 20)}>辞書の容量に収めるため、木の絵を{'\n'}<span style={{color: C.yellow}}>8ドット単位でずらして</span>既存のタイルを使い回した</Label>
      <Chart x={600} y={250} w={620} h={260} cursor={a} series={[{v: track.v18, c: C.red, label: '18本版'}]} o={fade(f, beats[1] ?? 150)} />
    </AbsoluteFill>
  );
};

const INSIDE = [[160, 170], [136, 328], [280, 436], [482, 502], [500, 320]];
const OUTSIDE = [[210, 43], [168, 470], [520, 630]];
const C12: React.FC<SceneProps> = ({beats}) => {
  const f = useCurrentFrame();
  const a = Math.floor(f / 3) % 128;
  const b1 = beats[2] ?? 300, b2 = beats[3] ?? 450;
  const first = 1 - fade(f, b1 - 10, 14);
  const M = 0.56;
  return (
    <AbsoluteFill>
      <Heading chapter={CH[1]} title="8本にして、1ドット単位で置き直す" />
      <div style={{opacity: first}}>
        <Jitter v="v18" a={a} x={70} y={130} scale={0.92} color={C.red} label="18本版" />
        <Jitter v="v8" a={a} x={450} y={130} scale={0.92} color={C.cyan} label="8本版：誤差0.5ドット未満" />
        <Chart x={830} y={130} w={390} h={300} cursor={a} series={[{v: track.v18, c: C.red, label: '18本'}, {v: track.v8, c: C.cyan, label: '8本'}]} />
      </div>
      <div style={{opacity: fade(f, b1)}}>
        <Course sx={0} sy={0} sw={928} sh={928} scale={M} x={70} y={125}>
          {[...INSIDE.map((p) => ({p, c: C.cyan})), ...OUTSIDE.map((p) => ({p, c: C.mag}))].map(({p, c}, i) => (
            <div key={i} style={{position: 'absolute', left: (p[0] + 145) * M - 16, top: (p[1] + 143) * M - 16, width: 32, height: 32, borderRadius: 16, border: `3px solid ${c}`}} />
          ))}
        </Course>
        <Label x={620} y={140} size={22} color={C.cyan}>● 内側：クリッピングポイントの目印（5本）</Label>
        <Label x={620} y={180} size={22} color={C.mag}>● 外側：曲がり切れないと当たる（3本）</Label>
        <div style={{opacity: fade(f, b2)}}>
          <Img src={staticFile('gen/explosion-fire.png')} style={{position: 'absolute', left: 620, top: 250, width: 288, height: 270, imageRendering: 'pixelated'}} />
          <Img src={staticFile('gen/game-over.png')} style={{position: 'absolute', left: 930, top: 250, width: 288, height: 270, imageRendering: 'pixelated'}} />
          <Label x={620} y={528} size={18} color={C.dim}>木や建物にぶつかると爆発 → GAME OVER</Label>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 第2章 ----------

const LINE_Y = 128, LINE_H = 1.9;
const C13: React.FC<SceneProps> = ({beats}) => {
  const f = useCurrentFrame();
  const b2 = beats[2] ?? 300, b3 = beats[3] ?? 450;
  const h = Math.round(lerp(f, b2, b2 + 90, 160, 184));
  const top = 216 - h;
  const seg = (y0: number, y1: number, color: string, label: string, tc = C.white) => (
    <div style={{position: 'absolute', left: 0, top: y0 * LINE_H, width: 150, height: (y1 - y0) * LINE_H, background: color, boxSizing: 'border-box',
      border: `1px solid ${C.line}`, color: tc, fontFamily: font, fontSize: 15, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{label}</div>
  );
  const budget: Record<number, number> = {160: 9822, 168: 9273, 176: 8365, 184: 7449};
  return (
    <AbsoluteFill>
      <Heading chapter={CH[2]} title="転送できるのは、画面を消している間だけ" />
      <div style={{position: 'absolute', left: 90, top: LINE_Y}}>
        {seg(0, top, '#1e2633', '黒（転送）', C.yellow)}
        {seg(top, 216, C.grass, `コース ${h}ライン`)}
        {seg(216, 240, '#1e2633', '黒（転送）', C.yellow)}
        {seg(240, 262, '#2b2140', 'VBlank', C.mag)}
        <Label x={160} y={-6} size={14} color={C.dim} m>0</Label>
        <Label x={160} y={top * LINE_H - 10} size={14} color={C.dim} m>{String(top)}</Label>
        <Label x={160} y={216 * LINE_H - 10} size={14} color={C.dim} m>216</Label>
        <Label x={160} y={262 * LINE_H - 14} size={14} color={C.dim} m>262</Label>
      </div>
      <Panel x={330} y={140} w={880} o={fade(f, beats[1] ?? 100)}>
        <div style={{fontSize: 19}}>1フレーム = 262ライン。コースの上下を黒く消して、その間に<span style={{color: C.yellow}}>432タイル分</span>を書き込む</div>
      </Panel>
      <div style={{opacity: fade(f, b2)}}>
        {[160, 168, 176, 184].map((v, i) => (
          <div key={v} style={{position: 'absolute', left: 330, top: 240 + i * 62, fontFamily: font, color: v === h ? C.white : C.dim, fontSize: 22, fontWeight: 800}}>
            <span style={{display: 'inline-block', width: 110}}>{`縦${v}`}</span>
            <span style={{display: 'inline-block', width: (budget[v] / 10000) * 560, height: 26, background: v === h ? C.cyan : '#25303d', verticalAlign: 'middle', borderRadius: 4}} />
            <span style={{marginLeft: 12}}>{fmt(budget[v])} サイクル</span>
          </div>
        ))}
        <Label x={330} y={490} size={16} color={C.dim}>転送に使える時間（予算）</Label>
      </div>
      <Tag x={330} y={535} color={C.yellow} o={fade(f, b3)}>1ライン ≈ 114サイクル　8ラインで ≈ 900サイクル減る</Tag>
    </AbsoluteFill>
  );
};

type Row = {label: string; max: number; budget: number; ok: boolean; note: string};
const ROWS: Row[] = [
  {label: '144×160（旧方式）', max: 9638, budget: 9822, ok: true, note: ''},
  {label: '144×168（旧方式）', max: 10157, budget: 9280, ok: false, note: '68,515通りで超過 → 処理落ち'},
  {label: '144×168（新方式）', max: 9220, budget: 9273, ok: true, note: ''},
  {label: '144×176', max: 8365, budget: 8365, ok: true, note: ''},
  {label: '144×184', max: 8685, budget: 7449, ok: false, note: '1,236サイクル不足'},
  {label: '136×184（右8ドット削減）', max: 7347, budget: 7449, ok: true, note: '243万通りすべてで収まる'},
];
const Bars: React.FC<{rows: {r: Row; o: number}[]; x: number; y: number}> = ({rows, x, y}) => {
  const W = 520 / 11000;
  return (
    <div style={{position: 'absolute', left: x, top: y, fontFamily: font}}>
      {rows.map(({r, o}, i) => (
        <div key={r.label} style={{position: 'relative', height: 66, opacity: o}}>
          <div style={{position: 'absolute', left: 0, top: 18, width: 300, color: C.white, fontSize: 20, fontWeight: 800}}>{r.label}</div>
          <div style={{position: 'absolute', left: 310, top: 16, width: r.max * W, height: 26, background: r.ok ? C.cyan : C.red, borderRadius: 4}} />
          <div style={{position: 'absolute', left: 310 + r.budget * W, top: 8, width: 3, height: 42, background: C.yellow}} />
          <div style={{position: 'absolute', left: 310 + 11000 * W + 14, top: 4, color: r.ok ? C.green : C.red, fontSize: 18, fontWeight: 800, width: 260}}>
            {`${fmt(r.max)} / ${fmt(r.budget)}`}<div style={{fontSize: 15, color: C.dim}}>{r.note}</div>
          </div>
        </div>
      ))}
      <div style={{color: C.dim, fontSize: 15, marginTop: 4}}>棒：243万通りの組み合わせでの最大転送時間（サイクル）　黄線：予算</div>
    </div>
  );
};

const C14: React.FC<SceneProps> = ({beats}) => {
  const f = useCurrentFrame();
  const b1 = beats[1] ?? 150, b2 = beats[2] ?? 300, b3 = beats[3] ?? 450;
  return (
    <AbsoluteFill>
      <Heading chapter={CH[2]} title="160から176へ" />
      <Bars x={70} y={140} rows={[{r: ROWS[0], o: fade(f, beats[0])}, {r: ROWS[1], o: fade(f, b1)}, {r: ROWS[2], o: fade(f, b3)}, {r: ROWS[3], o: fade(f, b3 + 25)}]} />
      <Panel x={70} y={440} w={560} border={C.red} o={fade(f, b2)}>
        <div style={{fontSize: 17, color: C.dim, fontWeight: 700}}>全数検査</div>
        <div style={{fontSize: 22, marginTop: 4}}>128方向 × すべての位置 = <span style={{color: C.cyan, fontWeight: 800}}>2,437,120通り</span></div>
        <div style={{fontSize: 19, marginTop: 4, color: C.red}}>そのうち 68,515通りで時間が足りない</div>
      </Panel>
      <Race at={0.8} x={700} y={440} scale={0.3} border={C.red} />
      <Label x={890} y={450} size={17} color={C.dim} o={fade(f, b2)}>スタート付近：{'\n'}ここを通るたびに{'\n'}画面の更新が止まった</Label>
    </AbsoluteFill>
  );
};

const C15: React.FC<SceneProps> = ({beats}) => {
  const f = useCurrentFrame();
  const b1 = beats[1] ?? 150, b2 = beats[2] ?? 300, b3 = beats[3] ?? 450;
  const showA = 1 - fade(f, b2 - 6, 12);
  const S = 2.0;
  return (
    <AbsoluteFill>
      <Heading chapter={CH[2]} title="右を8ドット削って、184" />
      <div style={{opacity: showA}}>
        <Bars x={70} y={140} rows={[{r: ROWS[3], o: 1}, {r: ROWS[4], o: fade(f, beats[0])}]} />
        <div style={{opacity: fade(f, b1)}}>
          <Course sx={168} sy={240} sw={144} sh={184} scale={S} x={760} y={300 - 160} border={C.line}>
            <div style={{position: 'absolute', left: 136 * S, top: 0, width: 8 * S, height: 184 * S,
              background: 'repeating-linear-gradient(45deg, rgba(255,90,90,0.85) 0 4px, rgba(0,0,0,0.85) 4px 8px)'}} />
          </Course>
          <Label x={760} y={515} size={18} w={440}>右端8ドットを削る{'\n'}転送：19列 → 18列（456 → 432タイル）</Label>
        </div>
      </div>
      <div style={{opacity: fade(f, b2)}}>
        <Course sx={168} sy={264} sw={144} sh={160} scale={S} x={90} y={130 + 48} border={C.dim} />
        <Label x={90} y={510} size={20} color={C.dim}>最初：144×160</Label>
        <Course sx={168} sy={240} sw={136} sh={184} scale={S} x={420} y={130} border={C.cyan} />
        <Label x={420} y={510} size={20} color={C.cyan}>現在：136×184</Label>
        <Label x={720} y={150} size={22} w={500}>横を8ドット狭くする代わりに、{'\n'}縦を24ライン伸ばして先を見せる</Label>
        <Panel x={720} y={270} w={500} border={C.green} o={fade(f, b3)}>
          <div style={{fontSize: 17, color: C.dim, fontWeight: 700}}>136×184：243万通りでの最大転送時間</div>
          <div style={{fontSize: 34, fontWeight: 800, color: C.cyan, marginTop: 4}}>7,347<span style={{fontSize: 20, color: C.white}}> / 予算 7,449 サイクル</span></div>
          <div style={{fontSize: 19, color: C.green, marginTop: 4, fontWeight: 800}}>すべての組み合わせで時間内</div>
        </Panel>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 第3章 ----------

const HUD: [number, number, number, number] = [392, 252, 148, 148];
const Circle: React.FC<{x: number; y: number; r: number; dx: number; dy: number; label?: string}> = ({x, y, r, dx, dy, label}) => {
  const over = Math.hypot(dx, dy) > r;
  const c = over ? C.red : C.white;
  return (
    <div style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: '50%', border: `3px solid ${c}`}} />
      <div style={{position: 'absolute', left: r + Math.max(-r * 1.25, Math.min(r * 1.25, dx)) - 6, top: r + Math.max(-r * 1.25, Math.min(r * 1.25, dy)) - 6, width: 12, height: 12, borderRadius: 6, background: c}} />
      {label ? <div style={{position: 'absolute', top: r * 2 + 6, width: r * 2, textAlign: 'center', color: C.dim, fontFamily: font, fontSize: 15, fontWeight: 700}}>{label}</div> : null}
    </div>
  );
};

const C16: React.FC<SceneProps> = ({beats}) => {
  const f = useCurrentFrame();
  const b1 = beats[1] ?? 150, b2 = beats[2] ?? 300;
  const dx = lerp(f, b2, b2 + 90, 0, 80);
  return (
    <AbsoluteFill>
      <Heading chapter={CH[3]} title="4つの円は、4つのタイヤ" />
      <Race at={20} x={70} y={130} scale={0.62} />
      <Race at={20} x={460} y={130} scale={3.1} crop={HUD} border={C.cyan} />
      <Label x={70} y={480} size={16} color={C.dim} w={360}>右のHUD：上が前輪、下が後輪</Label>
      <div style={{opacity: fade(f, b1)}}>
        <Circle x={1060} y={300} r={95} dx={dx} dy={-dx * 0.3} />
        <Label x={930} y={410} size={18} w={300} align="center">円の大きさ = 力の上限{'\n'}（摩擦係数 × 荷重）</Label>
        <Label x={930} y={470} size={18} w={300} align="center" color={C.dim} o={fade(f, b2)}>点 = タイヤに求められている力{'\n'}上限を超えると赤</Label>
      </div>
    </AbsoluteFill>
  );
};

const C17: React.FC<SceneProps> = ({beats}) => {
  const f = useCurrentFrame();
  const b1 = beats[1] ?? 150;
  const brake = fade(f, beats[0] + 10, 30) * (1 - fade(f, b1 + 30, 30));
  const turn = fade(f, b1 + 30, 30);
  const fr = 46 + 22 * brake + 8 * turn, rr = 46 - 14 * brake - 4 * turn;
  const fy = 30 * brake, sx = 34 * turn;
  return (
    <AbsoluteFill>
      <Heading chapter={CH[3]} title="ブレーキで、前輪に荷重を乗せる" />
      <Race at={31} x={70} y={130} scale={2.5} crop={HUD} border={C.cyan} />
      <div style={{position: 'absolute', left: 660, top: 140, width: 300, height: 440}}>
        <div style={{position: 'absolute', left: 105, top: 60, width: 90, height: 300, background: '#c63b3b', borderRadius: 26, border: '3px solid #fff'}} />
        <Circle x={70} y={110} r={fr} dx={-sx} dy={-fy} label="前左" />
        <Circle x={230} y={110} r={fr} dx={-sx} dy={-fy} label="前右" />
        <Circle x={70} y={320} r={rr} dx={-sx * 0.8} dy={-fy * 0.5} label="後左" />
        <Circle x={230} y={320} r={rr} dx={-sx * 0.8} dy={-fy * 0.5} label="後右" />
      </div>
      <Tag x={1000} y={190} color={C.yellow} o={brake}>ブレーキ：荷重が前へ</Tag>
      <Tag x={1000} y={250} color={C.cyan} o={turn}>旋回：前輪が横の力を出す</Tag>
      <Label x={1000} y={320} size={18} w={230} color={C.dim} o={turn}>減速 → 前に荷重 → 曲がる{'\n'}4輪それぞれの計算から{'\n'}自然に出てくる</Label>
    </AbsoluteFill>
  );
};

const C18: React.FC<SceneProps> = ({beats}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Heading chapter={CH[3]} title="GRIPとDRIFT" />
      <div style={{position: 'absolute', left: 70, top: 130, width: 480, height: 450, background: '#000', overflow: 'hidden'}}>
        <OffthreadVideo src={staticFile('media/title.mp4')} muted style={{width: 480, height: 450}} />
      </div>
      <Panel x={600} y={140} w={620} border={C.green} o={fade(f, beats[0])}>
        <div style={{fontSize: 24, fontWeight: 800, color: C.green}}>GRIP MODE</div>
        <div style={{fontSize: 19, marginTop: 6}}>ドリフトの補助なし。摩擦円の計算だけで走る{'\n'}Bは強めのブレーキ</div>
      </Panel>
      <Panel x={600} y={290} w={620} border={C.yellow} o={fade(f, beats[1] ?? 150)}>
        <div style={{fontSize: 24, fontWeight: 800, color: C.yellow}}>DRIFT MODE</div>
        <div style={{fontSize: 19, marginTop: 6}}>後輪を滑らせやすくする補正を加え{'\n'}ドリフトでコーナーを抜ける</div>
      </Panel>
      <Tag x={600} y={450} color={C.cyan} o={fade(f, beats[2] ?? 300)}>物理の計算：毎秒60回（4輪それぞれ）</Tag>
    </AbsoluteFill>
  );
};

// ---------- 第4章 ----------

const C19: React.FC<SceneProps> = ({beats}) => {
  const f = useCurrentFrame();
  const b2 = beats[2] ?? 300, b3 = beats[3] ?? 450;
  const steps = ['指示（普通の言葉）', 'ソースの変更', 'ROMのビルド', 'エミュレーターで検証', 'ROMを渡す'];
  const list = commits as {d: string; s: string}[];
  const scroll = lerp(f, b3, b3 + 300, 0, -280);
  return (
    <AbsoluteFill>
      <Heading chapter={CH[4]} title="普通の言葉で指示する" />
      <Quote x={70} y={135} w={620} o={fade(f, beats[1] ?? 60)}>縦解像度がどこまで増やせるか、最適化を進めながら60fpsを維持できる状態で解像度を増やしていって。</Quote>
      <div style={{opacity: fade(f, b2)}}>
        {steps.map((s, i) => (
          <div key={s} style={{position: 'absolute', left: 70, top: 330 + i * 52, fontFamily: font, fontSize: 20, fontWeight: 800,
            color: i === 0 ? C.cyan : C.white, opacity: fade(f, b2 + i * 8)}}>{`${i === 0 ? '人' : 'AI'}　${s}`}</div>
        ))}
      </div>
      <div style={{position: 'absolute', left: 740, top: 135, width: 480, height: 420, overflow: 'hidden', opacity: fade(f, b3), border: `1.5px solid ${C.line}`, borderRadius: 8, background: C.panel}}>
        <div style={{position: 'absolute', top: 12 + scroll, left: 14, right: 14, fontFamily: mono, fontSize: 14, color: C.dim, lineHeight: 1.65}}>
          {list.map((c, i) => <div key={i}><span style={{color: C.cyan}}>{c.d}</span>  {c.s}</div>)}
        </div>
      </div>
      <Label x={740} y={566} size={20} weight={800} o={fade(f, b3)}>10/13〜10/19　<span style={{color: C.cyan}}>133コミット</span></Label>
    </AbsoluteFill>
  );
};

const C20: React.FC<SceneProps> = ({beats}) => {
  const f = useCurrentFrame();
  const b1 = beats[1] ?? 150, b2 = beats[2] ?? 300, b3 = beats[3] ?? 450;
  return (
    <AbsoluteFill>
      <Heading chapter={CH[4]} title="決めるのは、遊んだ人" />
      <Quote x={70} y={130} w={540} o={fade(f, beats[0])}>かなり処理落ちが酷い。ゲーム開始直後にいきなりガタガタまともに遊べないレベルで落ちるようになったので、解決してほしい</Quote>
      <Tag x={70} y={300} color={C.cyan} o={fade(f, b1)}>AI：2,437,120通りの全数検査を作り、原因を特定</Tag>
      <Quote x={660} y={130} w={560} o={fade(f, b2)}>木を増やしたら、すごくガタガタ動くようになったんだけど、ずれを許容して無理矢理増やしてる？</Quote>
      <Quote x={70} y={380} w={540} o={fade(f, b3)}>どうしようもないなら、画面左端8ドットを黒帯にして横を縮めてでも縦は伸ばしたい。</Quote>
      <div style={{opacity: fade(f, b3 + 30)}}>
        <Panel x={660} y={380} w={270} border={C.cyan}><div style={{fontSize: 17, color: C.cyan, fontWeight: 800}}>AI</div><div style={{fontSize: 19, marginTop: 4}}>実装・ビルド{'\n'}網羅的な検査</div></Panel>
        <Panel x={950} y={380} w={270} border={C.yellow}><div style={{fontSize: 17, color: C.yellow, fontWeight: 800}}>人</div><div style={{fontSize: 19, marginTop: 4}}>遊んで判断{'\n'}何を優先するか</div></Panel>
      </div>
    </AbsoluteFill>
  );
};

const C21: React.FC<SceneProps> = ({beats}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Heading chapter={CH[4]} title="ブラウザでも遊べる" />
      <div style={{position: 'absolute', left: 70, top: 125, width: 600, height: 480, overflow: 'hidden', border: `1.5px solid ${C.line}`}}>
        <OffthreadVideo src={staticFile('media/web.mp4')} muted style={{width: 600, height: 594}} />
      </div>
      <Tag x={720} y={150} color={C.cyan} o={fade(f, beats[0] + 20)}>オンラインランキング（GRIP / DRIFT）</Tag>
      <Tag x={720} y={210} color={C.mag} o={fade(f, beats[1] ?? 150)}>リプレイ再生・ゴースト対戦</Tag>
      <Race at={36} x={720} y={280} scale={0.55} />
    </AbsoluteFill>
  );
};

// ---------- まとめ ----------

const C22: React.FC<SceneProps> = ({beats}) => {
  const f = useCurrentFrame();
  const items = ['128方向の回転済みの絵', '61,478種類のタイル', '19,775個のブロック辞書', '82,924バイトの地図', '毎フレーム432タイルを書き込むだけ'];
  return (
    <AbsoluteFill>
      <Race at={42} x={70} y={70} scale={0.98} volume={0.25} />
      {items.map((s, i) => (
        <Label key={s} x={700} y={110 + i * 64} size={26} weight={800} color={i === 4 ? C.mag : C.white} o={fade(f, beats[0] + 30 + i * 22)}>{s}</Label>
      ))}
      <Label x={700} y={460} size={22} color={C.cyan} o={fade(f, beats[1] ?? 300)}>その書き込み時間を、1ラインずつ分け合う</Label>
    </AbsoluteFill>
  );
};

const C23: React.FC<SceneProps> = ({dur}) => {
  const f = useCurrentFrame();
  const end = fade(f, dur - 70, 20);
  return (
    <AbsoluteFill>
      <Race at={52.5} x={346} y={70} scale={1.07} volume={0.8 * (1 - end)} />
      <AbsoluteFill style={{background: C.bg, opacity: end, justifyContent: 'center', alignItems: 'center'}}>
        <div style={{width: 480, height: 450, overflow: 'hidden'}}>
          <OffthreadVideo src={staticFile('media/title.mp4')} muted startFrom={30} style={{width: 480, height: 450}} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const SCENES: Record<string, React.FC<SceneProps>> = {
  C01, C02, C03, C04, C05, C06, C07, C08, C09, C10, C11, C12, C13, C14, C15, C16, C17, C18, C19, C20, C21, C22, C23,
};
