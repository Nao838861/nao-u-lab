"""C03の発話句に画面の表示開始を合わせる。カット尺の割合では指定しない。"""
import difflib,hashlib,json,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
m=json.loads((ROOT/'narration/intro-review-cuts.json').read_text(encoding='utf-8'))
c=next(c for c in m['cuts'] if c['id']=='C03')
audio=ROOT/'public'/m['outputDirectory']
tr=json.loads((audio/'transcripts/C03.json').read_text(encoding='utf-8'))
assert tr['audioHash']==hashlib.sha256((audio/'C03.wav').read_bytes()).hexdigest()
norm=lambda s:re.sub(r'[^\wぁ-んァ-ン一-龯]','',s.lower())
source=norm(c['text']);spoken='';times=[]
for w in tr['words']:
    text=norm(w['word']);spoken+=text
    times.extend(w['start']+(w['end']-w['start'])*i/max(1,len(text)) for i in range(len(text)))
mapping={}
for a,b,n in difflib.SequenceMatcher(None,source,spoken,autojunk=False).get_matching_blocks():
    for i in range(n):mapping[a+i]=times[b+i]
cues={}
for key,phrase in [('math','3Dの座標変換には'),('cpu','ファミコンのCPUには'),('however','しかし'),('table','テーブルによる変換')]:
    pos=source.index(norm(phrase));near=[i for i in range(pos,pos+len(norm(phrase))) if i in mapping]
    assert len(near)>=len(norm(phrase))*.6,(key,'phrase mismatch')
    cues[key]=round(mapping[near[0]],3)
assert list(cues.values())==sorted(cues.values())
result={'C03':cues,'audioHash':tr['audioHash']}
(ROOT/'src/introReviewCues.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
print(result)
