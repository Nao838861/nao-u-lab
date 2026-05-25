# graze_log v05.2_cdx_v85

v82 の gameplay と v84 の causal slice を維持したまま、`j4/lag4` failure と `j6/lag6` clear の同 seed 差を人間確認用の trace table として読めるようにした評価版。

開くファイル:

```text
game/graze_log_cdx/v05_1_cdx_v85/index.html
game/graze_log_cdx/v05_1_cdx_v85/review_packet.html
```

検証:

```powershell
node tools\headless_graze_log_cdx_v05_2_v85_trace_table_check.js
```

v85 の追加 evidence:

- `game/graze_log_cdx/v05_1_cdx_v85/review_packet.html`
- `tools/headless_graze_log_cdx_v05_2_v85_trace_table_check.js`
- `.tmp/graze_log_cdx_v85_trace_table/v85_trace_table_packet.png`
- `memory/raw/headless_eval/graze_log_cdx_bot_perturbation_trace_table.jsonl`

v85 の焦点は、headless perturbation の非単調結果を raw JSONL だけに閉じず、seed / policy cell / 結果 / 死亡 window の読み / 到達差 / 次に見る点として review packet 上に残すこと。gameplay は変更していない。
