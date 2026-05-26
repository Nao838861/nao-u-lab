# graze_log v05.2_cdx_v91

v82 の gameplay と v86-v90 の policy contrast / reason family 契約を維持したまま、`review_packet.html` の generated reason rows に「次に見る問い」を追加した評価版。

## 開き方

```text
game/graze_log_cdx/v05_1_cdx_v91/index.html
game/graze_log_cdx/v05_1_cdx_v91/review_packet.html
```

## 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v91_review_question_packet_check.js
```

v91 の追加 evidence:

- `game/graze_log_cdx/v05_1_cdx_v91/review_packet.html`
- `tools/headless_graze_log_cdx_v05_2_v91_review_question_packet_check.js`
- `.tmp/graze_log_cdx_v91_review_question/v91_review_question_packet.png`

## メモ

v91 の焦点は、headless 実測から再生成した evidence 文字列と、同じ family に紐づく review question が、source JSON とブラウザ描画後 DOM の両方で一致すること。gameplay は変更していない。
