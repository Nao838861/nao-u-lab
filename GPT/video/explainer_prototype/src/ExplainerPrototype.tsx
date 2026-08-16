import React from 'react';
import {
  AbsoluteFill,
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
              background: visible ? '#34363e' : '#0c0d10',
              border: analyze
                ? `1px solid ${analysisColor}`
                : '1px solid rgba(120,118,130,.22)',
              outline: cursor === i ? `4px solid ${C.orange}` : undefined,
              outlineOffset: -3,
              zIndex: cursor === i ? 3 : 1,
            }}
          >
            {visible && category !== 0 ? (
              <Img
                src={staticFile('enemy_em0_00.png')}
                style={{
                  position: 'absolute',
                  width: width * scale,
                  height: height * scale,
                  left: -x * scale,
                  top: -y * scale,
                  maxWidth: 'none',
                  imageRendering: 'pixelated',
                }}
              />
            ) : null}
          </div>
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

const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, 240], [1.04, 1.12], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });
  const enter = spring({frame, fps: 30, config: {damping: 18}});
  return (
    <AbsoluteFill style={{opacity: fade(frame, 240), backgroundColor: C.bg}}>
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
          <div style={{whiteSpace: 'nowrap'}}>ファミコンでスペースハリアーを</div>
          <div>動かすには？</div>
        </Title>
      </div>
    </AbsoluteFill>
  );
};

const PreviousScene: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{opacity: fade(frame, 210), backgroundColor: C.bg}}>
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
    </AbsoluteFill>
  );
};

