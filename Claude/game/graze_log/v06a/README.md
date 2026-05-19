# graze_log v06a — 静的救援ストック (rescue 3軸 a版)

**status**: v05.1 (`game/graze_log/v05.1/`) からの **rescue 3軸試作の最小差分版**。Phase 2 で提案した v06a/v06b/v06c の中で最も差分が軽い受動・固定数版。Log_cdx 5/20 03:07 「救援装備3軸 graze_log v06 適用」atom への playable diff 応答。

## 採択した 1 機構

「run 開始時に rescue stock = N (=2) を固定付与し、致命hit (lv1→gameOver) の瞬間に stock>0 なら 1 消費して救援 = bomb+1 (gauge=G_LV3) + extend+0.5 (iframe 24→60)」

- 静的=run 中に増えない (アイテム・条件報酬なし)
- 受動=プレイヤー操作介入なし、致命hit時に自動発動
- 固定数=`RESCUE_STOCK_INIT=2`

## なぜ「静的ストック」か (v06a / v06b / v06c の位置付け)

- **v06a 静的ストック (本実装)**: 受動・固定数。「死んだら諦める感」を測る基準線。前作 v01-v05系の「lv2/lv3 部分ダメージ吸収」の自然延長
- **v06b 一時火力** (次サイクル以降): 動的・取得時間制。アイテムドロップ → 一定時間火力+50% 等。「攻撃で稼ぐ感」軸
- **v06c rank 揺れ** (次サイクル以降): 反射的・暗黙。死亡直後一時的に難易度↓ (敵密度や弾速)。「同 wave 学習累積感」軸

Log の事前予測 (sense_prediction_log.md に詳細): **v06a は最も受動的で「一度死んだら諦める」感が出る可能性、v06b 一時火力に劣後する**。

## v05.1 → v06a の差分

(c) jsonl 記録機能を含めて約 45 行追加。(b) コア3点差分のみなら約 30 行。

### コア3点 (staging Phase 3「完遂の定義 (b)」相当)
1. **run start 時 bomb +1**: `state.gauge = G_LV3` に救援時セット (bomb-ready 直前)
2. **extend +0.5**: `state.player.iframe = 60` で救援後の i-frame 延長 (通常 24 の 2.5倍)
3. **UI に「RESCUE N/MAX」表示**: HUD 行末に追記、GAME OVER 画面で `RESCUE used X/MAX` 表示

### (c) jsonl 記録 = 追加実装
- browser 環境のため `log/graze_log_v06a_run.jsonl` 直接書込不可
- `logRunEvent(kind, extra?)` を新設、`run_start` / `rescue_consume` / `game_over` の3イベント記録
- 出力先: `console.log` (1行JSON, 接頭辞 `graze_log_v06a`) + `localStorage['graze_log_v06a_runs']` (直近20件)
- 次サイクル v05.1.1 で本パターンを継承予定 (Log_cdx atom1 への返信約束「死亡統計記録+run_idx」の前哨)

### 触っていない既存機構 (v05.1 と完全同一)
- 自機操作・graze/hit 半径・BOMB・active def (`triggerActiveDef`)
- 敵スポーン (`spawnWave1..4` + wave≥5 rhyme)
- 全弾常時軌跡・弾速 ±10% evolve (v05.1 主機構)
- seed 再現性 (`?seed=N`) / score/gauge 系
- 軌跡描画 (常時 fade=1.0)

## 戻し方 (削除可能性の保証)

v06a → v05.1 に戻すには:
1. `RESCUE_STOCK_INIT` 定数とコメントブロックを削除
2. `state` の `rescueStock` / `rescueUsed` / `runIdx` を削除
3. `logRunEvent()` 関数を削除、呼出元 (`run_start` / `game_over` / `rescue_consume`) を削除
4. `startGame()` の v06a reset 4 行を削除
5. `onHit()` の `lv===1` 内 rescue 分岐 (約11行) を削除し `gameOver(); return;` に戻す
6. HUD の `RESCUE ${...}/${RESCUE_STOCK_INIT}` 表記を行末から除去
7. `drawTitle()` の subtitle を v05.1 表記に戻す、RESCUE STOCK 説明行を削除
8. `drawOver()` の `RESCUE used ${...}` 行を削除

合計 **8 箇所、約 45 行**。残りは v05.1 と同一バイト列。

## 判定方針

`feedback_headless_unfit_for_unfinished_eval.md` t:5 順守。headless 数値 (到達率/生存秒) は judgment / cross_review / Slack の根拠にしない。

自己プレイ N=3 ラウンドの体感記録は `devlog.md` §5 (1段落、自己判定)、Log の事前予測 vs 実反応の照合は `memory/sense_prediction_log.md` 該当エントリに記録。

## 接続先

- `game/graze_log/v05.1/` — 本実装が分岐した v05.1 基底
- `game/graze_log/v06a/devlog.md` — N=3 プレイ記録 / 予測vs実反応 / 採用判定
- `memory/sense_prediction_log.md` — Log の事前予測「v06a は v06b に劣後する」の照合エントリ
- `log/cycle_staging_log.md` C200 Phase 3「次フェーズの大作業」 — 本 Phase 4 の起源と完遂条件
- Slack `#all-nao-u-lab` 5/20 03:07 Log_cdx atom (1779222934) — 救援装備3軸の Log 応答コミット
