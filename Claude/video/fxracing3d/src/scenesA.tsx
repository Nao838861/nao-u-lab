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
  const k = K('S03');
  const a0 = useIn(k(0)), a1 = useIn(k(1)), a2 = useIn(k(2));
  return (
    <Bg>
      <SceneTitle label="カートリッジに入れたもの" />
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
    </Bg>
  );
};

// ---------------- S04 できないこと1：絵を自由に描けない → 送らない ----------------
export const S04: React.FC = () => {
  const f = useCurrentFrame(), k = K('S04');
  const a1 = useIn(k(1)), a2 = ramp(f, k(2), k(2) + 16), a3 = ramp(f, k(3), k(3) + 16), a4 = useIn(k(4));
  const S = 3;
  const big = 12288, small = 300, barW = 1150;
  // PPUがタイルを読みに来る：画面を左上から順にタイルが光る（1コマで全タイル。ここではゆっくり見せる）
  const t = Math.max(0, f - k(3) - 20);
  const tile = Math.floor(t / 2) % (32 * 24);
  const tx = tile % 32, ty = Math.floor(tile / 32);
  return (
    <Bg>
      <SceneTitle label="できないこと1　絵を自由に描けない" color={C.cyan} />
      <div style={{opacity: 1 - a2}}>
        <div style={{position: 'absolute', left: 80, top: 160, width: 256 * S, height: 192 * S, overflow: 'hidden', borderRadius: 8, boxShadow: '0 12px 44px rgba(0,0,0,.6)'}}>
          <Px src="img/layer_2100_full.png" x={0} y={0} w={256 * S} h={240 * S} />
          <Grid cw={8 * S} o={a1} color="rgba(255,255,255,.6)" />
        </div>
        <Txt x={80} y={760} size={32} color={C.sub} o={a1}>8×8ドットのタイルを並べた画面　点を1つずつは描けない</Txt>
      </div>
      {/* 送ると間に合わない */}
      <div style={{opacity: a2 * (1 - a3)}}>
        <Txt x={160} y={200} size={44}>送り込むと？</Txt>
        <div style={{position: 'absolute', left: 160, top: 300}}>
          <div style={{fontSize: 32, fontWeight: 800, color: C.sub, marginBottom: 10}}>3Dの部分の絵 1枚（256×192ドット・1ドット2ビット）</div>
          <div style={{display: 'flex', alignItems: 'center', gap: 24}}>
            <div style={{width: barW * ramp(f, k(2) + 10, k(2) + 50), height: 70, background: C.cyan, borderRadius: 8}} />
            <div style={{fontSize: 52, fontWeight: 900, color: C.cyan}}>12,288バイト</div>
          </div>
        </div>
        <div style={{position: 'absolute', left: 160, top: 500, opacity: ramp(f, k(2) + 200, k(2) + 220)}}>
          <div style={{fontSize: 32, fontWeight: 800, color: C.sub, marginBottom: 10}}>ファミコンが画面の休み時間に書き換えられる量（1コマ）</div>
          <div style={{display: 'flex', alignItems: 'center', gap: 24}}>
            <div style={{width: (barW * small) / big, height: 70, background: C.red, borderRadius: 8}} />
            <div style={{fontSize: 52, fontWeight: 900, color: C.red}}>約300バイト</div>
          </div>
        </div>
        <Txt x={160} y={700} size={56} color={C.red} o={ramp(f, k(2) + 300, k(2) + 320)}>とても間に合わない</Txt>
      </div>
      {/* 送らない：PPUが読みに来たときに返す */}
      <div style={{opacity: a3}}>
        <div style={{position: 'absolute', left: 80, top: 170, width: 256 * S, height: 192 * S, overflow: 'hidden', borderRadius: 8, boxShadow: '0 12px 44px rgba(0,0,0,.6)'}}>
          <Px src="img/layer_2100_full.png" x={0} y={0} w={256 * S} h={240 * S} />
          <Grid cw={8 * S} o={0.25} />
          <div style={{position: 'absolute', left: tx * 8 * S, top: ty * 8 * S, width: 8 * S, height: 8 * S, border: `4px solid ${C.amber}`, boxShadow: `0 0 18px ${C.amber}`}} />
        </div>
        <Label x={100} y={190} color={C.amber}>PPUがタイルの模様を読みに来る</Label>
        <Card x={1000} y={170} w={420} color={C.amber}>
          <div style={{fontSize: 36, fontWeight: 900}}>ファミコン</div>
          <div style={{fontSize: 30, fontWeight: 800, color: C.amber}}>PPU</div>
          <div style={{fontSize: 24, color: C.sub, fontWeight: 700}}>「この場所の模様は？」</div>
        </Card>
        <Card x={1000} y={470} w={840} color={C.cyan}>
          <div style={{fontSize: 36, fontWeight: 900}}>カートリッジ</div>
          <div style={{fontSize: 28, color: C.cyan, fontWeight: 800}}>SuperFXが描き上げた絵の中身を返す</div>
          <div style={{display: 'flex', gap: 6, marginTop: 14}}>
            {Array.from({length: 16}, (_, i) => (
              <div key={i} style={{width: 40, height: 40, borderRadius: 4, background: i === tile % 16 ? C.amber : C.panel2}} />
            ))}
          </div>
        </Card>
        <Arrow x1={1210} y1={330} x2={1210} y2={460} color={C.amber} width={6} p={ramp(f, k(3) + 10, k(3) + 30)} label="読む" />
        <Arrow x1={1500} y1={460} x2={1500} y2={330} color={C.cyan} width={6} p={ramp(f, k(3) + 40, k(3) + 60)} label="返す" />
        <Txt x={1000} y={720} size={40} color={C.green} o={a4}>CPUで絵を運ぶ必要はない</Txt>
      </div>
    </Bg>
  );
};
