import {bundle} from '@remotion/bundler';
import {selectComposition,renderStill,renderMedia} from '@remotion/renderer';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const out=path.join(root,'out/part2/intro_C01-C04_20260916');
await mkdir(path.join(out,'確認画像'),{recursive:true});
const m=JSON.parse(await readFile(path.join(root,'narration/intro-review-cuts.json'),'utf8'));
const serveUrl=await bundle({entryPoint:path.join(root,'src/index.ts'),publicDir:path.join(root,'public')});
const composition=await selectComposition({serveUrl,id:'IntroReviewC01C04'});
if(!process.argv.includes('--video-only')){
  for(const c of m.cuts){
    for(const fraction of c.id==='C04'?[.05,.25,.5,.75,.95]:[.25,.75]){
      await renderStill({serveUrl,composition,frame:c.startFrame+Math.floor(c.durationFrames*fraction),output:path.join(out,'確認画像',`${c.id}_${fraction}.png`)});
      console.log(`QA ${c.id} ${fraction}`);
    }
  }
}
await writeFile(path.join(out,'cuts.json'),JSON.stringify(m.cuts.map(c=>({id:c.id,title:c.title,startFrame:c.startFrame,durationFrames:c.durationFrames,audioSeconds:c.measuredDurationSeconds})),null,2));
if(process.argv.includes('--stills-only'))process.exit(0);
let last=-1;
await renderMedia({serveUrl,composition,codec:'h264',crf:18,concurrency:10,outputLocation:path.join(out,'C01-C04_通し.mp4'),onProgress:({progress})=>{const p=Math.floor(progress*100);if(p>=last+10){last=p;console.log(`render ${p}%`);}}});
for(const c of m.cuts){
  const clip=await selectComposition({serveUrl,id:`IntroReview${c.id}`});
  await renderMedia({serveUrl,composition:clip,codec:'h264',crf:18,concurrency:10,outputLocation:path.join(out,`${c.id}.mp4`)});
  console.log(`Ready ${c.id}`);
}
console.log('Ready C01-C04 and four individual cuts');
