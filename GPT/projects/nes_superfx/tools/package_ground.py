"""検証済み地面比較ROM・測定結果・画像・再検証用データを配布へまとめる。"""
import argparse,hashlib,json,shutil,zipfile
from pathlib import Path
from PIL import Image,ImageDraw
from build_ground import ROOT,OUT,DEMO
from ground_reference import reference
from verify_ground import decode

def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()

def main():
    global OUT,DEMO
    parser=argparse.ArgumentParser();parser.add_argument('--directory',type=Path,default=OUT)
    OUT=parser.parse_args().directory.resolve()
    config=json.loads((OUT/'config.json').read_text())
    version=config.get('version','v001');DEMO=ROOT/f'demos/ground/{version}'
    results=DEMO/'results';results.mkdir(exist_ok=True)
    reports=[];summary=[]
    for mhz in [25,50]:
        native=json.loads((OUT/f'native_{mhz}.json').read_text())
        assert len(native['frames'])==512
        # Recheck the packaged captures against the independent equations.
        for f in native['frames']:
            v,m,p=[f[k] for k in ['view','mode','phase']]
            expect,_,_=reference(config,v,m,p)
            assert decode((OUT/f'native_{mhz}_{v}_{m}_{p}.bin').read_bytes())==expect,(mhz,v,m,p)
        frontend=json.loads((OUT/f'verification_{mhz}.json').read_text())['frontend']
        assert frontend['status']=='pass' and len(frontend['captures'])==64
        native.update(status='pass',pixels_checked=512*256*192)
        reports.append({'mhz':mhz,'native':native,'frontend':frontend})
        for v in range(4):
            for m in range(2):
                frames=[f for f in native['frames'] if f['view']==v and f['mode']==m]
                captures=[f for f in frontend['captures'] if f['view']==v and f['mode']==m]
                times=[f['gsu_clocks']/mhz/1000 for f in frames]
                fields=sorted(set(b['frame']-a['frame'] for a,b in zip(captures,captures[1:])))
                summary.append({'mhz':mhz,'view':v+1,'mode':'texture' if m else 'polygon','poses':64,
                                'gsu_ms_min':min(times),'gsu_ms_max':max(times),'gsu_ms_mean':sum(times)/64,
                                'fill_byte_clocks':sorted(set(f['fill_clocks'] for f in frames)),
                                'fill_ms':max(f['fill_clocks'] for f in frames)/25000,
                                'sampled_present_fields':fields,'sampled_fps':[60.0988/f for f in fields]})
    report={'status':'pass','native_frames':1024,'native_pixels_checked':1024*256*192,
            'frontend_frames':128,'frontend_pixels_checked':128*256*240,
            'external_memory_reference_hz':25000000,'fill_hz':25000000,
            'timing_model':'Mesen-derived execution; fixed real-time memory waits; no racing physics; not FPGA performance',
            'results':summary}
    if version in ['v002','v003']:
        course=json.loads((OUT/'course_validation.json').read_text());assert course['status']=='pass'
        report['course_validation']=course
        for name in ['course_validation.json','course_overview.png']:shutil.copy2(OUT/name,results/name)
    if version=='v003':
        state=json.loads((OUT/'state_validation.json').read_text())
        assert state['status']=='pass' and state['external_state_frontend']['status']=='pass'
        report['state_validation']=state
        for name in ['state_validation.json','car_scale.png']:shutil.copy2(OUT/name,results/name)
    (results/'benchmark.json').write_text(json.dumps(report,indent=2)+'\n')
    (results/'verification.json').write_text(json.dumps(reports,indent=2)+'\n')
    canvas=Image.new('RGB',(512,896),(20,20,20));draw=ImageDraw.Draw(canvas)
    for v in range(4):
        for m in range(2):
            data=(OUT/f'native_50_{v}_{m}_0.bin').read_bytes();pixels=decode(data)
            im=Image.new('RGB',(256,192));im.putdata([tuple(config['palette'][c]) for c in pixels])
            x,y=m*256,v*224
            draw.text((x+8,y+8),f'VIEW {v+1} - '+('TEXTURE' if m else 'POLYGON'),fill=(255,255,255))
            canvas.paste(im,(x,y+32))
    canvas.save(results/'comparison.png')
    shutil.copy2(OUT/'frontend_50/demo.gif',results/'interactive_50mhz.gif')
    with zipfile.ZipFile(results/'verification.zip','w',zipfile.ZIP_DEFLATED,compresslevel=9) as archive:
        for p in sorted(OUT.glob('native_*.bin')):archive.write(p,'native/'+p.name)
        for mhz in [25,50]:
            folder=OUT/f'frontend_{mhz}'
            for p in sorted(folder.iterdir()):
                if p.suffix in ['.ram','.rgb','.jsonl','.lua','.log']:archive.write(p,f'frontend_{mhz}/'+p.name)
        for name in ['config.json','payload.bin','texture.bin','gsu.bin','gsu.lbl','cpu.lbl']:
            archive.write(OUT/name,'build/'+name)
        archive.write(results/'verification.json','verification.json')
        if version in ['v002','v003']:
            for name in ['course.json','course_reference.png']:archive.write(ROOT/'demos/ground/v002'/name,'course/'+name)
            archive.write(OUT/'course_validation.json','course/course_validation.json')
        if version=='v003':
            for name in ['states.bin','directions.bin','camera.bin']:archive.write(OUT/name,'build/'+name)
            archive.write(DEMO/'car_source.json','state/car_source.json')
            archive.write(OUT/'state_validation.json','state/state_validation.json')
            for p in sorted((OUT/'state_frontend').iterdir()):
                if p.suffix in ['.ram','.lua','.log']:archive.write(p,'state/frontend/'+p.name)
    release=ROOT/f'releases/GSU_GroundCompare_{version}.nes';shutil.copy2(OUT/release.name,release)
    sources=[DEMO/'cpu.s',DEMO/'gsu.s',ROOT/'tools/build_ground.py',ROOT/'tools/ground_reference.py',
             ROOT/'tools/verify_ground.py',ROOT/'tools/package_ground.py',ROOT/'tools/launch_ground.py',ROOT/'src/ground_probe.cpp',
             ROOT/'src/BitmapBoard.hpp',ROOT/'src/bitmap_contract.cpp',ROOT/'src/NesBitmapFx.h',ROOT/'CMakeLists.txt']
    if version in ['v002','v003']:
        sources += [ROOT/'tools/mmc5_course.py',ROOT/'tools/verify_mmc5_course.py',ROOT/'demos/ground/v002/course.json',ROOT/'demos/ground/v002/course_reference.png']
    if version=='v003':sources += [ROOT/'tools/mmc5_state.py',ROOT/'tools/verify_mmc5_state.py',DEMO/'state_bridge.inc',DEMO/'car_source.json']
    manifest={'version':version.removeprefix('v'),'rom':release.relative_to(ROOT).as_posix(),'rom_sha256':sha(release),
              'default_gsu_mhz':50,'alternative_gsu_mhz':25,'mapper':'n8pro-gsu-abi2','viewport_mode':4,
              'texture':'64x64 byte indices; resident u-major; hidden RAM in both banks',
              'MesenCore.dll':sha(ROOT/'runtime/MesenCore.dll'),
              'source_hashes':{p.relative_to(ROOT).as_posix():sha(p) for p in sources},
              'artifacts':{p.relative_to(ROOT).as_posix():sha(p) for p in results.iterdir() if p.is_file()},
              'verification':report}
    (ROOT/f'releases/ground_compare_{version}.json').write_text(json.dumps(manifest,indent=2)+'\n')
    print(json.dumps({'status':'pass','rom':str(release),'sha256':sha(release),'archive_bytes':(results/'verification.zip').stat().st_size}))

if __name__=='__main__':main()
