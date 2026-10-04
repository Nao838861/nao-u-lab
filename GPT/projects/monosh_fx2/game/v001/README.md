# MonoSH FX2：実行可能な移植版 v001

Stage 1、地形・敵2種・射撃・反射・転倒・死亡・復帰・9節ボス・撃破・次周の進行を含む単独起動SNES ROM。MSX版の60Hz更新仕様とデータを移植し、CPUが更新・ソート、Super FX2が拡縮スプライト、通常BGとHDMAが地面・遠景を担当する。

**表示は256×180、実ゲームは概ね30fpsで、60fpsには未達。** 60Hzの時間刻みの処理を1回ずつ行い、間に合わなければ次の表示枠を待つため、処理落ち中はゲームの時間も遅くなる。軽い場面には60fps、重い場面には20fps以下になる更新もある。現段階の評価は [RESULTS.md](RESULTS.md)。

## 遊ぶ

[../../play.cmd](../../play.cmd) を実行する。この環境では既存の `D:\HomeBrew\Mesen\Mesen.exe` を使い、プロジェクト内 `.cache/mesen_runtime` に専用設定を作る。通常のMesen設定を変更せず、オーバークロックなしでROMを開く。別の場所なら環境変数 `MONOSH_FX2_MESEN` にMesenのパスを指定する。

ROM単体は [../../releases/MonoSHFX2_v001.sfc](../../releases/MonoSHFX2_v001.sfc)。GSU/Super FX対応のMesenで開き、Port 1をSNESコントローラにしても遊べる。ROMにLua、元のNES ROM、MSX本体は必要ない。

|操作|SNESパッド|専用ランチャーのキーボード|
|---|---|---|
|左右移動|左右|左右矢印|
|下降／上昇|上／下|上／下矢印|
|連射|Aを押し続ける|Xを押し続ける|
|単発|Yの押下|Zの押下|
|一時停止／再開|Start|Enter|

上下はNES原本 `src/update_player_pos.s` と同じリバース操作。最初に走り・上昇・タイトル表示があり、その間は縦操作に制限がある。死亡後は自動復帰し、ボス撃破後は次の周が始まる。

## ビルドと検証

Python 3.10以上、Pillow、PATH上のcc65/ca65/ld65を使用する。ca65用GSUマクロcasfxは固定ハッシュを検査し、なければ取得する。固定済みソース・画像・テーブルがリポジトリ内にあるため、通常ビルドに元のNES/MSXプロジェクトは不要。

GPTリポジトリのルートで実行する。

```powershell
python -X utf8 projects/monosh_fx2/tools/build_game.py
python -X utf8 projects/monosh_fx2/tools/verify_game.py
python -X utf8 projects/monosh_fx2/tools/test_game.py --scenario play --frames 360
python -X utf8 projects/monosh_fx2/tools/test_game.py --scenario pause --frames 360
python -X utf8 projects/monosh_fx2/tools/test_game.py --scenario controls --frames 720
python -X utf8 projects/monosh_fx2/tools/test_game.py --scenario stumble --frames 800
python -X utf8 projects/monosh_fx2/tools/test_game.py --scenario boss --frames 2600
python -X utf8 projects/monosh_fx2/tools/test_game.py --scenario stress --frames 360
python -X utf8 projects/monosh_fx2/tools/test_game.py --scenario long --frames 18000 --timeout 180
```

テストは専用Mesenを非対話モードで実行する。`long` は通常のパッド入力だけで進め、死亡・復帰・自然なボス到達・撃破・周回を要求する。`boss` はステージ終端と無敵をテスト側から設定し、通常ボス射撃の後に自弾を命中位置へ置く。HPは書き換えず、16回の頭部命中と胴反射・爆発・周回を確認する。`stress` は上下左右をclipした20本の木をテスト側から投入し、全12KiB転送とRAM guardを検査する。これらの状態書換えはLua検証専用で、製品ROMにデバッグショートカットを組み込んでいない。

VRAMとGSUのFBを比較し、別のPython実装でもソート、Q8.8 UV、clip、flip、透明合成の全画素を照合する。`build/game_v001/` は自動生成物。保存済み測定・画像は [results/](results/)。Mesenのテスト用メモリアクセスAPIを使った検証であり、実機確認はまだ行っていない。

原本の取り込みを更新する時だけ `tools/import_game.py`、画像を更新する時だけ `build_game.py --import-assets` を使う。環境変数 `MONOSH_MSX_ROOT` / `MONOSH_NES_ROOT` で参照先を変更できる。原本の作業ツリーを読み取って固定するので、ビルドに使った原本ハッシュは [upstream/sources.json](upstream/sources.json) を参照する。

## 実装の入口

|ファイル|役割|
|---|---|
|[game.c](game.c)|更新順、パッド、カメラ、死亡時の停止、周回|
|[upstream/](upstream/)|元のMSX Cと製品ASMの変更しないスナップショット|
|[combat_port.c](combat_port.c) / [enemy_impl.inc](enemy_impl.inc)|Z80の高速更新経路のC翻訳、射撃・EM1・反射・ボス弾DDA|
|[submit.s](submit.s) / [packet.s](packet.s)|65816の描画リスト、安定ソート、UV・clip・flip|
|[stage.s](stage.s) / [projection.s](projection.s)|地形の投影と、描画矩形を共用する自弾判定|
|[gsu.s](gsu.s)|GSU RAMの描画リストを解析し、クリアと最近傍拡縮を行う|
|[dma.s](dma.s)|前回・今回の矩形を32列の縦範囲にまとめ、消去も転送|
|[ground.s](ground.s) / [ground.c](ground.c)|通常BGの奥行き市松、グレー階調、カメラ、遠景の2速度スクロール|
|[cpu.s](cpu.s) / [rom.cfg](rom.cfg)|起動・WRAM配置・CPU/GSU並行処理・HDMA・DMA|

GSU動作中、CPUのコード・定数・作業領域はWRAMだけを使う。GSUへ渡したリストはSTOPまで固定し、CPUは次フレームを準備する。GSU RAMをCPUが読む／DMAするのはSTOP後。地面の可変HDMA表は3組で、表示中・描画中・次フレーム準備が同じ表を書かない。

GSU側は任意倍率とclipを優先した汎用点参照カーネル。原画を2枚ずつROM bankに置くため各原画の高さは128までで、近距離の一部は拡大参照になる。以前のプローブで速かった同色区間・packed等倍／半分／1/4の切替は、このゲーム経路へまだ統合していない。最大表示寸法に合わせた原画配置と高速経路の統合は、60fpsへ向けた次の改善対象。

依存の一次資料は [casfx](https://github.com/ARM9/casfx)、[Mesen GSU実装](https://github.com/SourMesen/Mesen2/tree/master/Core/SNES/Coprocessors/GSU)、ランチャーの入力設定は [Mesen InputConfig](https://github.com/SourMesen/Mesen2/blob/master/UI/Config/InputConfig.cs) と [共通キー定義](https://github.com/SourMesen/Mesen2/blob/master/Core/Shared/KeyDefinitions.h)。固定した取得元・ハッシュは [../../probes/v001/sources.lock.json](../../probes/v001/sources.lock.json)。

casfxのライセンス原文は [licenses/casfx.txt](licenses/casfx.txt) に保存した。
