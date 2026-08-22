import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  Loop,
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
  narrationPreviewDurationInFrames,
  narrationTimingOffset,
} from './narrationTiming';
import {
  c04Timing,
  c05Timing,
  c06Timing,
  c07Timing,
  developmentNarrationDurationInFrames,
} from './developmentNarrationTiming';
import {
  c08Timing,
  c10Timing,
  drawingNarrationDurationInFrames,
} from './drawingNarrationTiming';
import {
  benefitNarrationDurationInFrames,
  c11Timing,
  c12Timing,
  c13Timing,
} from './benefitNarrationTiming';
import {
  c14Timing,
  c15Timing,
  c16Timing,
  constraintNarrationDurationInFrames,
} from './constraintNarrationTiming';
import {
  c17Timing,
  c18Timing,
  c20Timing,
  c21Timing,
  c22Timing,
  c23Timing,
  laterNarrationPreviewDurationInFrames,
} from './laterNarrationTiming';
import {c01C17GroupStartFrames} from './c01C17NarrationTiming';

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
  highlightCategory?: number;
}> = ({
  scale = 7,
  order = rasterBlocks,
  processedCount = 0,
  cursor = -1,
  showAll = false,
  showTransparent = false,
  analyze = false,
  highlightCategory = -1,
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
        const categoryHighlightActive = highlightCategory >= 0;
        const categoryHighlighted = category === highlightCategory;
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
                ? `${categoryHighlighted ? 3 : 1}px solid ${analysisColor}`
                : '1px solid rgba(120,118,130,.22)',
              boxShadow: categoryHighlighted ? `inset 0 0 0 2px ${analysisColor}, 0 0 10px ${analysisColor}` : undefined,
              opacity: categoryHighlightActive && !categoryHighlighted ? 0.24 : 1,
              outline: cursor === i ? `4px solid ${C.orange}` : undefined,
              outlineOffset: -3,
              zIndex: cursor === i ? 4 : categoryHighlighted ? 3 : 1,
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
  fit?: 'cover' | 'contain';
}> = ({src, startFrom = 0, pixelated = false, fit = 'cover'}) => (
  <AbsoluteFill style={{backgroundColor: C.bg}}>
    <OffthreadVideo
      src={staticFile(src)}
      startFrom={startFrom}
      muted
      style={{
        width: '100%',
        height: '100%',
        objectFit: fit,
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
  const scale = 1;
  const enter = spring({frame, fps: 30, config: {damping: 18}});
  return (
    <AbsoluteFill style={{opacity: fade(frame, durationInFrames), backgroundColor: C.bg}}>
      <div style={{position: 'absolute', inset: 0, transform: `scale(${scale})`}}>
        <VideoPlate src="game_CSCD.mp4" startFrom={15 * 30} pixelated />
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
        <Title size={51}>
          <div style={{whiteSpace: 'nowrap'}}>ファミコンでスペースハリアーを動かすには？</div>
        </Title>
        <div style={{marginTop: 13, fontFamily: FONT, color: C.white, fontSize: 34, lineHeight: 1.25, fontWeight: 900}}>
          その1：巨大キャラを動かすコンパイルドスプライト
        </div>
      </div>
    </AbsoluteFill>
  );
};

const PreviousScene: React.FC<{durationInFrames: number}> = ({durationInFrames}) => {
  const frame = useCurrentFrame();
  const techniqueStartFrame = Math.round(durationInFrames * 0.25);
  const previousVideoStartFrame = Math.round(durationInFrames * 0.72);
  const techniqueOpacity = interpolate(
    frame,
    [techniqueStartFrame - 10, techniqueStartFrame, previousVideoStartFrame - 10, previousVideoStartFrame],
    [0, 1, 1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );
  const previousVideoOpacity = interpolate(
    frame,
    [previousVideoStartFrame, previousVideoStartFrame + 12],
    [0, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );
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
      <div style={{position: 'absolute', left: 30, top: 28, width: 520, opacity: techniqueOpacity, padding: '14px 18px 16px', boxSizing: 'border-box', background: '#050507e5', borderLeft: `6px solid ${C.cyan}`}}>
        <div style={{fontFamily: FONT, color: C.cyan, fontSize: 16, fontWeight: 900}}>MMC5の拡張機能で実現</div>
        <div style={{fontFamily: MONO, color: C.white, fontSize: 44, lineHeight: 1.05, fontWeight: 900, marginTop: 7}}>128×96ドット</div>
        <div style={{fontFamily: FONT, color: C.white, fontSize: 27, lineHeight: 1.25, fontWeight: 900, marginTop: 5}}>モノクロ画面を高速書き換え</div>
      </div>
      <div style={{position: 'absolute', left: 54, right: 54, bottom: 78, opacity: previousVideoOpacity, padding: '17px 26px 19px', boxSizing: 'border-box', background: '#050507ed', borderTop: `3px solid ${C.magenta}`, borderBottom: `3px solid ${C.magenta}`}}>
        <div style={{fontFamily: FONT, color: C.white, fontSize: 23, lineHeight: 1.2, fontWeight: 900}}>前回の解説動画</div>
        <div style={{fontFamily: MONO, color: C.cyan, fontSize: 27, lineHeight: 1.25, fontWeight: 900, marginTop: 7}}>
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

const DevVideoFrame: React.FC<{src: string; children?: React.ReactNode; loopDurationInFrames?: number}> = ({src, children, loopDurationInFrames}) => (
  <div style={{position: 'absolute', left: 40, top: 135, width: 760, height: 570, overflow: 'hidden', padding: 8, boxSizing: 'border-box', background: C.panel, border: '2px solid #47434e'}}>
    {loopDurationInFrames ? (
      <Loop durationInFrames={loopDurationInFrames} layout="none">
        <OffthreadVideo src={staticFile(src)} muted style={{width: '100%', height: '100%', objectFit: 'contain', background: '#000', imageRendering: 'pixelated'}} />
      </Loop>
    ) : (
      <OffthreadVideo src={staticFile(src)} muted style={{width: '100%', height: '100%', objectFit: 'contain', background: '#000', imageRendering: 'pixelated'}} />
    )}
    {children}
  </div>
);

const DevelopmentDay1Scene: React.FC<{durationInFrames?: number}> = ({durationInFrames = 450}) => {
  const frame = useCurrentFrame();
  const groundRows = [1, 1, 1, 1, 2, 2, 3, 3, 4, 4, 5].flatMap((runLength, bandIndex) =>
    Array.from({length: runLength}, () => bandIndex % 2),
  ).slice(0, 23);
  return (
    <AbsoluteFill style={{opacity: fade(frame, durationInFrames), backgroundColor: C.bg, padding: '36px 48px 0', boxSizing: 'border-box'}}>
      <div style={{position: 'absolute', left: 48, top: 36, zIndex: 5}}>
        <Eyebrow color={C.orange}>DAY 1</Eyebrow>
        <Title size={42}>地面と拡大縮小だけ</Title>
      </div>
      <DevVideoFrame src="dev_day1.mp4" loopDurationInFrames={17 * 30} />
      <div style={{position: 'absolute', left: 818, top: 158, width: 422}}>
        <div style={{fontFamily: FONT, color: C.white, fontSize: 25, fontWeight: 900}}>地面はライン単位</div>
        <div style={{fontFamily: FONT, color: C.dim, fontSize: 17, lineHeight: 1.6, marginTop: 14}}>Y軸ごとに白／黒の値を持ち、横一列を同じ色で塗る。</div>
        <div style={{marginTop: 12, border: '1px solid #47434e', background: C.panel, padding: '7px 7px 9px'}}>
          {groundRows.map((value, y) => (
            <div key={y} style={{display: 'flex', alignItems: 'stretch', height: 11}}>
              <span style={{width: 27, fontFamily: MONO, color: C.dim, fontSize: 9}}>Y{y}</span>
              <span style={{width: 16, fontFamily: MONO, color: value ? C.white : C.dim, fontSize: 9, fontWeight: 900}}>{value}</span>
              <span style={{flex: 1, background: value ? C.white : '#050507', borderLeft: '1px solid #47434e', borderRight: '1px solid #47434e'}} />
            </div>
          ))}
        </div>
        <div style={{fontFamily: FONT, color: C.cyan, fontSize: 18, lineHeight: 1.4, fontWeight: 900, marginTop: 10}}>奥は細かく、手前は太く<br />7パターンで前進を表現</div>
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
      <div style={{position: 'absolute', left: 808, top: 145, width: 448}}>
        <div style={{fontFamily: FONT, color: C.white, fontSize: 25, fontWeight: 900}}>Z軸 56段階</div>
        <div style={{height: 210, marginTop: 12, position: 'relative', borderLeft: `5px solid ${C.cyan}`, background: `linear-gradient(180deg, ${C.cyan}12, ${C.magenta}28)`}}>
          <div style={{position: 'absolute', left: 15, top: 5, fontFamily: MONO, color: C.cyan, fontSize: 14}}>Z = 55　奥</div>
          <div style={{position: 'absolute', left: 15, bottom: 5, fontFamily: MONO, color: C.magenta, fontSize: 14}}>Z = 0　手前</div>
          <div style={{position: 'absolute', left: -10, top: `${10 + zProgress * 180}px`, width: 22, height: 5, background: C.white, boxShadow: '0 0 8px #fff'}} />
        </div>
        <div style={{fontFamily: FONT, color: C.white, fontSize: 17, lineHeight: 1.5, marginTop: 10}}>各段階でスプライトの大きさとY座標を手作業で補正</div>
        <div style={{height: 245, marginTop: 12, overflow: 'hidden', border: `2px solid ${C.cyan}`, background: '#111216', padding: 5, boxSizing: 'border-box'}}>
          <Img src={staticFile('development_z_table.png')} style={{width: '104%', height: '104%', objectFit: 'contain', objectPosition: 'center', transform: 'translate(-2%, -2%)', opacity: 0.96}} />
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

const DevelopmentCheckerboardScene: React.FC<{durationInFrames?: number}> = ({durationInFrames = 450}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{opacity: fade(frame, durationInFrames), backgroundColor: C.bg, padding: '36px 48px 0', boxSizing: 'border-box'}}>
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
  const cpuOpacity = interpolate(frame, [223, 235], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const clearOpacity = interpolate(frame, [475, 487], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const compositeOpacity = interpolate(frame, [699, 711], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const warningOpacity = interpolate(frame, [969, 981], [0, 1], {
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
  const narrationStepStartFrames = [18.08, 20.455, 23.15, 24.96, 26.235]
    .map((seconds) => Math.round(seconds * 30));
  const done = narrationSchedule
    ? clamp(
      Math.floor(interpolate(
        frame,
        [narrationStepStartFrames[0], durationInFrames - 15],
        [0, rasterBlocks.length],
        {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
      )),
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
  const blockDefinitionStart = Math.round(6.385 * 30);
  const transparentStart = Math.round(12.325 * 30);
  const partialMoveStart = Math.round(18.055 * 30);
  const fullMoveStart = Math.round(23.625 * 30);
  const summaryStart = Math.round(29.745 * 30);
  const active = frame < transparentStart
    ? -1
    : frame < partialMoveStart
      ? 0
      : frame < fullMoveStart
        ? 1
        : 2;
  const cards = [
    {title: '全面透明', equation: '(SCREEN AND $FF) OR $00', result: '命令なし', code: ['; 命令なし']},
    {title: '一部だけ描画', equation: '(SCREEN AND $C3) OR $24', result: '必要な合成だけ', code: ['LDA (screen),Y', 'AND #$C3', 'ORA #$24', 'STA (screen),Y']},
    {title: '全面上書き', equation: '(SCREEN AND $00) OR $7F', result: '直接メモリへ書く', code: ['LDA #$7F', 'STA (screen),Y']},
  ];
  const activeCard = active < 0 ? null : cards[active];
  const blockDefinitionOpacity = clamp(
    interpolate(frame, [blockDefinitionStart, blockDefinitionStart + 12], [0, 1]),
    0,
    1,
  );
  const summaryOpacity = clamp(interpolate(frame, [summaryStart, summaryStart + 12], [0, 1]), 0, 1);
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
      <Title size={37}>目的の絵を最速で描くための専用プログラムを作成</Title>
      <div style={{display: 'flex', gap: 24, alignItems: 'flex-start', marginTop: 27}}>
        <div style={{width: 550, flexShrink: 0}}>
          <PackedEnemy scale={10} showAll analyze highlightCategory={active} />
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 9}}>
            <div style={{display: 'flex', gap: 14, fontFamily: FONT, fontSize: 16, fontWeight: 800}}>
              <span style={{color: '#8b8d96'}}>■ 透明</span>
              <span style={{color: C.orange}}>■ 一部</span>
              <span style={{color: C.magenta}}>■ 全面</span>
            </div>
            <div
              style={{
                opacity: blockDefinitionOpacity,
                color: C.cyan,
                border: `1px solid ${C.cyan}`,
                padding: '4px 9px',
                fontFamily: MONO,
                fontSize: 15,
                fontWeight: 900,
              }}
            >
              1 BYTE = 4×2 DOT
            </div>
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
              {activeCard ? 'この場所だけを描く最短のプログラム' : '絵ごとに専用プログラムを生成'}
            </div>
            {activeCard ? activeCard.code.map((line) => (
                <div key={line} style={{fontFamily: MONO, color: C.white, fontSize: 18, lineHeight: 1.3}}>
                  {line}
                </div>
              )) : (
                <div style={{fontFamily: MONO, color: C.white, fontSize: 18, lineHeight: 1.3}}>
                  IMAGE DATA → DEDICATED PROGRAM
                </div>
              )}
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
          <div
            style={{
              opacity: summaryOpacity,
              fontFamily: FONT,
              color: C.cyan,
              fontWeight: 900,
              fontSize: 19,
              marginTop: 17,
            }}
          >
            絵のデータ → 絵ごとの最速プログラム
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const RaceScene: React.FC<{durationInFrames?: number}> = ({durationInFrames = 390}) => {
  const frame = useCurrentFrame();
  const startFrame = Math.round(durationInFrames * 0.25);
  const compiledEndFrame = Math.round(durationInFrames * 0.46);
  const genericEndFrame = Math.round(durationInFrames * 0.86);
  const started = frame >= startFrame;
  const genericWork = clamp(
    interpolate(frame, [startFrame, genericEndFrame], [0, rasterBlocks.length * genericLoopCode.length]),
    0,
    rasterBlocks.length * genericLoopCode.length,
  );
  const generic = clamp(Math.floor(genericWork / genericLoopCode.length), 0, rasterBlocks.length);
  const compiled = clamp(Math.floor(interpolate(frame, [startFrame, compiledEndFrame], [0, compiledProgram.length])), 0, compiledProgram.length);
  const genericCursor = started && generic < rasterBlocks.length ? rasterBlocks[generic] : -1;
  const compiledCursor = started && compiled < compiledProgram.length ? compiledProgram[compiled].blockIndex : -1;
  const genericLine = started && generic < rasterBlocks.length ? Math.floor(genericWork) % genericLoopCode.length : -1;
  const compiledLine = started && compiled < compiledProgram.length ? compiled : -1;
  const rowsPerColumn = Math.ceil(compiledProgram.length / 3);
  const currentCompiledCode = compiledLine >= 0 ? compiledProgram[compiledLine].code : compiled >= compiledProgram.length ? 'DONE' : 'READY';
  return (
    <AbsoluteFill style={{opacity: fade(frame, durationInFrames), backgroundColor: C.bg, padding: '35px 42px', boxSizing: 'border-box'}}>
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
  const programWidth = 48;
  const itemWidth = 64;
  return (
    <div style={{display: 'flex', gap: 6, width: '100%', height: 23, alignItems: 'stretch'}}>
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
              width: compiled ? undefined : itemWidth,
              flex: compiled ? 1 : undefined,
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

const PerformanceDemoScene: React.FC<{durationInFrames?: number}> = ({durationInFrames = 480}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{opacity: fade(frame, durationInFrames), backgroundColor: '#000', display: 'grid', placeItems: 'center'}}>
      <OffthreadVideo
        src={staticFile('MonoBitmap260207.mp4')}
        startFrom={28 * 30}
        endAt={28 * 30 + durationInFrames}
        muted
        style={{width: 768, height: 720, objectFit: 'fill', imageRendering: 'pixelated'}}
      />
    </AbsoluteFill>
  );
};

const CapacityCostScene: React.FC<{durationInFrames?: number}> = ({durationInFrames = 360}) => {
  const frame = useCurrentFrame();
  const leftRevealFrames = [0.28, 0.4, 0.52].map((fraction) => Math.round(durationInFrames * fraction));
  const rightRevealFrames = [0.64, 0.75, 0.86].map((fraction) => Math.round(durationInFrames * fraction));
  const leftCount = leftRevealFrames.filter((revealFrame) => frame >= revealFrame).length;
  const rightCount = rightRevealFrames.filter((revealFrame) => frame >= revealFrame).length;
  return (
    <AbsoluteFill style={{opacity: fade(frame, durationInFrames), backgroundColor: C.bg, padding: '38px 48px 0', boxSizing: 'border-box'}}>
      <Title size={42}>コンパイルドスプライトの欠点</Title>
      <div style={{fontFamily: FONT, color: C.white, fontSize: 25, fontWeight: 900, marginTop: 5}}>
        欠点1：絵ごとに専用プログラムが必要
      </div>

      <div style={{display: 'flex', gap: 28, marginTop: 25}}>
        <div style={{width: 570, height: 438, padding: 18, boxSizing: 'border-box', border: `2px solid ${C.cyan}`, background: C.panel}}>
          <div style={{fontFamily: FONT, color: C.cyan, fontSize: 25, fontWeight: 900}}>一般的なソフトウェア描画の場合</div>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 14}}>
            {costSprites.map((sprite, i) => (
              <div key={sprite.name} style={{opacity: i < leftCount ? 1 : 0.14}}><SpriteCard sprite={sprite} /></div>
            ))}
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: 23}}>
            <div style={{fontFamily: FONT, color: C.white, fontSize: 22, fontWeight: 900}}>絵データだけ追加</div>
            <div style={{fontFamily: MONO, color: C.cyan, fontSize: 24, fontWeight: 900}}>→</div>
            <div style={{width: 150, flexShrink: 0, padding: '9px 12px', border: '1px solid #4a4651', background: '#0a0a0d'}}>
              <div style={{fontFamily: FONT, color: C.dim, fontSize: 11, fontWeight: 800, marginBottom: 6}}>1つの小さな汎用プログラム</div>
              <div style={{width: 55}}><CodeStripes color={C.cyan} lines={4} height={4} gap={3} /></div>
            </div>
          </div>
          <div style={{marginTop: 23}}>
            <MemoryGauge count={leftCount} />
          </div>
          <div style={{fontFamily: FONT, color: C.dim, fontSize: 17, marginTop: 7}}>プログラムは1つのまま</div>
        </div>

        <div style={{width: 570, height: 438, padding: 18, boxSizing: 'border-box', border: `2px solid ${C.magenta}`, background: C.panel}}>
          <div style={{fontFamily: FONT, color: C.magenta, fontSize: 25, fontWeight: 900}}>コンパイルドスプライト</div>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 14}}>
            {costSprites.map((sprite, i) => (
              <div key={sprite.name} style={{opacity: i < rightCount ? 1 : 0.14}}>
                <SpriteCard sprite={sprite} />
                <div style={{height: 73, padding: '8px 10px', boxSizing: 'border-box', background: '#0a0a0d', border: '1px solid #3a3741'}}>
                  <div style={{fontFamily: FONT, color: C.magenta, fontSize: 9, fontWeight: 900, whiteSpace: 'nowrap'}}>絵に合わせた専用のプログラム</div>
                  <div style={{width: '100%', marginTop: 6}}><CodeStripes color={C.magenta} lines={7} height={3} gap={3} /></div>
                </div>
              </div>
            ))}
          </div>
          <div style={{fontFamily: FONT, color: C.white, fontSize: 22, fontWeight: 900, marginTop: 14}}>絵ごとに専用のプログラムを追加</div>
          <div style={{marginTop: 15}}>
            <MemoryGauge count={rightCount} compiled />
          </div>
          <div style={{fontFamily: FONT, color: C.magenta, fontSize: 17, fontWeight: 800, marginTop: 7}}>速いが、ROMを大量に使う</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const PositionLimitScene: React.FC<{durationInFrames?: number}> = ({durationInFrames = 300}) => {
  const frame = useCurrentFrame();
  const offsets = [0, 4, 8, 12, 16, 20];
  const offset = offsets[Math.floor(frame / 24) % offsets.length];
  const scale = 8;
  const gridWidth = 76 * scale;
  const gridHeight = 28 * scale;
  return (
    <AbsoluteFill style={{opacity: fade(frame, durationInFrames), backgroundColor: C.bg, padding: '38px 52px 0', boxSizing: 'border-box'}}>
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
          <div style={{fontFamily: FONT, color: C.cyan, fontSize: 31, fontWeight: 900, lineHeight: 1.35, whiteSpace: 'nowrap'}}>横4ドット単位でしか動かせない</div>
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

const GameLogicScene: React.FC<{durationInFrames?: number}> = ({durationInFrames = 360}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{opacity: fade(frame, durationInFrames), backgroundColor: C.bg, padding: '28px 30px', boxSizing: 'border-box'}}>
      <div style={{display: 'flex', gap: 28, height: '100%', alignItems: 'center'}}>
        <div style={{width: 330, flex: '0 0 auto'}}>
          <div style={{fontFamily: FONT, color: C.white, fontSize: 22, lineHeight: 1.2, fontWeight: 900, textAlign: 'center', marginBottom: 10}}>
            1フレーム目：<br />画面クリアと計算
          </div>
          <div style={{height: 548, border: '2px solid #47434e', padding: 8, boxSizing: 'border-box', background: C.panel, display: 'flex', flexDirection: 'column'}}>
            <div style={{height: 58, padding: '8px 11px', boxSizing: 'border-box', background: `${C.magenta}20`, borderLeft: `8px solid ${C.magenta}`}}>
              <div style={{fontFamily: FONT, color: C.white, fontSize: 16, fontWeight: 900}}>仮想フレームバッファ消去</div>
              <div style={{fontFamily: FONT, color: C.magenta, fontSize: 13, fontWeight: 900}}>描画　約1.7ms</div>
            </div>
            <div style={{height: 82, marginTop: 6, padding: '8px 11px', boxSizing: 'border-box', background: `${C.magenta}20`, borderLeft: `8px solid ${C.magenta}`}}>
              <div style={{fontFamily: FONT, color: C.white, fontSize: 16, fontWeight: 900}}>地面・遠景の描画</div>
              <div style={{fontFamily: FONT, color: C.magenta, fontSize: 13, fontWeight: 900}}>描画　約2.6ms</div>
            </div>
            <div style={{flex: 1, marginTop: 6, padding: '12px 11px', boxSizing: 'border-box', background: '#62df8322', borderLeft: '8px solid #62df83', boxShadow: '0 0 22px #62df8355'}}>
              <div style={{fontFamily: FONT, color: C.white, fontSize: 18, lineHeight: 1.35, fontWeight: 900}}>プレイヤー・敵・弾・<br />衝突などの計算</div>
              <div style={{fontFamily: FONT, color: '#62df83', fontSize: 17, fontWeight: 900, marginTop: 8}}>ゲームロジック　最大 約8.0ms</div>
            </div>
            <div style={{height: 112, marginTop: 6, padding: '9px 11px', boxSizing: 'border-box', borderTop: `5px solid ${C.cyan}`, background: '#0a0a0d'}}>
              <div style={{fontFamily: MONO, color: C.cyan, fontSize: 13, fontWeight: 900}}>VBLANK（延長）　4.4ms</div>
              <div style={{fontFamily: FONT, color: C.white, fontSize: 14, fontWeight: 900, marginTop: 7}}>OAM DMA　約0.3ms</div>
              <div style={{fontFamily: FONT, color: C.cyan, fontSize: 14, lineHeight: 1.35, fontWeight: 900, marginTop: 5}}>通常VRAM更新　約3.4ms<br />ダブルバッファ</div>
            </div>
          </div>
        </div>
        <div style={{flex: 1, height: 622, position: 'relative', overflow: 'hidden', background: '#000', border: '2px solid #47434e'}}>
          <OffthreadVideo
            src={staticFile('game_CSCD.mp4')}
            startFrom={17 * 30}
            endAt={17 * 30 + durationInFrames}
            muted
            style={{width: '100%', height: '100%', objectFit: 'fill', imageRendering: 'pixelated'}}
          />
          <div style={{position: 'absolute', left: 16, top: 14, padding: '8px 12px', background: '#050507dd', borderLeft: '6px solid #62df83', fontFamily: FONT, color: C.white, fontSize: 20, fontWeight: 900}}>ゲームロジックでゲーム要素を更新</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const CoordinateTransformScene: React.FC<{durationInFrames?: number}> = ({durationInFrames = 600}) => {
  const frame = useCurrentFrame();
  const reveal = (fraction: number) => interpolate(frame, [durationInFrames * fraction, durationInFrames * fraction + 12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const mappings = [
    {key: '奥行き → 座標', label: '消失点へ寄せる', color: C.cyan, at: 0.64},
    {key: '奥行き → 絵', label: '16段階から選ぶ', color: C.magenta, at: 0.74},
  ];
  return (
    <AbsoluteFill style={{opacity: fade(frame, durationInFrames), backgroundColor: C.bg, padding: '36px 46px 0', boxSizing: 'border-box'}}>
      <Title size={40}>3Dの座標変換をテーブル参照に置き換える</Title>
      <div style={{fontFamily: FONT, color: C.dim, fontSize: 20, fontWeight: 800, marginTop: 7}}>
        掛け算・割り算を減らし、座標や絵をテーブルから取り出す
      </div>

      <div style={{display: 'flex', gap: 26, marginTop: 24, height: 532}}>
        <div style={{width: 430, display: 'flex', flexDirection: 'column', gap: 12}}>
          <div style={{opacity: reveal(0.03), padding: '15px 18px', background: C.panel, borderLeft: `6px solid ${C.red}`}}>
            <div style={{fontFamily: FONT, color: C.red, fontSize: 17, fontWeight: 900}}>ファミコンCPU</div>
            <div style={{fontFamily: FONT, color: C.white, fontSize: 24, fontWeight: 900, marginTop: 5}}>掛け算・割り算命令がない</div>
          </div>
          <div style={{opacity: reveal(0.35), display: 'flex', alignItems: 'center', gap: 10}}>
            <div style={{width: 115, padding: '13px 8px', textAlign: 'center', background: '#101116', border: `2px solid ${C.cyan}`, fontFamily: FONT, color: C.white, fontSize: 20, fontWeight: 900}}>奥行き</div>
            <div style={{fontFamily: MONO, color: C.cyan, fontSize: 25, fontWeight: 900}}>→</div>
            <div style={{flex: 1, padding: '13px 12px', textAlign: 'center', background: `${C.cyan}18`, border: `2px solid ${C.cyan}`, fontFamily: FONT, color: C.cyan, fontSize: 21, fontWeight: 900}}>テーブル参照</div>
            <div style={{fontFamily: MONO, color: C.cyan, fontSize: 25, fontWeight: 900}}>→</div>
          </div>
          <div style={{opacity: reveal(0.43), padding: '13px 14px', background: C.panel, border: '1px solid #47434e', textAlign: 'center'}}>
            <div style={{fontFamily: FONT, color: C.white, fontSize: 20, fontWeight: 900}}>画面座標 ＋ 表示する絵</div>
          </div>
          <div style={{marginTop: 4, display: 'flex', flexDirection: 'column', gap: 9}}>
            {mappings.map((mapping) => (
              <div key={mapping.key} style={{opacity: reveal(mapping.at), display: 'flex', alignItems: 'center', gap: 12, padding: '10px 13px', background: C.panel, borderLeft: `5px solid ${mapping.color}`}}>
                <div style={{width: 158, fontFamily: FONT, color: mapping.color, fontSize: 18, fontWeight: 900}}>{mapping.key}</div>
                <div style={{fontFamily: FONT, color: C.white, fontSize: 17, fontWeight: 800}}>{mapping.label}</div>
              </div>
            ))}
          </div>
          <div style={{opacity: reveal(0.86), marginTop: 'auto', padding: '13px 15px', borderTop: `2px solid ${C.magenta}`, borderBottom: `2px solid ${C.magenta}`, fontFamily: FONT, color: C.white, fontSize: 20, fontWeight: 900, textAlign: 'center'}}>
            複雑な計算 → 配列を引く処理
          </div>
        </div>

        <div style={{flex: 1, padding: '20px 20px 17px', boxSizing: 'border-box', background: C.panel, border: '1px solid #47434e'}}>
          <div style={{display: 'flex', alignItems: 'baseline', justifyContent: 'space-between'}}>
            <div style={{fontFamily: FONT, color: C.white, fontSize: 24, fontWeight: 900}}>実際に使っている変換テーブル</div>
            <div style={{fontFamily: MONO, color: C.cyan, fontSize: 14, fontWeight: 900}}>56 Z-STEPS</div>
          </div>
          <div style={{opacity: reveal(0.35), height: 385, marginTop: 14, display: 'grid', placeItems: 'center', overflow: 'hidden', background: '#111216', border: `2px solid ${C.cyan}`}}>
            <Img src={staticFile('development_z_table.png')} style={{width: '100%', height: '100%', objectFit: 'contain', imageRendering: 'auto'}} />
          </div>
          <div style={{opacity: reveal(0.72), display: 'flex', gap: 9, marginTop: 14}}>
            {['Xの寄せ率', 'Y座標補正', '絵のサイズ 0〜15'].map((label, i) => (
              <div key={label} style={{flex: 1, padding: '10px 6px', textAlign: 'center', background: '#0a0a0d', borderTop: `3px solid ${[C.cyan, C.orange, C.magenta][i]}`, fontFamily: FONT, color: C.white, fontSize: 15, fontWeight: 900}}>{label}</div>
            ))}
          </div>
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

const AlignmentScene: React.FC<{durationInFrames?: number}> = ({durationInFrames = 360}) => {
  const frame = useCurrentFrame();
  const movementSequence = [0, 1, 2, 3, 2, 1, 0, 4, 5, 6, 7, 6, 5, 4];
  const index = movementSequence[Math.floor(frame / 9) % movementSequence.length];
  const xShift = index % 4;
  const parity = Math.floor(index / 4);
  const movementLabels = ['移動なし', '右へ1', '右へ2', '右へ3', '下へ1', '右1・下1', '右2・下1', '右3・下1'];
  return (
    <AbsoluteFill style={{opacity: fade(frame, durationInFrames), backgroundColor: C.bg, padding: '38px 48px 0', boxSizing: 'border-box'}}>
      <Title size={34}>解決策：1ドットづつ移動したパターンをあらかじめ用意する</Title>
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

const bossFaceDimensions = [
  [40, 58], [32, 47], [28, 41], [26, 37],
  [22, 33], [20, 29], [18, 26], [16, 22],
  [14, 20], [12, 17], [10, 14], [8, 12],
  [6, 9], [5, 7], [3, 4], [2, 3],
] as const;

const SizeBankScene: React.FC<{durationInFrames?: number}> = ({durationInFrames = 450}) => {
  const frame = useCurrentFrame();
  const scaleCycle = frame % 75;
  const scaleProgress = scaleCycle <= 37 ? scaleCycle / 37 : (75 - scaleCycle) / 38;
  const chosen = 15 - Math.round(scaleProgress * 15);
  const progress = interpolate(frame, [0, 30], [0, 1], {extrapolateRight: 'clamp'});
  const patternCountOpacity = interpolate(
    frame,
    [Math.round(durationInFrames * 0.54), Math.round(durationInFrames * 0.54) + 12],
    [0, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );
  const memoryOpacity = interpolate(
    frame,
    [Math.round(durationInFrames * 0.79), Math.round(durationInFrames * 0.79) + 12],
    [0, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );
  return (
    <AbsoluteFill style={{opacity: fade(frame, durationInFrames), backgroundColor: C.bg, padding: '38px 48px 0', boxSizing: 'border-box'}}>
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
                  style={{width: bossFaceDimensions[i][0] * 1.6, height: bossFaceDimensions[i][1] * 1.6, imageRendering: 'pixelated'}}
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
              style={{width: bossFaceDimensions[chosen][0] * 3.4, height: bossFaceDimensions[chosen][1] * 3.4, imageRendering: 'pixelated'}}
            />
          </div>
          <div style={{width: '100%', padding: '13px 8px', boxSizing: 'border-box', borderTop: `2px solid ${C.magenta}`, borderBottom: `2px solid ${C.magenta}`, textAlign: 'center'}}>
            <div style={{fontFamily: FONT, color: C.white, fontSize: 20, fontWeight: 900}}>16サイズ × 8位置</div>
            <div style={{fontFamily: FONT, color: C.cyan, fontSize: 24, fontWeight: 900, marginTop: 4, opacity: patternCountOpacity}}>＝ 128パターン</div>
            <div style={{opacity: memoryOpacity}}>
              <div style={{fontFamily: FONT, color: C.magenta, fontSize: 32, fontWeight: 900, marginTop: 4}}>ボス顔だけで 約90KB</div>
              <div style={{fontFamily: FONT, color: C.dim, fontSize: 15, fontWeight: 700, marginTop: 4}}>（参考：スーパーマリオは全部で40KB）</div>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const SpriteScaleResultScene: React.FC<{durationInFrames?: number}> = ({durationInFrames = 420}) => {
  const frame = useCurrentFrame();
  const at = (fraction: number) => Math.round(durationInFrames * fraction);
  const patternOpacity = frame >= at(0.12) && frame < at(0.52) ? 1 : 0;
  const payoffOpacity = frame >= at(0.52) ? 1 : 0;
  return (
    <AbsoluteFill style={{backgroundColor: '#000', display: 'grid', placeItems: 'center'}}>
      <OffthreadVideo
        src={staticFile('boss_battle.mp4')}
        startFrom={86 * 30}
        endAt={86 * 30 + durationInFrames}
        muted
        style={{width: 768, height: 720, objectFit: 'fill', imageRendering: 'pixelated'}}
      />
      <div style={{position: 'absolute', inset: 0, background: '#000a', opacity: payoffOpacity}} />

      <div style={{position: 'absolute', left: 56, bottom: 54, opacity: patternOpacity, padding: '18px 24px', background: '#050507e8', borderLeft: `8px solid ${C.orange}`, boxShadow: '0 12px 30px #000a'}}>
        <div style={{fontFamily: FONT, color: C.dim, fontSize: 21, fontWeight: 900}}>滑らかな拡大縮小のために用意</div>
        <div style={{fontFamily: MONO, color: C.white, fontSize: 40, fontWeight: 900, marginTop: 5}}>
          <span style={{color: C.cyan}}>16段階</span> × <span style={{color: C.magenta}}>8位置</span> ＝ <span style={{color: C.orange}}>128パターン</span>
        </div>
      </div>

      <div style={{position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', opacity: payoffOpacity}}>
        <div style={{textAlign: 'center'}}>
          <div style={{fontFamily: FONT, color: C.orange, fontSize: 27, fontWeight: 900, letterSpacing: 2}}>大量のメモリと引き換えに</div>
          <div style={{fontFamily: FONT, color: C.white, fontSize: 54, lineHeight: 1.25, fontWeight: 900, marginTop: 14}}>描画速度とクオリティを最大化</div>
          <div style={{display: 'flex', justifyContent: 'center', gap: 18, marginTop: 28}}>
            <div style={{padding: '12px 20px', background: `${C.red}24`, border: `2px solid ${C.red}`, fontFamily: FONT, color: C.red, fontSize: 23, fontWeight: 900}}>メモリ消費 ↑</div>
            <div style={{padding: '12px 20px', background: `${C.cyan}24`, border: `2px solid ${C.cyan}`, fontFamily: FONT, color: C.cyan, fontSize: 23, fontWeight: 900}}>描画速度・品質 ↑</div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const BossBattleScene: React.FC<{durationInFrames?: number}> = ({durationInFrames = 240}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{opacity: fade(frame, durationInFrames), backgroundColor: '#000', display: 'grid', placeItems: 'center'}}>
      <OffthreadVideo
        src={staticFile('boss_battle.mp4')}
        startFrom={86 * 30}
        endAt={86 * 30 + durationInFrames}
        muted
        style={{width: 768, height: 720, objectFit: 'fill', imageRendering: 'pixelated'}}
      />
    </AbsoluteFill>
  );
};

const ClosingSummaryScene: React.FC<{durationInFrames?: number}> = ({durationInFrames = 720}) => {
  const frame = useCurrentFrame();
  const at = (fraction: number) => Math.round(durationInFrames * fraction);
  const introEnd = at(0.12);
  const recapEnd = at(0.66);
  const thanksStart = Math.round(25.595 * 30);
  const teaserEnd = thanksStart - Math.round(0.5 * 30);
  const introOpacity = frame < introEnd ? 1 : 0;
  const recapOpacity = frame >= introEnd && frame < recapEnd ? 1 : 0;
  const teaserOpacity = frame >= recapEnd && frame < teaserEnd ? 1 : 0;
  const thanksGapOpacity = frame >= teaserEnd && frame < thanksStart ? 1 : 0;
  const thanksOpacity = frame >= thanksStart ? 1 : 0;
  const cardReveal = (fraction: number) => frame >= at(fraction) ? 1 : 0;
  const recapCards = [
    {label: '絵ごとの専用コード', sub: 'あらかじめ用意', color: C.magenta, at: 0.19},
    {label: 'CPU性能を引き出す', sub: 'メモリと引き換え', color: C.orange, at: 0.32},
    {label: '高速・滑らかな描画', sub: '拡大縮小を実現', color: C.cyan, at: 0.47},
  ];
  return (
    <AbsoluteFill style={{backgroundColor: '#000', display: 'grid', placeItems: 'center', overflow: 'hidden'}}>
      <OffthreadVideo
        src={staticFile('game_CSCD.mp4')}
        startFrom={17 * 30}
        muted
        style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', imageRendering: 'pixelated'}}
      />
      <div style={{position: 'absolute', inset: 0, background: '#020207', opacity: 0.72}} />

      <div style={{position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', opacity: introOpacity}}>
        <div style={{textAlign: 'center'}}>
          <div style={{fontFamily: FONT, color: C.magenta, fontSize: 24, fontWeight: 900, letterSpacing: 8}}>SUMMARY</div>
          <div style={{fontFamily: FONT, color: C.white, fontSize: 68, fontWeight: 900, marginTop: 10}}>まとめ</div>
          <div style={{width: 160, height: 5, margin: '18px auto 0', background: C.magenta}} />
        </div>
      </div>

      <div style={{position: 'absolute', inset: 0, padding: '48px 54px', boxSizing: 'border-box', opacity: recapOpacity}}>
        <div style={{fontFamily: FONT, color: C.white, fontSize: 37, fontWeight: 900}}>コンパイルドスプライトのポイント</div>
        <div style={{fontFamily: FONT, color: C.dim, fontSize: 21, fontWeight: 800, marginTop: 8}}>大量のメモリと引き換えに、ファミコンの性能を引き出す</div>
        <div style={{display: 'flex', alignItems: 'stretch', gap: 16, marginTop: 62}}>
          {recapCards.map((card, index) => {
            const reveal = cardReveal(card.at);
            return (
              <React.Fragment key={card.label}>
                <div style={{flex: 1, minHeight: 190, padding: '30px 19px', boxSizing: 'border-box', background: '#0b0a10ed', borderTop: `7px solid ${card.color}`, opacity: reveal, boxShadow: '0 16px 32px #0009'}}>
                  <div style={{fontFamily: FONT, color: C.white, fontSize: 28, lineHeight: 1.35, fontWeight: 900}}>{card.label}</div>
                  <div style={{fontFamily: FONT, color: C.dim, fontSize: 18, fontWeight: 800, marginTop: 12}}>{card.sub}</div>
                </div>
                {index < recapCards.length - 1 ? <div style={{alignSelf: 'center', fontFamily: FONT, color: C.white, fontSize: 34, fontWeight: 900, opacity: reveal}}>→</div> : null}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div style={{position: 'absolute', inset: 0, opacity: teaserOpacity, background: '#05050be8', display: 'grid', placeItems: 'center'}}>
        <svg viewBox="0 0 1280 720" style={{position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.28}}>
          {[0, 160, 320, 480, 640, 800, 960, 1120, 1280].map((x) => <line key={`ray-${x}`} x1="640" y1="280" x2={x} y2="720" stroke={C.cyan} strokeWidth="2" />)}
          {[390, 455, 530, 620, 715].map((y) => <line key={`row-${y}`} x1="0" y1={y} x2="1280" y2={y} stroke={C.cyan} strokeWidth="2" />)}
        </svg>
        <div style={{position: 'relative', textAlign: 'center'}}>
          <div style={{fontFamily: FONT, color: C.orange, fontSize: 26, fontWeight: 900, letterSpacing: 6}}>NEXT</div>
          <div style={{fontFamily: FONT, color: C.white, fontSize: 44, fontWeight: 900, marginTop: 20}}>次回：ファミコンで3Dを高速化</div>
          <div style={{fontFamily: FONT, color: C.cyan, fontSize: 25, fontWeight: 900, marginTop: 22}}>敵・背景・3D座標を限られたCPU性能で動かす</div>
        </div>
      </div>

      <div style={{position: 'absolute', inset: 0, opacity: thanksGapOpacity, background: '#000'}} />

      <div style={{position: 'absolute', inset: 0, opacity: thanksOpacity, background: '#030305', display: 'grid', placeItems: 'center'}}>
        <div style={{textAlign: 'center'}}>
          <div style={{fontFamily: FONT, color: C.white, fontSize: 52, fontWeight: 900}}>ご視聴ありがとうございました</div>
          <div style={{width: 220, height: 4, margin: '25px auto', background: C.magenta}} />
          <div style={{fontFamily: FONT, color: C.dim, fontSize: 22, fontWeight: 800}}>ファミコンでスペースハリアーを動かすには？</div>
          <div style={{fontFamily: FONT, color: C.cyan, fontSize: 19, fontWeight: 900, marginTop: 8}}>その1：コンパイルドスプライトの活用</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const FrameFrameworkIntroScene: React.FC<{durationInFrames?: number}> = ({durationInFrames = 180}) => {
  const frame = useCurrentFrame();
  const enter = spring({frame, fps: 30, config: {damping: 18}});
  return (
    <AbsoluteFill style={{opacity: fade(frame, durationInFrames), backgroundColor: C.bg, display: 'grid', placeItems: 'center'}}>
      <div style={{textAlign: 'center', transform: `translateY(${(1 - enter) * 28}px)`, opacity: enter}}>
        <div style={{fontFamily: MONO, color: C.magenta, fontSize: 104, lineHeight: 1, fontWeight: 900}}>30fps</div>
        <div style={{height: 24}} />
        <Title size={48}>ファミコンでゲームを動かすフレームワーク</Title>
        <div style={{fontFamily: FONT, color: C.dim, fontSize: 24, fontWeight: 900, marginTop: 24}}>2フレームへ処理を分散し、1画面を更新する</div>
      </div>
    </AbsoluteFill>
  );
};

const FrameTimelineScene: React.FC<{durationInFrames?: number}> = ({durationInFrames = 600}) => {
  const frame = useCurrentFrame();
  const timingScale = durationInFrames / 600;
  const scaled = (at: number) => Math.round(at * timingScale);
  const reveal = (at: number) => interpolate(frame, [scaled(at), scaled(at) + 12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const cpu = C.magenta;
  const logic = '#62df83';
  const normalVram = C.cyan;
  const exram = C.orange;
  const logicPulse = frame < scaled(532) ? 1 : 0.45 + 0.55 * ((Math.sin(((frame - scaled(532)) / 30) * Math.PI * 2) + 1) / 2);
  const Block: React.FC<{label: string; sub?: string; color: string; height: number; at: number; pulse?: boolean}> = ({label, sub, color, height, at, pulse = false}) => (
    <div style={{height, boxSizing: 'border-box', padding: '5px 9px', background: `${color}20`, borderLeft: `7px solid ${color}`, opacity: reveal(at) * (pulse ? logicPulse : 1), boxShadow: pulse && frame >= scaled(532) ? `0 0 18px ${color}66` : 'none'}}>
      <div style={{fontFamily: FONT, color: C.white, fontSize: 14, lineHeight: 1.2, fontWeight: 900}}>{label}</div>
      {sub ? <div style={{fontFamily: FONT, color, fontSize: 12, lineHeight: 1.15, fontWeight: 900, marginTop: 2}}>{sub}</div> : null}
    </div>
  );
  const Lane: React.FC<{kind: 'A' | 'B'}> = ({kind}) => {
    const isA = kind === 'A';
    const laneAt = isA ? 74 : 126;
    return (
      <div style={{width: 258, opacity: reveal(laneAt), transform: `translateY(${(1 - reveal(laneAt)) * 10}px)`}}>
        <div style={{fontFamily: FONT, color: C.white, fontSize: 18, lineHeight: 1.2, fontWeight: 900, textAlign: 'center', marginBottom: 8}}>
          {isA ? <>1フレーム目：<br />画面クリアと計算</> : <>2フレーム目：<br />スプライト描画</>}
        </div>
        <div style={{height: 448, border: '2px solid #47434e', padding: 6, boxSizing: 'border-box', background: C.panel, display: 'flex', flexDirection: 'column'}}>
          <div style={{height: 320, display: 'flex', flexDirection: 'column', gap: isA ? 5 : 0}}>
            {isA ? <>
              <Block label="仮想フレームバッファ消去" sub="描画　約1.7ms" color={cpu} height={43} at={190} />
              <Block label="地面・遠景の描画" sub="描画　約2.6ms" color={cpu} height={66} at={253} />
              <Block label="プレイヤー・敵・弾・衝突などの計算" sub="ゲームロジック　最大 約8.0ms" color={logic} height={201} at={302} pulse />
            </> : <>
              <Block label="コンパイルドスプライトを描画" sub="描画　最大 約12.3ms" color={cpu} height={320} at={419} />
            </>}
          </div>
          <div style={{height: 114, position: 'relative', borderTop: `4px solid ${C.bg}`, boxSizing: 'border-box', opacity: reveal(isA ? 402 : 495)}}>
            <div style={{position: 'absolute', left: 0, top: 0, width: 7, height: 8, background: C.white}} />
            <div style={{position: 'absolute', left: 0, top: 8, width: 7, height: 88, background: isA ? normalVram : exram}} />
            <div style={{position: 'absolute', left: 0, top: 96, width: 7, height: 14, background: C.dim}} />
            <div style={{position: 'absolute', left: 11, top: 5, fontFamily: MONO, color: isA ? normalVram : exram, fontSize: 11, fontWeight: 900}}>VBLANK（延長）　4.4ms</div>
            <div style={{position: 'absolute', left: 11, top: 29, fontFamily: FONT, color: C.white, fontSize: 13, fontWeight: 900}}>OAM DMA　約0.3ms</div>
            <div style={{position: 'absolute', left: 11, top: 51, fontFamily: FONT, color: isA ? normalVram : exram, fontSize: 13, lineHeight: 1.25, fontWeight: 900}}>{isA ? <>通常VRAM更新　約3.4ms<br />ダブルバッファ</> : <>ExRAM更新　約3.4ms<br />シングルバッファ</>}</div>
            <div style={{position: 'absolute', left: 11, bottom: 3, fontFamily: FONT, color: C.dim, fontSize: 11, fontWeight: 900}}>{isA ? '割り込みなど　約0.7ms' : '割り込み・ページ切替など　約0.7ms'}</div>
          </div>
        </div>
      </div>
    );
  };
  const chartOpacity = reveal(545);
  const previewStage = frame < scaled(141) ? 0 : frame < scaled(190) ? 1 : frame < scaled(253) ? 2 : frame < scaled(302) ? 3 : frame < scaled(454) ? 4 : 5;
  const stageLabels = ['前のフレーム：完成した画面', '前のフレームを表示中', '上半分を消去', '地面・遠景を描画', 'ゲームロジックを反映', 'コンパイルドスプライトで完成'];
  const previewImages = ['frame_background_player_bg.png', 'frame_background_player_bg.png', 'frame_background_player_bg.png', 'frame_background.png', 'frame_background_player.png', 'frame_background_player_bg.png'];
  return (
    <AbsoluteFill style={{opacity: fade(frame, durationInFrames), backgroundColor: C.bg, padding: '34px 42px 0', boxSizing: 'border-box'}}>
      <Title size={38}>30fpsで動かすため、処理を2フレームに分ける</Title>
      <div style={{fontFamily: MONO, color: C.dim, fontSize: 18, fontWeight: 900, marginTop: 7}}>1 FRAME = 16.7ms　／　同じ長さの2フレームを交互に実行</div>
      <div style={{display: 'flex', gap: 14, alignItems: 'flex-start', marginTop: 15}}>
        <Lane kind="A" />
        <Lane kind="B" />
        <div style={{flex: 1}}>
          <div style={{width: 420, height: 277, margin: '0 auto', position: 'relative', overflow: 'hidden', background: '#000', border: '2px solid #47434e'}}>
            <Img src={staticFile(previewImages[previewStage])} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', imageRendering: 'pixelated'}} />
            {previewStage === 1 ? <div style={{position: 'absolute', inset: 0, background: '#30303880'}} /> : null}
            {previewStage === 2 ? <>
              <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: '64%', background: '#000'}} />
              <div style={{position: 'absolute', left: 0, right: 0, top: '64%', bottom: 0, background: '#30303880'}} />
            </> : null}
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

const ProgrammingFlowScene: React.FC<{durationInFrames?: number}> = ({durationInFrames = 900}) => {
  const frame = useCurrentFrame();
  const show = (fraction: number) => interpolate(frame, [durationInFrames * fraction, durationInFrames * fraction + 18], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const codeLines = ['update_enemy();', 'project_xyz();', 'check_collision();'];
  return (
    <AbsoluteFill style={{opacity: fade(frame, durationInFrames), backgroundColor: C.bg, padding: '38px 46px 0', boxSizing: 'border-box'}}>
      <Title size={40}>C言語を正本に、AIでアセンブラ化</Title>
      <div style={{fontFamily: FONT, color: C.dim, fontSize: 19, fontWeight: 800, marginTop: 7}}>AIをコンパイラのように使い、Cとアセンブラを並行して維持</div>
      <div style={{display: 'grid', gridTemplateColumns: '330px 1fr 360px', gap: 24, alignItems: 'stretch', marginTop: 34, height: 470}}>
        <div style={{opacity: show(0.12), background: C.panel, border: `2px solid ${C.cyan}`, padding: 22}}>
          <div style={{fontFamily: MONO, color: C.cyan, fontSize: 23, fontWeight: 900}}>C SOURCE</div>
          <div style={{fontFamily: FONT, color: C.white, fontSize: 18, fontWeight: 900, marginTop: 12}}>アルゴリズムを素早く更新</div>
          <div style={{marginTop: 27, display: 'flex', flexDirection: 'column', gap: 15}}>
            {codeLines.map((line, i) => <div key={line} style={{opacity: show(0.14 + i * 0.055), fontFamily: MONO, color: C.white, fontSize: 19, padding: '11px 12px', background: '#0b0c10', borderLeft: `5px solid ${C.cyan}`}}>{line}</div>)}
          </div>
          <div style={{marginTop: 25, fontFamily: FONT, color: C.cyan, fontSize: 17, lineHeight: 1.5, fontWeight: 900}}>同じ動作のCソースを<br />常に残す</div>
        </div>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{opacity: show(0.32), width: 150, height: 150, borderRadius: '50%', border: `4px solid ${C.magenta}`, display: 'grid', placeItems: 'center', background: `${C.magenta}18`, fontFamily: FONT, color: C.magenta, fontSize: 34, fontWeight: 900}}>AI</div>
          <div style={{opacity: show(0.37), fontFamily: MONO, color: C.magenta, fontSize: 34, margin: '16px 0'}}>→</div>
          <div style={{opacity: show(0.4), padding: '14px 18px', background: C.panel, borderTop: `3px solid ${C.magenta}`, borderBottom: `3px solid ${C.magenta}`, textAlign: 'center', fontFamily: FONT, color: C.white, fontSize: 18, fontWeight: 900}}>固まった処理を<br />アセンブラへ変換</div>
        </div>
        <div style={{opacity: show(0.48), background: C.panel, border: `2px solid ${C.orange}`, padding: 22}}>
          <div style={{fontFamily: MONO, color: C.orange, fontSize: 23, fontWeight: 900}}>6502 ASM</div>
          <div style={{fontFamily: FONT, color: C.white, fontSize: 18, fontWeight: 900, marginTop: 12}}>AIがアセンブラへ置き換える</div>
          <div style={{marginTop: 25, fontFamily: MONO, color: C.white, fontSize: 17, lineHeight: 1.65, padding: 16, background: '#0b0c10'}}><span style={{color: C.orange}}>LDA</span> enemy_x<br /><span style={{color: C.orange}}>ADC</span> velocity_x<br /><span style={{color: C.orange}}>STA</span> enemy_x<br /><span style={{color: C.orange}}>JSR</span> project_xyz</div>
          <div style={{opacity: show(0.65), marginTop: 23, padding: '13px 10px', textAlign: 'center', border: '2px solid #62df83', fontFamily: FONT, color: '#62df83', fontSize: 19, fontWeight: 900}}>✓ C版と同じ動作</div>
        </div>
      </div>
      <div style={{opacity: show(0.77), position: 'absolute', left: 260, right: 260, bottom: 16, padding: '14px 20px', borderTop: `2px solid ${C.magenta}`, borderBottom: `2px solid ${C.magenta}`, textAlign: 'center', fontFamily: FONT, color: C.white, fontSize: 23, fontWeight: 900}}>アルゴリズム改善はC言語で何度でも行える</div>
    </AbsoluteFill>
  );
};

const BitPrecisionScene: React.FC<{durationInFrames?: number}> = ({durationInFrames = 900}) => {
  const frame = useCurrentFrame();
  const videoStart = Math.round(durationInFrames * 0.45);
  const diagramOpacity = interpolate(frame, [videoStart - 12, videoStart], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const videoOpacity = interpolate(frame, [videoStart, videoStart + 12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const reveal = (at: number) => interpolate(frame, [at, at + 12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{opacity: fade(frame, durationInFrames), backgroundColor: C.bg}}>
      <AbsoluteFill style={{opacity: diagramOpacity, padding: '38px 46px 0', boxSizing: 'border-box'}}>
        <Title size={43}>座標計算を16bitから8bitへ</Title>
        <div style={{fontFamily: FONT, color: C.dim, fontSize: 20, fontWeight: 800, marginTop: 7}}>必要な精度だけを残して、CPU負荷を減らす</div>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, marginTop: 34}}>
          <div style={{opacity: reveal(10), height: 350, padding: '28px 30px', boxSizing: 'border-box', background: C.panel, border: `3px solid ${C.cyan}`}}>
            <div style={{fontFamily: MONO, color: C.cyan, fontSize: 62, lineHeight: 1, fontWeight: 900}}>8bit</div>
            <div style={{fontFamily: MONO, color: C.white, fontSize: 36, fontWeight: 900, marginTop: 25}}>0 〜 255</div>
            <div style={{fontFamily: FONT, color: C.cyan, fontSize: 23, fontWeight: 900, marginTop: 34}}>計算が軽い</div>
            <div style={{fontFamily: FONT, color: C.white, fontSize: 23, lineHeight: 1.45, fontWeight: 900, marginTop: 16}}>ほとんどの座標計算を<br />8bitへ置き換える</div>
          </div>
          <div style={{opacity: reveal(Math.round(durationInFrames * 0.12)), height: 350, padding: '28px 30px', boxSizing: 'border-box', background: C.panel, border: `3px solid ${C.orange}`}}>
            <div style={{fontFamily: MONO, color: C.orange, fontSize: 62, lineHeight: 1, fontWeight: 900}}>16bit</div>
            <div style={{fontFamily: MONO, color: C.white, fontSize: 36, fontWeight: 900, marginTop: 25}}>0 〜 65,535</div>
            <div style={{fontFamily: FONT, color: C.orange, fontSize: 23, fontWeight: 900, marginTop: 34}}>広い範囲・高い精度</div>
            <div style={{fontFamily: FONT, color: C.white, fontSize: 23, lineHeight: 1.45, fontWeight: 900, marginTop: 16}}>背景オブジェクトの<br />X座標だけに残す</div>
          </div>
        </div>
        <div style={{opacity: reveal(Math.round(durationInFrames * 0.28)), margin: '24px auto 0', width: 820, padding: '16px 20px', borderTop: `2px solid ${C.magenta}`, borderBottom: `2px solid ${C.magenta}`, textAlign: 'center', fontFamily: FONT, color: C.white, fontSize: 26, fontWeight: 900}}>
          16bitを必要な場所だけに限定 → 8bit CPUで高速化
        </div>
      </AbsoluteFill>
      <Sequence from={videoStart} durationInFrames={Math.max(1, durationInFrames - videoStart)}>
        <AbsoluteFill style={{opacity: videoOpacity, backgroundColor: '#000', display: 'grid', placeItems: 'center'}}>
          <OffthreadVideo
            src={staticFile('game_CSCD.mp4')}
            startFrom={17 * 30}
            endAt={17 * 30 + Math.max(1, durationInFrames - videoStart)}
            muted
            style={{width: 960, height: 720, objectFit: 'fill', imageRendering: 'pixelated'}}
          />
          <div style={{position: 'absolute', left: 38, top: 28, padding: '11px 16px', background: '#050507dd', borderLeft: `6px solid ${C.orange}`, fontFamily: FONT, color: C.white, fontSize: 24, fontWeight: 900}}>背景オブジェクトのX座標だけ16bit</div>
          <div style={{position: 'absolute', left: 38, bottom: 28, padding: '9px 14px', background: '#050507dd', fontFamily: FONT, color: C.dim, fontSize: 19, fontWeight: 900}}>奥ではプレイヤーの左右移動へ滑らかに追従</div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

const HoudiniTrajectoryScene: React.FC<{durationInFrames?: number}> = ({durationInFrames = 450}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{opacity: fade(frame, durationInFrames), backgroundColor: '#000'}}>
      <Loop durationInFrames={175}>
        <OffthreadVideo src={staticFile('houdini_enemy_trajectory.mp4')} muted endAt={175} style={{width: '100%', height: '100%', objectFit: 'contain'}} />
      </Loop>
      <div style={{position: 'absolute', left: 32, top: 28, padding: '11px 17px', background: '#050507dd', borderLeft: `6px solid ${C.orange}`, fontFamily: FONT, color: C.white, fontSize: 26, fontWeight: 900}}>Houdiniで敵編隊の軌跡を作成</div>
    </AbsoluteFill>
  );
};

const AiTrajectoryScene: React.FC<{durationInFrames?: number}> = ({durationInFrames = 450}) => {
  const frame = useCurrentFrame();
  const draw = interpolate(frame, [durationInFrames * 0.35, durationInFrames * 0.78], [620, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const aiOpacity = interpolate(frame, [durationInFrames * 0.18, durationInFrames * 0.28], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{opacity: fade(frame, durationInFrames), backgroundColor: C.bg, padding: '38px 46px 0', boxSizing: 'border-box'}}>
      <Title size={42}>キャプチャから、AIが敵の軌跡を設計</Title>
      <div style={{display: 'grid', gridTemplateColumns: '350px 220px 1fr', gap: 28, alignItems: 'center', marginTop: 46}}>
        <div style={{height: 370, background: '#000', border: `2px solid ${C.cyan}`, overflow: 'hidden', position: 'relative'}}>
          <Img src={staticFile('frame_background_player_bg.png')} style={{width: '100%', height: '100%', objectFit: 'contain', imageRendering: 'pixelated'}} />
          <div style={{position: 'absolute', left: 12, bottom: 12, padding: '7px 10px', background: '#050507dd', fontFamily: FONT, color: C.cyan, fontSize: 16, fontWeight: 900}}>ゲーム画面キャプチャ</div>
        </div>
        <div style={{opacity: aiOpacity, display: 'flex', flexDirection: 'column', gap: 17, alignItems: 'center'}}>
          <div style={{width: 160, padding: '15px 8px', border: `2px solid ${C.magenta}`, background: `${C.magenta}18`, textAlign: 'center', fontFamily: FONT, color: C.white, fontSize: 19, fontWeight: 900}}>Claude Fable</div>
          <div style={{fontFamily: MONO, color: C.magenta, fontSize: 31}}>＋</div>
          <div style={{width: 160, padding: '15px 8px', border: `2px solid ${C.magenta}`, background: `${C.magenta}18`, textAlign: 'center', fontFamily: FONT, color: C.white, fontSize: 21, fontWeight: 900}}>GPT-5.6</div>
          <div style={{fontFamily: MONO, color: C.magenta, fontSize: 36}}>→</div>
        </div>
        <div style={{height: 370, background: C.panel, border: `2px solid ${C.orange}`, position: 'relative', overflow: 'hidden'}}>
          <svg width="100%" height="100%" viewBox="0 0 520 370">
            <defs><linearGradient id="trajectory" x1="0" x2="1"><stop stopColor={C.cyan} /><stop offset="1" stopColor={C.orange} /></linearGradient></defs>
            {Array.from({length: 8}).map((_, i) => <line key={`h${i}`} x1="0" y1={40 + i * 40} x2="520" y2={40 + i * 40} stroke="#34313c" strokeWidth="1" />)}
            {Array.from({length: 10}).map((_, i) => <line key={`v${i}`} x1={40 + i * 52} y1="0" x2={40 + i * 52} y2="370" stroke="#282630" strokeWidth="1" />)}
            <path d="M 25 300 C 90 90 165 80 220 210 S 330 360 385 165 S 470 60 510 120" fill="none" stroke="url(#trajectory)" strokeWidth="7" strokeLinecap="round" strokeDasharray="620" strokeDashoffset={draw} />
            {[0, 1, 2, 3, 4, 5].map((i) => <circle key={i} cx={70 + i * 82} cy={[190, 96, 188, 300, 175, 94][i]} r="9" fill={i < 3 ? C.cyan : C.orange} opacity={draw < 540 - i * 85 ? 1 : 0} />)}
          </svg>
          <div style={{position: 'absolute', left: 16, top: 14, fontFamily: FONT, color: C.orange, fontSize: 18, fontWeight: 900}}>生成した敵編隊の軌跡データ</div>
          <div style={{position: 'absolute', right: 16, bottom: 14, fontFamily: MONO, color: C.dim, fontSize: 14}}>COMPILE READY</div>
        </div>
      </div>
      <div style={{position: 'absolute', left: 380, right: 380, bottom: 44, padding: '13px', borderTop: `2px solid ${C.magenta}`, borderBottom: `2px solid ${C.magenta}`, textAlign: 'center', fontFamily: FONT, color: C.white, fontSize: 22, fontWeight: 900}}>AIで軌跡を作れるか検証</div>
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
      <Sequence from={c07Timing.startFrame} durationInFrames={c07Timing.durationFrames}>
        <DevelopmentCheckerboardScene durationInFrames={c07Timing.durationFrames} />
        <Audio src={staticFile('narration/development/C07.wav')} volume={0.95} />
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
      <Sequence from={c10Timing.startFrame} durationInFrames={c10Timing.durationFrames}>
        <CompiledScene durationInFrames={c10Timing.durationFrames} />
        <Audio src={staticFile('narration/drawing/C10.wav')} volume={0.95} />
      </Sequence>
    </AbsoluteFill>
  );
};

export const BenefitNarrationPreview: React.FC = () => {
  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <Sequence from={c11Timing.startFrame} durationInFrames={c11Timing.durationFrames}>
        <RaceScene durationInFrames={c11Timing.durationFrames} />
        <Audio src={staticFile('narration/benefits/C11.wav')} volume={0.95} />
      </Sequence>
      <Sequence from={c12Timing.startFrame} durationInFrames={c12Timing.durationFrames}>
        <PerformanceDemoScene durationInFrames={c12Timing.durationFrames} />
        <Audio src={staticFile('narration/benefits/C12.wav')} volume={0.95} />
      </Sequence>
      <Sequence from={c13Timing.startFrame} durationInFrames={c13Timing.durationFrames}>
        <CapacityCostScene durationInFrames={c13Timing.durationFrames} />
        <Audio src={staticFile('narration/benefits/C13.wav')} volume={0.95} />
      </Sequence>
    </AbsoluteFill>
  );
};

export const ConstraintNarrationPreview: React.FC = () => {
  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <Sequence from={c14Timing.startFrame} durationInFrames={c14Timing.durationFrames}>
        <PositionLimitScene durationInFrames={c14Timing.durationFrames} />
        <Audio src={staticFile('narration/constraints/C14.wav')} volume={0.95} />
      </Sequence>
      <Sequence from={c15Timing.startFrame} durationInFrames={c15Timing.durationFrames}>
        <AlignmentScene durationInFrames={c15Timing.durationFrames} />
        <Audio src={staticFile('narration/constraints/C15.wav')} volume={0.95} />
      </Sequence>
      <Sequence from={c16Timing.startFrame} durationInFrames={c16Timing.durationFrames}>
        <SizeBankScene durationInFrames={c16Timing.durationFrames} />
        <Audio src={staticFile('narration/constraints/C16.wav')} volume={0.95} />
      </Sequence>
    </AbsoluteFill>
  );
};

export const LaterNarrationPreview: React.FC = () => {
  const c17C18BlackFrames = Math.round(0.25 * 30);
  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <Sequence from={c17Timing.startFrame} durationInFrames={c17Timing.durationFrames}>
        <SpriteScaleResultScene durationInFrames={c17Timing.durationFrames} />
        <Audio src={staticFile('narration/later/C17.wav')} volume={0.95} />
      </Sequence>
      <Sequence from={c17Timing.startFrame + c17Timing.durationFrames} durationInFrames={c17C18BlackFrames}>
        <AbsoluteFill style={{backgroundColor: '#000'}} />
      </Sequence>
      <Sequence from={c18Timing.startFrame} durationInFrames={c18Timing.durationFrames}>
        <ClosingSummaryScene durationInFrames={c18Timing.durationFrames} />
        <Audio src={staticFile('narration/later/C18.wav')} volume={0.95} />
      </Sequence>
    </AbsoluteFill>
  );
};

export const C01C17NarrationPreview: React.FC = () => {
  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <Sequence from={c01C17GroupStartFrames.c01} durationInFrames={narrationPreviewDurationInFrames}>
        <ExplainerPrototype />
      </Sequence>
      <Sequence from={c01C17GroupStartFrames.c04} durationInFrames={developmentNarrationDurationInFrames}>
        <DevelopmentNarrationPreview />
      </Sequence>
      <Sequence from={c01C17GroupStartFrames.c08} durationInFrames={drawingNarrationDurationInFrames}>
        <DrawingNarrationPreview />
      </Sequence>
      <Sequence from={c01C17GroupStartFrames.c11} durationInFrames={benefitNarrationDurationInFrames}>
        <BenefitNarrationPreview />
      </Sequence>
      <Sequence from={c01C17GroupStartFrames.c14} durationInFrames={constraintNarrationDurationInFrames}>
        <ConstraintNarrationPreview />
      </Sequence>
      <Sequence from={c01C17GroupStartFrames.c17} durationInFrames={c17Timing.durationFrames}>
        <LaterNarrationPreview />
      </Sequence>
    </AbsoluteFill>
  );
};

export const C01C18NarrationPreview: React.FC = () => {
  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <Sequence from={c01C17GroupStartFrames.c01} durationInFrames={narrationPreviewDurationInFrames}>
        <ExplainerPrototype />
      </Sequence>
      <Sequence from={c01C17GroupStartFrames.c04} durationInFrames={developmentNarrationDurationInFrames}>
        <DevelopmentNarrationPreview />
      </Sequence>
      <Sequence from={c01C17GroupStartFrames.c08} durationInFrames={drawingNarrationDurationInFrames}>
        <DrawingNarrationPreview />
      </Sequence>
      <Sequence from={c01C17GroupStartFrames.c11} durationInFrames={benefitNarrationDurationInFrames}>
        <BenefitNarrationPreview />
      </Sequence>
      <Sequence from={c01C17GroupStartFrames.c14} durationInFrames={constraintNarrationDurationInFrames}>
        <ConstraintNarrationPreview />
      </Sequence>
      <Sequence from={c01C17GroupStartFrames.c17} durationInFrames={laterNarrationPreviewDurationInFrames}>
        <LaterNarrationPreview />
      </Sequence>
    </AbsoluteFill>
  );
};

export const WorkflowNarrationPreview: React.FC = () => {
  const baseFrame = c20Timing.startFrame;
  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <Sequence from={c20Timing.startFrame - baseFrame} durationInFrames={c20Timing.durationFrames}>
        <GameLogicScene durationInFrames={c20Timing.durationFrames} />
        <Audio src={staticFile('narration/later/C20.wav')} volume={0.95} />
      </Sequence>
      <Sequence from={c21Timing.startFrame - baseFrame} durationInFrames={c21Timing.durationFrames}>
        <CoordinateTransformScene durationInFrames={c21Timing.durationFrames} />
        <Audio src={staticFile('narration/later/C21.wav')} volume={0.95} />
      </Sequence>
      <Sequence from={c22Timing.startFrame - baseFrame} durationInFrames={c22Timing.durationFrames}>
        <ProgrammingFlowScene durationInFrames={c22Timing.durationFrames} />
        <Audio src={staticFile('narration/later/C22.wav')} volume={0.95} />
      </Sequence>
      <Sequence from={c23Timing.startFrame - baseFrame} durationInFrames={c23Timing.durationFrames}>
        <BitPrecisionScene durationInFrames={c23Timing.durationFrames} />
        <Audio src={staticFile('narration/later/C23.wav')} volume={0.95} />
      </Sequence>
    </AbsoluteFill>
  );
};
