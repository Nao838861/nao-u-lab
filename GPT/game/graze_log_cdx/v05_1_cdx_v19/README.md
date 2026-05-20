# graze_log v05.2_cdx_v19

`v05_1_cdx_v17` からの継続改善版。`DEF WINDOW` 文字 popup を復活させず、Active DEF の quiet ring cue を少し早く、少し太く、少し長くして、実プレイで気づきやすくした。

## 変更点

- HTML title と title screen の版表記を v19 に修正。
- `DEF_PROMPT_FRAMES` を 84 から 78 に短縮。
- prompt ring を `ACTIVE_DEF_RADIUS-18` から `ACTIVE_DEF_RADIUS+10` に広げ、life を 30 から 42 に延長。
- prompt 中の補助 ring を早めに出し、線幅を 3 に上げた。
- BOMB、shield、敵構成、報酬量、boss final cue は v17 から据え置き。

## 実行

`index.html` をブラウザで開く。

## 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v19_check.js
```
