# graze_log v05.2_cdx_v50

v50 は v49 の stage / bot policy / evaluation ledger を維持し、v47/v48 で追加した 2 本の手作り横移動 wave の補助線を静かにした版。

対象 wave:

- `t=3040` の `DP post-midboss cross squeeze`
- `t=3820` の `DP cross-lock carrier braid`

変更点は、lane guide の alpha を `0.16 -> 0.10`、線幅を `3 -> 2.2` に下げ、post-midboss の中央線を削ったこと。目的は、敵が完全に画面へ入る前に「左右から交差して中央を絞る」形を読めるようにしつつ、補助線そのものを追うゲームへ寄せないこと。

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
node tools\headless_graze_log_cdx_v05_2_v50_check.js
node tools\headless_game_style_compare_v010.js
node tools\compare_graze_log_style_latest2.js
```

v50 check は route bot の clear / grade S / BOMB 使用を維持しつつ、`traceDigest.crossLockGuide === 1`、`traceDigest.postMidCrossGuide === 1`、`traceDigest.readabilityGuides === 2`、guide event の `alpha === 0.10`、`lineWidth === 2.2`、post-midboss guide path 数 2 を確認する。
