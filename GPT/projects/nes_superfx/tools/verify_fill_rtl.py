"""範囲フィル回路をGHDLで検査し、ソースhash付きの結果を保存する。"""
import argparse,hashlib,json,shutil,subprocess
from pathlib import Path
from build_polygon import ROOT

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--ghdl',type=Path);args=parser.parse_args()
    fallback=Path('C:/Users/owner/Downloads/MMC5Racing/build/superfx-deps/ghdl-5.1.1/bin/ghdl.exe')
    ghdl=str(args.ghdl or shutil.which('ghdl') or fallback)
    out=ROOT/'build/fill_rtl';out.mkdir(exist_ok=True)
    sources=[ROOT/'rtl/ram_range_fill.vhd',ROOT/'rtl/tb_ram_range_fill.vhd']
    logs=[]
    for command in ([ghdl,'-a','--std=08',*[str(p) for p in sources]],
                    [ghdl,'-e','--std=08','tb_ram_range_fill'],
                    [ghdl,'-r','--std=08','tb_ram_range_fill','--assert-level=error']):
        result=subprocess.run(command,cwd=out,capture_output=True,text=True,check=True)
        logs.append(result.stdout+result.stderr)
    (out/'simulation.log').write_text('\n'.join(logs),encoding='utf-8')
    assert 'RAM RANGE FILL RTL PASS' in ''.join(logs)
    data={'status':'pass','clock_hz':25000000,'full_clear_granted_cycles':16384,
          'full_clear_ms':16384/25000,'hardware_fit_verified':False,
          'sources':{str(p.relative_to(ROOT)):hashlib.sha256(p.read_bytes()).hexdigest() for p in sources},
          'ghdl_version':subprocess.check_output([ghdl,'--version'],text=True).splitlines()[0],
          'log':'\n'.join(logs)}
    (out/'summary.json').write_text(json.dumps(data,indent=2)+'\n')
    print('RAM RANGE FILL RTL PASS',flush=True)

if __name__=='__main__':main()
