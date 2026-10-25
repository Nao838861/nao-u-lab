"""配布ROMのSelect視点更新への分岐を復旧する。元ファイルは保持する。"""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[1]
SOURCE_ROM = Path(r'D:\HomeBrew\FxRacing\releases\FX_Racing_3D_20261025\FX_RACING_3D.nes')
SOURCE_HASH = 'b893f680e22fbd38b5aa47516bc7aef3564fb8e292b0403ab38aa33cba3b74dc'
OUTPUT = ROOT / 'releases/FX_RACING_3D_SelectViewFix_20261026.nes'


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--source', type=Path, default=SOURCE_ROM)
    p.add_argument('--cc65-bin', type=Path, default=Path(r'D:\HomeBrew\CC65\bin'))
    args = p.parse_args()
    original = args.source.read_bytes()
    assert hashlib.sha256(original).hexdigest() == SOURCE_HASH, '固定した配布ROMが必要です'
    build = ROOT / 'build/fx_racing_select_fix'
    build.mkdir(parents=True, exist_ok=True)
    cfg = build / 'patch.cfg'
    cfg.write_text('MEMORY { R:start=$FE16,size=$2A,file=%O; } SEGMENTS { CODE:load=R,type=ro; }\n')
    obj, binary = build/'patch.o', build/'patch.bin'
    subprocess.run([str(args.cc65_bin/'ca65.exe'),str(ROOT/'src/fx_racing_select_fix.s'),'-o',str(obj)],check=True)
    subprocess.run([str(args.cc65_bin/'ld65.exe'),'-C',str(cfg),str(obj),'-o',str(binary)],check=True)
    helper = binary.read_bytes()
    data = bytearray(original)
    hook = 16 + 0x5f2
    space = 16 + 0x1e16
    assert data[hook:hook+3] == bytes.fromhex('4c33e6')
    assert data[space:space+42] == bytes(42), '未使用領域が基準ROMと異なります'
    assert len(helper) <= 42
    data[hook:hook+3] = bytes.fromhex('4c16fe')
    data[space:space+len(helper)] = helper
    differences = [i for i,(a,b) in enumerate(zip(original,data)) if a!=b]
    assert all(hook<=i<hook+3 or space<=i<space+len(helper) for i in differences)
    assert data[8208:] == original[8208:], '他のPRGバンクとCHRは変更しません'
    OUTPUT.write_bytes(data)
    manifest = dict(source_commit='a8d2a2d01fefc39665f01d22b80c80207ce088f7',source_sha256=SOURCE_HASH,
                    rom_sha256=hashlib.sha256(data).hexdigest(),rom_bytes=len(data),helper_bytes=len(helper),
                    changed_offsets=differences,hook_cpu_address='E5F2',helper_cpu_address='FE16',
                    scope='Select rising edge in 3D display mode4 updates existing0650 modulo4; title mode5 unchanged')
    OUTPUT.with_suffix('.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(manifest))


if __name__=='__main__':
    main()
