import React from 'react';
import {AbsoluteFill, Img, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Arrow, Bg, C, SceneTitle, Tag, cueOf, useIn} from './common';
import {Card, Grid, Hw, Label, Nes, Px, PxCrop, Txt, ramp} from './parts';

const K = (id: string) => (i: number) => cueOf(id, i);

// ---------------- S01 オープニング：実機 ----------------
export const S01: React.FC = () => {
  const f = useCurrentFrame(), k = K('S01');
  const t = ramp(f, k(2) - 10, k(2) + 20);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Hw sec={7} x={0} y={0} w={1920} volume={0.35} style={{borderRadius: 0}} />
      <AbsoluteFill style={{background: `linear-gradient(90deg, rgba(0,0,0,${0.15 + 0.55 * t}) 0%, rgba(0,0,0,0) 55%)`}} />
      <div style={{position: 'absolute', left: 60, top: 50, opacity: useIn(20)}}>
        <Tag color={C.amber}>ファミコン実機・ブラウン管をカメラで撮影</Tag>
      </div>
      <Txt x={70} y={300} size={44} color={C.cyan} o={t}>SuperFX ＋ Mode7 をカートリッジに</Txt>
      <Txt x={70} y={370} size={104} o={t}>{'ファミコンで\n3Dレース'}</Txt>
    </AbsoluteFill>
  );
};

// ---------------- S02 前回は回したふり ----------------
const ANGLES = ['000', '008', '016', '024', '032', '040', '048', '056', '064', '072', '080', '088', '096', '104', '112', '120'];
export const S02: React.FC = () => {
  const f = useCurrentFrame(), k = K('S02');
  const a1 = useIn(k(1)), a2 = useIn(k(2));
  return (
    <Bg>
      <SceneTitle label="前回：回しているように見せた" color={C.violet} />
      <Nes src="prev2d" from={600} x={90} y={170} w={560} crop={[0, 28, 256, 184]} native={[256, 240]} />
      <Txt x={90} y={590} size={30} color={C.sub} w={560} align="center">前回の2D版</Txt>
      <div style={{position: 'absolute', left: 720, top: 170, width: 420, height: 420, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, opacity: a1}}>
        {ANGLES.map((a, i) => (
          <Img key={a} src={staticFile(`pictures/angle_${a}.png`)} style={{width: '100%', borderRadius: 4, imageRendering: 'pixelated',
            outline: Math.floor(f / 8) % 16 === i ? `4px solid ${C.amber}` : 'none'}} />
        ))}
      </div>
      <Txt x={720} y={600} size={30} color={C.amber} w={420} align="center" o={a1}>128方向の絵をROMに入れて切り替え</Txt>
      <div style={{opacity: a2}}>
        <Sequence from={k(2)} layout="none"><Nes src="main" from={900} x={1210} y={170} w={620} crop={[0, 0, 256, 192]} /></Sequence>
        <Txt x={1210} y={660} size={34} color={C.cyan} w={620} align="center">今回：毎回、本当に計算して描く</Txt>
      </div>
    </Bg>
  );
};

