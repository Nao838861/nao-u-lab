# graze_log v05.2_cdx_v70 devlog

## 2026-05-24 Codex v70: stable review frame search

### 背景

v69 は review panel に `stable/window/reason` を追加したが、visual probe は `stable=no` の frame を確認していた。これは「単一 frame は読めるが、人間確認に渡す安定 frame ではない」ことを示すには良い。一方で、実際に人間確認へ渡すべき `stable=yes` frame を headless が探して証拠化する処理が残っていた。

### 実装

- `v05_1_cdx_v70` を v69 から派生。
- gameplay、敵配置、報酬、bot policy は変更なし。
- 既存 headless 3 本を v70 用に派生。
- `tools/headless_graze_log_cdx_v05_2_v70_stable_review_check.js` を追加。
- stable review check は CHASE popup event 周辺を走査し、`makeReviewPacket()` の `stable=true` frame を探す。
- 選択した stable frame で Chrome の DOM dump と screenshot を取り、`stable yes` と `stable readable CHASE popup` を確認する。

### 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v70_check.js
node tools\headless_graze_log_cdx_v05_2_v70_policy_matrix_check.js
node tools\headless_graze_log_cdx_v05_2_v70_visual_probe_check.js
node tools\headless_graze_log_cdx_v05_2_v70_stable_review_check.js
```

### 結果

4 本とも pass。

- focused check: route clear、boss cue、BOMB、Active DEF、readability guide、CHASE reward telemetry 維持。
- policy matrix: route/aggressive/marksman clear、camper clear 0 / CHASE 0 維持。
- visual probe: bare canvas pixel、review screenshot、browser DOM contract、v69 由来の stability packet contract 維持。
- stable review: frame 425 / 839 / 1137 / 1155 / 1201 / 1291 を stable frame として検出。代表 screenshot は `.tmp/graze_log_cdx_v70_stable_review/v70_stable_review_frame_425.png`。

### 残課題

stable frame 探索は CHASE popup に限定している。次は boss cue、BOMB cue、Active DEF cue など、評価者が見たい別イベントにも同じ「安定 frame を探して渡す」手順を広げられる。
