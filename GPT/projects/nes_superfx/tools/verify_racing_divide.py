"""GSU除算の短縮経路を、独立したPythonの整数除算と照合する。"""
import argparse,json,random,re,struct,subprocess
from pathlib import Path
import verify_racing_optimization as profile

ROOT=Path(__file__).resolve().parents[1]


def main():
    p=argparse.ArgumentParser();p.add_argument('--probe',type=Path,required=True);p.add_argument('--cc65-bin',type=Path,required=True);a=p.parse_args()
    out=ROOT/'build/racing/v005/divide-test';out.mkdir(parents=True,exist_ok=True);profile.OUT=out
    labels={n:int(v,16) for v,n in re.findall(r'al ([0-9A-Fa-f]+) \.([^\s]+)',(ROOT/'build/racing/v005/gsu.lbl').read_text())}
    source='''.include "casfx.inc"
.segment "GSU"
.export harness_end
iwt r7,#$8100
iwt r8,#0
iwt r9,#256
next:
to r4
ldw (r7)
inc r7
inc r7
to r5
ldw (r7)
inc r7
inc r7
to r6
ldw (r7)
inc r7
inc r7
link #4
iwt r15,#DIVIDE
nop
from r4
stw (r8)
inc r8
inc r8
from r5
stw (r8)
inc r8
inc r8
dec r9
bne next
nop
stop
nop
harness_end:
'''.replace('DIVIDE',str(labels['divide']))
    (out/'harness.s').write_text(source)
    subprocess.run([str(a.cc65_bin/'ca65'),'-I',str(ROOT/'.cache/casfx'),str(out/'harness.s'),'-o',str(out/'harness.o')],check=True)
    subprocess.run([str(a.cc65_bin/'ld65'),'-C',str(ROOT/'build/racing/v005/gsu.cfg'),str(out/'harness.o'),'-o',str(out/'harness.bin'),'-Ln',str(out/'harness.lbl')],check=True)
    end=int(re.search(r'al ([0-9A-Fa-f]+) \.harness_end',(out/'harness.lbl').read_text())[1],16)
    cases=[(n,d) for n in range(256) for d in [1,2,3,7,8,15,16,31,127,128,129,255,256,257,18432]]
    rng=random.Random(5)
    for _ in range(2048):
        d=rng.randint(1,18432);cases.append((rng.randrange(d*65536),d))
    data=bytearray(40960);rom=(ROOT/'releases/GSU_MMC5Racing3D_v005.nes').read_bytes();data[0x8000:]=rom[8208:16400]
    data[0x9000:end]=(out/'harness.bin').read_bytes()[:end-0x9000]
    for start in range(0,len(cases),256):
        batch=cases[start:start+256]
        for i,(n,d) in enumerate(batch):struct.pack_into('<IH',data,0x8100+i*6,n,d)
        clocks,frame=profile.run(a.probe.resolve(),data,'batch')
        for i,(n,d) in enumerate(batch):assert struct.unpack_from('<HH',frame,i*4)==divmod(n,d),(n,d)
    report={'status':'pass','cases':len(cases),'reference':'Python divmod, unsigned 32/16, quotient fits 16 bits','rom_sha256':__import__('hashlib').sha256(rom).hexdigest()}
    (out/'verification.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report))


if __name__=='__main__':main()
