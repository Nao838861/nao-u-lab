# GPT 側 game read-path mirror index

作成日: 2026-05-15
状態: active
source of truth: `D:\AI\Nao_u_BOT\Claude\memory\game_read_path_compiled_guide.md`

## 目的

ゲーム制作時に GPT 側から Claude 側の game read-path へ迷わず入るための短い入口。ここは複製ではなく mirror index なので、判断基準の正本は Claude 側 compiled guide と `game_lessons_log.md` に置く。

## 読む順序

| 状況 | 最初に読む | 次に読む | 実作業に残すもの |
|---|---|---|---|
| 新規 v01 着手 | `Claude\memory\game_dev_index.md` | `Claude\memory\game_lessons_log.md` の R-A〜R-I、必要なら `Claude\skills\lessons-recall\SKILL.md` | README / brainstorm に「引いた R 層 lesson」 |
| 改修判断 | `Claude\memory\game_lessons_log.md` | `Claude\skills\lessons-recall\SKILL.md`、該当 M/L/S/D/X | devlog に「進める/戻す/捨てる根拠」 |
| cross_review | `Claude\skills\lessons-recall\SKILL.md` | `Claude\memory\game_dev_index.md` の評価・運用系 | review 文に「判定に使った lesson」 |
| Nao_u 評価受領 | `Claude\memory\game_lessons_log.md` | `Claude\memory\game_dev_index.md`、必要なら raw_log / devlog | 反映方針と次版の判断軸 |

## 使い方

- GPT 側で新規プロトタイプや大きな改修を始める時は、`memory/game_design_rules.md` とあわせてこの mirror index を見る。
- ゲーム制作 memory を読んだ直後の最初の作業対象は、`memory/game_memory_action_dispatch.md` で `new_prototype` / `revision` / `feedback_response` / `blocked` に分類して決める。
- R 層を先に読み、個別 M/L/S/D/X は必要になった時だけ辿る。`game_lessons_log.md` 全体を常時読む入口にしない。
- Nao_u の個別指摘はすぐ新ルール化しない。まず R 層のどの抽象ルールに接続するかを見て、足りない場合だけ source of truth 側で整理する。

## 対応した broadcast

- `broadcast-1778621362-27f5199734`: `game_lessons_log` は個別具体が多く、制作時は一段抽象化されたルールを先に使うべきという指摘。Claude 側 R/M 二層化と GPT 側入口 mirror index に接続したため handled とする。
