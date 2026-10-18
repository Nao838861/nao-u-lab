# MMC5Racing Web

現在版は0.3.0、元ゲームmainは `788b629`。[表示不具合の修正・日英ページ・リプレイとゴースト対戦](20261019_scene_fix_and_ghost.md)を参照。[古い画面が開く報告への対応](20261019_local_launch_cache.md)の起動方式も維持している。以下は2026-10-16の初回作成時の記録。

2026-10-16。MMC5Racingのitch.io向けブラウザー版を、元ゲームとは別のGitHubプロジェクトとして作成した。

## ユーザーの依頼原文

> itch.ioに登録できる、ブラウザで動くバージョンを作って。その際に、インターネットランキングを作りたい。以前にJudge of ultimateのサバイバルモードで使ったのと同じ手法で、ランキングを作ってほしい。名前の登録はブラウザ側で。ブラウザで、GRIP MODEとDriftMODE両方のランキングが見れるように。
> 別のプロジェクトとしてgitに登録して進めて。

> gitに登録して進めて。は、Githubのいつものところね。新しいプロジェクトを作って。

Wranglerの再認証後の質問:

> こんな画面まで進めたが、これでよいか？何が起きていた？Judge of ultimateのランキングも止まってた？

## 成果物と起動

- GitHub: <https://github.com/Nao838861/MMC5RacingWeb>（private）。`main`。初期登録 `4c9d374`、ランキングサーバー `940f7f8`、ブラウザー版・配布物 `e5f4e67`。すべてpush済み。
- ローカル: `D:\HomeBrew\MMC5RacingWeb`。`play_browser.cmd`でローカルHTTPサーバーと標準ブラウザーを起動する。
- プレイ用: `release/MMC5RacingWeb-itch.zip`。直下にindex.html、ROM/JS/WASMを同梱。itch.ioへのアップロード自体は未実施。
- 対応ソース: `release/MMC5RacingWeb-source.zip`。GPLv3のMesenコア用ソース・ホスト・ビルド手順・パッチを同梱する。プレイ用ZIPにもコアのソースZIPとライセンスを含む。
- プレイ用ZIP SHA256: `a2dd44d090db38cc8221712fab91bafe3b30f0f4f641441f2e7f23fa60196897`。
- 対応ソースZIP SHA256: `7e581ab562126608bc50cc6c004686abb6136ccd97b69c32d4efd3aab798585c`。

itch.ioでHTMLプロジェクトを作り、プレイ用ZIPを「This file will be played in the browser」に指定する。目安1280×900、スクロールと全画面を有効にする。対応ソースZIPもダウンロード用に添付する。詳細は対象リポジトリのREADME。

## 固定した元ROMとコア

元ROMは `MMC5Racing` の `e12eec47e112312bab229be69aeeaa703e687fff`、`releases/MMC5Racing_ResultsStable_136x184.nes`。無改変でコピーした。SHA256は `3cdc6da45703a1b9cee0988c28ddf7abe4b99bad4d7419419c5e167e558b70eb`。元プロジェクトが並行して更新されていたため、最終検証後はこの版に固定した。ROM更新時は `web/assets/rom-source.json`、Web設定、Worker設定、テストを合わせて更新・再検証する。

Mesen NES-only libretro `0102910c39ad1a62bc3f784466f3f67ca9eae335` をEmscripten 6.0.9で単一スレッドWASMにした。外部エミュレーターCDN・SharedArrayBuffer・特別な配信ヘッダーは不要。

旧コアのMMC5はWRAM banks4〜7を禁止しており、128KB RAMを使う本ROMの動的転送コードを壊した。Mesen2 `b9fa69ddc6d0a331fb103fdb5eef6904305703c2` のRAM対応とvertical split処理を移植した。旧ROM `01bb6bbf…` の完走後表示破損は元ROM側の修正で解消しており、コアの不具合とは断定しない。コアWASM SHA256は `e4a1eeb28ff7b06c7b9b4797c757fe0846f1327063ac2917914e9e13198750f8`。

