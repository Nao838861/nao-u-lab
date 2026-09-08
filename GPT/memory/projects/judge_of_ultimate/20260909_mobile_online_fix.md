# スマホ版ZIPの接続先未設定を修正

前回のモバイル版ZIPを引数なしビルドで作成したため `DEFAULT_SERVER_URL` が空欄だった。ユーザーから公開先で「マッチングサーバが指定されていません」と報告。

ゲーム commit `76abfb4` push済み。`faithful/match-server-url.txt` をビルドの既定値にし、package_itch.ps1 は SkipBuild でも埋込先と指定先の一致を必須にした。空欄の旧ビルドを拒否することを確認。

wasm-opt が2回異常終了したため、正常な前回スマホ版ZIPから復元し online.js の接続先だけ修正。`20260909-mobile-online.zip` を作成・commit。旧ZIPとの差が online.js のみであることを確認。ゲーム本体・ビルドIDは旧スマホ版と同じ。

公開サーバーhealth正常。クエリ指定なしの2ブラウザが同一matchIdでマッチングし、双方fight / frame92まで進んだ。Web smoke合格。公開先へのアップロードは未実施。詳細はゲーム側 `faithful/docs/mobile-online-fix-20260909.md`。
