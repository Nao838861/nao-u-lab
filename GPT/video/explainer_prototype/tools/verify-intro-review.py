"""確認用の通し版・単体4本を検査し、完成動画の代表画面を取り出す。"""
import hashlib,json,subprocess
from pathlib import Path
from PIL import Image,ImageDraw
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'out/part2/intro_C01-C04_20260916'
m=json.loads((ROOT/'narration/intro-review-cuts.json').read_text(encoding='utf-8'))
a=json.loads((ROOT/'src/introReviewAlignment.json').read_text(encoding='utf-8'))
tree=json.loads((ROOT/'src/introTreeData.json').read_text(encoding='utf-8'))
cursor=0
for c in m['cuts']:
    assert c['startFrame']==cursor
    assert c['measuredDurationSeconds']*30<c['durationFrames']
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
files=[('C01-C04_通し.mp4',cursor)]+[(c['id']+'.mp4',c['durationFrames']) for c in m['cuts']]
results=[]
for filename,frames in files:
    p=OUT/filename
    probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-count_frames','-show_streams','-of','json',str(p)]))
    v=next(s for s in probe['streams'] if s['codec_type']=='video')
    assert (v['width'],v['height'],v['r_frame_rate'],int(v['nb_read_frames']))==(1280,720,'30/1',frames),(filename,v)
    assert any(s['codec_type']=='audio' for s in probe['streams'])
    subprocess.run(['ffmpeg','-v','error','-i',str(p),'-f','null','-'],check=True,capture_output=True)
    results.append(dict(file=filename,frames=frames,seconds=frames/30,bytes=p.stat().st_size))
stills=OUT/'確認画像';stills.mkdir(exist_ok=True)
samples=[]
for c in m['cuts']:
    for f in ([.03,.25,.5,.75,.97] if c['id']=='C04' else [.25,.85]):
        frame=int(c['durationFrames']*f)
        dest=stills/f"final_{c['id']}_{f}.png"
        subprocess.run(['ffmpeg','-v','error','-i',str(OUT/(c['id']+'.mp4')),'-vf',f'select=eq(n\\,{frame})','-frames:v','1','-y',str(dest)],check=True)
        samples.append((dest,c['id'],frame))
sheet=Image.new('RGB',(960,205*((len(samples)+2)//3)),(20,20,24));draw=ImageDraw.Draw(sheet)
for i,(p,cid,frame) in enumerate(samples):
    x=i%3*320;y=i//3*205
    im=Image.open(p);im.thumbnail((320,180));sheet.paste(im,(x,y));draw.text((x+5,y+182),f'{cid} f{frame}',fill='white')
sheet.save(stills/'final_contact.jpg')
(OUT/'verification.json').write_text(json.dumps({'videos':results,'verifiedTreeImages':16,'finalScreens':len(samples),'narrationSimilarities':{k:v['similarity'] for k,v in a.items()}},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(f'PASS: 5 videos, {cursor} combined frames, 16 tree images, {len(samples)} final screenshots')
