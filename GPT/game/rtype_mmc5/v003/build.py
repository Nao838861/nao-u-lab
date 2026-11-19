"""通路のタイルと光形状を合成し、cc65でmapper 5のROMを生成する。"""
import math
import shutil
import subprocess
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent
OUT = ROOT / 'build'
OUT.mkdir(exist_ok=True)
from assets import build_art

def build():
    chrrom=build_art()
    size=len(chrrom)//4096
    def run(*args): subprocess.run(args,cwd=ROOT,check=True)
    run('cc65','-t','none','-Oirs','-o','build/game.s','game.c')
    run('ca65','-t','none','build/game.s','-o','build/game.o')
    run('ca65','boot.s','-o','build/boot.o')
    lib=Path(shutil.which('ca65')).resolve().parents[1]/'lib/none.lib'
    run('ld65','-C','cart.cfg','-Ln','build/cart.lbl','-o','build/prg.bin','build/boot.o','build/game.o',str(lib))
    header=b'NES\x1a'+bytes([2,size//2,0x50,0])+bytes(8)
    (ROOT/'rtype-mmc5-v003.nes').write_bytes(header+(OUT/'prg.bin').read_bytes()+chrrom)
if __name__=='__main__': build()

