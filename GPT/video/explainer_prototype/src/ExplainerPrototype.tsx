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
          width: 850,
          transform: `translateY(${(1 - enter) * 34}px)`,
          opacity: enter,
        }}
      >
        <Eyebrow>FAMILY COMPUTER / 6502 / MMC5</Eyebrow>
        <div style={{height: 18}} />
        <Title size={58}>
          <div style={{whiteSpace: 'nowrap'}}>拡大機能のないファミコンで、</div>
          <div>奥行きをどう描く？</div>
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

const GenericLoopScene: React.FC = () => {
  const frame = useCurrentFrame();
  const done = clamp(Math.floor(interpolate(frame, [20, 285], [0, rasterBlocks.length])), 0, rasterBlocks.length);
  const cursor = rasterBlocks[Math.min(rasterBlocks.length - 1, done)];
  const category = enemyCoverage[cursor] ?? 0;
  const kinds = ['全面透明', '一部だけ描画', '全面上書き'];
  const steps = ['画像とマスクを読む', '画面の元の値を読む', '背景を残す（AND）', '絵を重ねる（OR）', '同じ場所へ書き戻す'];
  const genericCode = [
    'loop:',
    '  LDA (screen),Y',
    '  AND (mask),Y',
    '  ORA (image),Y',
    '  STA (screen),Y',
    '  INY',
    '  CPY #BYTES',
    '  BNE loop',
  ];
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
      <Eyebrow color={C.cyan} size={25}>一般的なソフトウェア描画</Eyebrow>
      <div style={{height: 10}} />
      <Title size={41}>すべての4×2ドットに、同じ合成処理を実行</Title>
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
            {genericCode.map((line) => (
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
      <Eyebrow size={25}>Compiled Sprite</Eyebrow>
      <div style={{height: 10}} />
      <Title size={39}>目的の絵を最速で書くための専用プログラムを実行</Title>
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
  const generic = clamp(Math.floor(interpolate(frame, [20, 270], [0, rasterBlocks.length])), 0, rasterBlocks.length);
  const compiled = clamp(Math.floor(interpolate(frame, [20, 145], [0, drawableBlocks.length])), 0, drawableBlocks.length);
  const genericCursor = generic < rasterBlocks.length ? rasterBlocks[generic] : -1;
  const compiledCursor = compiled < drawableBlocks.length ? drawableBlocks[compiled] : -1;
  return (
    <AbsoluteFill style={{opacity: fade(frame, 300), backgroundColor: C.bg, padding: '40px 48px', boxSizing: 'border-box'}}>
      <Title size={41} align="center">同じ絵でも、実行する処理の量が違う</Title>
      <div style={{display: 'flex', justifyContent: 'space-around', marginTop: 40}}>
        <div style={{textAlign: 'center'}}>
          <Eyebrow color={C.cyan}>普通の描画</Eyebrow>
          <div style={{height: 17}} />
          <PackedEnemy scale={6} processedCount={generic} cursor={genericCursor} />
          <div style={{marginTop: 18, width: 330, height: 12, background: '#22202a'}}>
            <div style={{height: '100%', width: `${(generic / rasterBlocks.length) * 100}%`, background: C.cyan}} />
          </div>
          <div style={{fontFamily: FONT, fontWeight: 800, color: C.dim, fontSize: 18, marginTop: 13}}>
            毎回：読む → AND → OR → 書く
          </div>
        </div>
        <div style={{width: 1, background: '#34313c'}} />
        <div style={{textAlign: 'center'}}>
          <Eyebrow>COMPILED SPRITE</Eyebrow>
          <div style={{height: 17}} />
          <PackedEnemy
            scale={6}
            order={drawableBlocks}
            processedCount={compiled}
            cursor={compiledCursor}
            showTransparent
          />
          <div style={{marginTop: 18, width: 330, height: 12, background: '#22202a'}}>
            <div style={{height: '100%', width: `${(compiled / drawableBlocks.length) * 100}%`, background: C.magenta}} />
          </div>
          <div style={{fontFamily: FONT, fontWeight: 800, color: C.white, fontSize: 18, marginTop: 13}}>
            透明は省略・全面は直接書く
          </div>
        </div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 27, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 28, color: C.white}}>
        絵に必要な処理だけを実行する
      </div>
    </AbsoluteFill>
  );
};

const AlignmentScene: React.FC = () => {
  const frame = useCurrentFrame();
  const index = Math.floor(frame / 35) % 8;
  const xShift = index % 4;
  const parity = Math.floor(index / 4);
  return (
    <AbsoluteFill
      style={{
        opacity: fade(frame, 300),
        background: `linear-gradient(120deg, ${C.bg}, ${C.panel})`,
        padding: '48px 60px',
        boxSizing: 'border-box',
      }}
    >
      <Eyebrow color={C.orange}>1ドット単位で動かすための位置違い</Eyebrow>
      <div style={{height: 10}} />
      <Title size={42}>横4通り × 縦2通り ＝ 8本の専用コード</Title>
      <div style={{display: 'flex', gap: 70, alignItems: 'center', marginTop: 44}}>
        <div
          style={{
            width: 455,
            height: 360,
            display: 'grid',
            placeItems: 'center',
            border: '1px solid #34313c',
            background:
              'linear-gradient(#25222c 1px, transparent 1px), linear-gradient(90deg, #25222c 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        >
          <GridSprite size={24} shiftX={xShift * 7} shiftY={parity * 12} bright={C.white} showGrid={false} />
        </div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 128px)', gap: 12}}>
          {Array.from({length: 8}).map((_, i) => (
            <div
              key={i}
              style={{
                height: 105,
                display: 'grid',
                placeItems: 'center',
                border: `2px solid ${i === index ? C.orange : '#393641'}`,
                background: i === index ? `${C.orange}20` : C.panel,
                color: i === index ? C.white : C.dim,
                fontFamily: MONO,
                fontWeight: 800,
                fontSize: 17,
                boxShadow: i === index ? `0 0 24px ${C.orange}33` : undefined,
              }}
            >
              X{i % 4} / Y{Math.floor(i / 4)}
            </div>
          ))}
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
      <Sequence from={450} durationInFrames={300}>
        <GenericLoopScene />
      </Sequence>
      <Sequence from={750} durationInFrames={360}>
        <CompiledScene />
      </Sequence>
      <Sequence from={1110} durationInFrames={300}>
        <RaceScene />
      </Sequence>
      <Sequence from={1410} durationInFrames={300}>
        <AlignmentScene />
      </Sequence>
      <Sequence from={1710} durationInFrames={240}>
        <SizeBankScene />
      </Sequence>
      <Sequence from={1950} durationInFrames={180}>
        <DayOneScene />
      </Sequence>
      <Sequence from={2130} durationInFrames={180}>
        <CurrentReturnScene />
      </Sequence>
    </AbsoluteFill>
  );
};
