import React from 'react';
import {Loop, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Bg, C, SceneTitle, Tag, cueOf, useIn} from './common';
import {Card, Label, MONO, Nes, Px, PxCrop, Txt, ramp} from './parts';
import clips from './data/car_clips.json';
import polys from './data/polys.json';

const K = (id: string) => (i: number) => cueOf(id, i);
const CW = 1280, CH = 720; // クリップの大きさ

/** ROMの車データから描いたクリップ（public/video/car_*.mp4） */
const Clip: React.FC<{name: string; x: number; y: number; w: number; rate?: number; o?: number; children?: React.ReactNode}> = ({name, x, y, w, rate = 1, o = 1, children}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: (w * CH) / CW, opacity: o, borderRadius: 12, overflow: 'hidden',
    border: `2px solid ${C.line}`, boxShadow: '0 12px 44px rgba(0,0,0,.6)'}}>
    <OffthreadVideo src={staticFile(`video/${name}.mp4`)} muted playbackRate={rate} style={{width: '100%', height: '100%'}} />
    {children}
  </div>
);

export const S08: React.FC = () => {
  const f = useCurrentFrame(), k = K('S08');
  const BUILD_RATE = 0.6;
  const built = clips.build.faceAt.filter((a) => (f - k(0)) * BUILD_RATE >= a).length;
  const name = built ? clips.faceNames[built - 1] : '';
  const MORPH_RATE = Math.max(1, clips.morph.frames / Math.max(1, k(3) - k(2) - 10));
  const morphT = (f - k(2)) * MORPH_RATE;
  const stage = clips.morph.stageAt.filter((a) => morphT >= a).length - 1;
  const seg = (a: number, b: number) => ramp(f, a, a + 14) * (1 - ramp(f, b - 10, b + 4));
  return (
    <Bg>
      <SceneTitle label="車を作る：少ない面で車らしく" color={C.red} />
      {/* 1) 面を描く順に足していく */}
      <Sequence from={k(0)} durationInFrames={k(2) - k(0)} layout="none">
        <div style={{opacity: seg(k(0), k(2))}}>
          <Clip name="car_build" x={60} y={140} w={1150} rate={BUILD_RATE} />
          <Card x={1250} y={150} w={610} color={C.amber}>
            <div style={{fontSize: 30, color: C.sub, fontWeight: 700}}>描いたポリゴン</div>
            <div style={{fontSize: 92, fontWeight: 900, color: C.amber, lineHeight: 1.1}}>{built}<span style={{fontSize: 44, color: C.sub}}> / {clips.faces.player}</span></div>
            <div style={{fontSize: 30, fontWeight: 800, minHeight: 42}}>{name}</div>
          </Card>
          <Card x={1250} y={430} w={610} color={C.cyan} o={useIn(k(1))}>
            <div style={{fontSize: 34, fontWeight: 900}}>自分の車　<span style={{color: C.cyan}}>{clips.faces.player}ポリゴン・{clips.vertices.player}頂点</span></div>
            <div style={{fontSize: 34, fontWeight: 900, marginTop: 8}}>ライバル　<span style={{color: C.green}}>{clips.faces.rival}ポリゴン</span></div>
            <div style={{fontSize: 26, color: C.sub, fontWeight: 700, marginTop: 14}}>1枚増やすだけでフレームレートが落ちる → どこにポリゴンを使うかを選ぶ</div>
          </Card>
          <Txt x={1250} y={700} size={24} color={C.sub} w={610}>ROMの車データを、ゲームと同じ規則で描画（描画順・裏面除去・ディザリング）</Txt>
        </div>
      </Sequence>
      {/* 2) デザインの変遷 */}
      <Sequence from={k(2)} durationInFrames={k(3) - k(2)} layout="none">
        <div style={{opacity: seg(k(2), k(3))}}>
          <div style={{opacity: 1 - ramp(f, k(2) + 300, k(2) + 320)}}>
            <Px src="img/variants_picks.png" x={60} y={150} w={760} h={622} />
            <Txt x={60} y={790} size={28} color={C.sub} w={760} align="center">14案から候補に残った4案（実際の画面）</Txt>
          </div>
          <div style={{opacity: ramp(f, k(2) + 306, k(2) + 326)}}>
            <Px src="img/allcars_height.png" x={60} y={170} w={760} h={451} />
            <Txt x={60} y={640} size={28} color={C.sub} w={760} align="center">背の高さの比較（今／1.15倍／1.3倍、実際の画面）</Txt>
          </div>
          <Clip name="car_morph" x={880} y={150} w={980} rate={MORPH_RATE} />
          <div style={{position: 'absolute', left: 880, top: 720, width: 980, display: 'flex', gap: 10, flexWrap: 'wrap'}}>
            {clips.morph.labels.map((l, i) => (
              <Tag key={l} color={i === stage ? C.amber : C.line} style={{fontSize: 26, opacity: i <= stage ? 1 : 0.45}}>{l}</Tag>
            ))}
          </div>
          <Txt x={880} y={830} size={22} color={C.sub} w={980}>形の変化（車体とキャビンの16頂点）。色は現在のもので統一</Txt>
        </div>
      </Sequence>
      {/* 3) 後輪の斜めの板 */}
      <Sequence from={k(3)} durationInFrames={k(5) - k(3)} layout="none">
        <div style={{opacity: seg(k(3), k(5))}}>
          <div style={{opacity: 1 - ramp(f, k(4) - 10, k(4) + 6)}}>
            <Clip name="car_tyre" x={260} y={140} w={1400} />
            <Label x={300} y={170} color={C.amber}>黄色の線：後輪の斜めのポリゴン（1本に1枚）</Label>
          </div>
          <div style={{opacity: ramp(f, k(4) - 6, k(4) + 10)}}>
            <Px src="img/car_tyre_rear.png" x={60} y={170} w={880} h={495} style={{borderRadius: 12}} />
            <Px src="img/car_tyre_side.png" x={980} y={170} w={880} h={495} style={{borderRadius: 12}} />
            <Txt x={60} y={690} size={34} color={C.amber} w={880} align="center">後ろから：背面と上面に見える</Txt>
            <Txt x={980} y={690} size={34} color={C.cyan} w={880} align="center">斜めから：ポリゴン1枚だけ</Txt>
          </div>
        </div>
      </Sequence>
      {/* 4) 自車とライバル */}
      <Sequence from={k(5)} layout="none">
        <div style={{opacity: ramp(f, k(5), k(5) + 14)}}>
          <Clip name="car_lod" x={160} y={130} w={1600} />
          <Txt x={160} y={760} size={36} color={C.cyan} w={800} align="center">{`自分の車　${clips.faces.player}ポリゴン`}</Txt>
          <Txt x={960} y={760} size={36} color={C.green} w={800} align="center">{`ライバル　${clips.faces.rival}ポリゴン（斜めのポリゴンなし）`}</Txt>
        </div>
      </Sequence>
    </Bg>
  );
};

