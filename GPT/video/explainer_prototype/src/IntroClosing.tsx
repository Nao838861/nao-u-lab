import React from 'react';
import {AbsoluteFill,OffthreadVideo,staticFile,useCurrentFrame,interpolate} from 'remotion';
import manifest from '../narration/intro-review-cuts.json';
import alignment from './introReviewAlignment.json';
import cues from './introClosingCues.json';

export function IntroClosing(){
 const frame=useCurrentFrame();
 const c=manifest.cuts[18];
 const seconds=(frame-(c.narrationLeadFrames??0))/30;
 const s=alignment.C19.starts;
 const enter=(at:number)=>interpolate(seconds,[at,at+.3],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
 const end=enter(s[3]-.3);
 const card=(at:number):React.CSSProperties=>({opacity:enter(at),transform:`translateY(${(1-enter(at))*12}px)`});
 return <AbsoluteFill style={{background:'#050507',color:'#f7f4f8',fontFamily:'"Yu Gothic UI",sans-serif'}}>
  <AbsoluteFill style={{opacity:1-end}}>
   <OffthreadVideo src={staticFile('game_CSCD.mp4')} startFrom={13*30} muted style={{position:'absolute',left:594,top:120,width:640,height:480,objectFit:'fill',imageRendering:'pixelated'}}/>
   <div style={{position:'absolute',left:46,top:36,fontSize:40,fontWeight:800}}>ファミコンで30fpsを実現する工夫</div>
   <div style={{position:'absolute',left:46,top:150,width:500}}>
    <div style={{...card(s[0]),borderLeft:'6px solid #53dcff',padding:'16px 20px',background:'#14171e',fontSize:30,fontWeight:800}}>計算をテーブルへ</div>
    <div style={{...card(cues.depth),marginTop:18,borderLeft:'6px solid #53dcff',padding:'16px 20px',background:'#14171e',fontSize:30,fontWeight:800}}>奥行きで処理を絞る</div>
    <div style={{...card(s[1]),marginTop:28,textAlign:'center'}}><div style={{fontSize:24}}>ゲームの特性に合わせて</div><div style={{fontSize:100,lineHeight:1.3,color:'#f552d2',fontWeight:900,fontFamily:'Consolas,monospace'}}>30fps</div></div>
   </div>
   <div style={{...card(s[2]),position:'absolute',left:46,right:46,top:622,padding:'16px 20px',background:'#151820',fontSize:29,textAlign:'center',fontWeight:800}}>人間：仕組みを考える <span style={{color:'#ffba57'}}>→</span> AI：実装・データ作成</div>
  </AbsoluteFill>
  <AbsoluteFill style={{opacity:end,display:'flex',justifyContent:'center',alignItems:'center',flexDirection:'column'}}>
   <div style={{fontSize:48,fontWeight:800}}>ご視聴ありがとうございました</div>
   <div style={{marginTop:24,fontSize:28,color:'#53dcff'}}>その2：CPUの最適化</div>
  </AbsoluteFill>
 </AbsoluteFill>;
}
