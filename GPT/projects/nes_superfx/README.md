# N8 Pro GSUマッパー用エミュレーター

走行版の標準は、音ありv002を継承した[配色変更版v003](demos/racing/v003/README.md)。直線の白線除去、赤白の縁石、赤い車、後部の赤・グレーの市松模様、空の専用パレットに対応する。起動には空パレット選択を実装した更新済み専用コアを使う。

2026年10月14日。無変更診断ROMの緑背景・結果0に加え、**GSU描画RAMのPPU直接表示、256×240の全画面、面塗り立方体の30fps回転、サイズ別個数ベンチマークまで実装した。** NES本体は固定版Mesen 2.1.1、GSUは同版の命令・キャッシュ・描画実装を分離して接続している。現行回路のABI1と、エミュレーターで先行実装した提案ABI2を明示選択する。

## 起動

このPCでは必要なビルドと専用UIの配置を完了している。

- [run_gsu.cmd](run_gsu.cmd)：GSU入り独自マッパーを明示して診断ROMを起動。期待は緑背景・結果0。
- [run_nrom.cmd](run_nrom.cmd)：通常のNROMとして同じROMを起動。期待は赤背景・結果1。
- [run_cube.cmd](run_cube.cmd)：GSUで頂点変換と線描画を行う、回転する立方体。[説明・動画・検証](demos/cube/v001/README.md)。
- [run_solid_cube.cmd](run_solid_cube.cmd)：白・水色・紫の面塗り立方体を等倍画素で30fps回転。提案ABI2。[説明・動画・検証](demos/bitmap/v001/README.md)。
- [run_cube_benchmark.cmd](run_cube_benchmark.cmd)：均等配置版v002。１本のROMでA（専用設定ではZキー）を押し、２→４→６→９→13→19→24→33→52→71個を切り替える。画面下のN=は個数、S=はモデル辺長。
- [run_polygon_benchmark.cmd](run_polygon_benchmark.cmd)：通常の25MHz版v002。専用RAM範囲フィルでクリアし、処理落ち直前の最大個数を表示。Aで６条件×25/12.5MHzを変更する。[専用クリア・上限・RTL・動画](demos/polygon/v002/README.md)。頂点変換・透視投影・裏面除去・深度順ソート・面塗りはGSUで実行する。[従来v001の30fps上限・20ms予算](demos/polygon/v001/README.md)も保存している。
- [run_polygon_benchmark_50mhz.cmd](run_polygon_benchmark_50mhz.cmd)：v003はGSU 50MHz相当。外部RAMの待ちとクリア回路は従来の実時間を保つ。Aで６条件を変更する。[25MHzとの比較・上限・動画](demos/polygon/v003/README.md)。通常ランチャーは25MHzのまま。
- [run_ground_compare.cmd](run_ground_compare.cmd)：MMC5Racingコースのv003。元の車体／道路比率を合わせ、元の物理座標を受け取る接続処理を追加。ポリゴン／MODE7風をAで切り替え、SELECTで4視点、Bで停止する。標準50MHz、[25MHz起動](run_ground_compare_25mhz.cmd)も用意。[車体寸法・物理接続・検証](demos/ground/v003/README.md)。自動周回の比較版で、4輪物理の走行版と30fps化は次段階。
- [run_racing_3d.cmd](run_racing_3d.cmd)：元の6502物理を接続した自車の3D走行版。A/Zがアクセル、B/Xが元のモード別操作、左右が操舵、SELECTが4視点、上が地面2方式、下がGRIP/DRIFT変更、START/Enterがリセット。[一致の範囲・操作・検証](demos/racing/v001/README.md)。物理は60Hzで描画から独立。v002で原版のエンジン音・タイヤ音を接続。[音の移植と検証](demos/racing/v002/README.md)。景物衝突・CPU車・レース進行は未接続。[25MHz起動](run_racing_3d_25mhz.cmd)も用意。
- [run_bitmap_128.cmd](run_bitmap_128.cmd) → [run_bitmap_band.cmd](run_bitmap_band.cmd) → [run_bitmap_full.cmd](run_bitmap_full.cmd)：直接表示の128×128、256×64、256×240段階成果。
- 別ROMを渡す場合は `run_gsu.cmd "C:\path\diagnostic.nes"`。

`runtime/Mesen.exe` を直接起動せず、上記ランチャーを使う。標準UIは起動時に内蔵DLLを展開するため、直接起動すると専用の `MesenCore.dll` が標準版で上書きされる。ランチャーはhashを確認し、読み取り共有のWindowsファイルハンドルを保持して上書きを防ぐ。標準UIの依存展開処理はこの書込み失敗を捕捉し、専用DLLを正常にロードする。この経路も実行検証済み。

