# graze_log v05.2_cdx_v64

v63 の gameplay を維持し、CHASE popup の実ブラウザ確認を「スクリーンショットが生成された」から「スクリーンショット内の popup box に CHASE 色のピクセルがあり、背景との輝度差がある」まで検証する版。

## 変更点

- `GAME_VERSION` を `v05_1_cdx_v64` に更新。
- `probeBare=1` を追加し、Chrome screenshot で canvas だけを 420x620 に切り出せるようにした。
- `window.__probe.visualContract` に expected CHASE color / background / bare-canvas 状態を出す。
- `tools/headless_graze_log_cdx_v05_2_v64_visual_probe_check.js` で PNG を直接読み、CHASE popup box 内の緑系ピクセル数と背景輝度差を検証する。
- 敵配置、弾、BOMB、Active DEF、score、CHASE bonus、bot policy は変更しない。

## 実行

ブラウザで `game/graze_log_cdx/v05_1_cdx_v64/index.html` を開く。

目視 probe 例:

```text
game/graze_log_cdx/v05_1_cdx_v64/index.html?seed=12345&bot=1&botStyle=route&probeFrame=838&probeDraw=1
```

pixel probe 用:

```text
game/graze_log_cdx/v05_1_cdx_v64/index.html?seed=12345&bot=1&botStyle=route&probeFrame=838&probeDraw=1&probeBare=1
```

## 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v64_check.js
node tools\headless_graze_log_cdx_v05_2_v64_policy_matrix_check.js
node tools\headless_graze_log_cdx_v05_2_v64_visual_probe_check.js
```
