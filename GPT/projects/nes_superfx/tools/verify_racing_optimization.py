"""GSU命令単位の計測と、同一入力からの描画全バイト比較。"""
import argparse,json,math,re,struct,subprocess,zipfile
from pathlib import Path
import mmc5_course,mmc5_state
from build_ground import VIEWS

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'build/racing/v003/optimization/verification'
NAMES=['render_entry','texture_ground','setup_row','mul8','transform','faces','curb_vertex','clip_plane','project_polygon','raster_polygon','edge_span','edge_rows','fill_spans','divide','tree_transform','tree_centers']

def run(probe,data,name):
    path=OUT/f'{name}.bin';path.write_bytes(data)
    stem=OUT/name
    clocks=int(subprocess.check_output([str(probe),str(path),str(stem)],text=True))
    return clocks,(OUT/f'{name}.frame').read_bytes()

def main():
    p=argparse.ArgumentParser();p.add_argument('--probe',type=Path,required=True);a=p.parse_args()
    OUT.mkdir(parents=True,exist_ok=True)
    with zipfile.ZipFile(ROOT/'demos/racing/v003/optimization_baseline.zip') as z:
        inputs=[z.read(f'snapshot{i}.bin') for i in range(8)]
        labels={n:int(v,16) for v,n in re.findall(r'al ([0-9A-Fa-f]+) \.([^\s]+)',z.read('gsu.lbl').decode())}
    code=(ROOT/'build/racing/v003/gsu.bin').read_bytes()
    after_labels={n:int(v,16) for v,n in re.findall(r'al ([0-9A-Fa-f]+) \.([^\s]+)',(ROOT/'build/racing/v003/gsu.lbl').read_text())}
    rom=(ROOT/'releases/GSU_MMC5Racing3D_v003.nes').read_bytes();mesh=rom[16+8192:16+16384]
    initial=[];worst=[];count=0
    def compare(data,label):
        nonlocal count
        before,old=run(a.probe,data,'before')
        patched=bytearray(data);patched[0x9000:0xa000]=code
        for lo,hi in [(0x20,0x22),(0x2a,0x2c),(0x300,0x600)]:patched[0x8000+lo:0x8000+hi]=mesh[lo:hi]
        after,new=run(a.probe,patched,'after')
        if old!=new:
            (OUT/'failed-before.bin').write_bytes(data);(OUT/'failed-after.bin').write_bytes(patched)
            raise AssertionError((label,sum(x!=y for x,y in zip(old,new))))
        count+=1;worst.append((after/before,label,before,after))
        return before,after
    for i,data in enumerate(inputs):
        before,after=compare(data,f'spawn-{i}')
        cs=struct.unpack('<65536Q',(OUT/'before.clocks').read_bytes())
        parts={x:sum(cs[labels[x]:labels[y]]) for x,y in zip(NAMES,NAMES[1:])}
        ac=struct.unpack('<65536Q',(OUT/'after.clocks').read_bytes())
        ap={x:sum(ac[after_labels[x]:after_labels[y]]) for x,y in zip(NAMES,NAMES[1:])}
        initial.append({'after_profile_clocks':ap,'view':i%4,'ground':i//4,'before_clocks':before,'after_clocks':after,'before_ms':round(before/50000,2),'after_ms':round(after/50000,2),'savings_percent':round(100*(1-after/before),1),'before_profile_clocks':parts})
    states=mmc5_state.route_states(mmc5_course.route())
    for mode in [0,1]:
        for view in range(4):
            for phase,state in enumerate(states):
                x,z,body,cam,tick=mmc5_state.unpack(state)
                # Offset the car yaw from the camera, exercising shared projection caches.
                body=(body+[-4096,0,4096][phase%3])&65535
                pose=mmc5_state.pose(mmc5_state.snapshot(x,z,body,cam,tick),VIEWS[view])
                data=bytearray(inputs[mode*4+view]);struct.pack_into('<11h',data,0x8008,*pose)
                compare(data,f'route-{mode}-{view}-{phase}')
            print(f'Compared {count} frames',flush=True)
    dst=ROOT/'demos/racing/v003/results/optimization';dst.mkdir(exist_ok=True)
    report={'identical_framebuffers':count,'clock_hz':50000000,'scope':'8 emulator snapshots + 64 course poses x 4 views x 2 ground modes; body-camera yaw offsets -22.5/0/+22.5 degrees','initial':initial,'worst_relative_cost':sorted(worst,reverse=True)[:8]}
    (dst/'verification.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps({'identical':count,'initial_ms':[r['after_ms'] for r in initial]}))

if __name__=='__main__':main()
