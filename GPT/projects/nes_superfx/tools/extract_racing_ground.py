"""原版の基準角度のCHR/地図から、景物を除いた640×640の2bpp地面を復元。"""
import argparse,hashlib,json
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--source',type=Path,required=True);args=parser.parse_args()
    assets=args.source/'assets';manifest=json.loads((args.source/'assets-manifest.json').read_text())
    def read(name):
        data=(assets/name).read_bytes();assert hashlib.sha256(data).hexdigest()==manifest[name]['sha256'],name
        return data
    prg=b''.join(read(f'bank{i:03d}.bin') for i in range(128));chrdata=read('chr.bin')
    def get(bank,addr):return prg[(bank&127)*8192+(addr&8191)]
    bank=get(117,0xcf80);ptr=get(117,0xd000)|(get(117,0xd080)<<8)
    pixels=bytearray([2])*(640*640);tiles=0;removed=0
    for by in range(29):
        left,right,rb,lo,hi=[get(bank,ptr+5*by+j) for j in range(5)]
        assert 0<=left<=right<=58 and not (left&1 or right&1)
        for bx in range(29):
            if not left<=bx*2<right:continue
            slot,tag=[get(rb,(lo|hi<<8)+2*bx+j) for j in range(2)]
            if tag&128:
                base=(tag&127)*8192+slot*32
                words=[prg[base+i]|prg[base+i+16]<<8 for i in range(16)]
            else:
                assert tag==0 and slot<6
                words=[get(117,0xdd00+slot)|(get(117,0xdd80+slot)<<8)]*16
            for i,word in enumerate(words):
                # Original palettes 1/2 are scenery; palette 3 also contains road edges.
                if word>>14 in (1,2):removed+=1;continue
                pattern=chrdata[(word&16383)*16:(word&16383)*16+16];tiles+=1
                for y in range(8):
                    for x in range(8):
                        u=bx*32+(i%4)*8+x-144;v=by*32+(i//4)*8+y-144
                        if 0<=u<640 and 0<=v<640:
                            color=((pattern[y]>>(7-x))&1)|(((pattern[y+8]>>(7-x))&1)<<1)
                            pixels[v*640+u]=([2,3,1,0] if word>>14==0 else [2,3,0,2])[color]
    packed=bytes(sum(pixels[i+j]<<(6-2*j) for j in range(4)) for i in range(0,len(pixels),4))
    dst=ROOT/'demos/racing/v004';dst.mkdir(exist_ok=True)
    (dst/'ground.2bpp').write_bytes(packed)
    image=Image.new('RGB',(640,640));palette=[(255,254,255),(181,49,32),(12,147,0),(102,102,102)]
    image.putdata([palette[v] for v in pixels]);image.save(dst/'ground.png')
    report={'width':640,'height':640,'format':'row-major, four pixels per byte, high bits first','crop':[144,144,784,784],
            'source_prg_sha256':hashlib.sha256(prg).hexdigest(),'source_chr_sha256':hashlib.sha256(chrdata).hexdigest(),
            'source':'MMC5Racing assets, original angle 0; terrain palettes 0/3; palette-3 black maps to grass','palette_indices':['white','red','green','gray'],
            'terrain_tiles':tiles,'removed_scenery_tiles':removed,'sha256':hashlib.sha256(packed).hexdigest()}
    (dst/'ground.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report))

if __name__=='__main__':main()
