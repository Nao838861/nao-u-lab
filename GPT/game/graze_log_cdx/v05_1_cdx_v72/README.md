# graze_log v05.2_cdx_v72

v71 の gameplay を固定したまま、CHASE / Active DEF / boss cue / BOMB の cue family ごとに human-review candidate frame を選ぶ headless 評価版。

開くファイル:

```text
game/graze_log_cdx/v05_1_cdx_v72/index.html
```

検証:

```powershell
node tools\headless_graze_log_cdx_v05_2_v72_check.js
node tools\headless_graze_log_cdx_v05_2_v72_policy_matrix_check.js
node tools\headless_graze_log_cdx_v05_2_v72_visual_probe_check.js
node tools\headless_graze_log_cdx_v05_2_v72_stable_review_check.js
node tools\headless_graze_log_cdx_v05_2_v72_policy_review_check.js
node tools\headless_graze_log_cdx_v05_2_v72_cue_review_check.js
```

v72 の追加 evidence:

- `tools/headless_graze_log_cdx_v05_2_v72_cue_review_check.js`
- `.tmp/graze_log_cdx_v72_cue_review/v72_<cue>_review_frame_<frame>.png`
- `memory/raw/headless_eval/graze_log_cdx_cue_review.jsonl`
