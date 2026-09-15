"""C05で使う座標・画像がゲームのpath_0と一致することを確認する。"""
import hashlib,json,re
from pathlib import Path
from PIL import Image
root=Path(__file__).resolve().parents[1]
game=Path('D:/HomeBrew/MonoSH')
data=json.loads((root/'src/denseData.json').read_text(encoding='utf-8'))
source=(game/'tools/houdini/export/enemy_path_0_tables_runtime.h').read_text(encoding='utf-8')
for key,values in data['enemy'].items():
    actual=[int(v) for v in re.search(r'enemy_path_0_'+key+r'\[[^]]*\]\s*=\s*\{([^}]+)',source,re.S)[1].replace('\n','').split(',') if v.strip()]
    assert actual==values,key
for im in data['images']:
    p=root/'public'/im['file']
    assert Image.open(p).size==(im['w'],im['h'])
    assert hashlib.sha256(p.read_bytes()).hexdigest()==im['sha256']
    assert p.read_bytes()==(game/'png/Em0'/p.name).read_bytes()
spawn=(game/'src/enemy_tables.c').read_text(encoding='utf-8').split('const EnemySpawnEntry enemy_spawn_table[] = {')[1]
entries=re.findall(r'\{\s*(\d+),\s*ENEMY_TYPE_(EM[01]),\s*(\w+)\s*\}',spawn)
assert entries[:6]==[('157','EM0','0')]+[('6','EM0','0')]*5
assert entries[-3:]==[('7','EM1','0x80'),('0','EM1','0x81'),('0','EM1','0x82')]
assert (root/'public/intro/zsort.png').read_bytes()==(root/'out/part2/zsort.png').read_bytes()
print('PASS: path_0 arrays, 16 original sprites, six-enemy offsets, EM1 loop order, source screenshot')
