"""検証済みv001の描画・物理バンクを保ち、原版の走行音を接続する。"""
import argparse
import hashlib
import json
from pathlib import Path
import re
import subprocess
import zipfile

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT/'build/racing/v002'


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--cc65-bin', type=Path, required=True)
    args = parser.parse_args()
    OUT.mkdir(parents=True, exist_ok=True)
    original = (ROOT/'releases/GSU_MMC5Racing3D_v001.nes').read_bytes()
    manifest = json.loads((ROOT/'releases/racing_3d_v001.json').read_text())
    assert hashlib.sha256(original).hexdigest() == manifest['rom_sha256']
    with zipfile.ZipFile(ROOT/'demos/racing/v001/results/verification.zip') as z:
        labels = {n:int(a,16) for a,n in re.findall(r'al ([0-9A-Fa-f]+) \.([^\s]+)', z.read('build/cpu.lbl').decode())}
    cpu = original[16:16+8192]
    def data(label, size):
        at = labels[label] - 0xe000
        return cpu[at:at+size]
    for name, label, size in [('camera.bin','cameras',32), ('physics_grip.bin','physics_grip',192), ('physics_drift.bin','physics_drift',192)]:
        (OUT/name).write_bytes(data(label,size))
    for i in range(4):
        label = f'fills{i}'
        (OUT/f'fills_{i}.bin').write_bytes(data(label,1+6*data(label,1)[0]))
    # Guard the exact reset entry and existing unmodified tick driver.
    reset_at = 16+109*8192+0x1828
    assert original[reset_at:reset_at+7] == bytes.fromhex('a9008d0940a215')
    assert original[16+127*8192+0x1f00:16+127*8192+0x1f02] == bytes.fromhex('a518')
    cfg = OUT/'cpu.cfg'
    cfg.write_text('MEMORY {P:start=$E000,size=$1FFA,file=%O,fill=yes;V:start=$FFFA,size=6,file=%O;Z:start=0,size=$40,type=rw,file="";} SEGMENTS {CODE:load=P,type=ro;RODATA:load=P,type=ro;VECTORS:load=V,type=ro;ZEROPAGE:load=Z,type=zp;}')
    subprocess.run([str(args.cc65_bin/'ca65'),'-g','-I',str(OUT),str(ROOT/'demos/racing/v002/cpu.s'),'-o',str(OUT/'cpu.o')],cwd=OUT,check=True)
    subprocess.run([str(args.cc65_bin/'ld65'),'-C',str(cfg),str(OUT/'cpu.o'),'-o',str(OUT/'cpu.bin'),'-Ln',str(OUT/'cpu.lbl')],check=True)
    patched = bytearray(original)
    patched[16:16+8192] = (OUT/'cpu.bin').read_bytes()
    assert patched[16+8192:] == original[16+8192:]
    rom = ROOT/'releases/GSU_MMC5Racing3D_v002.nes'
    rom.write_bytes(patched)
    (OUT/rom.name).write_bytes(patched)
    report = {'version':'002','rom':rom.name,'rom_sha256':hashlib.sha256(patched).hexdigest(),
              'base_sha256':manifest['rom_sha256'],'unchanged':'PRG banks 1..127 and all CHR',
              'audio':'Original APU pulse engine and tire driver, 1 tick per NTSC NMI',
              'source_sha256':hashlib.sha256((ROOT/'demos/racing/v002/cpu.s').read_bytes()).hexdigest()}
    (ROOT/'releases/racing_3d_v002.json').write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps(report))


if __name__ == '__main__':
    main()