const LargeCharacterScene: React.FC = () => {
  const frame = useCurrentFrame();
  const imageEnter = spring({frame, fps: 30, config: {damping: 18}});
  const cpuOpacity = interpolate(frame, [92, 128], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const vramOpacity = interpolate(frame, [150, 188], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const clearProgress = interpolate(frame, [225, 345], [0, 30], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const compositeOpacity = interpolate(frame, [375, 420], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const warningOpacity = interpolate(frame, [465, 510], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        opacity: fade(frame, 720),
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
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              opacity: cpuOpacity,
            }}
          >
            <div style={{fontFamily: MONO, fontSize: 43, fontWeight: 900, color: C.white}}>6502</div>
            <div style={{fontFamily: MONO, fontSize: 22, fontWeight: 900, color: C.orange}}>1.79 MHz</div>
          </div>
          <div
            style={{
              marginTop: 2,
              color: C.dim,
              fontFamily: MONO,
              fontSize: 16,
              letterSpacing: 1.4,
              opacity: cpuOpacity,
            }}
          >
            8-BIT CPU
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 22,
              padding: '17px 0',
              borderTop: '1px solid #3a3741',
              borderBottom: '1px solid #3a3741',
              opacity: vramOpacity,
            }}
          >
            <div style={{fontFamily: FONT, color: C.white, fontSize: 18, fontWeight: 800}}>仮想VRAM</div>
            <div style={{fontFamily: MONO, color: C.cyan, fontSize: 25, fontWeight: 900}}>128 × 96</div>
          </div>

          <div style={{marginTop: 25}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
              <div style={{fontFamily: MONO, color: C.white, fontSize: 17, fontWeight: 800}}>60 FPS / 1 FRAME</div>
              <div style={{fontFamily: MONO, color: C.cyan, fontSize: 25, fontWeight: 900}}>{Math.round(clearProgress)}%</div>
            </div>
            <div
              style={{
                position: 'relative',
                height: 34,
                marginTop: 9,
                background: '#292630',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${clearProgress}%`,
                  height: '100%',
                  background: C.cyan,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: '30%',
                  top: 0,
                  bottom: 0,
                  width: 2,
                  background: C.white,
                  opacity: clearProgress > 3 ? 0.9 : 0,
                }}
              />
            </div>
            <div style={{marginTop: 7, fontFamily: FONT, color: C.white, fontSize: 18, fontWeight: 800}}>
              0で消すだけ
            </div>
          </div>

          <div
            style={{
              marginTop: 16,
              padding: '14px 0',
              borderTop: `1px solid ${C.red}88`,
              borderBottom: `1px solid ${C.red}88`,
              color: C.red,
              fontFamily: FONT,
              fontSize: 19,
              fontWeight: 900,
              opacity: compositeOpacity,
            }}
          >
            ＋ 背景との重ね合わせ
          </div>

          <div
            style={{
              marginTop: 13,
              color: C.white,
              fontFamily: FONT,
              fontSize: 22,
              fontWeight: 900,
              opacity: warningOpacity,
            }}
          >
            普通に描くと間に合わない
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const GenericLoopScene: React.FC = () => {
  const frame = useCurrentFrame();
  const done = clamp(Math.floor(interpolate(frame, [20, 285], [0, rasterBlocks.length])), 0, rasterBlocks.length);
  const cursor = rasterBlocks[Math.min(rasterBlocks.length - 1, done)];
  const category = enemyCoverage[cursor] ?? 0;
  const kinds = ['全面透明', '一部だけ描画', '全面上書き'];
  const steps = ['画像とマスクを読む', '画面の元の値を読む', '背景を残す（AND）', '絵を重ねる（OR）', '同じ場所へ書き戻す'];
  const active = Math.floor(frame / 8) % steps.length;
  return (
    <AbsoluteFill
      style={{
        opacity: fade(frame, 300),
        background: `radial-gradient(circle at 24% 45%, ${C.cyan}12, transparent 35%), ${C.bg}`,
        padding: '50px 58px',
        boxSizing: 'border-box',
      }}
    >
      <Eyebrow color={C.cyan} size={32}>一般的なソフトウェア描画</Eyebrow>
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

const CompiledScene: React.FC = () => {
  const frame = useCurrentFrame();
  const active = frame < 115 ? 0 : frame < 285 ? 1 : 2;
  const cursor = frame < 90
    ? 0
    : frame < 115
      ? Math.floor(interpolate(frame, [90, 115], [0, 6], {extrapolateRight: 'clamp'}))
      : frame < 225
        ? 6
        : frame < 285
          ? Math.floor(interpolate(frame, [225, 285], [6, 21], {extrapolateRight: 'clamp'}))
          : 21;
  const cards = [
    {title: '全面透明', equation: '(SCREEN AND $FF) OR $00', result: '命令なし', code: ['; 命令なし']},
    {title: '一部だけ描画', equation: '(SCREEN AND $C3) OR $24', result: '必要な合成だけ', code: ['LDA (screen),Y', 'AND #$C3', 'ORA #$24', 'STA (screen),Y']},
    {title: '全面上書き', equation: '(SCREEN AND $00) OR $7F', result: 'そのまま書く', code: ['LDA #$7F', 'STA (screen),Y']},
  ];
  const activeCard = cards[active];
  return (
    <AbsoluteFill
      style={{
        opacity: fade(frame, 360),
        background: `radial-gradient(circle at 76% 50%, ${C.magenta}18, transparent 36%), ${C.bg}`,
        padding: '46px 58px',
        boxSizing: 'border-box',
      }}
    >
      <Eyebrow size={32}>コンパイルドスプライト</Eyebrow>
      <div style={{height: 8}} />
      <Title size={37}>目的の絵を最速で書くための専用プログラムを実行</Title>
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
  {name: 'EM0', src: 'enemy_em0_00.png', width: 110, height: 60},
  {name: 'EM1', src: 'enemy_em1_00.png', width: 88, height: 88},
  {name: '敵の弾', src: 'enemy_bullet_00.png', width: 76, height: 76},
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

const CodeStripes: React.FC<{color: string; lines?: number}> = ({color, lines = 8}) => (
  <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
    {Array.from({length: lines}).map((_, i) => (
      <div
        key={i}
        style={{
          height: 5,
          width: `${72 + (i % 4) * 8}%`,
          background: color,
          opacity: 0.35 + (i % 3) * 0.18,
        }}
      />
    ))}
  </div>
);

const CapacityCostScene: React.FC = () => {
  const frame = useCurrentFrame();
  const count = clamp(Math.floor(interpolate(frame, [30, 210], [1, 4])), 1, 3);
  return (
    <AbsoluteFill style={{opacity: fade(frame, 360), backgroundColor: C.bg, padding: '38px 48px 0', boxSizing: 'border-box'}}>
      <Title size={42}>コンパイルドスプライトの欠点</Title>
      <div style={{fontFamily: FONT, color: C.white, fontSize: 25, fontWeight: 900, marginTop: 5}}>
        欠点1：絵ごとに専用プログラムが必要
      </div>

      <div style={{display: 'flex', gap: 28, marginTop: 25}}>
        <div style={{width: 570, height: 438, padding: 18, boxSizing: 'border-box', border: `2px solid ${C.cyan}`, background: C.panel}}>
          <div style={{fontFamily: FONT, color: C.cyan, fontSize: 25, fontWeight: 900}}>一般的なソフトウェア描画</div>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 14}}>
            {costSprites.map((sprite, i) => (
              <div key={sprite.name} style={{opacity: i < count ? 1 : 0.14}}><SpriteCard sprite={sprite} /></div>
            ))}
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: 18, marginTop: 23}}>
            <div style={{fontFamily: FONT, color: C.white, fontSize: 22, fontWeight: 900}}>絵データだけ追加</div>
            <div style={{fontFamily: MONO, color: C.cyan, fontSize: 24, fontWeight: 900}}>→</div>
            <div style={{flex: 1, padding: '12px 14px', border: '1px solid #4a4651', background: '#0a0a0d'}}>
              <div style={{fontFamily: FONT, color: C.dim, fontSize: 12, fontWeight: 800, marginBottom: 7}}>1つの小さな汎用プログラム</div>
              <CodeStripes color={C.cyan} lines={5} />
            </div>
          </div>
          <div style={{marginTop: 23, height: 18, background: '#292630'}}>
            <div style={{height: '100%', width: `${24 + count * 9}%`, background: C.cyan}} />
          </div>
          <div style={{fontFamily: FONT, color: C.dim, fontSize: 17, marginTop: 7}}>プログラムは1つのまま</div>
        </div>

        <div style={{width: 570, height: 438, padding: 18, boxSizing: 'border-box', border: `2px solid ${C.magenta}`, background: C.panel}}>
          <div style={{fontFamily: FONT, color: C.magenta, fontSize: 25, fontWeight: 900}}>コンパイルドスプライト</div>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 14}}>
            {costSprites.map((sprite, i) => (
              <div key={sprite.name} style={{opacity: i < count ? 1 : 0.14}}>
                <SpriteCard sprite={sprite} />
                <div style={{height: 73, padding: '10px 12px', boxSizing: 'border-box', background: '#0a0a0d', border: '1px solid #3a3741'}}>
                  <CodeStripes color={C.magenta} lines={7} />
                </div>
              </div>
            ))}
          </div>
          <div style={{fontFamily: FONT, color: C.white, fontSize: 22, fontWeight: 900, marginTop: 14}}>絵ごとにプログラムを追加</div>
          <div style={{marginTop: 15, height: 18, background: '#292630'}}>
            <div style={{height: '100%', width: `${count * 31}%`, background: C.magenta}} />
          </div>
          <div style={{fontFamily: FONT, color: C.magenta, fontSize: 17, fontWeight: 800, marginTop: 7}}>速いが、ROMを大量に使う</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const PositionLimitScene: React.FC = () => {
  const frame = useCurrentFrame();
  const wanted = Math.floor(frame / 42) % 5;
  const actual = Math.floor(wanted / 4) * 4;
  const scale = 7;
  const gridWidth = 56 * scale;
  const gridHeight = 30 * scale;
  return (
    <AbsoluteFill style={{opacity: fade(frame, 300), backgroundColor: C.bg, padding: '38px 52px 0', boxSizing: 'border-box'}}>
      <Title size={42}>コンパイルドスプライトの欠点</Title>
      <div style={{fontFamily: FONT, color: C.white, fontSize: 25, fontWeight: 900, marginTop: 5}}>
        欠点2：そのままでは4×2ドット単位でしか動かせない
      </div>

      <div style={{display: 'flex', gap: 55, alignItems: 'center', marginTop: 31}}>
        <div style={{width: 650, height: 430, display: 'grid', placeItems: 'center', background: C.panel, border: '1px solid #3a3741'}}>
          <div style={{position: 'relative', width: gridWidth + 48, height: gridHeight + 48}}>
            <div style={{position: 'absolute', left: 24, top: 24, width: gridWidth, height: gridHeight, overflow: 'visible'}}>
              <Img
                src={staticFile('enemy_em0_00.png')}
                style={{
                  position: 'absolute', left: actual * scale, top: 0, width: 55 * scale, height: 30 * scale,
                  maxWidth: 'none', imageRendering: 'pixelated', zIndex: 1,
                }}
              />
              <Img
                src={staticFile('enemy_em0_00.png')}
                style={{
                  position: 'absolute', left: wanted * scale, top: 0, width: 55 * scale, height: 30 * scale,
                  maxWidth: 'none', imageRendering: 'pixelated', zIndex: 2, opacity: wanted === actual ? 0 : 0.42,
                  filter: 'sepia(1) saturate(8) hue-rotate(275deg) brightness(1.4)',
                }}
              />
              <div
                style={{
                  position: 'absolute', inset: 0, zIndex: 3, border: `2px solid ${C.cyan}`,
                  backgroundImage: `linear-gradient(to right, ${C.cyan}88 1px, transparent 1px), linear-gradient(to bottom, ${C.cyan}88 1px, transparent 1px)`,
                  backgroundSize: `${4 * scale}px ${2 * scale}px`, pointerEvents: 'none',
                }}
              />
            </div>
          </div>
        </div>

        <div style={{width: 440}}>
          <div style={{fontFamily: MONO, color: C.cyan, fontSize: 21, fontWeight: 900}}>1 BYTE = 4 × 2 DOTS</div>
          <div style={{marginTop: 27, padding: '20px 22px', background: C.panel, borderLeft: `5px solid ${C.magenta}`}}>
            <div style={{fontFamily: FONT, color: C.dim, fontSize: 18}}>動かしたい位置</div>
            <div style={{fontFamily: MONO, color: C.magenta, fontSize: 38, fontWeight: 900, marginTop: 5}}>＋{wanted} DOT</div>
          </div>
          <div style={{marginTop: 15, padding: '20px 22px', background: C.panel, borderLeft: `5px solid ${C.cyan}`}}>
            <div style={{fontFamily: FONT, color: C.dim, fontSize: 18}}>実際に描ける位置</div>
            <div style={{fontFamily: MONO, color: C.cyan, fontSize: 38, fontWeight: 900, marginTop: 5}}>＋{actual} DOT</div>
          </div>
          <div style={{fontFamily: FONT, color: C.white, fontSize: 24, fontWeight: 900, lineHeight: 1.45, marginTop: 25}}>
            1ドットずつ滑らかに<br />動かすことができない
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
  const gridWidth = 56 * scale;
  const gridHeight = 30 * scale;
  const padding = 10;
  return (
    <div style={{position: 'relative', width: gridWidth + padding * 2 + 3 * scale, height: gridHeight + padding * 2 + scale}}>
      <div style={{position: 'absolute', left: padding, top: padding, width: gridWidth, height: gridHeight, overflow: 'visible'}}>
        <Img
          src={staticFile('enemy_em0_00.png')}
          style={{
            position: 'absolute', left: xShift * scale, top: yShift * scale,
            width: 55 * scale, height: 30 * scale, maxWidth: 'none', imageRendering: 'pixelated', zIndex: 1,
          }}
        />
        <div
          style={{
            position: 'absolute', inset: 0, zIndex: 2,
            border: `2px solid ${active ? C.orange : C.cyan}`,
            backgroundImage: `linear-gradient(to right, ${active ? C.orange : C.cyan}99 1px, transparent 1px), linear-gradient(to bottom, ${active ? C.orange : C.cyan}99 1px, transparent 1px)`,
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
            SELECT X{xShift} / Y{parity}
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
                  <div style={{fontFamily: MONO, color: active ? C.orange : C.dim, fontSize: 14, fontWeight: 900}}>
                    X{i % 4} / Y{Math.floor(i / 4)}
                  </div>
                  <AlignedEnemyGrid scale={2} xShift={i % 4} yShift={Math.floor(i / 4)} active={active} />
                  <div style={{width: 96, marginTop: 2}}><CodeStripes color={active ? C.orange : C.magenta} lines={3} /></div>
                </div>
              );
            })}
          </div>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, padding: '15px 18px', borderTop: `2px solid ${C.magenta}`, borderBottom: `2px solid ${C.magenta}`}}>
            <div style={{fontFamily: FONT, color: C.white, fontSize: 23, fontWeight: 900}}>1枚の絵に8本のプログラム</div>
            <div style={{fontFamily: MONO, color: C.magenta, fontSize: 31, fontWeight: 900}}>ROM × 8</div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const SizeBankScene: React.FC = () => {
  const frame = useCurrentFrame();
  const chosen = 15 - (Math.floor(frame / 13) % 16);
  const progress = interpolate(frame, [0, 240], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{opacity: fade(frame, 240), backgroundColor: C.bg, padding: '45px 55px', boxSizing: 'border-box'}}>
      <Eyebrow>16 SIZES × 8 ALIGNMENTS</Eyebrow>
      <div style={{height: 8}} />
      <Title size={42}>拡大するのではなく、128本から選ぶ</Title>
      <div style={{display: 'flex', gap: 38, marginTop: 35, alignItems: 'stretch'}}>
        <div style={{width: 770, display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 10}}>
          {Array.from({length: 16}).map((_, i) => {
            const visible = i / 16 <= progress;
            const active = i === chosen;
            return (
              <div
                key={i}
                style={{
                  height: 130,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 5px 7px',
                  boxSizing: 'border-box',
                  background: active ? `${C.magenta}22` : C.panel,
                  border: `2px solid ${active ? C.magenta : '#34313c'}`,
                  opacity: visible ? 1 : 0.08,
                  transform: `scale(${active ? 1.08 : 1})`,
                }}
              >
                <Img
                  src={staticFile(`tree/Tree0_${String(i).padStart(2, '0')}.png`)}
                  style={{maxWidth: 76, maxHeight: 94, imageRendering: 'pixelated'}}
                />
                <div style={{fontFamily: MONO, color: active ? C.magenta : C.dim, fontSize: 13}}>SIZE {i}</div>
              </div>
            );
          })}
        </div>
        <div style={{flex: 1, border: '1px solid #34313c', background: C.panel, padding: 25}}>
          <div style={{fontFamily: MONO, fontSize: 16, color: C.cyan}}>PRG BANK</div>
          <div style={{fontFamily: FONT, color: C.white, fontSize: 30, fontWeight: 900, marginTop: 8}}>8 KB</div>
          <div style={{height: 22}} />
          {Array.from({length: 8}).map((_, i) => (
            <div
              key={i}
              style={{
                height: 30,
                marginBottom: 8,
                width: `${75 + (i % 3) * 10}%`,
                background: i < Math.floor(progress * 9) ? (i % 2 ? C.magenta : C.cyan) : '#292631',
              }}
            />
          ))}
          <div style={{fontFamily: FONT, color: C.dim, fontSize: 18, lineHeight: 1.5, marginTop: 16}}>
            実行時の計算を減らし、<br />ROM容量へ移す
          </div>
        </div>
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
      <Sequence from={0} durationInFrames={240}>
        <IntroScene />
      </Sequence>
      <Sequence from={240} durationInFrames={210}>
        <PreviousScene />
      </Sequence>
      <Sequence from={450} durationInFrames={720}>
        <LargeCharacterScene />
      </Sequence>
      <Sequence from={1170} durationInFrames={300}>
        <GenericLoopScene />
      </Sequence>
      <Sequence from={1470} durationInFrames={360}>
        <CompiledScene />
      </Sequence>
      <Sequence from={1830} durationInFrames={390}>
        <RaceScene />
      </Sequence>
      <Sequence from={2220} durationInFrames={360}>
        <CapacityCostScene />
      </Sequence>
      <Sequence from={2580} durationInFrames={300}>
        <PositionLimitScene />
      </Sequence>
      <Sequence from={2880} durationInFrames={360}>
        <AlignmentScene />
      </Sequence>
      <Sequence from={3240} durationInFrames={240}>
        <SizeBankScene />
      </Sequence>
      <Sequence from={3480} durationInFrames={180}>
        <DayOneScene />
      </Sequence>
      <Sequence from={3660} durationInFrames={180}>
        <CurrentReturnScene />
      </Sequence>
    </AbsoluteFill>
  );
};
