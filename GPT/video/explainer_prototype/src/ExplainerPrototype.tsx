import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  OffthreadVideo,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {
  c01Timing,
  c02Timing,
  c03Timing,
  narrationTimingOffset,
} from './narrationTiming';
import {
  c04Timing,
  c05Timing,
  c06Timing,
} from './developmentNarrationTiming';
import {
  c08Timing,
  c09Timing,
  c10Timing,
} from './drawingNarrationTiming';

const C = {
  bg: '#050507',
  white: '#f7f4f8',
  dim: '#8c8792',
  panel: '#121118',
  panel2: '#1c1923',
  magenta: '#f552d2',
  cyan: '#48d8ff',
  orange: '#ffb84a',
  red: '#ff5c6c',
};

const FONT = '"Yu Gothic UI", "Hiragino Sans", system-ui, sans-serif';
const MONO = '"Cascadia Mono", "Consolas", monospace';

const sprite = [
  '00011000',
  '00111100',
  '01111110',
  '11011011',
  '11111111',
  '01100110',
  '11000011',
  '10000001',
];

const filled = sprite.flatMap((row, y) =>
  [...row].flatMap((v, x) => (v === '1' ? [{x, y}] : [])),
);

// Em0_00.png (55x30)を、VBUFの1バイト＝横4x縦2ドット単位で分類したもの。
// 0: 全面透明、1: 一部だけ描画、2: 全面上書き。
const enemyCoverage = [
  '00000011000000',
  '00000112000000',
  '00001222210000',
  '00111222221000',
  '00122222222100',
  '00222222222100',
  '01222222222210',
  '11222222222210',
  '12222222222221',
  '11112222211111',
  '00001222210000',
  '00001122100000',
  '00000122100000',
  '00000122100000',
  '00000011000000',
].flatMap((row) => [...row].map(Number));

const rasterBlocks = enemyCoverage.map((_, i) => i);
const drawableBlocks = rasterBlocks.filter((i) => enemyCoverage[i] !== 0);
const genericLoopCode = [
  'loop:',
  '  LDA (screen),Y',
  '  AND (mask),Y',
  '  ORA (image),Y',
  '  STA (screen),Y',
  '  INY',
  '  CPY #BYTES',
  '  BNE loop',
];
const compiledProgram = drawableBlocks.map((blockIndex) => ({
  blockIndex,
  category: enemyCoverage[blockIndex],
  code: enemyCoverage[blockIndex] === 1 ? 'LDA AND ORA STA' : 'LDA STA',
}));

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

const fade = (frame: number, duration: number) =>
  interpolate(frame, [0, 12, duration - 12, duration], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

const Eyebrow: React.FC<{children: React.ReactNode; color?: string; size?: number}> = ({
  children,
  color = C.magenta,
  size = 19,
}) => (
  <div
    style={{
      color,
      fontFamily: MONO,
      fontWeight: 800,
      fontSize: size,
      letterSpacing: 4,
    }}
  >
    {children}
  </div>
);

const Title: React.FC<{
  children: React.ReactNode;
  size?: number;
  align?: 'left' | 'center';
}> = ({children, size = 54, align = 'left'}) => (
  <div
    style={{
      color: C.white,
      fontFamily: FONT,
      fontWeight: 800,
      fontSize: size,
      lineHeight: 1.22,
      letterSpacing: -1.5,
      textAlign: align,
      textWrap: 'balance',
    }}
  >
    {children}
  </div>
);

const GridSprite: React.FC<{
  size?: number;
  revealed?: number;
  cursor?: number;
  shiftX?: number;
  shiftY?: number;
  bright?: string;
  showGrid?: boolean;
}> = ({
  size = 38,
  revealed = 64,
  cursor = -1,
  shiftX = 0,
  shiftY = 0,
  bright = C.white,
  showGrid = true,
}) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: `repeat(8, ${size}px)`,
      gridTemplateRows: `repeat(8, ${size}px)`,
      transform: `translate(${shiftX}px, ${shiftY}px)`,
      boxShadow: `0 0 60px ${bright}1b`,
    }}
  >
    {sprite.flatMap((row, y) =>
      [...row].map((v, x) => {
        const i = y * 8 + x;
        const on = v === '1' && i < revealed;
        return (
          <div
            key={`${x}-${y}`}
            style={{
              width: size,
              height: size,
              boxSizing: 'border-box',
              border: showGrid ? '1px solid #302d38' : undefined,
              background: on ? bright : '#0b0a0e',
              outline: cursor === i ? `4px solid ${C.orange}` : undefined,
              outlineOffset: -3,
            }}
          />
        );
      }),
    )}
  </div>
);

const PackedEnemy: React.FC<{
  scale?: number;
  order?: number[];
  processedCount?: number;
  cursor?: number;
  showAll?: boolean;
  showTransparent?: boolean;
  analyze?: boolean;
}> = ({
  scale = 7,
  order = rasterBlocks,
  processedCount = 0,
  cursor = -1,
  showAll = false,
  showTransparent = false,
  analyze = false,
}) => {
  const processed = new Set(order.slice(0, processedCount));
  const width = 55;
  const height = 30;
  const blocksPerRow = 14;
  const enemyImage = staticFile('enemy_em0_00.png');

  return (
    <div
      style={{
        position: 'relative',
        width: width * scale,
        height: height * scale,
        background: '#0b0c0f',
        border: '2px solid #53505b',
        boxShadow: '0 18px 55px rgba(0,0,0,.45)',
      }}
    >
      {enemyCoverage.map((category, i) => {
        const bx = i % blocksPerRow;
        const by = Math.floor(i / blocksPerRow);
        const x = bx * 4;
        const y = by * 2;
        const bw = Math.min(4, width - x);
        const bh = Math.min(2, height - y);
        const visible = showAll || processed.has(i) || (showTransparent && category === 0);
        const analysisColor = category === 0 ? '#5a5c65' : category === 1 ? C.orange : C.magenta;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x * scale,
              top: y * scale,
              width: bw * scale,
              height: bh * scale,
              overflow: 'hidden',
              boxSizing: 'border-box',
              backgroundColor: visible ? '#34363e' : '#0c0d10',
              backgroundImage: visible && category !== 0 ? `url(${enemyImage})` : undefined,
              backgroundSize: `${width * scale}px ${height * scale}px`,
              backgroundPosition: `${-x * scale}px ${-y * scale}px`,
              backgroundRepeat: 'no-repeat',
              imageRendering: 'pixelated',
              border: analyze
                ? `1px solid ${analysisColor}`
                : '1px solid rgba(120,118,130,.22)',
              outline: cursor === i ? `4px solid ${C.orange}` : undefined,
              outlineOffset: -3,
              zIndex: cursor === i ? 3 : 1,
            }}
          />
        );
      })}
    </div>
  );
};

const VideoPlate: React.FC<{
  src: string;
  startFrom?: number;
  pixelated?: boolean;
}> = ({src, startFrom = 0, pixelated = false}) => (
  <AbsoluteFill style={{backgroundColor: C.bg}}>
    <OffthreadVideo
      src={staticFile(src)}
      startFrom={startFrom}
      muted
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        imageRendering: pixelated ? 'pixelated' : 'auto',
      }}
    />
    <AbsoluteFill
      style={{
        background:
          'linear-gradient(90deg, rgba(5,5,7,.55), transparent 42%, rgba(5,5,7,.12)), linear-gradient(0deg, rgba(5,5,7,.55), transparent 42%)',
      }}
    />
  </AbsoluteFill>
);

const IntroScene: React.FC<{durationInFrames: number}> = ({durationInFrames}) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, Math.max(1, durationInFrames - 1)], [1.04, 1.12], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });
  const enter = spring({frame, fps: 30, config: {damping: 18}});
  return (
    <AbsoluteFill style={{opacity: fade(frame, durationInFrames), backgroundColor: C.bg}}>
      <div style={{position: 'absolute', inset: 0, transform: `scale(${scale})`}}>
        <VideoPlate src="current_demo.mp4" pixelated />
      </div>
      <div
        style={{
          position: 'absolute',
          left: 64,
          top: 62,
          width: 1000,
          transform: `translateY(${(1 - enter) * 34}px)`,
          opacity: enter,
        }}
      >
        <Eyebrow>FAMILY COMPUTER / 6502 / MMC5</Eyebrow>
        <div style={{height: 18}} />
        <Title size={54}>
          <div style={{whiteSpace: 'nowrap'}}>ファミコンでスペースハリアーを動かすには？</div>
        </Title>
      </div>
    </AbsoluteFill>
  );
};

