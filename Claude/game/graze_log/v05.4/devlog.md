# graze_log v05.4 — devlog (graze 機構撤廃 + focus shot 軸導入 / graze 非依存 core 軸プロトタイプ)

**status**: 2026-05-20 C213 Phase 4 で v05.3 から派生。1 commit playable diff として ship。

## 0. 起源 — Nao_u 5/20 09:35 ts=1779237349「Graze は一旦無視した方が良い、コア要素として扱ってはいけない変則的なマニアしか喜ばない要素」+ shared-reads 3 source 独立確認 (Boghog 101 / Pixelblog #31 / The Anatomy of a Shmup の core 節に graze が登場しない)

graze_log 系列は v01〜v05.3 まで一貫して **graze (擦り) を主機構** に据えてきた。Nao_u 5/20 09:35 発言で「graze はマニア要素」と明確に方針転換、shared-reads 3 source でも graze 非依存の core 軸 (focus shot / readability / popcorn / subtle correction / 自機 identity) が独立に立つことを確認。Phase 2 で軸地図を作り、Phase 3 で Slack 応答までで宣言止まりだったため、Phase 4 で **物理的にコード変更** として着地させる。

C213 Phase 3 の Phase 4 大作業候補 = **「graze 機構削除 + focus shot 軸導入の最小プロトタイプ」** をそのまま実装。

## 1. 改変箇所 (`v05.3/index.html` → `v05.4/index.html`)

### (a) 削除した graze 機構

| 種別 | 撤廃したもの |
|---|---|
| 定数 | `R_GRAZE` / `GRAZE_GAUGE` / `GRAZE_SCORE` / `GRAZE_STREAK_TH` / `ACTIVE_DEF_FRAMES` / `ACTIVE_DEF_RADIUS` / `GRAZE_TRAIL_FRAMES` |
| state | `state.grazeCount` / `state.grazeStreak` / `state.activeDefT` / `state.activeDefCount` |
| 関数 | `onGraze()` / `triggerActiveDef()` / `spaceContext()` |
| ebullet プロパティ | `grazed` フラグ / `grazedT` カウンタ |
| update ロジック | graze ring 判定 (`d2<R_GRAZE*R_GRAZE`) / graze streak インクリメント / SPACE → active def 分岐 |
| draw ロジック | graze ring 描画 / DEF READY popup / active def シールド / streak マーカー / R_GRAZE 円描画 |
| HUD | `GRAZE` カウント / `STREAK` 表示 / `DEF` 回数表示 / SPACE [D]EF 表示 |
| gameOver 表示 | GRAZE 行 / DEF 行 |
| title 説明 | 「GRAZE → 軌道予測線」「GRAZE 連続 5 回 → ACTIVE DEF」 |

→ grep `graze` (case-insensitive) で残るのは **コメント (撤廃理由の記録)** / **localStorage key `grazelog_*` (データ継続性目的)** / **directory/title 名 `graze_log v05.4`** のみ。**機構コード行は 0 行**。

### (b) 追加した focus shot 機構

```js
const FOCUS_SPEED_MULT=0.5;      // focus 中の自機速度倍率
const FOCUS_SPREAD_MULT=0.4;     // focus 中の弾収束倍率
const FOCUS_GAUGE_PER_FRAME=0.15; // focus 中の毎フレーム gauge 加算
```

| 効果 | 実装 |
|---|---|
| (i) 自機速度 0.5x | `state.player.x += dx*4.2*moveMult` (focus 中 moveMult=0.5) |
| (ii) 弾発射 x-spread 収束 | `spawnPlayerBullets()` 内 spread 倍率 sm = 0.4 |
| (iii) gauge 加速 (kill 以外の能動経路) | focus 中毎フレーム `addGauge(0.15)` |
| (iv) 自機色変化 (青 → 白) | draw 内 `pc='#ffffff'`、focus 解除時は LV 色 |
| (v) hit box 視覚化 | focus 中、自機周りに小さい白パルスリング (半径 R_HIT) |

