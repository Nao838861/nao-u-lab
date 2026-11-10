import React from 'react';
import {Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Arrow, Bg, C, SceneTitle, Tag, cueOf, useIn} from './common';
import {Card, Label, MONO, NES, Px, PxCrop, Swatch, Txt, fmt, ramp} from './parts';
import rows3200 from './data/mode7_3200.json';
import clips from './data/car_clips.json';
import gsu from './data/gsu_code.json';

const K = (id: string) => (i: number) => cueOf(id, i);
type Seg = {y: number; valid: number; sky: number; a?: number[]; b?: number[]};
const ROWS = rows3200 as Seg[];
const VALID = ROWS.filter((r) => r.valid);
const F = 3200;

// ---------------- S03b どこで何をしているか ----------------
const FPGA_TOTAL = 6272, FPGA_USED = 6248; // 2026-11-01 採用版のFit結果（LE）
const FpgaGrid: React.FC<{p: number}> = ({p}) => {
  const cols = 112, rows = Math.ceil(FPGA_TOTAL / cols), cs = 10;
  const n = Math.round(FPGA_USED * p);
  const cells = [];
  for (let i = 0; i < FPGA_TOTAL; i++) {
    const x = (i % cols) * cs, y = Math.floor(i / cols) * cs;
    cells.push(<rect key={i} x={x} y={y} width={cs - 2} height={cs - 2} fill={i < n ? (i % 7 === 0 ? '#5fe38d' : '#2fae6a') : '#1b2643'} />);
  }
  return <svg width={cols * cs} height={rows * cs}>{cells}</svg>;
};
export const S03b: React.FC = () => {
  const f = useCurrentFrame(), k = K('S03b');
  const a1 = useIn(k(1)), a2 = useIn(k(2)), a3 = ramp(f, k(3), k(3) + 14), a4 = ramp(f, k(4), k(4) + 14), a5 = ramp(f, k(5), k(5) + 14);
  const roles = ['物理演算', 'ライバル車のAI', 'タイム計測', 'サウンド', '入力処理', 'HUD'];
  const main = 1 - Math.max(a3, a4, a5);
  // 文の途中の区切り（public/audio/S03b.wav の無音から）：処理の列挙、「ゲームは本体のCPU」、「構造としては」
  const list = k(1) + Math.round(2.87 * 60), split = k(2) + Math.round(7.23 * 60), same = k(2) + Math.round(12.52 * 60);
  return (
    <Bg>
      <SceneTitle label="どこで何をしているか" color={C.violet} />
      <Txt x={0} y={150} size={52} w={1920} align="center" o={useIn(k(0)) * (1 - a1)}>ファミコン本体は、何をしている？</Txt>
      <div style={{opacity: main}}>
        <Card x={90} y={150} w={780} h={640} color={C.violet} o={a1}>
          <div style={{fontSize: 30, color: C.sub, fontWeight: 700}}>ファミコン本体</div>
          <div style={{fontSize: 44, fontWeight: 900}}>6502（CPU）＋ PPU</div>
          <div style={{display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 24}}>
            {roles.map((r, i) => <Tag key={r} color={C.violet} style={{fontSize: 32, opacity: ramp(f, list + 30 + i * 18, list + 44 + i * 18)}}>{r}</Tag>)}
          </div>
          <div style={{fontSize: 34, fontWeight: 900, color: C.amber, marginTop: 34, opacity: ramp(f, list + 170, list + 190)}}>2D版と同じプログラム</div>
        </Card>
        <Card x={1050} y={150} w={780} h={640} color={C.cyan} o={a2}>
          <div style={{fontSize: 30, color: C.sub, fontWeight: 700}}>カートリッジ（FPGA）</div>
          <div style={{fontSize: 44, fontWeight: 900}}>3Dの絵を描く役目</div>
          <div style={{display: 'flex', flexDirection: 'column', gap: 18, marginTop: 24}}>
            <Tag color={C.cyan} style={{fontSize: 34}}>SuperFX：車・木・家を描く</Tag>
            <Tag color={C.green} style={{fontSize: 34}}>Mode7：地面を描く</Tag>
          </div>
        </Card>
        <Arrow x1={880} y1={500} x2={1040} y2={500} color={C.amber} width={6} p={ramp(f, k(2) + 10, k(2) + 40)} />
        <div style={{position: 'absolute', left: 868, top: 380, width: 190, textAlign: 'center', fontSize: 24, fontWeight: 800, color: C.amber, opacity: ramp(f, k(2) + 30, k(2) + 50)}}>毎フレーム<br />描画の<br />リクエスト</div>
        {/* 2つの枠をまたぐ帯：役割分担はスターフォックスと同じ構造 */}
        <div style={{position: 'absolute', left: 90, top: 640, width: 1740, padding: '22px 0', textAlign: 'center', background: 'rgba(8,12,26,.94)',
          border: `3px solid ${C.amber}`, borderRadius: 14, boxShadow: '0 12px 40px rgba(0,0,0,.6)', opacity: useIn(split)}}>
          <div style={{fontSize: 38, fontWeight: 900}}>ゲームは本体のCPU、3Dの描画はカートリッジ</div>
          <div style={{fontSize: 32, fontWeight: 800, color: C.amber, marginTop: 8, opacity: useIn(same)}}>スーパーファミコンのスターフォックスと同じ構造</div>
        </div>
      </div>
      <div style={{opacity: a3 * (1 - a4)}}>
        <div style={{position: 'absolute', left: 400, top: 160}}><FpgaGrid p={ramp(f, k(3), k(3) + 200)} /></div>
        <Txt x={290} y={745} size={48} w={1340} align="center">{`ロジックエレメント（LE） ${fmt(Math.round(FPGA_USED * ramp(f, k(3), k(3) + 200)))} / ${fmt(FPGA_TOTAL)}　（${(100 * FPGA_USED / FPGA_TOTAL).toFixed(1)}%）`}</Txt>
      </div>
      <div style={{opacity: a4 * (1 - a5)}}>
        {[['前回の2D版', 2097152, '2MB（128方向の絵を全部入れる）', C.red], ['今回の3D版', 1179648, '約1.1MB（毎回計算して描く）', C.green]].map(([t, b, s, c], i) => (
          <div key={String(t)} style={{position: 'absolute', left: 160, top: 260 + i * 220}}>
            <div style={{fontSize: 36, fontWeight: 900, marginBottom: 10}}>{t as string}</div>
            <div style={{display: 'flex', alignItems: 'center', gap: 24}}>
              <div style={{width: (1100 * (b as number) / 2097152) * ramp(f, k(4) + i * 20, k(4) + i * 20 + 40), height: 70, background: c as string, borderRadius: 8}} />
              <div style={{fontSize: 38, fontWeight: 900, color: c as string}}>{s as string}</div>
            </div>
          </div>
        ))}
        <Txt x={160} y={720} size={28} color={C.sub}>ROM容量（3D版：PRG 1MB＋CHR 128KB）</Txt>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 230, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26, opacity: a5}}>
        <div style={{fontSize: 52, fontWeight: 900, textShadow: '0 4px 20px #000'}}>ファミコンの「できないこと」</div>
        {['1　絵を自由に描けない', '2　地面を回せない', '3　色が足りない'].map((s, i) => (
          <div key={s} style={{fontSize: 56, fontWeight: 900, color: [C.cyan, C.green, C.amber][i], opacity: ramp(f, k(5) + 20 + i * 24, k(5) + 40 + i * 24),
            background: 'rgba(5,8,18,.85)', padding: '10px 50px', borderRadius: 16, border: `3px solid ${[C.cyan, C.green, C.amber][i]}`}}>{s}</div>
        ))}
      </div>
    </Bg>
  );
};

