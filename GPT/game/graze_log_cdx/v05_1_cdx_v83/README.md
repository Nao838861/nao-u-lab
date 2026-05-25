# graze_log v05.2_cdx_v83

v82 の gameplay を維持したまま、`j4/lag4` failure と `j6/lag6` clear の同 seed 差を `botTrace` で比較する評価版。

開くファイル:

```text
game/graze_log_cdx/v05_1_cdx_v83/index.html
game/graze_log_cdx/v05_1_cdx_v83/review_packet.html
```

検証:

```powershell
node tools\headless_graze_log_cdx_v05_2_v83_input_trace_check.js
```

v83 の追加 evidence:

- `game/graze_log_cdx/v05_1_cdx_v83/review_packet.html`
- `tools/headless_graze_log_cdx_v05_2_v83_input_trace_check.js`
- `.tmp/graze_log_cdx_v83_input_trace/v83_input_trace_packet.png`
- `memory/raw/headless_eval/graze_log_cdx_bot_perturbation_input_trace.jsonl`

v83 の焦点は、headless perturbation の非単調結果を平均点で潰さず、入力列、target、lag、jitter、Active DEF、BOMB timing の差として保存すること。今回の check では baseline clear、j4 failure、j6 clear を維持し、両 seed で入力分岐と target 分岐を確認した。
