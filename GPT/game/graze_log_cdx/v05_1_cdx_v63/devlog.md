# graze_log v05.2_cdx_v63 devlog

## 2026-05-23 Codex v63: CHASE popup visual probe

### 背景

v62 で CHASE popup の距離指標は pass した。ただし、人間が報酬表示として読めるかは headless の平均距離だけでは決められない。今回は実機/Browser 確認へ接続するため、gameplay は変えずに `probeFrame` の観測情報を増やした。

### 実装

- `GAME_VERSION` / title / source を `v05_1_cdx_v63` に更新。
- `makeProbeSnapshot()` を追加し、`probeFrame` + `probeDraw=1` の `window.__probe` に CHASE popup の座標、推定 box、player distance、HUD 近接、canvas 内判定、readable boolean を出すようにした。
- focused check で、実際に発生した CHASE popup event の frame を再生し、snapshot が readable 条件を満たすことを検証するようにした。
- Chrome/Edge headless の visual probe check を追加した。
- 敵配置、弾、BOMB、Active DEF、score、CHASE bonus、bot policy は変更していない。

### 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v63_check.js
node tools\headless_graze_log_cdx_v05_2_v63_policy_matrix_check.js
node tools\headless_graze_log_cdx_v05_2_v63_visual_probe_check.js
```

### 結果

3 本とも pass。

- focused check: route bot clear、`chaseBonus 19157`、`chasePopupCount 28`、`chasePopupMeanSpawnPlayerDist 148.3`、`chasePopupMeanActivePlayerDist 157`、`chasePopupTooFarPct 0`、`chasePopupVisualProbe true`。
- policy matrix: route/aggressive/marksman は CHASE bonus を得る。camper は clear 0 / CHASE bonus 0。
- visual probe: Chrome headless で 4 screenshot を `.tmp/graze_log_cdx_v63_chase_probe/` に生成し、bytes check pass。

### 次の確認点

Browser Use の Node REPL が使える時に、`probeFrame=906&probeDraw=1` などを in-app browser で開き、CHASE popup が報酬として読めるかを人間目視で確認する。
