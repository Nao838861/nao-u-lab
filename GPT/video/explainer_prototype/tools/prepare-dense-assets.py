"""ゲームの描画・衝突データを加工せず解説へ持ち込む。"""
from pathlib import Path
import json,re,shutil,hashlib,subprocess
from PIL import Image
r=Path(__file__).resolve().parents[1]; game=Path('D:/HomeBrew/MonoSH')
out=r/'public/dense';out.mkdir(exist_ok=True)
asm=(game/'src/gen/sprite_Em0.s').read_text(encoding='utf-8')
def table(label):return [int(x) for x in re.search(label+r':\s*\.byte ([\d, ]+)',asm)[1].split(',')]
heights=table('_sprite_Em0_h');half=table('_sprite_Em0_half_w')
imgs=[]
for n in range(16):
 p=game/f'png/Em0/Em0_{n:02}.png';im=Image.open(p);w,h=im.size
 assert h==heights[n] and w//2==half[n],(n,w,h)
 shutil.copyfile(p,out/p.name)
 imgs.append({'file':f'dense/{p.name}','w':w,'h':h,'halfW':half[n],'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
source=(game/'tools/houdini/export/enemy_path_0_tables_runtime.h').read_text(encoding='utf-8')
enemy={k:[int(v) for v in re.search(r'enemy_path_0_'+k+r'\[[^]]*\]\s*=\s*\{([^}]+)',source,re.S)[1].replace('\n','').split(',') if v.strip()] for k in ['sx','bot','sz','wz','zb']}
assert len({len(x) for x in enemy.values()})==1
assert all(0<=x<16 for x in enemy['sz'])
data={'images':imgs,'enemy':enemy,'referenceCamera':'export時の地平線。移動分の追加補正=0。',
 'source':'MonoSH/src/gen/sprite_Em0.s + tools/houdini/export/enemy_path_0_tables_runtime.h',
 'sortScreenshot':{'file':'dense/sort27.png','seconds':27,'width':1024,'height':960,
 'objects':[{'id':'A','x':376,'y':176,'w':272,'h':224,'zExample':21},{'id':'B','x':688,'y':320,'w':160,'h':176,'zExample':37}]}}
(r/'src/denseData.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
subprocess.run(['ffmpeg','-v','error','-ss','27','-i',str(r/'public/game_CSCD.mp4'),'-frames:v','1','-y',str(out/'sort27.png')],check=True)
print(f'16 exact sprite images verified, {len(enemy["sx"])} trajectory rows extracted')
