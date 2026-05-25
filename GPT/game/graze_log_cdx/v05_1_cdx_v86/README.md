# graze_log v05.2_cdx_v86

v82 の gameplay と v85 の causal slice を維持したまま、good policy / bad policy の比較を人間確認用の policy contrast table として読めるようにした評価版。

開くファイル:

```text
game/graze_log_cdx/v05_1_cdx_v86/index.html
game/graze_log_cdx/v05_1_cdx_v86/review_packet.html
```

検証:

```powershell
node tools\headless_graze_log_cdx_v05_2_v86_policy_contrast_check.js
```

v86 の追加 evidence:

- `game/graze_log_cdx/v05_1_cdx_v86/review_packet.html`
- `tools/headless_graze_log_cdx_v05_2_v86_policy_contrast_check.js`
- `.tmp/graze_log_cdx_v86_policy_contrast/v86_policy_contrast_packet.png`
- `memory/raw/headless_eval/graze_log_cdx_policy_contrast_trace_table.jsonl`

v86 の焦点は、headless を単一 bot の clear や平均スコアに閉じず、route / aggressive / marksman が clear し、camper / survival / panic / defensive / novice が fail する policy split を、人間が同じ画面で読める evidence にすること。gameplay は変更していない。
