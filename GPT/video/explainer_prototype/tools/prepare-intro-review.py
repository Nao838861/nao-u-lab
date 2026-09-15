"""ユーザー編集の設計書2から冒頭4カットだけを独立した制作対象にする。"""
import hashlib,json,re
from pathlib import Path
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
source=(ROOT/'設計書2.md').read_text(encoding='utf-8')
blocks=re.split(r'^## (?:01｜C01 タイトル|02|03|04)\s*$',source,flags=re.M)
assert len(blocks)==5, '冒頭01〜04の見出しを確認してください'
title_lines=re.findall(r'^\| [12] \|[^\n]*?\| ([^|]+) \|$',blocks[1],re.M)
assert len(title_lines)==2
texts=[title_lines]
for block in blocks[2:]:
    after=block.split('### 音声',1)[1].strip()
    paragraph=after.split('\n\n',1)[0]
    paragraph=''.join(s.strip() for s in paragraph.splitlines() if not s.lstrip().startswith(('(', '（')))
    texts.append(re.findall(r'[^。]+。?',paragraph))
base=json.loads((ROOT/'narration/part2-cuts.json').read_text(encoding='utf-8'))
m={k:base[k] for k in ['model','voice','speed','responseFormat','commonInstructions']}
m.update(fps=30,tailPaddingSeconds=.4,outputDirectory='narration/intro_review_20260916',reportFileName='duration-report.json',silenceCompaction={'preserveInternalSilence':True,'maximumLeadingSilenceMs':20,'maximumTrailingSilenceMs':100},cuts=[])
titles=['タイトル','30fpsのフレームワーク','ファミコンCPUと3Dの計算','奥行きで、位置と絵を選ぶ']
dest=ROOT/'narration/intro-review-cuts.json'
previous=json.loads(dest.read_text(encoding='utf-8')) if dest.exists() else {'cuts':[]}
cursor=0
for i,(lines,title) in enumerate(zip(texts,titles),1):
    cid=f'C{i:02}'; spoken=''.join(lines)
    c=dict(id=cid,sourceCut=cid,title=title,text=spoken,ttsText=spoken,sentences=lines,instructions='原稿の全ての文を順番に読み、省略や言い換えをしないでください。',startFrame=cursor,durationFrames=round(len(spoken)/7*30),minimumDurationFrames=0)
    if cid=='C04':
        # 初回ASRで「教室展」「縮処理」となった箇所だけ読みを指定する。
        c['ttsText']=spoken.replace('消失点','しょうしつてん').replace('テーブルを引く','テーブルをひく')
    p=next((p for p in previous['cuts'] if p['id']==cid and p['text']==spoken),None)
    if p:
        for k in ['measuredDurationSeconds','durationFrames','silenceCompaction']:
            if k in p and (k!='silenceCompaction' or p.get('ttsText')==c['ttsText']):c[k]=p[k]
    cursor+=c['durationFrames']; m['cuts'].append(c)
dest.write_text(json.dumps(m,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
tree=[]
for i in range(16):
    file=f'tree/Tree0_{i:02}.png'; p=ROOT/'public'/file
    w,h=Image.open(p).size
    tree.append(dict(file=file,w=w,h=h,sha256=hashlib.sha256(p.read_bytes()).hexdigest()))
tables=json.loads((ROOT/'src/part2Data.json').read_text(encoding='utf-8'))
(ROOT/'src/introTreeData.json').write_text(json.dumps({'images':tree,'scale':tables['scale'],'size':tables['size'],'groundY':tables['groundY'],'source':'MonoSHの背景Z変換表とTree0の16画像。図の原点と表示倍率は説明用。'},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(ROOT/'src/introReviewAlignment.json').write_text(json.dumps({c['id']:{'starts':[0]*len(c['sentences'])} for c in m['cuts']},indent=2)+'\n',encoding='utf-8') if not (ROOT/'src/introReviewAlignment.json').exists() else None
out=ROOT/'out/part2/intro_C01-C04_20260916';out.mkdir(parents=True,exist_ok=True)
(out/'設計書2_制作時点.md').write_text(source,encoding='utf-8')
(out/'source.json').write_text(json.dumps({'designSha256':hashlib.sha256((ROOT/'設計書2.md').read_bytes()).hexdigest(),'cuts':[c['text'] for c in m['cuts']]},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Prepared 4 independent cuts and 16 tree images')
