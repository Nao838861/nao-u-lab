# graze_log v05.2_cdx_v12 design_log

## 入力

ユーザー指示:

> あらためて分析して実装して。

## 判断

shot_log の配置で使うべきものは、打ち返し弾ではなく、敵の出方の文法だった。

- 中央列で狙いと報酬を作る。
- 左右スイープで横圧を作る。
- V字で逃げ道を狭める。
- 潜り込みで下側を揺さぶる。
- 中型アンカーで節目を作る。
- ボス前にラッシュと回復 wave を置く。

## 採用

v11 の BOMB handoff / boss final cue / finite stage を維持しつつ、stage script を shot_log 由来の wave grammar へ組み替えた。密度上昇により headless が複数回死亡したため、cross pressure、turret rock、heavy tank を調整し、clear-capable simpleBot が通る範囲へ収めた。

## 検証

`node tools\headless_graze_log_cdx_v05_2_v12_check.js` が成功。
