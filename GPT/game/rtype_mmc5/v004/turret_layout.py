"""砲口の照合が複数コマ続いたステージ座標。Yは録画上の中心。"""
TURRETS=[(165,158,44),(313,22,156),(336,22,212),(569,36,576),
         (591,36,604),(697,22,752),(719,22,784),(804,50,992),
         (805,158,992),(996,22,1280),(1018,22,1284),(1039,22,1352),
         (1060,22,1524),(1081,36,1576),(1103,36,1584)]

def build_tables(out):
    upper=bytearray(200);lower=bytearray(200)
    for n,(x,y,_) in enumerate(TURRETS,1):
        grid=upper if y<100 else lower
        for col in range((x-5)//8,(x+5)//8+1):
            assert not grid[col]
            grid[col]=n
    (out/'turret-grid.bin').write_bytes(upper+lower+bytes(x&255 for x,_,_ in TURRETS)+bytes(x>>8 for x,_,_ in TURRETS)+bytes(y+16 for _,y,_ in TURRETS))

def clean_stage(path,out):
    from PIL import Image
    pic=Image.open(path).convert('RGB')
    patches=Image.open(path.parent/'turret-underlay.png').convert('RGBA')
    for n,(x,y,_) in enumerate(TURRETS):
        cut=patches.crop((n*14,0,(n+1)*14,14))
        pic.paste(cut,(x-7,y-7),cut)
    pic.save(out)
