import React from 'react';
import bullet from './introBullet.json';
export function BulletGlyph({x,y,size=32,pattern=0}:{x:number;y:number;size?:number;pattern?:number}){
  return <svg width={size} height={size} viewBox="0 0 16 16" style={{position:'absolute',left:x-size/2,top:y-size/2,overflow:'visible',filter:'drop-shadow(0 0 3px #ffba57)'}} shapeRendering="crispEdges">
    {bullet.frames[pattern].pixels.map(([px,py,c])=><rect key={`${px}:${py}`} x={px} y={py} width={1} height={1} fill={['transparent','#a74800','#ffa347','#ffffff'][c]}/>)}
  </svg>;
}