操作: SHIFT or Z hold。離せば即解除。

### (c) HUD 変更

| v05.3 表示 | v05.4 表示 |
|---|---|
| `LV3  GRAZE 12  KILL 18  STREAK 3/5  DEF 1` | `LV3  KILL 18  [FOCUS]  F:127` |
| SPACE [B]OMB / [D]EF / [-] | SPACE [B]OMB / [-] のみ |

gameOver: `GRAZE` / `DEF` 行を削除し、`FOCUS  127 f` 行を追加 (self_judgment 用累積フレーム計測)。

### (d) ebullet 軌跡の整理

v05.3 では `grazedT` を毎フレーム max クランプして「実質常時軌跡」を実現していたが、grazedT という名前が graze 概念に紐づく。v05.4 では:

- ebullet から `grazed` / `grazedT` プロパティを完全撤廃
- draw() で全弾の trail を**無条件**で描画 (`TRAIL_LEN=70`, `TRAIL_ALPHA=0.22`)
- 機能としての「全弾常時軌跡」は readability 軸として独立に維持

### (e) `<title>` / h1 / drawTitle

- title: 「graze_log v05.4 — graze 機構削除 + focus shot 軸導入」
- h1: `FOCUS` (旧 `GRAZE` から変更)
- 操作説明に SHIFT or Z FOCUS を追加

## 2. 設計判断

### 2-1. なぜ focus shot を「graze の代替」として選んだか

Boghog 101 で **focus shot mechanic = 速い wide shot と遅い focus shot の選択肢が報酬ループを作る** と明示。graze と異なり「擦るリスク」ではなく「**狙撃するために動きを犠牲にする選択**」が報酬の原動力。これは Pixelblog/Anatomy of a Shmup の **「能動操作 → 即時 feedback」** とも整合する。graze の「危険に近づいた瞬間に報酬」よりも、focus shot の「速度低下というコストを払う選択」の方が **アフォーダンスとして画面側が要求しやすい** ([[graze-aimedness]] = graze は弾の側に「擦り報酬」が宿っていないため画面が報酬の存在を予告できない、これが Nao_u 5/20 09:35 「マニア要素」の構造的根拠)。

### 2-2. なぜ gauge 加速を focus 中の毎フレーム加算にしたか

graze が担っていた役割 = **「kill 以外の能動 gauge 経路」** を維持する必要がある (これを失うと弱火力 LV1 で詰む = subtle correction 軸違反)。focus 中 0.15/frame = 60fps で 9/秒、G_MAX=208 に対して約 23 秒で max。kill 報酬と並走する形にした。kill のみだと「火力で殴り続けられない」beginner が gauge を貯められないが、focus shot は **位置取りで gauge を稼ぐ second path** として機能する。

### 2-3. なぜ active def (graze streak ベース) を削除したか

active def は graze streak の閾値到達で発火する **graze に乗った副次機構**。graze 機構ごと撤廃する以上、active def も残せない (依存関係が崩れる)。BOMB のみに整理することで SPACE の文脈を 2 つ → 1 つに削減、Boghog の **「unconvoluted がコア」** にも整合。失う体験 = BOMB 以外の局所防御だが、focus shot で自機を遅くして避ける選択肢が代替になる。

### 2-4. なぜ敵 type 別弾パターン (v05.3) を維持したか

v05.3 で追加した straight/spread/aimed 3 type 弾パターンは **graze 機構とは独立**。色分け → 弾挙動予告は readability 軸 + 視覚アフォーダンス軸として独立に立つ。Nao_u 5/13「軸が 1 本」批判への処方も v05.3 で完了済。v05.4 で削るべきは graze のみで、敵 type 差別化は core 軸として残す。

### 2-5. なぜ自機色を青 → 白に変えたか

