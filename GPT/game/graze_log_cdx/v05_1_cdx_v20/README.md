# graze_log v05.2_cdx_v20

`v05_1_cdx_v19` からの継続改善版。v19 で強めた quiet DEF ring を残したまま、HUD の `WINDOW n` / `DEF n` と右上の `SPACE [D]EF` 文字 cue を消し、Active DEF の押し時を ring だけで読ませる評価版。

## 変更点

- HTML title と title screen の版表記を v20 に更新。
- HUD 2 行目から `WINDOW n` と `DEF n` を削除。
- Active DEF 可能時の右上 `SPACE [D]EF` 表示を出さず、ring cue と `DEF READY` のみで判断させる。
- v19 の `DEF_PROMPT_FRAMES=78`、life 42、太めの prompt ring、補助 ring は維持。
- BOMB、shield、敵構成、報酬量、boss final cue は v19 から据え置き。

## 実行

`index.html` をブラウザで開く。

## 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v20_check.js
```
