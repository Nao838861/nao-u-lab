"""同じ3Dパイプラインで、従来ラスタライザーと最適化版の30fps境界を測る。"""
import argparse,hashlib,json,subprocess
from pathlib import Path
from build_polygon import ROOT,build
from polygon_reference import reference
from verify_polygon_native import verify
from run_bitmap import run

CASES=[('large','cube',24,'spread'),('medium','cube',12,'spread'),
       ('small','cube',6,'spread'),('irregular','icosahedron',16,'spread'),
       ('overlap','icosahedron',12,'overlap'),('clipped','octahedron',24,'clipped')]


def native(directory):
    config=json.loads((directory/'config.json').read_text())
    exe=ROOT/'build/Release/nesfx_polygon_probe.exe'
    key=hashlib.sha256(next(directory.glob('*.nes')).read_bytes()+exe.read_bytes()).hexdigest()
    report=directory/'timing.json'
    if report.exists():
        value=json.loads(report.read_text())
        if value.get('key')==key:return value
    flags=int(config['multiplier_fast'])+2*config['clock_select']+4*int(config.get('hardware_clear',False))
    result=subprocess.run([str(exe),str(directory),'timing',str(flags)],capture_output=True,check=True,timeout=90)
    value=json.loads(result.stdout);value['key']=key
    report.write_text(json.dumps(value,indent=2)+'\n')
    return value


def describe(directory):
    config=json.loads((directory/'config.json').read_text())
    frames=[reference(config,p)[2] for p in range(64)]
    def limits(key):return [min(f[key] for f in frames),max(f[key] for f in frames)]
    return {'objects':config['count'],'submitted_triangles':config['count']*len(config['triangles']),
            'visible_triangles':limits('visible'),'drawn_triangles':limits('drawn'),
            'transformed_vertices':config['count']*len(config['vertices']),
            'pixel_writes':limits('pixel_writes'),'covered_pixels':limits('covered_pixels'),
            'spans':limits('spans'),'overdraw':limits('overdraw')}


def main():
    p=argparse.ArgumentParser();p.add_argument('--verify-real',action='store_true');args=p.parse_args()
    output=ROOT/'build/polygon/benchmark';output.mkdir(parents=True,exist_ok=True)
    records=[]
    for label,mesh,half,scene in CASES:
        for renderer,clock,ms in [('baseline',0,False),('fast',0,False),('fast',1,True)]:
            def make(n):return build(n,half,scene,mesh,renderer,ms,clock)
            cap=64 if renderer=='baseline' else 128
            def search(budget):
                lo=0;hi=cap+1
                while hi-lo>1:
                    n=(lo+hi)//2;d=make(n)
                    if native(d)['max_clocks']<=budget:lo=n
                    else:hi=n
                return max(1,lo)
            budget20=search(500000)
            n=search(825000);directory=make(n);failure=None;actual=None
            if args.verify_real:
                while True:
                    actual=run(directory,64,True)
                    if actual['at_30fps']:break
                    n-=1;directory=make(n)
                if n<cap:
                    nextdir=make(n+1);failure=run(nextdir,64,True)
                    while failure['at_30fps']:
                        n+=1;directory=nextdir;actual=failure
                        if n==cap:failure=None;break
                        nextdir=make(n+1);failure=run(nextdir,64,True)
                verify(directory)
            value=native(directory)
            record={'case':label,'mesh':mesh,'half':half,'scene':scene,'renderer':renderer,
                    'clock_select':clock,'multiplier_fast':ms,'directory':str(directory.relative_to(ROOT)),
                    'max_gsu_ms':value['max_clocks']/25000,'budget20':describe(make(budget20)),
                    'at30':describe(directory),'nes':actual,'next_nes':failure,
                    'native':value}
            records.append(record)
            (output/'summary.json').write_text(json.dumps({'status':'in_progress','results':records},indent=2)+'\n')
            print(label,renderer,f'c{clock}',n,'objects',record['at30']['drawn_triangles'],'drawn triangles',
                  f"{record['max_gsu_ms']:.3f}ms; 20ms={budget20}",flush=True)
    summary={'status':'pass' if args.verify_real else 'native_only','clock_hz':25000000,
             'frame_budget_fields':2,'poses':64,'hardware_verified':False,'results':records}
    (output/'summary.json').write_text(json.dumps(summary,indent=2)+'\n')
    print('POLYGON BENCHMARK COMPLETE',flush=True)


if __name__=='__main__':main()