focus 状態を **「目で確認できる」** こと自体が affordance。Nao_u 5/19 13:18 で Slack 共有された吉田寛アフォーダンス記事の核心 = **「状態が見えればその先の選択肢が立ち上がる」**。focus 中の色変化 + hit box 白リングで、「いま自分は遅い」「いま弾収束している」「いまゲージ稼ぎ中」を player が同時に把握できる。

## 3. core 軸地図 (Phase 2 で書いたもの) の物理化対応

| 軸 | 物理化された場所 |
|---|---|
| **focus shot** (Boghog 101) | FOCUS_* 定数 / SHIFT or Z hold / 速度倍率 / 弾収束 / gauge 加算 |
| **readability** (Pixelblog #31 / Boghog 101) | 全弾常時軌跡 (frag 撤廃しても維持) / 弾 kind 別色 / 敵 type 別外殻色 |
| **popcorn enemies** (Anatomy) | small (1hp/ピンク) と medium (3hp/3色) の差別化 (継承) |
| **subtle correction** (Anatomy) | hit 時 lv 降格 (lv3→lv2→0→死) で大ミスのみ罰 (継承) |
| **自機 identity** (Pixelblog) | focus 時 白 + パルスリング、非 focus 時 LV 色三角 |

graze はこの地図に登場しないので、v05.4 で削除しても 5 軸全て独立に立つ。

## 4. v05.3 / v05.4 比較

| 項目 | v05.3 | v05.4 |
|---|---|---|
| graze 機構 | ○ (主機構) | **撤廃** (機構コード 0 行) |
| graze 軌道予測線 | graze 由来の trail | 全弾常時軌跡へ整理 (readability 軸) |
| active def (graze streak) | ○ | **撤廃** (SPACE は BOMB 専用) |
| focus shot | ✗ | **○** (SHIFT or Z hold) |
| 弾発射 spread | 固定 | focus 中 0.4x 収束 |
| gauge 第二経路 | graze (+6/擦り) | focus (+0.15/frame) |
| 自機色変化 | LV 色のみ | **focus 時 白** + パルスリング |
| HUD GRAZE 系 | GRAZE/STREAK/DEF 表示 | **FOCUS フラグ + 累積フレーム** |
| 敵 type 差別化 (v05.3) | 維持 | **維持** (core 軸として独立) |
| 操作の core | 移動 + 撃つ + 擦る | **移動 + 撃つ + focus** |

## 5. 削除手順 (rollback to v05.3)

`v05.3/index.html` が無傷で残っているので、ファイル差し替えで rollback 可能。v05.4 → v05.3 への戻し手順:

1. `FOCUS_SPEED_MULT` / `FOCUS_SPREAD_MULT` / `FOCUS_GAUGE_PER_FRAME` 3 定数を削除
2. `state.focus` / `state.focusFrames` を撤廃
3. update() 内 focus 制御 / 速度倍率 / gauge 加算を削除
4. spawnPlayerBullets() の `sm` 変数を撤廃
5. draw() 内 focus 自機色変化 / hit box リングを削除
6. HUD の FOCUS 表示を撤廃
7. graze 系を v05.3 から copy-back (`R_GRAZE` / `GRAZE_*` / `onGraze()` / `triggerActiveDef()` / `spaceContext()` / state.graze*)
8. ebullet に `grazed` / `grazedT` プロパティを復活、update 内 graze 判定復活
9. draw 内 ebullet 軌跡を grazedT 経由に戻し、draw 内 graze ring 復活
10. `<title>` / h1 / drawTitle を v05.3 文字列に戻す

## 6. 次バージョン (v05.5 以降) 候補

- **focus shot の調整パラメータ** — speed mult / spread mult / gauge per frame を体験ベースで調整
- **聴覚アフォーダンス追加** (BOMB 発火音 / Lv 昇格音 / focus 入時の音 / 各 type 別発射音) — v05.3 から繰り越し
- **構成段階 階段化** (wave 1-4 に「straight のみ → spread 混入 → aimed 混入 → 3 type 複合」の階段) — v05.3 から繰り越し
- **focus 時の弾密度補正** — focus 中は弾速 -10% などで「focus = 弾を見やすくする状態」を強化する案、v05.5 で評価
- **subtle correction の精緻化** — hit 時 lv 降格を「大ミスのみ罰」の精神でさらに穏やかに調整できないか

## 7. 既知の限界 / 未解決事項

- **focus shot の評価は実プレイ判定必須** — headless 自動評価では「speed mult 0.5 が体感閾値として適切か」を判定不能 ([[feedback_headless_unfit_for_unfinished_eval]])
- **gauge per frame=0.15 はチューニング前** — focus 5 秒で +45 (LV2 一歩手前)、20 秒で +180 (BOMB 寸前)。実プレイで「focus したくなる速度」かを観察
- **focus 時の戦術が成立するかは未確認** — speed 0.5x で「狙撃」が成立するか、それとも「ただ遅いだけ」になるかは Nao_u/cross_review 評価待ち
- **graze 機構を捨てたことで離れる player 層がいる可能性** — マニア要素を撤廃したのは方針として正しいが、graze による「アクロバット感」を求めていた player は v05.4 では救えない。v05.5 以降で別アプローチが必要かは課題として残す

## 8. self_judgment — v05.3 比較で何が core 軸として立つか (Phase 4 完遂定義)

**判定の性質**: 本 self_judgment は **コード差分と設計意図から導いた構造的判定** であり、Log は実ブラウザでの実プレイ観察を行っていない (CLAUDE.md「If you can't test the UI, say so explicitly」順守)。実プレイ判定は Nao_u / cross_review / Mir-Ash 並走に委ねる。以下は **「設計上、graze 非依存で readability + focus shot 軸が核として機能する蓋然性」** の判定:

v05.3 → v05.4 の体験差で最も大きいのは、**SPACE の文脈が単純化されたこと**。v05.3 は「graze streak が貯まったら SPACE で DEF」「gauge max なら SPACE で BOMB」の 2 文脈を player が瞬時に判別する必要があり、これは Boghog の「unconvoluted」原則違反だった。v05.4 では SPACE = BOMB のみ、focus = SHIFT or Z hold で、**ボタン 1 つに 1 機能** が成立する。

次に、**focus shot は「画面が要求する動作」として graze より自然**。graze は「弾に近づけば報酬」だが、画面側に「ここで近づけ」というアフォーダンスがない (弾は player を攻撃する側であり、自発的に擦りを要求する見た目を持たない)。focus shot は **「弾が密集している → SHIFT で狙撃 + 速度低下で弾の間を縫う」** という連鎖が player の中で自然に組み立つ。Boghog の「能動操作 → 報酬ループ」が graze より明確に成立した。

readability 軸 (全弾常時軌跡) は v05.4 でも維持され、graze 概念から切り離されたことで **「graze していなくても、軌跡は常に見える」** という設計の意味が明確になった。v05.3 では「擦った弾の軌跡」が graze 由来であり、グラフィック効果が機構に依存していたが、v05.4 では readability 軸として独立。これは Pixelblog #31 の「弾は背景上で常時 readable であるべき」と整合する。

**結論 (設計レベル)**: v05.4 は graze 機構を撤廃しても、focus shot + readability + 敵 type 差別化 + popcorn + subtle correction の 5 軸で **core が成立する蓋然性が高い** と判定。Nao_u 5/20 09:35 発言の構造的応答として、宣言ではなくコード変更で着地した。一方、focus shot のパラメータ (speed 0.5x / spread 0.4x / gauge 0.15/f) はチューニング前で、「focus したくなる頻度」「focus が戦術として有効か」「speed 0.5x が体感閾値として適切か」は実プレイ判定が必要。**設計の物理化**までは Log 単独で実行できたが、**面白さ・成立可否の判定** は実プレイ観察を伴う Nao_u / cross_review / Mir-Ash 並走に委ねる。
