"""直線3面の統合前後で、描画差とGSUクロックを520条件で計測する。"""
import argparse,json,struct,zipfile
from pathlib import Path
import verify_racing_optimization as profile
from verify_ground import decode
from PIL import Image

ROOT=profile.ROOT


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--probe',type=Path,required=True)
    args=parser.parse_args()
    profile.OUT=ROOT/'build/racing/v003/road-merge/verification'
    profile.OUT.mkdir(parents=True,exist_ok=True)
    with zipfile.ZipFile(ROOT/'demos/racing/v003/road_merge_baseline.zip') as archive:
        inputs=[archive.read(f'snapshot{i}.bin') for i in range(8)]
    rom=(ROOT/'releases/GSU_MMC5Racing3D_v003.nes').read_bytes()
    mesh=rom[16+8192:16+16384]
    # This experiment changes only face records and their two header fields.
    assert all(data[0x9000:0xa000]==mesh[0x1000:0x2000] for data in inputs)
    results=[]
    dst=ROOT/'demos/racing/v003/results/road_merge'
    dst.mkdir(exist_ok=True)
    worst_pixels=-1

    def compare(data,label,ground,view):
        nonlocal worst_pixels
        before,old=profile.run(args.probe,data,'before')
        patched=bytearray(data)
        for lo,hi in [(0x20,0x22),(0x2a,0x2c),(0x300,0x600)]:
            patched[0x8000+lo:0x8000+hi]=mesh[lo:hi]
        after,new=profile.run(args.probe,patched,'after')
        a,b=decode(old),decode(new)
        pixels=sum(x!=y for x,y in zip(a,b))
        # Texture mode skips the road faces, so its pixels must stay exact.
        if ground:assert old==new,label
        if pixels>worst_pixels:
            worst_pixels=pixels
            palette=[(220,40,40),(40,150,60),(130,130,130),(255,255,255)]
            for name,frame in [('before',a),('after',b)]:
                im=Image.new('RGB',(256,192));im.putdata([palette[c] for c in frame]);im.save(dst/f'largest_difference_{name}.png')
        results.append({'case':label,'ground':ground,'view':view,'before_clocks':before,
                        'after_clocks':after,'before_ms':round(before/50000,3),
                        'after_ms':round(after/50000,3),'changed_pixels':pixels})

    for i,data in enumerate(inputs):compare(data,f'spawn-{i}',i//4,i%4)
    states=profile.mmc5_state.route_states(profile.mmc5_course.route())
    for ground in [0,1]:
        for view in range(4):
            for phase,state in enumerate(states):
                x,z,body,cam,tick=profile.mmc5_state.unpack(state)
                body=(body+[-4096,0,4096][phase%3])&65535
                pose=profile.mmc5_state.pose(profile.mmc5_state.snapshot(x,z,body,cam,tick),profile.VIEWS[view])
                data=bytearray(inputs[ground*4+view]);struct.pack_into('<11h',data,0x8008,*pose)
                compare(data,f'route-{ground}-{view}-{phase}',ground,view)
            print(f'Compared {len(results)} frames',flush=True)
    report={'baseline_revision':'36d7bace9','clock_hz':50000000,'cases':len(results),
            'scope':'8 spawn snapshots + 64 course poses x 4 views x 2 ground modes',
            'identical_frames':sum(r['changed_pixels']==0 for r in results),
            'max_changed_pixels':worst_pixels,'initial':results[:8],
            'largest_differences':sorted(results,key=lambda r:r['changed_pixels'],reverse=True)[:8]}
    for ground,name in [(0,'polygon'),(1,'texture')]:
        rows=[r for r in results if r['ground']==ground]
        report[name]={'before_total_clocks':sum(r['before_clocks'] for r in rows),
                      'after_total_clocks':sum(r['after_clocks'] for r in rows),
                      'faster_cases':sum(r['after_clocks']<r['before_clocks'] for r in rows),
                      'worst_relative_cost':max(r['after_clocks']/r['before_clocks'] for r in rows)}
    (dst/'verification.json').write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps(report))


if __name__=='__main__':main()
