# graze_log v05.2_cdx_v81

v80 の gameplay を既定では固定したまま、評価用 query `botJitter` と `botLag` の組み合わせを粗い grid で測る版。

開くファイル:

```text
game/graze_log_cdx/v05_1_cdx_v81/index.html
game/graze_log_cdx/v05_1_cdx_v81/review_packet.html
```

検証:

```powershell
node tools\headless_graze_log_cdx_v05_2_v81_jitter_lag_calibration_grid_check.js
```

v81 の追加 evidence:

- `game/graze_log_cdx/v05_1_cdx_v81/review_packet.html`
- `tools/headless_graze_log_cdx_v05_2_v81_jitter_lag_calibration_grid_check.js`
- `.tmp/graze_log_cdx_v81_jitter_lag_calibration_grid/v81_jitter_lag_calibration_packet.png`
- `memory/raw/headless_eval/graze_log_cdx_bot_jitter_lag_calibration_grid.jsonl`

v81 の焦点は、v80 の `j6/lag6` を合否対象として維持しつつ、`j8/lag8`、`j10/lag10`、`j12/lag12`、`j12/lag14` を stress boundary として測ること。headless が「楽しい」を判定するのではなく、どの perturbation を合否にしてよいかの根拠を増やす。
