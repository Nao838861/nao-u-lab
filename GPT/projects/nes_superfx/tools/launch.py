"""ファイルを変更せず、子プロセスだけにマッパー選択を渡して起動する。"""
import argparse
import os
import subprocess
import json
import hashlib
from pathlib import Path
from native_lock import core_lock

ROOT=Path(__file__).resolve().parents[1]


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('rom',nargs='?',type=Path,default=ROOT/'runtime/gsu-selftest.nes')
    parser.add_argument('--mapper',required=True,choices=['n8pro-gsu-abi1','n8pro-gsu-abi2','n8pro-racing-gsu','nrom'])
    parser.add_argument('--runtime',type=Path,default=ROOT/'runtime')
    parser.add_argument('--controller-a',action='store_true',help='NESパッドを有効にし、未割当ならZをAに設定')
    parser.add_argument('--gsu-mhz',type=int,choices=[25,50],default=25,help='GSU基準MHz。50でも外部RAMとフィルの実時間を維持')
    args=parser.parse_args()
    if args.gsu_mhz!=25 and args.mapper not in ['n8pro-gsu-abi2','n8pro-racing-gsu']:parser.error('50MHzはABI2専用です')
    rom=args.rom.resolve()
    header=rom.read_bytes()[:16]
    if len(header)!=16 or header[:4]!=b'NES\x1a': parser.error('iNES ROMを指定してください')
    expected=[bytes([64,1]),bytes([128,1])] if args.mapper=='n8pro-racing-gsu' else [bytes([2,1])]
    if args.mapper!='nrom' and (header[4:6] not in expected or (header[6]&0xF4) or (header[7]&0xFC)):
        parser.error('選択したGSUマッパーのROM形式と一致しません')
    env=os.environ.copy()
    env['NES_GSU_CLOCK_HZ']=str(args.gsu_mhz*1000000)
    if args.mapper!='nrom': env['NES_GSU_MAPPER']=args.mapper
    else: env.pop('NES_GSU_MAPPER',None)
    runtime=args.runtime.resolve()
    executable=runtime/'Mesen.exe'
    if not executable.exists(): parser.error('先にtools/setup_runtime.pyを実行してください')
    core=runtime/'MesenCore.dll'
    manifest=json.loads((runtime/'runtime_manifest.json').read_text())
    if hashlib.sha256(core.read_bytes()).hexdigest()!=manifest['MesenCore.dll']:
        parser.error('専用コアのhashが異なります。tools/setup_runtime.pyを再実行してください')
    settings=runtime/'settings.json'
    config=json.loads(settings.read_text(encoding='utf-8-sig'))
    config.setdefault('Preferences',{})['SingleInstance']=False
    if args.controller_a:
        port=config.setdefault('Nes',{}).setdefault('Port1',{})
        port['Type']='NesController'
        mapping=port.setdefault('Mapping1',{})
        # Pinned Mesen Shared/KeyDefinitions.h: Z is 69 (not Windows VK_Z).
        if not mapping.get('A'):mapping['A']=69
    settings.write_text(json.dumps(config,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    # The stock 2.1.1 UI tries to extract its embedded DLL before loading it.
    # A read-sharing handle makes that extraction fail safely inside its catch,
    # while allowing NativeLibrary.Load to use our custom DLL.
    with core_lock(core):
        subprocess.run([str(executable),str(rom)],cwd=executable.parent,env=env,check=True)


if __name__=='__main__': main()
