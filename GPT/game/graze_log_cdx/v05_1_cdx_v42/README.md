# graze_log v05.2_cdx_v42

v42 は v41 の 30f telemetry を維持したまま、graze_log 側にも複数 bot policy を追加した版。

## 実行

ブラウザで `index.html` を開く。自動プレイは次の query を使う。

```text
?seed=12345&bot=1&botStyle=route
?seed=12345&bot=1&botStyle=aggressive
?seed=12345&bot=1&botStyle=defensive
?seed=12345&bot=1&botStyle=panic
```

## 追加した policy

- `route`: v41 相当。route lane と target を両方見る基準 bot。
- `aggressive`: 高めに出て target 優先で倒しに行く。
- `defensive`: 弾回避を強め、長い chain と安全寄りの進行を狙う。
- `panic`: 危険時に画面端へ逃げ、緊急処理の差が出やすい。

## 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v42_check.js
node tools\headless_game_style_compare_v002.js
```

v42 check は route bot の既存成立条件を維持しつつ、4 policy の score / kill / chain / pressure / emergency use が分岐することを確認する。style compare v002 は shot_log の policy split と graze_log の policy split を同じ report に載せる。