// ---------------- S03 カートリッジに入れたもの ----------------
export const S03: React.FC = () => {
  const f = useCurrentFrame(), k = K('S03');
  const a0 = useIn(k(0)), a1 = useIn(k(1)), a2 = useIn(k(2)), a3 = ramp(f, k(3), k(3) + 20);
  const fade = 1 - a3 * 0.75;
  return (
    <Bg>
      <SceneTitle label="カートリッジに入れたもの" />
      <div style={{opacity: fade}}>
        <Card x={90} y={150} w={760} color={C.violet} o={a0}>
          <div style={{fontSize: 30, color: C.sub, fontWeight: 700}}>ファミコン</div>
          <div style={{fontSize: 40, fontWeight: 900}}>カートリッジに回路を足して機能を増やす</div>
          <div style={{fontSize: 30, color: C.violet, fontWeight: 700, marginTop: 6}}>例：前回使った MMC5</div>
        </Card>
        <Card x={90} y={350} w={760} color={C.amber} o={a1}>
          <div style={{fontSize: 30, color: C.sub, fontWeight: 700}}>スーパーファミコン</div>
          <div style={{fontSize: 40, fontWeight: 900}}>スターフォックス</div>
          <div style={{fontSize: 30, color: C.amber, fontWeight: 700, marginTop: 6}}>3Dを描く SuperFX チップをカートリッジに搭載</div>
        </Card>
        <div style={{opacity: a2}}>
          <Sequence from={k(2)} layout="none"><Hw sec={20} x={1060} y={150} w={740} crop={[1100, 260, 820, 820]} /></Sequence>
          <Label x={1080} y={170} color={C.green}>FPGAカートリッジ：EverDrive N8 Pro</Label>
          <Card x={90} y={560} w={760} color={C.cyan}>
            <div style={{fontSize: 30, color: C.sub, fontWeight: 700}}>今回：FPGAの中に入れた回路</div>
            <div style={{display: 'flex', gap: 18, marginTop: 10}}>
              <Tag color={C.cyan} style={{fontSize: 34}}>SuperFX：車・木・家</Tag>
              <Tag color={C.green} style={{fontSize: 34}}>Mode7：地面</Tag>
            </div>
            <div style={{fontSize: 28, color: C.text, fontWeight: 700, marginTop: 14}}>ファミコン本体は改造していない</div>
          </Card>
        </div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 230, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26, opacity: a3}}>
        <div style={{fontSize: 52, fontWeight: 900, textShadow: '0 4px 20px #000'}}>ファミコンの「できないこと」</div>
        {['1　絵を自由に描けない', '2　地面を回せない', '3　色が足りない'].map((s, i) => (
          <div key={s} style={{fontSize: 56, fontWeight: 900, color: [C.cyan, C.green, C.amber][i], opacity: ramp(f, k(3) + 20 + i * 24, k(3) + 40 + i * 24),
            background: 'rgba(5,8,18,.85)', padding: '10px 50px', borderRadius: 16, border: `3px solid ${[C.cyan, C.green, C.amber][i]}`}}>{s}</div>
        ))}
      </div>
    </Bg>
  );
};

// ---------------- S04 できないこと1：絵を自由に描けない ----------------
export const S04: React.FC = () => {
  const f = useCurrentFrame(), k = K('S04');
  const a1 = useIn(k(1)), a2 = ramp(f, k(2), k(2) + 30), a3 = useIn(k(3));
  const S = 3; // 256×192 を 768×576
  return (
    <Bg>
      <SceneTitle label="できないこと1　絵を自由に描けない" color={C.cyan} />
      {/* 左：ファミコンの画面はタイルの並び */}
      <div style={{position: 'absolute', left: 80, top: 160, width: 256 * S, height: 192 * S, overflow: 'hidden', borderRadius: 8, boxShadow: '0 12px 44px rgba(0,0,0,.6)'}}>
        <Px src="img/layer_2100_full.png" x={0} y={0} w={256 * S} h={240 * S} />
        <Grid cw={8 * S} o={a1 * (1 - a2 * 0.4)} color="rgba(255,255,255,.6)" />
      </div>
      <Txt x={80} y={760} size={32} color={C.sub} o={a1}>8×8ドットのタイルを並べた画面　点を1つずつは描けない</Txt>
      {/* 右：SuperFXの絵 → タイルの模様 → PPU */}
      <div style={{opacity: a2}}>
        <div style={{position: 'absolute', left: 980, top: 160, width: 256 * 2, height: 192 * 2, background: '#0b1226', borderRadius: 8, overflow: 'hidden',
          border: `3px solid ${C.cyan}`}}>
          <Px src="img/layer_2100_fx.png" x={0} y={0} w={256 * 2} h={240 * 2} />
          <Grid cw={16} o={0.35} />
        </div>
        <Label x={995} y={175} color={C.cyan}>SuperFXが描いた1枚の絵</Label>
        <Arrow x1={1236} y1={560} x2={1236} y2={650} color={C.cyan} p={ramp(f, k(2) + 20, k(2) + 45)} />
        <Card x={980} y={660} w={512} color={C.violet} o={ramp(f, k(2) + 40, k(2) + 60)}>
          <div style={{fontSize: 30, fontWeight: 900}}>タイルの模様として差し出す</div>
          <div style={{fontSize: 24, color: C.sub, fontWeight: 700}}>カートリッジの中で</div>
        </Card>
        <Card x={1530} y={660} w={320} color={C.amber} o={a3}>
          <div style={{fontSize: 30, fontWeight: 900}}>PPU</div>
          <div style={{fontSize: 24, color: C.sub, fontWeight: 700}}>いつもどおり読むだけ</div>
        </Card>
        <Arrow x1={1495} y1={720} x2={1525} y2={720} color={C.amber} p={a3} width={5} />
      </div>
    </Bg>
  );
};
