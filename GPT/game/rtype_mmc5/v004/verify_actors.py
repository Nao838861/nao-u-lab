"""パッド入力だけで、取得・射出・防御・復帰・腹部への命中を検証する。"""
import argparse
import csv
import json
import os
import re
import shutil
import subprocess
from pathlib import Path

ROOT=Path(__file__).resolve().parent
OUT=ROOT/'build/actor-check'

def run(rom,labels,script,film=False):
    exe=Path(os.environ.get('MESEN_EXE') or shutil.which('Mesen') or 'Mesen.exe').resolve()
    OUT.mkdir(parents=True,exist_ok=True)
    for item in (exe,*exe.parent.glob('*.dll')):shutil.copy2(item,OUT/item.name)
    (OUT/'settings.json').write_text(json.dumps({'Debug':{'ScriptWindow':{'AllowIoOsAccess':True}},'Nes':{'Port1':{'Type':'NesController'}}}))
    symbols={n[1:]:int(a,16) for a,n in re.findall(r'al (\w+) \.(_\w+)',(ROOT/'build'/labels).read_text())}
    src=(ROOT/script).read_text('utf8').replace('DIR',json.dumps(OUT.as_posix())).replace('FILM','true' if film else 'false')
    terrain=(ROOT/'build/terrain.h').read_text()
    for name,tag in [('ceiling_px','TOP'),('floor_px','BOTTOM')]:
        raw=re.search(name+r'\[\]=\{([^}]*)',terrain).group(1)
        src='local '+tag+'={'+raw+'}\n'+src
    (OUT/'active.lua').write_text('local L={'+','.join(k+'='+str(v) for k,v in symbols.items() if not k.startswith('_'))+'}\n'+src,encoding='utf8')
    subprocess.run([str(OUT/exe.name),'--testrunner','--timeout=100','--donotsavesettings',str(ROOT/rom),str(OUT/'active.lua')],cwd=OUT,timeout=120,check=True,creationflags=getattr(subprocess,'CREATE_NO_WINDOW',0))

def compare_positions(first):
    with (ROOT/'art/actor-tracks.csv').open(encoding='utf8') as fp:
        source={int(r[1]):(int(r[2]),int(r[3])) for r in csv.reader(fp) if r[0]=='歩兵'}
    errors=[]
    with (OUT/'journey.csv').open() as fp:
        for row in csv.reader(fp):
            t=round((int(row[0])-first)*30/60.0988)
            if t not in source:continue
            for slot in row[12:18]:
                kind,x,y=map(int,slot.split('/'))
                if kind==5:
                    # The recorded anchor is the upper shoulder. Convert the
                    # runtime metasprite origin to the same capture pixel.
                    errors.append((abs(x+4-source[t][0]),abs(y-26-source[t][1])))
    assert len(errors)>=10 and max(max(pair) for pair in errors)<=4,errors
    print('Walker shoulder:',len(errors),'samples; max X/Y',tuple(map(max,zip(*errors))))

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--film',action='store_true');parser.add_argument('--boss-only',action='store_true')
    args=parser.parse_args()
    if not args.boss_only:
        (OUT/'journey-result.txt').unlink(missing_ok=True)
        run('rtype-mmc5-v004.nes','cart.lbl','journey_test.lua',args.film)
        result=(OUT/'journey-result.txt').read_text();print(result)
        data=dict(pair.split('=') for pair in result.split())
        for key in ('blue','red','bit','medium','large','charge','ion','detached','returned','restored'):
            assert data[key]=='1',(key,result)
        assert int(data['guns'])>=3 and int(data['deflected']) and int(data['pickups'])>=4 and data['missed']=='0',result
        compare_positions(int(data['first']))
        if args.film:
            subprocess.run(['ffmpeg','-v','error','-y','-framerate','30.0494','-i',str(OUT/'play%04d.png'),
                '-frames:v','2238','-vf','scale=512:480:flags=neighbor','-c:v','libx264','-crf','19','-pix_fmt','yuv420p',
                '-movflags','+faststart',str(ROOT/'stage-scroll.mp4')],check=True)
    (OUT/'boss-result.txt').unlink(missing_ok=True)
    run('rtype-mmc5-boss.nes','boss.lbl','boss_fight_test.lua')
    print((OUT/'boss-result.txt').read_text())
    from PIL import Image
    import numpy as np
    cleared=np.asarray(Image.open(OUT/'boss-clear.png').convert('RGB'))
    assert (cleared[65:178,142:242].max(2)>50).mean()<.06,'Boss room did not clear'

    run('rtype-mmc5-boss.nes','boss.lbl','boss_attack_test.lua',args.film)
    print((OUT/'attack-result.txt').read_text())
    def picture(frame):
        return np.asarray(Image.open(OUT/f'attack-{frame}.png').convert('RGB'))
    # This part of the corridor is empty between volleys. Check the actual
    # captured pixels as well as the in-game positions and clock.
    def cream_count(frame):
        rgb=picture(frame)[100:145,25:138].astype(int)
        return ((rgb[:,:,0]>205)&(rgb[:,:,1]>160)&(rgb[:,:,2]>95)).sum()
    assert cream_count(201)>150 and cream_count(260)<25
    mouth=np.s_[114:138,186:210]
    closed=picture(23)[mouth]
    assert np.array_equal(closed,picture(560)[mouth])
    assert ((closed!=picture(145)[mouth]).any(2)).sum()>100
    run('rtype-mmc5-boss.nes','boss.lbl','boss_bubble_contact_test.lua')
    print((OUT/'bubble-contact.txt').read_text())
    if args.film:
        subprocess.run(['ffmpeg','-v','error','-y','-framerate','60.0988','-i',str(OUT/'attackfilm%04d.png'),
            '-frames:v','740','-vf','scale=512:480:flags=neighbor','-c:v','libx264','-crf','16','-pix_fmt','yuv420p',
            '-movflags','+faststart',str(ROOT/'boss-attack.mp4')],check=True)

if __name__=='__main__':main()
