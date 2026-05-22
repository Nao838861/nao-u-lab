# graze_log v05.2_cdx_v52

v52 は v51 の stage / enemy / bullet / bot policy / evaluation ledger を維持し、実ブラウザ screenshot 用の deterministic visual probe を追加した版。

## 遊び方

`index.html` をブラウザで開く。

- 矢印キー / WASD: 移動
- Space / B: BOMB
- Shift / X: Active DEF
- `?bot=1&botStyle=route`: route bot
- `?bot=1&botStyle=aggressive|defensive|panic`: 比較用 bot policy
- `?probeFrame=3090&probeDraw=1`: 指定 frame まで同期実行して 1 枚描画する検証モード

## 変更点

- `GAME_VERSION` を `v05_1_cdx_v52` に更新。
- `PROBE_FRAME` / `PROBE_DRAW` を追加。
- `probeFrame` 指定時は `startGame()` 後に指定 frame まで同期更新し、そこで `draw()` して停止する。
- stage 進行、敵配置、弾、スコア、BOMB、Active DEF、bot policy は v51 から変更していない。
- `window.__probe` に frame / mode / phase / active guides / ledger を残す。

目的は、v51 の guide が実レンダリングで薄すぎないかを、rAF の進行に依存せず exact frame screenshot で確認できるようにすること。

## 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v52_check.js
node tools\headless_graze_log_cdx_v05_2_v52_visual_check.js
node tools\headless_graze_log_cdx_v05_2_v52_chrome_probe_check.js
node tools\headless_game_style_compare_v012.js
node tools\compare_graze_log_style_latest2.js
```

Chrome probe check は `.tmp/graze_log_cdx_v52_probe/` に post-midboss と cross-lock の PNG を出力する。これは commit 対象ではなく、実ブラウザ描画の確認用証拠として扱う。
