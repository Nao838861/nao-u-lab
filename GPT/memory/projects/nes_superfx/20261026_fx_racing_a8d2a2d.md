# FxRacing 敵車対応・時間停止修正版の取得

ユーザーから「敵車が走る版と時間停止修正、対応ソースを掲載し、GitHubから取得し直した40ファイルのハッシュ一致を確認しました。コミットはa8d2a2dです。」との補足を受け、更新版を取得した。

- 正本リポジトリ：`Nao838861/MMC5Racing`。ブランチ：`codex/fx-racing-rog-integration-20261024`。
- 固定コミット：`a8d2a2d01fefc39665f01d22b80c80207ce088f7`。
- 配布入口：`releases/FX_Racing_3D_20261025/README.md`。
- ローカル取得先：`D:\HomeBrew\FxRacing\releases\FX_Racing_3D_20261025`。
- 既存の`D:\HomeBrew\MMC5Racing`でfetchし、固定コミットから配布ディレクトリをバイナリのまま抽出。manifest掲載40ファイルすべてのSHA256一致を独立確認。同梱`reproduce.py`も成功し、固定入力からのROM完全再現とRBFハッシュ一致を確認した。
- ROM SHA256：`b893f680e22fbd38b5aa47516bc7aef3564fb8e292b0403ab38aa33cba3b74dc`。
- mapper.rbf SHA256：`6b09182cc4365cef05e511dbe52ccb0d6096b6126319cbcc3fee07fc7d8fbb84`。

これは前回起動した`GSU_MMC5Racing3D_v005.nes`とは異なる実機用ROM/RBFペア。旧v005の公開先であるnao-u-labだけを検索すると更新版を見落とす。

## 今回確認できた起動上の不足

配布には対応PC用Mesenコアが含まれていない。開発テストは`continuous-committed-idle-mesen/MesenCore.dll`と`n8pro-racing-d10-format-probe`を参照するが、そのDLLと完全なビルド依存は公開ツリーに見当たらない。旧v005用ランチャーは別形式のROMサイズ・マッパーを前提としており、そのまま流用しない。

このPCのシリアルポートはCOM3/4/7/8のBluetoothリンクのみで、N8 Proは検出されなかった。

## PC用コアを実装して起動

ユーザーの「PCで動かしたい」を受け、公開RTLを参照して専用Mesenの機能モデルを追加した。入口は [FX_RACING_PC.md](../../../projects/nes_superfx/FX_RACING_PC.md)。配布ROMは無変更。`NesFxRacingPc.h`・`FxRacingBoard.hpp`で実機版のRAM、画像保持、タイトル／HUD、地面合成へ対応する。

- 起動：`D:\HomeBrew\FxRacing\play_latest.cmd`、または `projects/nes_superfx/run_fx_racing_pc.cmd`。
- 専用実行先：`projects/nes_superfx/runtime_fx_racing_pc`。
- 両モードで4500フレーム、ゲーム内時計3689tick、敵車状態の更新、表示世代1934、GSU／DSPエラーなしを確認。レース中は無アクセル。RAM・範囲フィルの単体試験も成功。
- 通常UIを起動して新版タイトルを確認し、前面に表示した。
- PSRAM・バス調停・地面DSPの時間は近似で、実機の無進行監視や外部停止は未再現。実機速度・5周完走・全画素一致の保証には使わない。

## Select視点変更の不具合確認と復旧

ユーザーの「このバージョン、セレクトボタンの視点変更って機能してる？」を受け、無変更ROMを別の専用Mesenプロセスで1500フレーム実行した。タイトルから開始し、レース中にSelectを4回押下。`$0640` は押下中4、解放後0となり、入力はゲームへ届いていた。押下前と各押下後の5点で `$4FA0..$4FAD` のカメラ14バイトは完全に同一だった。現行PC版のレース中視点変更は機能していない。タイトルのモード変更や旧v005の4視点切替とは区別する。ゲームやコアの変更は行わず、検査スクリプトと結果・説明のみ追加した。

続く「何が原因？修正して。」に対し、ROMの `$E5F2` の `JMP $E633` がSelectによる希望視点 `$0650` の更新を飛ばすことを特定した。残っていた4視点のカメラ処理へ接続し直す28バイトのヘルパーを `$FE16` に置き、合計30バイトだけ変更した。タイトルのモード選択は維持する。

Select接続を復旧した時のROMは `releases/FX_RACING_3D_SelectViewFix_20261026.nes`、SHA256 `1bfc54ca74800e207c2842b2a55fa0886b8f9c92a8e39b185d93bf23eb4da47f`。旧配布ROMは保持。エミュレーターのカメラ差替えではなく、ゲームROMの分岐を復旧した。

両モードで `2→3→0→1→2` の循環と長押し時の単一切替、地面カメラ4種類、実PPU画像、修正前後1667回の自車・敵車・レース・ゴースト採取範囲一致を確認。4500フレームの時計60秒超・GSU/DSPエラーなしも修正版で再確認した。[原因と作業ログ](../../../projects/nes_superfx/demos/racing/select_fix_20261026/design_log.md)。

## 現在の視点②・④調整版

ユーザーの「視点２を画像くらいの視点にしてみてほしい」「視点④は真上視点で、2D版と同じような画面になるようにしてほしい」を受け、`FX_RACING_3D_CameraTune_20261026.nes` を作成。SHA256 `2f3ea730d58825f9aee76f029ae2b32b4201aa43593942d13c3df30b39921ff8`。

②は後方6・高さ3.5 worldの低い追従、④は真下90度・約1元座標pixel/画面pixelの縮尺。①・③は維持。カメラ距離に0/5/9/13倍しか許さない旧最適化を、通常とNMI先読みの両経路で修正。14,364組の6502乗算検査、両モード1667回のゲーム状態一致、①・③のカメラ不変、実PPU画像、GSU/DSPエラーなしを確認した。原文と調整経緯は上記作業ログへ保存。

続く「視点2はもう少し車が下に見える方が良いと思う」「視点4は車がもっと下にあるべき」を受け、通常起動を `FX_RACING_3D_CameraFraming_20261026.nes` へ変更。SHA256 `053090050fc0a5554740219ef5ffdbe4e234cff413bebd65ecfeda1ec0e64da4`。②は距離・高さを保ってpitchをcos255/sin26へ調整し約12px下へ。④は真下角度・縮尺を保ちカメラを14 world前へ移し、自車をy96→約166（表示高さ192）へ下げた。負の距離を両計算経路で扱う112byteのヘルパーを追加。27,702組の6502演算照合と、両モード1667回のゲーム状態一致、①・③不変、実PPU画像を確認。証跡は `results/fx_racing_camera_framing_20261026/`。
