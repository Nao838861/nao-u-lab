"""赤枠付き原画像と、その系統の実ゲーム用pattern7を取り込む。"""
from pathlib import Path
import json,re,shutil,hashlib
ROOT=Path(__file__).resolve().parents[1]
GAME=Path('D:/HomeBrew/MonoSH')
src=GAME/'tmp/整理/pattern105';out=ROOT/'public/ai_chapter';out.mkdir(exist_ok=True)
images=[]
for n in [19,30,37,54,31]:
    p=src/f'frame_{n:03}.png';shutil.copyfile(p,out/p.name)
    images.append({'frame':n,'file':'ai_chapter/'+p.name,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
header=GAME/'tools/houdini/export/enemy_path_spaceharrier_wave4_tables.h'
s=header.read_text(encoding='utf-8')
enemy={k:[int(v) for v in re.search(r'enemy_path_7_'+k+r'\[[^]]*\]\s*=\s*\{([^}]+)',s,re.S)[1].replace('\n','').split(',') if v.strip()] for k in ['sx','bot','sz','wz','zb']}
assert len({len(v) for v in enemy.values()})==1
assert all(0<=v<16 for v in enemy['sz'])
data={'images':images,'enemy':enemy,'source':str(header),'headerSha256':hashlib.sha256(header.read_bytes()).hexdigest(),'note':'赤枠019/030/037/044/054から生成し、その後124→95更新へ調整した実ゲームのpattern7。画像は当時の原本。','log':'2026/07/11/rollout-2026-07-11T03-31-50-019f4d4c-ca1b-78d0-965a-2db843fa8451.jsonl'}
(ROOT/'src/introAiData.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('4 marked originals + 1 unmarked original; pattern7 rows:',len(enemy['sx']))
