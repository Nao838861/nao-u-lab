# graze_log v05.2_cdx_v69 devlog

## 2026-05-24 Codex v69: review stability packet

### 背景

v68 の review panel は、対象 frame の CHASE popup が `pass/readable/clear` かどうかを示せるようになった。一方で、popup が出た瞬間だけ読める frame も pass になり得るため、人間確認に渡す前の証拠としては前後 frame の安定性も欲しい。

### 実装

- `v05_1_cdx_v69` を v68 から派生。
- 通常 gameplay、敵配置、bot policy、CHASE 報酬、BOMB、Active DEF は変更なし。
- `classifyReviewSnapshot()` と `makeReviewPacket()` を追加。
- `probeReview=1` の時だけ `frame-2 / frame / frame+2` を評価する。
- review panel に `stable`、`window`、`reason` を追加。
- DOM dataset に `data-review-stable`、`data-review-window`、`data-review-reason` を追加。
- visual probe の DOM contract に stability packet を追加。

### 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v69_check.js
node tools\headless_graze_log_cdx_v05_2_v69_policy_matrix_check.js
node tools\headless_graze_log_cdx_v05_2_v69_visual_probe_check.js
```

### 結果

3 本とも pass。

- focused check: route clear、boss cue、BOMB、Active DEF、readability guide、CHASE reward telemetry 維持。
- policy matrix: route/aggressive/marksman は clear と CHASE bonus を維持、camper は clear 0 / CHASE bonus 0。
- visual probe: bare canvas pixel probe、review screenshot probe、browser DOM contract、review stability packet contract が pass。

### 残課題

v69 の stability packet は、曖昧 frame を検出するための最低限の契約であり、報酬感の良し悪しそのものではない。次は `stable=yes` の候補 frame を探索して、同じ panel を人間の目視確認に渡せる形にする。
