# graze_log v05.2_cdx_v71

v70 の gameplay を固定したまま、policy ごとの human-review candidate frame を比較する headless 評価版。

開くファイル:

```text
game/graze_log_cdx/v05_1_cdx_v71/index.html
```

検証:

```powershell
node tools\headless_graze_log_cdx_v05_2_v71_check.js
node tools\headless_graze_log_cdx_v05_2_v71_policy_matrix_check.js
node tools\headless_graze_log_cdx_v05_2_v71_visual_probe_check.js
node tools\headless_graze_log_cdx_v05_2_v71_stable_review_check.js
node tools\headless_graze_log_cdx_v05_2_v71_policy_review_check.js
```

v71 の追加 evidence:

- `tools/headless_graze_log_cdx_v05_2_v71_policy_review_check.js`
- `.tmp/graze_log_cdx_v71_policy_review/v71_<policy>_stable_review_frame_<frame>.png`
- DOM contract: `policy` / `stable yes` / `stable readable CHASE popup` / `verdict pass`
