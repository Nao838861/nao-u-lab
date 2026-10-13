"""モデル内の30fps上限を、非重複配置・64角度・実NES ROMで境界検証する。"""
import hashlib,json,math,subprocess
from pathlib import Path
from build_bitmap import ROOT,build,positions
from run_bitmap import run


def native(directory):
    exe=ROOT/'build/Release/nesfx_bitmap_probe.exe'
    report=directory/'native.json'
    key=hashlib.sha256(next(directory.glob('*.nes')).read_bytes()+exe.read_bytes()).hexdigest()
    if report.exists():
        saved=json.loads(report.read_text())
        if saved.get('key')==key:return saved
    result=subprocess.run([str(exe),str(directory),'solid'],capture_output=True,text=True,timeout=40)
    if result.returncode:raise RuntimeError(result.stderr)
    data=json.loads(result.stdout);data['key']=key
    report.write_text(json.dumps(data,indent=2)+'\n');return data


def main():
    results=[];root=ROOT/'build/bitmap/benchmark';root.mkdir(parents=True,exist_ok=True)
    for half in [44,32,24,16,12,8,6,4,2,1]:
        rx=math.ceil(1.42*half);ry=math.ceil(1.56*half)
        capacity=min((256//(2*rx+2))*(240//(2*ry+2)),448)
        lo=0;hi=capacity+1
        print(f'half={half} grid={capacity}: native search',flush=True)
        while hi-lo>1:
            n=(lo+hi)//2;directory=build('solid',3,n,half);data=native(directory)
            if data['max_clocks']<=831900:lo=n
            else:hi=n
        n=max(1,lo)
        while True:
            directory=build('solid',3,n,half)
            check=run(directory,64,True)
            if check['at_30fps']:break
            n-=1
            if n<1:raise RuntimeError(f'no 30fps configuration half {half}')
        fail=None
        if n<capacity:
            next_dir=build('solid',3,n+1,half);fail=run(next_dir,64,True)
            # Refine upward if a native estimate was conservative.
            while fail['at_30fps']:
                n+=1;directory=next_dir;check=fail
                if n==capacity:fail=None;break
                next_dir=build('solid',3,n+1,half);fail=run(next_dir,64,True)
        record={'half':half,'model_edge':half*2,'count_at_30fps':n,'grid_capacity':capacity,
                'limit':'layout_capacity' if n==capacity else 'render_deadline',
                'max_gsu_ms':check['gsu_max_clocks']/25000,'pass':check,
                'next_count':n+1 if fail else None,'next':fail,
                'directory':str(directory.relative_to(ROOT))}
        results.append(record)
        (root/'summary.json').write_text(json.dumps({'status':'in_progress','results':results},indent=2)+'\n')
        print(f'RESULT half={half} count={n} limit={record["limit"]} gsu={record["max_gsu_ms"]:.3f}ms',flush=True)
    summary={'status':'pass','criterion':'every completed image presented at 2 NTSC fields, 64 angles, no deadline miss, all pixels equal reference',
             'clock_hz':25000000,'hardware_verified':False,
             'caveat':'Mesen-derived GSU timing model, not FPGA throughput; finite-angle non-overlapping identical cubes',
             'results':results}
    (root/'summary.json').write_text(json.dumps(summary,indent=2)+'\n')
    print('ALL BENCHMARK BOUNDARIES VERIFIED',flush=True)


if __name__=='__main__':main()
