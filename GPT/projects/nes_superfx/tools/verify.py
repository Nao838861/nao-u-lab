"""無変更診断ROMをNES全体で走らせ、GSU無効対照と破壊対照を検証する。"""
import argparse
import hashlib
import json
import os
import subprocess
import sys
import time
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
LOCK=json.loads((ROOT/'sources.lock.json').read_text())
DEFAULT_ROM=Path(r'C:\Users\owner\Downloads\MMC5Racing\build\superfx-lab\gsu-selftest.nes')


def digest(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def child(args):
    from host import Host
    from PIL import Image
    selected=args.mode!='disabled'
    if selected: os.environ['NES_GSU_MAPPER']='n8pro-gsu-abi1'
    else: os.environ.pop('NES_GSU_MAPPER',None)
    out=ROOT/'build/verification'/args.mode
    out.mkdir(parents=True,exist_ok=True)
    host=Host(ROOT/'runtime/MesenCore.dll',out/'home')
    try:
        host.load(args.rom)
        deadline=time.monotonic()+20
        while host.timing().frame<12:
            if time.monotonic()>deadline: raise RuntimeError('NES frame timeout')
            time.sleep(0.01)
        host.dll.Pause()
        time.sleep(0.08)
        result=host.read(0)
        tile=host.read(0x2188,9)
        background=host.read(0x3F00,9)
        expected={'enabled':0,'disabled':1,'bad_add':4,'bad_multiply':4,'bad_plot':5}[args.mode]
        record={'mode':args.mode,'result':result,'expected':expected,'result_tile':tile,'background':background,
                'rom_sha256':digest(args.rom),'frame':host.timing().frame,'gsu_r5':[host.read(0x500A),host.read(0x500B)],
                'gsu_ram_0200':[host.read(0x6200),host.read(0x6201)],'gsu_ram_0000':[host.read(0x6000),host.read(0x6001)],
                'timing_model':'functional; not RTL cycle accurate'}
        frame=host.frame()
        if frame is None: raise RuntimeError('software renderer produced no frame')
        width,height,bgra=frame
        screenshot=Image.frombytes('RGBA',(width,height),bgra,'raw','BGRA').convert('RGB')
        screenshot.save(out/'screen.png')
        (out/'emulator.log').write_text(host.log(),encoding='utf-8')
        record['screenshot_sha256']=digest(out/'screen.png')
        record['checks']={'result':result==expected,'tile':tile==0x30+expected,
                          'palette':background==(0x1A if expected==0 else 0x16)}
        expected_rgb=(12,147,0) if expected==0 else (181,49,32)
        colors=screenshot.getcolors(width*height)
        record['rendered_background_rgb']=list(screenshot.getpixel((0,0)))
        record['checks']['rendered_background']=screenshot.getpixel((0,0))==expected_rgb
        record['checks']['visible_text']=len(colors)>1
        if args.mode=='enabled':
            record['checks'].update({'multiply':record['gsu_r5']==[0x3F,0],
                                      'add_store':record['gsu_ram_0200']==[0x36,0x13],
                                      'plot':record['gsu_ram_0000']==[255,255]})
        record['status']='pass' if all(record['checks'].values()) else 'fail'
        (out/'summary.json').write_text(json.dumps(record,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
        print(json.dumps(record,ensure_ascii=False))
        return 0 if record['status']=='pass' else 1
    finally:
        host.close()


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--rom',type=Path,default=DEFAULT_ROM)
    parser.add_argument('--mode',choices=['enabled','disabled','bad_add','bad_multiply','bad_plot'])
    args=parser.parse_args()
    if args.mode: return child(args)
    if digest(args.rom)!=LOCK['diagnostic_sha256']:
        raise RuntimeError('引き継ぎ診断ROMのhashが異なる。更新内容を確認すること')
    fixture=bytes(int(s,16) for s in (ROOT/'fixtures/program.hex').read_text().split())
    original=args.rom.read_bytes()
    if original.count(fixture)!=1: raise RuntimeError('ROMにGSU命令列を一意に特定できない')
    offset=original.index(fixture)
    out=ROOT/'build/verification'
    out.mkdir(parents=True,exist_ok=True)
    for mode in ('enabled','disabled','bad_add','bad_multiply','bad_plot'):
        rom=args.rom
        if mode.startswith('bad_'):
            patched=bytearray(original)
            index,value={'bad_add':(8,0x50),'bad_multiply':(17,0x83),'bad_plot':(30,2)}[mode]
            patched[offset+index]=value
            rom=out/f'{mode}.nes'; rom.write_bytes(patched)
        subprocess.run([sys.executable,__file__,'--rom',str(rom),'--mode',mode],check=True,timeout=45)
    if digest(args.rom)!=LOCK['diagnostic_sha256']: raise RuntimeError('原本ROMが変更された')
    summaries=[json.loads((out/mode/'summary.json').read_text(encoding='utf-8'))
               for mode in ('enabled','disabled','bad_add','bad_multiply','bad_plot')]
    (out/'summary.json').write_text(json.dumps({'status':'pass','tests':summaries},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print('ALL NES/GSU DIAGNOSTICS PASSED')
    return 0


if __name__=='__main__':
    raise SystemExit(main())
