import React from 'react';
import {AbsoluteFill,OffthreadVideo,staticFile,useCurrentFrame,interpolate} from 'remotion';
import manifest from '../narration/intro-review-cuts.json';
import alignment from './introReviewAlignment.json';
import cues from './introClosingCues.json';

export function IntroClosing(){
 const frame=useCurrentFrame();
 const c=manifest.cuts[18];
 const t=(frame-(c.narrationLeadFrames??0))/30;
 const s=alignment.C19.starts;
 const ramp=(a:number,b:number)=>interpolate(t,[a,b],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
 const thanks=ramp(cues.thanksStart-.15,cues.thanksStart+.35);
 const summary=1-ramp(cues.bodyEnd,cues.bodyEnd+.4);
 const fade=interpolate(frame,[c.durationFrames-46,c.durationFrames-1],[1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
 const line=t<s[1]?'作り方と道具は進歩する':t<s[2]?'最適化の工夫 × AI':'昔のハードに、まだ新しい可能性';
 const at=t<s[1]?s[0]:t<s[2]?s[1]:s[2];
 return <AbsoluteFill style={{background:'#000',color:'#f7f4f8',fontFamily:'"Yu Gothic UI",sans-serif'}}>
  <AbsoluteFill style={{opacity:fade}}>
   <OffthreadVideo src={staticFile('game_CSCD.mp4')} startFrom={13*30} muted style={{position:'absolute',left:160,top:0,width:960,height:720,objectFit:'fill',imageRendering:'pixelated'}}/>
   <AbsoluteFill style={{opacity:summary,background:'linear-gradient(180deg,#000b,transparent 24%,transparent 68%,#000d)'}}>
    <div style={{position:'absolute',left:190,top:34,fontSize:38,fontWeight:800}}>まとめ</div>
    <div style={{position:'absolute',left:160,right:160,bottom:40,textAlign:'center',fontSize:34,fontWeight:800,opacity:ramp(at,at+.3),textShadow:'0 2px 8px #000'}}>{line}</div>
   </AbsoluteFill>
   <AbsoluteFill style={{opacity:thanks,display:'flex',justifyContent:'center',alignItems:'center',flexDirection:'column',background:'#0005'}}>
    <div style={{fontSize:46,fontWeight:800,textShadow:'0 3px 12px #000'}}>ご視聴ありがとうございました</div>
    <div style={{marginTop:24,fontSize:26,color:'#53dcff',textShadow:'0 2px 8px #000'}}>その2：CPUの最適化</div>
   </AbsoluteFill>
  </AbsoluteFill>
 </AbsoluteFill>;
}