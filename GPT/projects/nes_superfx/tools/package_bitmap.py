"""検証済みABI2 ROMと、再確認できる結果・画像・引き継ぎ資料をまとめる。"""
import hashlib
import json
import shutil
import zipfile
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
DEMO = ROOT/'demos/bitmap/v001'
RESULTS = DEMO/'results'


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def copy_rom(directory, name):
    target = ROOT/'releases'/name
    shutil.copyfile(next(directory.glob('*.nes')), target)
    return str(target.relative_to(ROOT))


def main():
    benchmark = json.loads((ROOT/'build/bitmap/benchmark/summary.json').read_text())
    assert benchmark['status'] == 'pass'
    RESULTS.mkdir(exist_ok=True)
    directories = []
    for mode, name in [(1, 'GSU_Bitmap128_v001.nes'),
                       (2, 'GSU_Bitmap256x64_v001.nes'),
                       (3, 'GSU_FullBitmap_v001.nes')]:
        directory = ROOT/f'build/bitmap/bitmap_{mode}'
        data = json.loads((directory/'verification/summary.json').read_text())
        assert data['status'] == 'pass'
        copy_rom(directory, name)
        shutil.copyfile(directory/'verification/screen_000.png', RESULTS/f'stage_{mode}.png')
        shutil.copyfile(directory/'verification/summary.json', RESULTS/f'stage_{mode}.json')
        directories.append(directory)
    single = ROOT/'build/bitmap/solid_44_1'
    single_result = json.loads((single/'verification/summary.json').read_text())
    assert single_result['at_30fps'] and single_result['images'] == 64
    copy_rom(single, 'GSU_SolidCube30_v001.nes')
    for source, target in [('demo.gif', 'solid_cube.gif'), ('screen_008.png', 'solid_cube.png'),
                           ('summary.json', 'solid_cube.json')]:
        shutil.copyfile(single/'verification'/source, RESULTS/target)
    directories.append(single)
    montage = Image.new('RGB', (3*256, ((len(benchmark['results'])+2)//3)*264), '#171923')
    draw = ImageDraw.Draw(montage)
    table = []
    total_gsu = sum(json.loads((d/'verification/summary.json').read_text())['gsu_pixels_checked']
                    for d in directories)
    total_ppu = sum(json.loads((d/'verification/summary.json').read_text())['ppu_rgb_pixels_checked']
                    for d in directories)
    for i, record in enumerate(benchmark['results']):
        directory = ROOT/record['directory']
        assert record['pass']['at_30fps'] and record['pass']['images'] == 64
        record['rom'] = copy_rom(directory, f"GSU_Cubes_edge{record['model_edge']}_n{record['count_at_30fps']}_v001.nes")
        directories.append(directory)
        for result in [record['pass'], record['next']]:
            if result:
                total_gsu += result['gsu_pixels_checked']
                total_ppu += result['ppu_rgb_pixels_checked']
        if record['next']:
            assert not record['next']['at_30fps']
            directories.append(ROOT/f"build/bitmap/solid_{record['half']}_{record['next_count']}")
            boundary = f"{record['next_count']}個で遅延（{record['next']['missed']}回）"
        else:
            boundary = f"非重複配置の上限{record['grid_capacity']}個"
        table.append(f"| {record['model_edge']} | **{record['count_at_30fps']}** | {record['max_gsu_ms']:.3f} ms | {boundary} |")
        x, y = (i % 3)*256, (i//3)*264
        montage.paste(Image.open(directory/'verification/screen_008.png'), (x,y))
        draw.text((x+6,y+244), f"edge {record['model_edge']} / {record['count_at_30fps']} cubes / 30fps", fill='white')
        shutil.copyfile(directory/'verification/summary.json', RESULTS/f"edge{record['model_edge']}.json")
    for directory in directories:
        config = json.loads((directory/'config.json').read_text())
        assert config['rom_sha256'] == sha(next(directory.glob('*.nes')))
        if config['kind'] == 'solid':
            phases = [int((directory/f'verification/phase_{i:03d}.txt').read_text()) for i in range(64)]
            assert sorted(phases) == list(range(64)), directory
    montage.save(RESULTS/'benchmark.png')
    shutil.copyfile(ROOT/'build/bitmap/solid_4_33/verification/demo.gif', RESULTS/'cubes_33.gif')
    benchmark['verified_gsu_pixels'] = total_gsu
    benchmark['verified_ppu_rgb_pixels'] = total_ppu
    encoded = json.dumps(benchmark, ensure_ascii=False, indent=2)+'\n'
    (RESULTS/'benchmark.json').write_text(encoded, encoding='utf-8')
    (ROOT/'releases/bitmap_benchmark.json').write_text(encoded, encoding='utf-8')
    # Capture only fresh, named verification outputs; exclude abandoned error/mismatch files.
    with zipfile.ZipFile(RESULTS/'verification.zip', 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        for directory in dict.fromkeys(directories):
            prefix = directory.name+'/'
            for name in ['config.json', 'cpu.lbl', 'gsu.bin', 'payload.bin', 'matrices.bin', 'faces.bin']:
                path = directory/name
                if path.exists():
                    z.write(path, prefix+name)
            for path in directory.glob('*.nes'):
                z.write(path, prefix+path.name)
            for pattern in ['summary.json','trace.jsonl','test.lua','emulator.log','screen_*.png','screen_*.rgb',
                            'ram_*.bin','phase_*.txt']:
                for path in (directory/'verification').glob(pattern):
                    z.write(path, prefix+'verification/'+path.name)
    paths = list(ROOT.glob('releases/GSU_*v001.nes'))
    paths += [ROOT/'runtime/MesenCore.dll', ROOT/'build/generated/source_manifest.json']
    paths += list((DEMO).glob('*.s'))
    paths += [ROOT/'src/BitmapBoard.hpp', ROOT/'src/NesBitmapFx.h',
              ROOT/'src/bitmap_probe.cpp', ROOT/'src/bitmap_contract.cpp']
    paths += [ROOT/'tools'/name for name in ['build.py','build_bitmap.py','run_bitmap.py',
                                           'benchmark_bitmap.py','package_bitmap.py','verify_interactive_bitmap.py']]
    paths += [RESULTS/'verification.zip']
    (RESULTS/'sha256.json').write_text(json.dumps(
        {str(p.relative_to(ROOT)):sha(p) for p in paths if p.exists()}, indent=2)+'\n')
    text = """# GSUの直接ビットマップ表示・面塗り回転・30fpsベンチマーク v001

2026年10月14日。128×128 → 256×64 → 全画面256×240の順に、GSU描画RAMをPPUから直接表示した。続いて白・水色・紫の面を持つ立方体を30fpsで回転させ、縮小した立方体の個数上限を検証した。

**性能値はエミュレーターの時間モデルでの測定。新設した提案ABI2は現行N8 ProのABI1 RTLには存在せず、FPGAへの収まり・メモリー帯域・実機性能は未確認。**

## 起動

専用ランチャーは projects/nes_superfx にある。標準Mesenはこのマッパーを持たないため、ROMを標準版へ直接開かない。

- [run_bitmap_128.cmd](../../../run_bitmap_128.cmd)：中央128×128、位置識別パターン。
- [run_bitmap_band.cmd](../../../run_bitmap_band.cmd)：中央256×64、同じ表示経路。
- [run_bitmap_full.cmd](../../../run_bitmap_full.cmd)：256×240の全画面パターン。
- [run_solid_cube.cmd](../../../run_solid_cube.cmd)：立方体１個、面塗り、30fps回転。
- [run_cube_benchmark.cmd](../../../run_cube_benchmark.cmd)：１本のROMでAを押して個数・辺長を変更。固定構成だけ開く場合は --edge 8 など。

![白・水色・紫の立方体](results/solid_cube.gif)

## 段階ごとの成果

| 段階 | 表示領域 | 確認 |
|---|---|---|
| 1 | 128×128、位置64,56 | GSUがPLOTした画素とPPUの全RGBが一致 |
| 2 | 256×64、位置0,88 | X=127/128を含むnative GSU配置を確認 |
| 3 | 256×240、位置0,0 | Y=63/64・127/128・191/192、全画面が一致 |
| 4 | 全画面上の立方体１個 | 64姿勢、完成画像を毎２フィールド提示、遅延0 |
| 5 | サイズごとの複数立方体 | 各64姿勢、成功個数と次の失敗個数の境界を検査 |

![全画面パターン](results/stage_3.png)

１画像16 KiB、前後２画像32 KiB、作業・コード8 KiBの計40 KiB RAM。GSUは背面へ描画し、STOP/RPIX後にVBlankで表示bankを切り替える。CPUからPPUへの画像転送は行わない。PPUのnametable fetchでタイル座標を保持し、pattern fetchをGSUのnative 2bpp配置へ変換する。64行帯をCPU割込みで切り替える方式ではなく、先読みも同じ座標経路で処理する。スクロール0、背景の共通４色パレットが対象。段階試験・固定個数の計測ROMはsprite無効。後述のA切替ROMでは文字spriteを重ねる。

## 立方体の描画

GSUが毎画像、８頂点の固定小数点行列変換、面の４辺のBresenham走査、走査線の左右端の抽出、PLOTによる面塗りを実行する。描画コード392byteは512byte cacheへ収まる。CPUは64姿勢の係数表と可視面の頂点番号を渡す。画像や塗り区間の事前計算・画像の使い回しは行わない。

X軸の面を水色、Y軸を白、Z軸を紫とし、裏面へ回っても軸ごとの色を維持する。正射影・一定ピッチ・Y軸回転の簡単なモデル。透視投影、Z-buffer、物体間の重なりは対象外。毎画像、背面16 KiBを全部消去してから描く基準実装で、消去の省略や差分描画の最適化はしていない。

NTSCの２フィールド周期、約30.05fpsを30fpsと表記する。１個のGSU最長時間は13.772ms。CPUの係数転送・GO待ち・VBlank採用も含めた実NES ROMの提示間隔を検査し、64姿勢すべてで毎２フィールド・遅延0を確認した。

## サイズ別の結果

辺長は投影前のモデル座標。画面上の幅は回転で変わる。すべて同サイズ・同位相の立方体を非重複の格子へ配置した。最大数は「今回の64姿勢すべてで毎２フィールド提示・遅延0」を満たした個数であり、別モデルや任意のカメラ・角度の性能保証ではない。辺長2/4は数画素へ量子化され、極小モデルの処理限界を見る条件。

| モデル辺長 | 30fpsの個数 | 最長GSU時間 | 境界の確認 |
|---|---:|---:|---|
TABLE

辺長88/64の行は画面の配置上限に達しており、GSUの演算上限を測った行ではない。その他の行は１個増やすと、64姿勢のどこかで３フィールドの更新が生じた。GSUだけの時間が33ms未満でも、CPUの準備とVBlankの締切によって失敗する場合がある。失敗時も完成前のbankを表示せず、前の画像を保持する。

![各サイズで30fpsを維持した配置](results/benchmark.png)

![辺長8・33個](results/cubes_33.gif)

## 検証と再現

位置識別パターンはX/Y上位bitを色へ混ぜ、象限の取り違えを検出する。Pythonの参照描画とGSU RAMの全画素、最終PPU 256×240全RGBを一致比較する。回転は64姿勢。各画像の更新世代・表示bank・GSU時間・提示field・期限遅延数をLuaで取得し、fault=0も確認する。

ここに保存した段階試験・１個・10サイズの成功例・８サイズの次個数失敗例で、GSU計GSUCOUNT画素、PPU計PPUCOUNT RGB画素を照合した。失敗例の「失敗」は性能期限の遅延であり、描画画素の不一致ではない。

- [benchmark.json](results/benchmark.json)：条件・成功/失敗の全trace・計測値。
- [verification.zip](results/verification.zip)：各ROM、設定、描画プログラム、Lua、PPU画像、GSU画像RAM、phase、trace。
- [sha256.json](results/sha256.json)：ROM・コア・ソース・証跡のhash。
- [ABI2_HANDOFF.md](ABI2_HANDOFF.md)：回路側へ渡すメモリー・レジスター・PPU接続契約。
- [design_log.md](design_log.md)：依頼原文、設計と修正の経緯。

必要なツールは専用コアのビルド環境に加え、PATH上のcc65（ca65/ld65）、Python、Pillow。GSU用casfx.incはtools/build_bitmap.pyが固定commitから取得しhashを確認する。projects/nes_superfx を作業ディレクトリにして実行する。

CODE
python tools/build.py --fetch
cmake -S . -B build -G "Visual Studio 17 2022" -A x64
cmake --build build --config Release
ctest --test-dir build -C Release --output-on-failure
python tools/setup_runtime.py
python tools/build_bitmap.py --mode 1
python tools/run_bitmap.py build/bitmap/bitmap_1
python tools/build_bitmap.py --mode 2
python tools/run_bitmap.py build/bitmap/bitmap_2
python tools/build_bitmap.py --mode 3
python tools/run_bitmap.py build/bitmap/bitmap_3
python tools/build_bitmap.py --kind solid --half 44 --count 1
python tools/run_bitmap.py build/bitmap/solid_44_1
python tools/benchmark_bitmap.py
python tools/package_bitmap.py
python tools/verify.py
python tools/verify_frontend.py
python tools/verify_cube.py
ENDCODE

25MHz基準、CLSR=0のMesen由来GSUの待ち時間・命令実行を使った機能モデル。ホストPCの壁時計時間からfpsを算出していない。PPU独立ポートと40 KiB RAMは提案した構成であり、現行RTLのメモリー待ち・非同期バス・同時アクセスを再現したモデルではない。旧ABI1の無変更診断ROMと線画デモも回帰検証済み。
"""
    text += """
## Aボタンで切り替える１本のROM

追加依頼に合わせ、GSU_CubeBenchmark_A_v001.nesを作成した。[run_cube_benchmark.cmd](../../../run_cube_benchmark.cmd)の引数なし起動はこちらを表示する。NESのA（このPCの専用設定ではZキー）を押すたびに、上表の２→４→６→９→13→19→24→33→52→71個→２個へ進む。辺長も表の条件へ切り替わる。長押しは１回だけ進み、離して再度押すと次へ進む。

画面下のN=は個数、S=は投影前のモデル辺長。文字は固定CHRの第２pattern tableを使うspriteで表示する。背景のGSUビットマップは第１tableを使い、文字の合成にCPUから画像を転送しない。構成変更時だけGSU停止中にモデル・描画リストを更新し、VBlankで文字と完成画像を採用する。切り替え中は前の画像を保持する。安定後は各64姿勢、毎２field更新を確認する。

ROMは実際に4016のNESパッド入力を読む。検証はLuaのcontroller入力でAを８field保持して10回切り替え、長押し重複なし・一周して元へ戻ること・各10構成64姿勢の全GSU画素と文字を含む最終PPU RGBを検査した。証跡は [interactive.json](results/interactive.json)・[interactive_verification.zip](results/interactive_verification.zip)、動作例は [interactive.gif](results/interactive.gif)。

再生成は python tools/build_bitmap.py --kind interactive、検査は python tools/verify_interactive_bitmap.py。固定条件を単独で開く旧メニューは run_cube_benchmark.cmd --edge 8 などで利用できる。
"""
    text = text.replace('TABLE', '\n'.join(table))
    text = text.replace('GSUCOUNT', f'{total_gsu:,}').replace('PPUCOUNT', f'{total_ppu:,}')
    text = text.replace('CODE\n', chr(96)*3+'powershell\n', 1).replace('ENDCODE', chr(96)*3)
    (DEMO/'README.md').write_text(text, encoding='utf-8')
    directory=ROOT/'build/bitmap/interactive_v001'
    if (directory/'verification/summary.json').exists():
        data=json.loads((directory/'verification/summary.json').read_text())
        assert data['status']=='pass'
        copy_rom(directory,'GSU_CubeBenchmark_A_v001.nes')
        shutil.copyfile(directory/'verification/summary.json',RESULTS/'interactive.json')
        shutil.copyfile(directory/'verification/interactive.gif',RESULTS/'interactive.gif')
        with zipfile.ZipFile(RESULTS/'interactive_verification.zip','w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
            for pattern in ['*.nes','config.json','gsu.bin','payload.bin','profile_*.bin','hud_*.bin','hud.chr','cpu.lbl']:
                for p in directory.glob(pattern):z.write(p,p.name)
            for pattern in ['summary.json','trace.jsonl','captures.jsonl','test.lua','emulator.log','p*.rgb','p*.ram','p*.png']:
                for p in (directory/'verification').glob(pattern):z.write(p,'verification/'+p.name)
        hashes=json.loads((RESULTS/'sha256.json').read_text())
        for p in [ROOT/'releases/GSU_CubeBenchmark_A_v001.nes',RESULTS/'interactive_verification.zip']:
            hashes[str(p.relative_to(ROOT))]=sha(p)
        (RESULTS/'sha256.json').write_text(json.dumps(hashes,indent=2)+'\n')
    print(f'Packaged {len(directories)} cases, GSU pixels={total_gsu}, PPU RGB={total_ppu}')


if __name__ == '__main__':
    main()
