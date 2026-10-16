"""実PPU画像を、地面の逆参照＋画素ごとの抜き色参照式で全画素照合する。"""
import argparse,json,struct
from pathlib import Path
from PIL import Image
from verify_ground import decode
ROOT=Path(__file__).resolve().parents[1]

def div(a,b):return (abs(a)//abs(b))*(-1 if (a<0)!=(b<0) else 1)

def main():
    p=argparse.ArgumentParser();p.add_argument('--results',type=Path,required=True);args=p.parse_args()
    texture=(ROOT/'demos/racing/v004/ground.2bpp').read_bytes()
    palette=json.loads((ROOT/'runtime_mode7/settings.json').read_text(encoding='utf-8-sig'))['Nes']['UserPalette']
    colors=[tuple((palette[c]>>shift)&255 for shift in (16,8,0)) for c in [0x30,0x16,0x1a,0x00,0x21]]
    count=0;transparent=0;opaque=0
    for i in range(8):
        c=struct.unpack('<7h',(args.results/f'camera{i}.bin').read_bytes())
        fx=decode((args.results/f'front{i}.bin').read_bytes());actual=Image.open(args.results/f'ground{i//4}-view{i%4}.png').convert('RGB')
        expected=[]
        for y in range(192):
            cx,cz,h,cs,sn,pc,ps=c;dy=y-96;den=ps*128+dy*pc;norm=cs*cs+sn*sn
            sky=den<=0;valid=False
            if not sky:
                forward=div(h*512*(pc*128-dy*ps),den);depth=div(forward*pc+h*512*ps,256)
                valid=0<depth<=144*65536
                if valid:
                    du=div(-depth*cs*256*5,norm*128);dv=div(depth*sn*256*5,norm*128)
                    u0=(cx*512+div(forward*sn*256,norm))*5+320*65536-128*du
                    v0=(cz*512+div(forward*cs*256,norm))*5+320*65536-128*dv
            for x in range(256):
                bg=3 if sky else 2
                if valid:
                    u=u0+x*du;v=v0+x*dv
                    if 0<=u<640*65536 and 0<=v<640*65536:
                        at=(v>>16)*640+(u>>16);bg=(texture[at//4]>>(6-2*(at%4)))&3
                foreground=fx[y*256+x] if i<4 else 0
                index=foreground if foreground else bg
                if i<4:
                    if foreground:opaque+=1
                    else:transparent+=1
                expected.append(colors[4 if sky and index==3 else index])
        got=list(actual.crop((0,0,256,192)).getdata())
        if got!=expected:
            im=Image.new('RGB',(256,192));im.putdata(expected);im.save(args.results/f'expected{i}.png')
            raise AssertionError((i,sum(a!=b for a,b in zip(got,expected))))
        count+=len(expected)
    report={'status':'pass','ppu_pixels':count,'fx_opaque_pixels':opaque,'fx_transparent_pixels':transparent,
            'scope':'4 views with FX + 4 views background only, complete 256x192 area; scalar color-key composition'}
    (args.results/'pixels.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report))

if __name__=='__main__':main()
