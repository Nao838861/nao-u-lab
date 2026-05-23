# graze_log v05.2_cdx_v66

v65 の gameplay を維持し、`probeReview=1` の実ブラウザ寄り review URL を DOM でも検証できるようにした版。

## 変更点

- `GAME_VERSION` を `v05_1_cdx_v66` に更新。
- review URL の `<body>` に `data-game-version` / `data-probe-mode` を付与。
- `<canvas>` に `aria-label` / `data-probe-canvas` / `data-game-version` を付与。
- `makeProbeSnapshot().visualContract.dom` に title、body class、probe mode、canvas 属性を含める。
- Chrome headless の screenshot 検証に加え、`--dump-dom` で review URL の DOM 契約を確認する。
- 敵配置、弾、BOMB、Active DEF、CHASE 報酬、bot policy は v65 から変更しない。

## 実行

ブラウザで次を開く。

```text
game/graze_log_cdx/v05_1_cdx_v66/index.html
```

review probe 例:

```text
game/graze_log_cdx/v05_1_cdx_v66/index.html?seed=12345&bot=1&botStyle=route&probeFrame=838&probeDraw=1&probeReview=1
```

pixel probe 例:

```text
game/graze_log_cdx/v05_1_cdx_v66/index.html?seed=12345&bot=1&botStyle=route&probeFrame=838&probeDraw=1&probeBare=1
```

## 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v66_check.js
node tools\headless_graze_log_cdx_v05_2_v66_policy_matrix_check.js
node tools\headless_graze_log_cdx_v05_2_v66_visual_probe_check.js
```
