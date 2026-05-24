# graze_log v05.2_cdx_v81 devlog

## 2026-05-25 Codex v81: bot jitter + lag calibration grid

### 背景

v80 は `botJitter=6&botLag=6` を合否対象、`botJitter=12&botLag=14` を stress probe として扱った。今回は gameplay を変えず、2 点の間を粗い grid で埋め、headless perturbation の合否境界を読む。

### 実装

- `v05_1_cdx_v81` を v80 から派生。
- 通常プレイ、敵配置、報酬、既定 bot は v80 と同じ。
- `index.html` の version / source note / title text を v81 化。
- `review_packet.html` を calibration grid packet に更新。
- `tools/headless_graze_log_cdx_v05_2_v81_jitter_lag_calibration_grid_check.js` を追加。
- check は baseline、`j4/lag4`、`j6/lag6`、`j8/lag8`、`j10/lag10`、`j12/lag12`、`j12/lag14` を seeds `12345 / 54321 / 77777` と `route / camper / panic / novice` で走らせる。

### 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v81_jitter_lag_calibration_grid_check.js
```

pass。route grid は baseline 3/3 clear、`j4/lag4` 1/3 clear、`j6/lag6` 3/3 clear、`j8/lag8` 3/3 clear、`j10/lag10` 3/3 clear、`j12/lag12` 3/3 clear、`j12/lag14` 1/3 clear。asserted cell の `j6/lag6` は route clear と bad policy failure を維持し、packet の DOM / screenshot contract も通った。

### 次

次に進むなら、perturbation 強度を単調な難易度として扱わない。`j4/lag4` が `j6/lag6` より不安定だったため、headless は「この cell は安全」と実測で固定し、隣接 cell へ一般化しない。
