# 最新ROMの起動と縦176ドットの確認

ユーザー原文：

> 最新のROMを起動できる状態にして。縦解像度は上がってる？

2026年10月15日、`D:\HomeBrew\MMC5Racing` のmainをfetchして確認。開始時はa1e9ac7、通常ROMは144×176。元の160から縦16ドット増え、144幅を維持する。184版はまだ不合格の研究用。前日の144×168／136×169比較版の記録を現在の通常版として扱わない。

配布ROM `releases/MMC5Racing_AllIntegrated_144x176.nes`、既存ビルド `build/direct/direct-axle-shared.nes`、manifestのSHA256はすべて `20ab3111589af025a24023de8d8efe38ad9c078b71a209df8581ac553088ed1d` と一致。最新の性能根拠は `verification/column-prepare/README.md` と `native.json`。今回、ゲーム本体を再変更・再ビルドする必要はなかった。

`play_latest.cmd` と `tools/play_latest.ps1` を追加。manifestの配布ファイル名とSHA256を照合し、Mesenを直接起動する。`-CheckOnly` で起動せず検査できる。MESEN_EXEを指定でき、既定は隣接する `D:\HomeBrew\Mesen\Mesen.exe`。従来のplay.cmdは再ビルドして起動する入口として残す。Windows PowerShellの当該環境ではGet-FileHashが見つからなかったため、標準.NETのSHA256を使った。

開始時のMesenは旧 `MMC5Racing_GRIP_BrakeYaw130_144x176` を開いていた。新しい起動入口を実行し、Mesenの返却ウィンドウタイトルが `Mesen - MMC5Racing_AllIntegrated_144x176` に変わったことを確認。Computer Useのスクリーンショットはユーザー操作や他ウィンドウに遮られる場面があったので、最終ゲーム画素やタイトル画面を新しく検証したとは主張しない。今回の確認はファイル照合、起動成功、ロードされたROM名。

main **35dc439** をpush済み、clean。変更はREADMEと起動入口2ファイルだけ。ROM・物理・描画は同じ。プロジェクト記憶以外の定時サイクル／Claudeの変更は混ぜない。
