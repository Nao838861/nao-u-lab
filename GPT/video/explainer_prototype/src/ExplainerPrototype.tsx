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

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

const fade = (frame: number, duration: number) =>
  interpolate(frame, [0, 12, duration - 12, duration], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

const Eyebrow: React.FC<{children: React.ReactNode; color?: string}> = ({
  children,
  color = C.magenta,
}) => (
  <div
    style={{
      color,
      fontFamily: MONO,
      fontWeight: 800,
      fontSize: 19,
      letterSpacing: 4,
      textTransform: 'uppercase',
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

const Caption: React.FC<{children: React.ReactNode; accent?: string}> = ({
  children,
  accent = C.white,
}) => (
  <div
    style={{
      position: 'absolute',
      left: 54,
      right: 54,
      bottom: 28,
      padding: '18px 26px 20px',
      background: 'rgba(5,5,7,.88)',
      borderLeft: `5px solid ${accent}`,
      color: C.white,
      fontFamily: FONT,
      fontWeight: 700,
      fontSize: 27,
      lineHeight: 1.45,
      boxShadow: '0 12px 40px rgba(0,0,0,.5)',
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
      <Caption accent={C.magenta}>絵を「画像データ」ではなく「描画するプログラム」に変える。</Caption>
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
      <Caption accent={C.cyan}>
        1画面を白黒のビットマップとして扱う仕組みは、前回の動画で。
      </Caption>
    </AbsoluteFill>
  );
};

const GenericLoopScene: React.FC = () => {
  const frame = useCurrentFrame();
  const scan = clamp(Math.floor(interpolate(frame, [20, 280], [0, 64])), 0, 63);
  const done = scan + 1;
  const steps = ['1バイト読む', '透明か判定', '描画先を計算', '画面へ書く'];
  const active = Math.floor(frame / 11) % steps.length;
  return (
    <AbsoluteFill
      style={{
        opacity: fade(frame, 300),
        background: `radial-gradient(circle at 24% 45%, ${C.cyan}12, transparent 35%), ${C.bg}`,
        padding: '50px 58px',
        boxSizing: 'border-box',
      }}
    >
      <Eyebrow color={C.cyan}>一般的なソフトウェア描画</Eyebrow>
      <div style={{height: 10}} />
      <Title size={43}>画像を読みながら、同じ処理を繰り返す</Title>
      <div style={{display: 'flex', alignItems: 'center', gap: 72, marginTop: 42}}>
        <GridSprite size={37} revealed={done} cursor={scan} bright={C.cyan} />
        <div style={{flex: 1}}>
          {steps.map((step, i) => (
            <div
              key={step}
              style={{
                marginBottom: 15,
                padding: '17px 22px',
                border: `2px solid ${i === active ? C.cyan : '#34313c'}`,
                background: i === active ? `${C.cyan}18` : C.panel,
                color: i === active ? C.white : C.dim,
                fontFamily: FONT,
                fontSize: 28,
                fontWeight: 800,
                transform: `translateX(${i === active ? 12 : 0}px)`,
              }}
            >
              <span style={{color: C.cyan, fontFamily: MONO, marginRight: 18}}>
                0{i + 1}
              </span>
              {step}
            </div>
          ))}
          <div style={{color: C.dim, fontFamily: MONO, fontSize: 19, marginTop: 24}}>
            LOOP {String(done).padStart(2, '0')} / 64
          </div>
        </div>
      </div>
      <Caption accent={C.cyan}>透明な場所でも、「読む・調べる・進める」は必要。</Caption>
    </AbsoluteFill>
  );
};

const CompiledScene: React.FC = () => {
  const frame = useCurrentFrame();
  const active = clamp(Math.floor(interpolate(frame, [30, 330], [0, filled.length])), 0, filled.length - 1);
  const activePixel = filled[active];
  const reveal = activePixel ? activePixel.y * 8 + activePixel.x + 1 : 0;
  const code = [
    'LDA #$3C',
    'STA (dst),Y',
    'LDA #$7E',
    'STA (dst),Y',
    'ORA (edge),Y',
    'STA (dst),Y',
  ];
  return (
    <AbsoluteFill
      style={{
        opacity: fade(frame, 360),
        background: `radial-gradient(circle at 76% 50%, ${C.magenta}18, transparent 36%), ${C.bg}`,
        padding: '46px 58px',
        boxSizing: 'border-box',
      }}
    >
      <Eyebrow>COMPILED SPRITE</Eyebrow>
      <div style={{height: 10}} />
      <Title size={44}>この絵だけを描く、専用の6502プログラム</Title>
      <div style={{display: 'flex', gap: 56, alignItems: 'center', marginTop: 38}}>
        <div style={{position: 'relative'}}>
          <GridSprite
            size={37}
            revealed={reveal}
            cursor={activePixel ? activePixel.y * 8 + activePixel.x : -1}
            bright={C.white}
          />
          <div
            style={{
              position: 'absolute',
              top: '50%',
              right: -44,
              width: 44,
              height: 3,
              background: C.magenta,
              boxShadow: `0 0 18px ${C.magenta}`,
            }}
          />
        </div>
        <div style={{flex: 1, border: '1px solid #34313c', background: C.panel, padding: 24}}>
          <div style={{fontFamily: MONO, color: C.dim, fontSize: 16, marginBottom: 16}}>
            sprite_object_size_08_shift_3:
          </div>
          {code.map((line, i) => {
            const lit = i === active % code.length;
            return (
              <div
                key={`${line}-${i}`}
                style={{
                  padding: '10px 15px',
                  marginBottom: 7,
                  background: lit ? `${C.magenta}22` : 'transparent',
                  borderLeft: `4px solid ${lit ? C.magenta : 'transparent'}`,
                  color: lit ? C.white : '#706b77',
                  fontFamily: MONO,
                  fontWeight: 700,
                  fontSize: 25,
                }}
              >
                {line}
              </div>
            );
          })}
        </div>
      </div>
      <Caption accent={C.magenta}>透明部分の命令は、最初から作らない。</Caption>
    </AbsoluteFill>
  );
};

const RaceScene: React.FC = () => {
  const frame = useCurrentFrame();
  const generic = clamp(interpolate(frame, [20, 220], [0, 64]), 0, 64);
  const compiled = clamp(interpolate(frame, [20, 125], [0, filled.length]), 0, filled.length);
  const genericReveal = Math.floor(generic);
  const compiledPixel = filled[Math.min(filled.length - 1, Math.floor(compiled))];
  const compiledReveal = compiledPixel ? compiledPixel.y * 8 + compiledPixel.x + 1 : 0;
  return (
    <AbsoluteFill style={{opacity: fade(frame, 240), backgroundColor: C.bg, padding: '44px 56px', boxSizing: 'border-box'}}>
      <Title size={42} align="center">同じ絵でも、実行する仕事が違う</Title>
      <div style={{display: 'flex', justifyContent: 'space-around', marginTop: 45}}>
        <div style={{textAlign: 'center'}}>
          <Eyebrow color={C.cyan}>画像データ＋汎用ループ</Eyebrow>
          <div style={{height: 22}} />
          <GridSprite size={28} revealed={genericReveal} cursor={Math.min(63, genericReveal)} bright={C.cyan} />
          <div style={{marginTop: 22, width: 224, height: 12, background: '#22202a'}}>
            <div style={{height: '100%', width: `${(generic / 64) * 100}%`, background: C.cyan}} />
          </div>
        </div>
        <div style={{width: 1, background: '#34313c'}} />
        <div style={{textAlign: 'center'}}>
          <Eyebrow>絵を兼ねた専用コード</Eyebrow>
          <div style={{height: 22}} />
          <GridSprite size={28} revealed={compiledReveal} cursor={-1} bright={C.white} />
          <div style={{marginTop: 22, width: 224, height: 12, background: '#22202a'}}>
            <div style={{height: '100%', width: `${(compiled / filled.length) * 100}%`, background: C.magenta}} />
          </div>
        </div>
      </div>
      <Caption accent={C.magenta}>絵を描くプログラムそのものが、絵のデータを兼ねる。</Caption>
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
      <Caption accent={C.orange}>動かすたびに計算するのではなく、位置に合うコードを選ぶ。</Caption>
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
      <Caption accent={C.magenta}>速さを、ROM容量で買う。</Caption>
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
      <Caption accent={C.orange}>サイズ違い画像と再生コードは、最初から自動生成。</Caption>
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
      <Caption accent={C.magenta}>次は、地面・座標・敵の軌道をテーブルへ分解する。</Caption>
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
      <Sequence from={1110} durationInFrames={240}>
        <RaceScene />
      </Sequence>
      <Sequence from={1350} durationInFrames={300}>
        <AlignmentScene />
      </Sequence>
      <Sequence from={1650} durationInFrames={240}>
        <SizeBankScene />
      </Sequence>
      <Sequence from={1890} durationInFrames={180}>
        <DayOneScene />
      </Sequence>
      <Sequence from={2070} durationInFrames={180}>
        <CurrentReturnScene />
      </Sequence>
    </AbsoluteFill>
  );
};
