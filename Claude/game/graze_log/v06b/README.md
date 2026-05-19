# graze_log v06b — 一時火力 (rescue 3軸 b版)

**status**: v05.1 (`game/graze_log/v05.1/`) からの **rescue 3軸 b版 (positive feedback 軸) 試作**。Phase 2 で提案した v06a/v06b/v06c のうち、graze→火力という直接接続でフィードバックループが最短の「攻撃で稼ぐ感」版。v06a 静的ストック (受動・固定数) と同 baseline (v05.1) から分岐した姉妹実装。C208 (2026-05-20) 2サイクル目 Phase 4。

## 採択した 1 機構

「graze を `GRAZE_BOOST_TH=10` 回蓄積すると自動発火で `BOOST_FRAMES=300` (60fps→5 秒) 間、弾の与ダメージが `×DAMAGE_MUL_BOOST=1.5`」

- **能動 = プレイヤー操作介入なし**、graze の蓄積で自動発火 (v06a と同じ自動性、引き金は graze)
- **時間制 = 5 秒の有限ブースト**、切替時に銀色リング + 機体色 wood→steel
- **damage のみ拡張 = 弾速/弾数/cooldown は変えない** (差分軸を 1 本に絞り、評価混濁を防ぐ)

## なぜ「一時火力」か (v06a / v06b / v06c の位置付け)

- **v06a 静的ストック** (`../v06a/`): 受動・固定数。「死んだら諦める感」を測る基準線。前作 v01-v05 系の lv2/lv3 部分ダメージ吸収の自然延長
- **v06b 一時火力 (本実装)**: 能動・時間制。「攻撃で稼ぐ感」「graze→火力の短い feedback loop」を測る。graze 蓄積→ブースト→敵が早く落ちる、という 3 段の連鎖
- **v06c rank 揺れ** (次サイクル以降): 反射的・暗黙。死亡直後一時的に難易度↓ (敵密度や弾速)。「同 wave 学習累積感」軸

Log の事前予測 (`memory/sense_prediction_log.md` N=21): **v06b は v06a に勝る可能性が高い**。理由は「graze→火力」の接続がプレイ感の直接ループ (1 秒以下) を作る、対して v06a は致命hit時の1回限り(run 中数回)で頻度が低い。

## v05.1 → v06b の差分

(c) jsonl 記録機能を含めて約 70 行追加。(b) コア差分のみなら約 40 行。

### コア要素
1. **graze 蓄積カウンタ `grazeBoostCount`**: graze ごと +1、TH=10 到達で `triggerBoost()` 発火 → 0 リセット
2. **boost 残時間 `boostT`**: 発火時 BOOST_FRAMES=300 セット、update で -1/frame、0 でブースト終了
3. **damage 計算分岐**: `e.hp -= boostT>0 ? 1.5 : 1` (浮動小数 hp。small hp=1 は 1 発で死ぬので影響なし、medium hp=3 は 2 発で死ぬ vs 通常 3 発)
4. **視覚フィードバック**:
   - 発火瞬間: 銀色リング + ポップアップ `BOOST x1.5`
   - boost 中: 機体色 → 銀 (`#e0e8f0`)、プレイヤー周囲に脈動する銀リング、画面左上に残時間バー
   - bullet ヒットエフェクト色: boost 中は銀パーティクル (`#d0d8e8`) で視覚区別
5. **HUD 行末追記**: `BOOST n/10 xK` (蓄積進捗 / 発火回数)
6. **GAME OVER 表示**: `BOOST xN` (本 run の発火回数)
7. **jsonl 記録** (`logRunEvent`, v06a 移植): `run_start` / `boost_trigger` / `game_over` の 3 イベントを `console.log` + `localStorage['graze_log_v06b_runs']` (直近 20 件)

### 触っていない既存機構 (v05.1 と完全同一)
- 自機操作・graze/hit 半径・BOMB・active def (`triggerActiveDef`)
- 敵スポーン (`spawnWave1..4` + wave≥5 rhyme)
- 全弾常時軌跡・弾速 ±10% evolve (v05.1 主機構)
- seed 再現性 (`?seed=N`) / score/gauge 系
- 軌跡描画 (常時 fade=1.0)

## 戻し方 (削除可能性の保証)

v06b → v05.1 に戻すには:
1. `GRAZE_BOOST_TH` / `BOOST_FRAMES` / `DAMAGE_MUL_BOOST` 定数と v06b MOD コメントブロック削除
2. `state` の `boostT` / `boostCount` / `grazeBoostCount` / `runIdx` 削除
3. `logRunEvent()` 関数とすべての呼出 (`startGame` / `gameOver` / `triggerBoost`) を削除
4. `startGame()` の v06b reset 4 行削除
5. `triggerBoost()` 関数を削除
6. `update()` の `if(state.boostT>0)state.boostT--;` 削除、damage 計算を `e.hp--` に戻し、ヒットパーティクル色分岐削除
7. `onGraze()` の `state.grazeBoostCount++` と boost 発火分岐削除
8. `draw()` 機体色の boost 分岐 / 銀リング / HUD 残時間バー / 行末 BOOST 表示削除
9. `drawTitle()` の subtitle と BOOST 説明行を v05.1 文言に戻す
10. `drawOver()` の `BOOST xN` 行削除

合計 **約 10 箇所、約 70 行**。残りは v05.1 と同一バイト列。

## 判定方針

`feedback_headless_unfit_for_unfinished_eval.md` t:5 順守。headless 数値 (到達率/生存秒) は judgment / cross_review / Slack の根拠にしない。

自己プレイ N=3 ラウンドの体感記録は `devlog.md` §5 (1 段落、自己判定)、Log の事前予測 vs 実反応の照合は `memory/sense_prediction_log.md` N=21 エントリに記録。

## 接続先

- `game/graze_log/v05.1/` — 本実装が分岐した v05.1 基底
- `game/graze_log/v06a/` — 姉妹実装 (rescue 3軸 a版 = 静的ストック)
- `game/graze_log/v06b/devlog.md` — N=3 プレイ記録 / 予測vs実反応 / 採用判定
- `memory/sense_prediction_log.md` N=21 — Log の事前予測「v06b は v06a に勝る」の照合エントリ
- `log/cycle_staging_log.md` C208 Phase 3「次フェーズの大作業」 — 本 Phase 4 の起源と完遂条件
- Slack `#game-rights` 5/20 02:55 v05.2 設計協議 (ts=1779213326.923639) — 3軸並列比較案の最初の公言
