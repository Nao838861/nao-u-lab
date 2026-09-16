// 実際の描画に使う関数を読み、ゲームの矩形条件と境界を照合する。
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const data=JSON.parse(readFileSync('src/denseData.json','utf8'));
const additional=readFileSync('src/IntroAdditional.tsx','utf8');
const enemyBody=additional.match(/export const enemySample=\(n:number\)=>\{([\s\S]*?)\n\};/)[1];
const enemySample=new Function('data','n',enemyBody).bind(null,data);
const source=readFileSync('src/IntroCollision.tsx','utf8');
const rowBody=source.match(/export const collisionRow=\(n:number\)=>\{([\s\S]*?)\n\};/)[1];
const collisionRow=new Function('enemySample','n',rowBody).bind(null,enemySample);
const hitBody=source.match(/export const pointInEnemy=\(n:number,x:number,y:number\)=>\{(.*?)\};/)[1];
const hit=new Function('collisionRow','n','x','y',hitBody).bind(null,collisionRow);
for(let n=0;n<data.enemy.sx.length;n++){
 const r=collisionRow(n),im=data.images[data.enemy.sz[n]];
 assert.equal(r.xl,data.enemy.sx[n]-im.halfW);
 assert.equal(r.xr,data.enemy.sx[n]+im.halfW);
 assert.equal(r.yt,data.enemy.bot[n]-im.h*2);
 assert.equal(r.yb,data.enemy.bot[n]);
 assert(hit(n,r.xl,r.yt)&&hit(n,r.xr,r.yb));
 assert(!hit(n,r.xl-1,r.yt)&&!hit(n,r.xr+1,r.yb));
 assert(!hit(n,r.x,r.yt-1)&&!hit(n,r.x,r.yb+1));
}
const glyph=JSON.parse(readFileSync('src/introBullet.json','utf8'));
const chr=readFileSync('D:/HomeBrew/MonoSH/res/sprite.chr');
assert.equal(createHash('sha256').update(chr).digest('hex'),glyph.sha256);
const expected=[];
for(let y=0;y<16;y++)for(let x=0;x<16;x++){
 const tile=(0x60+Math.floor(y/8))*16,bit=7-(x<8?x:15-x);
 const c=((chr[tile+y%8]>>bit)&1)|(((chr[tile+y%8+8]>>bit)&1)<<1);
 if(c)expected.push([x,y,c]);
}
assert.deepEqual(glyph.pixels,expected);
assert(glyph.pixels.length>0);
const shotBody=source.match(/export const shotState=\(elapsed:number,window:number\)=>\{([\s\S]*?)\n\};/)[1];
const shot=new Function('collisionRow','elapsed','window',shotBody).bind(null,collisionRow);
const outcomes=[];
for(let i=0;i<5;i++){
 const start=shot(i*2,10),arrival=shot(i*2+1.4,10);
 assert.equal(start.index,i);assert(!start.ready);assert(arrival.ready);
 assert(start.size>arrival.size);assert(start.y>arrival.y);
 assert.equal(arrival.x,arrival.targetX);assert.equal(arrival.y,arrival.targetY);
 assert(start.x-start.size/2>=0&&start.x+start.size/2<=576);
 outcomes.push(hit(98,arrival.bx,arrival.by));
}
assert.deepEqual(outcomes,[false,true,true,true,false]);
console.log(`PASS: ${data.enemy.sx.length} collision rectangles and inclusive boundaries; ${glyph.pixels.length} original bullet pixels`);
console.log('PASS: five separate depth shots, shrinking toward target, miss/hit/hit/hit/miss');
