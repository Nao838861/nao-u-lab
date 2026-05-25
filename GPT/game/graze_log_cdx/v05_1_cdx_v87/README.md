# graze_log v05.2_cdx_v87

v82 の gameplay と v86 の policy contrast を維持したまま、policy が成功/失敗した理由を人間確認用の reason table として読めるようにした評価版。

開くファイル:

```text
game/graze_log_cdx/v05_1_cdx_v87/index.html
game/graze_log_cdx/v05_1_cdx_v87/review_packet.html
```

検証:

```powershell
node tools\headless_graze_log_cdx_v05_2_v87_policy_reason_check.js
```

v87 の追加 evidence:

- `game/graze_log_cdx/v05_1_cdx_v87/review_packet.html`
- `tools/headless_graze_log_cdx_v05_2_v87_policy_reason_check.js`
- `.tmp/graze_log_cdx_v87_policy_reason/v87_policy_reason_packet.png`
- `memory/raw/headless_eval/graze_log_cdx_policy_contrast_trace_table.jsonl`

v87 の焦点は、headless を good/bad の勝敗表だけで終えず、route は BOMB/Active DEF に到達して clear、aggressive/marksman は前進 CHASE 報酬で clear、camper は下端滞在中に wave 10 で潰れる、survival/panic は回避だけでは中盤圧に負ける、novice は終盤の BOMB 導線候補として残る、という理由を同じ review packet で確認できるようにすること。gameplay は変更していない。
