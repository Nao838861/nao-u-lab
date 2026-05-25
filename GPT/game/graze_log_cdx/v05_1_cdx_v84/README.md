# graze_log v05.2_cdx_v84

v82 の gameplay と v83 の `botTrace` を維持したまま、`j4/lag4` failure と `j6/lag6` clear の同 seed 差を causal slice として分類する評価版。

開くファイル:

```text
game/graze_log_cdx/v05_1_cdx_v84/index.html
game/graze_log_cdx/v05_1_cdx_v84/review_packet.html
```

検証:

```powershell
node tools\headless_graze_log_cdx_v05_2_v84_causal_slice_check.js
```

v84 の追加 evidence:

- `game/graze_log_cdx/v05_1_cdx_v84/review_packet.html`
- `tools/headless_graze_log_cdx_v05_2_v84_causal_slice_check.js`
- `.tmp/graze_log_cdx_v84_causal_slice/v84_causal_slice_packet.png`
- `memory/raw/headless_eval/graze_log_cdx_bot_perturbation_causal_slice.jsonl`

v84 の焦点は、headless perturbation の非単調結果を平均点で潰さず、同 seed の target/input 分岐、late survival、Active DEF 到達差、BOMB 到達差として保存すること。今回の check では baseline clear、j4 failure、j6 clear を維持し、両 seed で causal slice assertion を通した。
