"""r002 ROM のパレットだけを更新する。旧 ROM と実行環境は保存する。"""
import argparse, hashlib, json
from pathlib import Path

OLD=bytes.fromhex('30 16 1a 00 30 16 1a 21 30 16 1a 00 30 16 1a 21')
NEW=bytes.fromhex('30 16 1a 00 30 16 1a 21 30 16 00 21 30 00 1a 21')
R002='6bcc297d63f31414b4beebe289742d98c50328399ef13b8baad5ac27a2c91d24'

def main():
    p=argparse.ArgumentParser();p.add_argument('source',type=Path);p.add_argument('output',type=Path);a=p.parse_args()
    before=a.source.read_bytes();assert hashlib.sha256(before).hexdigest()==R002,'r002 input required'
    data=bytearray(before);assert data[16:8208].count(OLD)==1
    offset=data.index(OLD,16,8208);data[offset:offset+16]=NEW
    assert data[1048592:1048596]==b'M7R4';data[1048595]=ord('5')
    changed=[i for i,(x,y) in enumerate(zip(before,data)) if x!=y]
    assert all(offset<=i<offset+16 or i==1048595 for i in changed)
    assert data[offset:offset+4]==before[offset:offset+4], 'ground palette changed'
    a.output.parent.mkdir(parents=True,exist_ok=True);a.output.write_bytes(data)
    report={'source_sha256':R002,'sha256':hashlib.sha256(data).hexdigest(),'palette_offset':offset,
            'changed_file_offsets':changed,'palette_bytes':NEW.hex(' '),'ground_unchanged':True,
            'gsu_program_unchanged':True,'format':'M7R5'}
    a.output.with_suffix('.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report))

if __name__=='__main__':main()
