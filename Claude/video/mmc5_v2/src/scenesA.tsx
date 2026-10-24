import React from 'react';
import {Img, staticFile, useCurrentFrame} from 'remotion';
import {Bg, C, SceneTitle, Tag, cueOf, useIn} from './common';
import {Bar, Big, Card, D, Grid, Nes, Pic, Txt, at, fmt, idx, pad3, ramp} from './parts';
import dedupe from './data/dedupe.json';
import shelf from './data/shelf.json';

const K = (id: string) => (i: number) => cueOf(id, i);

// ---------------- S01 オープニング ----------------
export const S01: React.FC = () => {
  const f = useCurrentFrame(), k = K('S01');
  const from = 420, i = from + f;
  return (
    <Bg>
      <Nes src="drift1" from={from} x={70} y={40} w={900} volume={0.4} />
      <Txt x={1040} y={70} size={30} color={C.violet} o={useIn(k(0))}>FAMILY COMPUTER ／ 6502 ／ MMC5</Txt>
      <Txt x={1040} y={120} size={86} o={useIn(k(0) + 8)}>{'画面ごと、\n回る。'}</Txt>
      <Card x={1040} y={360} w={800} color={C.cyan} o={useIn(k(1))}>
        <div style={{fontSize: 28, color: C.sub, fontWeight: 700}}>このコマで表示している向き</div>
        <div style={{fontSize: 64, fontWeight: 900, color: C.cyan, fontFamily: 'Consolas'}}>{pad3(at(D.angle, i))} / 128</div>
        <div style={{fontSize: 28, color: C.sub, fontWeight: 700, marginTop: 10}}>画面の更新：毎秒60コマ・取りこぼし 0</div>
      </Card>
      <Card x={1040} y={600} w={800} color={C.red} o={useIn(k(2))}>
        <div style={{fontSize: 44, fontWeight: 900, color: C.red}}>ファミコンに「画面の回転」機能はない</div>
      </Card>
      <div style={{position: 'absolute', left: 1040, top: 760, opacity: useIn(k(3))}}>
        <Tag color={C.amber}>Web版ランキング DRIFT 1位の走り（0:36.95）</Tag>
      </div>
    </Bg>
  );
};

