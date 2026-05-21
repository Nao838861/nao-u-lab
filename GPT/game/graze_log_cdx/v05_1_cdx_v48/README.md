# graze_log v05.2_cdx_v48

v48 は v47 の 30f telemetry、複数 bot policy、評価 ledger export、boss cue steering、boss 前 cross-lock wave を維持しつつ、midboss 後に 2 本目の手作り横移動 wave を追加した版。

追加 wave は `t=3040` の `DP post-midboss cross squeeze`。2 体の tank が左右から交差し、10 体の heli が遅延して斜めに抜ける。目的は midboss 後の left/right chain が単なる回収列で終わらず、次の shield wall 前に横移動の読みを作ること。

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
node tools\headless_graze_log_cdx_v05_2_v48_check.js
node tools\headless_game_style_compare_v008.js
node tools\compare_graze_log_style_latest2.js
```

v48 check は route bot の成立条件を維持しつつ、`traceDigest.postMidCrossWave === 1` と `DP post-midboss cross squeeze` の route 到達を確認する。style compare v008 は `memory/raw/game_eval/graze_log_style_compare.jsonl` に v48 record を追記する。
