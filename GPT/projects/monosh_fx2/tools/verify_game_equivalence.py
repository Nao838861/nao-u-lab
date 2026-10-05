"""C参照版と65816版を同じ入力・更新回数で比較し、状態と描画矩形を保存する。"""
import gzip
import hashlib
import json
from pathlib import Path
import subprocess
import sys
from build_game import BUILD, GAME

TOOLS=Path(__file__).resolve().parent

def run(name,*args):
    subprocess.run([sys.executable,'-X','utf8',str(TOOLS/name),*map(str,args)],check=True)

def capture(reference=False):
    run('build_game.py',*(['--reference-logic'] if reference else []))
    rom_sha=hashlib.sha256((BUILD/'MonoSHFX2_v001.sfc').read_bytes()).hexdigest()
    run('test_game.py','--scenario','equivalence','--frames',8000,'--timeout',120)
    states=(BUILD/'equivalence/states.bin').read_bytes()
    raw=json.loads((BUILD/'equivalence/state_blocks.json').read_text())
    blocks=[(raw[str(i)]['1'],raw[str(i)]['2']) for i in range(1,len(raw)+1)]
    return rom_sha,states,blocks

def main():
    reference,a,blocks=capture(True)
    native,b,native_blocks=capture()
    assert blocks==native_blocks
    stride=sum(size for _,size in blocks)
    n=min(len(a),len(b))//stride
    assert n>=3500,n
    for frame in range(n):
        offset=frame*stride
        count=0
        for name,size in blocks:
            aa=a[offset:offset+size];bb=b[offset:offset+size]
            if name=='_fx_draw_count':count=aa[0]
            if name=='_fx_draw':aa=aa[:count*10];bb=bb[:count*10]
            assert aa==bb,f'update {frame+1}, {name}: {aa.hex()} != {bb.hex()}'
            offset+=size
    results=GAME/'results/equivalence';results.mkdir(exist_ok=True)
    for name,states in [('reference',a),('native',b)]:
        (results/(name+'.bin.gz')).write_bytes(gzip.compress(states,mtime=0))
    report={'referenceRomSha256':reference,'nativeRomSha256':native,'matchedUpdates':n,
            'recordBytes':stride,'referenceUpdates':len(a)//stride,'nativeUpdates':len(b)//stride,
            'blocks':blocks,'input':'96更新ごとに右・左・上・下・右上・左下・中立・中立、連射を保持',
            'comparison':'全状態ブロックは全byte、描画矩形はdrawCountの有効要素を比較'}
    (results/'summary.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print('C/native exact state and active draw match:',n,'updates')

if __name__=='__main__':main()
