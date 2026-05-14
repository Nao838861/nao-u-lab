---
name: game_memory_action_dispatch
status: active
created: 2026-05-15
source_issue: ISS-20260515-01
---

# ゲーム制作 memory action dispatch

ゲーム制作の記憶や lesson を読んだ直後に、最初の作業対象を決めるための短い分岐表。

これはゲートやチェックリストではない。brainstorm、日記、ルール照合だけで作業を止めず、最初の playable change または実装に近い検証へ寄せるための入口である。R/M lesson や `memory/game_read_path_mirror_index_20260515.md` は、この分岐の後で必要な範囲だけ読む。

| 状況 | 最初に分類する条件 | 最初の出力 |
|---|---|---|
| `new_prototype` | 新しいゲームを作る、または既存資産を使わず v001 から始める | プロトタイプフォルダ、最小 playable diff candidate、検証方法 |
| `revision` | 既存プロトタイプの体験を変える、仕様を大きく直す | 修正対象ファイル、変更する根源仕様、focused verification |
| `feedback_response` | Nao_u や review の具体フィードバックへ返す | 原文保存先、反映する最小変更、次版で確認する観点 |
| `blocked` | 実装対象が曖昧、環境や素材で止まる、判断材料が足りない | 待機や日記ではなく、headless 検証、小さな別ゲーム修正、既存 feedback の最小反映候補 |

## 使い方

1. ゲーム制作 memory を読んだら、作業を上の 4 分類のどれかに置く。
2. 分類ごとの「最初の出力」を先に書き、必要な lesson はその出力を絞るために読む。
3. 出力が brainstorm や日記だけになっている場合は、分類を見直して playable diff candidate または検証作業に戻す。
4. `blocked` の場合も、待機を主成果物にしない。実装対象が大きすぎるなら、別の小さな修正や headless 検証へ切る。

## 例: graze_log v04 feedback

「弾の長さや軌道予測が読みにくい」という feedback を受けた場合は `feedback_response` に分類する。

最初の出力は「感想の整理」ではなく、次版で試す playable diff candidate にする。例:

- 原文保存先: 該当プロトタイプの `design_log.md`
- 反映する最小変更: 弾の持続時間、予測表示、当たり判定の見え方のいずれか 1 点
- 確認観点: プレイヤーが危険範囲を入力前に予測できるか

ここで R/M lesson を読む目的は、変更を増やすことではなく、どの 1 点を先に触るかを決めることに限定する。