専用フォルダーは `D:\AI\Nao_u_BOT\GPT\projects\nes_superfx\runtime`。設定・保存先もここに分離し、専用側だけ `Preferences.SingleInstance=false` にして、起動済みの標準MesenへROMが転送されることを防ぐ。既存の `D:\HomeBrew\Mesen` とマッパー開発側の原本は変更していない。ランチャーのコンソールはMesen終了まで待機する。

## 取れるアプローチと今回の選択

| 方法 | 利点 | 費用・制約 | 今回の扱い |
|---|---|---|---|
| 既存NESエミュレーターへ専用mapperとGSUコアを追加 | CPU・PPU・音源・NESデバッガー・Luaを再利用でき、ゲーム開発へ早く接続できる | GSUのSNES依存を分離し、独自回路のABIと時間を実装する必要がある | **採用。Mesen 2.1.1で診断を通した** |
| GSU単体のヘッドレス実行環境 | 命令・RAM・キャッシュを短い試験で調べやすい | これだけではNESのROM起動・画面表示を確認できない | `nesfx_probe` として併設。NES全体の試験と組み合わせる |
| RTLとNESエミュレーターの協調実行 | 実装済み回路の状態遷移を比較の正本にしやすい | VHDLシミュレーターとの接続、非同期クロック・バスの同期、速度が課題 | 次段階の照合候補。今回の実行にはQuartusもRBFも不要 |
| NESとGSUを一から自作 | 構造とライセンス選択を全面的に制御できる | CPU/PPU/APU/DMA/GSUすべての精度検証が必要になり、マッパー開発の先行環境としては時間がかかる | 初版には採用しない |

既存FamiBASIC向けの自作NES/MMC5コア計画とは別の開発環境。将来そちらへ接続する場合も、今回のABI診断・負の対照・GSU単体試験を移せる。

## 合わせた回路仕様

