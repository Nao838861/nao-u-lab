"""波動砲の録画と、天井に固定される砲台の3姿勢をNESの8画素タイルにする。"""
from pathlib import Path
import numpy as np
from PIL import Image

ART=Path(__file__).resolve().parent/'art'

def cannon_tiles():
    # The symmetric upper/lower halves share CHR through OAM vertical flip.
    im=Image.open(ART/'wave-cannon.png').resize((32,12),Image.Resampling.BOX)
    rgb=np.asarray(im).astype(int)
    # Register the hot center on the join between the upper and lower tiles.
    upper=np.maximum(rgb[:6],rgb[::-1][:6])
    r,g,b=upper.transpose(2,0,1)
    ink=np.zeros((8,32),'u1')
    ink[2:]=np.where(b<47,0,np.where(g<86,1,np.where(r>116,3,2)))
    # The last section only needs blue and cyan. Its sprite uses palette 3.
    ink[:,:8]=np.choose(ink[:,:8],[0,2,3,3])
    return [ink[:,x:x+8] for x in range(0,32,8)]

def turret_page(planar):
    poses=[
        ['00122100','01333210','01233210','01222210','00133100','00032000','00021000','00011000'],
        ['00122100','01333210','01233210','01222210','01233100','12321000','12210000','01100000'],
        ['00122100','01333210','01233210','11222210','23332100','12211000','01000000','00000000']]
    return b''.join(planar(bytes(int(c) for row in pose for c in row)) for pose in poses)
