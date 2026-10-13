"""ゲーム向けポリゴン計測のROM・数値・画像・実行証跡を公開用へまとめる。"""
import hashlib,json,shutil,zipfile
from pathlib import Path
from PIL import Image,ImageDraw
from build_polygon import ROOT,DEMO


def bounds(value):
    return str(value[0]) if value[0]==value[1] else f'{value[0]}〜{value[1]}'


def main():
    source=ROOT/'build/polygon/benchmark/summary.json'
    data=json.loads(source.read_text());assert data['status']=='pass'
    legacy=json.loads((ROOT/'build/polygon/legacy_fast/summary.json').read_text())
    assert legacy['status']=='pass'
    out=DEMO/'results';out.mkdir(exist_ok=True)
    (out/'benchmark.json').write_text(json.dumps(data,indent=2)+'\n')
    (out/'legacy_fast.json').write_text(json.dumps(legacy,indent=2)+'\n')
    directories=[];manifest=[];table=[];detail=[];budget=[]
    labels={'large':'大きい面／立方体','medium':'中程度の面／立方体','small':'小さい面／立方体',
            'irregular':'二十面体','overlap':'重なり／二十面体','clipped':'画面端／八面体'}
    montage=Image.new('RGB',(768,528),'#171923');draw=ImageDraw.Draw(montage)
    ordered=list(labels)
    for record in data['results']:
        directory=ROOT/record['directory'];directories.append(directory)
        assert record['nes']['at_30fps'] and not record['next_nes']['at_30fps']
        nextdir=directory.parent/directory.name.replace(f"_n{record['at30']['objects']}_",f"_n{record['at30']['objects']+1}_")
        directories.append(nextdir)
        if record['renderer']=='fast':
            verified=record['budget20_verified'];assert verified['status']=='pass'
            directories.append(ROOT/verified['directory'])
        rate='25M' if record['clock_select'] else '12M'
        tag=record['case']+'_'+rate+('_baseline' if record['renderer']=='baseline' else '')
        name=f'GSU_Poly_{tag}_v001.nes'
        shutil.copyfile(next(directory.glob('*.nes')),ROOT/'releases'/name)
        manifest.append({'case':record['case'],'renderer':record['renderer'],'clock_select':record['clock_select'],
                         'count':record['at30']['objects'],'drawn_triangles':record['at30']['drawn_triangles'],
                         'rom':'releases/'+name})
        if record['renderer']=='fast':
            q=record['at30'];b=record['budget20']
            detail.append(f"| {labels[record['case']]} | {rate} | {q['objects']} | {q['submitted_triangles']} | {bounds(q['drawn_triangles'])} | {q['pixel_writes'][1]:,} | {record['max_gsu_ms']:.3f} |")
            budget.append(f"| {labels[record['case']]} | {rate} | {b['objects']} | {bounds(b['drawn_triangles'])} | {verified['max_gsu_ms']:.3f} |")
        if record['renderer']=='fast' and record['clock_select']==1:
            i=ordered.index(record['case']);x=(i%3)*256;y=(i//3)*264
            montage.paste(Image.open(directory/'verification/screen_008.png'),(x,y))
            draw.text((x+4,y+244),f"{record['case']} / {record['at30']['objects']} objects / 25M",fill='white')
    montage.save(out/'scenes.png')
    for case in ordered:
        rows=[r for r in data['results'] if r['case']==case]
        a=next(r for r in rows if r['renderer']=='baseline')
        b=next(r for r in rows if r['renderer']=='fast' and r['clock_select']==0)
        c=next(r for r in rows if r['clock_select']==1)
        table.append(f"| {labels[case]} | {bounds(a['at30']['drawn_triangles'])} ({a['at30']['objects']}個) | {bounds(b['at30']['drawn_triangles'])} ({b['at30']['objects']}個) | {bounds(c['at30']['drawn_triangles'])} ({c['at30']['objects']}個) |")
    interactive=ROOT/'build/polygon/interactive'
    check=json.loads((interactive/'verification/summary.json').read_text());assert check['status']=='pass'
    rom=ROOT/'releases/GSU_PolygonBenchmark_A_v001.nes'
    shutil.copyfile(next(interactive.glob('*.nes')),rom)
    shutil.copyfile(interactive/'verification/summary.json',out/'interactive.json')
    shutil.copyfile(interactive/'verification/interactive.gif',out/'interactive.gif')
    (ROOT/'releases/polygon_benchmark.json').write_text(json.dumps(manifest,indent=2)+'\n')
    for record in legacy['results']:
        directory=ROOT/record['directory'];directories.append(directory)
        directories.append(directory.parent/f"fast_{record['half']}_{record['next_count']}")
    directories=list(dict.fromkeys(directories))
    with zipfile.ZipFile(out/'verification.zip','w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
        for directory in directories:
            prefix=directory.name+'/'
            for pattern in ['*.nes','config.json','payload.bin','gsu.bin','gsu.lbl','cpu.lbl','native_verified.json','native.json']:
                for path in directory.glob(pattern):z.write(path,prefix+path.name)
            for pattern in ['summary.json','trace.jsonl','test.lua','emulator.log','screen_*.png','ram_*.bin','phase_*.txt']:
                for path in (directory/'verification').glob(pattern):z.write(path,prefix+'verification/'+path.name)
        for pattern in ['*.nes','config.json','profiles.inc','profile_*.bin','hud_*.bin','hud.chr','cpu.lbl']:
            for path in interactive.glob(pattern):z.write(path,'interactive/'+path.name)
        for pattern in ['summary.json','trace.jsonl','captures.jsonl','test.lua','emulator.log','p*.png','p*.ram']:
            for path in (interactive/'verification').glob(pattern):z.write(path,'interactive/verification/'+path.name)
    hashes={}
    paths=list(DEMO.glob('*.s'))+list(DEMO.glob('*.inc'))+[ROOT/'src/polygon_probe.cpp']
    paths += [ROOT/'tools'/p for p in ['build_polygon.py','benchmark_polygon.py','polygon_reference.py',
                                      'verify_polygon_native.py','verify_polygon_budget.py','build_polygon_interactive.py']]
    paths += [ROOT/'runtime/MesenCore.dll',out/'verification.zip',rom]
    paths += [ROOT/r['rom'] for r in manifest]
    for p in paths:hashes[str(p.relative_to(ROOT))]=hashlib.sha256(p.read_bytes()).hexdigest()
    (out/'sha256.json').write_text(json.dumps(hashes,indent=2)+'\n')
    text="""# ポリゴン描画の最適化とゲーム用の予算 v001

2026年10月14日。従来の立方体テストに加え、GSUが３軸変換・透視投影・裏面除去・物体と面の深度順ソート・XY画面端処理・三角形の面塗りまで実行する描画プログラムを作成した。各物体は異なる角度で回り、奥行きも変化する。位置と角度を共有して描画結果をコピーする方式は使わない。

**以下は提案ABI2・Mesen由来GSU時間モデル上の値。RTLサイクル一致、FPGAのFit、RAM帯域、実機性能は未確認。ゲーム本体のAI・物理・音楽・複数meshの転送管理を含む完成ゲームのfpsではない。**

## 起動

[run_polygon_benchmark.cmd](../../../run_polygon_benchmark.cmd)で起動。A（専用設定ではZキー）で、大きい面・中程度の面・小さい面・二十面体・重なり・画面端の各条件と、12.5/25MHz相当の設定を順に変更する。長押しは１回だけ進む。数値はN=物体数、C=12または25（12は12.5MHz相当）、IN=投入三角形数。INには裏面除去される面も含むため、下表の描画三角形数とは異なる。

![動作例](results/interactive.gif)

## 同じクロックでの改善と設定変更を分ける

単位は１画像あたりの三角形。括弧内は物体数。全64姿勢が毎２NTSC field、約30.05fpsを維持した条件。各姿勢で見える面が変わるため範囲で示す。XY画面外へ出て１画素も書かない面は描画数から除外する。

| 条件 | 比較版 CLSR=0/MS0=0 | 最適化版 CLSR=0/MS0=0 | 最適化版 CLSR=1/MS0=1 |
|---|---:|---:|---:|
TABLE

同じCLSR=0では大きい面・中程度の面の上限が増え、小さい面や二十面体の条件では改善幅が小さい。全条件で大幅に増えたとは扱わない。右列は実行イネーブル25MHz相当と乗算待ち短縮の設定を含む結果であり、純粋なソフトウェア改善倍率とは分ける。基準clockはすべて25MHzで、CLSR=0は実行イネーブル12.5MHz相当。既存RTL vendorのMS0記述も参照したが、このモデルの値を回路の実測値とは扱わない。

従来の直交投影・３四角形の立方体テストは、同じ条件で71→75個まで増えた。四角形を２三角形へ換算した数字を、そのままゲーム向けの上限とはしない。詳細は [legacy_fast.json](results/legacy_fast.json)。

## ゲームのために20ms以内へ収めた条件

１画像のGSU描画を20ms以内に収める最大個数も探索した。この表を、描画以外の処理や今後の機能追加を考える際の余裕を持った出発点とする。残り約13msをNES CPUのAI等に丸ごと使えると保証する表ではない。CPUとGSUの処理は並行し、共有RAMの所有権やゲーム固有の処理にも左右される。

| 条件 | 設定 | 物体数 | 描画三角形/画像 | 最長GSU ms |
|---|---|---:|---:|---:|
BUDGET

フル予算の上限と20msの目安には差がある。また同じ面数でも、画面に占める面積・span数・重なって塗る量・頂点数で費用が変わる。三角形数だけを仕様として固定するより、この条件表を企画の幾何と比較して使う。

## 30fps上限の負荷内訳

INは投入数、描画は画素を書く面数。pixel writesは重なりによる再描画も含み、同じ画素への複数書込みを数える。表のmsには全画面消去、頂点変換、透視、両方の深度ソート、裏面除去、描画が含まれる。

| 条件 | 設定 | 物体 | IN | 描画三角形 | 最大pixel writes | 最長GSU ms |
|---|---|---:|---:|---:|---:|---:|
DETAIL

![25MHz相当の各条件](results/scenes.png)

## 一般のポリゴン処理として変更した点

- 索引付き頂点を物体内で共有する。変換は物体ごとに毎回行い、９係数の３軸行列と透視投影をGSUが実行する。
- 大きい三角形は16.16の両辺をYごとに進め、直接spanを塗る。辺を全画素たどって全行配列へ書き、その配列を再走査する費用を削る。
- 小さい投影三角形は16行の局所配列を使う辺走査へ切り替える。モデル名や立方体の形を条件にせず、座標差と高さで選択する。
- 裏面除去時の座標差で描画方式を選び、ソートレコードに関数ポインターを持たせる。同じ判定を別shaderで再実行しない。
- 左右の辺は最初に決める。画面内は行ごとのクリップを省き、画面端だけ汎用経路を通す。
- 短いspanと長いspanでPLOTループを分ける。画面消去と積和を展開する。無条件の展開で遅くなった変更は外した。

毎画像16 KiBの描画側RAMを全部消去する。背景静止を利用した消去省略、画像の使い回し、同じ立方体の描画結果のコピー、事前生成したspanは使わない。従来の面塗り版で実験した展開の組合せは [legacy_variants.json](results/legacy_variants.json)。

## 検証

GSU単体で全64姿勢の候補を探し、実NES ROMで成功個数と次の１個を検査した。成功は最終PPU全RGB一致・GSU全画素一致・毎２field提示・期限遅延0・fault=0。次の１個では描画は一致したまま提示期限を逃すことを確認した。20msの候補にもGSU単体の全画素・頂点・カウンター検査を行った。

参照描画はPythonの数式による実装で、GSU命令を実行しない。主計測18条件の成功/次個数失敗36例、A切替12条件、20ms12条件を保存した。Aを８field保持する入力で全構成を一周し、長押しの重複なし・元へ戻ること・各64姿勢の全PPU画素を検査する。

- [benchmark.json](results/benchmark.json)：各条件の三角形・頂点・span・pixel writes・overdraw・clock・提示field・遅延数。
- [interactive.json](results/interactive.json)：A操作と画素の検査。
- [verification.zip](results/verification.zip)：実ROM、GSUプログラム、設定、Lua、RAM画像、PPU画像、trace。
- [sha256.json](results/sha256.json)：ROM・コア・ソース・証跡のhash。
- [design_log.md](design_log.md)：依頼原文と実験経緯。

## 制約と再現

フラット塗り・2bpp・256×240、Z-bufferなしのpainter方式。物体は中心深度、物体内の面は平均深度で並べる。交差する形状の厳密な隠面処理、テクスチャー、半透明、照明は対象外。near/far planeを跨ぐ面は幾何クリップせず拒否する。XYの範囲外はspanで処理し、Y幅512以上の面も拒否する。近面を跨ぐ追加例は安全性と拒否動作の検査であり、上限値には含めない。

同一meshの複数インスタンスを測る構成。meshは立方体・八面体・二十面体を使い、各物体の角度と奥行きは独立した位相を持つ。現在の入力窓は１回の呼出しで１mesh。ゲームへ複数meshや地形を接続する際のバッファと転送管理の費用は別途必要。

メモリーは8000..801Fが設定とカウンター、8040..813Fがmodel、8140..81FFが投影頂点、8200..85FFが物体、8600..8A7Fが64姿勢の行列、8A80..8AFFが奥行き移動表、8B00..92FFが24bit逆数表、9300..93FFが作業領域、9400..9FFFがコード。命令がない9B00..9B7Fを面ソートの作業領域、9B80..9BBFを小面spanとして併用する。slopeコードがこの領域へ伸びないようassemble時にassertする。

再現は専用コアとca65/ld65、Python、Pillowを用意し、projects/nes_superfxで実行する。

CODE
cmake --build build --config Release
python tools/benchmark_bitmap.py --renderer fast --half 24 16 8 4 2 1
python tools/benchmark_polygon.py --verify-real
python tools/verify_polygon_budget.py
python tools/build_polygon_interactive.py
python tools/verify_interactive_bitmap.py --directory build/polygon/interactive
python tools/package_polygon.py
ENDCODE

個別ROMは tools/build_polygon.py --mesh icosahedron --scene overlap --half 12 --count 8 など。--renderer baseline で比較版、--clock-select 1 --multiplier-fast で25MHz相当の設定になる。既存のABI1診断ROMとPPUマッパーの仕様は変更していない。
"""
    text=text.replace('TABLE','\n'.join(table)).replace('BUDGET','\n'.join(budget)).replace('DETAIL','\n'.join(detail))
    text=text.replace('CODE\n',chr(96)*3+'powershell\n',1).replace('ENDCODE',chr(96)*3)
    (DEMO/'README.md').write_text(text,encoding='utf-8')
    shutil.copyfile(ROOT/'build/polygon/legacy_variants.json',out/'legacy_variants.json')
    print('Polygon results and ROMs packaged',len(directories),'cases',flush=True)


if __name__=='__main__':main()
