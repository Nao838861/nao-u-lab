# graze_log v05.2_cdx_v53 devlog

## 2026-05-22 Codex v53: path guide alpha 0.12

### 背景

v52 の Chrome probe では、chevron を削った横移動 wave guide が「見えるがかなり薄い」と分かった。継続 directive の次焦点は、薄すぎる場合に `alpha=0.12` を試し、動きとして読めるかを複数 frame で確認すること。

### 実装

- `v05_1_cdx_v53/index.html` を v52 から派生。
- 表示名、`GAME_VERSION`、ledger source、source notes を v53 に更新。
- `GUIDE_ALPHA` を 0.10 から 0.12 に変更。
- `GUIDE_LINE_WIDTH=2.2`、`chevrons=false`、guide duration、path、敵配置、弾、bot policy、probeFrame は v52 と同じ。
- `tools/headless_graze_log_cdx_v05_2_v53_chrome_probe_check.js` は post-midboss / cross-lock の各 3 frame を撮る。

### 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v53_check.js
node tools\headless_graze_log_cdx_v05_2_v53_visual_check.js
node tools\headless_graze_log_cdx_v05_2_v53_chrome_probe_check.js
node tools\headless_game_style_compare_v013.js
node tools\compare_graze_log_style_latest2.js
```

結果:

- route bot は clear / grade S / BOMB 1 を維持。
- guide trace は `alpha=0.12`、`lineWidth=2.2`、`chevrons=false`、`readabilityGuides=2`。
- Chrome probe は `.tmp/graze_log_cdx_v53_probe/` に 6 枚の PNG を生成。
- v52 -> v53 の latest2 compare は全 policy の trace digest 同値を確認。
- peak 画像目視では guide はまだ控えめで、cross path として読める。矢印記号感は戻っていない。

### 戻す場合

v53 directory と v53/v013 scripts を削除する。既存版へ戻すだけなら、v52 を使えばよい。

### 次の課題

- Chrome probe 6 枚を目視し、alpha 0.12 が path guide として読めるか、説明記号に戻っていないかを確認する。
- まだ薄い場合は duration / fade を触る。強すぎる場合は alpha 0.10 に戻し、敵色や出現タイミング側で補う。
