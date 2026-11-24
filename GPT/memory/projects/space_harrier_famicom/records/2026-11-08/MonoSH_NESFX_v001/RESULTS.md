# 検証結果

## 合格した試験

- 実6502バイナリ＋py65: 1,200 NMI、9,812描画コマンド。移動、連射、命中、得点、深度順、矩形境界、Start長押し時のポーズ保持／再開。最大NMI 1,537 cycles、描画コマンド作成3,134 cycles。MMIOは模擬でありFPGAの性能試験ではありません。
- 採用RTLのGSU＋racing_gsuをGHDLで実行: 5試験すべて色面16,384 bytesとopaque-zero面16,384 bytesを独立期待値と全照合。6素材、拡縮、重なり、四隅、最終行／列、空コマンド、opaque-zero設定／保持／解除。
- 音声ドライバの実6502バイナリ: 2曲ループ29,923 tick。全イベントの時刻と音程低バイト、7種SEの終了・消音、PCM書込みなしを確認。最大591 cycles/tick。
- 隔離した専用Mesenモデル: 最終ROMをコールドブート。自機移動、連射・命中、表示commit、ポーズ保持／再開を確認。紫の空と緑地面、4色＋透明の合成画像を保存。

## GSU単体の描画時間

50MHz GSU / 25MHzホストでrunning開始から終了まで。

| 試験 | 時間 |
|---|---:|
| 6素材32×32 | 4.27620 ms |
| 拡縮・重なり | 6.94408 ms |
| 四隅・境界 | 3.32584 ms |
| 空コマンド | 0.00052 ms |
| opaque-zero重なり負荷 | 10.82864 ms |

CPU準備、クリア、CHRコピー、Mode7 DSP、NMI、表示待ちは含みません。実機60fps達成の証明ではありません。表示モデルもコピー時間が合成モデルのため性能判断には使えません。

## 未確認・未完成

- 実FPGA／実機での起動、表示、音出し、長時間安定、実present間隔、60fps。
- MMC5の実際のミキシング・音量・クリップ。表示用Mesenモデルには今回のMMC5音声実装がありません。
- 曲はA/C/Eの3声部のみ。原曲の残りの和声・打楽器、SFC音色・エンベロープ・反響・ステレオは未移植。
- 元素材の代表1フレームのみ。32×32化で細部が失われます。大型ボス、全アニメ、全ステージ、敵行動は未移植。
- 地面と木の境界が溶けます。slot3は地平線を跨ぐと赤茶から紫になります。
- 描画ループは合法コマンド専用。CPUが幅・高さ1以上と256×192内の矩形を保証。任意の不正コマンドを受け付ける汎用ライブラリではありません。
- メインループのhardware busy待ちはタイムアウトなし。DSP fault時はstatus=$E1で停止。実機デバッグ用の回復UIは未実装。
- 表示用モデルのopaque-zero面はsave-state非対応。専用モデルの試験用拡張です。

## 次に行う実機試験

既存SDやRBFを上書きせず、別媒体／別配置を相談して検証します。各fieldのCPU準備、clear、GSU、copy、Mode7 ready、commitを記録。実presentが毎fieldでunderrun/fault/overflowが0かを確認するまで60fpsとはしません。GSU診断は25MHz基準で16tick丸め。copy計測はcount×16/25000 ms、flagsのvalid・途中次描画・overflowも確認します。

各試験の機械可読データはresults/cpu.json、results/rtl/report.json、results/runtime/result.json、audio/test_report.jsonです。
