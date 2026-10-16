"""再配置前後の全画面・走行状態・fine X全8値を比較する。"""
from pathlib import Path
import concurrent.futures, importlib.util, sys, json, shutil
from PIL import Image, ImageChops
OUT=Path(__file__).resolve().parent
REPO=OUT.parents[2]/'.tmp/MMC5Racing'
TEMP=REPO/'build/bg-capacity'
sys.path.insert(0,str(REPO/'direct-runtime/minimap'))
def module(name,file):
    spec=importlib.util.spec_from_file_location(name,REPO/'direct-runtime/minimap'/file)
    m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m
native=module('native_checks','verify.py')
scroll=module('scroll_checks','verify_scroll.py')
mesen=OUT.parents[2]/'.tmp/Mesen/Mesen.exe'
roms={'before':REPO/'releases/MMC5Racing_HudB2_136x184.nes',
      'after':TEMP/'HudB2_Repacked.nes'}
jobs={}
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
    for mode in ('drift','grip'):
        for name,rom in roms.items():
            jobs[mode,name,'race']=pool.submit(native.native,rom,TEMP/f'{mode}-{name}-race',mesen,mode)
            jobs[mode,name,'scroll']=pool.submit(scroll.run,rom,mesen,TEMP/f'{mode}-{name}-scroll',mode)
    for j in jobs.values():j.result()
screens=0
for mode in ('drift','grip'):
    assert jobs[mode,'before','race'].result()==jobs[mode,'after','race'].result()
    for test in ('race','scroll'):
        before=TEMP/f'{mode}-before-{test}';after=TEMP/f'{mode}-after-{test}'
        if test=='scroll':assert (before/'frames.csv').read_bytes()==(after/'frames.csv').read_bytes()
        for path in before.glob('*.png'):
            a=Image.open(path).convert('RGB');b=Image.open(after/path.name).convert('RGB')
            assert not ImageChops.difference(a,b).getbbox(),(mode,test,path.name)
            screens+=1
    shutil.copyfile(TEMP/f'{mode}-after-race/frame-410.png',OUT/f'{mode}.png')
report=dict(full_screen_exact=screens,race_frames_per_mode=1100,
    race_states_positions_publication_exact=True,scroll_fine_values=list(range(8)),
    scroll_coarse_phases=4,scroll_chr_quarters=4,scroll_ages_per_case=2,
    cpu=native.cpu(roms['after'].read_bytes()))
(OUT/'verification.json').write_text(json.dumps(report,indent=2)+'\n')
print('PASS:',screens,'whole screenshots exact; both modes 1100 race frames exact.')
