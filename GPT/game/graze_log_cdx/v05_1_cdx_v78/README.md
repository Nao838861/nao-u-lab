# graze_log v05.2_cdx_v78

v77 の gameplay を既定では固定したまま、評価用 query `botJitter` を追加し、bot 操作へ小さな deterministic jitter を入れた時も headless の policy 判定が維持されるかを検証する版。

開くファイル:

```text
game/graze_log_cdx/v05_1_cdx_v78/index.html
game/graze_log_cdx/v05_1_cdx_v78/review_packet.html
```

検証:

```powershell
node tools\headless_graze_log_cdx_v05_2_v78_jitter_resilience_check.js
```

v78 の追加 evidence:

- `game/graze_log_cdx/v05_1_cdx_v78/review_packet.html`
- `tools/headless_graze_log_cdx_v05_2_v78_jitter_resilience_check.js`
- `.tmp/graze_log_cdx_v78_jitter_resilience/v78_jitter_resilience_packet.png`
- `memory/raw/headless_eval/graze_log_cdx_bot_jitter_resilience.jsonl`

v78 の焦点は、`botJitter=8` の mild jitter で `route` が 3 seed すべて clear し、`camper / panic / novice` が引き続き game over することを確認すること。`botJitter=18` は stress probe として raw に残すが、合否条件にはしない。jitter により route の clear frame / score / Active DEF 回数は変化したため、v77 の「seed が variance を作らない」問題に対する次の評価軸として機能する。
