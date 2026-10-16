"""元座標の右側が実GSU画像の右へ出ることを、東西南北で直接検証。"""
import hashlib,json,math,shutil,struct,subprocess
from pathlib import Path
from PIL import Image,ImageDraw
from build_ground import ROOT,VIEWS
from mmc5_state import pose,snapshot
from verify_ground import decode

def main():
    source=ROOT/'build/ground/v003';out=ROOT/'build/ground/handedness';out.mkdir(parents=True,exist_ok=True)
    cases=[]
    for heading,name in [(0,'north'),(16384,'east'),(32768,'south'),(49152,'west')]:
        folder=out/name;folder.mkdir(exist_ok=True)
        theta=heading*math.tau/65536
        # Authoritative source axes: X east, Y south; forward=(sin,-cos),
        # driver's right=(cos,sin). White marker right, gray marker left.
        forward=(math.sin(theta),-math.cos(theta));right=(math.cos(theta),math.sin(theta))
        vertices=[];centers=[]
        for side in [1,-1]:
            sx=320+120*forward[0]+side*30*right[0]
            sy=320+120*forward[1]+side*30*right[1]
            centers.append(((sx-320)/5,(sy-320)/5))
            for offset,height in [(-4,0),(4,0),(4,16),(-4,16)]:
                vertices.append((round((sx+offset*right[0]-320)/5*128),round(height/5*128),round((sy+offset*right[1]-320)/5*128)))
        payload=bytearray((source/'payload.bin').read_bytes())
        struct.pack_into('<HH',payload,0x1e,8,2)
        struct.pack_into('<HH',payload,0x28,8,0x8300)
        payload[0x100:0x130]=b''.join(struct.pack('<hhh',*v) for v in vertices)
        for i,color in enumerate([3,2]):
            struct.pack_into('<6H',payload,0x300+i*12,color,0,*[0x8600+(i*4+j)*6 for j in range(4)])
        texture=[]
        for v in range(64):
            for u in range(64):
                x,z=(u+.5)*2-64,(v+.5)*2-64;color=1
                for (cx,cz),c in zip(centers,[3,2]):
                    if abs(x-cx)<=2 and abs(z-cz)<=2:color=c
                texture.append(color)
        (folder/'payload.bin').write_bytes(payload);(folder/'texture.bin').write_bytes(bytes(texture[v*64+u] for u in range(64) for v in range(64)))
        for view in range(4):
            p=pose(snapshot(320*256,320*256,heading),VIEWS[view])
            (folder/f'poses_{view}.bin').write_bytes(struct.pack('<11h',*p))
            for prefix in ['rows','fills']:shutil.copy2(source/f'{prefix}_{view}.bin',folder/f'{prefix}_{view}.bin')
        run=subprocess.run([str(ROOT/'build/Release/nesfx_ground_probe.exe'),str(folder),'50','1'],capture_output=True,check=True)
        (folder/'native.json').write_bytes(run.stdout)
        for view in range(4):
            for mode in range(2):
                pixels=decode((folder/f'native_50_{view}_{mode}_0.bin').read_bytes())
                xs={c:[i%256 for i,v in enumerate(pixels) if v==c] for c in [2,3]}
                assert xs[2] and xs[3],('markers not visible',name,view,mode)
                left,right=sum(xs[2])/len(xs[2]),sum(xs[3])/len(xs[3])
                assert left<128<right,(name,view,mode,left,right)
                assert max(xs[2])<128<min(xs[3]),('polygon/texture patch crossed sides',name,view,mode)
                cases.append({'heading':name,'view':view,'mode':mode,'source_left_screen_x':left,'source_right_screen_x':right})
    negative=None
    old=ROOT/'build/ground/v002/gsu.bin'
    if old.exists():
        folder=out/'negative_control';folder.mkdir(exist_ok=True)
        for p in (out/'north').iterdir():
            if p.name.startswith(('poses_','rows_','fills_')) or p.name=='texture.bin':shutil.copy2(p,folder/p.name)
        payload=bytearray((out/'north/payload.bin').read_bytes());payload[0x1000:]=old.read_bytes();(folder/'payload.bin').write_bytes(payload)
        subprocess.run([str(ROOT/'build/Release/nesfx_ground_probe.exe'),str(folder),'50','1'],capture_output=True,check=True)
        pixels=decode((folder/'native_50_2_0_0.bin').read_bytes())
        xs={c:[i%256 for i,v in enumerate(pixels) if v==c] for c in [2,3]}
        left,right=sum(xs[2])/len(xs[2]),sum(xs[3])/len(xs[3])
        assert right<128<left,('old shader should fail source handedness',left,right)
        negative={'old_gsu_sha256':hashlib.sha256(old.read_bytes()).hexdigest(),'mirroring_detected':True,'source_left_screen_x':left,'source_right_screen_x':right}
    palette=[(100,176,255),(12,147,0),(102,102,102),(255,254,255)]
    canvas=Image.new('RGB',(1024,216));draw=ImageDraw.Draw(canvas)
    for i,name in enumerate(['north','east','south','west']):
        pixels=decode((out/name/'native_50_2_0_0.bin').read_bytes());im=Image.new('RGB',(256,192));im.putdata([palette[c] for c in pixels]);canvas.paste(im,(i*256,24));draw.text((i*256+8,6),name.upper()+'  GRAY=LEFT WHITE=RIGHT',fill=(255,255,255))
    canvas.save(source/'handedness.png')
    report={'status':'pass','frames':len(cases),'gsu_sha256':hashlib.sha256((source/'gsu.bin').read_bytes()).hexdigest(),'source_axes':'X east, Y south; heading0 north clockwise','negative_control':negative,'cases':cases}
    (source/'handedness_validation.json').write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps({'status':'pass','frames':len(cases),'gsu_sha256':report['gsu_sha256']}))

if __name__=='__main__':main()
