# graze_log v05.2_cdx_v88

v82 の gameplay と v86-v87 の policy contrast / reason table を維持したまま、reason table の family 判定を headless 実測から再構成できる source contract として固定した評価版。

開くファイル:

```text
game/graze_log_cdx/v05_1_cdx_v88/index.html
game/graze_log_cdx/v05_1_cdx_v88/review_packet.html
```

検証:

```powershell
node tools\headless_graze_log_cdx_v05_2_v88_policy_reason_source_check.js
```

v88 の追加 evidence:

- `game/graze_log_cdx/v05_1_cdx_v88/review_packet.html`
- `tools/headless_graze_log_cdx_v05_2_v88_policy_reason_source_check.js`
- `.tmp/graze_log_cdx_v88_policy_reason/v88_policy_reason_packet.png`
- `memory/raw/headless_eval/graze_log_cdx_policy_contrast_trace_table.jsonl`

v88 の焦点は、headless を good/bad の勝敗表や静的な理由表だけで終えず、route は BOMB/Active DEF に到達して clear、aggressive/marksman は前進 CHASE 報酬で clear、camper は下端滞在中に wave 10 で潰れる、survival/panic は回避だけでは中盤圧に負ける、novice は終盤の BOMB 導線候補として残る、という理由 family を JSON 契約として検証すること。gameplay は変更していない。
