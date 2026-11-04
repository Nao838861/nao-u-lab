import {test} from 'node:test';
import assert from 'node:assert/strict';
import {LESSONS,PARTS} from './dist/data.mjs';
import {freshStudy,normalizeStudy,partCandidates,recordStudy,recordPart,studySession} from './dist/study.mjs';
test('全字の形候補は正解を含め12個、名前候補は6個で重複しない',()=>{
  for(const l of LESSONS)for(const size of [6,12])for(let n=0;n<20;n++){const a=partCandidates(l.parts,size);assert.equal(a.length,size);assert.equal(new Set(a).size,size);assert.ok(l.parts.every(p=>a.includes(p)));assert.ok(a.every(p=>PARTS[p]));}
});
test('名前・形・ペン・部品を分離し、見本確認は成功数に入れない',()=>{
  let p=freshStudy();const initial=p;
  p=recordStudy(p,'材','names',{},'2026-11-05');p=recordStudy(p,'材','shape',{},'2026-11-05');p=recordStudy(p,'材','pen',{model:true},'2026-11-05');p=recordPart(p,'wood','pen',{},'2026-11-05');
  assert.deepEqual(initial.records,{});assert.equal(p.records['材'].shape.successes,1);assert.equal(p.records['材'].pen.successes,0);assert.equal(p.parts.wood.pen.successes,1);
});
test('候補を見た後のペン、誤答後、段階ヒントは支援ありとして残す',()=>{
  let p=recordStudy(freshStudy(),'仲','pen',{sawShape:true,hints:[0,2]},'2026-11-05');
  p=recordStudy(p,'仲','pen',{mistakes:1},'2026-11-05');assert.equal(p.records['仲'].pen.clean,0);assert.equal(p.records['仲'].pen.assisted,2);assert.deepEqual(p.records['仲'].pen.dates,['2026-11-05']);
  p=recordStudy(p,'仲','pen',{},'2026-11-06');assert.equal(p.records['仲'].pen.dates.length,2);
});
test('破損値と未知のIDを除去して旧版は旧版のまま保持する',()=>{
  const p=normalizeStudy({version:2,legacy:{version:1,records:{材:{collected:true,independent:2}}},records:{材:{names:null,shape:{successes:-5,lastHints:[8,'bad'],dates:['bad']},pen:{successes:'<script>'}},'<img>':{}},parts:{water:{name:null},bad:{}},settings:{mode:'bad',sound:true}});
  assert.equal(p.legacy.records['材'].independent,2);assert.equal(p.records['材'].pen.successes,0);assert.deepEqual(Object.keys(p.records),['材']);assert.deepEqual(Object.keys(p.parts),['water']);assert.equal(p.settings.mode,'shape');
});
test('つまずいた字を優先し、一度の練習を短く保つ',()=>{
  let p=freshStudy();assert.equal(studySession(p).length,3);p=recordStudy(p,'念','pen',{model:true});assert.equal(studySession(p)[0].char,'念');
});
