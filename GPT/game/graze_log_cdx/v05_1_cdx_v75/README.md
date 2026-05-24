# graze_log v05.2_cdx_v75

v74 の gameplay を固定したまま、good route と bad policy failure の headless evidence を人間確認用 packet にまとめた評価版。

開くファイル:

```text
game/graze_log_cdx/v05_1_cdx_v75/index.html
game/graze_log_cdx/v05_1_cdx_v75/review_packet.html
```

検証:

```powershell
node tools\headless_graze_log_cdx_v05_2_v75_check.js
node tools\headless_graze_log_cdx_v05_2_v75_policy_matrix_check.js
node tools\headless_graze_log_cdx_v05_2_v75_visual_probe_check.js
node tools\headless_graze_log_cdx_v05_2_v75_stable_review_check.js
node tools\headless_graze_log_cdx_v05_2_v75_policy_review_check.js
node tools\headless_graze_log_cdx_v05_2_v75_cue_review_check.js
node tools\headless_graze_log_cdx_v05_2_v75_policy_cue_review_check.js
node tools\headless_graze_log_cdx_v05_2_v75_bad_policy_packet_check.js
```

v75 の追加 evidence:

- `game/graze_log_cdx/v05_1_cdx_v75/review_packet.html`
- `tools/headless_graze_log_cdx_v05_2_v75_bad_policy_packet_check.js`
- `.tmp/graze_log_cdx_v75_bad_policy_packet/v75_bad_policy_review_packet.png`
- `memory/raw/headless_eval/graze_log_cdx_bad_policy_packet_review.jsonl`

v75 の焦点は、bad policy を packet に載せる時に forced iframe で失敗を隠さないこと。`route` は強制無敵なしで clear し、`camper / panic / novice` は game over frame として表示される。
