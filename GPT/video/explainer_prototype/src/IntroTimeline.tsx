import React from 'react';
import {AbsoluteFill,Img,OffthreadVideo,interpolate,staticFile,useCurrentFrame} from 'remotion';
const C={bg:'#050507',white:'#f7f4f8',dim:'#8c8792',panel:'#121118',magenta:'#f552d2',cyan:'#48d8ff',orange:'#ffb84a'};
const FONT='"Yu Gothic UI",sans-serif',MONO='"Consolas",monospace';
const Title=({size,children}:{size:number;children:React.ReactNode})=><div style={{fontFamily:FONT,color:C.white,fontSize:size,fontWeight:900}}>{children}</div>;
const fade=(frame:number,duration:number)=>interpolate(frame,[0,8,duration-8,duration],[0,1,1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
export const IntroTimeline: React.FC<{durationInFrames?: number;eventFrames?: Record<number,number>;summary?: boolean}> = ({durationInFrames = 600,eventFrames,summary=false}) => {
  const frame = useCurrentFrame();
  const timingScale = durationInFrames / 600;
  const scaled = (at: number) => eventFrames?.[at] ?? Math.round(at * timingScale);
  const reveal = (at: number) => summary ? 1 : interpolate(frame, [scaled(at), scaled(at) + 12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const cpu = C.magenta;
  const logic = '#62df83';
  const normalVram = C.cyan;
  const exram = C.orange;
  const logicPulse = !summary ? 1 : 0.18 + 0.82 * ((Math.sin(((frame) / 30) * Math.PI * 2) + 1) / 2);
  const Block: React.FC<{label: string; sub?: string; color: string; height: number; at: number; pulse?: boolean}> = ({label, sub, color, height, at, pulse = false}) => (
    <div style={{height, boxSizing: 'border-box', padding: '5px 9px', background: `${color}20`, borderLeft: `7px solid ${color}`, opacity: reveal(at), backgroundColor: pulse && summary ? `rgba(98,223,131,${.07+.38*logicPulse})` : undefined, boxShadow: pulse && summary ? `0 0 18px ${color}66` : 'none'}}>
      <div style={{fontFamily: FONT, color: C.white, fontSize: 14, lineHeight: 1.2, fontWeight: 900}}>{label}</div>
      {pulse && summary ? <div style={{position:"absolute",marginTop:67,fontSize:42,fontWeight:900,color:logic}}>8ms以内</div> : null}
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
            <div style={{position: 'absolute', left: 11, top: 51, fontFamily: FONT, color: isA ? normalVram : exram, fontSize: 13, lineHeight: 1.25, fontWeight: 900}}>{isA ? <>通常VRAM転送　約3.4ms<br /><span style={{fontSize:11}}>（ダブルバッファ）</span></> : <>ExRAM転送　約3.4ms<br /><span style={{fontSize:11}}>（シングルバッファ）</span></>}</div>
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
  if(summary)return <AbsoluteFill style={{background:C.bg,color:C.white,fontFamily:FONT}}>
    <div style={{position:'absolute',left:46,top:34,fontSize:40,fontWeight:800}}>ゲームの更新を8msに収める</div>
    <div style={{position:'absolute',left:110,top:136,transform:'scale(1.08)',transformOrigin:'top left'}}><Lane kind="A"/></div>
    <div style={{position:'absolute',left:558,top:136,width:672,height:504,overflow:'hidden',border:'2px solid #47434e'}}>
      <OffthreadVideo src={staticFile('game_CSCD.mp4')} startFrom={17*30} muted style={{width:'100%',height:'100%',objectFit:'fill',imageRendering:'pixelated'}}/>
    </div>
    <div style={{position:'absolute',left:558,top:655,fontSize:25,color:logic,fontWeight:900}}>様々な最適化を重ね、更新処理を8ms以内へ</div>
  </AbsoluteFill>;
  return (
    <AbsoluteFill style={{opacity: fade(frame, durationInFrames), backgroundColor: C.bg, padding: '34px 42px 0', boxSizing: 'border-box'}}>
      <Title size={38}>30fpsで動かすため、処理を2フレームに分ける</Title>
      <div style={{fontFamily: MONO, color: C.dim, fontSize: 15, fontWeight: 900, marginTop: 7}}>1 FRAME = 16.7ms　／　同じ長さの2フレームを交互に実行</div>
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

          </div>
        </div>
      </div>
      <div style={{position: 'absolute', right: 46, top: 84, display: 'flex', gap: 16, fontFamily: FONT, fontSize: 13, fontWeight: 900}}>
        <span style={{color: cpu}}>■ 描画</span><span style={{color: logic}}>■ ゲームロジック</span><span style={{color: normalVram}}>■ 通常VRAM転送</span><span style={{color: exram}}>■ ExRAM転送</span>
      </div>
    </AbsoluteFill>
  );
};
