"""視点②を近い低追従、④を2D縮尺の真上へ変更する。既存版は保持。"""
import hashlib
import json
from pathlib import Path
import struct
import subprocess

from build_fx_racing_select_fix import ROOT, OUTPUT as SOURCE_ROM

SOURCE_HASH='1bfc54ca74800e207c2842b2a55fa0886b8f9c92a8e39b185d93bf23eb4da47f'
OUTPUT=ROOT/'releases/FX_RACING_3D_CameraTune_20261026.nes'
OLD=[(0,320,256,13),(1280,768,253,36),(2304,1536,245,76),(3328,4608,187,174)]
NEW=[OLD[0],(768,448,252,46),OLD[2],(0,3277,0,256)]


def main():
    original=SOURCE_ROM.read_bytes()
    assert hashlib.sha256(original).hexdigest()==SOURCE_HASH
    data=bytearray(original)
    table=b''.join(struct.pack('<4h',*v)for v in OLD)
    assert data.count(table)==1 and data.find(table)==16+0x6f6
    assert all(back>=0 and back%256==0 for back,_,_,_ in NEW)
    build=ROOT/'build/fx_racing_camera_tune';build.mkdir(parents=True,exist_ok=True)
    cfg=build/'offset.cfg'
    cfg.write_text('MEMORY {R:start=$E3F5,size=$80,file=%O;} SEGMENTS {CODE:load=R,type=ro;}\n')
    cc=Path(r'D:\HomeBrew\CC65\bin')
    subprocess.run([str(cc/'ca65.exe'),str(ROOT/'src/fx_racing_camera_offset.s'),'-o',str(build/'offset.o')],check=True)
    subprocess.run([str(cc/'ld65.exe'),'-C',str(cfg),str(build/'offset.o'),'-o',str(build/'offset.bin')],check=True)
    helper=(build/'offset.bin').read_bytes();assert len(helper)<=128
    # Retain all callers and the following copy routine atE475.
    data[16+0x3f5:16+0x475]=helper+bytes([0xea])*(128-len(helper))
    # The NMI producer has a second camera converter feeding0782; update its
    # coefficient source077A too, so cache hits and the fallback agree.
    cfg.write_text('MEMORY {R:start=$BD9C,size=$80,file=%O;} SEGMENTS {CODE:load=R,type=ro;}\n')
    subprocess.run([str(cc/'ca65.exe'),'-D','CAMERA_INPUT=$077A',str(ROOT/'src/fx_racing_camera_offset.s'),'-o',str(build/'cached_offset.o')],check=True)
    subprocess.run([str(cc/'ld65.exe'),'-C',str(cfg),str(build/'cached_offset.o'),'-o',str(build/'cached_offset.bin')],check=True)
    cached=(build/'cached_offset.bin').read_bytes();assert len(cached)<=128
    cache_pos=16+4*8192+0x1d9c
    assert data[cache_pos:cache_pos+8]==bytes.fromhex('a9008d56038d5903')
    data[cache_pos:cache_pos+128]=cached+bytes([0xea])*(128-len(cached))
    for i,v in enumerate(NEW):struct.pack_into('<4h',data,16+0x6f6+i*8,*v)
    differences=[i for i,(a,b)in enumerate(zip(original,data))if a!=b]
    assert all(16+0x3f5<=i<16+0x475 or cache_pos<=i<cache_pos+128 or 16+0x6f6+8<=i<16+0x6f6+16 or 16+0x6f6+24<=i<16+0x6f6+32 for i in differences)
    OUTPUT.write_bytes(data)
    report=dict(source_sha256=SOURCE_HASH,rom_sha256=hashlib.sha256(data).hexdigest(),helper_bytes=len(helper),
                camera_table_cpu='E6F6',old_q7_q8=OLD,new_q7_q8=NEW,changed_offsets=differences,
                view2=dict(back_world=6,height_world=3.5,pitch_cos=252,pitch_sin=46),
                view4=dict(back_world=0,height_world=3277/128,pitch_degrees=90,
                           source_pixels_per_screen_pixel=(3277/128)*5/128))
    OUTPUT.with_suffix('.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
    print(json.dumps({k:v for k,v in report.items()if k!='changed_offsets'}))


if __name__=='__main__':main()
