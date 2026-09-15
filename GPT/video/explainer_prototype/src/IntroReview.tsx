import React from 'react';
import {AbsoluteFill,Audio,Img,OffthreadVideo,Sequence,staticFile,useCurrentFrame,useVideoConfig} from 'remotion';
import {CoordinateTransformScene,FrameFrameworkIntroScene} from '../restored_cpu/src/ExplainerPrototype';
import manifest from '../narration/intro-review-cuts.json';
import tree from './introTreeData.json';

const bg='#050507',white='#f7f4f8',cyan='#53dcff',gold='#ffba57';
export const introReviewDuration=manifest.cuts.reduce((n,c)=>n+c.durationFrames,0);
const Text=({x,y,children,size=24,color=white}:{x:number;y:number;children:React.ReactNode;size?:number;color?:string})=><div style={{position:'absolute',left:x,top:y,fontSize:size,color,lineHeight:1.4,whiteSpace:'pre-line'}}>{children}</div>;
export const treePosition=(z:number)=>({x:370+50*tree.scale[z]/256*3,y:100+(tree.groundY[z]-60)*8,size:tree.size[z]});

function TreeProjection({duration}:{duration:number}){
  const frame=useCurrentFrame(),{fps}=useVideoConfig();
  const motionFrames=Math.max(1,duration-1.2*fps);
  const progress=Math.max(0,Math.min(1,(frame-.3*fps)/motionFrames));
  const z=Math.min(55,Math.floor(progress*56));
  const p=treePosition(z),im=tree.images[p.size];
  const points=Array.from({length:56},(_,k)=>treePosition(k));
  return <>
    <Text x={42} y={26} size={38}>奥行きで、位置と絵を選ぶ</Text>
    <Text x={44} y={83} size={23} color={cyan}>奥へ行くほど消失点へ。小さい絵へ切り替える。</Text>
    <div style={{position:'absolute',left:42,top:131,width:810,height:420,overflow:'hidden',border:'1px solid #3b3b49',background:'#060a11'}}>
      <svg width={810} height={420} style={{position:'absolute'}}>
        <defs><linearGradient id="ground" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0e1a21"/><stop offset="1" stopColor="#162b2d"/></linearGradient></defs>
        <rect x={0} y={100} width={810} height={320} fill="url(#ground)"/>
        {[-1000,-400,0,240,500,810,1300,1850].map(x=><line key={x} x1={370} y1={100} x2={x} y2={420} stroke="#345454"/>)}
        {[103,110,124,150,198,282,410].map(y=><line key={y} x1={0} y1={y} x2={810} y2={y} stroke="#345454"/>)}
        <line x1={0} y1={100} x2={810} y2={100} stroke={cyan} strokeOpacity={.55}/>
        <polyline points={points.map(q=>`${q.x},${q.y}`).join(' ')} fill="none" stroke={gold} strokeWidth={2} strokeDasharray="5 7" opacity={.75}/>
        <circle cx={370} cy={100} r={5} fill={cyan}/>
        <ellipse cx={p.x} cy={p.y+2} rx={Math.max(4,im.w*1.6)} ry={Math.max(2,im.w*.19)} fill="#000" opacity={.55}/>
      </svg>
      <Text x={310} y={53} size={20} color={cyan}>消失点</Text>
      <Img src={staticFile(im.file)} style={{position:'absolute',left:p.x-im.w*1.5,top:p.y-im.h*3,width:im.w*3,height:im.h*3,imageRendering:'pixelated'}}/>
      <svg width={810} height={420} style={{position:'absolute'}}><circle cx={p.x} cy={p.y} r={6} fill="none" stroke={gold} strokeWidth={2}/></svg>
      <Text x={20} y={374} size={20} color={gold}>手前 → 奥</Text>
    </div>
    <div style={{position:'absolute',left:884,top:131,width:354,height:420,background:'#111017',border:'1px solid #3b3b49'}}>
      <Text x={24} y={20} size={24} color={cyan}>奥行き Z = {z}</Text>
      <Text x={24} y={67} size={19}>↓　テーブルを参照</Text>
      <div style={{position:'absolute',left:20,top:114,width:314,height:188,borderLeft:`4px solid ${gold}`,background:'#25212c'}}>
        <Text x={15} y={12} size={20}>画面の位置</Text>
        <Text x={15} y={45} size={22} color={cyan}>消失点へ近づける</Text>
        <Text x={15} y={102} size={20}>表示する絵</Text>
        <Text x={15} y={135} size={25} color={gold}>16段階のうち {p.size+1} 番</Text>
      </div>
      <Text x={24} y={335} size={24}>計算の代わりに、{`\n`}用意した値を取り出す</Text>
    </div>
    <Text x={44} y={567} size={20}>16段階の縮小画像</Text>
    <Text x={886} y={567} size={18} color={gold}>黄色が、いま表示している絵</Text>
    {tree.images.map((image,i)=><div key={i} style={{position:'absolute',left:44+i*74.5,top:601,width:69,height:98,background:i===p.size?'#393020':'#111017',border:`2px solid ${i===p.size?gold:'#34323b'}`,boxSizing:'border-box'}}>
      <Img src={staticFile(image.file)} style={{position:'absolute',left:32.5-image.w*.375,top:68-image.h*.75,width:image.w*.75,height:image.h*.75,imageRendering:'pixelated'}}/>
      <div style={{position:'absolute',bottom:3,width:'100%',textAlign:'center',fontSize:17,color:i===p.size?gold:'#aaa2af'}}>{i+1}</div>
    </div>)}
  </>;
}

export function IntroReviewCut({index=0}:{index?:number}){
  const cut=manifest.cuts[index];
  return <AbsoluteFill style={{background:bg,color:white,fontFamily:'"Yu Gothic UI",sans-serif'}}>
    {index===0?<>
      <OffthreadVideo src={staticFile('game_CSCD.mp4')} muted startFrom={13*30} style={{width:'100%',height:'100%',objectFit:'cover',imageRendering:'pixelated'}}/>
      <AbsoluteFill style={{background:'linear-gradient(0deg,#050507f5,transparent)'}}/>
      <Text x={65} y={350} size={42}>ファミコンでスペースハリアーを動かすには？</Text>
      <Text x={65} y={425} size={34} color={cyan}>その2：CPUの最適化</Text>
    </>:index===1?<FrameFrameworkIntroScene durationInFrames={cut.durationFrames}/>:index===2?<CoordinateTransformScene durationInFrames={809}/>:<TreeProjection duration={cut.durationFrames}/>}
    <Audio src={staticFile(`${manifest.outputDirectory}/${cut.id}.wav`)} volume={.95}/>
  </AbsoluteFill>;
}

export const IntroReview=()=><AbsoluteFill style={{background:bg}}>{manifest.cuts.map((c,i)=><Sequence key={c.id} from={c.startFrame} durationInFrames={c.durationFrames}><IntroReviewCut index={i}/></Sequence>)}</AbsoluteFill>;
