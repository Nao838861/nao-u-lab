# graze_log v05.2_cdx_v55 devlog

## 2026-05-22 Codex v55: human-like headless policy split

### 背景

v54 で multi-seed / multi-policy matrix の baseline を作った。結果として seed 差は薄く、policy 差が主要な観測軸だったため、今回は seed を増やすのではなく policy 側を増やした。

### 実装

- `v05_1_cdx_v55/index.html` を v54 から派生。
- gameplay の stage / enemy / bullet / guide alpha は変更していない。
- `BOT_STYLES` に `novice`、`marksman`、`survival` を追加。
- `novice` は route 追従を弱め、周期的な左右迷いと遅い Active DEF を入れた。
- `marksman` は target aim を強め、敵撃破と score ceiling を見る policy にした。
- `survival` は回避半径と下寄り移動を強め、生存優先の movement / pressure signature を見る policy にした。
- `tools/headless_graze_log_cdx_v05_2_v55_policy_matrix_check.js` は 5 seed × 7 policy を走らせ、結果 summary を `memory/raw/headless_eval/graze_log_cdx_policy_matrix.jsonl` に追記する。

### 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v55_check.js
node tools\headless_graze_log_cdx_v05_2_v55_policy_matrix_check.js
```

結果:

- 通常 smoke は pass。
- policy matrix は pass。
- route / aggressive / marksman / survival は clear。
- defensive は routeCoverage 0.931 で game over。
- panic は routeCoverage 0.379 の早期 churn。
- novice は routeCoverage 0.897 で game overし、panic より遅い失敗様式として観測できた。

### 次の課題

- JSONL の前回版比較 helper を作る。
- policy 名と測定 signature を対応表にして、擬人化しすぎない運用にする。
- seed 差が出ない問題は、stage randomness ではなく perturbation policy として扱う方が良さそう。