引き継ぎ正本は `C:\Users\owner\Downloads\MMC5Racing\development\superfx-lab\EMULATOR_HANDOFF.md`。対応する[固定commitの引き継ぎ資料](https://github.com/Nao838861/MMC5Racing/blob/85bddea72743ca7b7b50b41e24b11c2df0416ea5/development/superfx-lab/EMULATOR_HANDOFF.md)と、その中で指定されたRTL・診断ROMを読んで実装した。

- iNESヘッダーはmapper **0**のまま。新しい正式mapper番号は割り当てない。
- ランチャーが子プロセスだけへ `NES_GSU_MAPPER=n8pro-gsu-abi1` を渡す。未指定の通常NROMはGSUを持たない。
- `$5000..$52FF` をGSUの `$3000..$32FF` へ接続。全レジスター共通の下位バイトラッチ、R15上位でGO、PBR書込みでキャッシュvalid消去、16byteブロック末尾書込みでvalidを再現する。
- ID `$5FF1=53`、ABI `$5FF2=01`、VCR `$503B=04`。`$5FF0` へA5で15基準クロックのリセットを開始し、R0..R15とラッチをクリアする。共有RAMは消さない。
- 共有RAMは**単一の8 KiB配列**。CPU窓 `$6000..$7FFF` とGSU実アドレス `address & $1FFF` が同じ配列へ到達する。
- GSUの外部ROM入力は常に00。命令キャッシュからコードを実行する。NESのPRGをGSU ROMとして接続していない。
- PPUは固定8 KiB CHR ROMを読む。GSU RAMのPPU直結や二重バッファー交換レジスターは追加していない。
- GSU内部STOP IRQは保持し、SFR上位のCPU readでackする。debug peekはackしない。**NES CPUへのIRQ線は接続しない。**

## 検証結果

診断ROMのSHA256は `591424840eba9fc62f7e7d28f2abb90b672f6e074bf5b1ec5baf7e52ab18e837`、40,976byte。原本と専用runtime内のコピーが一致する。

| 条件 | 結果コード | 表示・観測 |
|---|---:|---|
| 無変更ROM、GSU有効 | **0** | 緑。R5=003F、RAM0200/0201=36/13、RAM0000/0001=FF/FF |
| 同じ無変更ROM、GSU無効 | **1** | 赤。NROMの不在検出 |
| 別コピーのADDオペランドを変更 | **4** | 赤。RAM0200/0201=68/24へ変わり、診断が検出 |
| 別コピーのMULTオペランドを変更 | **4** | 赤。R5=0031へ変わり、診断が検出 |
| 別コピーのPLOT色を3→2へ変更 | **5** | 赤。RAM0000/0001=00/FFへ変わり、診断が検出 |

結果0だけを返す固定値モデルではない。GSU命令列を実行し、6502が計算・描画後の共有RAMを検査している。ゼロページ結果、nametable `$2188` の数字タイル、PPU palette `$3F00`、ソフトウェアレンダラーの背景RGB・文字の存在を確認し、画像を目視した。専用DLLのPythonホストに加え、**配布用Mesen.exe＋Lua経路でも有効0／無効1と実画像を検証**した。

単体試験では同じ64byte命令列、符号付き `-7×9=-63`、加算wrap、共通下位ラッチ、RAM折返し、リセット保持、IRQ peek/ack、cache valid、途中状態の保存・再開、分数クロックの累積を検査した。証拠は [results/20261014/summary.json](results/20261014/summary.json)、[成功画面](results/20261014/enabled.png)、[無効対照](results/20261014/disabled.png)。

## 精度と次の段階

**この版は機能モデルであり、RTLとのサイクル単位の一致・実機の処理速度・フレーム期限を保証しない。** 25 MHz基準とNTSC CPUの比率を整数の剰余で保持し、CLSR=0時は既存GSU実装の待ちを含めて進めている。ただし命令やcache fillの途中へCPUアクセスを割り込ませる粒度、M2の同期・160ns前後のstrobe、RAM同期読出し、STOP直後の所有権の細かな位相はRTLと一致させていない。

CPUがGO中の所有RAMへ触る操作は診断の契約外。初版は書込みを抑止・読出し0・検出回数を保持する機能上のガードで、競合時のRTLの電気的な読出し値を再現したとは扱わない。RAMの電源投入値は再現性のため0を選んでおり、実機の初期値の規定ではない。

Mesen由来のGSU全命令コードを含むが、収録MiSTer GSUとの全命令・フラグ・全MMIO互換を検証した版ではない。今回見つけたSTOP内部IRQのマスク差はRTLに合わせた。ほかの差は、診断を拡張してRTLと比較する必要がある。NES側デバッガーとMMIO/RAM peekは使えるが、NES実行中の専用GSU逆アセンブラー・命令単位breakpointは未接続。

提案ABI2では、40 KiB RAMとPPUの独立読出し経路をエミュレーターへ追加した。[回路側向け引き継ぎ仕様](demos/bitmap/v001/ABI2_HANDOFF.md)にアドレス変換・レジスター・VBlank交換をまとめている。**ABI2のRTL実装、RAMポートと帯域、FPGAの合成・Fit・TimeQuest・実機性能は未確認。ベンチマークはエミュレーター時間モデルの値。** GSU PC・opcode・レジスター・RAM・経過基準クロックを同じ操作列でRTLと照合する作業、MMC5との同居、既存ゲームへの接続は別の段階。

## 再ビルドと再検証

Windows x64、Python、Pillow、Visual Studio 2022 C++ツール、CMake、Gitが必要。Mesen UIは同じ2.1.1を使用する。

```powershell
cd D:\AI\Nao_u_BOT\GPT\projects\nes_superfx
python tools/build.py --fetch
cmake -S . -B build -G "Visual Studio 17 2022" -A x64
cmake --build build --config Release
ctest --test-dir build -C Release --output-on-failure
python tools/setup_runtime.py --mesen-dir D:\HomeBrew\Mesen
python tools/verify.py
python tools/verify_frontend.py
```

別のPCでは `setup_runtime.py --rom <既存診断ROM>` と `verify.py --rom <既存診断ROM>` で場所を指定できる。診断ROMを再生成する手順は引き継ぎ資料を参照。hashが変わったら、検証を黙って継続せずABIと命令列を再確認する。

`prepare.py` は原本の固定commitを確認し、GSUの命令実装を生成する。`build.py` は別の `.cache/Mesen2_host` へ接続コードを配置してDLLを作る。原本キャッシュは変更しない。`build/generated/source_manifest.json` に原本・生成物のhashを記録する。`build/`、`.cache/`、`runtime/` はGit対象外。コード・fixture・検証証拠から再構築できる。

## 出自

GSU命令、cache、PLOTの元実装は [Mesen2の固定commit](https://github.com/SourMesen/Mesen2/tree/b9fa69ddc6d0a331fb103fdb5eef6904305703c2/Core/SNES/Coprocessors/GSU)。GPL-3.0-or-later。ライセンスは [LICENSE](LICENSE)。診断命令fixtureは上記MMC5Racingの `rom/program.inc` から生成された `program.hex` と一致する。こちらもGPL-3.0-or-later。

旧Mesen2はarchive化され、継続先として[MesenCE](https://github.com/nesdev-org/MesenCE)を案内している。初版はローカルの既存開発環境・UI ABIとの一致を優先して2.1.1を固定した。継続先への移植はこの診断結果を比較の基準にできる。
