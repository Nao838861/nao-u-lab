# graze_log v05.2_cdx_v63

v62 の gameplay を維持し、CHASE popup の実ブラウザ目視確認に使う `probeFrame` 出力を強めた版。

## 変更点

- `GAME_VERSION` を `v05_1_cdx_v63` に更新。
- `probeFrame=N&probeDraw=1` で `window.__probe` に CHASE popup の画面座標、推定 box、player distance、HUD 近接、canvas 内判定を出す。
- focused check に CHASE popup visual snapshot assertion を追加。
- Chrome/Edge headless screenshot probe を追加。
- 敵配置、弾、BOMB、Active DEF、score、CHASE bonus、bot policy は変更しない。

## 実行

ブラウザで `game/graze_log_cdx/v05_1_cdx_v63/index.html` を開く。

目視 probe 例:

```text
game/graze_log_cdx/v05_1_cdx_v63/index.html?seed=12345&bot=1&botStyle=route&probeFrame=906&probeDraw=1
```

## 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v63_check.js
node tools\headless_graze_log_cdx_v05_2_v63_policy_matrix_check.js
node tools\headless_graze_log_cdx_v05_2_v63_visual_probe_check.js
```
