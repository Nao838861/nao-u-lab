# graze_log v05.2_cdx_v80

v79 の gameplay を既定では固定したまま、評価用 query `botJitter` と `botLag` を同時に掛け、headless の policy 判定が単独 perturbation だけで保たれていないかを検証する版。

開くファイル:

```text
game/graze_log_cdx/v05_1_cdx_v80/index.html
game/graze_log_cdx/v05_1_cdx_v80/review_packet.html
```

検証:

```powershell
node tools\headless_graze_log_cdx_v05_2_v80_jitter_lag_envelope_check.js
```

v80 の追加 evidence:

- `game/graze_log_cdx/v05_1_cdx_v80/review_packet.html`
- `tools/headless_graze_log_cdx_v05_2_v80_jitter_lag_envelope_check.js`
- `.tmp/graze_log_cdx_v80_jitter_lag_envelope/v80_jitter_lag_envelope_packet.png`
- `memory/raw/headless_eval/graze_log_cdx_bot_jitter_lag_envelope.jsonl`

v80 の焦点は、mild combo `botJitter=6&botLag=6` で `route` が 3 seed すべて clear し、`camper / panic / novice` が引き続き game over することを確認すること。strong combo `botJitter=12&botLag=14` は stress probe として raw に残すが、合否条件にはしない。
