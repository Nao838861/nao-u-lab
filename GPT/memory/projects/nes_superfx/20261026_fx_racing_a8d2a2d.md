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

このPCのシリアルポートはCOM3/4/7/8のBluetoothリンクのみで、N8 Proは検出されなかった。旧版Mesenを新版起動済みと扱わない。ユーザーにPCかN8 Pro実機かを確認中。新版の起動・実プレイは未実施。
