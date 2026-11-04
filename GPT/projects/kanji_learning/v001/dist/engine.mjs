import {LESSONS, BY_CHAR, PARTS} from './data.mjs';
export const STORAGE_KEY = 'kanji-kobo-v001';
export function localDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
export function addDays(day, amount) {
  const d = new Date(`${day}T12:00:00`); d.setDate(d.getDate()+amount); return localDate(d);
}
export function freshProgress() {return {version:1, records:{}, sessions:0, settings:{sound:false,timer:true}};}
export function normalizeProgress(raw) {
  const p = freshProgress();
  if (!raw || raw.version!==1 || !raw.records || typeof raw.records!=='object' || Array.isArray(raw.records)) return p;
  const count = v=>Number.isSafeInteger(v)&&v>=0?Math.min(v,1000000):0;
  const date = v=> typeof v==='string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v)) ? v : null;
  for(const l of LESSONS){
    const r=raw.records[l.char]; if(!r || typeof r!=='object') continue;
    p.records[l.char]={collected:r.collected===true,attempts:count(r.attempts),independent:count(r.independent),assisted:count(r.assisted),lastDate:date(r.lastDate),due:date(r.due),independentDates:[...new Set((Array.isArray(r.independentDates)?r.independentDates:[]).map(date).filter(Boolean))].sort().slice(-60),lastResult:['independent','assisted','review'].includes(r.lastResult)?r.lastResult:'review'};
  }
  p.sessions=count(raw.sessions);
  p.settings.sound=raw.settings?.sound===true;
  p.settings.timer=raw.settings?.timer!==false;
  return p;
}
export function shuffle(items, random=Math.random) {
  const a=[...items]; for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;
}
export function candidates(lesson,random=Math.random){
  const other=shuffle(Object.keys(PARTS).filter(id=>!lesson.parts.includes(id)),random).slice(0,4);
  return shuffle([...lesson.parts,...other],random);
}
export function isCorrect(lesson,layout,slots){
  return layout===lesson.layout && slots.length===lesson.parts.length && slots.every((p,i)=>p===lesson.parts[i]);
}
export function recordResult(progress,char,{hinted=false,mistakes=0,revealed=false}={},day=localDate()){
  if(!BY_CHAR[char]) throw new Error('未登録の漢字です');
  const p=normalizeProgress(progress);
  const r=p.records[char]||{collected:false,attempts:0,independent:0,assisted:0,independentDates:[]};
  const independent=!hinted && mistakes===0 && !revealed;
  r.collected=true;r.attempts+=1;r.lastDate=day;
  r.lastResult=revealed?'review':independent?'independent':'assisted';
  if(independent){r.independent++;r.independentDates=[...new Set([...r.independentDates,day])].sort().slice(-60);}
  else r.assisted++;
  r.due=addDays(day,independent?(r.independentDates.length>=3?7:r.independentDates.length>=2?3:1):1);
  p.records[char]=r; return p;
}
export function selectSession(progress,{review=false,size=3,day=localDate()}={}){
  const records=progress.records;
  const rank=l=>{const r=records[l.char];if(!r?.collected)return review?4:1;if(r.lastResult!=='independent')return 0;if(r.due && r.due<=day)return 0;return review?2:3;};
  return [...LESSONS].sort((a,b)=>rank(a)-rank(b)||(records[a.char]?.lastDate||'').localeCompare(records[b.char]?.lastDate||'')||LESSONS.indexOf(a)-LESSONS.indexOf(b)).slice(0,size);
}
export function stats(progress,day=localDate()){
  const records=Object.values(progress.records);
  return {collected:records.filter(r=>r.collected).length,independent:records.filter(r=>r.independent>0).length,anotherDay:records.filter(r=>r.independentDates.length>=2).length,due:records.filter(r=>r.collected&&(r.lastResult!=='independent'||r.due<=day)).length};
}
