# graze_log v05.2_cdx_v51

v51 は v50 の stage / enemy / bullet / bot policy / evaluation ledger を維持し、2 本の lane guide から chevron を削った版。

## 遊び方

`index.html` をブラウザで開く。

- 矢印キー / WASD: 移動
- Space / B: BOMB
- Shift / X: Active DEF
- `?bot=1&botStyle=route`: route bot
- `?bot=1&botStyle=aggressive|defensive|panic`: 比較用 bot policy

## 変更点

- `GAME_VERSION` を `v05_1_cdx_v51` に更新。
- v50 の `GUIDE_ALPHA=0.10` / `GUIDE_LINE_WIDTH=2.2` / post-midboss 2 path は維持。
- `drawGuide()` の chevron 描画を削除。
- guide event に `chevrons:false` を記録。

目的は、横移動 wave の「敵の通る faint path」は残しつつ、プレイヤーが矢印記号を追う構図へ寄るのを避けること。

## 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v51_check.js
node tools\headless_graze_log_cdx_v05_2_v51_visual_check.js
node tools\headless_game_style_compare_v011.js
node tools\compare_graze_log_style_latest2.js
```

v51 check は route bot の clear / grade S / BOMB 使用を維持しつつ、`traceDigest.crossLockGuide === 1`、`traceDigest.postMidCrossGuide === 1`、`traceDigest.readabilityGuides === 2`、guide event の `alpha === 0.10`、`lineWidth === 2.2`、`chevrons === false`、path 数 2 を確認する。

visual check は実ブラウザ操作ツールがない場合の補助として、guide が出ている frame の canvas draw command を記録し、guide stroke が path 本数分だけ描かれ、chevron 由来の追加 stroke がないことを確認する。
