"""文字起こしから文境界を合わせ、読み落とし候補を記録する。"""
import json,re,difflib,hashlib
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
manifest=json.loads((ROOT/'narration/part2-cuts.json').read_text(encoding='utf-8'))
def norm(s):
    return re.sub(r'[^\wぁ-んァ-ン一-龯]','',s.lower())
alignment={}
report=['# 第二部 音声照合','', '文字起こしとの自動比較。表記揺れを含むため、類似度だけで発音の合否を決めない。','']
for c in manifest['cuts']:
    tr=json.loads((ROOT/'public'/manifest['outputDirectory']/'transcripts'/f"{c['id']}.json").read_text(encoding='utf-8'))
    assert tr.get('sourceText') == c['ttsText'], (c['id'], 'stale transcript text')
    audio_hash=hashlib.sha256((ROOT/'public'/manifest['outputDirectory']/f"{c['id']}.wav").read_bytes()).hexdigest()
    if 'audioHash' in tr:
        assert tr['audioHash'] == audio_hash, (c['id'], 'stale transcript audio')
    spoken='';times=[]
    for w in tr['words']:
        word=norm(w['word']);spoken+=word
        times.extend(w['start']+(w['end']-w['start'])*i/max(1,len(word)) for i in range(len(word)))
    source=norm(c['text']); sm=difflib.SequenceMatcher(None,source,spoken,autojunk=False)
    mapping={}
    for a,b,n in sm.get_matching_blocks():
        for i in range(n):mapping[a+i]=times[b+i]
    starts=[];pos=0
    for line in c['sentences']:
        candidates=[i for i in range(pos,min(len(source),pos+len(norm(line)))) if i in mapping]
        assert len(candidates) / max(1,len(norm(line))) >= .6, (c['id'], '文の読み落とし候補', line)
        starts.append(mapping[candidates[0]]);pos+=len(norm(line))
    alignment[c['id']]={'starts':starts,'similarity':round(sm.ratio(),3),'audioHash':audio_hash}
    report += [f"## {c['sourceCut']} {c['title']}",'',f"一致度: {sm.ratio():.3f}", '',f"原稿：{c['text']}",'',f"文字起こし：{tr['text']}",'']
(ROOT/'src/part2Alignment.json').write_text(json.dumps(alignment,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(ROOT/'out/part2_audio_review.md').write_text('\n'.join(report),encoding='utf-8')
print({k:v['similarity'] for k,v in alignment.items()})
