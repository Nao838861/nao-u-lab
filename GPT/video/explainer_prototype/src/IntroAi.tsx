import React from 'react';
import {Img,Loop,OffthreadVideo,staticFile,useCurrentFrame} from 'remotion';
import manifest from '../narration/intro-review-cuts.json';
import data from './introAiData.json';
import sprites from './denseData.json';
import cues from './introAiCues.json';
const cyan='#53dcff',gold='#ffba57',red='#ff526c',green='#75df91';
const T=({x,y,children,size=24,color='#f7f4f8'}:{x:number;y:number;children:React.ReactNode;size?:number;color?:string})=><div style={{position:'absolute',left:x,top:y,fontSize:size,color,lineHeight:1.4,whiteSpace:'pre-line'}}>{children}</div>;
const clock=(i:number,f:number)=>(f-(manifest.cuts[i].narrationLeadFrames??0))/30;
const Box=({x,y,w,h,children}:{x:number;y:number;w:number;h:number;children:React.ReactNode})=><div style={{position:'absolute',left:x,top:y,width:w,height:h,background:'#10131c',border:'1px solid #3a4050',overflow:'hidden'}}>{children}</div>;
export function AutomaticTrackingIntro(){
 const t=clock(15,useCurrentFrame());
 const bad=t>=cues.failure;
 const points=[[77,240,72,42],[502,95,104,150],[310,286,150,100],[575,245,54,38],[448,320,110,90]];
 const i=bad?Math.floor((t-cues.failure)*2)%points.length:0;
 const [x,y,w,h]=points[i];
 const image=sprites.images[bad?[8,0,2,10,4][i]:8];
 return <>
  <T x={44} y={32} size={39}>リファレンス映像から、軌跡を全自動で抽出</T>
  <T x={44} y={94} color={cyan}>同じ敵を追い続けられるか？</T>
  <Box x={44} y={153} w={672} h={470}>
   <Img src={staticFile('ai_chapter/frame_031.png')} style={{position:'absolute',width:672,height:756,top:-126}}/>
   <div style={{position:'absolute',left:x,top:y,width:w,height:h,border:`3px solid ${bad?red:cyan}`}}/>
   <div style={{position:'absolute',left:15,bottom:15,background:'#050507e8',padding:12,fontSize:23,color:bad?red:cyan}}>{bad?'追跡対象が別の敵・背景へ飛ぶ':'位置・見かけの大きさを検出'}</div>
  </Box>
  <T x={738} y={345} size={34} color={cyan}>→</T>
  <Box x={798} y={153} w={438} h={470}>
   <T x={20} y={20} size={25}>検出結果を動きに変えると</T>
   <svg width={438} height={330} style={{position:'absolute',top:65}}><path d="M40 210 L320 70 L160 265 L350 230 L85 100" fill="none" stroke={bad?red:'#344251'} strokeDasharray="8 7" strokeWidth={3}/></svg>
   <Img src={staticFile(image.file)} style={{position:'absolute',left:(bad?[40,320,160,350,85][i]:40)-image.w*2,top:(bad?[210,70,265,230,100][i]:210)+65-image.h*2,width:image.w*4,height:image.h*4,imageRendering:'pixelated'}}/>
   <T x={20} y={396} color={bad?red:cyan}>{bad?'位置も大きさも、不自然に飛ぶ':'軌跡テーブルへの変換を試す'}</T>
  </Box>
  <T x={44} y={660} size={18} color={gold}>誤検出の説明用アニメ。実際の検出ログ・生成軌跡ではありません。</T>
 </>;
}
export function MarkedTrajectoryIntro(){
 const t=clock(16,useCurrentFrame());const start=cues.table;
 const n=Math.max(0,Math.floor(Math.max(0,t-start)*15)%(data.enemy.sx.length+15));
 const row=Math.min(data.enemy.sx.length-1,n),im=sprites.images[data.enemy.sz[row]];
 const shown=Math.min(4,Math.max(1,Math.floor(t/1.1)+1));
 return <>
  <T x={44} y={32} size={39}>人が目印を付け、AIが軌跡テーブルへ変換</T>
  <T x={44} y={94} color={cyan}>当時の赤枠付き画像 → 座標・サイズ抽出 → 中間フレームを補間</T>
  {data.images.slice(0,4).map((p,i)=><div key={p.frame} style={{opacity:i<shown?1:.12}}>
   <Box x={44+(i%2)*272} y={148+Math.floor(i/2)*244} w={260} h={230}>
    <div style={{height:195,overflow:'hidden',position:'relative'}}><Img src={staticFile(p.file)} style={{position:'absolute',width:260,height:292.5,top:-48.75}}/></div>
    <T x={12} y={199} size={20} color={gold}>元画像 Frame {p.frame.toString().padStart(3,'0')}</T>
   </Box>
  </div>)}
  <T x={590} y={347} size={30} color={cyan}>→</T>
  <Box x={636} y={148} w={600} h={480}>
   <T x={15} y={13} size={23} color={cyan}>生成後に調整した実ゲーム用テーブル</T>
   <div style={{position:'absolute',left:12,top:62,width:576,height:360,overflow:'hidden',background:'#07151b'}}>
    <svg width={576} height={360}><path d="M0 100 H576 M0 360 L288 100 L576 360" stroke="#345454" fill="none"/></svg>
    <Img src={staticFile(im.file)} style={{position:'absolute',left:(data.enemy.sx[row]-im.halfW-64)*4.5,top:(Math.floor((data.enemy.bot[row]-31)/2)-im.h+1)*4.5,width:im.w*4.5,height:im.h*4.5,imageRendering:'pixelated',opacity:t>=start?1:0}}/>
   </div>
   <T x={15} y={434} size={20} color={gold}>行 {row} / 94　X={data.enemy.sx[row]}　Z={data.enemy.wz[row]}　絵={data.enemy.sz[row]}</T>
  </Box>
  <T x={44} y={648} size={20}>赤枠の内側で敵の位置と大きさを指定。全自動では難しかった「どの敵か」を人が教える。</T>
  <T x={44} y={680} size={16} color="#aaa2af">元画像は10コマ/秒の抽出。右はpattern 7の95行・実画像16段階を2倍スローで再生（図の表示位置は説明用）。</T>
 </>;
}
export function BossAiIntro(){
 const t=clock(17,useCurrentFrame());
 const rows=[['Z：手前と奥を直線で往復',cues.z],['Y：サインカーブで上下移動',cues.y],['X：サインカーブの左右移動\n　＋プレイヤーから離れる動き',cues.x]] as const;
 return <>
  <T x={44} y={32} size={39}>ボスの動き：人が解析し、AIが実装</T>
  <T x={44} y={94} color={cyan}>人間はソースを見ず、動きの指示と実行結果で調整</T>
  <Box x={44} y={150} w={720} h={510}><Loop durationInFrames={16*30}><OffthreadVideo src={staticFile('game_CSCD.mp4')} startFrom={77*30} endAt={93*30} muted style={{width:'100%',height:'100%',objectFit:'contain',imageRendering:'pixelated'}}/></Loop></Box>
  <Box x={788} y={150} w={448} h={510}>
   <T x={20} y={20} size={24} color={t>=cues.z?gold:cyan}>{t>=cues.z?'人が動きを3軸に分解':t>=cues.bossFail?'全自動解析では再現できず':'AIにボスの動きを実装させる'}</T>
   {rows.map(([label,at],i)=><div key={label} style={{position:'absolute',left:18,top:91+i*95,width:410,padding:'13px 12px',boxSizing:'border-box',background:'#192432',borderLeft:`4px solid ${cyan}`,fontSize:21,whiteSpace:'pre-line',opacity:Math.max(0,Math.min(1,(t-at)/.4))}}>{label}</div>)}
   {t>=cues.x+2&&<T x={20} y={401} size={23} color={green}>解析したルールをAIがコード化</T>}
  </Box>
  {t>=cues.conclusion&&<T x={44} y={676} size={23} color={gold}>全自動の目コピ移植には、まだ課題が残る</T>}
 </>;
}
