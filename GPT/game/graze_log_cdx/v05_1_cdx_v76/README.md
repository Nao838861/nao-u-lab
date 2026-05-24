# graze_log v05.2_cdx_v76

v75 の gameplay を固定したまま、bad policy failure の headless evidence に死亡原因を追加した評価版。

開くファイル:

```text
game/graze_log_cdx/v05_1_cdx_v76/index.html
game/graze_log_cdx/v05_1_cdx_v76/review_packet.html
```

検証:

```powershell
node tools\headless_graze_log_cdx_v05_2_v76_death_packet_check.js
```

v76 の追加 evidence:

- `game/graze_log_cdx/v05_1_cdx_v76/review_packet.html`
- `tools/headless_graze_log_cdx_v05_2_v76_death_packet_check.js`
- `.tmp/graze_log_cdx_v76_death_packet/v76_death_review_packet.png`
- `memory/raw/headless_eval/graze_log_cdx_bad_policy_death_packet_review.jsonl`

v76 の焦点は、`camper / panic / novice` の game over frame について、単に「失敗した」と表示するだけでなく、最終 hit bullet の `sourceType / sourceGroup`、死亡時 phase、敵弾数、近接弾数、直前 event を packet に出すこと。bad policy の iframe は `probeForceIframe=0` で開き、死亡を隠さない。
