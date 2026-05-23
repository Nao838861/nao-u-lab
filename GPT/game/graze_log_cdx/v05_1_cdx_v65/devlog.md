# graze_log v05.2_cdx_v65 devlog

## 2026-05-24 Codex v65: 通常 UI review surface probe

### 背景

v64 は bare canvas screenshot の CHASE popup pixel 検査まで行った。ただし、次に人間目視へ渡す通常 UI 付き URL では、ヘッダーや seed 表示によって canvas が viewport 内でどう配置されるか、popup が viewport 座標でも検査できるかをまだ確認していなかった。

今回の主眼はゲーム内容の変更ではなく、headless が人間評価前にどの surface を保証するべきかの実地検証である。

### 実装

- v64 を `v05_1_cdx_v65` にコピー。
- `probeReview=1` を追加し、通常 UI を残した review 用 layout を固定した。
- `visualContract.reviewUi` を追加した。
- visual probe check に通常 UI 付き screenshot 検査を追加した。
- gameplay、wave、bot policy、score、reward は変更していない。

### 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v65_check.js
node tools\headless_graze_log_cdx_v05_2_v65_policy_matrix_check.js
node tools\headless_graze_log_cdx_v05_2_v65_visual_probe_check.js
```

### 結果

3 本とも pass。

- focused check: route bot clear、`chaseBonus 19157`、`chasePopupCount 28`、`chasePopupMeanSpawnPlayerDist 148.3`、`chasePopupMeanActivePlayerDist 157`。
- policy matrix: route/aggressive/marksman は clear し CHASE bonus を得る。camper は clear 0 / CHASE bonus 0。
- visual probe: bare canvas 4 枚は `chasePixels 27` / `lumaGap 86.1-86.8`。通常 UI review 2 枚は `canvasRect.y 56` / `chasePixels 14` / `lumaGap 88.5`。

通常 UI では anti-alias とページ合成により、同じ CHASE 文字でも検出される緑ピクセル数が bare canvas の 27 から 14 に減った。輝度差は 88.5 と十分だったため、review surface 側は「viewport 内に文字が存在する最低保証」として別閾値にした。これは報酬感の判定ではない。
