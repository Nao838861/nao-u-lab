# graze_log v05.2_cdx_v21

`v05_1_cdx_v20` からの継続改善版。v20 で削った `WINDOW n` / `DEF n` / `SPACE [D]EF` は戻さず、Active DEF の押し時を知らせる ring の視認性だけを上げた。

## 変更点

- HTML title と title screen の版表記を v21 に更新。
- Active DEF prompt 成立時の ring を、life 52 の太い内側 ring と life 34 の薄い外側 ring の二重表示にした。
- プレイヤー周囲の prompt ring を `lineWidth=4` にし、補助 ring を半径 `ACTIVE_DEF_RADIUS+16` へ広げた。
- BOMB、shield、敵構成、報酬量、boss final cue、HUD 文字 cue 不在は v20 から据え置き。

## 実行

`index.html` をブラウザで開く。

## 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v21_check.js
```
