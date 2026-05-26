# graze_log v05.2_cdx_v93

v82 の gameplay と v92 の policy contrast / review question / review anchor 契約を維持したまま、anchor の選び方を「便宜的な終盤 window」から実 telemetry event 由来へ寄せた評価版。

## 開き方

```text
game/graze_log_cdx/v05_1_cdx_v93/index.html
game/graze_log_cdx/v05_1_cdx_v93/review_packet.html
```

## 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v93_event_anchor_packet_check.js
```

v93 の追加 evidence:

- `game/graze_log_cdx/v05_1_cdx_v93/review_packet.html`
- `tools/headless_graze_log_cdx_v05_2_v93_event_anchor_packet_check.js`
- `.tmp/graze_log_cdx_v93_event_anchor/v93_event_anchor_packet.png`

## メモ

v93 の焦点は、headless が出す review anchor を `BOMB` / `firstChaseKill` / `gameOver` などの concrete event へ接続すること。headless は「楽しい」を判定せず、人間が同じ seed / policy / frame window を確認し始めるための入口を固定する。
