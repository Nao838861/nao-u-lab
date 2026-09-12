"""タイムライン・素材・文境界を検証し、レビュー用一覧画像を作る。"""
import json,hashlib
from pathlib import Path
from PIL import Image,ImageDraw
ROOT=Path(__file__).resolve().parents[1]
m=json.loads((ROOT/'narration/part2-cuts.json').read_text(encoding='utf-8'))
a=json.loads((ROOT/'src/part2Alignment.json').read_text(encoding='utf-8'))
last=0
for c in m['cuts']:
    assert c['startFrame']==last,(c['id'],'timeline gap')
    assert c['measuredDurationSeconds']*60 <= c['durationFrames'],c['id']
    assert (ROOT/'public/narration/part2'/f"{c['id']}.wav").exists()
    assert hashlib.sha256((ROOT/'public/narration/part2'/f"{c['id']}.wav").read_bytes()).hexdigest()==a[c['id']]['audioHash'],(c['id'],'stale alignment')
    starts=a[c['id']]['starts']
    assert len(starts)==len(c['sentences'])
    assert all(x<=y for x,y in zip(starts,starts[1:])),c['id']
    last=c['startFrame']+c['durationFrames']
print(f'Validated {len(m["cuts"])} cuts, {last} frames, {last/60:.3f}s')
for fraction in (.25,.7):
    canvas=Image.new('RGB',(1280,((len(m['cuts'])+3)//4)*205),'#162030')
    draw=ImageDraw.Draw(canvas)
    for i,c in enumerate(m['cuts']):
        im=Image.open(ROOT/'out/part2'/f'{c["id"]}_{fraction}.png').convert('RGB')
        im.thumbnail((320,180));x=(i%4)*320;y=(i//4)*205
        canvas.paste(im,(x,y));draw.text((x+8,y+183),c['id'],fill='white')
    canvas.save(ROOT/'out/part2'/f'contact_{fraction}.jpg')
