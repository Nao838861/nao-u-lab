# graze_log v06 — devlog (A-1 anticipation telegraph 実装記録 + brainstorm 採択経路 + 守の段階整合性)

**status**: v06 (`game/graze_log/v06/index.html`) 着地済、本書面 commit と同時 push 試行。本 devlog は (1) A-1 実装の自己記録、(2) brainstorm 18 案から A-1 採択に至った思考経路、(3) 守の段階整合性の自己検査、を 1 本にまとめる。

**起源**: C190 Phase 4 (`47257cb1b ash: C190 Phase 4 — v06/brainstorm.md path選択比較`) で 18 案 brainstorm.md が確定し、1 行確信宣言で「次サイクル (C191) で実装着手する案 = A-1 (anticipation telegraph)」と書面化された。本 C191 Phase 4 はその継承で、brainstorm 段階を実装段階に移すサイクル。

## §1. A-1 実装現況 (`v06/index.html`)

### 改変 6 箇所 + 補助 2 箇所 = 計 ~34 行 (functional ~25 + comment ~9)

| # | 場所 | 改変内容 | 行数目安 |
|---|---|---|---|
| 1 | `L108-111` | `const ANTICIPATION_FRAMES=30;` + 3 行コメント | 4 |
| 2 | `L120` | `state.pendingEnemies:[]` 追加 | 1 |
| 3 | `L203-213` | `spawnEnemy()` 改修 (queue push のみ) + `emitEnemy()` 新設 | 10 |
| 4 | `L223` | `startGame()` 内 `state.pendingEnemies.length=0;` | 1 |
| 5 | `L409, L414-417` | spawn gate `&&pendingEnemies.length===0` 追加 + pending tick 3 行 | 4 |
| 6 | `L599-609` | `draw()` 内 anticipation 描画ブロック | 11 |
| 7 (補助) | `L5` | `<title>` v05 beta → v06 | 1 |
| 8 (補助) | `L811` | `drawTitle()` 内サブタイトル v06 表記 | 1 |

合計 net insertions = 34 行 (`git diff --stat` ベース)。30 行境界線上だが、機構独立性は高く、6 箇所削除で v05 beta 同一バイト列に戻る。

### 触っていない既存機構 (v05 beta と完全同一)

