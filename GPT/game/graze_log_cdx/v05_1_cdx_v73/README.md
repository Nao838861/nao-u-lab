# graze_log v05.2_cdx_v73

v72 の gameplay を固定したまま、CHASE / Active DEF / boss cue / BOMB の stable review frame を複数 policy で比較する headless 評価版。

開くファイル:

```text
game/graze_log_cdx/v05_1_cdx_v73/index.html
```

検証:

```powershell
node tools\headless_graze_log_cdx_v05_2_v73_check.js
node tools\headless_graze_log_cdx_v05_2_v73_policy_matrix_check.js
node tools\headless_graze_log_cdx_v05_2_v73_visual_probe_check.js
node tools\headless_graze_log_cdx_v05_2_v73_stable_review_check.js
node tools\headless_graze_log_cdx_v05_2_v73_policy_review_check.js
node tools\headless_graze_log_cdx_v05_2_v73_cue_review_check.js
node tools\headless_graze_log_cdx_v05_2_v73_policy_cue_review_check.js
```

v73 の追加 evidence:

- `tools/headless_graze_log_cdx_v05_2_v73_policy_cue_review_check.js`
- `.tmp/graze_log_cdx_v73_policy_cue_review/v73_<policy>_<cue>_frame_<frame>.png`
- `memory/raw/headless_eval/graze_log_cdx_policy_cue_review.jsonl`
