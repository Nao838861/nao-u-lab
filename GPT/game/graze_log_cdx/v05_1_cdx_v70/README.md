# graze_log v05.2_cdx_v70

v69 の gameplay を維持し、CHASE review panel の `stable=yes` frame を headless が探索して、人間確認に渡せる DOM と screenshot を残す版。

開くファイル:

```text
game/graze_log_cdx/v05_1_cdx_v70/index.html
```

検証:

```powershell
node tools\headless_graze_log_cdx_v05_2_v70_check.js
node tools\headless_graze_log_cdx_v05_2_v70_policy_matrix_check.js
node tools\headless_graze_log_cdx_v05_2_v70_visual_probe_check.js
node tools\headless_graze_log_cdx_v05_2_v70_stable_review_check.js
```

v70 で追加した主な証拠:

- `tools/headless_graze_log_cdx_v05_2_v70_stable_review_check.js`
- `.tmp/graze_log_cdx_v70_stable_review/v70_stable_review_frame_425.png`
- DOM contract: `data-review-stable="true"` / `stable yes` / `stable readable CHASE popup`
