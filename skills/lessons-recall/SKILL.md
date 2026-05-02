---
name: lessons-recall
description: Run before / during any game development judgment (new v01, revision decision, cross_review, Nao_u play feedback, brainstorm review, Q-A〜H sheet filling). Uses the 系統マップ (lineage map) in memory/game_lessons_log.md to identify which M/L/S/D/X lessons to open, instead of grepping blind or skipping recall entirely. Triggered when about to write devlog/brainstorm/cross_review judgment, when receiving Nao_u feedback on a v??, when freezing/reviving a series, or when feeling "this situation reminds me of something but I forget".
type: pre-implementation-gate
priority: must-run-before-judgment
linked-rules: [M-37, M-37b, M-38, M-40, M-41]
---

# Lessons Recall (M/L/S/D/X 想起ハーネス)

ゲーム開発判断の手前で「過去の失敗・成功・cross_review 構造を引き当てる」skill。

## なぜ必要か

`memory/lessons/` には 51 個の M/L/S/D/X 個別ファイル + `_appendix.md` がある。
LLM は INDEX (`memory/game_lessons_log.md`) を読まずに直接判断すると以下の罠を踏む:
- M-22「形無し」を忘れて変な題材に着手 → M-22 同型再発（M-39 = ash_onebutton で実際に発生）
- M-37「着手前批判レビュー」を飛ばして実装 → brick_log v01 全否定で M-37 自体が刻印されたのに次サイクルで再違反
- M-15「快感を削った改修盲点」を飛ばして対症療法積層 → avoid_log v系列の再発

判断の手前に「**今この場面に当たる過去 ID は何か**」を3秒で引く構造が必要。

## When to invoke

以下の判断シーンで起動:

- **新規 `game/<id>/v01/` 着手前**（M-38 brainstorm.md 作成と並行で）
- **改修判断**（vN→vN+1 で「進める／凍結／巻き戻し」を選ぶ瞬間）
- **cross_review レビュー記入直前**（他インスタンス案を評価する側になった時）
- **Nao_u プレイ評価受領直後**（「全否定」「機能していない」等の重い feedback 直後は最優先）
- **brainstorm.md / Q-A〜H シート / Q-H-7 着手前批判レビュー記入中**
- **「この状況、何かに似ている気がするが思い出せない」と感じた瞬間**（最強のトリガー）

## Procedure

### Step 1: タスク文脈を1行で言語化

判断対象を1行で書く。例:
- 「brick_log v02 で『裏抜けカウンタ』に代わる独自要素を選定する」
- 「shot_log v01 が target shift しているか cross_review で判定する」
- 「avoid_log v05 の改修案『敵密度↑』を採否する」

### Step 2: 系統マップから関連カテゴリを抽出

`memory/game_lessons_log.md` 末尾の **系統マップ** を引く（再掲。本ファイルが最新源は INDEX 側）:

| 系統 | 関連 ID |
|---|---|
| 計測／HUD | M-10, M-32, L-04, L-05, X-04 |
| 改修方針／巻き戻し | M-11, M-15, M-21, M-29, L-01, L-02, X-03 |
| 設計原理 (罰／報酬／緊張) | M-12, M-23, M-30, M-31, M-39, S-06 |
| 快感／core fantasy | M-14, M-15, M-17, M-36, M-39 |
| 可読性／隠しパラメータ | M-13, M-24, M-25, X-02 |
| 読まれる文章 / メタ／フレーバー | M-16, M-18, M-19, X-04 |
| target imagination | M-27, M-34 |
| 型／守破離／カテゴリ | M-22, M-33, M-35 |
| 着手前ゲート (順序: M-38→M-41→M-37→実装→M-37b) | M-37, M-37b, M-38, M-21 補足 |
| 対面 item 起点 (2026-04-25 Nao_u 対面) | M-22, M-23, M-24, M-25, M-26 |
| brick_log v01 全否定起点 (2026-04-30〜05-01) | M-36, M-37, M-37b, M-38 |
| インフラ／開発運用 | S-01, S-02, S-03, S-04, D-01, D-02, D-03 |
| cross_review 共通 | X-01, X-02, X-03, X-04, X-05, X-06 |

