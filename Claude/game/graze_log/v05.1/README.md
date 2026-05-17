# graze_log v05.1 — 弾速 ±10% evolve (Sparen rhythm 崩し試作)

**status**: v05 (`game/graze_log/v05/`) からの **削除可能改良 1 個刻み**。Phase 1 §6 外部検索 (Boghog / Sparen / SHMUP Creator) で精密化された改修候補3つのうち、最も実装コスト低い 1 案を playable diff 化。

## 採択した 1 機構

「medium enemy の発射弾の base speed を、各 enemy の発射回数 (firedCount) で段階 evolve させる」

- 1-3 発目: `sp = 2.4 * 0.9 = 2.16` (緩弾)
- 4 発目以降: `sp = 2.4 * 1.1 = 2.64` (速弾)

各 enemy の time-axis で evolve するため、wave 全体の位相は共有しない。複数 medium がいる wave では「ある弾は遅く、ある弾は速い」混合状態が出る。

## なぜ「弾速 ±10% evolve」か (v04/v05 評価との接続)

- Nao_u 2026-05-14 23:00 ts=1778767221「shot_log のようなリズム/バリエーション必要」への Log 独自軸の playable 応答
- Mir v05 は「全弾常時軌跡 = 予測の恒常化」で variation の片端を埋めた。v05.1 は「予測前提の崩し」で逆端を埋める意図
- Sparen Guide A2「evolveパターンで dodge リズム形成を阻害」+ Boghog「速度の加減速段階で mental adjustment 継続」を最小実装

## v05 → v05.1 の差分 (4 箇所)

1. **コメントブロック追加** (L96-110 相当): `=== v05.1 MOD: 弾速 ±10% evolve ===` と定数 `EVOLVE_SLOW=0.9 / EVOLVE_FAST=1.1 / EVOLVE_FIRED_TH=3` 宣言
2. **spawnEnemy() 内** (L196-200 相当): enemy オブジェクトに `firedCount:0` 追加
3. **update() 内 medium enemy 発射部** (L408-413 相当): `e.firedCount++` + `const sp = 2.4 * (e.firedCount > EVOLVE_FIRED_TH ? EVOLVE_FAST : EVOLVE_SLOW)`
4. **タイトル文字列** (`index.html:5` + drawTitle L709 相当): 「v05 beta — 全弾常時軌跡 + 敵配置 rhyme」→「v05.1 — 弾速 ±10% evolve」

### 触っていない既存機構 (v05 と完全同一)

- 自機操作・graze/hit 半径・BOMB / Psyvariar active def
- 敵スポーン構成 (`spawnWave1..4` + wave>=5 rhyme 70%)
- 全弾常時軌跡 (Mir 案、grazedT クランプ)
- seed 再現性 / score/gauge 系
- `e.fireT` のクールダウン (70 + rng*40 フレーム)
- 軌跡描画 (常時 fade=1.0)

## 戻し方 (削除可能性の保証)

v05.1 → v05 に戻すには:

1. `EVOLVE_SLOW / EVOLVE_FAST / EVOLVE_FIRED_TH` 定数とコメントブロックを削除
2. `spawnEnemy()` の `firedCount:0` 2 箇所削除
3. 発射部の `e.firedCount++` と `sp = 2.4 * (...)` を `const sp=2.4;` に戻す
4. タイトル文字列を v05 表記に戻す

合計 **4 箇所、約 10 行**。残りは v05 と同一バイト列。

## 判定方針

`feedback_headless_unfit_for_unfinished_eval.md` t:5 順守 (Nao_u 2026-05-09 三度目「やめて」)。headless 数値 (到達率/生存秒) は judgment / cross_review / Slack の根拠にしない。本 v05.1 でも同様。

採用判定の根拠は `devlog.md` §5 (1 段落、自己判定)。Nao_u フィードバック後に v05.2 / v06 比較版の必要性を再判定する。

## 接続先

- `game/graze_log/v05/` — 本実装の 4 箇所を v05 表記に戻した状態
- `game/graze_log/v05.1/devlog.md` — Mental Sim / v05 比較 / 採用判定の詳細
- `memory/feedback_clone_strategy.md` t:5 — 守の通過点での 1 個刻み制約
- `memory/feedback_headless_unfit_for_unfinished_eval.md` t:5 — 判定根拠から headless を外す
- `log/cycle_staging_log.md` C199 Phase 3 §6 — 本 Phase 4 大作業の起源と完遂条件
- Phase 1 §6 出典 (`devlog.md` §0 参照): Boghog cohost.org / Sparen ph3tutorials / SHMUP Creator
