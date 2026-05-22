# graze_log v05.2_cdx_v61

v60 の `CHASE` 報酬・cooldown・active cap を維持しつつ、`CHASE` popup が敵弾や boss cue に近い時だけ左右の safe rail へ逃がす版。

## 変更点

- `GAME_VERSION` を `v05_1_cdx_v61` に更新。
- `CHASE` popup を kill 位置には重ねず、左右端の safe rail へ表示する。
- `chasePopupRepositioned` / `chasePopupThreatOverlapPct` / `chasePopupBossCueOverlapPct` を telemetry と matrix に追加。
- 敵配置、報酬倍率、bot policy、boss、guide、popup cooldown は v60 から変更していない。

## 実行

ブラウザで `game/graze_log_cdx/v05_1_cdx_v61/index.html` を開く。

headless check:

```powershell
node tools\headless_graze_log_cdx_v05_2_v61_check.js
node tools\headless_graze_log_cdx_v05_2_v61_policy_matrix_check.js
```
