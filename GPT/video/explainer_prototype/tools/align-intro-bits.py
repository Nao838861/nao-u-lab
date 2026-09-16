"""C09の発話語から比較カードの表示時刻を取り出す。"""
import json,re,hashlib,difflib
from pathlib import Path
root=Path(__file__).resolve().parents[1]
m=json.loads((root/'narration/intro-review-cuts.json').read_text(encoding='utf-8'))
base=root/'public'/m['outputDirectory']
tr=json.loads((base/'transcripts/C09.json').read_text(encoding='utf-8'))
text='';times=[]
for word in tr['words']:
    chars=re.sub(r'\s','',word['word'])
    text+=chars;times.extend([word['start']]*len(chars))
def at(phrase):
    assert phrase in text,phrase
    return times[text.index(phrase)]
out={'sixteen':at('16'),'cost':at('負荷'),'eight':at('8'),'audioHash':hashlib.sha256((base/'C09.wav').read_bytes()).hexdigest()}
assert out['sixteen']<out['cost']<out['eight']
def norm(s):return re.sub(r'[^\wぁ-んァ-ン一-龯]','',s.replace('bit','ビット'))
for cid in ['C09','C10']:
    c=next(c for c in m['cuts'] if c['id']==cid)
    t=json.loads((base/f'transcripts/{cid}.json').read_text(encoding='utf-8'))
    ratio=difflib.SequenceMatcher(None,norm(c['text']),norm(t['text']),autojunk=False).ratio()
    assert ratio>.95,(cid,ratio)
    print(cid,'normalized transcript similarity',round(ratio,3))
(root/'src/introBitCues.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(out)
