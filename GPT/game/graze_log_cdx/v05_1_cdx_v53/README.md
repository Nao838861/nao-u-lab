# graze_log v05.2_cdx_v53

v53 は v52 の deterministic visual probe を維持し、横移動 wave の path guide を `alpha=0.10` から `alpha=0.12` に上げた版。

## 遊び方

`index.html` をブラウザで開く。

- 矢印キー / WASD: 移動
- Space / B: BOMB
- Shift / X: Active DEF
- `?bot=1&botStyle=route`: route bot
- `?bot=1&botStyle=aggressive|defensive|panic`: 比較用 bot policy
- `?probeFrame=3090&probeDraw=1`: 指定 frame まで同期実行して 1 枚描画する検証モード

## 変更点

- `GAME_VERSION` を `v05_1_cdx_v53` に更新。
- `crossLockGuide` / `postMidCrossGuide` の alpha を 0.12 にした。
- guide の `lineWidth=2.2` と `chevrons=false` は維持した。
- stage 進行、敵配置、弾、スコア、BOMB、Active DEF、bot policy、probeFrame は v52 から変更していない。
- Chrome probe は post-midboss / cross-lock の前後 3 frame ずつを撮り、静止画 1 枚だけでなく短い動きの読め方を確認できるようにした。

## 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v53_check.js
node tools\headless_graze_log_cdx_v05_2_v53_visual_check.js
node tools\headless_graze_log_cdx_v05_2_v53_chrome_probe_check.js
node tools\headless_game_style_compare_v013.js
node tools\compare_graze_log_style_latest2.js
```

Chrome probe check は `.tmp/graze_log_cdx_v53_probe/` に 6 枚の PNG を出力する。これは commit 対象ではなく、実ブラウザ描画の確認用証拠として扱う。
