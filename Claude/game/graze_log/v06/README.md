# graze_log v06 — A-1 anticipation telegraph (敵 spawn 前 30F 予兆 + readability 3 層完成)

**status**: v05 beta B-2' (C189 = `90adecd15 ash: graze_log v05 beta B-2'`) からの **削除可能改良 1 個刻み**。C190 brainstorm 18 案中、群A (経路A 完成度向上) の最小案 A-1 を採択し実装。

## 採択した 1 機構

「敵が出現する 30 frame 前から、出現座標の x 軸位置に薄い円を画面上端で膨張描画する」

v05 beta では弾発射前 10 frame の windup telegraph (B-2') と全弾常時軌跡 (v05 alpha, telegraph 層) が揃っていた。v06 はその一段手前、**敵がまだ画面に出ていない段階での予兆**を追加する。これで readability の 3 層が完成する:

| 層 | 名称 | 範囲 | 出典 (v06 commit) |
|---|---|---|---|
| 1 | **anticipation** | spawn 前 30F | 本案 (v06 A-1) |
| 2 | **telegraph** | 弾発射後の全弾軌跡 | v05 alpha (`34814472e`) |
| 3 | **windup** | 弾発射前 10F | v05 beta B-2' (`90adecd15`) |

3 層が揃うことで、プレイヤーは「弾が来る → 弾が動く」の 2 ステップではなく、「敵が来る → 弾が来る → 弾が動く」の 3 ステップで弾幕を予測できる。M-37 brainstorm の MPS 採点では本案は 6/15 と低いが、**readability 3 層を完成させる最後の 1 機構**という構造的位置で採択された。

## なぜ A-1 か (採点ではなく構造で選んだ理由)

v06/brainstorm.md §「採点では B-2 / C-1 が高いが、守の段階整合性で A-1 が抜ける」で示した通り、MPS 採点だけ見れば B-2 (Hyper Activation, 9点) や C-1 (Witch Time, 8点) が上位だが、以下の制約で A-1 が選ばれた:

1. **守の段階整合性** (feedback_clone_strategy.md t:5) — Psyvariar 経路 (経路A) の完成度向上を継続中。経路B (CAVE/bullet-cancel) への横移動は「型の獲得」ではなく「型の切り替え」になる。
2. **core が 'fun' と確定していない状況** — v05 beta B-1/B-2/B-2' まで shipped、Nao_u 評価未受領。Phase 1 外部検索 (gamedeveloper / gamedesignskills / Codecks) の業界標準ヒューリスティック「core mechanic deepen first, slowly add one piece at a time」「large gameplay changes avoided unless absolutely necessary」が A 経路継続を支持。
3. **prior_art_30 既検証の Touhou spell card anticipation** — Touhou の spell card 開始 telegraph は spawn 前 readability の直接先行事例。M-41 検証 (URL + 引用文抜粋) 強く立つ。
4. **削除可能改良 1 個刻み範囲** — 差分行数 34 (内 functional ~25, comment ~9)。30 行境界線上だが、機構の独立性は高く v06 → v05 beta への戻しは 6 箇所の削除で完了。

経路B 試行 (B-2 Hyper Activation) は v07 以降の課題として brainstorm.md に記録済。

## v05 beta → v06 の差分 (6 箇所)

### 変更した 6 箇所 (functional)

1. **`ANTICIPATION_FRAMES=30` 定数追加** (`index.html:111`) — anticipation 窓の frame 数
2. **`state.pendingEnemies:[]` 追加** (`index.html:120`) — anticipation queue
3. **`spawnEnemy()` 改修 + `emitEnemy()` 新設** (`index.html:203-213`) — 直接 push を queue 経由に
4. **`startGame()` reset 追加** (`index.html:223`) — retry 時の queue クリア
5. **`update()` 内 spawn gate + pendingEnemies tick** (`index.html:409, 414-417`) — gate に `pendingEnemies.length===0` 追加、tick で countdown→emit
6. **`draw()` 内 anticipation 描画ブロック** (`index.html:599-609`) — pending 各要素に膨張円描画
7. (補助) タイトル文字列 (`index.html:5, 811`) — v05→v06 表記

### 触っていない既存機構 (v05 beta と完全同一)

- 自機操作・graze 半径・hit 半径
- BOMB 挙動・gauge 蓄積/閾値
- Psyvariar grazeStreak → active 防御
- `spawnWave1..4` / wave 5+ rhyme 分岐 (B-1)
- 弾パターン `aimed` / `fan3` 分岐 (B-2)
- 弾発射 windup telegraph (B-2')
- 全弾常時軌跡 (v05 alpha)
- 敵移動速度・onHit 段階ダメージ
- seed 再現性 (mulberry32)
- `onGraze()` 内の score/gauge/active 防御

## 戻し方 (削除可能性の保証)

v06 → v05 beta B-2' に戻すには:

1. `const ANTICIPATION_FRAMES=30;` と前後コメントを削除 (1 箇所、4 行)
2. `pendingEnemies:[]` を `state` から削除 (1 行)
3. `spawnEnemy()` 内を `if(type==='small'){...}else{...}` に戻す (v05 形)、`emitEnemy()` 関数を削除 (合計 ~10 行)
4. `startGame()` の `state.pendingEnemies.length=0;` を削除 (1 行)
5. `update()` 内 spawn gate `&&state.pendingEnemies.length===0` を削除 + pending tick ブロック削除 (4 行)
6. `draw()` 内 anticipation 描画ブロックを削除 (~11 行)
7. タイトル/コメントを v05 beta 表記に戻す (2 箇所)

合計 **6 箇所、約 30 行**。残りは v05 beta と同一バイト列。

## 設計の細部 (実装メモ)

### spawn gate と pendingEnemies の協調

v05 では `state.spawnT<=0 && state.enemies.length<3` で次 wave 発火。v06 では `&& state.pendingEnemies.length===0` を追加。理由: 現 wave がまだ pending な状態 (anticipation 中) で次 wave を spawn すると、anticipation 円が画面に多数出て画面情報密度が破綻する。pending が捌けるまで次 wave を待たせる。副作用として wave 間の間隔が ANTICIPATION_FRAMES (30F = 0.5s) 延びる — 1 wave あたり ~2.5s なので体感影響は小さい。

### anticipation 描画位置

敵の spawn 座標は `y=-12` (small) / `y=-16` (medium) で画面外。よって anticipation 円を spawn 座標に描いても見えない。代わりに **画面上端付近の固定 y** (`y=14` small / `y=18` medium) に出現 x の円を描く。これにより「ここから敵が降ってくる」が視覚的に明示される。

### alpha curve

`alpha = 0.4 * (1 - countdown/ANTICIPATION_FRAMES)` で 0 → 0.4 に escalation。countdown が 30 (出現 30F 前) で alpha=0、countdown=0 (出現直前) で alpha=0.4。これによりプレイヤーは「ぼんやり何かある」→「はっきり輪郭」→「敵出現」を 0.5s で読める。

### 円半径の膨張

`r = baseR * (0.4 + 0.8 * t)` で `t = 1 - countdown/30`。t=0 で r=baseR*0.4 (例: small=9*0.4=3.6)、t=1 で r=baseR*1.2 (例: small=9*1.2=10.8)。実 enemy の半径 (small=9, medium=13) よりわずかに大きい状態で出現が完了するので、視覚的な連続性がある。

## 判定方針

**headless 数値 (到達率/生存秒/成功率) は judgment / cross_review / Slack の根拠にしない**

根拠: `feedback_headless_unfit_for_unfinished_eval.md` t:5 (Nao_u 2026-05-09 三度目「やめて」)。本 v06 でも同様。anticipation 描画の効果は AI 自プレイ (Stage 4) と Nao_u 評価で判定する。

**self_judgment.md / predicted_play.md / cross_review 書面は v06 では作らない**

Phase 4 の目的は **playable diff 1 機構** を出すこと。Stage 3 (実装後の予測) / Stage 4 (AI 自プレイで「良い」と確信) は次サイクル以降。

## 接続先

- `game/graze_log/v05/` — v06 の 6 箇所を v05 beta 形に戻した状態
- `game/graze_log/v05/README.md` — 全弾常時軌跡 (readability 3 層の第 1 層 = telegraph)
- `game/graze_log/v05/devlog.md` §12 — windup telegraph (readability 3 層の第 2 層 = windup)
- `game/graze_log/v06/brainstorm.md` — 18 案比較表 + A-1 採択の 1 行確信宣言
- `game/graze_log/v04/prior_art_30.md` — 30 件既検証の引用付き先行事例集
- `knowledge/20260519_bullet_hell_anticipation_windup_telegraph_readability_three_layers.md` — readability 3 層分解の起源
- `knowledge/20260519_bullet_hell_two_paths_psyvariar_graze_vs_cave_cancel_three_independent_signals.md` — 経路A/B の独立性
- `memory/feedback_clone_strategy.md` t:5 — 守の通過点での 1 個刻み制約
- `memory/feedback_means_ends_reversal_check.md` t:5 — playable diff 第一義原則
- `memory/feedback_prior_art_citation_must_verify.md` t:5 — M-41 引用検証
- `memory/feedback_headless_unfit_for_unfinished_eval.md` t:5 — 判定根拠から headless を外す

— Ash (Win2) 2026-05-19 C191 Phase 4
