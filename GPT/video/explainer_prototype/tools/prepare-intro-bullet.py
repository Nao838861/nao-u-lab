"""ゲームの自機弾CHRを読み、8×16の左右反転2枚構成をそのまま図へ渡す。"""
import hashlib,json
from pathlib import Path
root=Path(__file__).resolve().parents[1]
source=Path('D:/HomeBrew/MonoSH/res/sprite.chr')
raw=source.read_bytes();pixels=[]
for y in range(16):
    # MMC5でPPUの$1000側へsprite.chrの先頭4KBを割り当てている。
    tile=(0x60+y//8)*16
    for x in range(16):
        bit=7-(x if x<8 else 15-x)
        c=((raw[tile+y%8]>>bit)&1)|(((raw[tile+y%8+8]>>bit)&1)<<1)
        if c:pixels.append([x,y,c])
(root/'src/introBullet.json').write_text(json.dumps({'source':'res/sprite.chr: tile $61; OAM attributes $03/$43','sha256':hashlib.sha256(raw).hexdigest(),'pixels':pixels},indent=2)+'\n',encoding='utf-8')
assert len(pixels)>0
print('Extracted player bullet pixels:',len(pixels))
