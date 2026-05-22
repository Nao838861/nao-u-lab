# graze_log v05.2_cdx_v56 devlog

## 2026-05-23 Codex v56: density timeline と右バンカー空白の修正

### 背景

ユーザーから、敵と敵弾の数、最低でも 1 秒単位の推移、それを時系列で見た分析を取るべきではないか、という指摘があった。v55 の headless は route coverage、target uptime、pressure、event digest は取っていたが、敵の存在数と撃てる敵の空白を直接数えていなかった。

### 実装

- `densitySnapshot()` を追加し、30 frame ごとに以下を記録した。
  - 画面内の敵数
  - 撃てる敵数
  - 硬い敵数
  - 敵弾数
  - 自機近傍の敵弾数
  - 敵 type 内訳
- `analyzeDensityTimeline()` を追加し、2 sample を 1 秒として集約した。
- summary に `maxNoShootableGapSec` / `maxEmptyScreenGapSec` / `midgameMeanShootable` / `bossApproachMeanShootable` を出した。
- policy matrix に密度指標を保存するようにした。

### 計測で見えた問題

最初の v56 計測では、通常 route でも `RIGHT_BUNKER_RELEASE` 周辺に 4 秒級の空白が出た。aggressive / marksman では敵を早く倒しすぎるため、より長い空白が出た。

これは「敵が少ない」だけでなく、硬い target 後の接続 wave が遅く、プレイヤーが次の意図へ切り替える前に画面が切れる問題だった。

### 反映した修正

以下の authored event を追加した。

- `DP right bunker entry cover`: `HARD_TARGET_REENTRY` から右バンカーへ入る前の接続。
- `DP right bunker chase sweep`: バンカー周辺で右から左へ視線を戻す追撃。
- `DP midboss topoff bridge`: 中ボス警告列に入る前に左右ブリッジで密度を維持。

### 検証結果

```powershell
node tools\headless_graze_log_cdx_v05_2_v56_check.js
node tools\headless_graze_log_cdx_v05_2_v56_policy_matrix_check.js
```

- 通常 headless: pass。
- policy matrix: pass。
- route bot: clear、grade S、routeCoveragePct 1、killCount 192。
- route 単体: `maxEmptyScreenGapSec` 1、`maxNoShootableGapSec` 3、`midgameMeanShootable` 3.48。
- route 平均: `meanMaxEmptyScreenGapSec` 2、`meanMidgameShootable` 3.46。

### 残課題

- marksman / aggressive では敵を早く倒しすぎるため、`REWARD_OBJECT_WITH_COVER` や中ボス feeder にまだ撃てる敵の空白が残る。
- 次は「早く倒した policy ほど追加 relay が出る」または「硬い敵の破壊で即時 follow-up が開く」形にすると、単純な数増やしよりよくなる。
