"""視点②を少し下寄り、視点④を2D版に近い下寄りの構図にする。"""
import hashlib
import json
from pathlib import Path
import struct
import subprocess

from build_fx_racing_camera_tune import ROOT, OUTPUT as SOURCE_ROM, NEW as OLD

SOURCE_HASH = '2f3ea730d58825f9aee76f029ae2b32b4201aa43593942d13c3df30b39921ff8'
OUTPUT = ROOT / 'releases/FX_RACING_3D_CameraFraming_20261026.nes'
NEW = [OLD[0], (768, 448, 255, 26), OLD[2], (-1792, 3277, 0, 256)]


def main():
    original = SOURCE_ROM.read_bytes()
    assert hashlib.sha256(original).hexdigest() == SOURCE_HASH
    data = bytearray(original)
    table = b''.join(struct.pack('<4h', *v) for v in OLD)
    assert data.count(table) == 1 and data.find(table) == 16 + 0x6f6
    assert all(back % 256 == 0 for back, _, _, _ in NEW)
    build = ROOT / 'build/fx_racing_camera_framing'
    build.mkdir(parents=True, exist_ok=True)
    cc = Path(r'D:\HomeBrew\CC65\bin')
    helpers = []
    for name, address, pos, source in [('offset', 0xe3f5, 16+0x3f5, 0x6000),
                                      ('cached_offset', 0xbd9c, 16+4*8192+0x1d9c, 0x077a)]:
        cfg = build / f'{name}.cfg'
        cfg.write_text(f'MEMORY {{R:start=${address:X},size=$80,file=%O;}} SEGMENTS {{CODE:load=R,type=ro;}}\n')
        obj = build / f'{name}.o'
        binary = build / f'{name}.bin'
        subprocess.run([str(cc/'ca65.exe'), '-D', f'CAMERA_INPUT=${source:04X}',
                        str(ROOT/'src/fx_racing_camera_offset_signed.s'), '-o', str(obj)], check=True)
        subprocess.run([str(cc/'ld65.exe'), '-C', str(cfg), str(obj), '-o', str(binary)], check=True)
        helper = binary.read_bytes()
        assert len(helper) <= 128
        data[pos:pos+128] = helper + bytes([0xea]) * (128-len(helper))
        helpers.append(dict(address=address, offset=pos, size=len(helper)))
    for i, values in enumerate(NEW):
        struct.pack_into('<4h', data, 16+0x6f6+i*8, *values)
    differences = [i for i, (a, b) in enumerate(zip(original, data)) if a != b]
    allowed = [(h['offset'], h['offset']+128) for h in helpers] + [(16+0x6fe,16+0x706),(16+0x70e,16+0x716)]
    assert all(any(a <= i < b for a, b in allowed) for i in differences)
    OUTPUT.write_bytes(data)
    report = dict(source_sha256=SOURCE_HASH, rom_sha256=hashlib.sha256(data).hexdigest(),
                  old_q7_q8=OLD, new_q7_q8=NEW, helpers=helpers, changed_offsets=differences,
                  view2=dict(back_world=6, height_world=3.5, pitch_cos=255, pitch_sin=26),
                  view4=dict(back_world=-14, height_world=3277/128, pitch_degrees=90,
                             ground_car_y=96+128*14/(3277/128), viewport_height=192))
    OUTPUT.with_suffix('.json').write_text(json.dumps(report, indent=2)+'\n', encoding='utf-8')
    print(json.dumps({k:v for k,v in report.items() if k != 'changed_offsets'}))


if __name__ == '__main__':
    main()
