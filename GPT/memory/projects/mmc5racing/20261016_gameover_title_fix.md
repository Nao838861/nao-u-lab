# GAME OVERとタイトル復帰の画面崩れを修正

ユーザー原文:

> クラッシュしてゲームオーバーになった時に、タイトル画面が壊れるバグが出ている。以前はレース終了で発生していた。リトライは大丈夫だった

## 結果

`D:/HomeBrew/MMC5Racing` のmainへ `2e8910e647addf78046ca04d91e7ec0acab078a5` をpush済み。終了時mainはclean、origin/mainとの差分0。作業は `D:/HomeBrew/MMC5Racing_carstyle` の `codex/gameover-ppu-fix-20261016` で進め、並行して追加された右側リザルトとDRIFT先頭メニュー、WindowsランチャーのUTF-8修正まで同期してから合流した。基点は `49a090c`。

通常起動は `D:/HomeBrew/MMC5Racing/play_latest.cmd`。manifestとSHAの照合を通常作業ツリーでも確認済み。

- ROM：`releases/MMC5Racing_GameOverFix_136x184.nes`
- SHA256：`01bb6bbff91be7bc6141948cd39e5a21a2e8bf3f0ddd8a1272a3e59d24d6cb57`
- 直前の右側リザルト版：`releases/MMC5Racing_ResultsRight_136x184.nes`、SHA `1158ea252bdf395a948ffe57f1e714e6e5dd7ae31fb3f9ff9ae6758b29250bc7`
- 修正前再現：`python build_release.py --no-gameover-fix`
- 正式ビルド：`CC65_BIN=D:/HomeBrew/CC65/bin` を設定し `python build_release.py`。配布ROMとbyte一致。

## 原因と最小修正

`scenery/crash.s` の独立したGAME OVER転送に、レースのPPUDATA increment32とMMC5 splitが残っていた。以前のゴール後タイトル修正は `scene_enter_title` だけだった。

GAME OVERとタイトルが同じSCENE_DISPLAY `$40` を使う点も問題だった。STARTでrace_stateを0へ戻しても、race bridgeがタイトルを表示済みと判断し、再描画を飛ばした。A/Bリトライはカウントダウン／コースを再初期化するため正常だった。

`ui/gameover-transition.py` を通常136×184ビルドの最終段へ追加。元ROM SHA、命令列、FF paddingをguardしてからbank120の40bytesだけを変更する。

- `$D859..$D875` の空き29bytesに初期化／完了処理を配置。
- `$D917` のrace_state=5設定を初期化へ分岐し、PPUCTRL=$A0・split無効を転送前に設定。
- `$D991` の表示確定を完了処理へ分岐し、パレット転送で変わったNT bitsを0へ戻す。
- GAME OVERを `$41`、タイトルを `$40` と区別。BITで分ける静的NMIのbit6/7は同じで、START時の完全なタイトル再描画を保証。
- GAME OVER切り替え時だけ27cycles増、走行ループの追加命令0。RAM／OAM／CHR／ROMサイズの追加0。

基準版の再現と既存SHA guardを壊さないため、凍結されたcrash.s本体は参照コメントだけを追記。旧版や比較ビルドへの適用範囲は変更していない。

## 検証と取り逃しの改善

入口は開発repoの `verification/gameover-title/README.md` と `results.json`。Mesenで両モードそれぞれ4回衝突させ、GAME OVER3回、Aリトライ、Bリトライ、GAME OVERからSTART、爆発途中からSTART、次のレースまで確認。ワールド位置fixtureを入れるが、衝突判定と画面遷移・PPUは実ROM処理。爆発中の位置と時計停止、journal保持も確認する。

修正前は各モード5画面中4画面が不一致。修正後はGAME OVER／タイトルのNT全1024bytes、パレット、横書き、scroll0、split無効が全画面一致。各モード324コースフレームでhold0、transfer reject0。

右側リザルトもGRIP記録更新＋A復帰、DRIFT通常＋START復帰で確認。段階0..12、340tickでも待機、タイトルのNT／パレット／PPU状態の一致、次のレースで元NMIへ復帰することをassertした。実機確認・入力だけで5周走行・全状態の性能再測定は今回行っていない。

以前のscenery試験はGAME OVER画像を保存するだけで照合せず、START復帰も爆発中だけだった。今回、GAME OVERから戻る経路を独立させてNT／パレット／PPUをassertする試験を追加した。状態値だけの成功を画面正常の証拠にしない。
