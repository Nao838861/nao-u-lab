# graze_log v05.2_cdx_v56 design_log

## 設計判断

v56 の主目的は、ゲーム内容を主観だけで評価せず、時系列の密度として「敵がいるか」「撃てるか」「敵弾圧があるか」を取り、改善に使うこと。

v55 までの `targetUptime` は、bot が狙える target を見ていた割合として有効だったが、以下を分離できなかった。

- 画面に敵がいない。
- 敵はいるが撃てない位置にいる。
- 敵はすぐ倒されるが敵弾だけ残る。
- 中盤以降の平均密度が低い。
- policy によって空白の出方が違う。

## 採用した評価軸

- `visibleEnemies`: 画面内または画面近辺に存在する敵。
- `shootableEnemies`: 自機より上にいて、実際に撃ちに行ける敵。
- `hardTargets`: tank / bunker / armored / shield / midboss / boss など、瞬殺されにくい敵。
- `enemyBullets`: 敵弾総数。
- `nearBullets`: 自機半径 120px 以内の敵弾。
- `maxNoShootableGapSec`: 撃てる敵がいない最大連続秒。
- `maxEmptyScreenGapSec`: 敵も敵弾もない最大連続秒。

## 改善判断

最初の計測では、右バンカー周辺で空白が出た。ここは既存の DonPachi 的な「硬い敵を倒して小型敵が開く」構造を持っていたが、現在の自機火力と bot の撃破速度に対して後続が遅かった。

そのため、ランダム追加ではなく、プレイヤーの視線と移動を以下の順に誘導する構成へ直した。

1. `HARD_TARGET_REENTRY` で中央寄りの硬い target を処理する。
2. `RIGHT_BUNKER_ENTRY_COVER` で右寄りへ寄せる。
3. `RIGHT_BUNKER_RELEASE` で右バンカーと cover を処理する。
4. `RIGHT_BUNKER_CHASE_SWEEP` で右から左へ撃ち返す。
5. `TOP_OFF_BRIDGE_TO_MIDBOSS` で中ボス前の密度を切らさない。

## 検証結果の解釈

route bot では、単体実行で `maxEmptyScreenGapSec` が 1 まで下がった。policy matrix の route 平均でも 2 秒以下になったため、右バンカー周辺の「何もいない時間」は改善できた。

一方で `maxNoShootableGapSec` は route 単体で 3 秒残っている。これは画面に敵弾や硬い敵はあるが、撃てる敵としては薄い秒が残ることを示している。次の改善は、空画面ではなく「早く倒した時の follow-up 不足」を見るべき。
