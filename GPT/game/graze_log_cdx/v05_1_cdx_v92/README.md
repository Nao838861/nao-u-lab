# graze_log v05.2_cdx_v92

v82 の gameplay と v86-v91 の policy contrast / reason family / review question 契約を維持したまま、`review_packet.html` の generated reason rows に「確認 anchor」を追加した評価版。

## 開き方

```text
game/graze_log_cdx/v05_1_cdx_v92/index.html
game/graze_log_cdx/v05_1_cdx_v92/review_packet.html
```

## 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v92_review_anchor_packet_check.js
```

v92 の追加 evidence:

- `game/graze_log_cdx/v05_1_cdx_v92/review_packet.html`
- `tools/headless_graze_log_cdx_v05_2_v92_review_anchor_packet_check.js`
- `.tmp/graze_log_cdx_v92_review_anchor/v92_review_anchor_packet.png`

## メモ

v92 の焦点は、headless 実測から再生成した evidence 文字列、同じ family に紐づく review question、そして seed / policy / frame window の review anchor が、source JSON とブラウザ描画後 DOM の両方で一致すること。gameplay は変更していない。
