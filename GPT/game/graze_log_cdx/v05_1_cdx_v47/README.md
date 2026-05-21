# graze_log v05.2_cdx_v47

v47 は v46 の 30f telemetry、複数 bot policy、評価 ledger export、`bossCueSteer` を維持しつつ、boss 前に手作りの cross-lock wave を追加した版。

追加 wave は `t=3820` で発火し、2 体の stock carrier が左右から交差し、8 体の heli が遅延して斜めに抜ける。目的は boss cue の深追いではなく、道中後半に横移動の判断を作ること。

## 実行

ブラウザで `index.html` を開く。自動プレイは次の query を使う。

```text
?seed=12345&bot=1&botStyle=route
?seed=12345&bot=1&botStyle=aggressive
?seed=12345&bot=1&botStyle=defensive
?seed=12345&bot=1&botStyle=panic
```

## 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v47_check.js
node tools\headless_game_style_compare_v007.js
node tools\compare_graze_log_style_latest2.js
```

v47 check は route bot の既存成立条件を維持しつつ、`traceDigest.crossLockWave === 1` と `DP cross-lock carrier braid` の route 到達を確認する。style compare v007 は `memory/raw/game_eval/graze_log_style_compare.jsonl` に v47 record を追記する。
