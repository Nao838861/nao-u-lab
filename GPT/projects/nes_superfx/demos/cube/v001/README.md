# 回転するワイヤーフレーム立方体

2026年10月14日。N8 Pro GSU実験マッパーABI1向けのモデル表示テスト。8頂点・12辺の立方体が自動で一周する。線は軸ごとに白・水色・青で表示する。

## 起動

[run_cube.cmd](../../../run_cube.cmd) を実行する。ROM単体は [GSU_Cube_v001.nes](../../../releases/GSU_Cube_v001.nes)。ヘッダーはmapper 0のままなので、専用ランチャーでGSUマッパーを選択する必要がある。通常のNROMではGSU不在を検出し、赤画面で止まる。

[動作プレビュー](results/cube.gif) ／ [八方向の画像](results/rotation.png)

## 実際に実行する処理

CPUは64角度分の回転行列から現在角度の6係数を選び、GSUへ渡す。頂点画像や線の画素を事前保存した動画ではない。

GSUは毎回、描画RAMの消去、8頂点の符号付き乗算・加算による行列変換、固定小数点から画面座標への正射影、Bresenham法による12辺の線描画、RPIXによる描画cacheのflushを実行する。実行コードは199byte、512byte命令cache内に収まる。頂点は±14、行列係数は±127、乗算結果を7bit算術シフトする。

ファミコン側は64×48ドットの2bpp画像を読み、2×2ドットを一つの8×8 CHRタイルへ変換して4倍表示する。固定CHRに256通りの色ブロックを用意するため、**描画RAMのPPU直結やCHR RAMへの変更は不要**。現行ABI・エミュレーターの接続回路は変更していない。

画面領域は256×192画素、Y=32..223。CPUは裏nametableへ1 VBlankにつき128byte、計6回に分けて画像を送る。全768byteの転送後だけ表示先を交換し、途中は前の完成画像を保持する。表題は固定領域に置く。

## 結果と限界

通常ROM起動から64姿勢を一周し、以下を別実装のPython計算と照合した。コードやRAMの注入で成功画面を作っていない。

- 512頂点の投影座標が一致。
- GSU描画RAMの196,608画素が一致。
- 最終PPUの49,152タイルが一致。
- 拡大後のPPU画面3,145,728 RGB画素が一致。
- GSU単体でも64姿勢が停止まで実行され、既存ABI1診断も合格。
- 完成画像の更新間隔はこの機能エミュレーターで8 field、約7.5回/秒。一周は約8.5秒。これは実機性能の測定ではない。

判定：**モデルの回転・投影・GSU線描画・NESへの画面供給を通す簡単な表示テストとして合格。** 4倍のブロック表示と遅い更新は目視できる。現行ABIの固定CHRとCPU転送の制約を意図的に残した初版であり、高解像度・60fpsの達成とは扱わない。

面塗り、隠面処理、透視投影、パッド操作は含まない。全GSU命令のRTL互換、FPGA合成・収まり・実機動作も未確認。次段階で面塗りや透視投影を加える場合は、GSUコード容量と画面供給の費用を分けて測る。

## 再生成・検証

親ディレクトリ `projects/nes_superfx` で実行する。前段の専用エミュレーターが構築済みであること。ca65/ld65がPATHに必要。

```powershell
python tools/build_cube.py
cmake --build build --config Release
ctest --test-dir build -C Release --output-on-failure
python tools/verify_cube.py
```

ソースは [cpu.s](cpu.s) と [gsu.s](gsu.s)。生成ツールは [build_cube.py](../../../tools/build_cube.py)、NES全体の検証は [verify_cube.py](../../../tools/verify_cube.py)。検証結果は [summary.json](results/summary.json)、生のRAM・頂点・nametable・PNG・実行スクリプトは `results/capture.zip` に保存した。

GSUアセンブラーにはARM9/casfxの固定commit `d0827fb5f4ba8d5fb26b4de3fa1e3a79a6fbc1ed` の [casfx.inc](https://github.com/ARM9/casfx/blob/d0827fb5f4ba8d5fb26b4de3fa1e3a79a6fbc1ed/gsu/casfx.inc) をビルド時に使う。取得物は `.cache/` に保存し、SHA256を確認する。ツール側の利用条件は同commitの[ライセンス](https://github.com/ARM9/casfx/blob/d0827fb5f4ba8d5fb26b4de3fa1e3a79a6fbc1ed/LICENSE)を参照。今回のROM・独自ソースは親プロジェクトのGPL-3.0-or-later。
