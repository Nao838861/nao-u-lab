# graze_log v05.2_cdx_v90

v82 の gameplay と v86-v89 の policy contrast / reason family 契約を維持したまま、`review_packet.html` の generated reason rows を静的 HTML ではなく source JSON からブラウザ側で描画する評価版。

開くファイル:

```text
game/graze_log_cdx/v05_1_cdx_v90/index.html
game/graze_log_cdx/v05_1_cdx_v90/review_packet.html
```

検証:

```powershell
node tools\headless_graze_log_cdx_v05_2_v90_rendered_reason_packet_check.js
```

v90 の追加 evidence:

- `game/graze_log_cdx/v05_1_cdx_v90/review_packet.html`
- `tools/headless_graze_log_cdx_v05_2_v90_rendered_reason_packet_check.js`
- `.tmp/graze_log_cdx_v90_policy_reason/v90_policy_reason_packet.png`
- `memory/raw/headless_eval/graze_log_cdx_policy_contrast_trace_table.jsonl`

v90 の焦点は、headless 実測から再生成した evidence 文字列と、review packet がブラウザで描画した DOM 行が一致すること。gameplay は変更していない。
