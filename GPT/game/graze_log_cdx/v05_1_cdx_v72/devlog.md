# graze_log v05.2_cdx_v72 devlog

## 2026-05-24 Codex v72: cue-family review candidates

### 背景

v71 は CHASE popup の stable frame を policy 別に選べるようにした。継続 directive の焦点は headless のあり方なので、今回は gameplay を固定し、CHASE 以外の重要 cue も人間確認用 frame として選べるかを検証する。

### 実装

- `v05_1_cdx_v72` を v71 から派生。
- gameplay、敵配置、報酬、bot policy は変更なし。
- `index.html` の version 表記と source note を v72 化。
- v71 の headless check 群を v72 に複製。
- `tools/headless_graze_log_cdx_v05_2_v72_cue_review_check.js` を追加。
- cue review check は route / seed 12345 で `chasePopup` / `activeDef` / `bossCue` / `bomb` の event 周辺を探索し、3 frame window が安定している候補 frame を抽出する。
- 候補 frame は Chrome headless の DOM dump と screenshot で version / canvas contract / screenshot size を確認する。

### 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v72_check.js
node tools\headless_graze_log_cdx_v05_2_v72_policy_matrix_check.js
node tools\headless_graze_log_cdx_v05_2_v72_visual_probe_check.js
node tools\headless_graze_log_cdx_v05_2_v72_stable_review_check.js
node tools\headless_graze_log_cdx_v05_2_v72_policy_review_check.js
node tools\headless_graze_log_cdx_v05_2_v72_cue_review_check.js
```

### 結果

6 本とも pass。

- `check`: route clear、BOMB / Active DEF / boss cue / policy split / density / visual telemetry を維持。
- `policy_matrix_check`: route / aggressive / defensive / panic / novice / marksman / survival / camper の multi-seed matrix が pass。
- `visual_probe_check`: CHASE popup bare-canvas pixel probe と review surface が pass。
- `stable_review_check`: route の stable CHASE review frame を検出し、DOM contract と screenshot contract が pass。
- `policy_review_check`: route / aggressive / marksman の policy 別 stable review candidate と DOM/screenshot contract が pass。
- `cue_review_check`: `chasePopup` 425f、`activeDef` 1138f、`bossCue` 4693f、`bomb` 4705f を stable candidate として選び、4 family の browser contract が pass。

`cue_review_check` は `.tmp/graze_log_cdx_v72_cue_review/` に screenshot を生成し、`memory/raw/headless_eval/graze_log_cdx_cue_review.jsonl` に raw result を追記する。

### 次

cue family review を policy 別に広げる。候補は route / aggressive / marksman / survival の BOMB と boss cue 比較。
