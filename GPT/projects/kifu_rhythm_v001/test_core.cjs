const assert=require('node:assert/strict');
const {Run,chart,play,melody,duration,WINDOW}=require('./site/dist/core.js');
let count=0;
function test(name,fn){fn();console.log('PASS '+name);count++;}
test('48 legal moves with two captures',()=>{assert.equal(chart.length,48);assert.equal(chart.reduce((n,m)=>n+m.captured.length,0),2);assert.deepEqual(chart[6].captured,[20]);assert.deepEqual(chart[15].captured,[24]);});
test('all perfect reaches reference board and exact score',()=>{let r=new Run();for(const m of chart)assert.equal(r.hit(m.time,m.x,m.y,'direct').kind,'perfect');assert.deepEqual(r.board,chart.at(-1).board);assert.equal(r.score,4800);assert.equal(r.best,48);});
test('all misses preserve full reference sequence',()=>{let r=new Run();r.update(duration);assert.deepEqual(r.board,chart.at(-1).board);assert.equal(r.score,0);assert.equal(r.results.filter(x=>x.kind==='assist').length,48);assert.deepEqual(r.events.map(e=>e.i),chart.map((m,i)=>i));});
test('mixed hits with early and late judgements',()=>{let r=new Run();chart.forEach((m,i)=>{if(i%3!==0)r.hit(m.time+(i%2?.13:-.13),m.x,m.y,'direct');});r.update(duration);assert.deepEqual(r.board,chart.at(-1).board);assert.equal(r.results.filter(x=>x.kind==='good').length,32);assert.equal(r.score,1920);});
test('wrong position, early input, duplicates cannot score',()=>{let r=new Run(),m=chart[0];assert.equal(r.hit(m.time,8,8,'direct'),null);assert.equal(r.hit(m.time-WINDOW-.01,m.x,m.y,'direct'),null);assert.ok(r.hit(m.time,m.x,m.y,'direct'));assert.equal(r.hit(m.time,m.x,m.y,'direct'),null);assert.equal(r.score,100);});
test('one-key mode ignores location but not time',()=>{let r=new Run();chart.forEach(m=>assert.ok(r.hit(m.time,99,99,'key')));assert.equal(r.score,4800);});
test('occupied points and suicide are rejected',()=>{let b=Array(81).fill(0);b[10]=1;assert.throws(()=>play(b,1,1,2));b=Array(81).fill(0);[1,9,11,19].forEach(i=>b[i]=2);assert.throws(()=>play(b,1,1,1));});
test('simple ko is rejected',()=>{let b=Array(81).fill(0);const next=play(b,0,0,1).board;assert.throws(()=>play(b,0,0,1,next));});
test('music and chart fit 60 seconds with non-overlapping windows',()=>{assert.equal(melody.reduce((n,m)=>n+m[1],0),64);assert.equal(duration,60);assert.ok(chart.at(-1).time+WINDOW<duration);chart.slice(1).forEach((m,i)=>assert.ok(m.time-chart[i].time>WINDOW*2));});
console.log(count+' tests passed');
