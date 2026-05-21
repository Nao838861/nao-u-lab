# graze_log v05.2_cdx_v41 devlog

## 2026-05-21 Codex v41: headless 評価 telemetry を追加

### 背景

Nao_u から「shot_log と改変版を headless で遊ばせ、どちらが良いゲームか、どこがどう変わったかを評価する方法を確立してほしい」と指示があった。v40 までの headless は clear / flag 発火 / BOMB 使用の検証には使えていたが、プレイスタイルや緩急の比較には情報が足りなかった。

### 実装

- `state.evalTelemetry` を追加。
- 30 frame ごとに player position / gauge / chain / enemy count / enemy bullet count / pressure / phase / targetVisible を記録。
- route / kill / shieldHit / bomb / activeDef / clear / gameOver を sparse event として記録。
- `summarizeEvalTelemetry()` を追加し、target uptime、urgent rate、danger spikes、movement switch、route coverage を返すようにした。
- v40 のルール、敵配置、BOMB、relay route commit は変更していない。
- `tools/headless_graze_log_cdx_v05_2_v41_check.js` を追加し、v41 の既存成立条件と telemetry 条件を検査。
- `tools/headless_game_style_compare_v001.js` を追加し、`shot_log_cdx/v01_from_bd6c65a/headless.py` と v41 の HTML bot telemetry を同じ比較レポートにまとめた。

### 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v41_check.js
node tools\headless_game_style_compare_v001.js
```

結果:

- v41 bot は `mode=clear`、`grade=S`、`killCount=140`、`maxChain=18`、`bombCount=1`。
- telemetry は `sampleCount=144`、`eventCount=171`、`routeCoveragePct=1`。
- style vector は `targetUptime=0.669`、`urgentPct=0.036`、`maxThreat=0.949`、`dangerSpikes=21`、`horizontalSwitches=233`。
- shot_log 側は center/aggressive/defensive/sweeper の 4 policy で比較でき、center は defensive より長く、sweeper は即崩壊し、BOMB 使用も policy ごとに分かれた。

### 戻し手順

1. `state.evalTelemetry` と関連関数を削除する。
2. `fireBomb` / `triggerActiveDef` / `update` / `killEnemy` / `onHit` の `recordEvalEvent` 呼び出しを削除する。
3. v41 headless check と style compare script を削除する。

### 次の評価課題

- graze_log 側にも複数 bot style を追加する。現状は route-targeting bot 1本なので、shot_log の policy split ほど強くない。
- 「良い/悪い」は telemetry 単体で断定せず、人間が問題にした体感差と照合する。
- comparison report を JSONL に保存し、バージョン間で diff できるようにする。
