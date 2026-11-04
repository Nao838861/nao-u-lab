
// DOM上の実イベントで学習フローを確認する。実機の描画・音声の代わりにはならない。
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {parseHTML} from 'linkedom';
import {LESSONS,PARTS} from './dist/data.mjs';
import {STORAGE_KEY} from './dist/engine.mjs';
import {STUDY_KEY, freshStudy} from './dist/study.mjs';
import {samplePath} from './dist/handwriting.mjs';

const glyphs=JSON.parse(await readFile(new URL('./dist/glyphs.json',import.meta.url),'utf8'));
let serial=0;
async function fixture({stored=null,legacy=null,storageThrows=false,glyphError=false}={}){
  const {window,document}=parseHTML(await readFile(new URL('./dist/index.html',import.meta.url),'utf8'));
  const values=new Map();if(stored)values.set(STUDY_KEY,JSON.stringify(stored));if(legacy)values.set(STORAGE_KEY,JSON.stringify(legacy));
  const real={};for(const key of ['window','document','localStorage','fetch'])real[key]=globalThis[key];
  window.scrollTo=()=>{};globalThis.window=window;globalThis.document=document;
  globalThis.localStorage={getItem:key=>{if(storageThrows)throw Error('blocked');return values.get(key)||null;},setItem:(key,value)=>{if(storageThrows)throw Error('blocked');values.set(key,value);}};
  globalThis.fetch=async()=>({ok:!glyphError,json:async()=>glyphs});
  await import(`./dist/app.mjs?test=${serial++}`);
  return {document,window,values,click(selector){const b=document.querySelector(selector);assert.ok(b,`存在する: ${selector}`);assert.equal(b.hasAttribute('disabled'),false,`有効: ${selector}`);b.dispatchEvent(new window.Event('click',{bubbles:true}));},pointer(target,type,x,y,id=1,pointerType='pen'){const e=new window.Event(type,{bubbles:true,cancelable:true});Object.assign(e,{pointerId:id,pointerType,button:0,clientX:x,clientY:y,width:2});target.dispatchEvent(e);},restore(){for(const [k,v] of Object.entries(real))globalThis[k]=v;},read(){return JSON.parse(values.get(STUDY_KEY)||'null');}};
}
function names(f,l){f.click(`[data-action="name-layout"][data-layout="${l.layout}"]`);for(const id of l.parts)f.click(`[data-action="name"][data-part="${id}"]`);f.click('[data-action="check-names"]');}
function shapes(f,ids){for(const id of ids)f.click(`[data-action="shape"][data-part="${id}"]`);f.click('[data-action="check-shape"]');}
function oneChar(f,char){f.click('[data-action="collection"]');f.click(`[data-action="detail"][data-char="${char}"]`);f.click('[data-action="start-char"]');}
function draw(f,strokes){const pad=f.document.querySelector('#ink-pad');assert.ok(pad);pad.getBoundingClientRect=()=>({left:0,top:0,width:109,height:109,right:109,bottom:109});let id=1;for(const stroke of strokes){f.pointer(pad,'pointerdown',...stroke[0],id);for(const point of stroke.slice(1))f.pointer(pad,'pointermove',...point,id);f.pointer(pad,'pointerup',...stroke.at(-1),id++);}}

