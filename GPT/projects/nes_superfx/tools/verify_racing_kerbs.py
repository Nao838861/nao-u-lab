"""Compare grouped curb rejection with an otherwise identical uncullled ROM."""
import argparse,json,subprocess,sys
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
def main():
    p=argparse.ArgumentParser();p.add_argument('--cc65-bin',type=Path,required=True);a=p.parse_args()
    out=ROOT/'build/racing/v003/kerb_comparison';out.mkdir(parents=True,exist_ok=True)
    subprocess.run([str(a.cc65_bin/'ca65'),'-D','KERB_GROUP_CULL=0','-I',str(ROOT/'.cache/casfx'),str(ROOT/'demos/racing/v003/gsu.s'),'-o',str(out/'unculled.o')],check=True)
    subprocess.run([str(a.cc65_bin/'ld65'),'-C',str(ROOT/'build/racing/v003/gsu.cfg'),str(out/'unculled.o'),'-o',str(out/'unculled.bin')],check=True)
    rom=bytearray((ROOT/'releases/GSU_MMC5Racing3D_v003.nes').read_bytes())
    for bank in [1,2]:rom[16+bank*8192+4096:16+(bank+1)*8192]=(out/'unculled.bin').read_bytes()
    path=out/'unculled.nes';path.write_bytes(rom)
    for name,args in [('culled',[]),('unculled',['--rom',str(path)])]:
        subprocess.run([sys.executable,str(ROOT/'tools/verify_racing_colors.py'),'--results',str(out/name),*args],check=True)
    for ground in [0,1]:
        for view in range(4):
            name=f'ground{ground}-view{view}.png'
            assert Image.open(out/'culled'/name).tobytes()==Image.open(out/'unculled'/name).tobytes(),name
    yes=json.loads((out/'culled/gsu_clocks.json').read_text());no=json.loads((out/'unculled/gsu_clocks.json').read_text())
    report={'identical_images':8,'gsu_clocks_culled':yes,'gsu_clocks_unculled':no,'polygon_savings_percent':[round(100*(1-y/n),1) for y,n in zip(yes[:4],no[:4])],'scope':'spawn pose, four views, both ground modes, 50MHz emulated GSU'}
    (ROOT/'demos/racing/v003/results/kerb_comparison.json').write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps(report))
if __name__=='__main__':main()