// ---------------- S02 回せないはずの画面 ----------------
const Mode7: React.FC<{o: number}> = ({o}) => {
  const f = useCurrentFrame();
  return (
    <div style={{position: 'absolute', left: 120, top: 200, width: 640, height: 420, opacity: o, perspective: 700, overflow: 'hidden', borderRadius: 16,
      background: 'linear-gradient(#5aa0ff,#a8d0ff)'}}>
      <div style={{position: 'absolute', left: -300, top: 120, width: 1240, height: 1240, transform: `rotateX(64deg) rotateZ(${f * 0.6}deg)`,
        backgroundImage: 'repeating-conic-gradient(#3c8a2c 0 25%, #5fb03f 0 50%)', backgroundSize: '120px 120px'}} />
      <div style={{position: 'absolute', left: 20, top: 16, fontSize: 32, fontWeight: 800, color: '#0a1530'}}>スーパーファミコン：モード7</div>
    </div>
  );
};
export const S02: React.FC = () => {
  const f = useCurrentFrame(), k = K('S02');
  const t1 = k(1), t2 = k(2), t3 = k(3), t4 = k(4);
  const m7 = useIn(k(0)) * (1 - ramp(f, t1 - 10, t1 + 6));
  const sc = 3, s = Math.max(0, f - t2);
  const dx = 18 * Math.sin(s / 28), dy = 14 * Math.cos(s / 37);
  return (
    <Bg>
      <SceneTitle label="回せないはずの画面" />
      <Mode7 o={m7} />
      <Txt x={820} y={260} size={44} w={980} o={m7}>{'背景1枚を、ハードウェアが\n拡大・回転してくれる'}</Txt>
      <div style={{opacity: ramp(f, t1, t1 + 16)}}>
        <div style={{position: 'absolute', left: 140, top: 150, width: 136 * sc, height: 184 * sc, overflow: 'hidden', borderRadius: 6}}>
          <Img src={staticFile('gen/still_640.png')} style={{position: 'absolute', left: -0 * sc + dx * (s > 0 ? 1 : 0), top: -32 * sc + dy * (s > 0 ? 1 : 0),
            width: 256 * sc, height: 240 * sc, imageRendering: 'pixelated'}} />
          <Grid cell={8 * sc} ox={dx % (8 * sc)} oy={dy % (8 * sc)} o={ramp(f, t1 + 10, t1 + 30)} />
        </div>
        <Txt x={140} y={720} size={30} color={C.sub} w={420}>8×8ドットのタイルのマス目</Txt>
        <Txt x={680} y={170} size={52} w={1100}>ファミコンの背景＝タイルのマス目</Txt>
        <div style={{position: 'absolute', left: 680, top: 300, opacity: ramp(f, t2, t2 + 14), display: 'flex', gap: 20}}>
          <Tag color={C.green}>上下左右にずらす：できる</Tag>
          <Tag color={C.red}>傾ける・回す：できない</Tag>
        </div>
        <Card x={680} y={420} w={1100} color={C.cyan} o={ramp(f, t3, t3 + 14)}>
          <div style={{fontSize: 30, color: C.sub, fontWeight: 700}}>CPUで1ドットずつ回して描くなら</div>
          <div style={{fontSize: 56, fontWeight: 900}}>136 × 184 ＝ <span style={{color: C.cyan}}>{fmt(ramp(f, t3, t3 + 40, 0, 25024))}</span> ドット</div>
        </Card>
        <Card x={680} y={620} w={1100} color={C.red} o={ramp(f, t4, t4 + 14)}>
          <div style={{fontSize: 30, color: C.sub, fontWeight: 700}}>1コマのCPU時間 29,780サイクル ÷ 25,024ドット</div>
          <div style={{fontSize: 56, fontWeight: 900}}>1ドットあたり <span style={{color: C.red}}>約1.2サイクル</span></div>
          <div style={{fontSize: 30, color: C.red, fontWeight: 700, marginTop: 6}}>最も短い命令でも2サイクル</div>
        </Card>
      </div>
    </Bg>
  );
};

