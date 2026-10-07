"""ボス限定の縮小表と追加最適化の計測を保存し、検証済みROMを公開する。"""
import gzip
import hashlib
import json
import shutil

from build_game import ROOT, GAME, BUILD
from analyze_render_profile import analyze


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def compressed(source, target):
    target.write_bytes(gzip.compress(source.read_bytes(), mtime=0))


def main():
    target=GAME/'results/boss_scaling_20261008'
    target.mkdir(exist_ok=True)
    rom=BUILD/'MonoSHFX2_v001.sfc'
    digest=sha(rom)
    iterations={}
    for source in sorted(BUILD.glob('cache_compare_boss*')):
        if not (source/'comparison.json').exists():
            continue
        name=source.name.removeprefix('cache_compare_')
        if name=='bossdma':
            continue  # 固定費を加える前のDMA試行。最終版で置き換える。
        dest=target/name
        dest.mkdir(exist_ok=True)
        result=json.loads((source/'comparison.json').read_text())
        assert sha(source/rom.name)==result['romSha256']
        iterations[name]=result
        for filename in ('comparison.json','summary.json','build_mode.json','game.lbl','emulator.log','fixtures.json.gz'):
            shutil.copy2(source/filename,dest/filename)
        for filename in ('replay.jsonl','trace.jsonl','test.lua',rom.name):
            compressed(source/filename,dest/(filename+'.gz'))
    final=iterations['bossshared']
    assert final['romSha256']==digest
    final_scenes={r['scene']:r for r in final['scenes']}
    baseline=json.loads((GAME/'results/render_iterations_20261007/final/comparison.json').read_text())
    for name,result in {'previousRelease':baseline,**iterations}.items():
        for row in result['scenes']:
            if row['scene'] in final_scenes:
                assert row['framebufferHashes']==final_scenes[row['scene']]['framebufferHashes'],(name,row['scene'])
    (target/'iterations.json').write_text(json.dumps(iterations,indent=2)+'\n')
    shutil.copy2(BUILD/'boss_fixtures.json.gz',target/'base_fixtures.json.gz')
    (target/'pixel_comparison.json').write_text(json.dumps({
        'previousRomSha256':baseline['romSha256'],'finalRomSha256':digest,
        'previousScenesCompared':len(baseline['scenes']), 'allPreviousFramebufferHashesMatch':True,
        'finalScenes':len(final['scenes']), 'finalImagesVerified':final['imagesVerified']},indent=2)+'\n')
    profiles={}
    for name in ('boss_profile_bossbase','boss_profile_bossmargins','boss_profile_bosspipedma','boss_profile_bossshared','boss_profile_bossnofire'):
        source=BUILD/name
        dest=target/name
        dest.mkdir(exist_ok=True)
        result=analyze(source)
        profiles[name]=result
        if name in ('boss_profile_bossshared','boss_profile_bossnofire'):
            assert result['romSha256']==digest
        for filename in ('summary.json','emulator.log','worst_gsu.json','worst_gsu_frame.bin',
                         'worst_gsu_packet.bin','worst_gsu_oam.bin','worst_road.json',
                         'worst_road_frame.bin','worst_road_packet.bin'):
            if (source/filename).exists():
                shutil.copy2(source/filename,dest/filename)
        for filename in ('timings.jsonl','trace.jsonl','test.lua'):
            compressed(source/filename,dest/(filename+'.gz'))
        (dest/'analysis.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    tests={}
    for name in ('objects','packed','controls','pause','display','held','boss','stumble','stress'):
        source=BUILD/'boss_regressions'/name
        assert not (source/'error.txt').exists()
        result=json.loads((source/'summary.json').read_text())
        assert result['romSha256']==digest,name
        tests[name]=result
        shutil.copy2(source/'summary.json',target/(name+'.json'))
        compressed(source/'trace.jsonl',target/(name+'.jsonl.gz'))
    shutil.copy2(BUILD/'boss_regressions/objects/objects_ppu.json',target/'objects_ppu.json')
    for filename in ('scene_enemies.png','display00238.png','display00478.png','display00718.png'):
        shutil.copy2(BUILD/'boss_regressions/display'/filename,target/filename)
    shutil.copy2(BUILD/'scaled_assets_verified.json',target/'scaled_assets_verified.json')
    assets=json.loads((target/'scaled_assets_verified.json').read_text())
    assert assets['romSha256']==digest and assets['scaledAssetWidths']=={'13':96,'14':96,'31':96}
    assert assets['packedBytes']==406800 and assets['scaledWidths']==288
    assert assets['transparentMarginBytes']==32536
    for name in ('dma_deadlines','full_transfer_objects'):
        proof=json.loads((target/name/'summary.json').read_text(encoding='utf-8'))
        assert proof['defaultRomSha256']==digest,name
    for filename in ('game.lbl','game.map','build_mode.json'):
        (target/filename).write_text('\n'.join(line.rstrip() for line in (BUILD/filename).read_text().splitlines()).rstrip()+'\n')
    manifest=json.loads((ROOT/'releases/v001.json').read_text(encoding='utf-8'))
    if manifest['romSha256']!=digest:
        manifest['previousRomSha256']=manifest['romSha256']
    manifest.update(romSha256=digest,buildMode=json.loads((BUILD/'build_mode.json').read_text()),
        scenarioFrames={**{n:s['fields'] for n,s in tests.items()},'naturalProfile':18000,'bossLongNoFire':18000},
        optimizationMeasurement='game/v001/results/boss_scaling_20261008',
        replayScenes=len(final['scenes']),replayImagesVerified=final['imagesVerified'],
        verificationKind='ボス3素材だけの横縮小表。固定標本の全FB/OBJ、自然入力と長期ボス各18,000field、操作・表示・押しっぱなしを更新ROMで検証。',
        playerImageValidation='game/v001/results/boss_scaling_20261008/objects_ppu.json',
        fullTransferValidation='game/v001/results/boss_scaling_20261008/full_transfer_objects/summary.json')
    manifest['dmaDeadlineValidation']='game/v001/results/boss_scaling_20261008/dma_deadlines/summary.json'
    shutil.copy2(rom,ROOT/'releases'/rom.name)
    (ROOT/'releases/v001.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print('Archived and released',digest)


if __name__=='__main__':
    main()
