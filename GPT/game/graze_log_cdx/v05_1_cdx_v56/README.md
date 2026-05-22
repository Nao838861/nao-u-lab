# graze_log v05.2_cdx_v56

v56 は v55 の headless policy matrix を引き継ぎつつ、1 秒単位の密度タイムラインを追加した版です。目的は、`targetUptime` だけでは見えない「敵がいない時間」「撃てる敵がいない時間」「敵弾圧の推移」を検出し、その結果をステージ修正に直接使うことです。

## 遊び方

`index.html` をブラウザで開きます。

- 矢印キー / WASD: 移動
- Space / B: BOMB
- Shift / X: Active DEF
- `?bot=1&botStyle=route`: route bot
- `?bot=1&botStyle=aggressive|defensive|panic|novice|marksman|survival`: 比較用 bot policy
- `?probeFrame=3090&probeDraw=1`: 指定 frame の描画確認

## v56 の変更点

- `summarizeEvalTelemetry()` に `densityAnalysis` を追加。
- 30 frame サンプルを 1 秒単位へ集約し、`visibleEnemies` / `shootableEnemies` / `enemyBullets` / `nearBullets` / `kills` / `phase` を時系列で出す。
- `maxNoShootableGapSec` と `maxEmptyScreenGapSec` を top-level summary に出す。
- policy matrix JSONL に、各 policy の中盤平均密度、ボス前平均密度、最大空白秒を保存する。
- 計測で見つかった `RIGHT_BUNKER_RELEASE` 周辺の空白を、3 つの authored event で補強した。

## 追加したステージイベント

- `DP right bunker entry cover`: 右バンカーへ入る前の接続列。
- `DP right bunker chase sweep`: 右バンカー破壊後に左へ追わせる追撃列。
- `DP midboss topoff bridge`: 中ボス前へ密度を切らさずつなぐ左右ブリッジ。

## 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v56_check.js
node tools\headless_graze_log_cdx_v05_2_v56_policy_matrix_check.js
```

2026-05-23 実行結果:

- 通常 headless: pass。route bot clear、grade S、routeCoveragePct 1。
- route 単体の密度: `maxEmptyScreenGapSec` 1、`maxNoShootableGapSec` 3、`midgameMeanShootable` 3.48。
- policy matrix: pass。route 平均 `meanMaxEmptyScreenGapSec` 2、`meanMidgameShootable` 3.46。
- 追加前に出ていた `RIGHT_BUNKER_RELEASE` の 4 秒級空白は、route 平均で 2 秒以下まで下がった。
