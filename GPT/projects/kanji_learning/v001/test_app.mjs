// 実ブラウザーの代わりにはならない。DOM上の学習フローと記録の結合を検証する。
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {parseHTML} from 'linkedom';
import {LESSONS} from './dist/data.mjs';
import {STORAGE_KEY} from './dist/engine.mjs';

let serial=0;
async function fixture({stored=null,storageThrows=false}={}){
  const html=await readFile(new URL('./dist/index.html',import.meta.url),'utf8');
  const {window,document}=parseHTML(html),values=new Map(stored?[[STORAGE_KEY,JSON.stringify(stored)]]:[]),timers=new Map();
  const real={};for(const key of ['window','document','localStorage','fetch','setInterval','clearInterval'])real[key]=globalThis[key];
  window.scrollTo=()=>{};
  globalThis.window=window;globalThis.document=document;
  globalThis.localStorage={getItem:key=>{if(storageThrows)throw new Error('blocked');return values.get(key)||null;},setItem:(key,value)=>{if(storageThrows)throw new Error('blocked');values.set(key,value);}};
  globalThis.fetch=async()=>({ok:true,json:async()=>JSON.parse(await readFile(new URL('./dist/glyphs.json',import.meta.url),'utf8'))});
  globalThis.setInterval=fn=>{const id=timers.size+1;timers.set(id,fn);return id;};
  globalThis.clearInterval=id=>timers.delete(id);
  await import(`./dist/app.mjs?test=${serial++}`);
  return {document,values,timers,click(selector){const b=document.querySelector(selector);assert.ok(b,`ボタンが見つかる: ${selector}`);assert.equal(b.hasAttribute('disabled'),false,`有効なボタン: ${selector}`);b.dispatchEvent(new window.Event('click',{bubbles:true}));},restore(){for(const [key,value] of Object.entries(real))globalThis[key]=value;},read(){return JSON.parse(values.get(STORAGE_KEY)||'null');}};
}
function answer(f,lesson){
  if(f.document.querySelector('.reference')===null)f.click(`[data-action="layout"][data-layout="${lesson.layout}"]`);
  for(const part of lesson.parts)f.click(`[data-action="part"][data-part="${part}"]`);
  f.click('[data-action="check"]');
}
function identifyQuestion(document){const text=document.querySelector('.example-sentence').textContent.replace(/\s/g,'');return LESSONS.find(l=>l.sentence.replace(/[［］\s]/g,'')===text);}

test('紙なしの3文字サイクルが完了し、練習の正答は自力記録へ入らない',async()=>{
  const f=await fixture();try{
    f.click('[data-action="start"]');
    for(const l of [LESSONS[0],LESSONS[1],LESSONS[2]]){answer(f,l);assert.equal(f.read(),null);f.click('[data-action="next"]');}
    assert.equal(f.document.querySelectorAll('.memory-card').length,3);assert.equal(f.timers.size,1);
    f.click('[data-action="recall"]');assert.equal(f.timers.size,0);
    for(let i=0;i<3;i++){
      const l=identifyQuestion(f.document);assert.ok(l);
      assert.equal(f.document.querySelector('.reference'),null);
      assert.equal(f.document.querySelector(`svg[aria-label="${l.char}"]`),null);
      assert.equal(f.document.querySelector('[data-action="check"]').hasAttribute('disabled'),true);
      answer(f,l);f.click('[data-action="next"]');
    }
    assert.ok(f.document.querySelector('.results-card'));
    assert.equal(f.read().sessions,1);
    assert.equal(Object.keys(f.read().records).length,3);
    assert.ok(Object.values(f.read().records).every(r=>r.independent===1));
    assert.equal(f.document.querySelectorAll('canvas,input[type="text"],input[type="file"]').length,0);
    f.click('[data-action="collection"]');assert.equal(f.document.querySelectorAll('.kanji-card.collected').length,3);
  }finally{f.restore();}
});
test('ヒント→見本確認で詰まらず完了でき、自力成功には数えない',async()=>{
  const f=await fixture();try{
    f.click('[data-action="collection"]');f.click('[data-action="detail"][data-char="念"]');f.click('[data-action="start-char"]');
    const l=LESSONS.find(l=>l.char==='念');answer(f,l);f.click('[data-action="next"]');f.click('[data-action="recall"]');
    for(let i=0;i<4;i++)f.click('[data-action="hint"]');
    assert.ok(f.document.querySelector('.success-message'));
    f.click('[data-action="next"]');assert.ok(f.document.querySelector('.results-card'));
    assert.equal(f.read().records['念'].independent,0);assert.equal(f.read().records['念'].lastResult,'review');
    assert.equal(f.read().records['念'].collected,true);
  }finally{f.restore();}
});
test('誤答を修正でき、タイマーはホームへ戻ると停止する',async()=>{
  const f=await fixture();try{
    f.click('[data-action="start"]');const l=LESSONS[0];
    f.click('[data-part="talent"]');f.click('[data-part="wood"]');f.click('[data-action="check"]');
    assert.ok(f.document.querySelector('.feedback').textContent.includes('おしい'));
    assert.equal(f.document.querySelector('.success-message'),null);
    f.click('[data-action="clear"]');answer(f,l);f.click('[data-action="next"]');
    answer(f,LESSONS[1]);f.click('[data-action="next"]');answer(f,LESSONS[2]);f.click('[data-action="next"]');
    assert.equal(f.timers.size,1);f.click('[data-action="home"]');assert.equal(f.timers.size,0);
  }finally{f.restore();}
});
test('保存禁止の環境でも、通常の学習を開始できる',async()=>{
  const f=await fixture({storageThrows:true});try{
    assert.ok(f.document.querySelector('.storage-notice'));f.click('[data-action="start"]');answer(f,LESSONS[0]);
    assert.ok(f.document.querySelector('.success-message'));
  }finally{f.restore();}
});
test('保存した獲得記録が再読込後にも図鑑に出る',async()=>{
  const f=await fixture({stored:{version:1,records:{材:{collected:true,attempts:1,independent:1,assisted:0,lastDate:'2026-11-05',due:'2026-11-06',independentDates:['2026-11-05'],lastResult:'independent'}},sessions:1,settings:{timer:false,sound:false}}});try{
    f.click('[data-action="collection"]');assert.equal(f.document.querySelectorAll('.kanji-card.collected').length,1);
    f.click('[data-action="detail"][data-char="材"]');assert.ok(f.document.querySelector('.detail-record').textContent.includes('1 回'));
  }finally{f.restore();}
});
