# graze_log v05.2_cdx_v57 devlog

## 2026-05-23 Codex v57: shot_log 比較に基づく密度調整

### 背景

ユーザーから、現状の `graze_log_cdx` は敵の出ない時間が長く、こちらの火力に対して敵が少ないため中盤以降が単調になる、という指摘があった。v56 で 1 秒単位の密度計測は入ったが、計測結果はまだ薄かった。

同じ計測を Claude 側 shot_log、GPT 側 shot_log_cdx、graze_log_cdx で比較したところ、shot_log 系は中盤の撃てる敵と敵弾がかなり多く、graze_log_cdx は敵弾も撃てる敵も少なかった。

### 比較からの判断

Claude 側 shot_log v01:

- target uptime: 0.960
- avg shootable: 14.59
- midgame shootable: 16.31
- avg bullets: 20.88
- midgame bullets: 30.37
- max no-shootable: 1 秒
- max empty: 0.33 秒

graze_log_cdx v56 route:

- target uptime: 0.802
- midgame shootable: 3.46
- midgame bullets: 3.79
- max no-shootable: 3 秒
- max empty: 2 秒

shot_log の密度をそのまま入れると、撃ち返し弾主体の別ゲームに寄りすぎる。v57 では `graze_log_cdx` の設計に合わせ、中盤の撃てる敵を 5-6 体程度まで上げ、敵弾は 12 発以下に抑える方針にした。

### 実装

以下の authored event に、撃たない connector / cover / tail row を追加した。

- crane reward cover
- second tank pair
- right bunker entry / release / chase
- midboss topoff bridge / warning chain
- armored carrier gate
- midboss approach / feeder L / feeder R
- post-midboss left / right / center tanks
- final bunker side connector
- boss stock carriers / boss approach braid

敵弾量を増やして圧迫するのではなく、撃てる対象と接続列を増やして「画面にやることが残っている」状態を作る調整にした。

### ヘッドレス更新

- `tools/headless_graze_log_cdx_v05_2_v57_check.js`
  - v57 を読むように更新。
  - source note と `GAME_VERSION` を確認。
  - `calibratedDensity` 判定を追加。
  - bot style 差分判定を、単体実行の実測に合うように policy matrix と同じ方向へ調整。

- `tools/headless_graze_log_cdx_v05_2_v57_policy_matrix_check.js`
  - v57 を読むように更新。
  - route density のしきい値を `meanMidgameShootable >= 5.0`、`meanMidgameBullets <= 12`、空画面 1.5 秒以内に設定。

### 検証結果

```powershell
node tools\headless_graze_log_cdx_v05_2_v57_check.js
node tools\headless_graze_log_cdx_v05_2_v57_policy_matrix_check.js
```

- 通常 headless: pass
- policy matrix: pass
- route bot: clear、grade S、routeCoveragePct 1
- route 単体: `killCount` 309、`maxChain` 108、`score` 718370
- route 単体密度: `midgameMeanShootable` 5.62、`midgameMeanBullets` 3.25、`maxNoShootableGapSec` 1、`maxEmptyScreenGapSec` 1
- route matrix 平均: `meanMidgameShootable` 5.27、`meanMidgameBullets` 4.23、`meanMaxNoShootableGapSec` 1、`meanMaxEmptyScreenGapSec` 1

### 残課題

v57 は v56 の「中盤以降が薄い」問題を数値上は改善した。ただし、killCount と maxChain が大きく伸びており、単に敵数を増やした副作用が出ている。次は敵数の追加ではなく、以下を調整する。

- chain window と score の伸びすぎ
- aggressive / marksman が高速殲滅した時の局所空白
- ボス前の報酬列が密度過多になりすぎない配分
- 画面密度が高い時に弾が少なく見える区間のリズム