test('ひらがなの名前→12候補の形で、3文字を紙なしで完走できる',async()=>{
  const f=await fixture();try{
    f.click('[data-action="start"]');
    for(const l of LESSONS.slice(0,3)){
      assert.equal(f.document.querySelector('.shape-palette'),null);
      assert.equal(f.document.querySelector('.kanji-glyph'),null);
      assert.equal(f.document.querySelector('.component-glyph'),null);
      assert.equal(f.document.querySelectorAll('.name-option').length,6);
      assert.ok([...f.document.querySelectorAll('.name-option')].every(el=>/^[ぁ-ゖー]+$/.test(el.textContent)));
      assert.ok(f.document.querySelector('h1').textContent.includes(l.wordReading));
      names(f,l);
      assert.equal(f.document.querySelectorAll('.shape-option').length,12);
      assert.ok([...f.document.querySelectorAll('.shape-option')].every(el=>!el.textContent.trim()));
      assert.equal(f.document.querySelector(`svg[aria-label="${l.char}"]`),null);
      shapes(f,l.parts);f.click('[data-action="next"]');
    }
    assert.equal(f.document.querySelectorAll('.result-item').length,3);
    assert.equal(f.read().sessions,1);
    for(const r of Object.values(f.read().records)){assert.equal(r.names.successes,1);assert.equal(r.shape.successes,1);assert.equal(r.pen.successes,0);}
  }finally{f.restore();}
});
test('ペン設定を保存し、毎問のモード選択なしで名前から筆記へ進む',async()=>{
  const f=await fixture();try{
    f.click('[data-action="mode"][data-mode="pen"]');assert.equal(f.read().settings.mode,'pen');
    f.click('[data-action="start"]');names(f,LESSONS[0]);
    assert.ok(f.document.querySelector('#ink-pad'));assert.equal(f.document.querySelector('.shape-option'),null);
    assert.equal(f.document.querySelector('[data-action="check-pen"]').hasAttribute('disabled'),true);
    draw(f,glyphs['材'].flat().map(samplePath));
    const ink=[...f.document.querySelectorAll('#ink-strokes path')].map(p=>p.getAttribute('d'));
    f.click('[data-action="part-hint"][data-slot="0"]');assert.deepEqual([...f.document.querySelectorAll('#ink-strokes path')].map(p=>p.getAttribute('d')),ink);
    f.click('[data-action="check-pen"]');
    assert.ok(f.document.querySelector('.done-panel'));assert.equal(f.read().records['材'].pen.successes,1);
    assert.equal(f.read().records['材'].shape.successes,0);assert.deepEqual(f.read().records['材'].pen.lastHints,[1,0]);
    f.click('[data-action="next"]');names(f,LESSONS[1]);assert.ok(f.document.querySelector('#ink-pad'));
  }finally{f.restore();}
});
test('形からペンへの切替は筆跡を保持し、形を見た後として記録する',async()=>{
  const f=await fixture();try{
    oneChar(f,'仲');names(f,LESSONS.find(l=>l.char==='仲'));
    f.click('[data-action="mode"][data-mode="pen"]');draw(f,glyphs['仲'].flat().map(samplePath));
    const ink=[...f.document.querySelectorAll('#ink-strokes path')].map(p=>p.getAttribute('d'));
    f.click('[data-action="mode"][data-mode="shape"]');f.click('[data-action="mode"][data-mode="pen"]');
    assert.deepEqual([...f.document.querySelectorAll('#ink-strokes path')].map(p=>p.getAttribute('d')),ink);
    f.click('[data-action="check-pen"]');const r=f.read().records['仲'];
    assert.equal(r.pen.lastSawShape,true);assert.equal(r.pen.clean,0);assert.equal(r.pen.assisted,1);assert.equal(r.shape.successes,0);
  }finally{f.restore();}
});
test('上下の名前・形を扱え、誤配置は先へ進まず修正できる',async()=>{
  const f=await fixture();try{
    oneChar(f,'念');const l=LESSONS.find(l=>l.char==='念');
    for(const id of l.parts)f.click(`[data-action="name"][data-part="${id}"]`);
    f.click('[data-action="check-names"]');assert.equal(f.document.querySelector('.shape-board'),null);
    f.click('[data-action="name-layout"][data-layout="tb"]');f.click('[data-action="check-names"]');
    assert.ok(f.document.querySelector('.shape-board.tb'));
    shapes(f,[...l.parts].reverse());assert.equal(f.document.querySelector('.done-panel'),null);
    f.click('[data-action="clear-shape"]');shapes(f,l.parts);assert.equal(f.read().records['念'].shape.clean,0);
    assert.equal(f.read().records['念'].names.misses,1);
  }finally{f.restore();}
});
test('ヒントが名前→局所の形→書き順で開き、部品練習から元へ戻れる',async()=>{
  const f=await fixture();try{
    f.click('[data-action="mode"][data-mode="pen"]');oneChar(f,'仲');names(f,LESSONS.find(l=>l.char==='仲'));
    f.click('[data-action="part-hint"][data-slot="0"]');assert.equal(f.document.querySelector('.hint-shape'),null);
    f.click('[data-action="part-hint"][data-slot="0"]');assert.equal(f.document.querySelectorAll('.hint-shape').length,1);
    f.click('[data-action="part-hint"][data-slot="0"]');assert.ok(f.document.querySelector('.hint-shape .stroke-animation'));
    f.click('[data-action="practice-part"][data-part="person"]');assert.ok(f.document.querySelector('h1').textContent.includes('にんべん'));
    f.click('[data-action="return"]');assert.ok(f.document.querySelector('.recipe-bar').textContent.includes('なか'));
    f.click('[data-action="model"]');assert.equal(f.read().records['仲'].pen.successes,0);assert.equal(f.read().records['仲'].pen.lastMethod,'model');
    f.click('[data-action="next"]');assert.ok(f.document.querySelector('.result-item'));
  }finally{f.restore();}
});
test('部品専用モードの両方向は漢字の記録と混ざらない',async()=>{
  const f=await fixture();try{
    f.click('[data-action="parts"]');assert.equal(f.document.querySelectorAll('.part-card').length,Object.keys(PARTS).length);
    f.click('[data-action="start-part-name"][data-part="water"]');f.click('[data-action="name-answer"][data-part="water"]');f.click('[data-action="next"]');
    f.click('[data-action="parts"]');f.click('[data-action="start-part-form"][data-part="water"]');
    assert.equal(f.document.querySelectorAll('.shape-option').length,12);shapes(f,['water']);
    assert.equal(f.read().parts.water.name.successes,1);assert.equal(f.read().parts.water.shape.successes,1);assert.deepEqual(f.read().records,{});
  }finally{f.restore();}
});
test('旧版の成功を新しい名前・ペンの成功へ移さない',async()=>{
  const legacy={version:1,records:{材:{collected:true,independent:3,independentDates:['2026-11-05']}},settings:{sound:false}};
  const f=await fixture({legacy});try{
    f.click('[data-action="collection"]');assert.equal(f.document.querySelectorAll('.legacy-badge').length,1);
    f.click('[data-action="settings"]');f.click('[data-action="mode"][data-mode="pen"]');
    assert.deepEqual(f.read().records,{});assert.equal(f.read().legacy.records['材'].independent,3);
  }finally{f.restore();}
});
test('保存済みモードは再読込後にも有効で、保存禁止でも完走できる',async()=>{
  const p=freshStudy();p.settings.mode='pen';const f=await fixture({stored:p});try{f.click('[data-action="start"]');names(f,LESSONS[0]);assert.ok(f.document.querySelector('#ink-pad'));}finally{f.restore();}
  const g=await fixture({storageThrows:true});try{assert.ok(g.document.querySelector('.storage-notice'));oneChar(g,'材');names(g,LESSONS[0]);shapes(g,LESSONS[0].parts);g.click('[data-action="next"]');assert.ok(g.document.querySelector('.result-item'));}finally{g.restore();}
});
test('無意味な線ではペン成功にせず、取り消しと全消去が動く',async()=>{
  const p=freshStudy();p.settings.mode='pen';const f=await fixture({stored:p});try{
    oneChar(f,'材');names(f,LESSONS[0]);draw(f,[[[10,10],[90,90]],[[10,90],[90,10]]]);
    f.click('[data-action="check-pen"]');assert.equal(f.document.querySelector('.done-panel'),null);assert.equal(f.read().records['材'].pen.successes,0);
    f.click('[data-action="undo"]');assert.equal(f.document.querySelectorAll('#ink-strokes path').length,1);
    f.click('[data-action="clear-ink"]');assert.equal(f.document.querySelectorAll('#ink-strokes path').length,0);assert.ok(f.document.querySelector('[data-action="check-pen"]').disabled);
    f.click('[data-action="model"]');f.click('[data-action="next"]');assert.ok(f.document.querySelector('.result-item'));
  }finally{f.restore();}
});
test('最初から名前をドラッグでき、置いた位置で上下の配置へ変わる',async()=>{
  const f=await fixture();try{
    oneChar(f,'念');const board=f.document.querySelector('.name-board');
    board.getBoundingClientRect=()=>({left:0,top:0,width:200,height:200,right:200,bottom:200});
    const option=f.document.querySelector('[data-action="name"][data-part="now"]');
    f.pointer(option,'pointerdown',250,30,11,'touch');f.pointer(option,'pointermove',100,20,11,'touch');f.pointer(option,'pointerup',100,20,11,'touch');
    assert.ok(f.document.querySelector('.name-board.tb'));assert.ok(f.document.querySelector('.name-slot').textContent.includes('いま'));
    assert.equal(f.document.querySelector('.drag-ghost'),null);
  }finally{f.restore();}
});
test('ペンのキャンセルで途中の線だけを消し、見本を閉じたら形を隠す',async()=>{
  const p=freshStudy();p.settings.mode='pen';const f=await fixture({stored:p});try{
    oneChar(f,'仲');names(f,LESSONS.find(l=>l.char==='仲'));
    const pad=f.document.querySelector('#ink-pad');pad.getBoundingClientRect=()=>({left:0,top:0,width:109,height:109});
    f.pointer(pad,'pointerdown',20,20);f.pointer(pad,'pointermove',50,60);f.pointer(pad,'pointercancel',50,60);
    assert.equal(f.document.querySelectorAll('#ink-strokes path').length,0);
    f.click('[data-action="part-hint"][data-slot="0"]');f.click('[data-action="part-hint"][data-slot="0"]');
    f.click('[data-action="model"]');f.click('[data-action="retry"]');
    assert.equal(f.document.querySelector('.hint-shape'),null);assert.equal(f.document.querySelector('.kanji-glyph'),null);
    draw(f,glyphs['仲'].flat().map(samplePath));f.click('[data-action="check-pen"]');
    assert.equal(f.read().records['仲'].pen.clean,0);assert.deepEqual(f.read().records['仲'].pen.lastHints,[2,0]);
  }finally{f.restore();}
});
test('全12字が名前から形選択の実イベントで完了する',async()=>{
  const f=await fixture();try{
    for(const l of LESSONS){oneChar(f,l.char);names(f,l);assert.equal(f.document.querySelectorAll('.shape-option').length,12);shapes(f,l.parts);assert.ok(f.document.querySelector('.done-panel'));}
    assert.equal(Object.keys(f.read().records).length,12);assert.ok(Object.values(f.read().records).every(r=>r.shape.successes===1&&r.pen.successes===0));
  }finally{f.restore();}
});
