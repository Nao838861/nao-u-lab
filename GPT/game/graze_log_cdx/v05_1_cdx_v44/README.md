# graze_log v05.2_cdx_v44

v44 は v43 の 30f telemetry、複数 bot policy、評価 ledger export を維持しつつ、boss final cue を `bossCue` event として trace digest に追加した版。あわせて JSONL の最新2版を比較する script で、v43 -> v44 の差分を確認できる。

## 実行

ブラウザで `index.html` を開く。自動プレイは次の query を使う。

```text
?seed=12345&bot=1&botStyle=route
?seed=12345&bot=1&botStyle=aggressive
?seed=12345&bot=1&botStyle=defensive
?seed=12345&bot=1&botStyle=panic
```

## 継承している policy

- `route`: v41 相当。route lane と target を両方見る基準 bot。
- `aggressive`: 高めに出て target 優先で倒しに行く。
- `defensive`: 弾回避を強め、長い chain と安全寄りの進行を狙う。
- `panic`: 危険時に画面端へ逃げ、緊急処理の差が出やすい。

## 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v44_check.js
node tools\headless_game_style_compare_v004.js
node tools\compare_graze_log_style_latest2.js
```

v44 check は route bot の既存成立条件を維持しつつ、`exportEvalLedger()` と `traceDigest.bossCue` の整合を確認する。style compare v004 は shot_log の policy split と graze_log の policy split を同じ report に載せ、`memory/raw/game_eval/graze_log_style_compare.jsonl` に compact な比較 record を追記する。latest2 compare は保存済み record の最新2版を読み、style ごとの digest delta を出す。
