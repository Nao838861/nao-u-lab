"""同じ保存済み版・新規生成版を2つのSDKでビルドし、ROMの完全一致を検査する。"""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess
import sys


def sha(data):
    return hashlib.sha256(data).hexdigest()


def worker(args):
    sdk=args.sdk.resolve();out=args.output.resolve()
    sys.path.insert(0,str(sdk))
    from famibasic.project_folder import load
    from famibasic.build_service import BuildService
    from famibasic.audio_sources import refresh
    records={}
    for name in ('saved','fresh'):
        stored=out/(name+'_input.json')
        if args.phase=='before':
            if name=='saved':p=load(args.project.resolve())
            else:
                from tools.latest_flight_lab import fresh_project
                p=fresh_project(out/'fresh_generation',preview=False)
            p=refresh(p);p.pop('audio_sources',None)
            stored.write_text(json.dumps(p,ensure_ascii=False),encoding='utf-8')
        else:p=json.loads(stored.read_text(encoding='utf-8'))
        result=BuildService().build(p,out/args.phase/name/'game.nes')
        initial=result.rom_path.with_suffix('.initial.sav')
        labels=json.dumps(result.report['labels'],sort_keys=True,separators=(',',':')).encode()
        records[name]={'rom_sha256':result.rom_sha256,'rom_bytes':result.rom_path.stat().st_size,
                       'labels_sha256':sha(labels),'source_sha256':sha(p['source'].encode()),
                       'initial_save_sha256':sha(initial.read_bytes()) if initial.exists() else None}
        print(args.phase,name,records[name]['rom_sha256'],flush=True)
    (out/(args.phase+'.json')).write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--baseline',type=Path)
    parser.add_argument('--candidate',type=Path)
    parser.add_argument('--project',type=Path,required=True)
    parser.add_argument('--output',type=Path,required=True)
    parser.add_argument('--sdk',type=Path)
    parser.add_argument('--phase',choices=('before','after'))
    parser.add_argument('--compare-only',action='store_true',help='保存済みbefore/after.jsonを再比較する')
    args=parser.parse_args()
    if args.phase:return worker(args)
    if not args.compare_only:
        if not args.baseline or not args.candidate:parser.error('--baselineと--candidateが必要です')
        args.output.mkdir(parents=True,exist_ok=False)
        for phase,sdk in (('before',args.baseline),('after',args.candidate)):
            subprocess.run([sys.executable,'-X','utf8',str(Path(__file__).resolve()),'--phase',phase,
                            '--sdk',str(sdk),'--project',str(args.project),'--output',str(args.output)],check=True,cwd=sdk)
    before=json.loads((args.output/'before.json').read_text(encoding='utf-8'))
    after=json.loads((args.output/'after.json').read_text(encoding='utf-8'))
    comparisons={name:before[name]==after[name] for name in before}
    report={'passed':all(comparisons.values()),'baseline':str(args.baseline),'candidate':str(args.candidate),
            'comparisons':comparisons,'before':before,'after':after,
            'note':'ROM全体・全ラベル番地・入力ソース・初期SAVを比較。FPSの許容差は使用しない。'}
    (args.output/'result.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(report,ensure_ascii=False,indent=2))
    if not report['passed']:raise SystemExit(1)


if __name__=='__main__':main()
