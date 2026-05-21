# graze_log v05.2_cdx_v48 devlog

## 2026-05-22 Codex v48: post-midboss cross-squeeze wave

### 背景

v47 で boss 前に `DP cross-lock carrier braid` を追加し、trace でも `crossLockWave` を確認できた。継続 directive の次焦点は「cross-lock wave が読めるかを見る」または「同じ密度の手作り wave を midboss 前後へ広げる」。今回は 1 サイクルの playable diff として後者を選び、midboss 後の 2920-3290f 帯へ同系統の横移動判断を追加した。

### 実装

- `v05_1_cdx_v48/index.html` を v47 から派生。
- 表示名、`GAME_VERSION`、`exportEvalLedger().source` を v48 に更新。
- `t=3040` に `DP post-midboss cross squeeze` route event を追加。
- `spawnPostMidCrossSqueeze()` を追加し、2 体の crossing tank と 10 体の delayed heli lock を約 300 frame の wave として出す。
- `recordEvalEvent('postMidCrossWave', { tanks: 2, helis: 10, duration: 300 })` を追加。
- `traceDigest.postMidCrossWave` を追加。
- `tools/headless_graze_log_cdx_v05_2_v48_check.js` を追加し、route 到達、clear、ledger、postMidCrossWave trace を検証する。
- `tools/headless_game_style_compare_v008.js` を追加し、v48 record を JSONL に追記する。
- `tools/compare_graze_log_style_latest2.js` を更新し、latest2 delta に `postMidCrossWave` を含めた。

### 戻す場合

v48 directory と v48/v008 script を削除し、`tools/compare_graze_log_style_latest2.js` の `postMidCrossWave` delta を戻す。v47 の boss 前 cross-lock wave、boss cue steering、policy split、ledger export は変更していない。

### 次の課題

- post-midboss cross-squeeze が人間に横移動判断として読めるかはブラウザで確認する。
- tank 2 体が弾圧を増やすため、route clear が維持されても人間には過密な可能性がある。
- 次版では、v47/v48 の wave を人間視認性優先で調整するか、midboss 前にも同密度の wave を足して前後の比較を作る。
