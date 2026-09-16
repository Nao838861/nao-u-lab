"""ゲームの自機弾CHRを読み、8×16の左右反転2枚構成をそのまま図へ渡す。"""
import hashlib,json
from pathlib import Path
root=Path(__file__).resolve().parents[1]
source=Path('D:/HomeBrew/MonoSH/res/sprite.chr')
raw=source.read_bytes();frames=[]
for tile_id in [0x61,0x63,0x65,0x67,0x69]:
    pixels=[]
    for y in range(16):
        # MMC5でPPUの$1000側へsprite.chrの先頭4KBを割り当てている。
        tile=(tile_id-1+y//8)*16
        for x in range(16):
            bit=7-(x if x<8 else 15-x)
            c=((raw[tile+y%8]>>bit)&1)|(((raw[tile+y%8+8]>>bit)&1)<<1)
            if c:pixels.append([x,y,c])
    assert pixels
    frames.append({'tile':tile_id,'pixels':pixels})
(root/'src/introBullet.json').write_text(json.dumps({'source':'res/sprite.chr: tiles $61,$63,$65,$67,$69; OAM $03/$43','sha256':hashlib.sha256(raw).hexdigest(),'pixels':frames[0]['pixels'],'frames':frames},indent=2)+'\n',encoding='utf-8')
print('Extracted five player bullet patterns:',[len(f['pixels']) for f in frames])
