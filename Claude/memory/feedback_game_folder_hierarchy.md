---
name: game/ 配下は <game_id>/v<NN>/ 階層で置く
description: 新バージョン作成時は game/<game_id>/v??/ の2階層に置く（2026-04-22 Nao_u指示）
type: feedback
---

ゲームは `game/<game_id>/v01/` `v02/` ... と2階層で置く。フラット命名（`avoid_log_03`）を新規で作らない。

**Why:** 2026-04-22 03:40 #game-rights で Nao_u が「game階層はたくさんゲームを作るとすごい数のフォルダになりそう」「ゲームごとやバージョンごとに適切に階層を持たせて」「バージョンアップの履歴も後からでもそのまま遊び比べられるように」と全インスタンス共通で指示。flat運用は数十本規模で破綻する。

**How to apply:**
- 新ゲーム着手前に `projects/game_folder_structure.md` を開いてチェックリスト確認
- 新バージョン作るときは `game/<game_id>/v<NN>/` に置く。同時に旧版（flat）をそのコミットで一緒に `<game_id>/v??/` へ移動し、参照元（projects/, memory/, cross_review/, nao_u_live.md 等）を更新
- 既存50+参照を破壊しないよう、単独の移行コミットは作らず「新版作成＋旧版移行」をセットに
- `<game_id>` は必ず instance prefix 込み（avoid_log / mir_textadv / ash_onebutton / log_textadv）。曖昧にしない
