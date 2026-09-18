# FamiBASIC Turbo 自作NES/MMC5コアの実装方針

2026-09-19。実装方針の決定。コアの実装・精度検証はまだ行っていない。

## 依頼原文と対象

> 実行テストを外部のエミュレータに頼らず自力で実行できる高精度なエミュレータが欲しい。実装方針を決めて。

対象を確認し、ユーザーから「はい、ファミコン／MMC5向け」と回答を得た。

## 決定

**独自のC++20製NESコアを作り、ヘッドレスCLIと既存Python IDEから同じコアを動かす。NTSCファミコンとMMC5を優先し、CPUバスサイクル・PPUドット単位で同期する。**

日常の実行・合否判定にはMesenの実行ファイルもDLLも必要としない。公開された仕様、実機調査、テストROM、固定された期待値は利用する。テストまで全部自作すると実装と試験に同じ思い込みが入りやすいため、独立した根拠を必ず取り入れる。

最初から全機種・全mapper対応を目指さない。NROMを基礎試験用に実装し、製品向けにMMC5を実装する。PAL/Dendy、その他mapper、アナログ映像再現、JITは後続。未対応ROM・基板設定は明示的に拒否する。

## 現状からの接続

確認先は `D:\HomeBrew\FamiBASIC_Turbo`。

- `famibasic/emulator.py` は従来のMesen別窓起動。
- 現行READMEと `famibasic/nes_host.py` は、専用子プロセスで `MesenCore` を動かしIDEへ映像・制御応答を渡す構成。
- `famibasic/mesen_core.py` は固定版2.1.1 DLLをロードし、パッド・Family BASICキーボードを接続する。
- `tests/test_embedded_host.py` は現在Mesen DLL指定時だけ実行する。新コア向けの共通シナリオへ分離する。
- 既存のpy65によるCPU検証はコンパイラの局所回帰に残せるが、NES全体のタイミング精度の証明には使わない。

新コアの想定配置は製品内の `native/nes_core/`。公開C ABI、CLI、試験を併設する。Python側に `famibasic/native_nes_core.py` を設け、`nes_host.py` に接続する。計画と作業記憶はこのGPT側プロジェクト記憶へ置く。

既存IPCのsession/request照合、プロジェクト別保存、終了待ちを活用する。Mesen固有のウィンドウハンドル・ABI・Tk隠しウィンドウは新コアに持ち込まない。CPUからPythonへの毎サイクルcallbackは禁止し、バッファ単位で映像・音声・トレースを受け渡す。

## 構造と精度

コアは `Machine / Clock / CPU / CPU Bus / PPU / APU / DMA / Cartridge / Mapper / Input` を分離する。UI、ファイル選択、壁時計待機、音声デバイスはコア外。CMakeでCLIとDLLを同じソースからビルドする。ネイティブ速度と既存ctypes接続を得やすいためC++20を選ぶ。固定幅整数を使い、符号付きoverflow・構造体padding・未定義シフトへ依存しない。

### 共通時刻

- 整数master tickを正本にし、CPUとPPUの相対位相・同時イベントの順序を固定する。
- CPU命令をmicro-operationへ分解し、read/write/dummy accessと割り込み検出を各バスサイクルで行う。命令の終了後にまとめて周辺機器を進めない。
- PPUはドット単位で進め、フェッチをmapperへ通知する。画面表示を省略するヘッドレス試験でも、フェッチ・状態遷移・割り込みは省略しない。
- `step_instruction` は周辺回路も同時進行する。`step_frame` は実際のフレーム境界まで進め、一定CPUサイクル数を1フレームとして代用しない。

### CPU・DMA

2A03向け演算、フラグ、アドレッシング、ページ跨ぎ、分岐、RMWの書込み列、スタック、RESET/IRQ/NMI、割り込み競合を対象とする。opcode全256通りを分類し、非公式命令・停止命令・実機差がある不安定命令の扱いを明示する。未実装命令をNOPにしない。

OAM DMAとDMC DMAは同じCPUバス仲裁器を使い、CPU停止・競合・再読出しを扱う。音声をミュートしてもAPU/DMCの進行とIRQを止めない。

### PPU

背景とspriteのフェッチ、スクロール内部状態、レジスタ読書きの副作用、読出しバッファ、open bus、VBlank/NMI境界、sprite評価・優先度・hit/overflow、奇数フレームの挙動を段階的に実装する。完成画面をVRAMから後描きする方式は採らない。

### MMC5

最初の縦切りは、製品ROMが使うPRG/CHR bank、PRG-RAM保護・保存、nametable、乗算、scanline IRQまで。次にExRAM/拡張属性・split・音声/PCMなどを埋める。実装前に現行ROMのレジスタ使用とヘッダを静的に棚卸しし、機能表を固定する。