// ---------------- S08b フレームレート優先でポリゴンを抑える ----------------
// 数値はすべて実測：tools/count_polys.mjs（描画1回ごとに塗ったポリゴン数＝GSU RAM $8024）と、
// 録画した合成情報から数えた「ポリゴンで塗った画素の割合」（平均5.8%、tools/make_layers.py の FX画素）。
const TOTAL = [['自車', 19, C.red], ['ライバル3台', 51, C.amber], ['木8本', 56, C.green], ['家2軒', 20, C.violet], ['看板', 2, C.cyan]] as const;
export const S08b: React.FC = () => {
  const f = useCurrentFrame(), k = K('S08b');
  const a1 = ramp(f, k(1), k(1) + 16), a2 = ramp(f, k(2), k(2) + 16), a3 = ramp(f, k(3), k(3) + 16);
  const S = polys.series as number[][];
  const FROM = 560, LOOP = 300; // 録画（main.mp4）のコマ番号＝コアのコマ番号
  const cur = FROM + ((f % LOOP) + LOOP) % LOOP;
  let now = 0;
  for (const [x, y] of S) { if (x <= cur) now = y; else break; }
  const total = TOTAL.reduce((a, t) => a + t[1], 0);
  return (
    <Bg>
      <SceneTitle label="フレームレート優先でポリゴンを抑える" color={C.red} />
      <div style={{opacity: 1 - a1}}>
        <Txt x={0} y={250} size={150} w={1920} align="center" color={C.amber} o={useIn(k(0))}>30fps</Txt>
        <Txt x={0} y={470} size={44} w={1920} align="center" o={useIn(k(0) + 30)}>を最優先 → 使えるポリゴンは、とことん少なく</Txt>
        <Txt x={0} y={580} size={28} w={1920} align="center" color={C.sub} o={useIn(k(0) + 60)}>{'1秒に約30回、画面を描き直す'}</Txt>
      </div>
      <div style={{opacity: a1 * (1 - a2)}}>
        <PxCrop src="img/layer_3200_full.png" iw={256} ih={240} crop={[0, 0, 256, 192]} x={90} y={160} w={820} />
        <div style={{position: 'absolute', left: 1010, top: 160, width: 820, height: 615, background: '#05070f', borderRadius: 8, overflow: 'hidden'}}>
          <Px src="img/layer_3200_fx.png" x={0} y={0} w={820} h={769} />
        </div>
        <Label x={110} y={180} color={C.green}>画面</Label>
        <Label x={1030} y={180} color={C.cyan}>ポリゴンで塗ったところだけ</Label>
        <Txt x={90} y={800} size={40} w={1740} align="center">{'ポリゴンで塗っている面積：平均 '}<span style={{color: C.cyan}}>約6%</span>{'　残りはMode7の地面'}</Txt>
      </div>
      <div style={{opacity: a2}}>
        <Card x={90} y={150} w={560} color={C.line}>
          <div style={{fontSize: 30, fontWeight: 900, marginBottom: 14}}>{`コース全体のポリゴン 約${total}枚`}</div>
          {TOTAL.map(([n, v, c], i) => (
            <div key={n} style={{display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10, opacity: ramp(f, k(2) + i * 12, k(2) + i * 12 + 14)}}>
              <div style={{width: 170, fontSize: 26, fontWeight: 800}}>{n}</div>
              <div style={{width: v * 5, height: 30, background: c, borderRadius: 6}} />
              <div style={{fontSize: 26, fontWeight: 900, color: c}}>{v}</div>
            </div>
          ))}
        </Card>
        {/* 実際の画面と、そのフレームで塗ったポリゴン数（デフォルトの視点。最大はスタート直後の4台が固まる場面） */}
        <Loop durationInFrames={LOOP} layout="none">
          <Nes src="main" from={FROM} x={720} y={150} w={700} crop={[0, 0, 256, 192]} />
        </Loop>
        <Card x={1450} y={150} w={400} color={now === polys.all.max ? C.red : C.cyan}>
          <div style={{fontSize: 26, color: C.sub, fontWeight: 700}}>このフレームで塗った<br />ポリゴン</div>
          <div style={{fontSize: 110, fontWeight: 900, fontFamily: MONO, color: now === polys.all.max ? C.red : C.cyan, lineHeight: 1.1}}>{now}</div>
          <div style={{fontSize: 34, fontWeight: 900, color: C.red, marginTop: 10}}>{`最大 ${polys.all.max}枚`}</div>
          <div style={{fontSize: 22, color: C.sub, fontWeight: 700, marginTop: 8}}>デフォルトの視点・レース全体で計測</div>
        </Card>
        <Txt x={720} y={720} size={36} w={1140} align="center" color={C.amber} o={a3}>見た目より、フレームレートを優先</Txt>
      </div>
    </Bg>
  );
};
