import {LESSONS, PARTS, BY_CHAR} from './data.mjs';
import {normalizeProgress as oldProgress, shuffle, localDate} from './engine.mjs';

export const STUDY_KEY='kanji-kobo-name-first-v2';
const count=v=>Number.isSafeInteger(v)&&v>=0?Math.min(v,1000000):0;
const date=v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&!Number.isNaN(Date.parse(v))?v:null;
export const freshStudy=()=>({version:2,records:{},parts:{},legacy:oldProgress(null),sessions:0,settings:{sound:false,mode:'shape'}});
function metric(raw={}){
  if(!raw||typeof raw!=='object'||Array.isArray(raw))raw={};
  return {attempts:count(raw.attempts),successes:count(raw.successes),clean:count(raw.clean),assisted:count(raw.assisted),misses:count(raw.misses),dates:[...new Set((Array.isArray(raw.dates)?raw.dates:[]).map(date).filter(Boolean))].sort().slice(-60),lastDate:date(raw.lastDate),lastMethod:['checked','model'].includes(raw.lastMethod)?raw.lastMethod:null,lastHints:(Array.isArray(raw.lastHints)?raw.lastHints:[]).map(v=>Math.max(0,Math.min(3,count(v)))).slice(0,2),lastSawShape:raw.lastSawShape===true};
}
export function normalizeStudy(raw){
  const p=freshStudy();
  if(raw?.version===1){p.legacy=oldProgress(raw);p.settings.sound=p.legacy.settings.sound;return p;}
  if(raw?.version!==2)return p;
  p.legacy=oldProgress(raw.legacy);p.sessions=count(raw.sessions);
  p.settings={sound:raw.settings?.sound===true,mode:raw.settings?.mode==='pen'?'pen':'shape'};
  for(const l of LESSONS){const r=raw.records?.[l.char];if(r&&typeof r==='object'){p.records[l.char]={names:metric(r.names),shape:metric(r.shape),pen:metric(r.pen)};}}
  for(const id of Object.keys(PARTS)){const r=raw.parts?.[id];if(r&&typeof r==='object')p.parts[id]={name:metric(r.name),shape:metric(r.shape),pen:metric(r.pen)};}
  return p;
}
// 名前の候補と形の候補は別々に混ぜる。正解の場所を引き継がない。
const SIMILAR={wood:['hand','person','fire'],hand:['wood','person','water'],person:['hand','water','fire'],water:['person','hand','fire'],talent:['nail','axe','middle'],nail:['talent','axe','middle'],now:['public','heart'],public:['now','valley'],blue:['every','move'],every:['blue','stand']};
export function partCandidates(parts,size=12,random=Math.random){
  const correct=[...new Set(parts)];
  const near=shuffle([...new Set(correct.flatMap(id=>SIMILAR[id]||[]))].filter(id=>!correct.includes(id)),random).slice(0,Math.min(3,size-correct.length));
  const other=shuffle(Object.keys(PARTS).filter(id=>!correct.includes(id)&&!near.includes(id)),random);
  return shuffle([...correct,...near,...other].slice(0,size),random);
}
export const positions=layout=>layout==='tb'?['うえ','した']:['ひだり','みぎ'];
export const recipe=l=>l.parts.map((id,i)=>`${positions(l.layout)[i]}に ${PARTS[id][1]}`).join('、');
export function recordStudy(raw,char,kind,{hints=[],mistakes=0,model=false,sawShape=false}={},day=localDate()){
  if(!BY_CHAR[char]||!['names','shape','pen'].includes(kind))throw new Error('記録の種類が不正です');
  const p=normalizeStudy(raw);
  p.records[char]||={names:metric(),shape:metric(),pen:metric()};
  update(p.records[char][kind],{hints,mistakes,model,sawShape},day);return p;
}
export function recordPart(raw,id,kind,options={},day=localDate()){
  if(!PARTS[id]||!['name','shape','pen'].includes(kind))throw new Error('部品の記録が不正です');
  const p=normalizeStudy(raw);p.parts[id]||={name:metric(),shape:metric(),pen:metric()};
  update(p.parts[id][kind],options,day);return p;
}
function update(m,{hints=[],mistakes=0,model=false,sawShape=false}={},day){
  m.attempts++;m.lastDate=day;m.lastMethod=model?'model':'checked';m.lastHints=hints.slice(0,2);m.lastSawShape=sawShape;m.misses+=mistakes;
  const assisted=model||sawShape||mistakes>0||hints.some(v=>v>0);
  if(!model){m.successes++;m.dates=[...new Set([...m.dates,day])].sort().slice(-60);}
  if(assisted)m.assisted++;else m.clean++;
}
export function studySession(p,{review=false,size=3,day=localDate()}={}){
  const rank=l=>{const r=p.records[l.char];if(!r)return review?2:1;const final=r[p.settings.mode];if(!final.successes||final.lastMethod==='model')return 0;if(final.lastDate&&final.lastDate<day)return 0;return 3;};
  return [...LESSONS].sort((a,b)=>rank(a)-rank(b)||(p.records[a.char]?.names.lastDate||'').localeCompare(p.records[b.char]?.names.lastDate||'')||LESSONS.indexOf(a)-LESSONS.indexOf(b)).slice(0,size);
}
export function studyStats(p){
  const rs=Object.values(p.records);return {names:rs.filter(r=>r.names.successes>0).length,shape:rs.filter(r=>r.shape.successes>0).length,pen:rs.filter(r=>r.pen.successes>0).length,seen:rs.filter(r=>r.shape.attempts+r.pen.attempts>0).length};
}
