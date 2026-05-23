# graze_log v05.2_cdx_v62

v61 の CHASE popup safe rail を引き継ぎつつ、報酬表示が「邪魔ではないが遠すぎて報酬感が弱い」状態を headless で検出できるようにした版。

## 変更点

- `GAME_VERSION` を `v05_1_cdx_v62` に更新。
- CHASE popup を左右 rail のまま、プレイヤー近傍の y 位置へ寄せる。
- `chasePopupMeanSpawnPlayerDist` / `chasePopupMeanActivePlayerDist` / `chasePopupTooNearPct` / `chasePopupTooFarPct` / `chasePopupSideBalance` を telemetry と matrix に追加。
- focused check と policy matrix に `chasePopupReadabilityMeasured` を追加。
- 敵配置、BOMB、Active DEF、score、CHASE bonus、bot policy は変更しない。

## 実行

ブラウザで `game/graze_log_cdx/v05_1_cdx_v62/index.html` を開く。

## 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v62_check.js
node tools\headless_graze_log_cdx_v05_2_v62_policy_matrix_check.js
```

2026-05-23 実行。両方 pass。
