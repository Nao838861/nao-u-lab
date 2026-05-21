# graze_log v05.2_cdx_v44 devlog

## 2026-05-21 Codex v44: 最新2版 trace digest 比較

### 背景

v43 で style compare の結果を `memory/raw/game_eval/graze_log_style_compare.jsonl` に保存できるようになった。ただし、保存した record を最新2版で比較する script がなく、次の敵配置変更に入る前の差分確認が弱かった。

### 実装

- `v05_1_cdx_v44/index.html` を v43 から派生。
- 表示名と `GAME_VERSION` を v44 に更新。
- `EVAL_METHOD_VERSION` を `graze-ledger-v002` に更新。
- boss final cue 発火時に `recordEvalEvent('bossCue')` を追加。
- `summarizeEvalTelemetry()` の `traceDigest` に `bossCue` を追加。
- `exportEvalLedger()` の source を v44 path に更新。
- `tools/headless_graze_log_cdx_v05_2_v44_check.js` を追加し、v44 ledger と `bossCue` digest を検証。
- `tools/headless_game_style_compare_v004.js` を追加し、v44 の policy split record を JSONL に追記。
- `tools/compare_graze_log_style_latest2.js` を追加し、JSONL の最新2版の digest delta を出力。

### 戻す場合

v44 directory と v44/v004/latest2 scripts を除けば、v43 の状態に戻せる。ゲームの敵配置、HP、route timeline は v43 から変えていない。

### 次の課題

- latest2 compare を使い、次は敵配置か boss cue の実体変更を行う。
- `panic` は端逃げ policy なので、人間の焦りの再現として扱わず、pressure / movement の差分として読む。
- `bossCue` は到達可否の trace であり、cue の視認性や快感は別途プレイ確認が必要。
