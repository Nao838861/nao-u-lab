# graze_log v05.2_cdx_v07

v06 の boss BOMB clear を維持しつつ、BOMB stock 報酬を boss warning wave だけに集中させず、midboss と warning scout に分散した版。

## 変更点

- midboss 撃破で `BOMB +36` を得る。
- boss warning scout の追加報酬を `BOMB +22` から `BOMB +14` に下げた。
- boss 開始時の gauge 直付けは引き続き行わない。
- focused headless check は、報酬分散、boss BOMB clear、BOMB 悪用不可を検証する。

## 実行

`index.html` をブラウザで開く。

Focused headless check:

```powershell
node tools\headless_graze_log_cdx_v05_2_v07_check.js
```
