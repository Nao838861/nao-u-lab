"""実素材・単位・音声・全編時刻を検証し、完成動画から確認画像を取り出す。"""
import json,hashlib,subprocess,wave
from pathlib import Path
from PIL import Image,ImageDraw
r=Path(__file__).resolve().parents[1];out=r/'out/part2/rebuilt'
m=json.loads((r/'narration/part2-cuts.json').read_text(encoding='utf-8'))
a=json.loads((r/'src/part2Alignment.json').read_text(encoding='utf-8'))
d=json.loads((r/'src/denseData.json').read_text(encoding='utf-8'))
old=json.loads((r/'restored_cpu/narration/later-cuts.json').read_text(encoding='utf-8'))['cuts'][1:]
assert m['fps']==30
cursor=0
for c in m['cuts']:
 assert c['startFrame']==cursor
 assert c['measuredDurationSeconds']<=c['durationFrames']/30
 wav=r/'public'/m['outputDirectory']/f"{c['id']}.wav"
 assert hashlib.sha256(wav.read_bytes()).hexdigest()==a[c['id']]['audioHash']
 starts=a[c['id']]['starts'];assert len(starts)==len(c['sentences']) and all(x<y for x,y in zip(starts,starts[1:]))
 cursor+=c['durationFrames']
for c in old:
 with wave.open(str(r/'public/narration/restored_cpu'/f"{c['id']}.wav")) as w:
  assert abs(w.getnframes()/w.getframerate()-c['durationFrames']/30)<.05,(c['id'],'audio length')
for i,img in enumerate(d['images']):
 p=r/'public'/img['file'];size=Image.open(p).size
 assert size==(img['w'],img['h']) and img['halfW']==img['w']//2
 assert hashlib.sha256(p.read_bytes()).hexdigest()==img['sha256']
e=d['enemy'];assert len(set(map(len,e.values())))==1
for n in range(len(e['sx'])):
 assert e['zb'][n]==e['wz'][n]//32,(n,'Z unit/bucket mismatch')
 assert 0<=e['sz'][n]<len(d['images'])
assert d['images'][e['sz'][20]]['w']<d['images'][e['sz'][110]]['w'],'far/near image sizes'
assert 14*4<=e['wz'][84]<=18*4+3,'collision Z interval'
frames=cursor+sum(c['durationFrames'] for c in old)
video=out/'part2_rebuilt_full_720p30.mp4'
info=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(video)]))
v=next(s for s in info['streams'] if s['codec_type']=='video')
assert int(v['nb_frames'])==frames and v['r_frame_rate']=='30/1' and v['width']==1280 and v['height']==720
assert any(s['codec_type']=='audio' for s in info['streams'])
samples=json.loads((out/'samples.json').read_text())
for s in samples:
 subprocess.run(['ffmpeg','-v','error','-ss',str(s['frame']/30),'-i',str(video),'-frames:v','1','-y',str(out/(s['id']+'.png'))],check=True)
sheet=Image.new('RGB',(1280,205*((len(samples)+3)//4)),'#16121c');draw=ImageDraw.Draw(sheet)
for i,s in enumerate(samples):
 im=Image.open(out/(s['id']+'.png'));im.thumbnail((320,180));x=i%4*320;y=i//4*205;sheet.paste(im,(x,y));draw.text((x+5,y+182),s['id'],fill='white')
sheet.save(out/'final_contact.jpg')
record={'frames':frames,'durationSeconds':frames/30,'size':int(info['format']['size']),'nativeScenes':len(old)+len(m['cuts']),'checkedSprites':len(d['images']),'checkedRows':len(e['sx']),'finalScreens':len(samples)}
(out/'verification.json').write_text(json.dumps(record,indent=2)+'\n')
print(record)