const PreviousScene: React.FC<{durationInFrames: number}> = ({durationInFrames}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{opacity: fade(frame, durationInFrames), backgroundColor: C.bg}}>
      <VideoPlate src="previous_video.mp4" />
      <div
        style={{
          position: 'absolute',
          top: 46,
          right: 54,
          padding: '12px 18px',
          background: C.magenta,
          color: '#120b12',
          fontFamily: MONO,
          fontWeight: 900,
          fontSize: 17,
          letterSpacing: 2,
        }}
      >
        PREVIOUS VIDEO
      </div>
      <div
        style={{
          position: 'absolute',
          left: 54,
          top: 46,
          padding: '12px 18px',
          background: '#050507d9',
          borderLeft: `5px solid ${C.cyan}`,
          color: C.white,
          fontFamily: FONT,
          fontWeight: 800,
          fontSize: 17,
          lineHeight: 1.45,
        }}
      >
        <div>前回の解説動画</div>
        <div style={{fontFamily: MONO, color: C.cyan, fontSize: 15}}>
          https://www.youtube.com/watch?v=AW4DFiy1QC0
        </div>
      </div>
    </AbsoluteFill>
  );
};

const DevelopmentTitleScene: React.FC<{durationInFrames: number}> = ({durationInFrames}) => {
  const frame = useCurrentFrame();
  const enter = spring({frame, fps: 30, config: {damping: 15}});
  return (
    <AbsoluteFill style={{opacity: fade(frame, durationInFrames), backgroundColor: C.bg, display: 'grid', placeItems: 'center'}}>
      <div style={{textAlign: 'center', opacity: enter, transform: `translateY(${(1 - enter) * 24}px)`}}>
        <Eyebrow color={C.cyan}>DEVELOPMENT LOG</Eyebrow>
        <div style={{height: 12}} />
        <Title size={62}>開発記録</Title>
      </div>
    </AbsoluteFill>
  );
};

const DevVideoFrame: React.FC<{src: string; children?: React.ReactNode}> = ({src, children}) => (
  <div style={{position: 'absolute', left: 40, top: 135, width: 760, height: 570, padding: 8, boxSizing: 'border-box', background: C.panel, border: '2px solid #47434e'}}>
    <OffthreadVideo src={staticFile(src)} muted style={{width: '100%', height: '100%', objectFit: 'contain', background: '#000', imageRendering: 'pixelated'}} />
    {children}
  </div>
);

const DevelopmentDay1Scene: React.FC<{durationInFrames?: number}> = ({durationInFrames = 450}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{opacity: fade(frame, durationInFrames), backgroundColor: C.bg, padding: '36px 48px 0', boxSizing: 'border-box'}}>
      <div style={{position: 'absolute', left: 48, top: 36, zIndex: 5}}>
        <Eyebrow color={C.orange}>DAY 1</Eyebrow>
        <Title size={42}>地面と拡大縮小だけ</Title>
      </div>
      <DevVideoFrame src="dev_day1.mp4" />
      <div style={{position: 'absolute', left: 828, top: 158, width: 404}}>
        <div style={{fontFamily: FONT, color: C.white, fontSize: 25, fontWeight: 900}}>地面はライン単位</div>
        <div style={{fontFamily: FONT, color: C.dim, fontSize: 17, lineHeight: 1.6, marginTop: 14}}>Y軸ごとに白／黒の値を持ち、横一列を同じ色で塗る。</div>
        <div style={{marginTop: 20, border: '1px solid #47434e', background: C.panel, padding: 12}}>
          {[0, 1, 1, 0, 1, 0, 0].map((v, i) => (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 9, marginTop: i ? 7 : 0}}>
              <span style={{width: 34, fontFamily: MONO, color: C.dim, fontSize: 12}}>Y{i}</span>
              <span style={{width: 20, fontFamily: MONO, color: v ? C.white : C.dim, fontSize: 12}}>{v}</span>
              <span style={{height: 8, flex: 1, background: v ? C.white : '#050507'}} />
            </div>
          ))}
        </div>
        <div style={{fontFamily: FONT, color: C.cyan, fontSize: 19, lineHeight: 1.5, fontWeight: 900, marginTop: 18}}>7パターンを切り替えて<br />前進を表現</div>
      </div>
    </AbsoluteFill>
  );
};

