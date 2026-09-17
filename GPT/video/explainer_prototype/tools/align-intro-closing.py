"""締めの「奥行き」の発話位置を、実際の音声の文字起こしから取得する。"""
import hashlib,json,re
from pathlib import Path
root=Path(__file__).resolve().parents[1]
m=json.loads((root/'narration/intro-review-cuts.json').read_text(encoding='utf-8'))
audio=root/'public'/m['outputDirectory']
tr=json.loads((audio/'transcripts/C19.json').read_text(encoding='utf-8'))
assert tr['audioHash']==hashlib.sha256((audio/'C19.wav').read_bytes()).hexdigest()
chars='';times=[]
for w in tr['words']:
    text=re.sub(r'\W','',w['word']);chars+=text;times.extend([w['start']]*len(text))
at=chars.index('奥行き')
(root/'src/introClosingCues.json').write_text(json.dumps({'depth':times[at],'audioHash':tr['audioHash']},indent=2)+'\n',encoding='utf-8')