IRQは単純な「毎scanlineに加算」ではなく、PPUバスの読み出し列とCPU側の時刻から検出する。公開資料にある連続nametable読出しへの依存が、この設計を選ぶ根拠。[MMC5調査資料](https://www.nesdev.org/wiki/MMC5)

CPU/PPUの可視アドレスと物理ROM/RAM bankを別管理し、デバッガでは両方表示する。既存記録にある32 KiB/64 KiB PRG-RAMやCHR-RAMのプロファイルは、実在基板との対応を再確認する。MMC5というmapper番号だけでRAM配線を一律に決めない。特殊プロファイルは明示設定とし、未検証を表示する。

### 音声・入力・状態

基本APU、DMC、MMC5音声のレジスタ・周期・IRQとPCM出力を扱う。デジタル動作の検証と実機のアナログ混合特性は別の到達度として報告する。パッドのラッチ/シフトとFamily BASICキーボードのマトリクスを実装する。

状態保存にはRAM、mapper、CPU命令途中、PPU、APU、DMA、入力ラッチ、時刻・位相まで含める。形式versionとROM hashを検査する。電源投入とresetを分け、テスト用RAM初期化はseedを記録し、複数seedでも実行する。

## 自律検証インターフェース

CLIはROM、入力イベント列、停止条件、最大tick数、seed、基板プロファイルを受け取り、JSON結果・PNG・WAV・失敗直前のトレースを出力する。以下は予定の仕様であり、まだ使えるコマンドではない。

```text
fbt-nes run --rom game.nes --script scenario.json --max-frames 6000 --report result.json
fbt-nes test --manifest conformance.json --report conformance-result.json
```

- headless/音声デバイスなし/ネット接続なしで試験できる。
- pad/keyboard入力はframeまたはmaster tick指定。入力を受理したtickを結果に残す。
- assertionはRAM、レジスタ、PC、物理bank、IRQ時刻、画素、フレーム数、CPU予算を扱う。
- デバッガの `peek` は副作用なし、エミュレーションの `read` は副作用ありとして分ける。
- ログはPC・opcode・CPU状態・bus read/write・PPU位置・mapper・IRQを共通時刻で関連づける。通常は固定長ring buffer、失敗時に詳細保存する。
- JSONにROM/入力/core/testデータのhash、設定、終了理由、実行tickを記録する。pass/fail/timeout/unsupported/errorを区別し、unknownやskipを成功として数えない。
- RAM注入で作る局所試験と、通常起動して入力だけで進める通し試験を別集計する。

同じROM・設定・入力で繰り返したときに同じ状態hashへ到達することを要求する。save/load後も同じ入力で同じhash・フレーム・音声列へ戻る。スクリーンショットhashはpaletteと出力条件を固定した回帰用で、実機一致の証拠とは別に扱う。

## 検証の根拠

1. CPU単体は [SingleStepTests/65x02 の nes6502](https://github.com/SingleStepTests/65x02) を版固定して使用し、最終状態だけでなくバス列を比較する。一般6502版で代用しない。このデータ自体はモデル生成なので、実機を直接記録した値とは区別する。
2. [公開NESテストROM集](https://github.com/christopherpow/nes-test-roms) からCPU、interrupt、PPU、sprite、APU、DMA試験を選び、各試験の出自・対象機種・成功通知方法をmanifestへ記載する。ROMは自作コア内で実行する。
3. [AccuracyCoin](https://github.com/100thCoin/AccuracyCoin) を高精度化の包括試験に使う。NROMの試験であり、MMC5精度を保証する代わりにはしない。採用revision、対象ハード、個別結果を記録する。
4. MMC5の既存試験を棚卸しし、不足部分は小さな診断ROMで補う。bank境界、RAM保護、IRQのenable/ack、描画停止/再開、CPUからのPPUアクセスなどを境界条件で試す。期待値は公開実機調査か実機測定へ紐づける。自作コアの出力をそのまま正解にしない。
5. FamiBASICの回帰はゲームROM・本体RUN・キーボード編集、STOP/CONT、保存再起動、ラスター、スクロール、音楽、FLIGHT LABとSTAR LANCERを対象にする。既存Mesen試験の入力とassertionを移植し、過去の合格記録を新コアの合格として転記しない。

通常試験に外部エミュレータは不要。既存Mesen記録は差異の調査資料にはなるが唯一の正解にしない。実機未照合の挙動は未検証として残す。テストデータの取得元、revision、hash、利用条件をmanifestで管理し、標準テストセットはローカルキャッシュから実行する。

## 実装順と終了条件

| 段階 | 作るもの | 次に進める条件 |
|---|---|---|
| 0 | CMake、Machine API、CLI、試験manifest、ROM/基板棚卸し | 小さなfixtureがheadlessで終了し、失敗・timeout・unsupportedもJSONに出る |
| 1 | CPU、バス、共通時刻、NROM | 固定したnes6502セットの結果とbus列が一致。RESET/IRQ/NMIの専用試験も合格 |
| 2 | PPU、APU/DMA、pad | 選定した基本NES試験が合格。境界系の未達が一覧化され、NROMの映像・音・入力が再現可能 |
| 3 | MMC5とキーボード | 製品使用機能の診断が合格し、ゲームROMと本体環境が起動。入力だけの編集→RUNが成功 |
| 4 | FamiBASIC試験移植と全体精度改善 | 公開試験の対象内失敗0。製品回帰、保存/復帰、入力再生が合格し、外部コアなしで完結 |
| 5 | IDE接続・既定切替・性能改善 | Mesen exe/DLLがない配布環境で映像・音・pause/frame-step・終了保存が成功 |

段階3は「起動する試作」、段階4以降で検証範囲を添えて高精度と呼ぶ。対象内の失敗を黙って対象外へ移さない。既存Mesen経路は切替完了まで比較・退避用に保持し、新コアモードで失敗しても自動fallbackしない。配布依存の除去は段階5で行う。

性能は基準PCとROMを固定して、映像・音声込み実時間以上を必須目標、headless 5倍速以上を暫定目標として測定する。達成済みの値ではない。高速化は正確な基準実装とhash・バス列を比較できてから行う。まず追跡しやすいinterpreterを完成させる。

## 最初の着手単位

段階0と1を最初の実装単位とする。CPUコアだけでなくCLI・失敗トレース・独立テスト読込みを同時に作る。次にPPU/APU/DMAとの同期を固めてからMMC5へ進む。GUI先行や画面が出た時点での完成判定を避け、各段階の試験結果を成果物にする。
