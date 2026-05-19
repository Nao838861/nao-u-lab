# graze_log v05.2_cdx_v10

v09 の researched stage flow を維持しつつ、boss warning から final phase BOMB までの handoff を headless で必須化した版。

## 変更点

- boss warning を break/top-off wave として整理。
- warning scout を中央寄せ・低速化し、自然な射線で BOMB stock を作りやすくした。
- final cue 後に simpleBot が BOMB を使って clear することを focused check で必須化。
- 既存STG由来の stage grammar、BOMB 悪用不可、Active DEF threshold は維持。

## 実行

`index.html` をブラウザで開く。

Focused headless check:

```powershell
node tools\headless_graze_log_cdx_v05_2_v10_check.js
```
