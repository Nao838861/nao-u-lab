"""地面比較ROMの未割当キーを補い、明示したクロックで専用Mesenを起動。"""
import argparse,hashlib,json,subprocess,sys
from build_ground import ROOT

def main():
    p=argparse.ArgumentParser();p.add_argument('--gsu-mhz',type=int,choices=[25,50],default=50);args=p.parse_args()
    rom=ROOT/'releases/GSU_GroundCompare_v001.nes'
    manifest=json.loads((ROOT/'releases/ground_compare_v001.json').read_text(encoding='utf-8'))
    if hashlib.sha256(rom.read_bytes()).hexdigest()!=manifest['rom_sha256']:p.error('ROM hash mismatch')
    settings=ROOT/'runtime/settings.json';cfg=json.loads(settings.read_text(encoding='utf-8-sig'))
    port=cfg.setdefault('Nes',{}).setdefault('Port1',{});port['Type']='NesController'
    mapping=port.setdefault('Mapping1',{})
    # Pinned Mesen Core/Shared/KeyDefinitions.h; preserve existing assignments.
    for name,key in {'A':69,'B':67,'Select':117,'Left':23,'Right':25}.items():
        if not mapping.get(name):mapping[name]=key
    settings.write_text(json.dumps(cfg,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    subprocess.run([sys.executable,str(ROOT/'tools/launch.py'),'--mapper','n8pro-gsu-abi2','--gsu-mhz',str(args.gsu_mhz),str(rom)],check=True)

if __name__=='__main__':main()
