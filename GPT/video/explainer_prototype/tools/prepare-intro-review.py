"""ユーザー編集の設計書2から冒頭12カットを独立した制作対象にする。"""
import hashlib,json,re,argparse,shutil,subprocess,sys
from pathlib import Path
from PIL import Image
from importlib.util import spec_from_file_location,module_from_spec

ROOT=Path(__file__).resolve().parents[1]
source=(ROOT/'設計書2.md').read_text(encoding='utf-8')
parser=argparse.ArgumentParser();parser.add_argument('--cuts',default='C01,C02,C03,C04,C05,C06,C07,C08,C09,C10,C11,C12');parser.add_argument('--revision',default='',help='互換用。出力先は開発中カットに固定')
args=parser.parse_args();selected=set(args.cuts.split(','))
out=ROOT/'out/part2/開発中カット'
snapshot=out/'設計書2_制作時点.md'
spec=spec_from_file_location('design_diff',ROOT/'tools/diff-intro-design.py');reader=module_from_spec(spec);spec.loader.exec_module(reader)
blocks=reader.sections(source)
assert len(blocks)==12,'冒頭C01〜C12の見出しを確認してください'
texts=[re.findall(r'[^。]+。?',reader.audio(blocks[f'C{i:02}'])) for i in range(1,13)]
base=json.loads((ROOT/'narration/part2-cuts.json').read_text(encoding='utf-8'))
m={k:base[k] for k in ['model','voice','speed','responseFormat','commonInstructions']}
m.update(fps=30,tailPaddingSeconds=.4,outputDirectory='narration/intro_review_20260916',reportFileName='duration-report.json',silenceCompaction={'preserveInternalSilence':True,'maximumLeadingSilenceMs':20,'maximumTrailingSilenceMs':100},cuts=[])
titles=['タイトル','30fpsのフレームワーク','ファミコンCPUと3Dの計算','奥行きで、位置と絵を選ぶ','敵の動きもテーブルから取り出す','奥から順に描くバケツソート']
titles+=['奥行きで当たり判定を絞る','フレームごとの2D矩形で判定する']
titles+=['座標計算を16bitから8bitへ','背景のX座標に16bitの精度を残す']
titles+=['ゲーム映像','30fpsで動かすため、処理を2フレームに分ける']
dest=ROOT/'narration/intro-review-cuts.json'
previous=json.loads(dest.read_text(encoding='utf-8')) if dest.exists() else {'cuts':[]}
old_review=ROOT/previous.get('reviewOutputDirectory','out/part2/intro_C01-C04_20260916')
old_snapshot=old_review/'設計書2_制作時点.md'
if old_snapshot.exists():
    subprocess.run([sys.executable,str(ROOT/'tools/diff-intro-design.py'),'--previous',str(old_snapshot),'--out',str(out)],check=True)
    (out/'設計書2_前回制作時点.md').write_text(old_snapshot.read_text(encoding='utf-8'),encoding='utf-8')
m['outputDirectory']='narration/intro_review_working'
m['reviewOutputDirectory']='out/part2/開発中カット'
old_audio=ROOT/'public'/previous.get('outputDirectory',m['outputDirectory'])
new_audio=ROOT/'public'/m['outputDirectory']
if old_audio!=new_audio and old_audio.exists() and not new_audio.exists():shutil.copytree(old_audio,new_audio)
cursor=0
for i,(lines,title) in enumerate(zip(texts,titles),1):
    cid=f'C{i:02}'; spoken=''.join(lines)
    if cid=='C07':
        spoken=spoken.replace('バケツソートの結果','奥行きごとのバケツ').replace('自分とZ座標が同じオブジェクトのみ判定ができ','自分が通る奥行きのバケツにいるオブジェクトだけを調べればよく').replace('同じZ位置に何もない時','そのバケツに何もない時')
    if cid=='C08':
        spoken=spoken.replace('敵のテーブルに含まれる外灯フレームの2Dのコリジョン','該当フレームのテーブルの位置と大きさから決まる2Dの矩形')
    lines=re.findall(r'[^。]+。?',spoken)
    if cid not in selected:
        c=dict(next(p for p in previous['cuts'] if p['id']==cid));c['startFrame']=cursor
        cursor+=c['durationFrames'];m['cuts'].append(c);continue
    c=dict(id=cid,sourceCut=cid,title=title,text=spoken,ttsText=spoken,sentences=lines,instructions='原稿の全ての文を順番に読み、省略や言い換えをしないでください。',startFrame=cursor,durationFrames=round(len(spoken)/7*30),minimumDurationFrames=0)
    c['narrationLeadFrames']=18 if '一拍おいて' in blocks[cid] or cid in ['C07','C08','C09','C10'] else 0
    if cid=='C04':
        # 初回ASRで「教室展」「縮処理」となった箇所だけ読みを指定する。
        c['ttsText']=spoken.replace('消失点','しょうしつてん').replace('テーブルを引く','テーブルをひく')
    p=next((p for p in previous['cuts'] if p['id']==cid and p['text']==spoken),None)
    if p:
        for k in ['measuredDurationSeconds','durationFrames','silenceCompaction']:
            if k in p and (k!='silenceCompaction' or p.get('ttsText')==c['ttsText']):c[k]=p[k]
    if cid=='C11' and not spoken:
        c.update(silent=True,measuredDurationSeconds=4.6,durationFrames=150,minimumDurationFrames=150,narrationLeadFrames=0)
        import wave
        new_audio.mkdir(parents=True,exist_ok=True)
        with wave.open(str(new_audio/'C11.wav'),'wb') as wav:
            wav.setnchannels(1);wav.setsampwidth(2);wav.setframerate(24000);wav.writeframes(bytes(220800))
    if cid=='C12':c['narrationLeadFrames']=18
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
out.mkdir(parents=True,exist_ok=True)
snapshot.write_text(source,encoding='utf-8')
(out/'source.json').write_text(json.dumps({'designSha256':hashlib.sha256((ROOT/'設計書2.md').read_bytes()).hexdigest(),'appliedCuts':sorted(selected),'cuts':[c['text'] for c in m['cuts']]},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Prepared 12 independent cuts and 16 tree images')
