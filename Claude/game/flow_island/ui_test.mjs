// index.htmlのモジュールJSをDOMスタブで実行するランタイムテスト
// 検出対象: 参照エラー・構文エラー・エンジンAPI不整合(過去の「画面真っ黒」事故の再発防止)
// 3秒走らせて例外が出なければOK(タイマー駆動のUIループはprocess.exitで自決)
import fs from 'fs';
globalThis.innerWidth=800;globalThis.innerHeight=600;globalThis.devicePixelRatio=1;
globalThis.addEventListener=()=>{};
globalThis.requestAnimationFrame=()=>{};
globalThis.localStorage={getItem:()=>null,setItem(){}};
const mkEl=()=>new Proxy(function(){},{get:(t,k)=>{
  if(k==='style')return new Proxy({},{get:()=>'',set:()=>true});
  if(k==='classList')return{add(){},remove(){},toggle(){},contains:()=>false};
  if(k==='children'||k==='childNodes')return[];
  if(k==='textContent'||k==='innerHTML'||k==='value'||k==='id'||k==='className')return '';
  if(k==='addEventListener'||k==='appendChild'||k==='removeChild'||k==='remove'||k==='setAttribute'||k==='focus')return()=>{};
  if(k==='getBoundingClientRect')return()=>({left:0,top:0,width:800,height:600});
  if(k==='querySelectorAll')return()=>[];
  if(k==='querySelector')return()=>mkEl();
  if(k===Symbol.toPrimitive)return()=>'';
  return mkEl();},set:()=>true,apply:()=>mkEl()});
const ctx=new Proxy({},{get:(t,k)=>k==='measureText'?()=>({width:10}):()=>{},set:()=>true});
const canvas={getContext:()=>ctx,width:800,height:600,addEventListener(){},getBoundingClientRect:()=>({left:0,top:0,width:800,height:600}),style:{}};
globalThis.document={getElementById:id=>id==='cv'?canvas:mkEl(),createElement:()=>mkEl(),body:mkEl(),addEventListener(){},documentElement:mkEl(),querySelectorAll:()=>[],querySelector:()=>mkEl()};
globalThis.window=new Proxy({addEventListener(){},innerWidth:800,innerHeight:600,devicePixelRatio:1,location:{search:''}},{get:(t,k)=>t[k]??(()=>{}),set:()=>true});
const html=fs.readFileSync(new URL('./index.html',import.meta.url),'utf8');
const m=html.match(/<script type="module">([\s\S]*?)<\/script>/);
const src=m[1].replace(/\.\/engine\.js\?v=\d+/,'./engine.js');
const tmp=new URL('./.ui_test_main.mjs',import.meta.url);
fs.writeFileSync(tmp,src);
setTimeout(()=>{console.log('UI OK (3秒間例外なし)');fs.unlinkSync(tmp);process.exit(0);},3000);
await import(tmp).catch(e=>{console.error('UI FAIL',e.stack||e.message);fs.unlinkSync(tmp);process.exit(1);});
