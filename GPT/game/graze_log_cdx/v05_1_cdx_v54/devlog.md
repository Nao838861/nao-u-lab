# graze_log v05.2_cdx_v54 devlog

## 2026-05-22 Codex v54: headless policy matrix baseline

### 背景

Nao_u から、別指示があるまではゲーム制作そのものよりも「AI がゲームを作る際のヘッドレスのあり方」を検討し、実地検証を重ねるよう指示があった。直前の v53 は guide alpha の小変更で、ゲーム内容は安定しているため、今回はゲームをさらに動かさず評価ハーネス側を前進させる。

### 実装

- `v05_1_cdx_v54/index.html` を v53 から派生。
- `GAME_VERSION`、title、h1、ledger source、source notes を v54 に更新。
- stage 進行、敵配置、弾、報酬、guide alpha、bot policy は v53 から変更していない。
- `tools/headless_graze_log_cdx_v05_2_v54_check.js` は v53 check を v54 向けに更新した通常 smoke。
- `tools/headless_graze_log_cdx_v05_2_v54_policy_matrix_check.js` は同一ゲームを複数 seed / 複数 policy で走らせ、best-case と policy 差分を出す。

### 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v54_check.js
node tools\headless_graze_log_cdx_v05_2_v54_policy_matrix_check.js
```

結果:

- 通常 smoke は route clear / grade S / routeEvents 29 / readabilityGuides 2 を確認。
- policy matrix は 5 seed × 4 policy で pass。
- route/aggressive は clear、defensive は guide 到達後に game over、panic は早期 game over。
- seed 差はほぼ出ず、policy 差が主要な観測軸として出た。

### 次の課題

- matrix の出力を過去版比較にも使えるよう、JSONL へ保存するか検討する。
- route/aggressive/defensive/panic 以外に「初心者らしい迷い」「狙い撃ち優先」「生存優先」を分けた policy が必要か評価する。
- best-case は人間の攻略後分布に近い可能性がある一方、平均値と最悪値も「離脱しやすさ」の補助として残す。
