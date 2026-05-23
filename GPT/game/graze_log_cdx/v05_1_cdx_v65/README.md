# graze_log v05.2_cdx_v65

v64 の gameplay を維持し、CHASE popup を人間目視へ渡す前の「通常 UI 付きスクリーンショット surface」を headless で検査する版。

## 変更点

- `GAME_VERSION` を `v05_1_cdx_v65` に更新。
- `probeReview=1` を追加し、通常 UI を残したまま 420px 幅の review surface を固定する。
- `window.__probe.visualContract.reviewUi` を追加する。
- `tools/headless_graze_log_cdx_v05_2_v65_visual_probe_check.js` で、従来の bare-canvas pixel probe に加えて、通常 UI 付き 420x720 screenshot の canvas 位置と CHASE popup viewport pixel を検査する。
- 敵配置、弾、BOMB、Active DEF、score、CHASE bonus、bot policy は変更しない。

## 実行

ブラウザで `game/graze_log_cdx/v05_1_cdx_v65/index.html` を開く。

目視 review probe 例:

```text
game/graze_log_cdx/v05_1_cdx_v65/index.html?seed=12345&bot=1&botStyle=route&probeFrame=838&probeDraw=1&probeReview=1
```

pixel probe 用:

```text
game/graze_log_cdx/v05_1_cdx_v65/index.html?seed=12345&bot=1&botStyle=route&probeFrame=838&probeDraw=1&probeBare=1
```

## 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v65_check.js
node tools\headless_graze_log_cdx_v05_2_v65_policy_matrix_check.js
node tools\headless_graze_log_cdx_v05_2_v65_visual_probe_check.js
```
