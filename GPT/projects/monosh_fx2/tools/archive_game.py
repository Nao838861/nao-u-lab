"""検証済みROM・測定ログ・標本をgitに残せる場所へ保存する。"""
import gzip
import hashlib
import json
from pathlib import Path
import shutil
import statistics
from build_game import ROOT, BUILD, GAME

def main():
    results=GAME/'results';results.mkdir(exist_ok=True)
    release=ROOT/'releases';release.mkdir(exist_ok=True)
    names=['play','controls','pause','stumble','boss','stress','long','profile']
    summaries={}
    rom=BUILD/'MonoSHFX2_v001.sfc';rom_sha=hashlib.sha256(rom.read_bytes()).hexdigest()
    for name in names:
        src=BUILD/name
        assert not (src/'error.txt').exists(),f'failed scenario: {name}'
        summary=json.loads((src/'summary.json').read_text())
        assert summary['romSha256']==rom_sha,f'tested ROM mismatch: {name}'
        records=[json.loads(line) for line in (src/'trace.jsonl').read_text().splitlines()]
        wraps=0
        for record in records:
            for key in ['joinedMs','cpuMs','gsuMs','dmaMs']:
                if record.get(key,0)<0:
                    record[key]+=4294967296/21477.272;wraps+=1
                    assert 0<=record[key]<1000,'unexpected clock discontinuity'
        summary['clockWrapCorrections']=wraps
        joins=[r['joinedMs'] for r in records if 'joinedMs' in r]
        dmas=[r for r in records if 'dmaMs' in r]
        summary['joinedMeanMs']=statistics.mean(joins)
        summary['joinedP95Ms']=sorted(joins)[int(len(joins)*.95)]
        cpu=[r['cpuMs'] for r in records if 'cpuMs' in r]
        if cpu:
            summary['cpuMeanMs']=statistics.mean(cpu);summary['cpuMaxMeasuredMs']=max(cpu)
        summary['gsuMeanMs']=statistics.mean(r['gsuMs'] for r in records if 'gsuMs' in r)
        summary['dmaMeanMs']=statistics.mean(r['dmaMs'] for r in dmas)
        summary['dmaBytesMean']=statistics.mean(r['bytes'] for r in dmas)
        summary['framesPerSecondIncludingBoot']=summary['rendered']/summary['fields']*60.0988
        summary['sampledScenes']=len(list(src.glob('frame[0-9]*.bin')))
        summaries[name]=summary
        (results/f'{name}.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
        (results/f'{name}.jsonl.gz').write_bytes(gzip.compress((src/'trace.jsonl').read_bytes(),mtime=0))
        for prefix in ['frame','draw','packet','meta']:
            for sample in src.glob(prefix+'[0-9]*.*'):
                target=results/name;target.mkdir(exist_ok=True);shutil.copy2(sample,target/sample.name)
        for filename in ['field240.png','scene_boss.png','scene_enemies.png','scene_death.png','boss_state2.png','boss_state3.png']:
            path=src/filename
            if path.exists(): shutil.copy2(path,results/f'{name}_{filename}')
    assert summaries['long']['loopSeen'] and summaries['boss']['loopSeen']
    assert summaries['stress']['minBytes']==12288
    shutil.copy2(rom,release/rom.name)
    frozen=json.loads((GAME/'upstream/sources.json').read_text())
    for name,sha in frozen.items(): assert hashlib.sha256((GAME/'upstream'/name).read_bytes()).hexdigest()==sha,name
    manifest={'romSha256':hashlib.sha256(rom.read_bytes()).hexdigest(),'romBytes':rom.stat().st_size,
              'display':[256,180],'framebuffer':[256,192],'format':'2bpp','sourceSha256':frozen,
              'testedEmulator':'Mesen 2.1.1, GsuClockSpeed=100, NTSC, extra scanlines=0',
              'scenarioFrames':{name:s['fields'] for name,s in summaries.items()}}
    (release/'v001.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    shutil.copy2(BUILD/'game.map',results/'game.map')
    shutil.copy2(BUILD/'game.lbl',results/'game.lbl')
    print(json.dumps({name:round(s['framesPerSecondIncludingBoot'],2) for name,s in summaries.items()}))
    print('ROM SHA256:',manifest['romSha256'])

if __name__=='__main__': main()
