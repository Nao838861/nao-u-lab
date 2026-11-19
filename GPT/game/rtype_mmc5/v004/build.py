"""通路のタイルと光形状を合成し、cc65でmapper 5のROMを生成する。"""
import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent
OUT = ROOT / 'build'
OUT.mkdir(exist_ok=True)
from assets import build_art

def build(preview=False):
    chrrom=build_art()
    size=len(chrrom)//4096
    def run(*args): subprocess.run(args,cwd=ROOT,check=True)
    run('cc65','-t','none',*(['-DBOSS_PREVIEW'] if preview else []),'-Oirs','--static-locals','-o','build/game.s','game.c')
    run('ca65','-t','none','build/game.s','-o','build/game.o')
    from encounter_data import write
    write()
    run('cc65','-t','none','-Oirs','--static-locals','-o','build/actors.s','actors.c')
    run('ca65','build/actors.s','-o','build/actors.o')
    run('ca65','actor_fast.s','-o','build/actor_fast.o')
    run('ca65','boot.s','-o','build/boot.o')
    lib=Path(shutil.which('ca65')).resolve().parents[1]/'lib/none.lib'
    run('ld65','-C','cart.cfg','-Ln','build/boss.lbl' if preview else 'build/cart.lbl','-o','build/prg.bin','build/boot.o','build/game.o','build/actors.o','build/actor_fast.o',str(lib))
    boss=(OUT/'boss-data.bin').read_bytes()
    assert len(boss)<=26*8192
    auxiliary=boss.ljust(26*8192,bytes(1))+(OUT/'actor-bank.bin').read_bytes()
    assert len(auxiliary)==224*1024
    header=b'NES\x1a'+bytes([16,size//2,0x50,0])+bytes(8)
    (ROOT/('rtype-mmc5-boss.nes' if preview else 'rtype-mmc5-v004.nes')).write_bytes(header+auxiliary+(OUT/'prg.bin').read_bytes()+chrrom)
if __name__=='__main__':
    import sys
    build('--boss' in sys.argv)

