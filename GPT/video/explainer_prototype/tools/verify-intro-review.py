"""確認用の通し版・単体4本を検査し、完成動画の代表画面を取り出す。"""
import hashlib,json,subprocess
from pathlib import Path
from PIL import Image,ImageDraw
ROOT=Path(__file__).resolve().parents[1]
m=json.loads((ROOT/'narration/intro-review-cuts.json').read_text(encoding='utf-8'))
OUT=ROOT/m.get('reviewOutputDirectory','out/part2/開発中カット')
a=json.loads((ROOT/'src/introReviewAlignment.json').read_text(encoding='utf-8'))
cues=json.loads((ROOT/'src/introReviewCues.json').read_text(encoding='utf-8'))
assert cues['audioHash']==a['C03']['audioHash']
tree=json.loads((ROOT/'src/introTreeData.json').read_text(encoding='utf-8'))
cursor=0
for c in m['cuts']:
    assert c['startFrame']==cursor
    assert c['measuredDurationSeconds']*30+c.get('narrationLeadFrames',0)<c['durationFrames']
    wav=ROOT/'public'/m['outputDirectory']/(c['id']+'.wav')
    assert hashlib.sha256(wav.read_bytes()).hexdigest()==a[c['id']]['audioHash']
    assert len(c['sentences'])==len(a[c['id']]['starts'])
    cursor+=c['durationFrames']
for im in tree['images']:
    p=ROOT/'public'/im['file']
    assert Image.open(p).size==(im['w'],im['h'])
    assert hashlib.sha256(p.read_bytes()).hexdigest()==im['sha256']
assert len(tree['scale'])==len(tree['size'])==len(tree['groundY'])==56
assert set(tree['size'])==set(range(16))
assert all(a>=b for a,b in zip(tree['scale'],tree['scale'][1:]))
assert all(a>=b for a,b in zip(tree['groundY'],tree['groundY'][1:]))
# 実際に描画へ使う関数を実行し、全56位置がガイドと同じ直線上にあるかを検査。
js="""
import {readFileSync} from 'node:fs';
const tree=JSON.parse(readFileSync('src/introTreeData.json','utf8'));
const source=readFileSync('src/IntroReview.tsx','utf8');
const body=source.match(/export const treePosition=\\(z:number\\)=>(.*);/)[1];
const fn=new Function('tree','z','return '+body);
const depthBody=source.match(/export const treeDepth=\\(progress:number\\)=>(.*);/)[1];
const depth=new Function('progress','return '+depthBody);
if(JSON.stringify(Array.from({length:8},(_,i)=>depth(i/7)))!==JSON.stringify([0,55,0,55,0,55,0,55]))throw new Error('Incorrect depth sequence');
for(let leg=0;leg<7;leg++){
 const values=Array.from({length:169},(_,i)=>depth((leg+i/168)/7));
 if(new Set(values.map(z=>tree.size[z])).size!==16)throw new Error('Incomplete image sequence');
}
console.log(JSON.stringify(Array.from({length:56},(_,z)=>fn(tree,z))));
"""
points=json.loads(subprocess.run(['node','--input-type=module'],input=js,text=True,capture_output=True,cwd=ROOT,check=True).stdout)
dx=points[0]['x']-370;dy=points[0]['y']-100
assert all(abs((p['x']-370)*dy-(p['y']-100)*dx)<1e-7 for p in points)
files=[('C01-C08_通し.mp4',cursor),('C01-C06_通し.mp4',sum(c['durationFrames'] for c in m['cuts'][:6])),('C01-C04_通し.mp4',sum(c['durationFrames'] for c in m['cuts'][:4]))]+[(c['id']+'.mp4',c['durationFrames']) for c in m['cuts']]
files.append(('C03-C04_通し.mp4',sum(c['durationFrames'] for c in m['cuts'][2:4])))
results=[]
for filename,frames in files:
    p=OUT/filename
    probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-count_frames','-show_streams','-of','json',str(p)]))
    v=next(s for s in probe['streams'] if s['codec_type']=='video')
    assert (v['width'],v['height'],v['r_frame_rate'],int(v['nb_read_frames']))==(1280,720,'30/1',frames),(filename,v)
    assert any(s['codec_type']=='audio' for s in probe['streams'])
    decoded=subprocess.run(['ffmpeg','-v','error','-xerror','-i',str(p),'-f','null','-'],check=True,capture_output=True)
    assert not decoded.stderr,(filename,decoded.stderr.decode(errors='replace'))
    if filename in ['C05.mp4','C06.mp4','C07.mp4','C08.mp4']:
        cut=next(c for c in m['cuts'] if c['id']+'.mp4'==filename)
        assert cut['narrationLeadFrames']==18
        pcm=subprocess.check_output(['ffmpeg','-v','error','-i',str(p),'-t','0.5','-vn','-ac','1','-ar','24000','-f','s16le','-'])
        import array
        samples_pcm=array.array('h',pcm)
        assert max(abs(v) for v in samples_pcm)<20,(filename,'冒頭の一拍に音声あり')
    results.append(dict(file=filename,frames=frames,seconds=frames/30,bytes=p.stat().st_size))
stills=OUT/'確認画像';stills.mkdir(exist_ok=True)
samples=[]
for c in m['cuts']:
    fractions=([.03,.25,.5,.75,.97] if c['id']=='C04' else [.05,.22,.43,.66,.92] if c['id'] in ['C03','C05','C06','C07','C08'] else [.25,.85])
    if c['id']=='C04':fractions+= [(9+(c['durationFrames']-36)*p)/c['durationFrames'] for p in [i/7 for i in range(8)]]
    if c['id']=='C06':fractions+=[.98]
    if c['id']=='C08':
        lead=c.get('narrationLeadFrames',0)/30;start=a['C08']['starts'][1]
        window=c['durationFrames']/30-lead-start-.4
        fractions += [(lead+start+window*(i+.72)/5)/(c['durationFrames']/30) for i in range(5)]
        fractions += [(lead+start+window*p/5)/(c['durationFrames']/30) for p in [.01,.24,.35,.46,.57]]
    for f in fractions:
        frame=int(c['durationFrames']*f)
        dest=stills/f"final_{c['id']}_{f}.png"
        subprocess.run(['ffmpeg','-v','error','-threads','1','-xerror','-i',str(OUT/(c['id']+'.mp4')),'-vf',f'select=eq(n\\,{frame})','-frames:v','1','-y',str(dest)],check=True)
        samples.append((dest,c['id'],frame))
sheet=Image.new('RGB',(960,205*((len(samples)+2)//3)),(20,20,24));draw=ImageDraw.Draw(sheet)
for i,(p,cid,frame) in enumerate(samples):
    x=i%3*320;y=i//3*205
    im=Image.open(p);im.thumbnail((320,180));sheet.paste(im,(x,y));draw.text((x+5,y+182),f'{cid} f{frame}',fill='white')
sheet.save(stills/'final_contact.jpg')
(OUT/'verification.json').write_text(json.dumps({'videos':results,'verifiedTreeImages':16,'finalScreens':len(samples),'narrationSimilarities':{k:v['similarity'] for k,v in a.items()}},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(f'PASS: {len(files)} videos, {cursor} combined frames, 16 tree images, {len(samples)} final screenshots')
