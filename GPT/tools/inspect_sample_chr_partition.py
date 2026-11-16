"""現行保存版のCHR使用範囲と、先頭スプライト／後方BGの容量を読取り専用で調べる。"""
import argparse
import base64
import hashlib
import json
from pathlib import Path
import sys
from unittest.mock import patch


def main():
    ap=argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--sdk',type=Path,required=True)
    ap.add_argument('--project',type=Path,required=True)
    ap.add_argument('--rom',type=Path,required=True)
    ap.add_argument('--output',type=Path,required=True)
    args=ap.parse_args()
    sys.path.insert(0,str(args.sdk.resolve()))
    from famibasic.project_folder import load
    from famibasic.project_background import prepare
    from experiments.horizontal_side_art_b import paired_chr
    result={};original=paired_chr.apply

    def capture(project,used):
        report=original(project,used)
        result.update(report,before_pair_bytes=used)
        return report

    with patch.object(paired_chr,'apply',capture):p=prepare(load(args.project.resolve()))
    entries=[];images={}
    for binding in p['console_resources']:
        if binding['target']!='chr':continue
        data=base64.b64decode(p['rom_resources'][binding['name']]);start=binding['offset']
        images[binding['name']]=data
        entries.append(dict(name=binding['name'],start=start,end=start+len(data),bytes=len(data),
                            nonzero_tiles=sum(any(data[i:i+16]) for i in range(0,len(data),16))))
    rom=args.rom.read_bytes();capacity=rom[5]*8192;high=max(e['end'] for e in entries)
    bound=sum(e['bytes'] for e in entries)
    # 現保存版の全4KiBスプライトページ。HUDはBG用途なのでBG側へ計上する。
    sprite_offsets=[m['rom_offset'] for m in p['sprite_document']['maps'] if m['rom_offset']!=4096]
    assert sprite_offsets==[0,248*1024,252*1024,272*1024],sprite_offsets
    planned=[];cursor=0
    for start in sprite_offsets:
        planned.append(dict(kind='sprite',source_start=start,start=cursor,end=cursor+4096));cursor+=4096
    sprite_end=cursor
    bg_sources=[('道中BG・破壊画像',8192,result['end']-8192),('HUD',4096,4096),
                ('ボスBG',256*1024,len(images['boss.chr'])),('固定画面',268*1024,len(images['screens.chr']))]
    for name,start,size in bg_sources:
        planned.append(dict(kind='bg',name=name,source_start=start,start=cursor,end=cursor+size));cursor+=size
    assert all(a['end']<=b['start'] for a,b in zip(planned,planned[1:]))
    # この案では各BG素材を同じ256KiB領域内へ配置できる。
    assert all(e['start']//262144==(e['end']-1)//262144 for e in planned if e['kind']=='bg')
    assert cursor<=capacity
    report=dict(project=str(args.project),rom=str(args.rom),rom_sha256=hashlib.sha256(rom).hexdigest(),rom_header_only=True,
                chr_capacity_bytes=capacity,entries=entries,bound_bytes=bound,high_water_bytes=high,
                tail_unbound_bytes=capacity-high,all_unbound_bytes=capacity-bound,paired=result,
                proposed_sprite_banks_4k=sprite_end//4096,proposed_bg_bytes=cursor-sprite_end,
                proposed_high_water_bytes=cursor,plan=planned,
                note='素材は現在の保存版を再変換し、総容量は既存ROMヘッダから取得した。ROMは再ビルドしていない。配置案は容量・重複・BGの256KiB境界だけの確認。ROM生成・番地変更・描画互換性の検証はしていない。全ゼロの絵も参照され得るため、非ゼロタイル数を空き容量とは扱わない。')
    args.output.parent.mkdir(parents=True,exist_ok=True)
    args.output.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(report,ensure_ascii=False,indent=2))


if __name__=='__main__':main()
