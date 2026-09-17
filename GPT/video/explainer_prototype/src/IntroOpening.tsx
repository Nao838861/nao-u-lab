import React from 'react';
import {AbsoluteFill,OffthreadVideo,staticFile,spring,useCurrentFrame} from 'remotion';
const font='"Yu Gothic UI", "Hiragino Sans", system-ui, sans-serif';
const mono='"Consolas", "Courier New", monospace';

// 第一部IntroSceneの書体・太さ・位置・登場アニメを踏襲。
export function PartTwoTitle(){
 const enter=spring({frame:useCurrentFrame(),fps:30,config:{damping:18}});
 return <>
  <OffthreadVideo src={staticFile('game_CSCD.mp4')} muted startFrom={13*30} style={{width:'100%',height:'100%',objectFit:'cover',imageRendering:'pixelated'}}/>
  <AbsoluteFill style={{background:'linear-gradient(90deg, rgba(5,5,7,.55), transparent 42%, rgba(5,5,7,.12)), linear-gradient(0deg, rgba(5,5,7,.55), transparent 42%)'}}/>
  <div style={{position:'absolute',left:64,top:62,width:1152,fontFamily:font,transform:`translateY(${(1-enter)*34}px)`,opacity:enter}}>
   <div style={{fontFamily:mono,color:'#f552d2',fontWeight:800,fontSize:19,letterSpacing:4}}>FAMILY COMPUTER / 6502 / MMC5</div>
   <div style={{marginTop:18,color:'#f7f4f8',fontWeight:800,fontSize:51,lineHeight:1.22,letterSpacing:-1.5,whiteSpace:'nowrap'}}>ファミコンでスペースハリアーを動かすには？</div>
   <div style={{marginTop:13,color:'#f7f4f8',fontSize:34,lineHeight:1.25,fontWeight:900}}>その2：CPUの最適化</div>
  </div>
 </>;
}

export function OptimizationIntro({ai=false}:{ai?:boolean}){
 const enter=spring({frame:useCurrentFrame(),fps:30,config:{damping:18}});
 return <AbsoluteFill style={{background:'#050507',display:'grid',placeItems:'center'}}>
  <div style={{textAlign:'center',fontFamily:font,transform:`translateY(${(1-enter)*28}px)`,opacity:enter}}>
   <div style={{fontFamily:mono,color:'#f552d2',fontSize:104,lineHeight:1,fontWeight:900}}>{ai?'AI':'30fps'}</div>
   <div style={{marginTop:24,color:'#f7f4f8',fontSize:48,fontWeight:800,letterSpacing:-1.5}}>{ai?'AIの活用で、開発を効率化':'ファミコンで動かす、最適化の工夫'}</div>
  </div>
 </AbsoluteFill>;
}
