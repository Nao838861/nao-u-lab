# graze_log v05.2_cdx_v06

v05 の boss BOMB clear を維持しつつ、boss 開始時の BOMB stock 直付けをやめ、直前の boss warning wave を撃破して BOMB を稼ぐ形に寄せた版。

## 変更点

- boss warning の scout に `BOMB +22` の追加ゲージ報酬を持たせた。
- boss 開始時は gauge を直接満タンにせず、稼げていれば `BOMB STOCK EARNED`、足りなければ `BUILD BOMB` と表示する。
- boss HP、BOMB damage、BOMB cooldown、5-way 非付与は v05 と同じ。
- focused headless check は warning wave 由来の BOMB stock、boss BOMB clear、BOMB 悪用不可を検証する。

## 実行

`index.html` をブラウザで開く。

Focused headless check:

```powershell
node tools\headless_graze_log_cdx_v05_2_v06_check.js
```
