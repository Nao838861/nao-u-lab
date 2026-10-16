"""元の走行挙動を保つ3D版を専用マッパーで起動する。"""
import argparse,hashlib,json,subprocess,sys
from build_ground import ROOT

def main():
    p=argparse.ArgumentParser();p.add_argument('--gsu-mhz',type=int,choices=[25,50],default=50);p.add_argument('--version',choices=['001','002','003'],default='003');args=p.parse_args()
    rom=ROOT/f'releases/GSU_MMC5Racing3D_v{args.version}.nes'
    manifest=json.loads((ROOT/f'releases/racing_3d_v{args.version}.json').read_text())
    assert hashlib.sha256(rom.read_bytes()).hexdigest()==manifest['rom_sha256']
    settings=ROOT/'runtime/settings.json';cfg=json.loads(settings.read_text(encoding='utf-8-sig'))
    port=cfg.setdefault('Nes',{}).setdefault('Port1',{});port['Type']='NesController';mapping=port.setdefault('Mapping1',{})
    for name,key in {'A':69,'B':67,'Select':117,'Start':6,'Left':23,'Right':25,'Up':24,'Down':26}.items():
        if not mapping.get(name):mapping[name]=key
    settings.write_text(json.dumps(cfg,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    subprocess.run([sys.executable,str(ROOT/'tools/launch.py'),'--mapper','n8pro-racing-gsu','--gsu-mhz',str(args.gsu_mhz),str(rom)],check=True)

if __name__=='__main__':main()
