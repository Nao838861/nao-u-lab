"""録画上の登場コマを横スクロール位置に変換する。座標は敵の中心、Yは録画内。"""
import numpy as np
from pathlib import Path
ROOT=Path(__file__).resolve().parent
def write():
    camera=np.fromfile(ROOT/'art/camera.bin','<u2')/16
    events=[
        (0,'POW',190,183,'BLUE'),(17,'POD',251,97,0),(106,'POD',251,47,0),
        (126,'FLY',202,3,0),(137,'FLY',195,3,0),(148,'FLY',188,3,0),
        (159,'FLY',182,3,0),(170,'FLY',175,3,0),
        (547,'WALK',250,170,0),(618,'DART',252,139,0),
        (628,'DART',252,125,0),(644,'DART',252,139,0),(656,'DART',252,125,0),
        (679,'POW',250,183,'BIT'),(692,'DART',252,57,0),(703,'DART',252,50,0),
        (712,'POD',251,143,0),(796,'POD',251,144,'RED'),
        (884,'FLY',203,3,0),(895,'FLY',196,3,0),(906,'FLY',189,3,0),
        (917,'FLY',183,3,0),(960,'FLY',166,3,0),(971,'FLY',159,3,0),
        (982,'FLY',152,3,0),(993,'FLY',145,3,0),(1030,'POD',250,116,0),
        (1315,'WALK',252,170,0),
        (1497,'POD',251,47,'BLUE'),(1547,'WALK',252,170,0)]
    out=ROOT/'build/encounters.h'
    out.write_text('static const struct Event events[]={\n'+''.join(
        '    {%s,%s,%s,%s,%s},\n'%(round(camera[t]),kind,x,y+16,drop)
        for t,kind,x,y,drop in events)+'};\n')
if __name__=='__main__':write()
