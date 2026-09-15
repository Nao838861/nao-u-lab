import React from 'react';
import {AbsoluteFill,Audio,Img,OffthreadVideo,Sequence,staticFile,useCurrentFrame,useVideoConfig} from 'remotion';
import {FrameFrameworkIntroScene} from '../restored_cpu/src/ExplainerPrototype';
import manifest from '../narration/intro-review-cuts.json';
import tree from './introTreeData.json';
import cues from './introReviewCues.json';
import alignment from './introReviewAlignment.json';
import {EnemyTableIntro,BucketSortIntro} from './IntroAdditional';

const bg='#050507',white='#f7f4f8',cyan='#53dcff',gold='#ffba57';
export const introReviewDuration=manifest.cuts.reduce((n,c)=>n+c.durationFrames,0);
const Text=({x,y,children,size=24,color=white}:{x:number;y:number;children:React.ReactNode;size?:number;color?:string})=><div style={{position:'absolute',left:x,top:y,fontSize:size,color,lineHeight:1.4,whiteSpace:'pre-line'}}>{children}</div>;
// XYに同じ係数を使い、木の根元を消失点へ向かう一本の直線上に置く。
export const treePosition=(z:number)=>({x:370+50*tree.scale[z]/256*3,y:100+264*tree.scale[z]/tree.scale[0],size:tree.size[z]});
// 同じ説明時間で手前→奥→手前→奥。折り返しでも座標と画像番号を同期する。
export const treeDepth=(progress:number)=>Math.min(55,Math.floor(56*(1-Math.abs((Math.max(0,Math.min(1,progress))*7)%2-1))));

function CoordinateIntro(){
  const t=useCurrentFrame()/30;
  const q=cues.C03;
  const reveal=(at:number)=>Math.max(0,Math.min(1,(t-at)/.2));
  const table=t>=q.however;
  return <>
    <Text x={46} y={36} size={40}>3Dの座標変換</Text>
    <Text x={46} y={94} size={23} color={cyan}>スペースハリアーは、疑似3Dのゲーム</Text>
    <div style={{position:'absolute',left:46,top:158,width:430,height:117,background:'#15131a',borderLeft:`6px solid ${gold}`,opacity:reveal(q.math)}}>
      <Text x={18} y={15} size={21} color={gold}>3Dの座標変換には</Text>
      <Text x={18} y={55} size={27}>かけ算・割り算が必要</Text>
    </div>
    <div style={{position:'absolute',left:46,top:303,width:430,height:126,background:'#15131a',borderLeft:'6px solid #ff607f',opacity:reveal(q.cpu)}}>
      <Text x={18} y={15} size={21} color="#ff607f">ファミコンのCPUには</Text>
      <Text x={18} y={57} size={25}>かけ算・割り算命令がない</Text>
    </div>
    <div style={{position:'absolute',left:46,top:465,width:430,height:163,background:'#12242c',borderLeft:`6px solid ${cyan}`,opacity:reveal(q.however)}}>
      <Text x={18} y={16} size={23} color={cyan}>しかし、疑似3Dなら</Text>
      <Text x={18} y={63} size={26}>計算のほとんどを{`\n`}テーブル参照に置き換える</Text>
    </div>
    <div style={{position:'absolute',left:502,top:158,width:732,height:470,background:'#15131a',border:`1px solid ${t>=q.table?cyan:'#47434e'}`}}>
      {table?<div style={{opacity:reveal(q.however)}}>
        <Text x={22} y={16} size={25}>実際に使っている変換テーブル</Text>
        <Img src={staticFile('development_z_table.png')} style={{position:'absolute',left:20,top:67,width:690,height:330,objectFit:'contain'}}/>
        <div style={{opacity:reveal(q.table)}}><Text x={50} y={420} size={23} color={cyan}>奥行き → テーブル → 画面の位置・絵</Text></div>
      </div>:<>
        <Text x={48} y={38} size={26}>3Dの座標を、画面の座標へ</Text>
        <div style={{position:'absolute',left:65,top:112,width:590,height:67,border:`2px solid ${cyan}`,textAlign:'center',paddingTop:13,fontSize:28,boxSizing:'border-box'}}>3Dの座標</div>
        <Text x={342} y={192} size={33} color={gold}>↓</Text>
        <div style={{opacity:reveal(q.math)}}><Text x={227} y={249} size={28} color={gold}>かけ算・割り算</Text></div>
        <Text x={342} y={305} size={33} color={gold}>↓</Text>
        <div style={{position:'absolute',left:65,top:367,width:590,height:67,border:`2px solid ${cyan}`,textAlign:'center',paddingTop:13,fontSize:28,boxSizing:'border-box'}}>画面の座標</div>
      </>}
    </div>
  </>;
}

