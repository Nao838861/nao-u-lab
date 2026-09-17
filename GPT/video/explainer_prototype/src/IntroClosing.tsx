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
 const window=(a:number,b:number)=>ramp(a,a+.3)*(1-ramp(b-.25,b));
 const reveal=(a:number):React.CSSProperties=>({opacity:ramp(a,a+.3),transform:`translateY(${12*(1-ramp(a,a+.3))}px)`});
 const body=1-ramp(cues.bodyEnd,cues.bodyEnd+.4);
 const thanks=ramp(cues.thanksStart-.15,cues.thanksStart+.35);
 const fade=interpolate(frame,[c.durationFrames-46,c.durationFrames-1],[1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
 const shade=(.68-.22*ramp(cues.result,cues.result+.4))*body;
 const card=(a:number,color:string):React.CSSProperties=>({...reveal(a),width:470,padding:'26px 30px',boxSizing:'border-box',background:'#090b12d9',borderTop:`6px solid ${color}`,boxShadow:'0 12px 30px #0006'});
 return <AbsoluteFill style={{background:'#000',color:'#f7f4f8',fontFamily:'"Yu Gothic UI",sans-serif'}}>
  <AbsoluteFill style={{opacity:fade}}>
   <OffthreadVideo src={staticFile('game_CSCD.mp4')} startFrom={13*30} muted style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',objectPosition:'center bottom',imageRendering:'pixelated'}}/>
   <AbsoluteFill style={{background:'#020207',opacity:shade}}/>
   <div style={{position:'absolute',left:54,top:36,fontSize:29,fontWeight:900,opacity:body,letterSpacing:2}}>まとめ<span style={{color:'#f552d2',fontSize:17,marginLeft:18,letterSpacing:5}}>SUMMARY</span></div>
   <AbsoluteFill style={{opacity:window(-.6,1.05),display:'grid',placeItems:'center'}}>
    <div style={{textAlign:'center'}}><div style={{fontSize:68,fontWeight:900}}>まとめ</div><div style={{width:160,height:5,background:'#f552d2',margin:'20px auto'}}/></div>
   </AbsoluteFill>
   <AbsoluteFill style={{opacity:window(1,s[1]),display:'flex',justifyContent:'center',alignItems:'center',flexDirection:'column'}}>
    <div style={{fontSize:43,fontWeight:800}}>ハードの性能は変わらない</div>
    <div style={{...reveal(cues.tools),fontSize:53,fontWeight:900,color:'#f552d2',marginTop:28}}>作り方と道具は、進歩する</div>
   </AbsoluteFill>
   <AbsoluteFill style={{opacity:window(s[1],s[2]),padding:'118px 64px',boxSizing:'border-box'}}>
    <div style={{fontSize:37,fontWeight:900}}>今回、組み合わせたもの</div>
    <div style={{display:'flex',gap:26,alignItems:'stretch',justifyContent:'center',marginTop:35}}>
     <div style={card(cues.optimization,'#53dcff')}><div style={{fontSize:34,fontWeight:900,color:'#53dcff'}}>最適化の工夫</div><div style={{fontSize:26,lineHeight:1.65,marginTop:18}}>計算・敵の動きをテーブル化<br/>奥行きで描画・判定を効率化</div></div>
     <div style={{...reveal(cues.ai),alignSelf:'center',fontSize:60,fontWeight:900,color:'#ffba57'}}>×</div>
     <div style={card(cues.ai,'#ffba57')}><div style={{fontSize:34,fontWeight:900,color:'#ffba57'}}>AIの活用</div><div style={{fontSize:26,lineHeight:1.65,marginTop:18}}>C言語からアセンブラへ<br/>敵の軌跡データを作成</div></div>
    </div>
    <div style={{...reveal(cues.result),textAlign:'center',marginTop:46,fontSize:39,fontWeight:900,textShadow:'0 3px 12px #000'}}>ファミコンでスペースハリアーを実現</div>
   </AbsoluteFill>
   <AbsoluteFill style={{opacity:ramp(s[2],s[2]+.3)*body,display:'flex',justifyContent:'center',alignItems:'center',flexDirection:'column',textShadow:'0 3px 12px #000'}}>
    <div style={{fontSize:37,fontWeight:800}}>昔のハード <span style={{color:'#ffba57'}}>×</span> 今の知識・道具</div>
    <div style={{...reveal(cues.possibility),fontSize:47,fontWeight:900,color:'#53dcff',marginTop:32}}>まだまだ、新しい可能性を引き出せる</div>
   </AbsoluteFill>
   <AbsoluteFill style={{opacity:thanks,display:'flex',justifyContent:'center',alignItems:'center',flexDirection:'column',background:'#0005'}}>
    <div style={{fontSize:46,fontWeight:800,textShadow:'0 3px 12px #000'}}>ご視聴ありがとうございました</div>
    <div style={{marginTop:24,fontSize:26,color:'#53dcff',textShadow:'0 2px 8px #000'}}>その2：CPUの最適化</div>
   </AbsoluteFill>
  </AbsoluteFill>
 </AbsoluteFill>;
}