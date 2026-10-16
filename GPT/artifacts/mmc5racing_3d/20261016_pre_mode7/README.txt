MMC5Racing 3D：Mode7方式へ転換する前の保存版
保存日：2026-10-16

ユーザーが撮影した動画を、元のAVIから変更せず複製した。
原本は runtime/Avi/GSU_MMC5Racing3D_v003.avi に残してある。
動画：256×240、3,922フレーム、約65.26秒、音声ストリームあり。
動画自体にはソースrevisionが記録されていないため、下記は保存時点のrevisionとの対応記録である。

固定revision：9085aaf23f49591e99af15356a6056d1783fd38c
固定タグ：mmc5racing-3d-v003-pre-mode7-20261016
リポジトリ：https://github.com/Nao838861/nao-u-lab.git
ブランチ：codex/superfx-racing-colors-20261016

内容：
- GSU_MMC5Racing3D_v003.avi：資料作成用の原画質動画。
- GSU_MMC5Racing3D_v003.nes：現在の実行ROM。
- racing_3d_v003.json：ROMの生成条件・SHA-256。
- source.zip：固定revisionの GPT/projects/nes_superfx 全体をgit archiveしたもの。
- runtime.zip：現在の専用MesenとDLL、依存ライブラリ、ライセンス。
  settings.jsonはコントローラー設定だけを引き継ぎ、履歴やローカルパスは保存しない。
- preservation.json：各ファイルと実行環境のSHA-256、動画メタデータ。
- design_log.md：方針転換の依頼原文と未確定の仕様検討。

復元：
1. source.zipを別の作業フォルダーへ展開する。
2. runtime.zipを、その中の GPT/projects/nes_superfx/runtime へ展開する。
3. GPT/projects/nes_superfx/run_racing_3d.cmd を起動する（Pythonが必要）。
   または同フォルダーで python tools/launch_racing.py --version 003 --gsu-mhz 50 を実行する。
4. Mesen.exeは直接起動しない。起動ラッパーが専用DLLの上書きを防ぐ。

保存後にゲームや専用コアの変更は行っていない。
Mode7の導入は仕様相談中であり、この保存版は地面もSuperFXで描画する従来方式。
