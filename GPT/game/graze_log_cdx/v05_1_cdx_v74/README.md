# graze_log v05.2_cdx_v74

v73 の gameplay を固定したまま、policy x cue family の headless evidence を人間確認用 packet にまとめた評価版。

開くファイル:

```text
game/graze_log_cdx/v05_1_cdx_v74/index.html
game/graze_log_cdx/v05_1_cdx_v74/review_packet.html
```

検証:

```powershell
node tools\headless_graze_log_cdx_v05_2_v74_check.js
node tools\headless_graze_log_cdx_v05_2_v74_policy_matrix_check.js
node tools\headless_graze_log_cdx_v05_2_v74_visual_probe_check.js
node tools\headless_graze_log_cdx_v05_2_v74_stable_review_check.js
node tools\headless_graze_log_cdx_v05_2_v74_policy_review_check.js
node tools\headless_graze_log_cdx_v05_2_v74_cue_review_check.js
node tools\headless_graze_log_cdx_v05_2_v74_policy_cue_review_check.js
node tools\headless_graze_log_cdx_v05_2_v74_human_packet_check.js
```

v74 の追加 evidence:

- `game/graze_log_cdx/v05_1_cdx_v74/review_packet.html`
- `tools/headless_graze_log_cdx_v05_2_v74_human_packet_check.js`
- `.tmp/graze_log_cdx_v74_human_packet/v74_human_review_packet.png`
- `memory/raw/headless_eval/graze_log_cdx_human_packet_review.jsonl`
