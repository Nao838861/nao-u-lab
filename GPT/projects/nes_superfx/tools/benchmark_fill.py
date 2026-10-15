"""専用クリアの待ちを含め、実ROMで30fps最大個数と次個数の失敗を確認する。"""
import argparse,json
from build_polygon import ROOT,build
from benchmark_polygon import CASES,native,describe
from verify_polygon_native import verify
from run_bitmap import run

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--gsu-mhz',type=int,choices=[25,50],default=25);args=parser.parse_args()
    mhz=args.gsu_mhz
    out=ROOT/('build/polygon/clock50_benchmark' if mhz==50 else 'build/polygon/fill_benchmark');out.mkdir(exist_ok=True)
    previous=json.loads((ROOT/f'demos/polygon/v00{2 if mhz==50 else 1}/results/benchmark.json').read_text())
    records=[]
    for label,mesh,half,scene in CASES:
        for clock in ((1,) if mhz==50 else (0,1)):
            def make(n):return build(n,half,scene,mesh,'fast',bool(clock),clock,True,mhz)
            lo,hi=0,129
            while hi-lo>1:
                n=(lo+hi)//2;directory=make(n)
                if native(directory)['max_clocks']<=825000*mhz//25:lo=n
                else:hi=n
            n=max(1,lo);directory=make(n);actual=run(directory,64,True)
            while not actual['at_30fps']:
                n-=1;directory=make(n);actual=run(directory,64,True)
            while True:
                nextdir=make(n+1);failure=run(nextdir,64,True)
                if not failure['at_30fps']:break
                n+=1;directory=nextdir;actual=failure
            checked=verify(directory);timing=checked['native']
            assert all(f['fill_clocks']==16384 for f in timing['frames'])
            old=next(r for r in previous['results'] if r['case']==label and r['renderer']=='fast' and r['clock_select']==clock)
            record={'case':label,'mesh':mesh,'half':half,'scene':scene,'renderer':'fast',
                    'clock_select':clock,'multiplier_fast':bool(clock),'hardware_clear':True,
                    'reference_mhz':mhz,'memory_time':'fixed at 25MHz reference latency',
                    'directory':str(directory.relative_to(ROOT)),'next_directory':str(nextdir.relative_to(ROOT)),
                    'max_render_ms':timing['max_clocks']/(mhz*1000),'clear_ms':16384/25000,
                    'at30':describe(directory),'previous_at30':old['at30'],
                    'nes':actual,'next_nes':failure,'native':timing}
            records.append(record)
            data={'status':'in_progress','clock_hz':mhz*1000000,'memory_reference_hz':25000000,'fill_hz':25000000,'hardware_verified':False,'poses':64,'results':records}
            (out/'summary.json').write_text(json.dumps(data,indent=2)+'\n')
            print(label,clock,'old',old['at30']['objects'],'new',n,'triangles',record['at30']['drawn_triangles'],flush=True)
    data['status']='pass';(out/'summary.json').write_text(json.dumps(data,indent=2)+'\n')
    print('HARDWARE CLEAR BENCHMARK PASS',flush=True)

if __name__=='__main__':main()
