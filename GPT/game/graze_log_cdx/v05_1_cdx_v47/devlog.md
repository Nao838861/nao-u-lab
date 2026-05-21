# graze_log v05.2_cdx_v47 devlog

## 2026-05-22 Codex v47: pre-boss cross-lock wave

### 背景

v46 で boss final cue は `bossCueSteer` まで trace に入った。次は cue 周辺を深追いせず、directive の焦点にあった「道中敵配置の本質変更」へ戻す。対象は boss 前の 3680-4140f 帯で、既存の stock 補給から boss approach までがまだ横移動判断として弱かった。

### 実装

- `v05_1_cdx_v47/index.html` を v46 から派生。
- 表示名、`GAME_VERSION`、`exportEvalLedger().source` を v47 に更新。
- `t=3820` に `DP cross-lock carrier braid` route event を追加。
- `spawnCrossLockCarriers()` を追加し、2 体の crossing stock carrier と 8 体の delayed heli lock を約 330 frame の wave として出す。
- `recordEvalEvent('crossLockWave', { carriers: 2, helis: 8, duration: 330 })` を追加。
- `traceDigest.crossLockWave` を追加。
- `tools/headless_graze_log_cdx_v05_2_v47_check.js` を追加し、route 到達、clear、ledger、crossLockWave trace を検証。
- `tools/headless_game_style_compare_v007.js` を追加し、v47 record を JSONL に追記。
- `tools/compare_graze_log_style_latest2.js` を更新し、latest2 delta に `crossLockWave` を含めた。

### 戻す場合

v47 directory と v47/v007 script を削除し、`tools/compare_graze_log_style_latest2.js` の `crossLockWave` delta を戻す。v46 の boss cue steering、policy split、ledger export は変更していない。

### 次の課題

- cross-lock wave が人間に「横移動判断」として読めるかはブラウザで確認する。
- headless の pressure / movementSwitches が上がっても、それだけで良い wave とは断定しない。
- 次版では、この wave の視認性を改善するか、midboss 前後にも同じ密度の手作り wave を入れる。
