---
name: game_read_path_compiled_guide
description: 新ゲーム制作、改修判断、cross_review、Nao_u評価受領時に、game_dev_index / game_lessons_log / lessons-recall のどれを先に読むかを決める compiled guide。
type: memory
status: active
lifecycle: compiled
created_at: 2026-05-14
---

# ゲーム制作 read-path compiled guide

## いつ読むか

- 新しい `game/<id>/v01/` を作る前。
- 既存ゲームの vN から vN+1 へ進めるか、巻き戻すか、捨てるかを決める前。
- `game/cross_review/` に出す前、または他インスタンスの案を評価する前。
- Nao_u のプレイ評価や #game-rights の指摘を受け取った直後。
- `game_dev_index.md`、`game_lessons_log.md`、`lessons-recall` のどれを先に開くか迷ったとき。

## 結論

ゲーム制作の読み道は、状況で分ける。

| 状況 | 最初に読む | 次に読む | 出力へ残すもの |
|---|---|---|---|
| 新規 v01 着手 | `game_dev_index.md` | `game_lessons_log.md` の R-A〜R-I、必要なら `lessons-recall` | README / brainstorm に「引いた lesson」 |
| 改修判断 | `game_lessons_log.md` | `lessons-recall`、該当する M/L/S/D/X | devlog に「進める/戻す/捨てる根拠」 |
| cross_review | `lessons-recall` | `game_dev_index.md` の評価・運用系 | review 文に「判定に使った lesson」 |
| Nao_u 評価受領 | `game_lessons_log.md` | `game_dev_index.md`、必要なら raw_log/devlog | 反映方針と次版の判断軸 |

`game_dev_index.md` は「入口の地図」。  
`game_lessons_log.md` は「抽象化済みの経験」。  
`lessons-recall` は「判断直前に該当 lesson を引く手順」。

## 1. 新規 v01 着手

最初に `game_dev_index.md` を開く。理由は、v01 ではゲームの中心、着手前ゲート、似たゲーム調査、人間プレイ前の自己判断がまだ未確定だから。

次に `game_lessons_log.md` の R-A〜R-I を読む。ここで全 M-XX を読む必要はない。R 層で引っかかったものだけ、`lessons-recall` か個別 lesson へ進む。

最低限、README または brainstorm に次を残す。

```markdown
## 引いた lesson

- 入口: game_dev_index.md
- R 層: R-__ / R-__
- 個別 lesson: M-__ / S-__ / X-__
- 今回の判断への反映: ___
```

## 2. 改修判断

最初に `game_lessons_log.md` を開く。理由は、改修時の失敗は「新しい設計知識不足」よりも、過去に踏んだ同型失敗の再発であることが多いから。

次に `lessons-recall` を使って、該当する M/L/S/D/X を絞る。特に次を優先する。

- 巻き戻し・捨てる判断: M-11, M-15, L-01, L-02, X-03
- 体験の中心が壊れている: R-A, M-14, M-15, M-17, M-36
- 数値テストが勝っているが面白くない: M-37b, M-40, won_playtest 系
- 実装を増やせば直る気がしている: feedback_rule_proliferation_canonical.md も読む

devlog には「何を変えるか」だけでなく、「どの lesson により、進める/戻す/捨てるのどれを選んだか」を残す。

## 3. cross_review

最初に `lessons-recall` を起動する。理由は、cross_review は丁寧な文章を書くほど、判断をレビュー相手に委ねる形になりやすいから。

review 文には、少なくとも次を含める。

- 判定に使った lesson ID。
- 自分が 95% まで判断した結論。
- 相手に確認してほしい点。
- 相手に判断を丸投げしていないこと。

`cross_review` は判定装置ではなく、最終確認装置として使う。

## 4. Nao_u 評価受領

最初に `game_lessons_log.md` を開く。理由は、Nao_u の評価を個別指摘のまま即ルール化すると、同型の失敗を吸収できないから。

次に `game_dev_index.md` で、該当する feedback / reference / project note へ降りる。必要なら対象ゲームの raw_log / devlog へ戻る。

出力には次を残す。

```markdown
## Nao_u 評価の反映

- 原指摘:
- 対応する既存 lesson / feedback:
- 今回だけの修正:
- 今後も使う抽象化:
- ルール化しない理由 / ルール化する理由:
```

個別指摘をすぐ M-XX や Protocol にしない。3回以上の同型再発、または重大事故の予防に必要な場合だけ上層へ上げる。

## 読みすぎ防止

新規 v01 と改修判断で、全部を読む必要はない。

- `game_dev_index.md`: 入口。最初に 3 分でスキャン。
- `game_lessons_log.md`: R 層を読む。必要な R だけ詳細へ。
- `lessons-recall`: 判断直前に 2〜5 件の lesson ID へ絞る。
- 個別 lesson: 判断に直接ぶつかるものだけ読む。

「読んだ量」ではなく、「出力の判断が変わったか」で読む価値を判定する。

## 出典

- `Claude/memory/game_dev_index.md`
- `Claude/memory/game_lessons_log.md`
- `Claude/skills/lessons-recall/SKILL.md`
- `Claude/memory/feedback_judgment_postpone_patterns.md`
- `Claude/memory/feedback_rule_proliferation_canonical.md`
- `Claude/memory/memory_operation_compiled_guide.md`
