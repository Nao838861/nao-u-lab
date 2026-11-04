import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {samplePath,compareInk,fitStrokes,resample} from './dist/handwriting.mjs';
const data=JSON.parse(await readFile(new URL('./dist/glyphs.json',import.meta.url),'utf8'));
const templates=Object.fromEntries(Object.entries(data).map(([c,g])=>[c,g.flat().map(samplePath)]));
test('全字の曲線を有限座標に変換し、適度なずれ・拡縮・筆順変更を許す',()=>{
  for(const [c,t] of Object.entries(templates)){
    assert.ok(t.flat().every(p=>p.every(Number.isFinite)));
    const ink=[...t].reverse().map(s=>s.map(([x,y],i)=>[x*.85+8+Math.sin(i)*1.1,y*.9+5+Math.cos(i)*1.1]));
    assert.ok(compareInk(ink,t).ok,c);
  }
});
test('収録字どうしの取り違えを通さない',()=>{
  for(const [c,t] of Object.entries(templates))for(const [other,ink] of Object.entries(templates))if(c!==other)assert.equal(compareInk(ink,t).ok,false,`${other} を ${c} と判定しない`);
});
test('白紙・点・一本線・鏡像・片側だけ・網目の落書きを拒否する',()=>{
  const t=templates['材'];const grid=Array.from({length:10},(_,i)=>[[5,i*10+5],[100,i*10+5]]);
  for(const ink of [[],[[[20,20]]],[[[5,5],[100,100]]],t.map(s=>s.map(([x,y])=>[109-x,y])),data['材'][0].map(samplePath),grid])assert.equal(compareInk(ink,t).ok,false);
});
test('部品を単独練習用に拡大しても同じ形として確認できる',()=>{
  for(const groups of Object.values(data))for(const group of groups){const t=group.map(samplePath);assert.ok(compareInk(fitStrokes(t),fitStrokes(t)).ok);}
});
test('折れ線をほぼ等間隔にし、端点を保持する',()=>{
  assert.deepEqual(resample([[0,0],[3,0],[3,3]],2),[[0,0],[2,0],[3,1],[3,3]]);
});
