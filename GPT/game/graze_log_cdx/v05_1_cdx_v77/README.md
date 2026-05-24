# graze_log v05.2_cdx_v77

v76 の gameplay を固定したまま、bad policy failure の死亡原因 packet を multi-seed 化した評価版。

開くファイル:

```text
game/graze_log_cdx/v05_1_cdx_v77/index.html
game/graze_log_cdx/v05_1_cdx_v77/review_packet.html
```

検証:

```powershell
node tools\headless_graze_log_cdx_v05_2_v77_multiseed_death_packet_check.js
```

v77 の追加 evidence:

- `game/graze_log_cdx/v05_1_cdx_v77/review_packet.html`
- `tools/headless_graze_log_cdx_v05_2_v77_multiseed_death_packet_check.js`
- `.tmp/graze_log_cdx_v77_multiseed_death_packet/v77_multiseed_death_review_packet.png`
- `memory/raw/headless_eval/graze_log_cdx_bad_policy_multiseed_death_packet_review.jsonl`

v77 の焦点は、`route` が 3 seed で clear し、`camper / panic / novice` が 3 seed すべてで forced iframe なしに game over し、各死亡の `deathContext` が packet で読めることを確認すること。今回の 3 seed は同一 frame / 同一死亡 context になったため、現状の stage/bot では URL seed が結果 variance を作っていないことも明示した。
