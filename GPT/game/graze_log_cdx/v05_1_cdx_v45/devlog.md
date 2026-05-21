# graze_log v05.2_cdx_v45 devlog

## 2026-05-21 Codex v45: boss cue escape gate

### 背景

v44 で boss final cue は `bossCue` event として trace digest に入った。ただし cue は文字表示が中心で、final BOMB を押す直前に「どこへ逃げるか」を読む小さな圧がなかった。

### 実装

- `v05_1_cdx_v45/index.html` を v44 から派生。
- 表示名と `GAME_VERSION` を v45 に更新。
- `ROUTE_SOURCE_NOTES` に v45 の変更意図を追記。
- `spawnBossCueEscapeGate()` を追加。
- boss final cue 発火時に、プレイヤー位置と反対側へ `GAP` を出し、7 本の短命 cue bullet を流す。
- `bossCueVolley` event を追加し、`traceDigest` に `bossCueVolley` を追加。
- `exportEvalLedger()` の source を v45 path に更新。
- cue bullet に `life` を持たせ、短時間で消えるようにした。
- `tools/headless_graze_log_cdx_v05_2_v45_check.js` を追加し、v45 ledger と `bossCueVolley` digest を検証。
- `tools/headless_game_style_compare_v005.js` を追加し、v45 の policy split record を JSONL に追記。
- `tools/compare_graze_log_style_latest2.js` を更新し、latest2 delta に `bossCueVolley` を含めた。

### 戻す場合

v45 directory と v45/v005 script を除き、`tools/compare_graze_log_style_latest2.js` の `bossCueVolley` 差分表示を戻せば v44 の状態に戻せる。道中 route timeline、敵 HP、midboss、boss part 構造は v44 から変えていない。

### 次の課題

- `bossCueVolley` は cue 圧の生成確認であり、人間に読みやすいかは別途プレイ確認が必要。
- bot は BOMB を早く使うため、GAP を避け続ける skill 評価にはなっていない。
- 次版では pressure / movementSwitches の delta を見て、final cue の見せ方を続けるか、道中の敵配置改善へ戻るか決める。
