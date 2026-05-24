# graze_log v05.2_cdx_v79

v78 の gameplay を既定では固定したまま、評価用 query `botLag` を追加し、bot の target 反応を数 frame 遅らせた時も headless の policy 判定が維持されるかを検証する版。

開くファイル:

```text
game/graze_log_cdx/v05_1_cdx_v79/index.html
game/graze_log_cdx/v05_1_cdx_v79/review_packet.html
```

検証:

```powershell
node tools\headless_graze_log_cdx_v05_2_v79_lag_envelope_check.js
```

v79 の追加 evidence:

- `game/graze_log_cdx/v05_1_cdx_v79/review_packet.html`
- `tools/headless_graze_log_cdx_v05_2_v79_lag_envelope_check.js`
- `.tmp/graze_log_cdx_v79_lag_envelope/v79_lag_envelope_packet.png`
- `memory/raw/headless_eval/graze_log_cdx_bot_lag_envelope.jsonl`

v79 の焦点は、`botLag=6` の mild lag で `route` が 3 seed すべて clear し、`camper / panic / novice` が引き続き game over することを確認すること。`botLag=14` は stress probe として raw に残すが、合否条件にはしない。lag により route の clear frame / score / Active DEF 回数が変化するなら、v78 の jitter とは別の「反応遅延に対する headless evidence の頑健性」を見られる。