// ---------------- S03 種明かし ----------------
const THUMB = 100;
export const S03: React.FC = () => {
  const f = useCurrentFrame(), k = K('S03');
  const from = 300, loop = 1880, i = idx(from, f, loop), a = at(D.angle, i);
  const t1 = k(1), t2 = k(2), t3 = k(3), t4 = k(4);
  const lay = ramp(f, t2 - 6, t2 + 24);
  // グリッドの配置：中央の大きな表示 → 右側へ縮小
  const gs = 0.8 - 0.1 * lay, gx = 320 + (720 - 320) * lay, gy = 150 + (250 - 150) * lay;
  const reveal = ramp(f, t1, t1 + 70, 0, 128);
  const showGrid = ramp(f, t1, t1 + 8) * (1 - ramp(f, t4 - 8, t4 + 8));
  return (
    <Bg>
      <div style={{opacity: lay}}>
        <Nes src="drift1" from={from} loop={loop} x={60} y={210} w={620} />
      </div>
      <Big o={useIn(k(0)) * (1 - ramp(f, t1 - 10, t1))} size={130}>回していない。</Big>
      <div style={{position: 'absolute', left: gx, top: gy, width: 1600 * gs, height: 800 * gs, opacity: showGrid}}>
        <Img src={staticFile('gen/thumbs.png')} style={{width: '100%', height: '100%'}} />
        <div style={{position: 'absolute', inset: 0, background: '#0a0f1e',
          clipPath: `polygon(${(reveal % 16) / 16 * 100}% ${Math.floor(reveal / 16) / 8 * 100}%, 100% ${Math.floor(reveal / 16) / 8 * 100}%, 100% 100%, 0% 100%, 0% ${(Math.floor(reveal / 16) + 1) / 8 * 100}%, ${(reveal % 16) / 16 * 100}% ${(Math.floor(reveal / 16) + 1) / 8 * 100}%)`}} />
        <div style={{position: 'absolute', left: (a % 16) * THUMB * gs - 4, top: Math.floor(a / 16) * THUMB * gs - 4, width: THUMB * gs + 8, height: THUMB * gs + 8,
          border: `6px solid ${C.amber}`, borderRadius: 8, boxShadow: `0 0 30px ${C.amber}`, opacity: lay}} />
      </div>
      <Txt x={320} y={820 - 0} size={40} w={1280} align="center" o={ramp(f, t1 + 20, t1 + 40) * (1 - lay)}>128通りの向きの絵を、全部描いてある</Txt>
      <Txt x={720} y={830} size={40} o={ramp(f, t3, t3 + 14) * (1 - ramp(f, t4 - 8, t4))}>{`いま画面に出ている絵：No.${pad3(a)}`}</Txt>
      <div style={{opacity: ramp(f, t4 - 4, t4 + 12)}}>
        <Pic a={a} x={760} y={150} scale={0.78} style={{borderRadius: 12, boxShadow: `0 0 0 4px ${C.amber}`}} />
        <Txt x={1500} y={300} size={44} color={C.amber}>{`No.${pad3(a)}`}</Txt>
        <Txt x={1500} y={370} size={34} color={C.sub} w={380}>{'向きが変わるたびに\n絵を差し替える'}</Txt>
      </div>
    </Bg>
  );
};

