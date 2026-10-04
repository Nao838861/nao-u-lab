# 星を保護したBGタイル統合・実適用

2026-10-05。実現性調査に続き、ユーザーが「やってみて。結果の絵の違いも通しの画像で見たい。」と指示。`D:/HomeBrew/FamiBASIC_Turbo_main` の通常保存済みB版、再生成用B版原本、基礎サンプルのBGへ適用した。

- 1点の星は完全一致以外の統合から除外。統合元・先の双方を保護する。
- 最初の残存絵へ統合し、連鎖して差が増えることを防ぐ。保護番号0・1・16・17を維持し、番号と全マップのセル参照を詰め直す。
- 保存済みB版とB版原本は31,993→25,788枚、6,205枚（19.4%）減。基礎サンプルは30,637→24,613枚。
- 現在の道中の通し画像は320×7,808画素。破壊前3,918画素（0.15681%）、破壊後3,612画素（0.14456%）の表示差。全7マップで8×8内の差が最大1画素であることを確認。
- 26テスト成功。変更前後のビルドが成功し、実適用後の通常ROMと確認済み候補ROMが一致。準備後のBASIC、固定アドレス、構造化表、素材表の接続、音楽、スプライトは一致。
- 自作NESコアで前後各1,200フレーム実行し、通常プレイ画面へ到達。最終CPUレジスタ・サイクル数一致。900フレーム目の画像差0、1,200フレーム目の差1画素。全編性能・実機は未検証。
- 編集原本の削減であり、固定ROMファイルは前後とも1,572,880 B。通常ROM SHA-256 `7b130ecd93163af8340a89a9cc7f5b6c9a86b784d0cbe104291cc44ce3499ce3`。

正本・手順・検証：[実施記録](D:/HomeBrew/FamiBASIC_Turbo_main/docs/bg_tile_merge_20261005.md)。画像：[比較ビューア](D:/HomeBrew/FamiBASIC_Turbo_main/docs/media/bg_tile_merge_20261005/index.html)、[破壊前の通し比較](D:/HomeBrew/FamiBASIC_Turbo_main/docs/media/bg_tile_merge_20261005/map_2_intact_compare.png)、[破壊後](D:/HomeBrew/FamiBASIC_Turbo_main/docs/media/bg_tile_merge_20261005/map_2_destroyed_compare.png)。左が前、中央が後、右の赤い点が差分。画像は下が開始、上が終盤。ビューアは原寸・2倍・3倍でスクロール可能。

バックアップ：`D:/HomeBrew/FamiBASIC_Turbo_main/build/basic_only/edited_backups/before_bg_tile_merge_20261005_034202_263109/`。この中の `saved_game/` が保存済み版全体、`authored.bg.json` と `sample.bg.json` が原本。保存済み版で更新したファイルは `assets/stage.bg.json` だけ。他のファイルのハッシュは保持。

開いたIDEには「ファイル > ディスクの変更を確認…」または `EditFlightLab.cmd` で開き直して取り込む。実装・比較画像・原本差分はmain `392c89d` としてcommit・push済み。他作業の既存差分はstageしていない。
