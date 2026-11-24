# 専用Mesen ホスト速度改善

変更は NesRacingFx.h の設定判定1箇所だけです。HardwareTextureFormat() がCPU/PPUアクセスごとに行っていた getenv と std::string 比較を、InitMapper() 時に1回だけ取得した bool に置換しました。ROM、ゲームロジック、エミュレートクロック、GSUサイクル計算、地面計算、音声処理は変更していません。

## 測定結果

[REDACTED_HOST_IDENTITY] / AMD Ryzen AI Z2 Extreme。同じ v010 ROM、同じコントローラ入力、240 PPU fields、4 fields ごとのdebug step、AVIなし・traceなしで逐次比較。

- 元DLL: 44.880594秒、5.347523 fps、プロセスCPU時間40.250秒。
- 新DLL: 3.993218秒、60.101897 fps、プロセスCPU時間1.843750秒。
- 同じ60個のtelemetryサンプルが全項目一致。初期・最終CPU clockも一致。
- 比較は通常100%速度制限あり。新DLLはNTSCの約60.0988Hz上限まで到達した結果で、最大性能の11.24倍という意味ではありません。プロセスCPU負荷はこの試験で約21.8分の1。

Debugger/step/AVI/trace/入力overrideを使わない通常連続再生でも、30.0001825秒で1803 PPU frames、60.099634 fps、エミュレート時間30.000590秒。CPU時間14.453125秒。速度設定は変更していません。画像callback回数ではなくPPU frame進行を計測しています。

## 互換性

既存の元DLL v010 capture_v010_primed と、新DLLによる同一1200-field入力スケジュールの録画を比較。

- 1200/1200フレームの全画素MD5が完全一致。
- cycle trace 8416行がファイル単位で完全一致。
- 300 telemetryサンプルが全項目一致。
- 音声は録画開始が262サンプル（48kHzで5.458ms）ずれています。整列後の957361ステレオサンプルは左右ともbit完全一致、差分0。AVI/音声ファイル自体のbit完全一致は主張しません。
- 同じ新DLLで240-field録画を2回繰り返した結果は映像とPCMとも完全一致。
- 1200-fieldのAVI+trace計測は23.982147秒、50.037222実fps。毎イベントでファイルを開くtraceと録画の負荷を含むため通常再生とは区別してください。

## 成果物

- cached_config/MesenCore.dll: 単体最適化版。
- cached_config.patch: この変更だけのパッチ。
- core/: 新規実験用ソースコピー。
- build_host_core.py / patch_cached_config.py: 構築手順。
- benchmark.py / benchmark_continuous.py / verify_*.py: 再現・検証スクリプト。
- results/: 生測定結果、動画、trace、比較証拠。
- manifest.json: SHA256と検証範囲。

新DLL SHA256: 3d77e7a6ccec5b76483142a46fb9c42a1e38a2fe82b41e2d98626411f86d4a09

元DLL SHA256: ed35b9fe449cd289ee4a10c8763684f90464bbcd442784c76e8bc100f6e0b4d6

ROM SHA256: 298a38c5b9292748c28097b0800959545c92a6b7097cb7100487a41f4b778d98

## 制限

- 既存ROM、DLL、SD、RBFは変更していません。新規実験フォルダだけに出力。
- 機能専用エミュレータのホスト最適化であり、FPGAの実帯域や実機60fpsの証拠ではありません。
- Pythonソフトウェア描画ホスト、音声デバイスなしでの測定。実GUI/音声デバイスの体感と遅延、全ステージ負荷は別途確認が必要です。
- プロセス環境変数でのmapper選択は各ROM初期化時に固定。ROM動作中に外部から環境変数を変更する挙動は対象外です。
- 行計算cacheはこのDLLに含めていません。別担当が必要性と統合を検証します。
