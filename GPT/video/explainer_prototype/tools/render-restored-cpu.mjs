import {bundle} from '@remotion/bundler';
import {selectComposition, renderStill, renderMedia} from '@remotion/renderer';
import {mkdir} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const out=path.join(root,'out/part2/restored_cpu');
await mkdir(out,{recursive:true});
const serveUrl=await bundle({entryPoint:path.join(root,'restored_cpu/src/index.ts'),publicDir:path.join(root,'public')});
for(const [id,frames] of [['LaterNarrationPreview',[630,1230]],['WorkflowNarrationPreview',[300,1230,2100,2700]]]){
 const composition=await selectComposition({serveUrl,id});
 for(const frame of frames){
  await renderStill({serveUrl,composition,frame,output:path.join(out,`${id}_${frame}.png`)});
  console.log(`${id} frame ${frame}`);
 }
 if(process.argv.includes('--video')){
  await renderMedia({serveUrl,composition,codec:'h264',crf:18,concurrency:12,
   ...(id==='LaterNarrationPreview'?{frameRange:[592,1850]}:{}),
   outputLocation:path.join(out,id==='LaterNarrationPreview'?'restored_C18-C19.mp4':'restored_C20-C23.mp4')});
 }
}
