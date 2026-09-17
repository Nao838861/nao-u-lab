"""C16〜C18の語句開始を、完成音声の文字起こしから取り出す。"""
from pathlib import Path
import json,re,hashlib
ROOT=Path(__file__).resolve().parents[1]
m=json.loads((ROOT/'narration/intro-review-cuts.json').read_text(encoding='utf-8'))
audio=ROOT/'public'/m['outputDirectory'];result={};hashes={}
for cid,terms in {'C15':{'houdiniTable':'プログラムのテーブル'},'C16':{'failure':'誤検出'},'C17':{'table':'テーブル'},'C18':{'bossFail':'精度','z':'Z軸','y':'Y軸','x':'X軸','conclusion':'まだ今'}}.items():
    tr=json.loads((audio/'transcripts'/f'{cid}.json').read_text(encoding='utf-8'));chars='';times=[]
    for w in tr['words']:
        word=re.sub(r'[^\wぁ-んァ-ン一-龯]','',w['word']).lower()
        chars+=word;times.extend([w['start']]*len(word))
    for key,term in terms.items():
        n=chars.find(term.lower())
        # ASRが「誤検出」を数字などに誤変換した場合も、直前の語句から語頭を取る。
        if n<0 and cid=='C16' and key=='failure':
            prefix='全自動での検出は'
            at=chars.find(prefix)
            if at>=0:n=at+len(prefix)
        assert 0<=n<len(times),(cid,term,chars)
        result[key]=times[n]
    hashes[cid]=hashlib.sha256((audio/f'{cid}.wav').read_bytes()).hexdigest()
assert result['bossFail']<result['z']<result['y']<result['x']<result['conclusion']
result['audioHashes']=hashes
(ROOT/'src/introAiCues.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(result)