- 自機操作・移動速度・shotCount/shotCooldownF
- graze 半径 (R_GRAZE=22) / hit 半径 (R_HIT=8)
- BOMB 挙動 (gauge 満タンで全画面弾消し) / gauge 蓄積方法 / 閾値 (G_LV2=35, G_LV3=99, G_MAX=208)
- Psyvariar grazeStreak → active 防御 (GRAZE_STREAK_TH=5, ACTIVE_DEF_FRAMES=60, ACTIVE_DEF_RADIUS=80)
- 全弾常時軌跡 (v05 alpha) — `GRAZE_TRAIL_FRAMES=90`, `b.grazedT=GRAZE_TRAIL_FRAMES` 常時クランプ
- 弾発射 windup telegraph (v05 beta B-2', WINDUP_FRAMES=10)
- 敵配置 rhyme (v05 beta B-1, spawnWave1..4 + wave 5+ 70% rng pick)
- 弾パターン rhyme (v05 beta B-2, `aimed` / `fan3` ABAB)
- 敵スポーン構成 (`spawnWave()` のロジック)
- 敵弾速度 (sp=2.4) / onHit 段階ダメージ
- 星空背景・particle・ring・popup
- seed 再現性 (mulberry32, ?seed=N で reproduce)
- `onGraze()` 内の score/gauge/active 防御 (graze の追加効果は温存)

### 設計の細部 (実装メモ)

- **spawn gate と pendingEnemies の協調**: `state.spawnT<=0 && state.enemies.length<3` の v05 ゲートに `&& state.pendingEnemies.length===0` を追加。理由: 現 wave が anticipation 中の状態で次 wave を spawn すると、画面に anticipation 円が多数出て情報密度が破綻する。pending が捌けるまで次 wave を待たせる。副作用 = wave 間の間隔が 0.5s 延長 (1 wave 周期 ~2.5s に対して微小)。
- **anticipation 描画位置**: 敵 spawn 座標は `y=-12` (small) / `y=-16` (medium) で画面外。そこに円を描いても見えないので、**画面上端付近の固定 y** (`y=14` small / `y=18` medium) に出現 x の円を描く。プレイヤーは「ここから降ってくる」を視覚的に把握。
- **alpha curve**: `alpha = 0.4 * (1 - countdown/ANTICIPATION_FRAMES)` で 0 → 0.4 escalation。0.5s かけて「ぼんやり」→「はっきり」→「敵出現」と進む。
- **円半径膨張**: `r = baseR * (0.4 + 0.8 * t)`。t=1 で r=baseR*1.2 = 実 enemy 半径よりわずかに大。視覚的連続性。
- **fan3 / aimed の保持**: `pendingEnemies` の中に `bulletPattern` を保持し、`emitEnemy()` で medium type に渡す。v05 beta B-2 の ABAB rhyme は v06 でも保持される。

## §1.x. A-1+ shape polish (C191 Phase 4, 本サイクル追補)

### 追加内容

A-1 (円のみの anticipation) に **下向き trajectory hint** を 5 行追加。type で shape 弁別する:

- **small** (`type==='small'`): 円の下端から短い垂直線 (length = 8 + 10*t px)
- **medium** (`type==='medium'`): 円の下端を底辺とする下向き三角形 ▼ (height = 8 + 10*t px、幅 8 px)

t の escalation は既存 alpha/r と同期。RNG 一切呼ばないので seed 再現性 (?seed=N) は無傷。

### なぜ A-1+ を A-1 と同 v06 で出すか (= 完成度向上 1 機構刻みの再適用)

A-1 ship (commit `463250eb6`) は readability 3 層を**構造的に**埋めたが、anticipation 層のみ「円が出る」だけで shape 弁別が立っていない。windup 層 (発射線、player 方向) と全弾軌跡層 (line trail) は方向性が出ているのに、anticipation 層だけ等方的な円で「敵がここに出る」しか告知できない。**下向き hint で「ここから降下する」**まで含めると、anticipation 層が他 2 層と同じ「方向性 telegraph」の語彙を獲得し、3 層が用語的にも揃う。

A-1 を出した直後の磨きで v06 を確定させる経路。**新機構ではなく既存機構の shape 弁別性向上 = 削除可能改良の純度高**:

- A-2 (brainstorm.md 18 案中の graze chain breaker UI) ではない。Phase 3 staging 内では「A-2」と便宜呼称したが、brainstorm 命名と衝突するため **A-1+** に変更。
- v07 候補の B-2 / A-3 / C-2 は今サイクル選ばない。理由: A-1 自体 Nao_u 未通知段階で新機構を足すと「守の段階で 1 回手放す」(`feedback_clone_strategy.md` t:5) を飛ばす。

### 根拠 (M-41 prior_art_citation_must_verify)

Phase 1 §6 外部検索 (`log/external_search.log` 2026-05-20 05:25, 26 回目相当) で導出:

- **Sparen ph3 Tutorial DDSGa2 ("Danmaku level design — uninterrupted flow + clear telegraphing で route 誘導")** — distinctive shape の telegraph 化を一般原則として記述、URL: https://sparen.github.io/ph3tutorials/ddsga2.html (verifiable, 抜粋済)
- **Boghog's bullet hell shmup 101 ("trail/elongation/grouping で trajectory可読性向上")** — shape を引き伸ばして方向を示す手法、URL: https://shmups.wiki/library/Boghog%27s_bullet_hell_shmup_101 (verifiable)
- **Luna Abyss windup ("windup timing を distinctive shape にする")** — windup 描画の shape 弁別性、Phase 1 §6 で参照 (引用文未抜粋、ゼロ枝防止のため**直接引用には依拠せず**、A-1 既存引用 Sparen/Boghog の射程内で立つ)

A-1+ は Sparen + Boghog の 2 件 verifiable で M-41 が立つ。Luna Abyss は補助参照のみ (ゼロ枝防止)。

### 守の段階整合性 (`feedback_clone_strategy.md` t:5)

「クローン戦略=守の段階で型を獲得する一連のフロー、守は通過点であってゴールではない」「v03 着手の可否」「総合確信度 N%」「30 本調査」のような戦略レイヤー philosophizing は守を抜けている兆候。本 A-1+ は:

- 差分 5 行刻みの shape 弁別向上 (戦略レイヤーなし、純実装)
- 削除可能 (5 行の `if/else` ブロックを消すと A-1 形に戻る)
- A-1 自体の prior_art (Touhou / gamedesignskills / Sparen) を継承

→ 守の純度を保ったまま、anticipation 層の方向性 telegraph を獲得する刻み。

## §2. brainstorm 18 案から A-1 採択へ (思考経路)

### MPS 採点と「採点で 1 案に絞らない」の運用

C190 brainstorm.md で 18 案を MPS (Mechanic / Player-action / Score-loop) 3 軸で採点した。結果:

| 群 | 案数 | 採点合計平均 | 差分行数 ≤ 30 件数 |
|---|---|---|---|
| A (経路A 継続) | 6 | 7.5 | 6 (全て範囲内) |
| B (経路B 試行) | 6 | 12.0 | 2 (B-2, B-6 のみ) |
| C (別軸) | 6 | 9.7 | 5 (C-4 のみ範囲外) |

採点だけ見れば 群B (CAVE 経路) が圧倒的に高い (12.0)。しかし brainstorm.md は「**採点表は『分布を見るための装置』であって『最終判断装置』ではない**」と明示し、最終判断を以下 2 つの構造的制約に委ねた:

1. **守の段階での型を獲得する一連のフロー** (`feedback_clone_strategy.md` t:5)
2. **「現実解は経路A 完成度向上」** (`knowledge/20260519_bullet_hell_two_paths_psyvariar_graze_vs_cave_cancel_three_independent_signals.md` §C)

この 2 つで群B 全面試行は v07 以降に retroactively 押し出された。残った選択肢は群A 内の 6 案。

### 群A 内 6 案 → A-1 選定

群A 内では A-1 (6点) と A-2 (6点) が最低、A-3 (11点) と A-6 (11点) が最高。しかし「**1 機構刻み**」「**差分行数 ≤ 30**」「**prior art M-41 verifiable 強度**」で再評価:

- A-3 (Psyvariar Lv up = shotCount 進行): 差分 14 行 / Psyvariar 引用強 / **agency 強 (graze → 進行ゲート)** / しかし v05 beta の readability 機構と独立な新軸を追加する case で「readability 3 層完成」より優先度が下がる
- A-6 (Sekiro Posture 型 graze break): 差分 28 行 / Sekiro 引用強 / **graze の対象選択 agency 出る** / 28 行は境界線、機構もやや大きい
- A-1 (anticipation telegraph): 差分 20 行予測 (実測 34 行) / Touhou + gamedesignskills + Sparen の 3 件引用全て verifiable / readability 3 層完成という **構造的位置**

A-1 が選ばれた決定打は「readability 3 層完成」という構造的位置だった。windup (B-2', 発射前 10F) と全弾軌跡 (v05 alpha, telegraph 層) があり、その手前の anticipation 層が抜けている状態。A-1 を埋めると「敵が来る → 弾が来る → 弾が動く」の 3 ステップで完全に readability が立つ。**他案は新機構の追加 (agency 系統)、A-1 のみ既存 readability 連鎖の補完**。

### Phase 1 外部検索 (本 C191) も A 経路継続を支持

本サイクル Phase 1 で `log/external_search.log` に Ash 検索 `indie game iteration when to add new mechanic vs deepen core feature game design heuristic 2026 sequel` を投入し 9 件ヒット。gamedeveloper / gamedesignskills / Codecks / Medium / Perforce 等の業界標準ソースから:

- **「core mechanic deepen first, slowly add one piece at a time」**
- **「large gameplay changes avoided unless absolutely necessary」**
- **「make one mechanic exceptional rather than ten mechanics average」**
- **「establish a fun and expandable core game loop, then progressively add more content」**

v05 beta B-1/B-2/B-2' 段階で core が **'fun and expandable' と確定していない** (Nao_u 評価未受領) ため、業界基準では A 経路 (経路A 完成度向上) が第一選択肢。これは brainstorm.md の選定と独立に再導出された強い裏付け。

## §3. 守の段階整合性の自己検査

### 1 個刻み (削除可能改良) の境界線上

差分 34 行 / 30 行 境界線をわずかに超過。boundary だが、機構独立性 (anticipation queue は spawnEnemy 経由でしか操作されず、既存機構と直接依存しない) は高い。`feedback_clone_strategy.md` t:5 「守は通過点であってゴールではない」の文脈で、「1 個刻み」の本質は「reversibility」であり、34 行でも 6 箇所削除で完全に戻せる構造を保つ限り、boundary を超えること自体は守の逸脱ではない。

ただし本サイクルが 34 行で済んだのは、`emitEnemy()` を新設したことで spawnEnemy 内の type 分岐コードが「移動」しただけだったから。仮に `emitEnemy()` を作らず inline で書いていれば +5 行、anticipation 描画に細かい animation を入れていれば +10 行になり、容易に 50 行を超えた。**最小化への努力は v06 でも維持されている**。

### philosophizing 警戒

`feedback_clone_strategy.md` t:5 は「v03 着手の可否」「総合確信度 N%」「30本調査」のような戦略レイヤー philosophizing を守の逸脱兆候とする。本サイクルの brainstorm → 実装フローを点検すると:

- brainstorm 18 案 (C190) は「path 選択」の決定のための比較表で、philosophizing 寄りに見える
- しかし MPS 採点 → 採点ではなく構造 (readability 3 層完成) で選んだ → 実装着手、と1 サイクル内で実装まで降りた
- 18 案分析の output は brainstorm.md 1 ファイル (340 行) で、その出力自体が次サイクル A-1 実装 (本 v06) の playable diff に直接接続している

**brainstorm.md は philosophizing ではなく「複数案 harness」(`feedback_prediction_responsibility.md` t:5 Stage 1) として機能している**。判定は: brainstorm.md → playable diff の経路が 1 サイクル開いただけで閉じ、philosophizing の連続 ramping ではない。

### 手段の目的化チェック

`feedback_means_ends_reversal_check.md` t:5 「サイクル冒頭→『この出力はゲーム制作の試行錯誤ループに接続するか』1行自問」。本サイクルの第一義出力は `game/graze_log/v06/index.html` の playable diff commit。brainstorm/結晶化/cross_review/日記は今サイクル**主出力にしない**。devlog (本書面) と README は実装記録としての副次出力。

**判定: 接続する**。試行錯誤ループは「v04 ship → 評価 → v05 alpha → v05 beta B-1/B-2/B-2' → v06 A-1」と進行中。次の試行錯誤ステップは「v06 ship → Nao_u 評価受領 → v07 path 選択」。

## §4. 次サイクル以降の含意

### 次サイクル (C192) でやるべきこと候補

- (a) v06 を AI 自プレイで Stage 4 判定: 「anticipation 円があることで弾幕の予測が立つか」「画面情報密度が破綻していないか」
- (b) Nao_u 評価依頼 (#game-rights に 1 メッセージ): 「v06 を遊んでほしい、anticipation 円の体感を聞きたい」
- (c) v07 path 選択 brainstorm 開始: v06 で readability 3 層が完成したので、次は「経路B 表面実装 (B-2 Hyper Activation)」か「群A 内の agency 強化案 (A-3 Lv up / A-6 Posture break)」のどちらかを Phase 1 で再検討

優先度は (a) → (b) → (c)。(a) で自分が「これは良い」と確信してから (b) に出す (`feedback_prediction_responsibility.md` t:5 Stage 4 「AI 自プレイで『良い』と確信してから依頼」)。

### v07 以降の課題 (brainstorm.md から繰り越し)

- **B-2 (Hyper Activation)**: 経路B 表面実装。差分 18 行で 30 行範囲内。BOMB 機構との競合をどう設計するかが課題
- **A-3 (Psyvariar Lv up)**: graze 進行ゲート化。MPS 11 点、agency 強。**現状の readability 3 層が立った後の自然な次手**
- **C-2 (SAROS 弾カウンター)**: 別軸の 2026 年最新作試行。MPS 12 点、しかし graze_log の identity と直交する横移動

## §5. 接続先

- `game/graze_log/v05/` — v06 の 6 箇所を v05 beta 形に戻した状態
- `game/graze_log/v05/README.md` — 全弾常時軌跡 (readability 3 層の第 1 層 = telegraph 層)
- `game/graze_log/v05/devlog.md` §12 — windup telegraph (readability 3 層の第 2 層 = windup 層)
- `game/graze_log/v06/brainstorm.md` — 18 案比較 + 1 行確信宣言
- `game/graze_log/v06/README.md` — v06 機構サマリ + 差分 + 戻し方
- `game/graze_log/v04/prior_art_30.md` — 30 件既検証の引用付き先行事例集 (M-41 検証基盤)
- `knowledge/20260519_bullet_hell_anticipation_windup_telegraph_readability_three_layers.md` — readability 3 層分解の起源 knowledge
- `knowledge/20260519_bullet_hell_two_paths_psyvariar_graze_vs_cave_cancel_three_independent_signals.md` — 経路A/B 独立性と「現実解は経路A 完成度向上」結論
- `knowledge/20260519_bullet_hell_decline_difficulty_vs_learning_path_zenji1_whitemage_saros.md` — 序盤学習経路の重要性 (anticipation = spawn 前 readability で序盤 30 秒の素材を増やす)
- `log/external_search.log` 2026-05-19 — 業界標準ヒューリスティック「core deepen first」を A 経路継続支持として再導出
- `memory/feedback_clone_strategy.md` t:5 — 守の通過点での 1 個刻み制約
- `memory/feedback_prediction_responsibility.md` t:5 — Stage 1 複数案 harness (brainstorm 18 案), Stage 4 AI 自プレイで確信 (次サイクル)
- `memory/feedback_means_ends_reversal_check.md` t:5 — playable diff 第一義原則
- `memory/feedback_prior_art_citation_must_verify.md` t:5 — M-41 引用検証 (A-1 は Touhou + gamedesignskills + Sparen の 3 件 verifiable)
- `memory/feedback_headless_unfit_for_unfinished_eval.md` t:5 — judgment 根拠から headless を外す

— Ash (Win2) 2026-05-19 C191 Phase 4
