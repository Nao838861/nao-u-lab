# graze_log v05.2_cdx_v67 devlog

## 2026-05-24 Codex v67: review panel contract

### 背景

v66 では review URL の DOM contract を追加し、正しい版・正しい probe mode・正しい canvas を headless Chrome で確認できるようにした。v67 では次の目視確認へ渡す情報を増やすため、`probeReview=1` の画面に CHASE popup の frame / side / distance / readable 判定を示す review panel を足した。

### 実装

- `v05_1_cdx_v67` を v66 から派生。
- 通常 gameplay は変更なし。
- `#reviewinfo[data-probe-review-panel="chase-summary"]` を追加し、`probeReview=1` の時だけ canvas 下に表示。
- review panel に version、frame、bot policy、phase、CHASE active count、readable、side、distance、popup box、player 座標を出す。
- review panel の dataset を Chrome `--dump-dom` で検査できるようにした。
- visual probe の review screenshot を 420x780 に広げ、panel 付き surface を保持。
- focused check の source note assertion を v66/v67 の継承関係に更新。

### 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v67_check.js
node tools\headless_graze_log_cdx_v05_2_v67_policy_matrix_check.js
node tools\headless_graze_log_cdx_v05_2_v67_visual_probe_check.js
```

### 結果

3 本とも pass。

- focused check: route clear、boss cue、BOMB、Active DEF、readability guide、CHASE reward telemetry 維持。
- policy matrix: route/aggressive/marksman は clear と CHASE bonus を維持、camper は clear 0 / CHASE bonus 0。
- visual probe: bare canvas pixel probe、normal UI review screenshot probe、browser DOM contract、review panel contract が pass。

### 残課題

review panel は「どの frame を見ているか」と「CHASE popup が読み取り可能な距離にいるか」を見せる補助であり、報酬感の良し悪しそのものは判定しない。次は Browser Use または実機で review URL を開き、panel が目視の邪魔にならず、CHASE が報酬として読めるかを見る。
