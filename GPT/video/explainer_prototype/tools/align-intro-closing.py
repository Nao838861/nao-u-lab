"""本文末尾とお礼の境界を、完成音声の文字起こしから取得する。"""
import hashlib,json,re
from pathlib import Path
root=Path(__file__).resolve().parents[1]
m=json.loads((root/'narration/intro-review-cuts.json').read_text(encoding='utf-8'))
audio=root/'public'/m['outputDirectory']
tr=json.loads((audio/'transcripts/C19.json').read_text(encoding='utf-8'))
assert tr['audioHash']==hashlib.sha256((audio/'C19.wav').read_bytes()).hexdigest()
chars='';times=[];ends=[]
for w in tr['words']:
    text=re.sub(r'\W','',w['word']);chars+=text;times.extend([w['start']]*len(text));ends.extend([w['end']]*len(text))
at=chars.index('ご視聴')
assert at>0
result={'bodyEnd':ends[at-1],'thanksStart':times[at],'audioHash':tr['audioHash']}
for key,phrase in [('tools','作り方'),('optimization','最適化'),('ai','AI'),('result','ファミコン'),('possibility','まだまだ')]:
    result[key]=times[chars.lower().index(phrase.lower())]
(root/'src/introClosingCues.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
