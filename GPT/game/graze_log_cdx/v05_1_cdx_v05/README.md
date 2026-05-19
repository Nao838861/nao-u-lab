# graze_log v05.2_cdx_v05

v04 の stage arc を維持しつつ、boss 戦を「BOMB を使って clear できる finite boss」に調整した版。

## 変更点

- boss HP を短くし、削り感を軽くした。
- boss 開始時に BOMB stock を明示して、初見でも大技を切る局面を読みやすくした。
- BOMB は弾消し、tempo brake、boss damage を持つが、5-way 付与には戻していない。
- focused headless check に boss BOMB clear を追加した。

## 実行

`index.html` をブラウザで開く。

Focused headless check:

```powershell
node tools\headless_graze_log_cdx_v05_2_v05_check.js
```
