import React from 'react';
import {Img,staticFile,useCurrentFrame} from 'remotion';
import data from './denseData.json';
import alignment from './introReviewAlignment.json';

const cyan='#53dcff',gold='#ffba57',white='#f7f4f8';
const Label=({x,y,children,size=24,color=white}:{x:number;y:number;children:React.ReactNode;size?:number;color?:string})=><div style={{position:'absolute',left:x,top:y,fontSize:size,color,lineHeight:1.4,whiteSpace:'pre-line'}}>{children}</div>;
const Panel=({x,y,w,h,children}:{x:number;y:number;w:number;h:number;children:React.ReactNode})=><div style={{position:'absolute',left:x,top:y,width:w,height:h,background:'#0d1119',border:'1px solid #42404b',overflow:'hidden'}}>{children}</div>;

export const enemySample=(n:number)=>{
  const e=data.enemy,s=e.sz[n],im=data.images[s];
  return {n,x:e.sx[n],y:e.bot[n],z:e.wz[n],s,im,left:e.sx[n]-im.halfW-64,top:Math.floor((e.bot[n]-31)/2)-im.h+1};
};

export function EnemyTableIntro(){
  const frame=useCurrentFrame();
  const length=data.enemy.sx.length;
  // 2回目のEM1の後はループ先頭のpath_0。6体を6更新ずつずらす。
  const tick=Math.max(0,frame-12)%(length+30);
  const selected=Math.max(0,Math.ceil((tick-length+1)/6));
  const n=tick-selected*6,r=enemySample(n);
  return <>
    <Label x={44} y={26} size={38}>敵の動きも、テーブルから取り出す</Label>
    <Label x={44} y={83} color={cyan}>2回目のEM1の次に出る、Em0の6機編隊</Label>
    <Panel x={44} y={156} w={576} h={432}>
      <svg width={576} height={432} style={{position:'absolute'}}>
        {[108,216,324].map(y=><line key={y} x1={0} x2={576} y1={y} y2={y} stroke="#1c2932"/>)}
        {[144,288,432].map(x=><line key={x} x1={x} x2={x} y1={0} y2={432} stroke="#1c2932"/>)}
      </svg>
      {Array.from({length:6},(_,i)=>{
        const age=tick-i*6;if(age<0||age>=length)return null;
        const a=enemySample(age);
        return <React.Fragment key={i}>
          <Img src={staticFile(a.im.file)} style={{position:'absolute',left:a.left*4.5,top:a.top*4.5,width:a.im.w*4.5,height:a.im.h*4.5,imageRendering:'pixelated'}}/>
          {i===selected&&<div style={{position:'absolute',left:a.left*4.5-4,top:a.top*4.5-4,width:a.im.w*4.5+8,height:a.im.h*4.5+8,border:`2px solid ${gold}`,boxSizing:'border-box'}}/>}
        </React.Fragment>;
      })}
    </Panel>
    <Label x={48} y={610} size={22} color={gold}>黄色の枠：{selected+1}体目　／　ゲームと同じ30更新／秒</Label>
    <Panel x={664} y={156} w={572} h={307}>
      <Label x={20} y={16} size={26} color={cyan}>移動テーブル　現在のフレーム：{n}</Label>
      <div style={{position:'absolute',left:20,top:70,display:'grid',gridTemplateColumns:'95px 90px 115px 95px 100px',fontSize:21,color:cyan}}>{['frame','X','下端Y','Z','画像番号'].map(v=><span key={v}>{v}</span>)}</div>
      {[-2,-1,0,1,2].map((delta,i)=>{
        const k=n+delta,a=k>=0&&k<length?enemySample(k):null;
        return <div key={delta} style={{position:'absolute',left:12,right:12,top:108+i*37,height:34,background:delta===0?'#453620':'transparent',color:delta===0?gold:'#9d98a8',display:'grid',gridTemplateColumns:'95px 90px 115px 95px 100px',paddingLeft:8,alignItems:'center',fontFamily:'monospace',fontSize:22}}>{(a?[a.n,a.x,a.y,a.z,a.s]:['—','—','—','—','—']).map((v,j)=><span key={j}>{v}</span>)}</div>;
      })}
    </Panel>
    <Panel x={664} y={488} w={572} h={156}>
      <Label x={20} y={12} color={gold}>1フレーム進める → 次の行を読む</Label>
      <Label x={20} y={57} size={22}>位置と縮小画像を、そのまま描画に使う</Label>
      <Label x={20} y={98} size={20} color={cyan}>同じ軌跡を、6フレームずつずらして6体へ</Label>
    </Panel>
    <Label x={48} y={678} size={16} color="#aaa2af">ゲームの移動テーブルと縮小画像を使用。地平線の追加補正は0。Zは敵用の値。</Label>
  </>;
}

