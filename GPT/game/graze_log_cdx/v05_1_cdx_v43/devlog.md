# graze_log v05.2_cdx_v43 devlog

## 2026-05-21 Codex v43: 評価 ledger export と JSONL 保存

### 背景

v42 では graze_log 側に `route / aggressive / defensive / panic` の bot policy split を追加し、shot_log と同じ比較軸に載せた。ただし比較結果は標準出力に出るだけで、次の版と比較する保存物になっていなかった。

### 実装

- `v05_1_cdx_v43/index.html` を v42 から派生。
- 表示名を v43 に更新。
- `GAME_VERSION = v05_1_cdx_v43` と `EVAL_METHOD_VERSION = graze-ledger-v001` を追加。
- `summarizeEvalTelemetry()` に `version`, `evalMethod`, `seed`, `phaseCoverage`, `riskEconomyScore`, `traceDigest` を追加。
- `exportEvalLedger()` を追加し、headless から summary / routeLog / events / samples を取得可能にした。
- `tools/headless_graze_log_cdx_v05_2_v43_check.js` を追加し、v43 の ledger export と従来の clear / route / policy split 条件を検証する。
- `tools/headless_game_style_compare_v003.js` を追加し、shot_log と graze_log v43 の比較結果を `memory/raw/game_eval/graze_log_style_compare.jsonl` に追記する。

### 戻す場合

v43 の `GAME_VERSION` / `EVAL_METHOD_VERSION` / `exportEvalLedger()` / summary 追加項目と、v43 用 headless scripts を取り除けば v42 相当に戻せる。ゲーム内容や敵配置は v42 から変えていない。

### 次の課題

- JSONL の最新2版を比較する script を作る。
- trace digest の差分を読んだうえで、敵配置や boss cue の本質的な改善に戻る。
- `riskEconomyScore` は暫定指標なので、Nao_u の実プレイ感想と照合して解釈を修正する。
