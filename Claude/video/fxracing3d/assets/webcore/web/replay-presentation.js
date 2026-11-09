import {loadCore} from './core-loader.js';
import {sha256} from './replay-format.js';
import {readPose} from './replay-trajectory.js';

export const PRESENTATION_RANGES=Object.freeze([[0x40,0x100],[0x6100,0x6130],[0x400,0x4a0],[0x6720,0x6740],[0x674d,0x674e]].map(range=>Object.freeze(range)));
export const PRESENTATION_BYTES=433;
// This is the archived MMC5 CPU/WRAM presentation contract, independent of
// app name, producer.variant, and recording epoch.
export const MMC5_CORE='d83f3265b10acb9f88f8cf2014e6d6ba17b849cb5be7eae4cc0233e35b2fd4fd';
export function needsNative3D(engine,requested,rom){const mmc5=rom?.length>=16&&rom[0]===78&&rom[1]===69&&rom[2]===83&&rom[3]===26&&((rom[6]>>4)|(rom[7]&240))===5;return requested==='3d'&&(engine.core===MMC5_CORE||mmc5);}
export function presentationPacket(source){
 const bytes=new Uint8Array(PRESENTATION_BYTES);let p=0;
 for(const [start,end] of PRESENTATION_RANGES)for(let a=start;a<end;a++)bytes[p++]=source._web_peek(a);
 return bytes;
}
export async function native3DPresentation(mode){
 const root=new URL('./presentation/',import.meta.url),response=await fetch(new URL('manifest.json',root));
 if(!response.ok)throw Error('3D表示データを取得できません。');
 const manifest=await response.json();if(manifest.contract!==1||manifest.packetBytes!==PRESENTATION_BYTES)throw Error('3D表示形式が一致しません。');
 const asset=async(name,hash)=>{const r=await fetch(new URL(name,root));if(!r.ok)throw Error('3D表示データを取得できません。');const b=new Uint8Array(await r.arrayBuffer());if(await sha256(b)!==hash)throw Error('3D表示データが一致しません。');return b;};
 const [rom,wasm,{default:createCore}]=await Promise.all([asset('game.nes',manifest.rom),asset('core.wasm',manifest.core),import(new URL('core.js',root).href)]);
 const core=await loadCore(createCore,wasm),p=core._malloc(rom.length);core.HEAPU8.set(rom,p);const loaded=core._web_load_rom(p,rom.length);core._free(p);if(!loaded)throw Error('3D表示を起動できません。');
 const run=(n,mask=0)=>{for(let i=0;i<n;i++)core._web_run(mask);};run(600);
 if((core._web_peek(0x674d)===1?'grip':'drift')!==mode){run(1,4);run(30);}run(1,8);
 for(let i=0;i<300&&core._web_peek(0x6720)!==1;i++)run(1);
 if(core._web_peek(0x6720)!==1)throw Error('3D表示を開始できません。');
 const buffer=core._malloc(PRESENTATION_BYTES);
 return {core,manifest,present(source){
  const packet=presentationPacket(source);core.HEAPU8.set(packet,buffer);
  if(!core._web_present_frame(buffer,packet.length))throw Error('3D表示の生成に失敗しました。');
  if(core.HEAPU8.buffer===source.HEAPU8.buffer||!presentationPacket(source).every((value,i)=>value===packet[i]))throw Error("Source replay state changed");
  const sourcePose=readPose(source),displayPose=readPose(core);
  if(!sourcePose.every((v,i)=>v===displayPose[i]))throw Error('3D表示の位置が元の記録と一致しません。');
  return {pixels:core.HEAPU8.slice(core._web_pixels(),core._web_pixels()+256*240*4),sourcePose,displayPose,renderer:'fxracing-rom',rendererRom:manifest.rom};
 }};
}
