# クリア後タイトルの文字化け修正

ユーザー原文:

> クリア後のタイトル画面が化けるバグがあるので直して。上下でモードを選ぶと治る。

## 現在の成果物

対象は `D:\HomeBrew\MMC5Racing` の最新main `d750cc8`。過去の144×176比較ROMでは症状が出ず、現行136×184版（音程最低半分・上がり幅2倍、ゴール／記録更新ジングル入り）で再現した。古い比較版の結果で最新の症状を判断しない。

配布ROMは `releases/MMC5Racing_RightCrop_136x184_TitleFix.nes`、SHA256 `9f675c0b807235cfc2da605cf7fffdc939970b07c45caebe1bf26eb636dc2031`。`play_latest.cmd` のmanifestを更新済み。`play.cmd` は修正後ソースを通常ビルドする。旧GRIP回転上限比較ROMは今回の更新対象ではない。

## 原因と修正

レースの縦方向転送がPPUCTRL=$A4を残し、横方向を前提とするタイトルを描いていた。タイトル終了時に$A0へ戻すので、上下による2回目の描画は直る。`race-src/scene-control.s` の `scene_enter_title` で、消灯直後・転送開始前に$2000=$A0を設定した。ROM5バイト・タイトル入口6cycles、走行ループの処理追加なし。

184版生成・エンジン音程統合の固定ハッシュ契約を修正後へ更新した。元ROMとの最終差分はPRG119/127だけ、ヘッダー・CHR一致。音程・ジングル・物理・レンダラー本体を変更していない。

## 検証

`verification/title-return/README.md` と `results.json` が正本。隔離Mesenで旧ROMは復帰タイトルの791バイト不一致、上下操作で復旧。修正後はGRIP/DRIFT各20確認（全タイトル1024バイト照合を含む）が合格。QA座標による実チェックポイント5周、保存、301NMI後の自動復帰も正常。6001レースフレームのpublication間隔1、保持・転送拒否0。

短い検証はGOAL状態だけ注入し、その後の本物のタイムアウトと描画を調べる。PPU状態は注入しない。共通runnerのsummaryだけで合否とせず、`title-result.json` の `complete=true/checks=20/failures=[]` も確認する。実機・自然な入力だけによる完走は未実施。
