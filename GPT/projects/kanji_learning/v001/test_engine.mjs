import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {LESSONS, PARTS} from './dist/data.mjs';
import {freshProgress, normalizeProgress, candidates, isCorrect, recordResult, selectSession, stats, addDays, localDate} from './dist/engine.mjs';

test('正しい部品でも左右逆・構造違いは合体できない',()=>{
  const l=LESSONS.find(l=>l.char==='材');
  assert.equal(isCorrect(l,'lr',['wood','talent']),true);
  assert.equal(isCorrect(l,'lr',['talent','wood']),false);
  assert.equal(isCorrect(l,'tb',['wood','talent']),false);
  assert.equal(isCorrect(l,null,['wood','talent']),false);
  assert.equal(isCorrect(l,'lr',['wood',null]),false);
});
test('上下の字にも左右と同じ判定を適用する',()=>{
  const l=LESSONS.find(l=>l.char==='念');
  assert.equal(isCorrect(l,'tb',['now','heart']),true);
  assert.equal(isCorrect(l,'lr',['now','heart']),false);
});
test('全12字に、正解を含む重複しない6部品の候補がある',()=>{
  for(const l of LESSONS)for(let n=0;n<20;n++){
    const options=candidates(l);assert.equal(options.length,6);assert.equal(new Set(options).size,6);
    assert.ok(l.parts.every(id=>options.includes(id)));assert.ok(options.every(id=>PARTS[id]));
  }
});
test('ヒント・誤答・見本利用は自力の記録に入れない',()=>{
  let p=freshProgress();
  p=recordResult(p,'材',{hinted:true},'2026-11-05');
  p=recordResult(p,'松',{mistakes:1},'2026-11-05');
  p=recordResult(p,'清',{revealed:true},'2026-11-05');
  assert.equal(stats(p,'2026-11-05').collected,3);
  assert.equal(stats(p,'2026-11-05').independent,0);
  assert.equal(p.records['清'].lastResult,'review');
  assert.equal(p.records['材'].lastResult,'assisted');
  assert.equal(p.records['松'].lastResult,'assisted');
  assert.ok(Object.values(p.records).every(r=>r.independentDates.length===0));
});
test('同日反復を別日の成功と混同せず、元の記録も変更しない',()=>{
  const empty=freshProgress();
  let p=recordResult(empty,'材',{},'2026-11-05');
  p=recordResult(p,'材',{},'2026-11-05');
  assert.deepEqual(empty.records,{});
  assert.equal(p.records['材'].independent,2);
  assert.deepEqual(p.records['材'].independentDates,['2026-11-05']);
  assert.equal(stats(p).anotherDay,0);
  p=recordResult(p,'材',{},'2026-11-06');
  assert.equal(stats(p).anotherDay,1);
  assert.equal(p.records['材'].due,'2026-11-09');
  p=recordResult(p,'材',{},'2026-11-07');
  assert.equal(p.records['材'].due,'2026-11-14');
});
test('忘れた字が復習対象に戻っても、集めた字を没収しない',()=>{
  let p=recordResult(freshProgress(),'材',{},'2026-11-05');
  p=recordResult(p,'材',{revealed:true},'2026-11-06');
  assert.equal(p.records['材'].collected,true);
  assert.equal(p.records['材'].independent,1);
  assert.equal(p.records['材'].lastResult,'review');
  assert.equal(stats(p,'2026-11-06').due,1);
});
test('未収集・要復習を優先し、全字収集後も続けられる',()=>{
  let p=freshProgress();
  assert.deepEqual(selectSession(p).map(l=>l.char),['材','松','清']);
  p=recordResult(p,'材',{},'2026-11-05');
  assert.equal(selectSession(p,{day:'2026-11-05'})[0].char,'松');
  p=recordResult(p,'梅',{hinted:true},'2026-11-05');
  assert.equal(selectSession(p,{review:true,day:'2026-11-05'})[0].char,'梅');
  for(const l of LESSONS)p=recordResult(p,l.char,{},'2026-11-05');
  assert.equal(selectSession(p,{day:'2026-11-05'}).length,3);
});
test('保存データの破損や未知の文字・HTML・負の値を除去する',()=>{
  for(const raw of [null,[],{},'bad',{version:2,records:{}},{version:1,records:[]}])assert.deepEqual(normalizeProgress(raw),freshProgress());
  const p=normalizeProgress({version:1,records:{材:{collected:true,attempts:-1,independent:'<script>',assisted:Infinity,independentDates:['bad','2026-11-05','2026-11-05'],lastResult:'<img>'},'<script>':{collected:true}},sessions:-20,settings:{sound:true,timer:false}});
  assert.deepEqual(Object.keys(p.records),['材']);
  assert.equal(p.records['材'].attempts,0);assert.equal(p.records['材'].independent,0);
  assert.equal(p.records['材'].lastResult,'review');assert.equal(p.sessions,0);
  assert.deepEqual(p.records['材'].independentDates,['2026-11-05']);
  assert.deepEqual(p.settings,{sound:true,timer:false});
});
test('月末・年末をまたぐ復習日を正しく作る',()=>{
  assert.equal(addDays('2026-11-30',1),'2026-12-01');
  assert.equal(addDays('2026-12-31',1),'2027-01-01');
  assert.equal(localDate(new Date(2026,10,5,0,1)),'2026-11-05');
});
test('字形の筆画は全字に二部品ずつあり、実行コードを含まない',async()=>{
  const glyphs=JSON.parse(await readFile(new URL('./dist/glyphs.json',import.meta.url),'utf8'));
  assert.equal(Object.keys(glyphs).length,12);
  for(const l of LESSONS){assert.equal(glyphs[l.char].length,2);for(const group of glyphs[l.char]){assert.ok(group.length>0);assert.ok(group.every(d=>/^[MmLlHhVvCcSsQqTtAaZz0-9.,\s-]+$/.test(d)));}}
});
