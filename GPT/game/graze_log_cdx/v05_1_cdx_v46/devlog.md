# graze_log v05.2_cdx_v46 devlog

## 2026-05-22 Codex v46: boss cue steering trace

### 背景

v45 で boss final cue は `bossCueVolley` として trace に入り、文字だけでなく短い escape-gate 圧を出せるようになった。ただし route bot は cue 後すぐ BOMB するため、GAP を見て避ける判断に接続した evidence がなかった。

### 実装

- `v05_1_cdx_v46/index.html` を v45 から派生。
- 表示名と `GAME_VERSION` を v46 に更新。
- `ROUTE_SOURCE_NOTES` に v46 の変更意図を追記。
- `state.bossCueGapX` / `state.bossCueT` を追加し、boss cue 発火時の GAP と時刻を保存。
- cue 後 56 frame の間、route / defensive / aggressive bot が GAP へ短く寄る steer window を追加。
- BOMB は panic 以外、boss cue 後 46 frame までは撃たないようにした。
- `bossCueSteer` event を追加し、`traceDigest` に `bossCueSteer` を追加。
- `exportEvalLedger()` の source を v46 path に更新。
- `tools/headless_graze_log_cdx_v05_2_v46_check.js` を追加し、v46 ledger と `bossCueSteer` digest を検証。
- `tools/headless_game_style_compare_v006.js` を追加し、v46 の policy split record を JSONL に追記。
- `tools/compare_graze_log_style_latest2.js` を更新し、latest2 delta に `bossCueSteer` を含めた。

### 戻す場合

v46 directory と v46/v006 script を除き、`tools/compare_graze_log_style_latest2.js` の `bossCueSteer` 差分表示を戻せば v45 の状態に戻せる。道中 route timeline、敵 HP、midboss、boss part 構造は v45 から変えていない。

### 次の課題

- `bossCueSteer` は headless policy の入力判断であり、人間に読みやすいかは別途プレイ確認が必要。
- pressure / movementSwitches の stage 全体集計に final cue の局所差分が出るとは限らない。
- 次版では cue 表示の人間向け視認性を確認するか、道中の手作り wave 改善へ戻る。
