// 解説用コア（切り替えOFF）が、Web版の元のコアと全コマ同じ画面・音を出すことを確かめる
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {pathToFileURL} from 'node:url';
const root=path.resolve('.');const N=Number(process.argv[2]??4500);
const {loadCore}=await import(pathToFileURL(path.join(root,'webcore/core-loader.js')).href);
async function run(dir){
  const createCore=(await import(pathToFileURL(path.join(root,'webcore',dir,'core.js')).href)).default;
  const core=await loadCore(createCore,fs.readFileSync(path.join(root,'webcore',dir,'core.wasm')));
  const rom=fs.readFileSync('webcore/rank8.nes');const p=core._malloc(rom.length);core.HEAPU8.set(rom,p);core._web_load_rom(p,rom.length);core._free(p);
  const h=crypto.createHash('sha256'),a=crypto.createHash('sha256');
  for(let i=0;i<N;i++){core._web_run(i>=300&&i<306?32:i>=360&&i<366?8:0);
    h.update(core.HEAPU8.subarray(core._web_pixels(),core._web_pixels()+256*240*4));
    const n=core._web_audio_frames()*2;a.update(Buffer.from(core.HEAP16.slice(core._web_audio()>>1,(core._web_audio()>>1)+n).buffer));}
  return {video:h.digest('hex'),audio:a.digest('hex')};
}
const A=await run('emulator'),B=await run('explainer');
console.log(JSON.stringify({frames:N,original:A,explainer:B,same:A.video===B.video&&A.audio===B.audio}));
