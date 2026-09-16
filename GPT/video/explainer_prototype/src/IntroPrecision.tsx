import React from 'react';
import {OffthreadVideo,staticFile,useCurrentFrame} from 'remotion';
import manifest from '../narration/intro-review-cuts.json';
import alignment from './introReviewAlignment.json';
import cues from './introBitCues.json';
const cyan='#53dcff',orange='#ffba57';
const Text=({x,y,children,size=24,color='#f7f4f8'}:{x:number;y:number;children:React.ReactNode;size?:number;color?:string})=><div style={{position:'absolute',left:x,top:y,fontSize:size,lineHeight:1.4,color,whiteSpace:'pre-line'}}>{children}</div>;
export function BitWidthIntro(){
  const t=(useCurrentFrame()-(manifest.cuts[8].narrationLeadFrames??0))/30;
  const reveal=(at:number)=>Math.max(0,Math.min(1,(t-at)/.25));
  return <>
    <Text x={46} y={35} size={42}>座標計算を16bitから8bitへ</Text>
    <Text x={46} y={101} size={23} color={cyan}>必要な範囲・精度に合わせて、CPUの処理を軽くする</Text>
    <div style={{position:'absolute',left:46,top:173,width:548,height:360,background:'#17141b',border:`3px solid ${orange}`,opacity:reveal(cues.sixteen-.3)}}>
      <Text x={28} y={20} size={60} color={orange}>16bit</Text>
      <Text x={28} y={104} size={38}>0 〜 65,535</Text>
      <Text x={28} y={168} size={25} color={orange}>広い範囲・高い精度</Text>
      <div style={{position:'absolute',left:28,top:225,display:'flex',gap:12}}>{['上位8bit','下位8bit'].map(v=><div key={v} style={{width:222,padding:'9px 0',border:`1px solid ${orange}`,textAlign:'center',fontSize:24}}>{v}</div>)}</div>
      <div style={{opacity:reveal(cues.cost)}}><Text x={28} y={295} size={23}>8bit CPUでは、処理の負荷が高い</Text></div>
    </div>
    <div style={{position:'absolute',left:686,top:173,width:548,height:360,background:'#10202a',border:`3px solid ${cyan}`,opacity:reveal(cues.cost-.3)}}>
      <Text x={28} y={20} size={60} color={cyan}>8bit</Text>
      <Text x={28} y={104} size={38}>0 〜 255</Text>
      <Text x={28} y={168} size={25} color={cyan}>計算が軽い</Text>
      <div style={{position:'absolute',left:28,top:225,width:222,padding:'9px 0',border:`1px solid ${cyan}`,textAlign:'center',fontSize:24}}>8bitで1まとまり</div>
      <Text x={28} y={295} size={23}>ほとんどの座標計算を8bitへ</Text>
    </div>
    <div style={{opacity:reveal(cues.eight-.3)}}><Text x={612} y={310} size={44} color={cyan}>→</Text></div>
    <div style={{position:'absolute',left:130,top:579,width:1020,padding:'19px 0',borderTop:`2px solid ${cyan}`,borderBottom:`2px solid ${cyan}`,textAlign:'center',fontSize:27,opacity:reveal(cues.eight-.3)}}>16bitを必要な場所だけに限定 → 8bit CPUで高速化</div>
    <Text x={46} y={681} size={16} color="#aaa2af">数値範囲は符号なし整数の場合。</Text>
  </>;
}
export function BackgroundPrecisionIntro(){
  const t=(useCurrentFrame()-(manifest.cuts[9].narrationLeadFrames??0))/30;
  const final=t>=(alignment.C10.starts[3]??Infinity);
  return <>
    <OffthreadVideo src={staticFile('game_CSCD.mp4')} startFrom={17*30} muted style={{position:'absolute',left:160,top:0,width:960,height:720,objectFit:'fill',imageRendering:'pixelated'}}/>
    <div style={{position:'absolute',left:180,top:26,padding:'12px 18px',background:'#050507e8',borderLeft:`6px solid ${orange}`,fontSize:29,fontWeight:700}}>背景オブジェクトのX座標だけ16bit</div>
    <div style={{position:'absolute',left:180,bottom:28,padding:'13px 18px',background:'#050507e8',borderLeft:`5px solid ${final?cyan:orange}`,fontSize:25,color:final?cyan:'#f7f4f8'}}>{final?'ほかの座標計算は、8bitに収まる形へ':'奥ではプレイヤーの左右移動へ滑らかに追従'}</div>
  </>;
}
