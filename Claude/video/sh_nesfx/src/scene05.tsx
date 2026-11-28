import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {Bg, C, FONT, SceneTitle, cueEnd, cueOf} from './common';
import {Card, Clip, Label, Pic, win} from './parts';
import SPAN from './palspan.json';

// ───────────────── S05 4本のパレットで描く
// 色はすべて最終版の実際のパレット（専用Mesenの PPU パレットRAM から読み出し）
//   空パレット $10 $09 $2A $23 / 地面パレット $10 $19 $2A $39 / 赤パレット $10 $19 $2A $16 / 黒パレット $10 $19 $2A $0F
const NES: Record<string, string> = {'$10': '#adadad', '$09': '#0b4800', '$19': '#388700', '$1A': '#0c9300', '$2A': '#5ce430', '$23': '#c676ff', '$39': '#cfef96', '$16': '#b53120', '$0F': '#000000'};
const ROWS = [
  {n: '空パレット', x: '$23', xn: '空の紫'},
  {n: '地面パレット', x: '$39', xn: '地面の黄緑'},
  {n: '赤パレット', x: '$16', xn: '目の赤'},
  {n: '黒パレット', x: '$0F', xn: '輪郭の黒'},
];
const light = (hex: string) => ['$10', '$2A', '$39', '$23'].includes(hex);
const mix = (a: string, b: string, t: number) => {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const A = p(a), B = p(b);
  return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',')})`;
};

const CW = 150, CH = 112, CG = 18, LW = 230;
const Cell: React.FC<{x: number; y: number; hex: string; name: string; col?: string; glow?: number}> = ({x, y, hex, name, col, glow = 0}) => (
  <div style={{position: 'absolute', left: x, top: y, width: CW, height: CH, borderRadius: 10, background: col ?? NES[hex], border: '3px solid #ffffff40', boxShadow: glow ? `0 0 ${36 * glow}px ${12 * glow}px ${C.amber}` : 'none', outline: glow ? `${Math.round(5 * glow)}px solid ${C.amber}` : 'none', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '6px 8px', fontFamily: FONT, color: light(hex) ? '#111' : '#fff'}}>
    <div style={{fontSize: 22, fontWeight: 700}}>{name}</div>
    <div style={{fontSize: 30, fontWeight: 900, textAlign: 'right'}}>{hex}</div>
  </div>
);

/** 4本のパレット表。p: 0=以前（0番＝暗い緑）→1=今回（0番＝灰色）、q: 空パレットの暗い緑 $19→$09 */
const PalTable: React.FC<{x: number; y: number; p: number; q: number; hi4?: number; hiSky?: number; hi0?: number}> = ({x, y, p, q, hi4 = 0, hiSky = 0, hi0 = 0}) => (
  <div style={{position: 'absolute', left: x, top: y}}>
    <div style={{position: 'absolute', left: LW - 12, top: -14, width: CW + 24, height: 4 * (CH + CG) + 10, borderRadius: 14, border: `4px dashed ${C.amber}`, opacity: 0.35 + 0.65 * hi0}} />
    <div style={{position: 'absolute', left: LW - 40, top: 4 * (CH + CG) + 8, width: CW + 80, textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 24, color: C.amber}}>0番：4本で共通</div>
    {ROWS.map((r, i) => {
      const top = i * (CH + CG);
      const sky = i === 0;
      const dHex = sky && q > 0.5 ? '$09' : '$19';
      const dCol = sky ? mix(NES['$19'], NES['$09'], q) : NES['$19'];
      return (
        <React.Fragment key={r.n}>
          <div style={{position: 'absolute', left: 0, top: top + 30, fontFamily: FONT, fontWeight: 900, fontSize: 32, color: C.text, whiteSpace: 'nowrap'}}>{r.n}</div>
          <Cell x={LW + (1 - p) * (CW + CG)} y={top} hex="$10" name="灰色" />
          <Cell x={LW + p * (CW + CG)} y={top} hex={dHex} name="暗い緑" col={dCol} glow={sky ? hiSky : 0} />
          <Cell x={LW + 2 * (CW + CG)} y={top} hex="$2A" name="明るい緑" />
          <Cell x={LW + 3 * (CW + CG)} y={top} hex={r.x} name={r.xn} glow={hi4} />
        </React.Fragment>
      );
    })}
  </div>
);

const MAPCOL: Record<string, string> = {'空パレット': NES['$23'], '地面パレット': NES['$39'], '赤パレット': NES['$16'], '黒パレット': NES['$0F']};
const ZS = 6;  // edge_*.png（画面の4倍）を 1.5 倍で表示 ＝ 画面1ドット 6px

export const S05: React.FC = () => {
  const f = useCurrentFrame();
  const c = Array.from({length: 14}, (_, i) => cueOf('S05', i));
  const mid9 = Math.round((c[9] + cueEnd('S05', 9)) / 2);
  const ph = f < c[1] - 8 ? 0 : f < c[3] - 8 ? 1 : f < c[4] - 8 ? 2 : f < c[5] - 8 ? 3 : f < c[7] - 8 ? 4 : f < c[9] - 8 ? 5 : f < c[10] - 8 ? 6 : f < c[13] - 8 ? 7 : 8;
  const title = ['4本のパレットで描く', '4本のパレットで描く', '背景には透明がない', '4本の中身', '8×1ごとの選び方', '輪郭の黒が出せない', '暗い緑のジレンマ', f >= c[12] - 8 ? '0番に灰色を置く' : '0番は4本で共通', '輪郭の色の変化を目立たなくする'][ph];
  const ramp = (a: number, d = 40) => interpolate(f, [a, a + d], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <Bg>
      <SceneTitle label={title} color={C.violet} />
      {ph === 0 && (
        <div style={{opacity: win(f, 0)}}>
          <Clip src="video/sfc_color.mp4" from={60 * 55} x={60} y={150} w={1100} h={619} color={C.violet} label="スーパーファミコン版" />
          <Card x={1200} y={150} w={660} color={C.violet} title="2bpp ＝ 透明＋3色" on={1} />
          <Card x={1200} y={330} w={660} color={C.violet} title="色の組をタイルごとに8種類から選ぶ" on={1} fs={30} />
        </div>
      )}
      {ph === 1 && (
        <div style={{opacity: win(f, c[1] - 8)}}>
          <Pic src="img/attr16.png" x={60} y={150} w={1100} h={500} color={C.violet} />
          <div style={{position: 'absolute', left: 60 + 568, top: 150 + 20, width: 560, height: 470, background: 'rgba(10,15,30,.85)', opacity: 1 - win(f, c[2] - 6)}} />
          <Card x={1200} y={150} w={660} color={C.amber} title="背景パレットは4本" sub="普通は 16×16ドットごとにしか切り替えられない" on={f < c[2] - 6 ? 1 : 0.5} fs={32} />
          <div style={{opacity: win(f, c[2])}}><Card x={1200} y={400} w={660} color={C.cyan} title="今回の回路：8×1ドットごと" sub="横8ドット × 縦1ライン。32倍細かい" on={1} fs={36} /></div>
        </div>
      )}
      {ph === 2 && <SkyInSpan c3={c[3]} />}
      {ph === 3 && (
        <div style={{opacity: win(f, c[4] - 8)}}>
          <PalTable x={60} y={190} p={1} q={1} hi4={win(f, c[4] + 150)} />
          <Card x={1060} y={190} w={800} color={C.cyan} title="灰色と2つの緑は4本で共通" sub="敵も木も地面も、この3色が土台" on={f < c[4] + 150 ? 1 : 0.5} />
          <div style={{opacity: win(f, c[4] + 150)}}><Card x={1060} y={400} w={800} color={C.amber} title="違うのは4色目だけ" sub="入れた色で呼ぶ：空・地面・赤・黒パレット" on={1} /></div>
          <Label x={1060} y={640} size={24} color={C.sub} w={800}>最終版の実際の値（PPUのパレットRAMから読み出し）</Label>
        </div>
      )}
      {ph === 4 && (
        <div style={{opacity: win(f, c[5] - 8)}}>
          <Pic src="img/palmap.png" x={60} y={150} w={1330} h={480} color={C.violet} />
          <Label x={70} y={644} size={26} color={C.sub}>実際の画面（スプライトなし）</Label>
          <Label x={60 + 690} y={644} size={26} color={C.sub}>8×1ごとに選ばれたパレット（画面の色から復元）</Label>
          {Object.entries(MAPCOL).map(([n, col], i) => (
            <div key={n} style={{position: 'absolute', left: 1440, top: 170 + i * 92, display: 'flex', alignItems: 'center', gap: 18, fontFamily: FONT, opacity: win(f, c[5] + i * 10)}}>
              <div style={{width: 70, height: 56, borderRadius: 8, background: col, border: '3px solid #ffffff66'}} />
              <div style={{fontSize: 36, fontWeight: 900, color: C.text}}>{n}</div>
            </div>
          ))}
          <div style={{position: 'absolute', left: 60 + 690 - 6, top: 150 + 390 - 6, width: 652, height: 96, borderRadius: 8, border: `5px solid ${C.amber}`, opacity: win(f, c[6] + 10)}} />
          <div style={{opacity: win(f, c[5] + 60, c[6] - 10)}}><Card x={60} y={720} w={1800} color={C.violet} title="空 → 空パレット　淡い黄緑 → 地面パレット　目 → 赤パレット　ほか → 黒パレット" sub="その8ドットに要る色が入ったパレットを選ぶ" fs={32} /></div>
          <div style={{opacity: win(f, c[6] + 10)}}><Card x={60} y={720} w={1800} color={C.amber} title="地面の大半は、実は黒パレットで描かれている" sub="黒パレットにも地面と同じ $19・$2A がある。地面パレットが要るのは淡い黄緑 $39 の所だけ" fs={36} /></div>
        </div>
      )}
      {ph === 5 && <EdgeSpan c7={c[7]} c8={c[8]} />}
      {ph === 6 && (
        <div style={{opacity: win(f, c[9] - 8)}}>
          <Pic src="img/edge_1a.png" x={60} y={150} w={1024} h={768} color={C.red} label="もし暗い緑が明るかったら（$1A）" />
          <Card x={1130} y={150} w={730} color={C.red} title="明るい → 輪郭だけ緑に化けて目立つ" on={f < mid9 ? 1 : 0.5} fs={34} />
          <div style={{opacity: win(f, mid9)}}>
            <Card x={1130} y={420} w={730} color={C.sub} title="暗い → テレビでは地面が黒っぽく沈む" on={1} fs={34} />
            <div style={{position: 'absolute', left: 1160, top: 600, display: 'flex', gap: 40}}>
              {['$1A', '$19', '$09'].map((h) => (
                <div key={h} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8}}>
                  <div style={{width: 150, height: 110, borderRadius: 10, background: NES[h], border: '3px solid #ffffff44'}} />
                  <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 30, color: C.text}}>{h}</div>
                </div>
              ))}
            </div>
            <Label x={1160} y={790} size={26} color={C.sub}>明るい ←　暗い緑の候補　→ 暗い</Label>
          </div>
        </div>
      )}
      {ph === 7 && (
        <div style={{opacity: win(f, c[10] - 8)}}>
          <PalTable x={90} y={190} p={ramp(c[12] + 30, 60)} q={ramp(c[12] + 240, 30)} hi0={f < c[12] ? 0.5 + 0.5 * Math.sin(f / 8) : 1} hiSky={win(f, c[12] + 240)} />
          {f < c[11] - 8 && <Card x={1060} y={190} w={800} color={C.amber} title="以前：0番が暗い緑" sub="0番は4本すべてで同じ色。空パレットだけ変えられない" on={1} />}
          {f >= c[11] - 8 && f < c[12] - 8 && (
            <div style={{opacity: win(f, c[11] - 8)}}>
              <Card x={1060} y={190} w={800} color={C.red} title="✕ パレットごとに0番を変える" sub="ファミコンではできない" on={1} />
              <div style={{opacity: win(f, c[11] + 150)}}><Card x={1060} y={400} w={800} color={C.red} title="✕ 地平線で0番を書き換える" sub="木の内側まで、上と下で色が分かれる" on={1} /></div>
            </div>
          )}
          {f >= c[12] - 8 && (
            <div style={{opacity: win(f, c[12] - 8)}}>
              <Card x={1060} y={190} w={800} color={C.green} title="0番に、どのパレットでも使う灰色を置く" sub="灰色は木の幹・岩・敵の体。暗い緑は各パレットの自分の枠へ" on={1} />
              <div style={{opacity: win(f, c[12] + 240)}}><Card x={1060} y={400} w={800} color={C.amber} title="空パレットだけ、黒に近い $09" sub="ほかの3本は $19 のまま" on={1} /></div>
            </div>
          )}
        </div>
      )}
      {ph === 8 && (
        <div style={{opacity: win(f, c[13] - 8)}}>
          {/* 左は「以前」→ 後半で「もし黒が出せたら」に差し替え、右の「今回」と見比べる */}
          {(f < c[13] + 330
            ? [{src: 'img/edget_19.png', l: '以前：暗い緑は共通の $19', col: C.sub, x: 40, at: c[13]}]
            : [{src: 'img/edget_ideal.png', l: '参考：もし黒が出せたら', col: C.line, x: 40, at: c[13] + 330}]
          ).concat([{src: 'img/edget_final.png', l: '今回：空パレットは $09', col: C.green, x: 980, at: c[13] + 30}]).map((p) => (
            <div key={p.src} style={{opacity: win(f, p.at)}}>
              <Pic src={p.src} x={p.x} y={170} w={900} h={450} color={p.col} />
              <Label x={p.x} y={634} size={32} color={p.col === C.green ? C.green : C.text} w={900} align="center">{p.l}</Label>
            </div>
          ))}
          <div style={{opacity: win(f, c[13] + 120)}}><Card x={60} y={730} w={1800} color={C.green} title="テレビでは暗すぎた $09 も、空との境目なら黒の代わりにちょうどいい" sub="輪郭の色が変わっても、ほとんど気づかない" fs={38} /></div>
        </div>
      )}
    </Bg>
  );
};

/** 輪郭の8ドット（実際の画面から1か所）：描きたい色と、選べるパレット */
const EdgeSpan: React.FC<{c7: number; c8: number}> = ({c7, c8}) => {
  const f = useCurrentFrame();
  const want = SPAN.pixels.map((p) => (p === NES['$09'] ? '#000000' : p));
  const sx = (SPAN.x - SPAN.crop[0]) * ZS, sy = (SPAN.y - SPAN.crop[1]) * ZS;
  const cs = 82;
  const row = (y: number, label: string, px: string[], at: number, note?: string, ok?: boolean) => (
    <div style={{position: 'absolute', left: 860, top: y, opacity: win(f, at), fontFamily: FONT}}>
      <div style={{fontSize: 28, fontWeight: 800, color: C.text, marginBottom: 8}}>{label}</div>
      <div style={{display: 'flex', gap: 4}}>{px.map((p, i) => <div key={i} style={{width: cs, height: cs * 0.62, background: p, border: '2px solid #ffffff30'}} />)}</div>
      {note && <div style={{position: 'absolute', left: px.length * (cs + 4) + 24, top: 50, width: 520, fontSize: 26, fontWeight: 800, color: ok ? C.green : C.red}}>{note}</div>}
    </div>
  );
  const pal = (k: string[]) => k.map((h) => NES[h]);
  return (
    <div style={{opacity: win(f, c7 - 8)}}>
      <Pic src="img/edge_final.png" x={60} y={150} w={768} h={576} color={C.violet} label="実際の画面" />
      <div style={{position: 'absolute', left: 60 + sx - 5, top: 150 + sy - 5, width: 8 * ZS + 10, height: ZS + 10, border: `4px solid ${C.amber}`, boxShadow: `0 0 18px ${C.amber}`, opacity: win(f, c8)}} />
      <div style={{opacity: win(f, c7 + 20, c8 - 10)}}><Card x={860} y={190} w={1000} color={C.amber} title="黒い輪郭は、必ず空との境目にある" sub="境目の8ドットには、空の紫が要る" fs={36} /></div>
      {row(160, '描きたい色（輪郭の8ドット）', want, c8)}
      {row(330, '黒パレット：灰・$19・$2A・黒', pal(['$10', '$19', '$2A', '$0F']), c8 + 90, '✕ 紫がない（空が塗れない）')}
      {row(480, '空パレット：灰・$09・$2A・紫', pal(['$10', '$09', '$2A', '$23']), c8 + 190, '○ 空を優先して、こちら', true)}
      {row(660, '実際の画面：黒 → 暗い緑', SPAN.pixels, c8 + 330)}
    </div>
  );
};

/** 背景には透明がない：敵の輪郭の8ドットに、敵の色と空の紫が並ぶ（後の EdgeSpan と同じ1か所） */
const SkyInSpan: React.FC<{c3: number}> = ({c3}) => {
  const f = useCurrentFrame();
  const sx = (SPAN.x - SPAN.crop[0]) * ZS, sy = (SPAN.y - SPAN.crop[1]) * ZS;
  const cs = 104;
  const what = (p: string) => (p === NES['$23'] ? '空' : p === NES['$10'] ? '敵の体' : '輪郭');
  return (
    <div style={{opacity: win(f, c3 - 8)}}>
      <Pic src="img/edge_final.png" x={60} y={150} w={768} h={576} color={C.violet} label="実際の画面" />
      <div style={{position: 'absolute', left: 60 + sx - 5, top: 150 + sy - 5, width: 8 * ZS + 10, height: ZS + 10, border: `4px solid ${C.amber}`, boxShadow: `0 0 18px ${C.amber}`, opacity: win(f, c3 + 30)}} />
      <Card x={860} y={160} w={1000} color={C.violet} title="敵は背景に描き込む → 透明がない" sub="すき間からのぞく空も、敵と同じパレットの色で塗る" fs={36} />
      <div style={{position: 'absolute', left: 860, top: 420, opacity: win(f, c3 + 30), fontFamily: FONT}}>
        <div style={{fontSize: 28, fontWeight: 800, color: C.text, marginBottom: 10}}>枠の中の8ドット（横8×縦1）</div>
        <div style={{display: 'flex', gap: 6}}>
          {SPAN.pixels.map((p, i) => (
            <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8}}>
              <div style={{width: cs, height: cs * 0.7, background: p, border: '2px solid #ffffff40'}} />
              <div style={{fontSize: 24, fontWeight: 800, color: p === NES['$23'] ? C.violet : C.text, whiteSpace: 'nowrap'}}>{what(p)}</div>
            </div>
          ))}
        </div>
        <div style={{marginTop: 28, fontSize: 30, fontWeight: 800, color: C.amber, opacity: win(f, c3 + 120)}}>この8ドットを、1本のパレット（4色）だけで塗る</div>
      </div>
    </div>
  );
};
