"""制作時点の設計書と現在の設計書を比較する。元の控えは更新しない。"""
import argparse,difflib,json,re,hashlib
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]

def sections(text):
    text=text.split('---- ここから下は前回のなので無視')[0]
    heads=list(re.finditer(r'^## (.+)$',text,re.M)); result={}
    for i,h in enumerate(heads):
        match=re.match(r'C?(0[1-6])(?:[｜ ].*)?$',h[1].strip())
        if match:
            cid='C'+match[1]
            if cid=='C05' and cid in result:cid='C06'
            if cid not in result:result[cid]=text[h.end():heads[i+1].start() if i+1<len(heads) else len(text)].strip()
    return result

def audio(block):
    if '### 音声' not in block:return ''
    content=block.split('### 音声',1)[1].split('\n### ',1)[0]
    rows=re.findall(r'^\| \d+ \|[^\n]*?\| ([^|]+) \|$',content,re.M)
    if rows:return ''.join(rows)
    return ''.join(s.strip() for s in content.splitlines() if s.strip() and not s.lstrip().startswith(('(', '（')))

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--previous',required=True);p.add_argument('--out',required=True);args=p.parse_args()
    previous=ROOT/args.previous;current=ROOT/'設計書2.md';out=ROOT/args.out;out.mkdir(parents=True,exist_ok=True)
    old=previous.read_text(encoding='utf-8');new=current.read_text(encoding='utf-8');a=sections(old);b=sections(new)
    report=['# 設計書2：前回制作時点との差分','',f'比較元：`{args.previous}`','比較先：現在の `設計書2.md`','', '見出しの C 接頭辞の有無はカット識別時に正規化する。差分の自動検出と、今回反映する範囲は別に判断する。','']
    summary={}
    for cid in ['C01','C02','C03','C04','C05','C06']:
        changed=a.get(cid)!=b.get(cid); speech=(audio(a[cid]) if cid in a else '')!=(audio(b[cid]) if cid in b else '')
        summary[cid]={'changed':changed,'audioChanged':speech}
        report.extend([f'## {cid}',f'画面等の指示：{"変更あり" if changed else "変更なし"}／音声：{"変更あり" if speech else "変更なし"}',''])
        if changed:report+=['```diff',*difflib.unified_diff(a.get(cid,'').splitlines(),b.get(cid,'').splitlines(),fromfile='前回',tofile='今回',lineterm=''),'```','']
    (out/'指示差分.md').write_text('\n'.join(report),encoding='utf-8')
    (out/'設計書2.diff').write_text('\n'.join(difflib.unified_diff(old.splitlines(),new.splitlines(),fromfile=str(previous),tofile='設計書2.md',lineterm=''))+'\n',encoding='utf-8')
    (out/'directive-diff.json').write_text(json.dumps({'previousSha256':hashlib.sha256(previous.read_bytes()).hexdigest(),'currentSha256':hashlib.sha256(current.read_bytes()).hexdigest(),'cuts':summary},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(summary))