// ---------------- S04 そんな量が入るのか ----------------
export const S04: React.FC = () => {
  const f = useCurrentFrame(), k = K('S04');
  const c = [0, 1, 2, 3, 4, 5, 6, 7].map(k);
  const part1 = 1 - ramp(f, c[4] - 10, c[4]);
  const ps = 0.8;
  const zoom = 2.6, dd = dedupe as {w: number; h: number; crop_unique: number; crop_tiles: number; picture_unique: number};
  return (
    <Bg>
      <SceneTitle label="そんな量が、入るのか" />
      <Big o={useIn(c[0]) * (1 - ramp(f, c[1] - 10, c[1]))}>入るのか？</Big>
      <div style={{opacity: ramp(f, c[1], c[1] + 14) * part1}}>
        <Pic a={0} x={90} y={140} scale={ps} style={{borderRadius: 10}}>
          {Array.from({length: 16}).map((_, n) => (
            <div key={n} style={{position: 'absolute', left: (n % 4) * 256 * ps - 40, top: Math.floor(n / 4) * 240 * ps - 30, width: 256 * ps, height: 240 * ps,
              border: `2px dashed ${C.cyan}`, opacity: ramp(f, c[1] + 10 + n * 3, c[1] + 20 + n * 3) * 0.9}} />
          ))}
        </Pic>
        <Txt x={880} y={160} size={46}>1枚 ＝ 928 × 928 ドット</Txt>
        <Txt x={880} y={230} size={36} color={C.cyan}>ファミコンの画面 約14枚ぶん</Txt>
        <div style={{opacity: ramp(f, c[2], c[2] + 14)}}>
          {[6, 5, 4, 3, 2, 1].map((n) => (
            <Img key={n} src={staticFile(`pictures/angle_${pad3(n * 18)}.png`)} style={{position: 'absolute', left: 900 + n * 26, top: 330 + n * 14, width: 220, height: 220,
              border: '2px solid #0a0f1e', borderRadius: 6, opacity: ramp(f, c[2] + n * 5, c[2] + n * 5 + 10)}} />
          ))}
          <Txt x={1300} y={380} size={60}>× 128</Txt>
        </div>
        <Bar x={880} y={640} len={680} color={C.red} label="そのまま持つと" value="約27.6MB" o={ramp(f, c[2] + 30, c[2] + 44)} p={ramp(f, c[2] + 30, c[2] + 70)} />
        <Bar x={880} y={770} len={680 / 27.6} color={C.green} label="ファミコンで最大の市販ソフト" value="1MB" o={ramp(f, c[3], c[3] + 14)} />
      </div>
      <div style={{opacity: ramp(f, c[4] - 4, c[4] + 12)}}>
        <div style={{position: 'absolute', left: 100, top: 140, width: dd.w * zoom, height: dd.h * zoom, borderRadius: 10, overflow: 'hidden'}}>
          <Img src={staticFile('gen/dedupe_src.png')} style={{position: 'absolute', width: '100%', height: '100%', imageRendering: 'pixelated'}} />
          <Img src={staticFile('gen/dedupe_map.png')} style={{position: 'absolute', width: '100%', height: '100%', imageRendering: 'pixelated', opacity: ramp(f, c[5], c[5] + 30)}} />
          <Grid cell={8 * zoom} color="rgba(0,0,0,.35)" o={ramp(f, c[4] + 6, c[4] + 24)} />
        </div>
        <Txt x={100} y={820} size={28} color={C.sub} o={ramp(f, c[5], c[5] + 20)}>同じ模様のタイルを同じ色で塗った図</Txt>
        <Card x={860} y={150} w={960} color={C.cyan} o={ramp(f, c[5] + 10, c[5] + 24)}>
          <div style={{fontSize: 30, color: C.sub, fontWeight: 700}}>この範囲</div>
          <div style={{fontSize: 48, fontWeight: 900}}>{fmt(dd.crop_tiles)}マス → <span style={{color: C.cyan}}>{dd.crop_unique}種類</span></div>
          <div style={{fontSize: 30, color: C.sub, fontWeight: 700, marginTop: 14}}>128枚ぜんぶ</div>
          <div style={{fontSize: 48, fontWeight: 900}}>172万マス → <span style={{color: C.cyan}}>約6万種類</span></div>
        </Card>
        <Card x={860} y={480} w={960} color={C.amber} o={ramp(f, c[6], c[6] + 14)}>
          <div style={{fontSize: 30, color: C.sub, fontWeight: 700}}>キャラクターROM 1MB（65,536枚ぶんの枠）</div>
          <div style={{height: 50, background: '#1b2643', borderRadius: 8, marginTop: 14, overflow: 'hidden'}}>
            <div style={{width: `${95 * ramp(f, c[6] + 6, c[6] + 50)}%`, height: '100%', background: C.amber}} />
          </div>
          <div style={{fontSize: 34, fontWeight: 900, color: C.amber, marginTop: 10}}>約95%が使用済み</div>
        </Card>
        <Card x={860} y={720} w={960} color={C.violet} o={ramp(f, c[7], c[7] + 14)}>
          <div style={{fontSize: 44, fontWeight: 900}}>ROM 全体 <span style={{color: C.violet}}>2MB</span>　＝ 市販最大ソフトの2倍</div>
        </Card>
      </div>
    </Bg>
  );
};

