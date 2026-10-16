# MMC5Racing Webの入口

正本: https://github.com/Nao838861/MMC5RacingWeb （main）。このPCの作業コピーは `GPT/.tmp/MMC5RacingWeb`。起動は `GPT/play_mmc5racing_web.cmd`、URLは `http://127.0.0.1:8066/`。

## 更新方針（ユーザー原文、2026-10-16）

> 実装を進めて。
> あと、Web版は2D版がまだ開発中なので、必要に応じて2D版の変更を取り込むアップデートを今後も何度もやると思う。そのつもりでいてもらうのと、バージョンが上がった時にリプレイの互換性が消えたら、そのたびにリプレイを全削除して。リリース後は互換を崩さないようにするつもりだが。

詳細と運用の正本はWebリポジトリの `docs/replay-and-updates.md`。ROM/core/形式と互換世代を固定し、非互換更新時は全リプレイと旧再送待ちを削除する。タイム記録は保持する。開発中の2D版を繰り返し取り込むため、`tools/update_game.py` / `tools/sync_release.py` / `tools/deploy_ranking.py` を用意した。リリース後の通常手順では非互換更新を拒否する。

## 現状

- `56220bb`: モード別ゴースト・タイム保存修正。ブラウザー再起動後の復元を確認。
- `05af9fa`: リプレイ収録・各モード上位50人の保存・タイム横の再生ボタン・互換性破壊時の全削除を実装しpush済み。
- 実測1件約19KB（開始状態・操作・JSON全体）。両モード入力のみ完走と別コアの画面一致、実ブラウザー、ローカルworkerd/D1、ZIP下位パスで検証した。
- **本番反映は途中**。2026-10-16、ユーザーのCloudflare認証を確認し、本番D1のschema/migrationと互換世代1の確認まで完了した。タイム・プロフィールは維持。Worker更新は `workers_scripts:write` 不足で拒否され、追加認証の待機がタイムアウトした。状態はWeb側 `verification/replay-deployment.json`。
- 続きは修正済みの `GPT/finish_mmc5racing_replay.cmd`。`account:read user:read workers:write workers_scripts:write d1:write` で認証後、検証→Worker参照権限確認→schema/migration→Worker反映→公開health/両ランキング確認を実行する。成功時はdeployment.jsonが更新されるので、その差分もcommit/pushする。
- 操作対象は専用Worker/D1 `mmc5racing-ranking`。Judge of ultimateのWorker/DBは変更しない。秘密情報を記憶・Gitに記録しない。

この入口には進捗と正本への導線だけを置く。実装の変更はWeb専用リポジトリで行い、`.tmp` の作業コピーを親リポジトリへ丸ごと追加しない。
