import React from 'react';
import {Img,staticFile,useCurrentFrame} from 'remotion';
import {enemySample} from './IntroAdditional';
import {BulletGlyph} from './BulletGlyph';
import manifest from '../narration/intro-review-cuts.json';
import alignment from './introReviewAlignment.json';
const cyan='#53dcff',gold='#ffba57',green='#75df91';
const Text=({x,y,children,size=24,color='#f7f4f8'}:{x:number;y:number;children:React.ReactNode;size?:number;color?:string})=><div style={{position:'absolute',left:x,top:y,fontSize:size,lineHeight:1.4,color,whiteSpace:'pre-line'}}>{children}</div>;
export const collisionRow=(n:number)=>{
  const r=enemySample(n);
  return {...r,xl:r.x-r.im.halfW,xr:r.x+r.im.halfW,yt:r.y-r.im.h*2,yb:r.y};
};
export const pointInEnemy=(n:number,x:number,y:number)=>{const r=collisionRow(n);return x>=r.xl&&x<=r.xr&&y>=r.yt&&y<=r.yb;};
export function CollisionRectangleIntro(){
  const t=(useCurrentFrame()-(manifest.cuts[7].narrationLeadFrames??0))/30;
  const starts=(alignment as Record<string,{starts:number[]}>).C08.starts;
  const testAt=starts[1]??4,testing=t>=testAt;
  const n=testing?98:84+Math.floor(Math.max(0,t)*4)%30,r=collisionRow(n);
  const progress=(Math.max(0,t-testAt)%5)/5;
  const bx=Math.round(r.xl-12+(r.xr-r.xl+24)*progress),by=(r.yt+r.yb)/2;
  const hit=pointInEnemy(n,bx,by);
  const panelX=44,panelY=166,scale=4.5;
  return <>
    <Text x={44} y={26} size={38}>奥行きで絞ったら、2Dの矩形で判定</Text>
    <Text x={44} y={83} color={cyan}>1フレームごとの位置と大きさ → そのフレームの当たり判定</Text>
    <div style={{position:'absolute',left:panelX,top:panelY,width:576,height:432,overflow:'hidden',background:'#0d1119',border:'1px solid #42404b'}}>
      <svg width={576} height={432} style={{position:'absolute'}}>{[108,216,324].map(y=><line key={y} x1={0} x2={576} y1={y} y2={y} stroke="#1c2932"/>)}{[144,288,432].map(x=><line key={x} x1={x} x2={x} y1={0} y2={432} stroke="#1c2932"/>)}</svg>
      <Img src={staticFile(r.im.file)} style={{position:'absolute',left:r.left*scale,top:r.top*scale,width:r.im.w*scale,height:r.im.h*scale,imageRendering:'pixelated'}}/>
      <div style={{position:'absolute',left:(r.xl-64)*scale,top:(r.yt-31)/2*scale,width:(r.xr-r.xl)*scale,height:(r.yb-r.yt)/2*scale,border:`3px solid ${testing&&hit?gold:green}`,background:testing&&hit?'#ffba5722':'#75df9111',boxSizing:'border-box'}}/>
      {testing&&<><BulletGlyph x={(bx-64)*scale} y={(by-31)/2*scale} size={32}/><svg width={576} height={432} style={{position:'absolute'}}><circle cx={(bx-64)*scale} cy={(by-31)/2*scale} r={3} fill={gold}/></svg></>}
      <Text x={16} y={375} size={22} color={green}>{testing?'フレーム98を止めて、弾の中心を確認':'フレームごとに矩形も更新する'}</Text>
    </div>
    <Text x={44} y={618} size={22} color={gold}>{testing?`同じ奥行きの候補 → ${hit?'矩形の内側：命中':'矩形の外側：当たらない'}`:'C05と同じ移動テーブル・同じ縮小画像'}</Text>
    <div style={{position:'absolute',left:664,top:166,width:572,height:282,background:'#11131d',border:'1px solid #42404b'}}>
      <Text x={18} y={12} size={24} color={cyan}>該当フレームの当たり判定</Text>
      <div style={{position:'absolute',left:18,top:62,fontSize:19,color:green,display:'grid',gridTemplateColumns:'85px 90px 90px 90px 90px 85px'}}>{['frame','左X','右X','上Y','下Y','画像'].map(h=><span key={h}>{h}</span>)}</div>
      {[-2,-1,0,1,2].map((d,i)=>{const a=collisionRow(n+d);return <div key={d} style={{position:'absolute',left:12,right:12,top:101+i*34,height:32,display:'grid',gridTemplateColumns:'85px 90px 90px 90px 90px 85px',paddingLeft:6,fontFamily:'monospace',fontSize:21,color:d===0?gold:'#9993a2',background:d===0?'#453620':'transparent',alignItems:'center'}}>{[a.n,a.xl,a.xr,a.yt,a.yb,a.s].map((v,j)=><span key={j}>{v}</span>)}</div>;})}
    </div>
    <Text x={680} y={461} size={18} color={cyan}>移動表の中心X・下端Y ＋ 画像の幅・高さの表</Text>
    <div style={{position:'absolute',left:664,top:504,width:572,height:147,background:'#13251f',border:`1px solid ${green}`}}>
      <Text x={18} y={10} size={23} color={green}>Zで候補を選ぶ → XYだけを比べる</Text>
      <Text x={18} y={51} size={22}>{testing?`${r.xl} ≤ 弾X ${Math.round(bx)} ≤ ${r.xr}　${hit?'○':'×'}`:'左X ≤ 弾のX ≤ 右X'}</Text>
      <Text x={18} y={89} size={22}>{testing?`${r.yt} ≤ 弾Y ${Math.round(by)} ≤ ${r.yb}　○`:'上Y ≤ 弾のY ≤ 下Y'}</Text>
    </div>
    <Text x={44} y={680} size={15} color="#aaa2af">矩形は実ゲームの表から算出。4辺は説明用に展開して表示。弾の動きは判定を示す例。追加の地平線補正は0。</Text>
  </>;
}