// ---------------- S05 壁1 ----------------
const SH = shelf as {used: number[]; banks: number[][]};
export const S05: React.FC = () => {
  const f = useCurrentFrame(), k = K('S05');
  const c = [0, 1, 2, 3, 4, 5].map(k);
  const sw = 640, cell = sw / 128;
  const part1 = 1 - ramp(f, c[3] - 8, c[3] + 4);
  const hue = (b: number) => `hsl(${(b * 47) % 360} 80% 60%)`;
  return (
    <Bg>
      <SceneTitle label="壁1　6万の模様を、どう呼び出すか" color={C.red} />
      <Big o={useIn(c[0]) * (1 - ramp(f, c[1] - 10, c[1]))} color={C.red}>壁1</Big>
      <div style={{opacity: part1}}>
        <div style={{position: 'absolute', left: 110, top: 200, opacity: ramp(f, c[1], c[1] + 14)}}>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(16, 24px)', gap: 3}}>
            {Array.from({length: 256}).map((_, n) => <div key={n} style={{width: 24, height: 24, background: '#24335c', border: `1px solid ${C.cyan}`}} />)}
          </div>
          <Txt x={0} y={440} size={40} w={430}>{'背景が一度に\n使える模様：256'}</Txt>
        </div>
        <div style={{position: 'absolute', left: 720, top: 150, width: sw, height: sw, opacity: ramp(f, c[2], c[2] + 14)}}>
          <Img src={staticFile('gen/shelf_q0.png')} style={{width: sw, height: sw, imageRendering: 'pixelated', opacity: 0.55}} />
          {SH.used.map((t, n) => (
            <div key={t} style={{position: 'absolute', left: (t % 128) * cell - 4, top: Math.floor(t / 128) * cell - 4, width: cell + 8, height: cell + 8,
              border: `3px solid ${C.amber}`, borderRadius: 3, opacity: ramp(f, c[2] + 20 + n * 1.5, c[2] + 30 + n * 1.5)}} />
          ))}
          {Array.from({length: 64}).map((_, b) => (
            <div key={b} style={{position: 'absolute', left: 0, top: b * 2 * cell, width: sw, height: 1, background: 'rgba(255,255,255,.18)'}} />
          ))}
        </div>
        <Txt x={1400} y={170} size={38} w={480} o={ramp(f, c[2], c[2] + 14)}>{'模様の棚\n（1組16,384枚）'}</Txt>
        <Txt x={1400} y={330} size={38} w={480} color={C.amber} o={ramp(f, c[2] + 40, c[2] + 60)}>{`ある1画面の\n${SH.used.length}種類が\n28か所に散らばる`}</Txt>
        <Txt x={720} y={800} size={24} color={C.sub} o={ramp(f, c[2], c[2] + 14)}>※ 10/15版ROMの向き000の1画面から集計</Txt>
      </div>
      <div style={{opacity: ramp(f, c[3] - 4, c[3] + 12)}}>
        <Card x={110} y={170} w={560} color={C.violet}>
          <div style={{fontSize: 56, fontWeight: 900, color: C.violet}}>MMC5</div>
          <div style={{fontSize: 30, fontWeight: 700, color: C.sub}}>カートリッジに載る拡張チップ</div>
        </Card>
        <div style={{position: 'absolute', left: 760, top: 160, opacity: ramp(f, c[4], c[4] + 14)}}>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(17, 44px)', gap: 2}}>
            {SH.banks.slice(0, 15).flatMap((row, y) => row.map((b, x) => (
              <div key={`${x}-${y}`} style={{width: 44, height: 40, background: hue(b), opacity: 0.25 + 0.75 * ramp(f, c[4] + (x + y) * 2, c[4] + (x + y) * 2 + 10),
                fontSize: 17, fontWeight: 800, color: '#0a0f1e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Consolas'}}>{b}</div>
            )))}
          </div>
          <Txt x={0} y={640} size={32} w={1000}>タイル1枚ごとに「どの棚から取るか」の番号を持つ</Txt>
        </div>
        <Card x={110} y={420} w={560} color={C.cyan} o={ramp(f, c[5], c[5] + 14)}>
          <div style={{fontSize: 30, color: C.sub, fontWeight: 700}}>1枚ずつ選べる模様</div>
          <div style={{fontSize: 46, fontWeight: 900}}>256 × 64棚 ＝ <span style={{color: C.cyan}}>16,384</span></div>
          <div style={{fontSize: 30, color: C.sub, fontWeight: 700, marginTop: 14}}>向きで4組を切り替え</div>
          <div style={{fontSize: 46, fontWeight: 900}}>× 4 ＝ <span style={{color: C.cyan}}>65,536</span></div>
        </Card>
      </div>
    </Bg>
  );
};
