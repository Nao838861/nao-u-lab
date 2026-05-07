# game/ フォルダ構造方針

## 由来

2026-04-22 03:40 #game-rights Nao_u → Ash 宛の ash_onebutton_01 感想末尾の全インスタンス共通指示:

> あと、ここから改善したすべてのバージョンを置いておけるようにしてほしい。game階層はたくさんゲームを作るとすごい数のフォルダになりそうなので、ゲームごとやバージョンごとに適切に階層を持たせたフォルダに分けて、バージョンアップの履歴も後からでもそのまま遊び比べられるようにしておいてほしい。

## 新構造（going forward 強制）

```
game/
  <game_id>/
    v01/           # 各バージョンは独立したプレイ可能スナップショット
      index.html
      devlog.md    # このバージョンの制作ログ
      raw_log.md   # 生記録
      replays/
    v02/
    v03/
    README.md      # ゲーム全体の概要 + バージョン比較
```

- `<game_id>` 例: `avoid_log` / `mir_textadv` / `ash_onebutton` / `log_textadv`
- バージョンは `v01` `v02` ... とゼロ詰め2桁。1000版は考えなくていい
- 各 v??/ は **それ単体で遊べる完成スナップショット**。相互依存しない
- ゲーム全体の README は `<game_id>/README.md` に置き、バージョン一覧と遊び比べ手順を書く

## 既存flat構造の扱い

現状フラット（`avoid_log_01`, `mir_textadv_03`, `ash_onebutton_01` 等）は50+ファイルから参照されている（projects/game_development.md, memory/game_lessons_log.md, nao_u_live.md, cross_review/*.md 等）。一括 `git mv` は破壊的なので：

- **新バージョン着手時**: 新ルール適用。例: avoid_log_03 を作るなら `game/avoid_log/v03/` に置く。同時に v01/v02 も `game/avoid_log/` 配下へ移動し、参照を更新
- **単独の移行作業はしない**: 新版を作るタイミングで一緒にやる（破壊的変更を新版コミットに混ぜる方がdiffが追いやすい）
- **cross_review/README.md の target 命名規則**: 旧 `avoid_log_02` → 新 `avoid_log/v02` のように`/`を含む形に更新（移行時）

## インスタンス担当

| 既存フォルダ | 担当 |
|---|---|
| avoid_log_01, avoid_log_02, log_textadv_01 | Log |
| mir_textadv_01, mir_textadv_02, mir_textadv_03 | Mir |
| ash_onebutton_01 | Ash |
| Pot/ | 共同（Nao_u主導） |
| MarioGBASample, study_platformer_01 | 学習素材（移行対象外、既存のまま） |

各インスタンスは自分の次版を作る時に自分の旧版を `<game_id>/v??/` に移動する。

## チェックリスト（新ゲーム/新バージョン着手前）

- [ ] `<game_id>` 名は決まっているか（instance prefix を含める: avoid_log / ash_onebutton / mir_textadv 等）
- [ ] v?? ディレクトリを掘ったか
- [ ] 前バージョンが flat なら、このコミットで一緒に `<game_id>/v??/` へ移動する
- [ ] 参照元（projects/game_development.md, cross_review/*, memory/game_lessons_log.md 等）を更新したか
- [ ] `<game_id>/README.md` にバージョン差分を追記したか
