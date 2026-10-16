"""原版の採用済み物理PRGを保持し、3D走行ROMを生成する。"""
import hashlib,json,shutil,subprocess,zipfile
from pathlib import Path
from build_ground import ROOT,build as build_ground

OUT=ROOT/'build/racing/v001'
DEMO=ROOT/'demos/racing/v001'

def main():
    if not (OUT/'baseline.nes').exists():
        OUT.mkdir(parents=True,exist_ok=True)
        with zipfile.ZipFile(DEMO/'source_snapshot.zip') as z:
            for name in z.namelist():
                if not (OUT/name).resolve().is_relative_to(OUT.resolve()):raise ValueError(name)
            z.extractall(OUT)
    ground=build_ground('v003');config=json.loads((ground/'config.json').read_text())
    original=(OUT/'baseline.nes').read_bytes();meta=json.loads((OUT/'baseline.json').read_text())
    assert hashlib.sha256(original).hexdigest()==meta['rom_sha256']
    prg=bytearray(original[16:16+1048576]);baseline_prg=bytes(prg)
    def bank(n,data):
        assert len(data)<=8192
        prg[n*8192:(n+1)*8192]=data+bytes([255])*(8192-len(data))
    for mode,name in enumerate(['grip','drift']):
        cpu=(OUT/name/'initial-cpu.bin').read_bytes()
        (OUT/f'physics_{name}.bin').write_bytes(cpu[64:256])
        wram=(OUT/name/'initial-wram.bin').read_bytes()
        for i in range(16):bank(8+mode*16+i,wram[i*8192:(i+1)*8192])
        payload=bytearray((ground/'payload.bin').read_bytes())
        if mode:
            # Coupe footprint is ten pixels wide; same source rotation center.
            import struct
            for i in range(8):struct.pack_into('<h',payload,0x100+(config['own_first_vertex']+i)*6,round((5 if i&1 else -5)/5*128))
        bank(1+mode,payload)
    bank(3,(ground/'texture.bin').read_bytes()+b''.join((ground/f'rows_{v}.bin').read_bytes() for v in range(4)))
    bank(4,(ground/'directions.bin').read_bytes())
    for name in ['camera.bin',*[f'fills_{i}.bin' for i in range(4)]]:shutil.copy2(ground/name,OUT/name)
    (OUT/'cpu.cfg').write_text('MEMORY {P:start=$E000,size=$1FFA,file=%O,fill=yes;V:start=$FFFA,size=6,file=%O;Z:start=0,size=$40,type=rw,file="";} SEGMENTS {CODE:load=P,type=ro;RODATA:load=P,type=ro;VECTORS:load=V,type=ro;ZEROPAGE:load=Z,type=zp;}')
    subprocess.run(['ca65','-g','-I',str(OUT),str(DEMO/'cpu.s'),'-o',str(OUT/'cpu.o')],cwd=OUT,check=True)
    subprocess.run(['ld65','-C',str(OUT/'cpu.cfg'),str(OUT/'cpu.o'),'-o',str(OUT/'cpu.bin'),'-Ln',str(OUT/'cpu.lbl')],check=True)
    bank(0,(OUT/'cpu.bin').read_bytes())
    # Return after unchanged offroad-post, before lap/ghost/UI work.
    at=127*8192+0x17a9;assert prg[at:at+3]==bytes.fromhex('2028d4');prg[at]=0x60
    # Free-driving prototype has no scenery objects yet. Keep original road
    # update, but do not enter the original game's invisible tree/crash scene.
    at=127*8192+0x1793;assert prg[at:at+3]==bytes.fromhex('4c40fa');prg[at:at+3]=bytes.fromhex('2089fd')
    for i in range(108,127):assert prg[i*8192:(i+1)*8192]==baseline_prg[i*8192:(i+1)*8192]
    assert sum(a!=b for a,b in zip(prg[127*8192:],baseline_prg[127*8192:]))==4
    font=bytearray((ground/'hud.chr').read_bytes())
    for c,bits in {'G':['111','100','101','101','111'],'D':['110','101','101','101','110']}.items():
        for y,row in enumerate(bits):font[4096+ord(c)*16+y+1]=int(row,2)<<4
    rom=b'NES\x1a'+bytes([64,1,1,0])+bytes(8)+prg+font
    (OUT/'GSU_MMC5Racing3D_v001.nes').write_bytes(rom)
    config.update(version='racing_v001',rom_name='GSU_MMC5Racing3D_v001.nes',physics_baseline=meta)
    (OUT/'config.json').write_text(json.dumps(config,indent=2)+'\n')
    print(json.dumps({'rom_sha256':hashlib.sha256(rom).hexdigest(),'bytes':len(rom),'protected_physics_banks':'108..126 byte-identical; bank127 four boundary bytes (exclude scenery crash scene, return before lap/UI)'}))

if __name__=='__main__':main()