const DevelopmentDay2Scene: React.FC<{durationInFrames?: number}> = ({durationInFrames = 450}) => {
  const frame = useCurrentFrame();
  const zProgress = (frame % 60) / 59;
  return (
    <AbsoluteFill style={{opacity: fade(frame, durationInFrames), backgroundColor: C.bg, padding: '36px 48px 0', boxSizing: 'border-box'}}>
      <div style={{position: 'absolute', left: 48, top: 36, zIndex: 5}}>
        <Eyebrow color={C.orange}>DAY 2</Eyebrow>
        <Title size={42}>奥行きに合わせて木を動かす</Title>
      </div>
      <DevVideoFrame src="dev_day2.mp4" />
      <div style={{position: 'absolute', left: 828, top: 155, width: 404}}>
        <div style={{fontFamily: FONT, color: C.white, fontSize: 25, fontWeight: 900}}>Z軸 56段階</div>
        <div style={{height: 210, marginTop: 12, position: 'relative', borderLeft: `5px solid ${C.cyan}`, background: `linear-gradient(180deg, ${C.cyan}12, ${C.magenta}28)`}}>
          <div style={{position: 'absolute', left: 15, top: 5, fontFamily: MONO, color: C.cyan, fontSize: 14}}>Z = 55　奥</div>
          <div style={{position: 'absolute', left: 15, bottom: 5, fontFamily: MONO, color: C.magenta, fontSize: 14}}>Z = 0　手前</div>
          <div style={{position: 'absolute', left: -10, top: `${10 + zProgress * 180}px`, width: 22, height: 5, background: C.white, boxShadow: '0 0 8px #fff'}} />
        </div>
        <div style={{fontFamily: FONT, color: C.white, fontSize: 17, lineHeight: 1.5, marginTop: 10}}>各段階でスプライトの大きさとY座標を手作業で補正</div>
        <div style={{height: 178, marginTop: 9, overflow: 'hidden', border: '1px solid #47434e', background: '#111216'}}>
          <Img src={staticFile('development_z_table.png')} style={{width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center', opacity: 0.92}} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

const DevelopmentDay3Scene: React.FC<{durationInFrames?: number}> = ({durationInFrames = 300}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{opacity: fade(frame, durationInFrames), backgroundColor: C.bg, padding: '36px 48px 0', boxSizing: 'border-box'}}>
      <div style={{position: 'absolute', left: 48, top: 36, zIndex: 5}}>
        <Eyebrow color={C.orange}>DAY 3</Eyebrow>
        <Title size={42}>プレイヤーの上下で地平線を動かす</Title>
      </div>
      <DevVideoFrame src="dev_day3.mp4" />
      <div style={{position: 'absolute', left: 828, top: 165, width: 404}}>
        <div style={{fontFamily: FONT, color: C.white, fontSize: 25, fontWeight: 900}}>地平線もプレイヤーに追従</div>
        <div style={{fontFamily: FONT, color: C.dim, fontSize: 17, lineHeight: 1.65, marginTop: 14}}>プレイヤーのY座標に応じて、地面テーブルそのものを切り替える。</div>
        <div style={{marginTop: 22, padding: '16px 18px', borderLeft: `5px solid ${C.cyan}`, background: C.panel}}>
          <div style={{fontFamily: MONO, color: C.cyan, fontSize: 31, fontWeight: 900}}>33段階</div>
          <div style={{fontFamily: FONT, color: C.white, fontSize: 21, fontWeight: 900, marginTop: 5}}>各7パターン</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const DevelopmentCheckerboardScene: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{opacity: fade(frame, 450), backgroundColor: C.bg, padding: '36px 48px 0', boxSizing: 'border-box'}}>
      <Eyebrow color={C.red}>DAY 3</Eyebrow>
      <Title size={42}>市松模様の地面も試した</Title>
      <div style={{position: 'absolute', left: 125, top: 135, width: 1030, height: 500, padding: 12, boxSizing: 'border-box', background: C.panel, border: `2px solid ${C.red}`}}>
        <OffthreadVideo src={staticFile('dev_checkerboard.mp4')} muted style={{width: '100%', height: '100%', objectFit: 'contain', background: '#000', imageRendering: 'pixelated'}} />
        <div style={{position: 'absolute', right: 22, top: 20, padding: '8px 14px', background: '#16080bcc', border: `2px solid ${C.red}`, fontFamily: FONT, color: C.red, fontSize: 24, fontWeight: 900}}>不採用案</div>
      </div>
      <div style={{position: 'absolute', left: 125, bottom: 48, fontFamily: FONT, color: C.dim, fontSize: 16, fontWeight: 900}}>
        描画量と見た目の両面から不採用
      </div>
    </AbsoluteFill>
  );
};

const LargeCharacterScene: React.FC<{durationInFrames?: number}> = ({durationInFrames = 720}) => {
  const frame = useCurrentFrame();
  const imageEnter = spring({frame, fps: 30, config: {damping: 18}});
  const cpuOpacity = interpolate(frame, [107, 119], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const clearOpacity = interpolate(frame, [319, 331], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const compositeOpacity = interpolate(frame, [520, 532], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const warningOpacity = interpolate(frame, [715, 727], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        opacity: fade(frame, durationInFrames),
        background: C.bg,
        padding: '40px 54px 0',
        boxSizing: 'border-box',
      }}
    >
      <Title size={40}>大きなキャラをどうやって描画しているか</Title>

      <div style={{display: 'flex', gap: 28, marginTop: 25, height: 500}}>
        <div
          style={{
            position: 'relative',
            width: 766,
            height: 495,
            flexShrink: 0,
            overflow: 'hidden',
            background: '#000',
            border: '2px solid #4b4752',
            transform: `translateY(${(1 - imageEnter) * 18}px)`,
            opacity: imageEnter,
          }}
        >
          <Img
            src={staticFile('large_character_1.png')}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              imageRendering: 'pixelated',
            }}
          />
        </div>

        <div
          style={{
            width: 378,
            height: 495,
            padding: '8px 4px',
            boxSizing: 'border-box',
          }}
        >
          {[
            {opacity: cpuOpacity, color: C.orange, lead: 'CPUクロック：1.79MHz', body: '8bit CPUには大きな絵の書き換えが重い'},
            {opacity: clearOpacity, color: C.cyan, lead: '画面クリアだけで20%', body: '128×96の画面を消すだけでも1フレームの20%'},
            {opacity: compositeOpacity, color: C.red, lead: 'さらに', body: '背景との重ね合わせ処理が必要'},
          ].map((item) => (
            <div key={item.lead} style={{opacity: item.opacity * (item.lead === 'さらに' ? 1 - warningOpacity : 1), marginBottom: 18, padding: '18px 20px', background: C.panel, borderLeft: `6px solid ${item.color}`}}>
              <div style={{fontFamily: MONO, color: item.color, fontSize: 30, fontWeight: 900}}>{item.lead}</div>
              <div style={{fontFamily: FONT, color: C.white, fontSize: 19, fontWeight: 800, lineHeight: 1.45, marginTop: 5}}>{item.body}</div>
            </div>
          ))}
          <div style={{position: 'absolute', left: 54, right: 54, top: 510, boxSizing: 'border-box', zIndex: 4, opacity: warningOpacity, padding: '14px 20px 16px', background: `linear-gradient(135deg, ${C.magenta}, ${C.orange})`, color: C.bg, fontFamily: FONT, textAlign: 'center', fontWeight: 900, boxShadow: `0 0 28px ${C.magenta}55`}}>
            <div style={{fontSize: 18, letterSpacing: 2}}>高速化の切り札</div>
            <div style={{fontSize: 32, lineHeight: 1.18, marginTop: 3}}>「コンパイルドスプライト」を使う</div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const GenericLoopScene: React.FC<{
  durationInFrames?: number;
  narrationSchedule?: boolean;
}> = ({durationInFrames = 300, narrationSchedule = false}) => {
  const frame = useCurrentFrame();
  const narrationLoopFrames = (narrationSchedule ? 18 : 9) * 30;
  const narrationLoopFrame = narrationSchedule
    ? Math.min(frame, narrationLoopFrames - 1)
    : frame % narrationLoopFrames;
  const narrationStepStartFrames = [10.8, 12.56, 14.345, 15.715, 16.695]
    .map((seconds) => Math.round(seconds * 30));
  const done = narrationSchedule
    ? clamp(
      Math.floor(interpolate(narrationLoopFrame, [0, narrationLoopFrames - 1], [0, rasterBlocks.length])),
      0,
      rasterBlocks.length,
    )
    : clamp(Math.floor(interpolate(frame, [20, 285], [0, rasterBlocks.length])), 0, rasterBlocks.length);
  const cursor = rasterBlocks[Math.min(rasterBlocks.length - 1, done)];
  const category = enemyCoverage[cursor] ?? 0;
  const kinds = ['全面透明', '一部だけ描画', '全面上書き'];
  const steps = ['画像とマスクを読む', '画面の元の値を読む', 'マスク処理を行う(AND)', '絵を合成する(OR)', '元の場所に書き戻す'];
  const active = narrationSchedule
    ? frame < narrationStepStartFrames[0]
      ? -1
      : frame < narrationStepStartFrames[1]
        ? 0
        : frame < narrationStepStartFrames[2]
          ? 1
          : frame < narrationStepStartFrames[3]
            ? 2
            : frame < narrationStepStartFrames[4]
              ? 3
              : 4
    : Math.floor(frame / 8) % steps.length;
  return (
    <AbsoluteFill
      style={{
        opacity: fade(frame, durationInFrames),
        background: `radial-gradient(circle at 24% 45%, ${C.cyan}12, transparent 35%), ${C.bg}`,
        padding: '50px 58px',
        boxSizing: 'border-box',
      }}
    >
      <Eyebrow color={C.cyan} size={32}>一般的なソフトウェア描画の場合</Eyebrow>
      <div style={{height: 8}} />
      <Title size={37}>すべての4×2ドットに、同じ合成処理を実行</Title>
      <div style={{display: 'flex', alignItems: 'flex-start', gap: 24, marginTop: 27}}>
        <div style={{width: 550, flexShrink: 0}}>
          <PackedEnemy scale={10} processedCount={done} cursor={cursor} />
          <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 9, fontFamily: MONO}}>
            <span style={{color: C.dim, fontSize: 17}}>1 BYTE = 4 × 2 DOTS</span>
            <span style={{color: C.cyan, fontSize: 17}}>{String(done).padStart(3, '0')} / 210</span>
          </div>
          <div
            style={{
              marginTop: 8,
              padding: '8px 14px 9px',
              background: C.panel,
              border: '1px solid #3b3842',
            }}
          >
            <div style={{fontFamily: FONT, color: C.cyan, fontWeight: 900, fontSize: 16, marginBottom: 5}}>
              データを読みながら描くプログラム
            </div>
            {genericLoopCode.map((line) => (
              <div key={line} style={{fontFamily: MONO, color: C.white, fontSize: 15, lineHeight: 1.15}}>
                {line}
              </div>
            ))}
          </div>
        </div>
        <div style={{flex: 1}}>
          <div style={{display: 'flex', gap: 9, marginBottom: 15}}>
            {kinds.map((kind, i) => (
              <div
                key={kind}
                style={{
                  flex: 1,
                  padding: '10px 5px',
                  textAlign: 'center',
                  background: i === category ? `${C.cyan}20` : C.panel,
                  border: `1px solid ${i === category ? C.cyan : '#3a3741'}`,
                  color: i === category ? C.white : C.dim,
                  fontFamily: FONT,
                  fontSize: 17,
                  fontWeight: 800,
                }}
              >
                {kind}
              </div>
            ))}
          </div>
          {steps.map((step, i) => (
            <div
              key={step}
              style={{
                marginBottom: 8,
                padding: '11px 18px',
                border: `2px solid ${i === active ? C.cyan : '#34313c'}`,
                background: i === active ? `${C.cyan}18` : C.panel,
                color: i === active ? C.white : C.dim,
                fontFamily: FONT,
                fontSize: 22,
                fontWeight: 800,
                transform: `translateX(${i === active ? 8 : 0}px)`,
              }}
            >
              <span style={{color: C.cyan, fontFamily: MONO, marginRight: 18}}>
                0{i + 1}
              </span>
              {step}
            </div>
          ))}
          <div style={{color: C.white, fontFamily: MONO, fontSize: 19, marginTop: 14}}>
            SCREEN = (SCREEN AND MASK) OR IMAGE
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const CompiledScene: React.FC<{durationInFrames?: number}> = ({durationInFrames = 360}) => {
  const frame = useCurrentFrame();
  const blocksPerRow = 14;
  const startCursor = rasterBlocks[0];
  const startOrderIndex = rasterBlocks.indexOf(startCursor);
  const partialTargetOrderIndex = rasterBlocks.findIndex(
    (blockIndex, orderIndex) =>
      orderIndex > startOrderIndex
      && Math.floor(blockIndex / blocksPerRow) === 1
      && enemyCoverage[blockIndex] === 1,
  );
  const fullTargetOrderIndex = rasterBlocks.findIndex(
    (blockIndex, orderIndex) => orderIndex > partialTargetOrderIndex && enemyCoverage[blockIndex] === 2,
  );
  const framesPerBlock = 4;
  const partialMoveStart = Math.round(6.27 * 30);
  const fullMoveStart = Math.round(14.055 * 30);
  const cursorOrderIndex = frame < partialMoveStart
    ? startOrderIndex
    : frame < fullMoveStart
      ? Math.min(
        partialTargetOrderIndex,
        startOrderIndex + Math.floor((frame - partialMoveStart) / framesPerBlock),
      )
      : Math.min(
        fullTargetOrderIndex,
        partialTargetOrderIndex + Math.floor((frame - fullMoveStart) / framesPerBlock),
      );
  const cursor = rasterBlocks[cursorOrderIndex];
  const active = enemyCoverage[cursor] ?? 0;
  const cards = [
    {title: '全面透明', equation: '(SCREEN AND $FF) OR $00', result: '命令なし', code: ['; 命令なし']},
    {title: '一部だけ描画', equation: '(SCREEN AND $C3) OR $24', result: '必要な合成だけ', code: ['LDA (screen),Y', 'AND #$C3', 'ORA #$24', 'STA (screen),Y']},
    {title: '全面上書き', equation: '(SCREEN AND $00) OR $7F', result: '直接メモリへ書く', code: ['LDA #$7F', 'STA (screen),Y']},
  ];
  const activeCard = cards[active];
  return (
    <AbsoluteFill
      style={{
        opacity: fade(frame, durationInFrames),
        background: `radial-gradient(circle at 76% 50%, ${C.magenta}18, transparent 36%), ${C.bg}`,
        padding: '46px 58px',
        boxSizing: 'border-box',
      }}
    >
      <Eyebrow size={32}>コンパイルドスプライト</Eyebrow>
      <div style={{height: 8}} />
      <Title size={37}>目的の絵を最速で書くための専用プログラムを作成</Title>
      <div style={{display: 'flex', gap: 24, alignItems: 'flex-start', marginTop: 27}}>
        <div style={{width: 550, flexShrink: 0}}>
          <PackedEnemy scale={10} showAll analyze cursor={cursor} />
          <div style={{display: 'flex', gap: 14, marginTop: 9, fontFamily: FONT, fontSize: 16, fontWeight: 800}}>
            <span style={{color: '#8b8d96'}}>■ 透明</span>
            <span style={{color: C.orange}}>■ 一部</span>
            <span style={{color: C.magenta}}>■ 全面</span>
          </div>
          <div
            style={{
              marginTop: 12,
              minHeight: 127,
              padding: '12px 16px 13px',
              boxSizing: 'border-box',
              background: C.panel,
              border: `1px solid ${C.magenta}`,
            }}
          >
            <div style={{fontFamily: FONT, color: C.magenta, fontWeight: 900, fontSize: 17, marginBottom: 7}}>
              この場所だけを描く最短のプログラム
            </div>
            {activeCard.code.map((line) => (
              <div key={line} style={{fontFamily: MONO, color: C.white, fontSize: 18, lineHeight: 1.3}}>
                {line}
              </div>
            ))}
          </div>
        </div>
        <div style={{flex: 1}}>
          <div style={{display: 'flex', gap: 9, marginBottom: 15}}>
            {cards.map((card, i) => (
              <div
                key={card.title}
                style={{
                  flex: 1,
                  padding: '10px 5px',
                  textAlign: 'center',
                  background: i === active ? `${C.magenta}20` : C.panel,
                  border: `1px solid ${i === active ? C.magenta : '#3a3741'}`,
                  color: i === active ? C.white : C.dim,
                  fontFamily: FONT,
                  fontSize: 17,
                  fontWeight: 800,
                }}
              >
                {card.title}
              </div>
            ))}
          </div>
          {cards.map((card, i) => {
            const lit = i === active;
            return (
              <div
                key={card.title}
                style={{
                  padding: '13px 18px',
                  marginBottom: 11,
                  background: lit ? `${C.magenta}20` : C.panel,
                  border: `2px solid ${lit ? C.magenta : '#34313c'}`,
                  color: lit ? C.white : '#706b77',
                  opacity: lit ? 1 : 0.6,
                }}
              >
                <div style={{display: 'flex', alignItems: 'baseline', justifyContent: 'space-between'}}>
                  <span style={{fontFamily: FONT, fontWeight: 900, fontSize: 22}}>{card.title}</span>
                  <span style={{fontFamily: MONO, fontSize: 15}}>{card.equation}</span>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 8}}>
                  <span style={{fontFamily: FONT, fontSize: 18, fontWeight: 800, color: lit ? C.magenta : C.dim}}>
                    {card.result}
                  </span>
                </div>
              </div>
            );
          })}
          <div style={{fontFamily: FONT, color: C.cyan, fontWeight: 900, fontSize: 19, marginTop: 17}}>
            絵に合わせて、不要な命令を消す
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const RaceScene: React.FC = () => {
  const frame = useCurrentFrame();
  const started = frame >= 45;
  const genericWork = clamp(
    interpolate(frame, [45, 350], [0, rasterBlocks.length * genericLoopCode.length]),
    0,
    rasterBlocks.length * genericLoopCode.length,
  );
  const generic = clamp(Math.floor(genericWork / genericLoopCode.length), 0, rasterBlocks.length);
  const compiled = clamp(Math.floor(interpolate(frame, [45, 180], [0, compiledProgram.length])), 0, compiledProgram.length);
  const genericCursor = started && generic < rasterBlocks.length ? rasterBlocks[generic] : -1;
  const compiledCursor = started && compiled < compiledProgram.length ? compiledProgram[compiled].blockIndex : -1;
  const genericLine = started && generic < rasterBlocks.length ? Math.floor(genericWork) % genericLoopCode.length : -1;
  const compiledLine = started && compiled < compiledProgram.length ? compiled : -1;
  const rowsPerColumn = Math.ceil(compiledProgram.length / 3);
  const currentCompiledCode = compiledLine >= 0 ? compiledProgram[compiledLine].code : compiled >= compiledProgram.length ? 'DONE' : 'READY';
  return (
    <AbsoluteFill style={{opacity: fade(frame, 390), backgroundColor: C.bg, padding: '35px 42px', boxSizing: 'border-box'}}>
      <Title size={39} align="center">コンパイルドスプライトのメリット</Title>
      <div style={{color: C.white, fontFamily: FONT, fontSize: 23, fontWeight: 800, textAlign: 'center', marginTop: 5}}>
        同じ絵を、メモリと引き換えに高速に描画できる
      </div>
      <div style={{display: 'flex', justifyContent: 'space-around', marginTop: 12}}>
        <div style={{width: 540, textAlign: 'center'}}>
          <Eyebrow color={C.cyan}>普通の描画</Eyebrow>
          <div style={{height: 11}} />
          <div style={{display: 'flex', justifyContent: 'center'}}>
            <PackedEnemy scale={6} processedCount={generic} cursor={genericCursor} />
          </div>
          <div style={{margin: '12px auto 0', width: 330, height: 10, background: '#22202a'}}>
            <div style={{height: '100%', width: `${(generic / rasterBlocks.length) * 100}%`, background: C.cyan}} />
          </div>
          <div
            style={{
              position: 'relative',
              height: 218,
              marginTop: 12,
              padding: '12px 18px',
              boxSizing: 'border-box',
              border: '1px solid #3a3741',
              background: C.panel,
              textAlign: 'left',
            }}
          >
            <div style={{fontFamily: FONT, color: C.cyan, fontWeight: 900, fontSize: 17}}>
              小さい汎用プログラム
            </div>
            <div style={{marginTop: 8, width: 255}}>
              {genericLoopCode.map((line, i) => (
                <div
                  key={line}
                  style={{
                    height: 18,
                    paddingLeft: 8,
                    background: i === genericLine ? `${C.cyan}28` : 'transparent',
                    borderLeft: `3px solid ${i === genericLine ? C.cyan : 'transparent'}`,
                    color: i === genericLine ? C.white : '#77727e',
                    fontFamily: MONO,
                    fontSize: 13,
                    fontWeight: 700,
                    lineHeight: '18px',
                  }}
                >
                  {line}
                </div>
              ))}
            </div>
            <div
              style={{
                position: 'absolute',
                right: 18,
                top: 68,
                width: 170,
                color: C.dim,
                fontFamily: FONT,
                fontSize: 15,
                fontWeight: 800,
                lineHeight: 1.5,
              }}
            >
              同じ8行を<br />何度も繰り返す
              <div style={{marginTop: 14, color: C.cyan, fontFamily: MONO, fontSize: 16}}>
                ↩ LOOP {String(generic).padStart(3, '0')} / 210
              </div>
            </div>
          </div>
        </div>
        <div style={{width: 1, background: '#34313c'}} />
        <div style={{width: 540, textAlign: 'center'}}>
          <Eyebrow>コンパイルドスプライト</Eyebrow>
          <div style={{height: 11}} />
          <div style={{display: 'flex', justifyContent: 'center'}}>
            <PackedEnemy
              scale={6}
              order={compiledProgram.map((row) => row.blockIndex)}
              processedCount={compiled}
              cursor={compiledCursor}
              showTransparent
            />
          </div>
          <div style={{margin: '12px auto 0', width: 330, height: 10, background: '#22202a'}}>
            <div style={{height: '100%', width: `${(compiled / compiledProgram.length) * 100}%`, background: C.magenta}} />
          </div>
          <div
            style={{
              height: 218,
              marginTop: 12,
              padding: '12px 14px 10px',
              boxSizing: 'border-box',
              border: `1px solid ${C.magenta}88`,
              background: C.panel,
              textAlign: 'left',
            }}
          >
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
              <span style={{fontFamily: FONT, color: C.magenta, fontWeight: 900, fontSize: 17}}>
                絵専用の大きなプログラム
              </span>
              <span style={{fontFamily: FONT, color: C.dim, fontWeight: 800, fontSize: 13}}>
                必要な命令列を1回だけ実行
              </span>
            </div>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 9, height: 158, marginTop: 7}}>
              {Array.from({length: 3}).map((_, column) => {
                const start = column * rowsPerColumn;
                const rows = compiledProgram.slice(start, start + rowsPerColumn);
                return (
                  <div key={column} style={{borderLeft: '1px solid #35323b', paddingLeft: 6}}>
                    {rows.map((row, rowInColumn) => {
                      const index = start + rowInColumn;
                      const current = index === compiledLine;
                      const done = index < compiled;
                      const color = row.category === 1 ? C.orange : C.magenta;
                      return (
                        <div
                          key={row.blockIndex}
                          style={{
                            height: 4,
                            overflow: 'hidden',
                            paddingLeft: 3,
                            background: current ? C.white : 'transparent',
                            color: current ? C.bg : color,
                            opacity: current ? 1 : done ? 0.72 : 0.25,
                            fontFamily: MONO,
                            fontWeight: 900,
                            fontSize: 3.5,
                            lineHeight: '4px',
                            letterSpacing: 0.4,
                            boxSizing: 'border-box',
                          }}
                        >
                          {row.code}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
            <div style={{fontFamily: MONO, color: compiled >= compiledProgram.length ? C.magenta : C.white, fontSize: 12, fontWeight: 800, marginTop: 4}}>
              NOW &gt; {currentCompiledCode}
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const costSprites = [
  {name: '敵1', src: 'enemy_em0_00.png', width: 110, height: 60},
  {name: '敵2', src: 'enemy_2_open.png', width: 82, height: 88},
  {name: 'ボスの弾', src: 'boss_bullet_00.png', width: 76, height: 72},
];

const SpriteCard: React.FC<{sprite: (typeof costSprites)[number]}> = ({sprite}) => (
  <div
    style={{
      height: 126,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 6px 8px',
      boxSizing: 'border-box',
      background: '#09090c',
      border: '1px solid #3a3741',
    }}
  >
    <div style={{height: 91, display: 'grid', placeItems: 'center'}}>
      <Img
        src={staticFile(sprite.src)}
        style={{width: sprite.width, height: sprite.height, objectFit: 'contain', imageRendering: 'pixelated'}}
      />
    </div>
    <div style={{fontFamily: MONO, color: C.white, fontSize: 14, fontWeight: 800}}>{sprite.name}</div>
  </div>
);

const CodeStripes: React.FC<{color: string; lines?: number; height?: number; gap?: number}> = ({
  color,
  lines = 8,
  height = 5,
  gap = 4,
}) => (
  <div style={{display: 'flex', flexDirection: 'column', gap}}>
    {Array.from({length: lines}).map((_, i) => (
      <div
        key={i}
        style={{
          height,
          width: `${72 + (i % 4) * 8}%`,
          background: color,
          opacity: 0.35 + (i % 3) * 0.18,
        }}
      />
    ))}
  </div>
);

const MemoryGauge: React.FC<{count: number; compiled?: boolean}> = ({count, compiled = false}) => {
  const color = compiled ? C.magenta : C.cyan;
  const programWidth = compiled ? 62 : 41;
  const itemWidth = compiled ? programWidth : 57;
  return (
    <div style={{display: 'flex', gap: 6, height: 23, alignItems: 'stretch'}}>
      {!compiled ? (
        <div
          style={{
            width: programWidth,
            display: 'grid',
            placeItems: 'center',
            background: color,
            color: C.bg,
            fontFamily: FONT,
            fontSize: 7.5,
            fontWeight: 900,
          }}
        >
          プログラム
        </div>
      ) : null}
      {Array.from({length: 3}).map((_, i) => {
        const visible = i < count;
        return (
          <div
            key={i}
            style={{
              width: itemWidth,
              display: 'grid',
              placeItems: 'center',
              background: visible ? color : '#292630',
              color: visible ? (compiled ? C.white : C.bg) : 'transparent',
              fontFamily: FONT,
              fontSize: 10,
              fontWeight: 900,
              opacity: visible ? 1 : 0.32,
            }}
          >
            {compiled ? 'プログラム' : 'データ'}
          </div>
        );
      })}
    </div>
  );
};

const PerformanceDemoScene: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{opacity: fade(frame, 480), backgroundColor: '#000', display: 'grid', placeItems: 'center'}}>
      <OffthreadVideo
        src={staticFile('MonoBitmap260207.mp4')}
        startFrom={28 * 30}
        endAt={44 * 30}
        muted
        style={{width: 768, height: 720, objectFit: 'fill', imageRendering: 'pixelated'}}
      />
    </AbsoluteFill>
  );
};

const CapacityCostScene: React.FC = () => {
  const frame = useCurrentFrame();
  const count = clamp(Math.floor(interpolate(frame, [35, 245], [0, 4])), 0, 3);
  return (
    <AbsoluteFill style={{opacity: fade(frame, 360), backgroundColor: C.bg, padding: '38px 48px 0', boxSizing: 'border-box'}}>
      <Title size={42}>コンパイルドスプライトの欠点</Title>
      <div style={{fontFamily: FONT, color: C.white, fontSize: 25, fontWeight: 900, marginTop: 5}}>
        欠点1：絵ごとに専用プログラムが必要
      </div>

      <div style={{display: 'flex', gap: 28, marginTop: 25}}>
        <div style={{width: 570, height: 438, padding: 18, boxSizing: 'border-box', border: `2px solid ${C.cyan}`, background: C.panel}}>
          <div style={{fontFamily: FONT, color: C.cyan, fontSize: 25, fontWeight: 900}}>一般的なソフトウェア描画の場合</div>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 14}}>
            {costSprites.map((sprite, i) => (
              <div key={sprite.name} style={{opacity: i < count ? 1 : 0.14}}><SpriteCard sprite={sprite} /></div>
            ))}
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: 18, marginTop: 23}}>
            <div style={{fontFamily: FONT, color: C.white, fontSize: 22, fontWeight: 900}}>絵データだけ追加</div>
            <div style={{fontFamily: MONO, color: C.cyan, fontSize: 24, fontWeight: 900}}>→</div>
            <div style={{flex: 1, padding: '9px 14px', border: '1px solid #4a4651', background: '#0a0a0d'}}>
              <div style={{fontFamily: FONT, color: C.dim, fontSize: 12, fontWeight: 800, marginBottom: 6}}>1つの小さな汎用プログラム</div>
              <div style={{width: 55}}><CodeStripes color={C.cyan} lines={4} height={4} gap={3} /></div>
            </div>
          </div>
          <div style={{marginTop: 23}}>
            <MemoryGauge count={count} />
          </div>
          <div style={{fontFamily: FONT, color: C.dim, fontSize: 17, marginTop: 7}}>プログラムは1つのまま</div>
        </div>

        <div style={{width: 570, height: 438, padding: 18, boxSizing: 'border-box', border: `2px solid ${C.magenta}`, background: C.panel}}>
          <div style={{fontFamily: FONT, color: C.magenta, fontSize: 25, fontWeight: 900}}>コンパイルドスプライト</div>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 14}}>
            {costSprites.map((sprite, i) => (
              <div key={sprite.name} style={{opacity: i < count ? 1 : 0.14}}>
                <SpriteCard sprite={sprite} />
                <div style={{height: 73, padding: '10px 12px', boxSizing: 'border-box', background: '#0a0a0d', border: '1px solid #3a3741', display: 'flex', alignItems: 'center', gap: 7}}>
                  <div style={{width: 34, flexShrink: 0}}><CodeStripes color={C.magenta} lines={7} height={3} gap={3} /></div>
                  <div style={{fontFamily: FONT, color: C.magenta, fontSize: 9, fontWeight: 900}}>プログラム</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{fontFamily: FONT, color: C.white, fontSize: 22, fontWeight: 900, marginTop: 14}}>絵ごとにプログラムを追加</div>
          <div style={{marginTop: 15}}>
            <MemoryGauge count={count} compiled />
          </div>
          <div style={{fontFamily: FONT, color: C.magenta, fontSize: 17, fontWeight: 800, marginTop: 7}}>速いが、ROMを大量に使う</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const PositionLimitScene: React.FC = () => {
  const frame = useCurrentFrame();
  const offsets = [0, 4, 8, 12, 16, 20];
  const offset = offsets[Math.floor(frame / 24) % offsets.length];
  const scale = 8;
  const gridWidth = 76 * scale;
  const gridHeight = 28 * scale;
  return (
    <AbsoluteFill style={{opacity: fade(frame, 300), backgroundColor: C.bg, padding: '38px 52px 0', boxSizing: 'border-box'}}>
      <Title size={42}>コンパイルドスプライトの欠点</Title>
      <div style={{fontFamily: FONT, color: C.white, fontSize: 25, fontWeight: 900, marginTop: 5}}>
        欠点2：1ドット単位の移動ができない
      </div>

      <div style={{display: 'flex', gap: 55, alignItems: 'center', marginTop: 31}}>
        <div style={{width: 700, height: 430, display: 'grid', placeItems: 'center', background: C.panel, border: '1px solid #3a3741'}}>
          <div style={{position: 'relative', width: gridWidth + 48, height: gridHeight + 86}}>
            <div style={{position: 'absolute', left: 24, top: 24, width: gridWidth, height: gridHeight}}>
              <Img
                src={staticFile('enemy_em0_explain.png')}
                style={{
                  position: 'absolute', left: offset * scale, top: 0, width: 55 * scale, height: 28 * scale,
                  maxWidth: 'none', imageRendering: 'pixelated', zIndex: 1,
                }}
              />
              <div
                style={{
                  position: 'absolute', left: offset * scale, top: 0,
                  width: 55 * scale, height: 28 * scale, boxSizing: 'border-box',
                  border: `6px solid ${C.orange}`, zIndex: 3, pointerEvents: 'none',
                }}
              />
              <div
                style={{
                  position: 'absolute', inset: 0, zIndex: 2, border: `2px solid ${C.cyan}`,
                  backgroundImage: `linear-gradient(to right, ${C.cyan}88 1px, transparent 1px), linear-gradient(to bottom, ${C.cyan}88 1px, transparent 1px)`,
                  backgroundSize: `${4 * scale}px ${2 * scale}px`, pointerEvents: 'none',
                }}
              />
            </div>
            {offsets.map((value) => (
              <div
                key={value}
                style={{
                  position: 'absolute', left: 24 + value * scale, bottom: 0,
                  transform: 'translateX(-4px)', fontFamily: FONT,
                  color: value === offset ? C.orange : C.dim, fontSize: 20, fontWeight: 900,
                }}
              >
                {value}
              </div>
            ))}
          </div>
        </div>

        <div style={{width: 390}}>
          <div style={{fontFamily: FONT, color: C.cyan, fontSize: 36, fontWeight: 900, lineHeight: 1.35}}>横4ドット単位でしか動かせない</div>
          <div style={{marginTop: 31, padding: '20px 22px', background: C.panel, borderLeft: `6px solid ${C.orange}`, fontFamily: FONT, color: C.white, fontSize: 25, fontWeight: 900}}>
            現在：右へ{offset}ドット
          </div>
          <div style={{fontFamily: FONT, color: C.dim, fontSize: 21, fontWeight: 800, marginTop: 28}}>縦も2ドット間隔</div>
          <div style={{fontFamily: FONT, color: C.red, fontSize: 25, fontWeight: 900, lineHeight: 1.45, marginTop: 29}}>滑らかなキャラ移動ができない</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const AlignedEnemyGrid: React.FC<{scale: number; xShift: number; yShift: number; active?: boolean}> = ({
  scale,
  xShift,
  yShift,
  active = false,
}) => {
  const baseWidth = 56 * scale;
  const baseHeight = 28 * scale;
  const extendRight = xShift >= 2;
  const extendBottom = yShift >= 1;
  const gridWidth = baseWidth + (extendRight ? 4 * scale : 0);
  const gridHeight = baseHeight + (extendBottom ? 2 * scale : 0);
  const padding = 10;
  return (
    <div style={{position: 'relative', width: baseWidth + 4 * scale + padding * 2, height: baseHeight + 2 * scale + padding * 2}}>
      <div style={{position: 'absolute', left: padding, top: padding, width: gridWidth, height: gridHeight, overflow: 'visible'}}>
        <Img
          src={staticFile('enemy_em0_explain.png')}
          style={{
            position: 'absolute', left: xShift * scale, top: yShift * scale,
            width: 55 * scale, height: 28 * scale, maxWidth: 'none', imageRendering: 'pixelated', zIndex: 1,
          }}
        />
        {extendRight ? (
          <div style={{position: 'absolute', left: baseWidth, top: 0, width: 4 * scale, height: gridHeight, background: `${C.orange}18`, zIndex: 2}} />
        ) : null}
        {extendBottom ? (
          <div style={{position: 'absolute', left: 0, top: baseHeight, width: gridWidth, height: 2 * scale, background: `${C.orange}18`, zIndex: 2}} />
        ) : null}
        <div
          style={{
            position: 'absolute', inset: 0, zIndex: 3,
            border: `2px solid ${active ? C.orange : C.cyan}`,
            backgroundImage: `linear-gradient(to right, ${active ? C.orange : C.cyan}66 1px, transparent 1px), linear-gradient(to bottom, ${active ? C.orange : C.cyan}66 1px, transparent 1px)`,
            backgroundSize: `${4 * scale}px ${2 * scale}px`, pointerEvents: 'none',
          }}
        />
      </div>
    </div>
  );
};

const AlignmentScene: React.FC = () => {
  const frame = useCurrentFrame();
  const index = Math.floor(frame / 42) % 8;
  const xShift = index % 4;
  const parity = Math.floor(index / 4);
  const movementLabels = ['移動なし', '右へ1', '右へ2', '右へ3', '下へ1', '右1・下1', '右2・下1', '右3・下1'];
  return (
    <AbsoluteFill style={{opacity: fade(frame, 360), backgroundColor: C.bg, padding: '38px 48px 0', boxSizing: 'border-box'}}>
      <Title size={42}>解決策：位置をずらした8本を先に作る</Title>
      <div style={{fontFamily: FONT, color: C.white, fontSize: 25, fontWeight: 900, marginTop: 5}}>
        横4パターン × 縦2パターン ＝ 8本の専用コード
      </div>

      <div style={{display: 'flex', gap: 34, alignItems: 'center', marginTop: 27}}>
        <div style={{width: 500, height: 438, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: C.panel, border: '1px solid #3a3741'}}>
          <AlignedEnemyGrid scale={6} xShift={xShift} yShift={parity} active />
          <div style={{fontFamily: MONO, color: C.orange, fontSize: 25, fontWeight: 900, marginTop: 21}}>
            {movementLabels[index]}
          </div>
          <div style={{fontFamily: FONT, color: C.dim, fontSize: 17, marginTop: 7}}>基準グリッドは固定、絵だけをずらす</div>
        </div>

        <div style={{width: 650}}>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px 8px'}}>
            {Array.from({length: 8}).map((_, i) => {
              const active = i === index;
              return (
                <div
                  key={i}
                  style={{
                    height: 150, padding: '7px 3px 5px', boxSizing: 'border-box', overflow: 'visible',
                    background: active ? `${C.orange}18` : C.panel,
                    border: `2px solid ${active ? C.orange : '#3a3741'}`,
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                  }}
                >
                  <div style={{fontFamily: FONT, color: active ? C.orange : C.dim, fontSize: 14, fontWeight: 900}}>
                    {movementLabels[i]}
                  </div>
                  <AlignedEnemyGrid scale={2} xShift={i % 4} yShift={Math.floor(i / 4)} active={active} />
                  <div style={{width: 96, marginTop: 2}}><CodeStripes color={active ? C.orange : C.magenta} lines={3} /></div>
                </div>
              );
            })}
          </div>
          <div style={{marginTop: 20, padding: '15px 18px', borderTop: `2px solid ${C.magenta}`, borderBottom: `2px solid ${C.magenta}`, fontFamily: FONT, color: C.white, fontSize: 24, fontWeight: 900, textAlign: 'center'}}>
            1枚の絵に8本のプログラム <span style={{color: C.magenta}}>→ メモリ消費が8倍！</span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const SizeBankScene: React.FC = () => {
  const frame = useCurrentFrame();
  const chosen = 15 - (Math.floor(frame / 18) % 16);
  const progress = interpolate(frame, [0, 300], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{opacity: fade(frame, 450), backgroundColor: C.bg, padding: '38px 48px 0', boxSizing: 'border-box'}}>
      <Title size={42}>拡大するのではなく、16枚から選ぶ</Title>
      <div style={{fontFamily: FONT, color: C.white, fontSize: 24, fontWeight: 900, marginTop: 6}}>奥から手前まで、違う大きさの絵を用意</div>
      <div style={{display: 'flex', gap: 28, marginTop: 24, alignItems: 'stretch'}}>
        <div style={{width: 760, display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 8}}>
          {Array.from({length: 16}).map((_, i) => {
            const visible = i / 16 <= progress;
            const active = i === chosen;
            return (
              <div
                key={i}
                style={{
                  height: 158,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px 4px',
                  boxSizing: 'border-box',
                  background: active ? `${C.magenta}22` : C.panel,
                  border: `2px solid ${active ? C.magenta : '#34313c'}`,
                  opacity: visible ? 1 : 0.08,
                }}
              >
                <Img
                  src={staticFile(`boss_face/BossFace_${String(i).padStart(2, '0')}.png`)}
                  style={{maxWidth: 84, maxHeight: 132, imageRendering: 'pixelated'}}
                />
              </div>
            );
          })}
          <div style={{gridColumn: '1 / span 4', fontFamily: FONT, color: C.dim, fontSize: 18, fontWeight: 800}}>手前</div>
          <div style={{gridColumn: '5 / span 4', fontFamily: FONT, color: C.dim, fontSize: 18, fontWeight: 800, textAlign: 'right'}}>奥</div>
        </div>
        <div style={{flex: 1, border: `2px solid ${C.magenta}`, background: C.panel, padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between'}}>
          <div style={{fontFamily: FONT, color: C.magenta, fontSize: 22, fontWeight: 900}}>いま使う大きさ</div>
          <div style={{height: 210, width: '100%', display: 'grid', placeItems: 'center'}}>
            <Img
              src={staticFile(`boss_face/BossFace_${String(chosen).padStart(2, '0')}.png`)}
              style={{maxWidth: 300, maxHeight: 210, imageRendering: 'pixelated'}}
            />
          </div>
          <div style={{width: '100%', padding: '17px 10px', boxSizing: 'border-box', borderTop: `2px solid ${C.magenta}`, borderBottom: `2px solid ${C.magenta}`, textAlign: 'center'}}>
            <div style={{fontFamily: FONT, color: C.white, fontSize: 20, fontWeight: 900}}>16サイズ × 8位置</div>
            <div style={{fontFamily: FONT, color: C.magenta, fontSize: 34, fontWeight: 900, marginTop: 6}}>ボス顔だけで 約90KB</div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const BossBattleScene: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{opacity: fade(frame, 120), backgroundColor: '#000', display: 'grid', placeItems: 'center'}}>
      <OffthreadVideo
        src={staticFile('boss_battle.mp4')}
        startFrom={86 * 30}
        endAt={94 * 30}
        muted
        style={{width: 768, height: 720, objectFit: 'fill', imageRendering: 'pixelated'}}
      />
    </AbsoluteFill>
  );
};

const FrameTimelineScene: React.FC = () => {
  const frame = useCurrentFrame();
  const reveal = (at: number) => interpolate(frame, [at, at + 24], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const cpu = C.magenta;
  const logic = '#62df83';
  const normalVram = C.cyan;
  const exram = C.orange;
  const Block: React.FC<{label: string; sub?: string; color: string; height: number; at: number}> = ({label, sub, color, height, at}) => (
    <div style={{height, boxSizing: 'border-box', padding: '5px 9px', background: `${color}20`, borderLeft: `7px solid ${color}`, opacity: reveal(at)}}>
      <div style={{fontFamily: FONT, color: C.white, fontSize: 14, lineHeight: 1.2, fontWeight: 900}}>{label}</div>
      {sub ? <div style={{fontFamily: FONT, color, fontSize: 12, lineHeight: 1.15, fontWeight: 900, marginTop: 2}}>{sub}</div> : null}
    </div>
  );
  const Lane: React.FC<{kind: 'A' | 'B'}> = ({kind}) => {
    const isA = kind === 'A';
    return (
      <div style={{width: 258}}>
        <div style={{fontFamily: FONT, color: C.white, fontSize: 23, fontWeight: 900, textAlign: 'center', marginBottom: 8}}>
          {isA ? 'A：計算フレーム' : 'B：描画フレーム'}
        </div>
        <div style={{height: 448, border: '2px solid #47434e', padding: 6, boxSizing: 'border-box', background: C.panel, display: 'flex', flexDirection: 'column'}}>
          <div style={{height: 320, display: 'flex', flexDirection: 'column', gap: isA ? 5 : 0}}>
            {isA ? <>
              <Block label="上半分を消去" sub="約1.7ms" color={cpu} height={43} at={45} />
              <Block label="地面・遠景を描画" sub="約2.6ms" color={cpu} height={66} at={87} />
              <Block label="プレイヤー・敵・弾・衝突など" sub="負荷で変動　最大 約8.0ms" color={logic} height={201} at={129} />
            </> : <>
              <Block label="コンパイルドスプライトをVBUFへ描画" sub="最大 約12.3ms" color={cpu} height={320} at={175} />
            </>}
          </div>
          <div style={{height: 114, position: 'relative', borderTop: `4px solid ${C.bg}`, boxSizing: 'border-box', opacity: reveal(isA ? 190 : 240)}}>
            <div style={{position: 'absolute', left: 0, top: 0, width: 7, height: 8, background: C.white}} />
            <div style={{position: 'absolute', left: 0, top: 8, width: 7, height: 88, background: isA ? normalVram : exram}} />
            <div style={{position: 'absolute', left: 0, top: 96, width: 7, height: 14, background: C.dim}} />
            <div style={{position: 'absolute', left: 11, top: 5, fontFamily: MONO, color: isA ? normalVram : exram, fontSize: 11, fontWeight: 900}}>EXTENDED VBLANK　4.4ms</div>
            <div style={{position: 'absolute', left: 11, top: 29, fontFamily: FONT, color: C.white, fontSize: 13, fontWeight: 900}}>OAM DMA　約0.3ms</div>
            <div style={{position: 'absolute', left: 11, top: 51, fontFamily: FONT, color: isA ? normalVram : exram, fontSize: 13, lineHeight: 1.25, fontWeight: 900}}>{isA ? <>通常VRAM更新　約3.4ms<br />ダブルバッファ</> : <>ExRAM更新　約3.4ms<br />シングルバッファ</>}</div>
            <div style={{position: 'absolute', left: 11, bottom: 3, fontFamily: FONT, color: C.dim, fontSize: 11, fontWeight: 900}}>{isA ? '割り込みなど　約0.7ms' : '割り込み・ページ切替など　約0.7ms'}</div>
          </div>
        </div>
      </div>
    );
  };
  const chartOpacity = reveal(390);
  const previewStage = frame < 45 ? 0 : frame < 87 ? 1 : frame < 129 ? 2 : frame < 210 ? 3 : 4;
  const stageLabels = ['処理前：完成した画面', '上半分を消去', '地面・遠景を描画', 'ゲームロジックを反映', 'コンパイルドスプライトで完成'];
  const previewImages = ['frame_background_player_bg.png', 'frame_background_player_bg.png', 'frame_background.png', 'frame_background_player.png', 'frame_background_player_bg.png'];
  return (
    <AbsoluteFill style={{opacity: fade(frame, 600), backgroundColor: C.bg, padding: '34px 42px 0', boxSizing: 'border-box'}}>
      <Title size={38}>30fpsで動かすため、処理を2フレームに分ける</Title>
      <div style={{fontFamily: MONO, color: C.dim, fontSize: 18, fontWeight: 900, marginTop: 7}}>1 FRAME = 16.7ms　／　同じ長さの2フレームを交互に実行</div>
      <div style={{display: 'flex', gap: 14, alignItems: 'flex-start', marginTop: 15}}>
        <Lane kind="A" />
        <Lane kind="B" />
        <div style={{flex: 1}}>
          <div style={{width: 420, height: 277, margin: '0 auto', position: 'relative', overflow: 'hidden', background: '#000', border: '2px solid #47434e'}}>
            <Img src={staticFile(previewImages[previewStage])} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', imageRendering: 'pixelated'}} />
            {previewStage === 1 ? <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: '59%', background: '#101014'}} /> : null}
            <div style={{position: 'absolute', left: 12, top: 10, padding: '5px 9px', background: '#09090ddd', fontFamily: FONT, color: C.white, fontSize: 15, fontWeight: 900}}>{stageLabels[previewStage]}</div>
          </div>
          <div style={{opacity: chartOpacity, height: 157, boxSizing: 'border-box', marginTop: 10, padding: '7px 14px', background: C.panel, border: '1px solid #47434e'}}>
          <div style={{fontFamily: FONT, color: C.white, fontSize: 16, fontWeight: 900}}>処理時間の目安</div>
          {[
            {label: 'コンパイルドスプライト', value: '最大 約12.3ms', width: 100, color: cpu},
            {label: '消去＋地面・遠景', value: '約4.3ms', width: 35, color: C.cyan},
            {label: 'ゲームロジック上限', value: '約8.0ms', width: 65, color: logic},
            {label: '大きい木 1本', value: '約2.3ms', width: 19, color: C.orange},
          ].map((bar) => (
            <div key={bar.label} style={{marginTop: 5}}>
              <div style={{display: 'flex', justifyContent: 'space-between', gap: 8, fontFamily: FONT, fontSize: 11, fontWeight: 900}}>
                <span style={{color: C.white}}>{bar.label}</span><span style={{color: bar.color}}>{bar.value}</span>
              </div>
              <div style={{height: 7, background: '#292630', marginTop: 2}}><div style={{height: '100%', width: `${bar.width}%`, background: bar.color}} /></div>
            </div>
          ))}
          <div style={{fontFamily: MONO, color: C.dim, fontSize: 9, marginTop: 4}}>1.79MHz換算</div>
          </div>
        </div>
      </div>
      <div style={{position: 'absolute', right: 46, top: 84, display: 'flex', gap: 16, fontFamily: FONT, fontSize: 13, fontWeight: 900}}>
        <span style={{color: cpu}}>■ 描画</span><span style={{color: logic}}>■ ゲームロジック</span><span style={{color: normalVram}}>■ 通常VRAM</span><span style={{color: exram}}>■ ExRAM</span>
      </div>
    </AbsoluteFill>
  );
};

const DayOneScene: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{opacity: fade(frame, 180), backgroundColor: C.bg}}>
      <VideoPlate src="day1.mp4" pixelated />
      <div style={{position: 'absolute', left: 54, top: 48}}>
        <Eyebrow color={C.orange}>DAY 1 / FIRST PLAYABLE TEST</Eyebrow>
        <div style={{height: 10}} />
        <Title size={45}>地面と、仮の絵が大きくなるだけ</Title>
      </div>
    </AbsoluteFill>
  );
};

const CurrentReturnScene: React.FC = () => {
  const frame = useCurrentFrame();
  const enter = spring({frame, fps: 30, config: {damping: 16}});
  return (
    <AbsoluteFill style={{opacity: fade(frame, 180), backgroundColor: C.bg}}>
      <VideoPlate src="current_tree.mp4" pixelated />
      <div
        style={{
          position: 'absolute',
          left: 60,
          top: 55,
          maxWidth: 850,
          opacity: enter,
          transform: `translateY(${(1 - enter) * 28}px)`,
        }}
      >
        <Eyebrow>16段階の絵 × 奥行きテーブル</Eyebrow>
        <div style={{height: 12}} />
        <Title size={52}>この積み重ねが、画面の奥行きになる。</Title>
      </div>
    </AbsoluteFill>
  );
};

export const ExplainerPrototype: React.FC = () => {
  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <Sequence from={c01Timing.startFrame} durationInFrames={c01Timing.durationFrames}>
        <IntroScene durationInFrames={c01Timing.durationFrames} />
      </Sequence>
      <Sequence from={c02Timing.startFrame} durationInFrames={c02Timing.durationFrames}>
        <PreviousScene durationInFrames={c02Timing.durationFrames} />
      </Sequence>
      <Sequence from={c03Timing.startFrame} durationInFrames={c03Timing.durationFrames}>
        <DevelopmentTitleScene durationInFrames={c03Timing.durationFrames} />
      </Sequence>
      <Sequence from={840 + narrationTimingOffset} durationInFrames={450}>
        <DevelopmentDay1Scene />
      </Sequence>
      <Sequence from={1290 + narrationTimingOffset} durationInFrames={450}>
        <DevelopmentDay2Scene />
      </Sequence>
      <Sequence from={1740 + narrationTimingOffset} durationInFrames={300}>
        <DevelopmentDay3Scene />
      </Sequence>
      <Sequence from={2040 + narrationTimingOffset} durationInFrames={450}>
        <DevelopmentCheckerboardScene />
      </Sequence>
      <Sequence from={2490 + narrationTimingOffset} durationInFrames={720}>
        <LargeCharacterScene />
      </Sequence>
      <Sequence from={3210 + narrationTimingOffset} durationInFrames={300}>
        <GenericLoopScene />
      </Sequence>
      <Sequence from={3510 + narrationTimingOffset} durationInFrames={360}>
        <CompiledScene />
      </Sequence>
      <Sequence from={3870 + narrationTimingOffset} durationInFrames={390}>
        <RaceScene />
      </Sequence>
      <Sequence from={4260 + narrationTimingOffset} durationInFrames={480}>
        <PerformanceDemoScene />
      </Sequence>
      <Sequence from={4740 + narrationTimingOffset} durationInFrames={360}>
        <CapacityCostScene />
      </Sequence>
      <Sequence from={5100 + narrationTimingOffset} durationInFrames={300}>
        <PositionLimitScene />
      </Sequence>
      <Sequence from={5400 + narrationTimingOffset} durationInFrames={360}>
        <AlignmentScene />
      </Sequence>
      <Sequence from={5760 + narrationTimingOffset} durationInFrames={450}>
        <SizeBankScene />
      </Sequence>
      <Sequence from={6210 + narrationTimingOffset} durationInFrames={240}>
        <BossBattleScene />
      </Sequence>
      <Sequence from={6450 + narrationTimingOffset} durationInFrames={600}>
        <FrameTimelineScene />
      </Sequence>
      <Sequence from={c01Timing.startFrame} durationInFrames={c01Timing.durationFrames}>
        <Audio src={staticFile('narration/C01.wav')} volume={0.95} />
      </Sequence>
      <Sequence from={c02Timing.startFrame} durationInFrames={c02Timing.durationFrames}>
        <Audio src={staticFile('narration/C02.wav')} volume={0.95} />
      </Sequence>
      <Sequence from={c03Timing.startFrame} durationInFrames={c03Timing.durationFrames}>
        <Audio src={staticFile('narration/C03.wav')} volume={0.95} />
      </Sequence>
    </AbsoluteFill>
  );
};

export const DevelopmentNarrationPreview: React.FC = () => {
  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <Sequence from={c04Timing.startFrame} durationInFrames={c04Timing.durationFrames}>
        <DevelopmentDay1Scene durationInFrames={c04Timing.durationFrames} />
        <Audio src={staticFile('narration/development/C04.wav')} volume={0.95} />
      </Sequence>
      <Sequence from={c05Timing.startFrame} durationInFrames={c05Timing.durationFrames}>
        <DevelopmentDay2Scene durationInFrames={c05Timing.durationFrames} />
        <Audio src={staticFile('narration/development/C05.wav')} volume={0.95} />
      </Sequence>
      <Sequence from={c06Timing.startFrame} durationInFrames={c06Timing.durationFrames}>
        <DevelopmentDay3Scene durationInFrames={c06Timing.durationFrames} />
        <Audio src={staticFile('narration/development/C06.wav')} volume={0.95} />
      </Sequence>
    </AbsoluteFill>
  );
};

export const DrawingNarrationPreview: React.FC = () => {
  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <Sequence from={c08Timing.startFrame} durationInFrames={c08Timing.durationFrames}>
        <LargeCharacterScene durationInFrames={c08Timing.durationFrames} />
        <Audio src={staticFile('narration/drawing/C08.wav')} volume={0.95} />
      </Sequence>
      <Sequence from={c09Timing.startFrame} durationInFrames={c09Timing.durationFrames}>
        <GenericLoopScene durationInFrames={c09Timing.durationFrames} narrationSchedule />
        <Audio src={staticFile('narration/drawing/C09.wav')} volume={0.95} />
      </Sequence>
      <Sequence from={c10Timing.startFrame} durationInFrames={c10Timing.durationFrames}>
        <CompiledScene durationInFrames={c10Timing.durationFrames} />
        <Audio src={staticFile('narration/drawing/C10.wav')} volume={0.95} />
      </Sequence>
    </AbsoluteFill>
  );
};
