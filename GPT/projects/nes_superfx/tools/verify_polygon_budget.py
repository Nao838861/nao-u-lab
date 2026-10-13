"""20msの候補も全64姿勢のGSU画素と頂点を検査する。"""
import json
from build_polygon import ROOT,build
from verify_polygon_native import verify


def main():
    path=ROOT/'build/polygon/benchmark/summary.json'
    summary=json.loads(path.read_text());assert summary['status']=='pass'
    for record in summary['results']:
        if record['renderer']!='fast':continue
        n=record['budget20']['objects']
        directory=build(n,record['half'],record['scene'],record['mesh'],record['renderer'],
                        record['multiplier_fast'],record['clock_select'])
        result=verify(directory);assert result['native']['max_clocks']<=500000
        record['budget20_verified']={'status':'pass','max_gsu_ms':result['native']['max_clocks']/25000,
                                     'directory':str(directory.relative_to(ROOT))}
    path.write_text(json.dumps(summary,indent=2)+'\n')


if __name__=='__main__':main()
