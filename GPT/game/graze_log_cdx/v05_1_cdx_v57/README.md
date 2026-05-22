# graze_log v05.2_cdx_v57

v57 は v56 の時系列密度計測を使い、shot_log 系との比較から `graze_log_cdx` 側の敵密度を調整した版です。

v56 は route bot の中盤 `midgameMeanShootable` が約 3.46、敵弾が約 3.79、空画面が最大 2 秒で、画面に敵が残り続ける最低密度が足りませんでした。一方、Claude 側 shot_log は中盤の撃てる敵が 16 体台、敵弾が 30 発台で、これは撃ち返し弾と連射主体の別ゲームとして成立している密度です。

そのため v57 では shot_log の数値をそのまま移植せず、`graze_log_cdx` の回避・グレイズ・硬い目標の読みやすさを残すために、以下を狙い値にしました。

- 中盤の撃てる敵: 5-6 体程度
- 中盤の敵弾: 12 発以下
- 空画面: 最大 1 秒以内
- 敵弾を増やすのではなく、撃たない接続敵と追撃列で密度を上げる

## 遊び方

`index.html` をブラウザで開きます。

- 矢印キー / WASD: 移動
- Space / B: BOMB
- Shift / X: Active DEF
- `?bot=1&botStyle=route`: route bot
- `?bot=1&botStyle=aggressive|defensive|panic|novice|marksman|survival`: 比較用 bot policy
- `?probeFrame=3090&probeDraw=1`: 指定 frame の描画確認

## v57 の変更点

- `GAME_VERSION` を `v05_1_cdx_v57` に更新。
- v56 で薄かった中盤からボス前までに、撃たない connector / cover / tail row を追加。
- 右バンカー、armored gate、中ボス前 feeder、post-mid、final bunker、boss approach の接続密度を上げた。
- 単体ヘッドレスに `calibratedDensity` 判定を追加し、中盤密度・敵弾上限・空画面を同時に見るようにした。
- policy matrix は route / aggressive / defensive / panic / novice / marksman / survival の複数 bot で密度と到達率を比較する。

## 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v57_check.js
node tools\headless_graze_log_cdx_v05_2_v57_policy_matrix_check.js
```

2026-05-23 実行結果:

- 通常 headless: pass。route bot clear、grade S、routeCoveragePct 1。
- route 単体: `midgameMeanShootable` 5.62、`midgameMeanBullets` 3.25、`maxNoShootableGapSec` 1、`maxEmptyScreenGapSec` 1。
- policy matrix route 平均: `meanMidgameShootable` 5.27、`meanMidgameBullets` 4.23、`meanMaxNoShootableGapSec` 1、`meanMaxEmptyScreenGapSec` 1。

## 残課題

敵のいない時間と中盤密度は改善した一方、killCount 309、maxChain 108、score 718370 まで伸びています。次は単純な密度追加ではなく、スコア・チェーンの伸びすぎ、aggressive / marksman が早く倒しすぎた時の局所空白、ボス前の報酬密度を調整する必要があります。