function TreeProjection({duration}:{duration:number}){
  const frame=useCurrentFrame(),{fps}=useVideoConfig();
  const memoryExplanation=frame/fps>=(alignment.C04.starts[1]??Infinity);
  const motionFrames=Math.max(1,duration-1.2*fps);
  const progress=Math.max(0,Math.min(1,(frame-.3*fps)/motionFrames));
  const z=treeDepth(progress);
  const p=treePosition(z),im=tree.images[p.size];
  const near=treePosition(0);
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
        <line x1={near.x} y1={near.y} x2={370} y2={100} stroke={gold} strokeWidth={2} strokeDasharray="5 7" opacity={.75}/>
        <circle cx={370} cy={100} r={5} fill={cyan}/>
        <ellipse cx={p.x} cy={p.y+2} rx={Math.max(4,im.w*1.6)} ry={Math.max(2,im.w*.19)} fill="#000" opacity={.55}/>
      </svg>
      <Text x={310} y={53} size={20} color={cyan}>消失点</Text>
      <Img src={staticFile(im.file)} style={{position:'absolute',left:p.x-im.w*1.5,top:p.y-im.h*3,width:im.w*3,height:im.h*3,imageRendering:'pixelated'}}/>
      <svg width={810} height={420} style={{position:'absolute'}}><circle cx={p.x} cy={p.y} r={6} fill="none" stroke={gold} strokeWidth={2}/></svg>
      <Text x={20} y={374} size={20} color={gold}>{Math.min(6,Math.floor(progress*7))%2?'奥 → 手前':'手前 → 奥'}</Text>
    </div>
    <div style={{position:'absolute',left:884,top:131,width:354,height:420,background:'#111017',border:'1px solid #3b3b49'}}>
      {memoryExplanation?<>
        <Text x={20} y={15} size={24} color={cyan}>CPUが行う処理</Text>
        <div style={{position:'absolute',left:20,top:62,width:314,height:49,background:'#393020',borderLeft:`4px solid ${gold}`}}><Text x={12} y={8} size={22}>① 座標 Z = {z} で選ぶ</Text></div>
        <Text x={166} y={111} size={23} color={gold}>↓</Text>
        <div style={{position:'absolute',left:20,top:145,width:314,height:166,background:'#152a34',border:`1px solid ${cyan}`}}>
          <Text x={12} y={9} size={21} color={cyan}>② メモリから値を読む</Text>
          <Text x={15} y={49} size={18}>Z　　　画面の位置　　　絵</Text>
          <div style={{position:'absolute',left:10,right:10,top:83,height:39,background:'#393020',display:'grid',gridTemplateColumns:'45px 176px 60px',alignItems:'center',paddingLeft:8,fontSize:19,color:gold}}><span>{z}</span><span>{Math.round(p.x)}, {Math.round(p.y)}</span><span>{p.size+1}番</span></div>
          <Text x={12} y={134} size={16}>用意した値を取り出すだけ</Text>
        </div>
        <Text x={166} y={310} size={23} color={gold}>↓</Text>
        <div style={{position:'absolute',left:20,top:346,width:314,height:55,background:'#153026',borderLeft:'4px solid #75df91'}}><Text x={12} y={12} size={22} color="#75df91">③ その位置と絵で表示</Text></div>
      </>:<>
      <Text x={24} y={20} size={24} color={cyan}>奥行き Z = {z}</Text>
      <Text x={24} y={67} size={19}>↓　テーブルを参照</Text>
      <div style={{position:'absolute',left:20,top:114,width:314,height:188,borderLeft:`4px solid ${gold}`,background:'#25212c'}}>
        <Text x={15} y={12} size={20}>画面の位置</Text>
        <Text x={15} y={45} size={22} color={cyan}>消失点へ近づける</Text>
        <Text x={15} y={102} size={20}>表示する絵</Text>
        <Text x={15} y={135} size={25} color={gold}>16段階のうち {p.size+1} 番</Text>
      </div>
      <Text x={24} y={335} size={24}>計算の代わりに、{`\n`}用意した値を取り出す</Text>
      </>}
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
    </>:index===1?<FrameFrameworkIntroScene durationInFrames={cut.durationFrames}/>:index===2?<CoordinateIntro/>:index===3?<TreeProjection duration={cut.durationFrames}/>:index===4?<EnemyTableIntro/>:<BucketSortIntro duration={cut.durationFrames}/>}
    <Audio src={staticFile(`${manifest.outputDirectory}/${cut.id}.wav`)} volume={.95}/>
  </AbsoluteFill>;
}

export const IntroReview=()=><AbsoluteFill style={{background:bg}}>{manifest.cuts.map((c,i)=><Sequence key={c.id} from={c.startFrame} durationInFrames={c.durationFrames}><IntroReviewCut index={i}/></Sequence>)}</AbsoluteFill>;
export const IntroReviewC03C04=()=><AbsoluteFill style={{background:bg}}>{manifest.cuts.slice(2,4).map((c,i)=><Sequence key={c.id} from={c.startFrame-manifest.cuts[2].startFrame} durationInFrames={c.durationFrames}><IntroReviewCut index={i+2}/></Sequence>)}</AbsoluteFill>;
export const IntroReviewC01C04=()=><AbsoluteFill style={{background:bg}}>{manifest.cuts.slice(0,4).map((c,i)=><Sequence key={c.id} from={c.startFrame} durationInFrames={c.durationFrames}><IntroReviewCut index={i}/></Sequence>)}</AbsoluteFill>;
