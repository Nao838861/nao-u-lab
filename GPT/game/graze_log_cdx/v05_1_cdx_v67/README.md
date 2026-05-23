# graze_log v05.2_cdx_v67

v66 の gameplay を維持し、`probeReview=1` の review URL に CHASE review panel contract を追加した版。

## 変更点

- `GAME_VERSION` を `v05_1_cdx_v67` に更新。
- review URL の canvas 下に `#reviewinfo[data-probe-review-panel="chase-summary"]` を追加。
- panel に version / frame / policy / phase / CHASE count / readable / side / distance / popup box / player 座標を表示。
- panel の dataset を Chrome `--dump-dom` で検査できるようにした。
- Chrome headless の screenshot 検証を 420x780 に広げ、panel 付き review surface を確認する。
- 敵配置、弾、BOMB、Active DEF、CHASE 報酬、bot policy は v66 から変更しない。

## 実行

ブラウザで次を開く。

```text
game/graze_log_cdx/v05_1_cdx_v67/index.html
```

review probe 例:

```text
game/graze_log_cdx/v05_1_cdx_v67/index.html?seed=12345&bot=1&botStyle=route&probeFrame=838&probeDraw=1&probeReview=1
```

pixel probe 例:

```text
game/graze_log_cdx/v05_1_cdx_v67/index.html?seed=12345&bot=1&botStyle=route&probeFrame=838&probeDraw=1&probeBare=1
```

## 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v67_check.js
node tools\headless_graze_log_cdx_v05_2_v67_policy_matrix_check.js
node tools\headless_graze_log_cdx_v05_2_v67_visual_probe_check.js
```
