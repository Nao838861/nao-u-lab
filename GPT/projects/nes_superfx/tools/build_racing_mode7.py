"""v003を保存したまま、地面DSP＋透明色合成のv004を生成する。"""
import argparse,hashlib,json,shutil,struct,subprocess
from pathlib import Path
from build_cube import CASFX_HASH
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'build/racing/v004'

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--cc65-bin',type=Path,required=True);args=parser.parse_args()
    OUT.mkdir(parents=True,exist_ok=True)
    base=ROOT/'build/racing/v003';demo=ROOT/'demos/racing/v004'
    for name in ['camera.bin','physics_grip.bin','physics_drift.bin','cpu.cfg']:shutil.copy2(base/name,OUT/name)
    for i in range(4):(OUT/f'fills_{i}.bin').write_bytes(bytes([1])+struct.pack('<HHBB',0,16384,0,0))
    trees=(base/'trees.inc').read_text()
    trees=trees.replace('.word 33,1,','.word 50,1,').replace('.word 16,1,','.word 18,1,')
    (OUT/'trees.inc').write_text(trees)
    include=ROOT/'.cache/casfx';assert hashlib.sha256((include/'casfx.inc').read_bytes()).hexdigest()==CASFX_HASH
    shutil.copy2(base/'gsu.cfg',OUT/'gsu.cfg')
    for unit in ['gsu','cpu']:
        subprocess.run([str(args.cc65_bin/'ca65'),'-g','-I',str(include),'-I',str(OUT),str(demo/f'{unit}.s'),'-o',str(OUT/f'{unit}.o')],cwd=OUT,check=True)
        subprocess.run([str(args.cc65_bin/'ld65'),'-C',str(OUT/f'{unit}.cfg'),str(OUT/f'{unit}.o'),'-o',str(OUT/f'{unit}.bin'),'-Ln',str(OUT/f'{unit}.lbl')],check=True)
    original=(ROOT/'releases/GSU_MMC5Racing3D_v003.nes').read_bytes()
    prg=bytearray(original[16:16+1048576])
    prg[:8192]=(OUT/'cpu.bin').read_bytes()
    for bank in [1,2]:
        at=bank*8192;first=struct.unpack_from('<H',prg,at+0x28)[0];car=struct.unpack_from('<H',prg,at+0x2a)[0]-0x8000
        vertices=prg[at+0x100+first*6:at+0x100+(first+8)*6]
        faces=[list(struct.unpack_from('<6H',prg,at+car+i*12)) for i in range(5)]
        for i,face in enumerate(faces):
            face[0]=0x31 if i==3 else 1
            face[2:]=[a-first*6 for a in face[2:]]
        struct.pack_into('<HH',prg,at+0x1e,8,5);struct.pack_into('<HH',prg,at+0x28,0,0x8300)
        prg[at+0x100:at+0x300]=vertices.ljust(512,b'\0')
        prg[at+0x300:at+0x600]=b''.join(struct.pack('<6H',*face) for face in faces).ljust(768,b'\0')
        prg[at+0x1000:at+0x2000]=(OUT/'gsu.bin').read_bytes()
    assert prg[4*8192:]==original[16+4*8192:16+1048576]
    texture=(demo/'ground.2bpp').read_bytes();meta=json.loads((demo/'ground.json').read_text())
    assert len(texture)==640*640//4 and hashlib.sha256(texture).hexdigest()==meta['sha256']
    extra=(b'M7R4'+struct.pack('<HH',640,640)+bytes(8)+texture).ljust(1048576,b'\0')
    header=bytearray(original[:16]);header[4]=128
    rom=bytes(header)+prg+extra+original[16+1048576:]
    name='GSU_MMC5Racing3D_v004.nes';(ROOT/'releases'/name).write_bytes(rom);(OUT/name).write_bytes(rom)
    report={'version':'004','rom':name,'rom_sha256':hashlib.sha256(rom).hexdigest(),'base_sha256':hashlib.sha256(original).hexdigest(),
            'ground':meta,'fx':'car and eight pyramids only; zero transparent, colors 1..3 opaque',
            'dsp':'fixed-function camera to 192 affine rows; provisional 25MHz/1024 clocks per row',
            'palettes':[['white','red','green','gray'],['white','red','green','blue']]*2,
            'unchanged':'original PRG banks 4..127, CHR, physics and audio; v003 release preserved'}
    (ROOT/'releases/racing_3d_v004.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report))

if __name__=='__main__':main()