タスク文脈に対応する系統を最低1つ、理想2-3つ選ぶ。複数系統に跨る判断は要警戒（複合罠の可能性）。

### Step 3: INDEX サマリで「開く価値」判定

`memory/game_lessons_log.md` の INDEX 表を該当 ID 行だけ拾い読み。
サマリは「太字キーワード + 核 + 処方」3パート構成。**処方が今のタスクにぶつかるか**で開閉判定:
- 処方が直接ぶつかる → `memory/lessons/<ID>.md` を開く
- 処方が遠い／別文脈 → 開かない（INDEX サマリだけで足りる）
- 「自分の状況とまさに同じ」と感じたら必ず開く（M-37/M-22 同型再発防止）

### Step 4: 個別 lesson 読み込み + 判断への反映

開いた lesson の **次回の規則 / 処方 / Anti-pattern** セクションを今の判断に当てる。
本文中の cross-reference リンク（`[M-22](M-22.md)` 等）は連鎖読みのトリガー。

### Step 5: 判断ログに引いた ID を記載

devlog / brainstorm.md / cross_review コメントに「**引いた lesson**: M-22 (形無し), M-37 (着手前批判)」と1行残す。
将来の再起動時に「前回はここまで引けた」が見えるアンカーになる。

## Output (judgment 文書に必須)

判断対象ファイル（devlog / brainstorm.md / cross_review コメント等）の冒頭または末尾に以下ブロック:

```markdown
## 引いた lesson (skills/lessons-recall)

- 系統: <該当系統名>
- 引いた ID: M-XX (キーワード), L-XX (キーワード), ...
- 判断への反映: ___ （この lesson が今回どう判断を変えたか／変えなかったか）
- 開いたが反映なしの ID: ___ （引いたが今回は当たらなかった、痕跡を残す）
```

## Self-grade ✗ conditions

- 系統マップを引かずに直接 lesson を grep した（broad-grep は最後の手段）
- 関連系統を1つも書いていない
- 引いた ID が全て同一系統内（複合罠を見落とす可能性）
- INDEX サマリだけで判定し、開くべき lesson を開かなかった（処方が直接ぶつかるのに）
- 「今の状況とまさに同じ」感覚があったのに対応 ID を引かなかった
- 判断文書に「引いた lesson」ブロックを書かなかった

## Anti-pattern

- ✗「経験で判断した」（ID 想起なしで判断）— 経験＝過去 ID 蓄積。引かないと M-39 同型再発
- ✗「全 lesson を読み込んでから判断する」（過剰）— 51 個全件読みは context 浪費、INDEX で絞れ
- ✗「lesson と関係ない、新しい状況だ」と判定して引かない — 「新しい」と感じる時ほど M-22「形無し」or M-26「再現できる」自戒の対象
- ✗「引いた ID が3つ以上あったので、面倒なので3つ引いて判断書いた」 — 複合罠を見落とす危険、関連系統を全て触れる

## Connection to existing skills

- **`/game-analyze` (M-38)**: brainstorm.md 作成時に並行起動。Q3 手法10件の各案に対して lessons-recall を引く（M-37 批判レビュー前段で罠を消す）
- **Q-H-7 着手前批判レビュー (M-37)**: 懸念3点を書く前に lessons-recall で過去同型 ID を引く（懸念の質が上がる）
- **M-37b 人間プレイ前 結果予測**: 結果予測の懸念リストを書く前に lessons-recall で過去同型 ID を引く

## Trigger checks (operational, future)

将来 hook 化候補:
- PreToolUse hook で `game/*/devlog.md` 作成・編集時に「引いた lesson」ブロック存在チェック
- `game/*/brainstorm.md` 作成時に「引いた lesson」ブロック存在チェック
- cross_review コメント生成時に同上

## Linked memories

- `memory/game_lessons_log.md` — INDEX + 系統マップ（本 skill の主データソース）
- `memory/lessons/_appendix.md` — チェックリスト・4ゲート契約・関連ファイル
- `skills/genre-deep-analysis/SKILL.md` — M-38 ハーネス（本 skill と並行起動）
- `memory/feedback_pre_impl_critical_review.md` — M-37 詳細処方
- `memory/feedback_predict_before_human_play.md` — M-37b 詳細処方
