"""復元した時間配分図から、第二部のC11/C12用コンポーネントを分離する。"""
from pathlib import Path
root=Path(__file__).resolve().parents[1]
source=(root/'restored_cpu/src/ExplainerPrototype.tsx').read_text(encoding='utf-8')
scene=source[source.index('export const FrameTimelineScene:'):source.index('export const ProgrammingFlowScene:')]
scene=scene.replace('FrameTimelineScene','IntroTimeline').replace('eventFrames?: Record<number,number>','eventFrames?: Record<number,number>;summary?: boolean').replace('durationInFrames = 600,eventFrames','durationInFrames = 600,eventFrames,summary=false')
scene=scene.replace('=> interpolate(frame, [scaled(at)', '=> summary ? 1 : interpolate(frame, [scaled(at)')
scene=scene.replace('frame < scaled(532) ? 1 : 0.45 + 0.55', '!summary ? 1 : 0.18 + 0.82').replace('frame - scaled(532)','frame').replace('pulse && frame >= scaled(532)','pulse && summary')
scene=scene.replace('opacity: reveal(at) * (pulse ? logicPulse : 1)', 'opacity: reveal(at), backgroundColor: pulse && summary ? `rgba(98,223,131,${.07+.38*logicPulse})` : undefined')
scene=scene.replace('{sub ? <div', '{pulse && summary ? <div style={{position:"absolute",marginTop:67,fontSize:42,fontWeight:900,color:logic}}>8ms以内</div> : null}\n      {sub ? <div')
scene=scene.replace('通常VRAM更新','通常VRAM転送').replace('ExRAM更新','ExRAM転送')
scene=scene.replace('<br />ダブルバッファ','<br /><span style={{fontSize:11}}>（ダブルバッファ）</span>').replace('<br />シングルバッファ','<br /><span style={{fontSize:11}}>（シングルバッファ）</span>')
scene=scene.replace('<div style={{fontFamily: MONO, color: C.dim, fontSize: 9, marginTop: 4}}>1.79MHz換算</div>','')
scene=scene.replace('■ 通常VRAM</span>','■ 通常VRAM転送</span>').replace('■ ExRAM</span>','■ ExRAM転送</span>')
scene=scene.replace("fontSize: 18, fontWeight: 900, marginTop: 7", "fontSize: 15, fontWeight: 900, marginTop: 7")
scene=scene.replace('  return (\n    <AbsoluteFill', '''  if(summary)return <AbsoluteFill style={{background:C.bg,color:C.white,fontFamily:FONT}}>
    <div style={{position:'absolute',left:46,top:34,fontSize:40,fontWeight:800}}>ゲームの更新を8msに収める</div>
    <div style={{position:'absolute',left:110,top:136,transform:'scale(1.08)',transformOrigin:'top left'}}><Lane kind="A"/></div>
    <div style={{position:'absolute',left:558,top:136,width:672,height:504,overflow:'hidden',border:'2px solid #47434e'}}>
      <OffthreadVideo src={staticFile('game_CSCD.mp4')} startFrom={17*30} muted style={{width:'100%',height:'100%',objectFit:'fill',imageRendering:'pixelated'}}/>
    </div>
    <div style={{position:'absolute',left:558,top:655,fontSize:25,color:logic,fontWeight:900}}>様々な最適化を重ね、更新処理を8ms以内へ</div>
  </AbsoluteFill>;
  return (
    <AbsoluteFill''')
header='''import React from 'react';
import {AbsoluteFill,Img,OffthreadVideo,interpolate,staticFile,useCurrentFrame} from 'remotion';
const C={bg:'#050507',white:'#f7f4f8',dim:'#8c8792',panel:'#121118',magenta:'#f552d2',cyan:'#48d8ff',orange:'#ffb84a'};
const FONT='"Yu Gothic UI",sans-serif',MONO='"Consolas",monospace';
const Title=({size,children}:{size:number;children:React.ReactNode})=><div style={{fontFamily:FONT,color:C.white,fontSize:size,fontWeight:900}}>{children}</div>;
const fade=(frame:number,duration:number)=>interpolate(frame,[0,8,duration-8,duration],[0,1,1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
'''
(root/'src/IntroTimeline.tsx').write_text('\n'.join(line.rstrip() for line in (header+scene).splitlines()).rstrip()+'\n',encoding='utf-8')
