# シューティングの未使用BG整理（2026-11-17）

製品main `a186d52`。未使用だった旧道中BG 0（産業基地）と1（別版・共通部品 v023）を削除し、使用中の5枚を連番へ整理した。

| 新番号 | 内容 | 旧番号 |
|---|---|---|
| 0 | 現行の道中（左右拡張B） | 2 |
| 1 | タイトル | 3 |
| 2 | ゲームオーバー | 4 |
| 3 | クリア | 5 |
| 4 | ボス | 6 |

`game_map`は0、道中の未参照名は`MAP0`へ整理。固定画面の参照名`TITLE`、`GAMEOVER`、`CLEAR`、`BOSS`は維持。削除・改名対象のBASIC素材名が参照されていないことを確認した。

反映先は`experiments/horizontal_side_art_b/authored/stage.bg.json`、新規作成テンプレート`famibasic/data/templates/console_basic.json`、保存済み`build/basic_only/game/assets/stage.bg.json`。生成器の入力である編集正本も直したため再生成で旧BGは戻らない。個別の自作ゲームへの自動削除は導入していない。削除前の保存済みBGは`build/basic_only/edited_backups/before_bg_cleanup_20261117/stage.bg.json`へ退避。

新規テンプレートと保存済みサンプルの両方で、変更前後のBASICソース、生成ROM素材全体、配置、バイナリ表、定数、別名、BGシーン設定、スプライト文書が完全一致。編集文書と編集文書ハッシュのみ変化し、実行時の処理・表示・速度は変わらない。フォルダー保存・読込後も5枚の文書と生成素材が一致。既存のテンプレート独立性・配布物単独のBG変換テスト2件成功（20.725秒）。ROMの再ビルドは不要で、起動ROM自体は変更していない。

隔離検証先は`D:/HomeBrew/FamiBASIC_Turbo_bg_cleanup_20261117`。製品mainの既存の無関係な差分はコミットへ含めていない。前回のCHR変更で残った負荷試験時の更新遅れは本件では変更していない。
