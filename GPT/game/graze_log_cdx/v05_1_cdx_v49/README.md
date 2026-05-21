# graze_log v05.2_cdx_v49

v49 は v48 の stage / bot policy / evaluation ledger を維持し、v47/v48 で追加した 2 本の手作り横移動 wave に視認性レイヤを足した版。

対象 wave:

- `t=3040` の `DP post-midboss cross squeeze`
- `t=3820` の `DP cross-lock carrier braid`

変更点は、wave 開始時に薄い lane guide を出し、該当 wave の敵色を通常敵と分けたこと。目的は、敵が完全に画面へ入る前に「左右から交差して中央を絞る」形を読めるようにすること。

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
node tools\headless_graze_log_cdx_v05_2_v49_check.js
node tools\headless_game_style_compare_v009.js
node tools\compare_graze_log_style_latest2.js
```

v49 check は route bot の clear / grade S / BOMB 使用を維持しつつ、`traceDigest.crossLockGuide === 1`、`traceDigest.postMidCrossGuide === 1`、`traceDigest.readabilityGuides === 2` を確認する。
