"""50MHz拡張後も、既存v002の全12条件・64姿勢の時間が完全一致するか確認。"""
import json,subprocess
from build_polygon import ROOT

def main():
    source=json.loads((ROOT/'demos/polygon/v002/results/benchmark.json').read_text())
    cases=[]
    for r in source['results']:
        flags=4+int(r['multiplier_fast'])+2*r['clock_select']
        new=json.loads(subprocess.check_output([str(ROOT/'build/Release/nesfx_polygon_probe.exe'),
            str(ROOT/r['directory']),'timing',str(flags)]))
        old=r['native']
        assert new['max_clocks']==old['max_clocks']
        for a,b in zip(new['frames'],old['frames']):
            for key in ['phase','clocks','gsu_clocks','fill_clocks','fill_wait_clocks','vertices','submitted','visible','near_rejected']:
                assert a[key]==b[key],(r['case'],r['clock_select'],a['phase'],key,a[key],b[key])
        cases.append({'case':r['case'],'clock_select':r['clock_select'],'phases':64,'status':'pass'})
    out=ROOT/'build/polygon/clock25_compat.json'
    out.write_text(json.dumps({'status':'pass','cases':cases},indent=2)+'\n')
    print('25MHz extension compatibility: 12 cases x 64 phases exact clocks/counters PASS',flush=True)

if __name__=='__main__':main()
