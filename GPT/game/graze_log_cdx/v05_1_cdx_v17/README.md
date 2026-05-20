# graze_log v05.2_cdx_v17

`v05_1_cdx_v16` からの継続改善版。Active DEF の押し時 cue を、`DEF WINDOW` 文字 popup から quiet ring に変更した。

## 変更点

- `DEF_PROMPT_FRAMES` を 84 に延長。
- `DEF WINDOW` popup を削除。
- Active DEF 半径付近に短い ring を出す。
- BOMB、shield、敵構成、報酬量は v16 から据え置き。

## 実行

`index.html` をブラウザで開く。

## 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v17_check.js
```