// 静止画から読み取れる前後関係を、8個の説明用バケツへ配置する。
export const sortObjects=[
  {id:'A',name:'奥の木',bucket:6,x:499,y:445,w:89,h:151},
  {id:'B',name:'手前の木',bucket:4,x:210,y:350,w:156,h:278},
  {id:'C',name:'敵',bucket:2,x:699,y:303,w:263,h:150},
  {id:'D',name:'草',bucket:0,x:847,y:512,w:350,h:209},
];
function Crop({o}:{o:typeof sortObjects[number]}){
  const scale=Math.min(82/o.w,47/o.h);
  return <div style={{position:'relative',width:86,height:49,overflow:'hidden'}}><div style={{position:'absolute',left:(86-o.w*scale)/2,top:0,width:o.w*scale,height:o.h*scale,overflow:'hidden'}}><Img src={staticFile('intro/zsort.png')} style={{position:'absolute',left:-o.x*scale,top:-o.y*scale,width:1371*scale,height:827*scale,maxWidth:'none'}}/></div></div>;
}
export function BucketSortIntro({duration}:{duration:number}){
  const frame=useCurrentFrame(),t=frame/30;
  const starts=(alignment as Record<string,{starts:number[]}>).C06?.starts??[0,5,8];
  const registerAt=starts[2]??8,scanAt=(starts[2]??8)+5;
  const scanProgress=Math.max(0,Math.min(7,Math.floor((t-scanAt)/Math.max(.25,(duration/30-scanAt-1)/8))));
  const scanning=t>=scanAt,active=scanning?7-scanProgress:-1;
  const registered=sortObjects.filter((_,i)=>t>=registerAt+i*.55);
  const drawn=registered.filter(o=>scanning&&o.bucket>=active);
  return <>
    <Label x={44} y={26} size={38}>バケツに入れて、奥から順に描く</Label>
    <Label x={44} y={83} color={cyan}>Zで振り分ける → 配列を奥からスキャン</Label>
    <Panel x={44} y={177} w={576} h={348}>
      <Img src={staticFile('intro/zsort.png')} style={{width:576,height:348}}/>
      {sortObjects.map(o=><React.Fragment key={o.id}>
        <div style={{position:'absolute',left:o.x*576/1371,top:o.y*348/827,width:o.w*576/1371,height:o.h*348/827,border:`2px solid ${active===o.bucket?gold:cyan}`,background:active===o.bucket?'#ffba5722':'transparent',boxSizing:'border-box'}}/>
        <div style={{position:'absolute',left:o.x*576/1371,top:o.y*348/827-25,padding:'1px 5px',fontSize:18,background:'#080a10',color:active===o.bucket?gold:cyan}}>{o.id}</div>
      </React.Fragment>)}
    </Panel>
    <Label x={44} y={137} size={22}>この1枚にある、木2本・敵1体・草1つ</Label>
    <Label x={44} y={550} size={23} color={gold}>描画順　奥 → 手前</Label>
    <div style={{position:'absolute',left:44,top:594,display:'flex',gap:12}}>{sortObjects.map(o=><div key={o.id} style={{width:130,height:60,border:`1px solid ${drawn.includes(o)?gold:'#48434e'}`,background:drawn.includes(o)?'#453620':'#14121a',opacity:drawn.includes(o)?1:.3,fontSize:22,textAlign:'center',paddingTop:14,boxSizing:'border-box'}}>{o.id} {o.name}</div>)}</div>
    <Label x={679} y={129} size={20}>奥</Label>
    <Label x={800} y={125} size={19} color={cyan}>配列に入れるのは、物への参照</Label>
    {Array.from({length:8},(_,i)=>{
      const bucket=7-i,o=registered.find(o=>o.bucket===bucket),on=active===bucket;
      return <div key={bucket} style={{position:'absolute',left:717,top:158+i*61,width:505,height:54,background:on?'#453620':'#12131d',border:`2px solid ${on?gold:'#45434e'}`,boxSizing:'border-box',display:'flex',alignItems:'center',gap:18,paddingLeft:15,fontSize:22}}>
        <span style={{width:100,color:on?gold:cyan}}>配列[{bucket}]</span>
        {o?<><Crop o={o}/><span>{o.id}：{o.name}</span></>:<span style={{color:'#797483'}}>空</span>}
        {on&&<span style={{marginLeft:'auto',marginRight:15,color:gold}}>←</span>}
      </div>;
    })}
    <svg width={38} height={488} style={{position:'absolute',left:668,top:158}}><line x1={19} y1={0} x2={19} y2={467} stroke={cyan} strokeWidth={3}/><path d="M8 455 L19 477 L30 455" fill="none" stroke={cyan} strokeWidth={3}/></svg>
    <Label x={679} y={648} size={20}>手前</Label>
    <Label x={44} y={678} size={16} color="#aaa2af">8個のバケツで説明。配置は画面の前後関係を示す例。プレイヤーは対象外。</Label>
  </>;
}