// ---------------- S05b Mode7の中身 ----------------
/** 横から見た図（模式図）：カメラから画面の各行を通る線が地面に当たる */
const SideView: React.FC<{row: number; o: number}> = ({row, o}) => {
  const cx = 160, cy = 200, gy = 560, sx = 330; // カメラ・地面・画面の位置
  const rows = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  return (
    <svg width={1760} height={640} style={{position: 'absolute', left: 80, top: 170, opacity: o}}>
      <line x1={0} y1={gy} x2={1760} y2={gy} stroke={NES.green} strokeWidth={8} />
      <rect x={cx - 34} y={cy - 26} width={68} height={52} rx={10} fill={C.panel2} stroke={C.cyan} strokeWidth={4} />
      <line x1={sx} y1={cy - 70} x2={sx} y2={cy + 150} stroke={C.sub} strokeWidth={5} />
      <text x={sx + 10} y={cy - 80} fill={C.sub} fontSize={28} fontWeight={800}>画面</text>
      {rows.map((r) => {
        const py = cy + 12 + r * 12; // 画面上の行
        const slope = (py - cy) / (sx - cx);
        const hit = cx + (gy - cy) / slope;
        const on = r === row;
        return <line key={r} x1={cx} y1={cy} x2={Math.min(hit, 1760)} y2={hit > 1760 ? cy + slope * (1760 - cx) : gy} stroke={on ? C.red : C.amber}
          strokeOpacity={on ? 1 : 0.35} strokeWidth={on ? 6 : 2} />;
      })}
      <text x={cx - 60} y={cy + 70} fill={C.cyan} fontSize={28} fontWeight={800}>カメラ</text>
      <text x={460} y={gy + 50} fill={C.text} fontSize={30} fontWeight={800}>近い（画面の下の行）</text>
      <text x={1300} y={gy + 50} fill={C.text} fontSize={30} fontWeight={800}>遠い（上の行）</text>
    </svg>
  );
};
const MapLines: React.FC<{x: number; y: number; size: number; row: number; walk?: number}> = ({x, y, size, row, walk}) => {
  const s = size / 640;
  const r = VALID.find((q) => q.y === row);
  return (
    <div style={{position: 'absolute', left: x, top: y, width: size, height: size, borderRadius: 8, overflow: 'hidden', boxShadow: '0 12px 44px rgba(0,0,0,.6)'}}>
      <Img src={staticFile('img/course_map.png')} style={{width: size, height: size, imageRendering: 'pixelated'}} />
      <svg width={size} height={size} style={{position: 'absolute', left: 0, top: 0}}>
        {VALID.filter((q) => q.y % 3 === 0).map((q) => <line key={q.y} x1={q.a![0] * s} y1={q.a![1] * s} x2={q.b![0] * s} y2={q.b![1] * s} stroke={C.amber} strokeOpacity={0.3} strokeWidth={2} />)}
        {r && <line x1={r.a![0] * s} y1={r.a![1] * s} x2={r.b![0] * s} y2={r.b![1] * s} stroke={C.red} strokeWidth={5} />}
        {r && walk !== undefined && (
          <circle cx={(r.a![0] + (r.b![0] - r.a![0]) * walk / 255) * s} cy={(r.a![1] + (r.b![1] - r.a![1]) * walk / 255) * s} r={10} fill="#fff" stroke={C.red} strokeWidth={4} />
        )}
      </svg>
    </div>
  );
};
const num = (v: number) => v.toFixed(2).padStart(8, ' ');
// 合成の例：木の左の縁にかかる8ドット（実画素 x, y）。マスクは layer_3200_fx.png の不透明なドット
const BLK: [number, number] = [176, 102];
const BLK_MASK = '00011111';
const Cells: React.FC<{y: number; label: string; color: string; o: number; children: React.ReactNode}> = ({y, label, color, o, children}) => (
  <div style={{opacity: o}}>
    <div style={{position: 'absolute', left: 720, top: y + 20, width: 260, fontSize: 30, fontWeight: 900, color}}>{label}</div>
    <div style={{position: 'absolute', left: 1000, top: y, width: 640, height: 80, overflow: 'hidden', borderRadius: 6, border: `2px solid ${C.line}`}}>
      {children}
      <div style={{position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(to right, rgba(0,0,0,.55) 2px, transparent 2px)', backgroundSize: '80px 80px'}} />
    </div>
  </div>
);
export const S05b: React.FC = () => {
  const f = useCurrentFrame(), k = K('S05b');
  const a1 = ramp(f, k(1), k(1) + 16), a2 = ramp(f, k(2), k(2) + 16), a3 = ramp(f, k(3), k(3) + 16), a4 = ramp(f, k(4), k(4) + 16), a5 = ramp(f, k(5), k(5) + 16);
  const a6 = ramp(f, k(6), k(6) + 16);
  const side = Math.floor(Math.max(0, f - k(1)) / 20) % 12;
  const first = VALID[0].y;
  const tableRow = Math.min(191, first + Math.floor(Math.max(0, f - k(2)) / 5) % (192 - first));
  const walkRow = 150;
  const walk = Math.min(255, Math.max(0, (f - k(3) - 20) * 1.2));
  const beam = Math.floor(Math.max(0, f - k(4)) * 1.5) % 192;
  return (
    <Bg>
      <SceneTitle label="Mode7の中身" color={C.green} />
      <div style={{opacity: 1 - a1}}>
        <Txt x={0} y={260} size={64} w={1920} align="center" o={useIn(k(0))}>Mode7 ＝ 地面を描く「計算の手順」</Txt>
        <Txt x={0} y={420} size={56} w={1920} align="center" mono color={C.green} o={useIn(k(0) + 40)}>{'u = u0 + x × du\nv = v0 + x × dv'}</Txt>
        <Txt x={0} y={640} size={32} w={1920} align="center" color={C.sub} o={useIn(k(0) + 80)}>手順なので、FPGAの中に回路として作れる</Txt>
      </div>
      <div style={{opacity: a1 * (1 - a2)}}>
        <SideView row={side} o={1} />
        <Txt x={1100} y={190} size={26} color={C.sub}>横から見た図（模式図）</Txt>
      </div>
      {/* 実際の数（このコマの行テーブル） */}
      <div style={{opacity: a2 * (1 - a3)}}>
        <div style={{position: 'absolute', left: 80, top: 160, width: 256 * 2.4, height: 192 * 2.4, overflow: 'hidden', borderRadius: 8}}>
          <Px src={`img/layer_${F}_ground.png`} x={0} y={0} w={256 * 2.4} h={240 * 2.4} />
          <div style={{position: 'absolute', left: 0, right: 0, top: tableRow * 2.4, height: 3, background: C.red}} />
        </div>
        <div style={{position: 'absolute', left: 760, top: 160, width: 1080, height: 700, overflow: 'hidden', fontFamily: MONO, fontSize: 30, background: 'rgba(5,8,18,.85)',
          borderRadius: 12, border: `2px solid ${C.line}`, padding: '14px 20px', boxSizing: 'border-box'}}>
          <div style={{color: C.sub, whiteSpace: 'pre'}}>{'ライン    u0       v0       du       dv'}</div>
          {VALID.filter((r) => Math.abs(r.y - tableRow) <= 8).map((r) => {
            const du = (r.b![0] - r.a![0]) / 255, dv = (r.b![1] - r.a![1]) / 255;
            return <div key={r.y} style={{whiteSpace: 'pre', color: r.y === tableRow ? C.amber : C.text, fontWeight: r.y === tableRow ? 900 : 500}}>
              {`${String(r.y).padStart(4, ' ')}${num(r.a![0])} ${num(r.a![1])} ${num(du)} ${num(dv)}`}</div>;
          })}
        </div>
        <Txt x={760} y={870} size={24} color={C.sub}>このフレームで実際に使った値（テクスチャの画素単位）</Txt>
      </div>
      {/* 足し算だけで1行を描く */}
      <div style={{opacity: a3 * (1 - a4)}}>
        <MapLines x={1040} y={150} size={700} row={walkRow} walk={walk} />
        <div style={{position: 'absolute', left: 80, top: 200, width: 256 * 3.6, height: 30 * 3.6, overflow: 'hidden', borderRadius: 8, border: `2px solid ${C.line}`}}>
          <PxCrop src={`img/layer_${F}_ground.png`} iw={256} ih={240} crop={[0, walkRow - 15, 256, 30]} x={0} y={0} w={256 * 3.6} />
          <div style={{position: 'absolute', left: walk * 3.6, right: 0, top: 0, bottom: 0, background: '#0a0f1e'}} />
          <div style={{position: 'absolute', left: 0, right: 0, top: 15 * 3.6, height: 3.6, border: `1px solid ${C.red}`}} />
        </div>
        <Txt x={80} y={340} size={30} color={C.sub}>{`${walkRow}ライン目`}</Txt>
        <Card x={80} y={430} w={900} color={C.green}>
          <div style={{fontFamily: MONO, fontSize: 40, fontWeight: 900, lineHeight: 1.6}}>
            {`u += du\nv += dv\n色 = テクスチャ[v][u]`.split('\n').map((l) => <div key={l}>{l}</div>)}
          </div>
          <div style={{fontSize: 30, fontWeight: 800, color: C.amber, marginTop: 10}}>{`${Math.floor(walk)} / 256 ドット`}</div>
          <div style={{fontSize: 28, fontWeight: 700, color: C.sub}}>除算は1ラインに1回。あとは加算だけ</div>
        </Card>
      </div>
      {/* 保存しない：表示の直前に1行ずつ */}
      <div style={{opacity: a4 * (1 - a5)}}>
        <div style={{position: 'absolute', left: 80, top: 160, width: 256 * 3, height: 192 * 3, overflow: 'hidden', borderRadius: 8, background: '#000'}}>
          <PxCrop src={`img/layer_${F}_ground.png`} iw={256} ih={240} crop={[0, 0, 256, 192]} x={0} y={0} w={256 * 3} style={{clipPath: `inset(0 0 ${(192 - beam) * 3}px 0)`, borderRadius: 0}} />
          <div style={{position: 'absolute', left: 0, right: 0, top: beam * 3, height: 6, background: '#fff', boxShadow: '0 0 20px #fff'}} />
        </div>
        <Card x={940} y={170} w={900} color={C.green}>
          <div style={{fontSize: 34, fontWeight: 900}}>地面はフレームバッファに保存しない</div>
          <div style={{fontSize: 28, color: C.sub, fontWeight: 700, marginTop: 10}}>テクスチャ（ROM） → ラインバッファ → すぐ表示</div>
          <div style={{display: 'flex', gap: 14, marginTop: 20}}>
            {[0, 1].map((i) => (
              <div key={i} style={{flex: 1, height: 46, borderRadius: 8, border: `3px solid ${C.green}`, background: (Math.floor(beam) % 2) === i ? `${C.green}55` : 'transparent',
                fontSize: 24, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{`ラインバッファ ${i + 1}`}</div>
            ))}
          </div>
          <div style={{fontSize: 26, color: C.sub, fontWeight: 700, marginTop: 12}}>FPGA内に2ライン分。1ラインを表示している間に次のラインを作る</div>
        </Card>
      </div>
      {/* 合成：8ドットずつ、地面とSuperFXの絵を重ねてラインバッファへ */}
      <div style={{opacity: a5 * (1 - a6)}}>
        <PxCrop src={`img/layer_${F}_full.png`} iw={256} ih={240} crop={[0, 0, 256, 192]} x={80} y={170} w={576}>
          <div style={{position: 'absolute', left: (BLK[0] - 4) * 2.25, top: (BLK[1] - 4) * 2.25, width: 16 * 2.25, height: 9 * 2.25, border: `3px solid ${C.amber}`, borderRadius: 4}} />
        </PxCrop>
        <Txt x={80} y={615} size={26} color={C.sub} w={576}>{`${BLK[1]}ライン目の${BLK[0]}〜${BLK[0] + 7}ドット`}</Txt>
        <Cells y={150} label="Mode7の地面" color={C.green} o={ramp(f, k(5) + 205, k(5) + 221)}>
          <PxCrop src={`img/layer_${F}_ground.png`} iw={256} ih={240} crop={[BLK[0], BLK[1], 8, 1]} x={0} y={0} w={640} style={{borderRadius: 0}} />
        </Cells>
        <Cells y={240} label="SuperFXの絵" color={C.cyan} o={ramp(f, k(5) + 368, k(5) + 384)}>
          <div style={{position: 'absolute', inset: 0, background: 'repeating-conic-gradient(#2a3350 0% 25%, #151b2e 0% 50%) 0 0 / 40px 40px'}} />
          <PxCrop src={`img/layer_${F}_fx.png`} iw={256} ih={240} crop={[BLK[0], BLK[1], 8, 1]} x={0} y={0} w={640} style={{borderRadius: 0}} />
        </Cells>
        <Cells y={330} label="マスク" color={C.amber} o={ramp(f, k(5) + 450, k(5) + 466)}>
          {[...BLK_MASK].map((m, i) => (
            <div key={i} style={{position: 'absolute', left: i * 80, top: 0, width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: MONO, fontSize: 40, fontWeight: 900, color: m === '1' ? C.amber : C.sub, background: m === '1' ? `${C.amber}33` : 'transparent'}}>{m}</div>
          ))}
        </Cells>
        <Txt x={1000} y={418} size={24} color={C.sub} w={640} align="center" o={ramp(f, k(5) + 450, k(5) + 466)}>1＝SuperFXの絵が透明でない　0＝地面を見せる</Txt>
        <Cells y={460} label="合成" color={C.text} o={ramp(f, k(5) + 530, k(5) + 546)}>
          <PxCrop src={`img/layer_${F}_full.png`} iw={256} ih={240} crop={[BLK[0], BLK[1], 8, 1]} x={0} y={0} w={640} style={{borderRadius: 0}} />
        </Cells>
        <div style={{position: 'absolute', left: 1000, top: 555, opacity: ramp(f, k(5) + 590, k(5) + 606)}}>
          <Tag color={C.amber} style={{fontSize: 30}}>パレット：地面＋車や木</Tag>
        </div>
        <Card x={720} y={625} w={1120} color={C.green} o={ramp(f, k(5) + 775, k(5) + 791)}>
          <div style={{fontSize: 32, fontWeight: 900}}>ラインバッファに書く（8ドット分の色＋パレット）</div>
          <div style={{fontSize: 26, color: C.sub, fontWeight: 700, marginTop: 8, opacity: ramp(f, k(5) + 900, k(5) + 916)}}>PPUがパターンを読みに来たら色を、属性を読みに来たらパレットを返す</div>
        </Card>
      </div>
      <div style={{opacity: a6}}>
        <Card x={360} y={300} w={1200} color={C.amber}>
          <div style={{fontSize: 30, color: C.sub, fontWeight: 700}}>スーパーファミコン</div>
          <div style={{fontSize: 46, fontWeight: 900}}>F-ZEROも、HDMAでラインごとにパラメータを書き換えていた</div>
        </Card>
      </div>
    </Bg>
  );
};

// ---------------- S07b SuperFXの中身 ----------------
const Code: React.FC<{lines: {n: number; t: string}[]; hl?: (t: string, n: number) => boolean; x: number; y: number; w: number; h: number; scroll?: number; size?: number}> =
  ({lines, hl, x, y, w, h, scroll = 0, size = 24}) => (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, overflow: 'hidden', background: 'rgba(5,8,18,.9)', borderRadius: 12, border: `2px solid ${C.line}`,
      fontFamily: MONO, fontSize: size, lineHeight: 1.35, padding: '10px 16px', boxSizing: 'border-box'}}>
      <div style={{transform: `translateY(${-scroll}px)`}}>
        {lines.map((l) => {
          const on = hl ? hl(l.t, l.n) : false;
          return <div key={l.n} style={{whiteSpace: 'pre', color: on ? '#0a0f1e' : l.t.trim().startsWith(';') ? '#6f86b8' : C.text, background: on ? C.amber : 'transparent', fontWeight: on ? 900 : 400}}>
            <span style={{color: on ? '#0a0f1e' : '#4a5a80'}}>{String(l.n).padStart(5, ' ')}  </span>{l.t}</div>;
        })}
      </div>
    </div>
  );
const R = clips.raster;
export const S07b: React.FC = () => {
  const f = useCurrentFrame(), k = K('S07b');
  const a1 = ramp(f, k(1), k(1) + 16), a2 = ramp(f, k(2), k(2) + 16), a3 = ramp(f, k(3), k(3) + 16), a4 = ramp(f, k(4), k(4) + 16);
  // 市松：2色を1ドットおきに
  const dit = Math.max(0, f - k(0) - 40) * 2;
  // パイプライン
  const RATE = Math.min(1.6, 600 / Math.max(1, k(3) - k(2) - 20));
  const stage = Math.min(3, Math.floor(Math.max(0, f - k(2)) * RATE / clips.pipeline.stageFrames));
  // 1行ずつ塗る：PLOTを打った数
  const plotted = Math.min(R.pixels, Math.max(0, Math.floor((f - k(3) - 30) * 1.6)));
  let left = plotted;
  const cell = Math.floor(Math.min(1700 / R.w, 520 / R.h));
  // ダブルバッファ
  const swapT = Math.max(0, f - k(4)), period = 150, ph = swapT % period, swapped = Math.floor(swapT / period) % 2;
  return (
    <Bg>
      <SceneTitle label="SuperFXの中身" color={C.cyan} />
      {/* 市松模様はSuperFXの機能 */}
      <div style={{opacity: 1 - a1}}>
        <div style={{position: 'absolute', left: 140, top: 200, display: 'flex', gap: 30, alignItems: 'center', opacity: useIn(k(0))}}>
          <div style={{textAlign: 'center'}}><Swatch a={NES.red} size={150} /><div style={{fontSize: 30, fontWeight: 800}}>色1</div></div>
          <div style={{fontSize: 60, fontWeight: 900}}>＋</div>
          <div style={{textAlign: 'center'}}><Swatch a={NES.gray} size={150} /><div style={{fontSize: 30, fontWeight: 800}}>色2</div></div>
          <div style={{fontSize: 60, fontWeight: 900}}>→</div>
        </div>
        <svg width={640} height={320} style={{position: 'absolute', left: 1040, top: 180}}>
          {Array.from({length: 16 * 8}, (_, i) => {
            const x = i % 16, y = Math.floor(i / 16);
            return i < dit ? <rect key={i} x={x * 40} y={y * 40} width={40} height={40} fill={(x + y) % 2 ? NES.gray : NES.red} /> : null;
          })}
        </svg>
        <Txt x={140} y={560} size={40} o={useIn(k(0) + 60)}>ディザリング：2色を1ドットおきに塗り分ける（SuperFXの機能）</Txt>
        <Code lines={gsu.fill.filter((l) => l.n >= 1210 && l.n <= 1224)} hl={(t) => /cmode|color/.test(t)} x={140} y={650} w={900} h={240} size={22} />
      </div>
      {/* もう1つのCPU：実際のプログラム */}
      <div style={{opacity: a1 * (1 - a2)}}>
        <Card x={90} y={160} w={700} color={C.cyan}>
          <div style={{fontSize: 30, color: C.sub, fontWeight: 700}}>SuperFX</div>
          <div style={{fontSize: 46, fontWeight: 900}}>ファミコンのCPUを<br />補佐するコプロセッサ</div>
          <div style={{fontSize: 28, color: C.amber, fontWeight: 800, marginTop: 10}}>スターフォックスと同じく、3Dの描画を受け持つ</div>
        </Card>
        <Code lines={[...gsu.fill, ...gsu.divide]} x={860} y={150} w={980} h={740} scroll={Math.max(0, f - k(1)) * 1.4} size={22} />
        <Txt x={860} y={900} size={22} color={C.sub}>{'実際のSuperFXのプログラム（一部）'}</Txt>
      </div>
      {/* 毎回の流れ */}
      <div style={{opacity: a2 * (1 - a3)}}>
        <div style={{position: 'absolute', left: 90, top: 150, width: 1280, height: 720, borderRadius: 12, overflow: 'hidden', border: `2px solid ${C.line}`}}>
          <Sequence from={k(2)} layout="none"><OffthreadVideo src={staticFile('video/car_pipeline.mp4')} muted playbackRate={RATE}
            style={{width: '100%', height: '100%'}} /></Sequence>
        </div>
        <div style={{position: 'absolute', left: 1420, top: 170, display: 'flex', flexDirection: 'column', gap: 20}}>
          {clips.pipeline.labels.map((l, i) => (
            <Tag key={l} color={i === stage ? C.amber : C.line} style={{fontSize: 34, opacity: i <= stage ? 1 : 0.4}}>{`${i + 1}　${l}`}</Tag>
          ))}
        </div>
      </div>
      {/* LOOP と PLOT */}
      <div style={{opacity: a3 * (1 - a4)}}>
        <div style={{position: 'absolute', left: 90, top: 170, width: R.w * cell, height: R.h * cell, background: '#111a30', borderRadius: 6}}>
          <svg width={R.w * cell} height={R.h * cell}>
            {R.rows.map(([y, x0, x1]) => {
              const n = x1 - x0 + 1, show = Math.max(0, Math.min(n, left));
              left -= n;
              return Array.from({length: n}, (_, i) => {
                const x = x0 + i, on = i < show, gx = x + R.ox, gy = y + R.oy;
                const col = (gx + gy) % 2 ? `rgb(${R.colors[1].join(',')})` : `rgb(${R.colors[0].join(',')})`;
                return <rect key={`${y}-${x}`} x={x * cell + 1} y={y * cell + 1} width={cell - 2} height={cell - 2} fill={on ? col : '#1f2a48'} />;
              });
            })}
          </svg>
        </div>
        <Code lines={gsu.fill.filter((l) => l.n >= 1268 && l.n <= 1276)} hl={(t) => (/plot/.test(t) && f % 4 < 2) || (/loop/.test(t) && f % 4 >= 2)} x={90} y={720} w={760} h={180} size={26} />
        <Card x={900} y={720} w={940} color={C.amber}>
          <div style={{fontSize: 44, fontWeight: 900, color: C.amber}}>{`PLOT ${plotted} / ${R.pixels}`}</div>
          <div style={{fontSize: 26, color: C.sub, fontWeight: 700}}>{`車の背面のポリゴン1枚（${R.w}×${R.h}ドット）を、ラインごとに塗りつぶす`}</div>
        </Card>
      </div>
      {/* 描き終わったら入れ替える */}
      <div style={{opacity: a4}}>
        {[0, 1].map((i) => {
          const showing = i === swapped;
          const src = i === 0 ? `img/layer_${F}_full.png` : 'img/layer_2100_full.png';
          const prog = showing ? 1 : Math.min(1, ph / (period * 0.8));
          return (
            <div key={i} style={{position: 'absolute', left: 120 + i * 880, top: 200, width: 768, height: 576, borderRadius: 10, overflow: 'hidden', background: '#000',
              border: `5px solid ${showing ? C.green : C.line}`, transform: `scale(${showing ? 1 : 0.94})`}}>
              <PxCrop src={src} iw={256} ih={240} crop={[0, 0, 256, 192]} x={0} y={0} w={768} o={showing ? 1 : 0.85} style={{clipPath: showing ? undefined : `inset(0 0 ${(1 - prog) * 100}% 0)`, borderRadius: 0}} />
              <Label x={14} y={14} color={showing ? C.green : C.sub}>{showing ? 'フロントバッファ（表示中）' : 'バックバッファ（描画中）'}</Label>
            </div>
          );
        })}
        <Txt x={0} y={810} size={30} color={C.sub} w={1920} align="center">ダブルバッファ：描き終わったら切り替える（模式図）</Txt>
      </div>
    </Bg>
  );
};
