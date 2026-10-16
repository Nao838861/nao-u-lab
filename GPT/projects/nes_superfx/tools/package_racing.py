"""一致検証を通過した3D走行ROMと再現用の原版スナップショットを保存。"""
import copy,hashlib,json,shutil,zipfile
from pathlib import Path
from PIL import Image,ImageDraw
from build_racing import OUT,DEMO
from build_ground import ROOT,VIEWS
from mmc5_state import pose,snapshot
from ground_reference import reference

def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()

def main():
    results=DEMO/'results';results.mkdir(exist_ok=True)
    verification=json.loads((OUT/'verification.json').read_text());assert verification['status']=='pass'
    rom=OUT/'GSU_MMC5Racing3D_v001.nes';assert verification['rom_sha256']==sha(rom)
    controls=json.loads((OUT/'controls/pass.json').read_text());assert controls['status']=='pass'
    config=json.loads((OUT/'config.json').read_text());total=0;timings=[]
    for case in verification['results']:
        mode,mhz,ground=[case[k] for k in ['mode','mhz','ground']]
        folder=OUT/f'native_{mode}_{mhz}_{ground}'
        physics=[json.loads(x) for x in (folder/'physics.jsonl').read_text().splitlines()]
        captures=[json.loads(x) for x in (folder/'images.jsonl').read_text().splitlines()]
        current=copy.deepcopy(config)
        if mode=='drift':
            for i in range(current['own_first_vertex'],len(current['vertices'])):current['vertices'][i][0]=128 if (i-current['own_first_vertex'])&1 else -128
        for record in captures:
            s=physics[record['tick']-1]['state']
            raw=snapshot(int.from_bytes(bytes(s[1:4]),'little',signed=True),int.from_bytes(bytes(s[4:7]),'little',signed=True),s[8]+256*s[9],tick=record['tick'])
            current['views'][record['view']]['poses'][0]=pose(raw,VIEWS[record['view']])
            _,expected,_=reference(current,record['view'],record['mode'],0)
            actual=Image.open(folder/(record['name']+'.png')).convert('RGB')
            assert actual.crop((0,0,256,192)).tobytes()==expected.tobytes(),('PPU',case,record)
            total+=256*192
        intervals=[b['frame']-a['frame'] for a,b in zip(captures,captures[1:]) if int(b['name'][5:])==int(a['name'][5:])+1]
        timings.append({'mode':mode,'mhz':mhz,'ground':ground,'first_chase_samples_present_fields':sorted(set(intervals))})
        if mhz==50 and ground==0:
            first=captures[:24];pictures=[Image.open(folder/(r['name']+'.png')).convert('RGB') for r in first]
            durations=[max(20,round(((first[i+1]['frame']-r['frame']) if i+1<len(first) else 4)*16.639/10)*10) for i,r in enumerate(first)]
            pictures[0].save(results/f'drive_{mode}_50mhz.gif',save_all=True,append_images=pictures[1:],duration=durations,loop=0,optimize=False)
    verification.update(controls=controls,ppu_viewport_pixels_checked=total,presentation_samples=timings)
    (results/'verification.json').write_text(json.dumps(verification,indent=2)+'\n')
    shutil.copy2(OUT/'baseline.json',results/'baseline.json')
    canvas=Image.new('RGB',(512,240))
    for i,mode in enumerate(['grip','drift']):
        canvas.paste(Image.open(OUT/f'native_{mode}_50_0/image20.png'),(i*256,0))
    canvas.save(results/'driving.png')
    names=['baseline.nes','baseline.json']
    for mode in ['grip','drift']:
        names += [f'{mode}/{n}' for n in ['initial-cpu.bin','initial-wram.bin','native.jsonl','capture.lua']]
    with zipfile.ZipFile(DEMO/'source_snapshot.zip','w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
        for name in names:z.write(OUT/name,name)
    with zipfile.ZipFile(results/'verification.zip','w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
        for case in verification['results']:
            folder=OUT/f"native_{case['mode']}_{case['mhz']}_{case['ground']}"
            for p in sorted(folder.iterdir()):
                if p.suffix in ['.ram','.state','.jsonl','.lua','.png','.log']:z.write(p,p.relative_to(OUT))
        for p in sorted((OUT/'controls').iterdir()):
            if p.suffix in ['.lua','.log','.json','.png']:z.write(p,p.relative_to(OUT))
        for name in ['config.json','cpu.lbl','cpu.bin','verification.json']:z.write(OUT/name,'build/'+name)
        z.write(results/'verification.json','verification.json')
    release=ROOT/'releases'/rom.name;shutil.copy2(rom,release)
    sources=[DEMO/'cpu.s',ROOT/'src/NesRacingFx.h',ROOT/'src/BitmapBoard.hpp',ROOT/'tools/build.py',ROOT/'tools/build_racing.py',ROOT/'tools/capture_racing_baseline.py',ROOT/'tools/verify_racing.py',ROOT/'tools/verify_racing_controls.py',ROOT/'tools/package_racing.py',ROOT/'tools/launch_racing.py',ROOT/'tools/launch.py',ROOT/'tools/mmc5_course.py',ROOT/'tools/mmc5_state.py',ROOT/'tools/build_ground.py',ROOT/'tools/ground_reference.py',ROOT/'demos/ground/v002/course.json',ROOT/'demos/ground/v003/gsu.s',ROOT/'demos/ground/v003/state_bridge.inc',DEMO/'source_snapshot.zip']
    manifest={'version':'001','rom':release.relative_to(ROOT).as_posix(),'rom_sha256':sha(release),'mapper':'n8pro-racing-gsu','default_gsu_mhz':50,'physics_tick_rate':'NTSC NMI, nominal60Hz independent of rendering','physics_baseline':json.loads((OUT/'baseline.json').read_text()),'scope':'Original self-car physics and road slowdown; free driving, scenery collisions and race lifecycle excluded','MesenCore.dll':sha(ROOT/'runtime/MesenCore.dll'),'source_hashes':{p.relative_to(ROOT).as_posix():sha(p) for p in sources},'artifacts':{p.relative_to(ROOT).as_posix():sha(p) for p in results.iterdir() if p.is_file()},'verification':verification}
    (ROOT/'releases/racing_3d_v001.json').write_text(json.dumps(manifest,indent=2)+'\n')
    print(json.dumps({'status':'pass','rom_sha256':sha(release),'physics_ticks':sum(r['ticks'] for r in verification['results']),'ppu_viewport_pixels_checked':total,'presentation':timings}))

if __name__=='__main__':main()
