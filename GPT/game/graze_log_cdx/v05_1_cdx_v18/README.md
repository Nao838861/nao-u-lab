# graze_log v05.2_cdx_v18

`v05_1_cdx_v17` からの継続改善版。Active DEF の押し時 cue は文字 popup を復活させず、ring の明度・太さ・寿命を上げて、実プレイで気づきやすい cue に寄せた。

## 変更点

- prompt ring を `life: 46`、`#b9ffe8`、`w: 3.2`、`ACTIVE_DEF_RADIUS-20` から `ACTIVE_DEF_RADIUS+12` に変更。
- ring 描画が個別の `w` / `a` を読めるようにした。
- ready 後の常時 preview ring を少し太く、明るくした。
- `DEF WINDOW` 文字 popup は引き続き出さない。

## 実行

ブラウザで `index.html` を開く。

## 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v18_check.js
```