ゲーム入力・音声・バッテリーSRAM保存に対応する。ブラウザー側で名前を保存し、両モードのランキングを同時に表示する。キーボード・標準ゲームパッド・タッチUI、音切替、一時停止、全画面と終了を用意した。

## ランキングの本番環境

- API: <https://mmc5racing-ranking.judge-of-ultimate-online.workers.dev>
- Worker: `mmc5racing-ranking`
- D1: `mmc5racing-ranking`、`25c88b47-efec-49dc-a352-e8b9a31cd5ba`
- 最終デプロイID: `7c79809a-dfe8-4890-8af8-7b7b1452114f`

Judge of ultimateと同様のCloudflare Workers + D1、ブラウザーごとの匿名識別子、署名付きプロフィールと開始トークンを用いる。JudgeのWorker/DBは変更していない。GRIP/DRIFT別に5周合計tickの最速順、1ブラウザー1ベスト、同tick同順位、上位10件と圏外の本人前後2件。名前はブラウザーで入力・保存し、改名後も同じ識別子の自己ベストを保持する。

5周完走・モード・周回合計・時計の整合を監視し、非同期送信する。途中終了とオーバーフローは除外。開始登録済みの完走送信に失敗した場合は最大4件を保持して再送する。サーバー側は署名・ROM版・経過時間・5周合計を検査し、同じrunの再送で値を書き換えない。サーバーでの入力リプレイ再検証は未実装。

`RUN_SECRET` / `IP_SECRET` / `ADMIN_TOKEN` はCloudflare secrets。管理トークンのローカル控えは対象リポジトリの `.credentials/admin-token.txt`（Git・配布ZIP対象外）。値を記憶・ログ・Gitへ転記しない。

## Wrangler認証について

ユーザーの「Authorization granted to Wrangler」は認証成功画面。実際にCLIのログイン成功とデプロイ一覧取得を確認した。期限切れだったのは開発PCのWrangler OAuthであり、公開済みWorkerの実行を止めるものではない。

確認時、JudgeのhealthとNORMALランキングはHTTP 200、`ok: true`、既存記録5件を返した。Python urllibの初回403だけをサーバー停止と扱わず、ブラウザー相当のOrigin/User-Agentを持つNode fetchで確認した。今回の確認で過去全期間の無停止までは保証しない。

## 検証と限界

- Workerとレース監視の11試験が通過。モード分離、自己ベスト、同順位、改名、100位以降の本人表示、署名、時間と周回合計、重複送信、途中終了を検査した。
- 実WASMへゲーム入力だけを与え、DRIFT 5周5792tick（1:36.53）、GRIP 5周5469tick（1:31.15）まで完走。CPU/WRAM・姿勢・時計の注入なし。黒画面0、転送拒否0、CPU3台とHUD表示。完走後の左コースは20→270tickで画素差0。
- 専用の空プロファイルでEdgeを起動し、両モードの走行描画、名前と識別子の再読込、タッチUI、モバイル幅、全画面終了、API遮断、保存領域拒否を検査した。ブラウザーの完走送信接続は合成RAMチェックポイントで検査し、入力のみ5周完走とは区別する。
- 本番APIへ両モードの合成QA記録を登録し、取得・改名・再送を確認。作成したQA行だけを削除した。
- itch.io用ZIPを展開し、`http://127.0.0.1:8067/game/` という下位パスからブラウザー試験を通した。テスト済みZIPと最終ZIPのSHA256一致を確認した。
- 証跡は対象リポジトリの `verification/`、詳細は `web/emulator/build.json` と `emulator/BUILD.md`。人間による操作評価・実機スマートフォンの速度測定・itch.io上のプレビューは未実施。

新規プロジェクトへの移植として、両モードの元ゲーム動作とブラウザー操作・非同期ランキング接続を満たしたと判定した。遊びのルールや物理の変更は行っていない。
