# graze_log v05.2_cdx_v82

v81 の gameplay を既定では固定したまま、`botJitter` / `botLag` の非単調な seed 差を再生する評価版。

開くファイル:

```text
game/graze_log_cdx/v05_1_cdx_v82/index.html
game/graze_log_cdx/v05_1_cdx_v82/review_packet.html
```

検証:

```powershell
node tools\headless_graze_log_cdx_v05_2_v82_nonmonotonic_replay_check.js
```

v82 の追加 evidence:

- `game/graze_log_cdx/v05_1_cdx_v82/review_packet.html`
- `tools/headless_graze_log_cdx_v05_2_v82_nonmonotonic_replay_check.js`
- `.tmp/graze_log_cdx_v82_nonmonotonic_replay/v82_nonmonotonic_replay_packet.png`
- `memory/raw/headless_eval/graze_log_cdx_bot_perturbation_nonmonotonic_replay.jsonl`

v82 の焦点は、`j4/lag4` が `j6/lag6` より弱い perturbation なのに route failure を起こす現象を、単なる失敗ではなく評価器 calibration evidence として残すこと。headless が「楽しい」を判定するのではなく、どの perturbation cell を合否対象にしてよいか、どの cell は anomaly / stress として扱うべきかの根拠を増やす。
