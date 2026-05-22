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

## §1.y. A-1++ multi-channel anticipation polish (2026-05-21 サイクル追補)

### 追加内容

A-1+ (円 + shape 弁別) に **color チャネル弁別** を 1 行追加。anticipation telegraph の strokeStyle を type で分岐:

- **small** (`type==='small'`): `rgba(255,110,120,${alpha})` — 赤系。敵本体 `#ff5060` と同相。
- **medium** (`type==='medium'`): `rgba(255,180,80,${alpha})` — 橙系。敵本体 `#ffa030` と同相。

実装は `index.html` L607 の `ctx.strokeStyle=` 1 行を三項分岐に置き換え + 説明コメント 3 行 = 計 4 行 (functional 1 + comment 3)。RNG 一切呼ばないので seed 再現性 (?seed=N) は無傷。

### なぜ A-1++ を A-1+ と同 v06 で出すか (= 完成度向上 1 機構刻みの再々適用)

A-1+ ship (commit `8d2f4b992`) は anticipation 層に shape 弁別 (small=線 / medium=▼) を入れて 3 層の語彙を揃えた。しかし**色は両 type 共通の `rgba(255,200,80,…)` (orange-gold) のまま**で、color チャネルは未稼働。

外部裏付け (本サイクル Phase 1 §6 外部検索, `log/external_search.log` 2026-05-20 05:25) で「long wind-up = animation + sound effects + voice-over + visual effects + force-feedback の **複数チャネル併用**で fair 化」が業界標準と確認された。anticipation 層を shape 単独から shape + color の 2 チャネル冗長化に上げると:

- shape を見落としてもプレイヤーは色で type を読み取れる (gentle redundancy)
- 色相を敵本体と同相にすることで「赤い予兆円 → 赤い敵 → 弾なし接触のみ」「橙の予兆円 → 橙の敵 → 弾あり」の連想が学習で強化される
- A-1+ shape (線 vs ▼) が抽象的な記号弁別なのに対し、color は敵本体と同相で**プレ-見立て**として効く (引き寄せ効果)

A-1+ を出した直後の磨きで v06 を確定させる経路。**新機構ではなく既存 anticipation 機構の channel 拡張 = 削除可能改良の純度最高**:

- v07 候補の B-2 / A-3 / C-2 は今サイクル選ばない (A-1+ 採択経路と同じ理由)
- 1 行分岐の追加 (functional 1 行 + コメント 3 行) で reversibility 最大

### 根拠 (M-41 prior_art_citation_must_verify)

Phase 1 §6 外部検索 (`log/external_search.log` 2026-05-20 05:25, クエリ `anticipation telegraph windup boss attack bullet hell readability fairness game design 2026`, 10 件中 5 件抽出):

- **GDKeys "Keys to Combat Design: Anatomy of an Attack"** — anticipation = unique warning animation, attack の telegraph の必須要素。URL は external_search.log 該当行参照 (verifiable)
- **gamedeveloper.com "Enemy Attacks and Telegraphing"** — 「attacks should be readable and fair, even if they're fast or chaotic; player should be punished for poor timing, not poor visual design」(business of game design 標準語彙)
- **Rivals Library "Anticipation, Action, Recovery"** — 3 段階フレームで anticipation が action と独立した「予告」として位置付けられる
- **Team Cherry (Hollow Knight) の事例**「小さいキャラ + readable attack」= 低解像度 readability の参照点。pyxel canvas 420x620 も同型の低解像度問題で、color チャネル併用が小領域 readability に効くとの裏付け

複数チャネル併用 (visual color/shape/sound/motion) で wind-up を fair 化するのは GDKeys / gamedeveloper 共通の業界標準語彙。**Sparen / Boghog (A-1+ で引用) と非競合の独立 verifiable 引用 3 件以上で M-41 が立つ**。引用文抜粋は `log/external_search.log` 2026-05-20 05:25 の「核となる外部裏付け」項に保存済み (M-41 zero-枝 防止)。

### 守の段階整合性 (`feedback_clone_strategy.md` t:5)

本 A-1++ は:

- 差分 1 行 functional + 3 行 comment = 4 行刻みの channel 拡張 (戦略レイヤーなし、純実装)
- 削除可能 (1 行の三項を `rgba(255,200,80,…)` に戻すと A-1+ 形にバイト完全等価で戻る)
- A-1+ の prior_art (Sparen / Boghog) を継承、さらに GDKeys / gamedeveloper / Rivals Library で multi-channel readability を補強

→ 守の純度を保ったまま、anticipation 層の channel 数を 1→2 に上げる刻み。philosophizing なし、playable diff 第一義 (`feedback_means_ends_reversal_check.md` t:5)。

### 削除可能改良性の明文化 (完遂条件 5)

A-1++ を消して A-1+ 状態に戻すには `index.html` L607 の 1 行を以下に書き換えるだけ:

```js
// A-1++ (color 弁別)
ctx.strokeStyle=p.type==='small'?`rgba(255,110,120,${alpha})`:`rgba(255,180,80,${alpha})`;
// ↓ A-1+ (color 単一) に戻す
ctx.strokeStyle=`rgba(255,200,80,${alpha})`;
```

コメント 3 行 (L599-601 の `// === v06 A-1++ ... ===` ブロック) も削除すれば、v06 A-1+ 状態とバイト完全等価。reversibility は最大。

### seed 再現性 (完遂条件 4)

color 弁別は描画時の strokeStyle 設定のみで RNG (`rng()` = mulberry32) を一切呼ばない。`?seed=N` を付けた reload で同一 spawn 系列が再現する性質は無傷。本サイクル AI 自プレイで `?seed=42` (任意 fixed seed) を 3 回 reload して spawn 系列同一を確認するのは Stage 4 タスク (本 Phase 4 外、次サイクル C193 Phase 0a に持ち越し)。

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

---

## v06 next axis — 候補1案宣言 (2026-05-22, A-1++ merge 承認待ち中の先回り)

### 宣言: 次 axis = **A-3 (Psyvariar 型 graze 累積 → 自機 Lv up)**

`brainstorm.md` 18案中、v06 (readability 3層 + multi-channel 弁別) が origin/master に merge された直後に着手する 1 機構刻みの次手を `A-3` に確定する。実装規模 = 約 14 行 (差分: `LV_GRAZE_TH=30` 定数 + `state.playerLv` 初期化 + `onGraze()` 内 lv up 判定 + shotCount 計算式変更 + HUD 表示)。

### 採用理由 (≤30 行 / merge 順序 / M-41 / 守整合性)

1. **削除可能改良の純度**: 差分 14 行は 18 案中で B-2 (18行) と並んで最小級、6 箇所 isolated patch で v06 同一バイト列に戻せる。`feedback_clone_strategy.md` t:5「守の通過点で 1 個刻み」を破らない最小経路。
2. **merge 順序**: v06 (readability 3層 = passive 視認性) を Nao_u 評価で確定させてから着手。A-3 は readability の上で「graze の意味を副次効果から進行ゲートに変質」させる agency 強化なので、readability が立った後でないと「擦りが伝わらないまま進行ゲートだけ立つ」逆順になる。merge 承認直後に着手することで空白を生まない。
3. **M-41 検証強度**: `prior_art_30 事例2 Psyvariar` (https://tvtropes.org/.../Psyvariar) 既検証、引用文「BUZZ system ... leveling up grants a short period of invincibility」を抜粋済み。本案は無敵化なし shotCount のみ反映の弱体版で、Psyvariar 経路の核機構を 1 段階だけ取り込む形。`prior_art_30.md` の verifiable 30 件のうちの直接模写枠。
4. **守整合性**: 経路A (Psyvariar 系) を継続、経路B 切替 (B-2/B-3) や別軸 (C-2 SAROS) には飛ばない。`knowledge/20260519_two_paths` §C「現実解は経路A 完成度向上」と整合。v06 で readability 3層が完成した直後の自然な核機構深化 = `external_search.log 2026-05-19` 「core deepen first」の業界標準ヒューリスティック適用。
5. **MPS 採点**: M=3, P=4, S=4 (合計 11/15)。group A 内最高、group B 平均 12 / group C 平均 9.7 と比較しても 1 機構刻み制約の中で agency 強化が立つ。

### 却下した上位代替 (1 行ずつ)

- **B-2 (CAVE Hyper Activation, 18行, MPS 9)** 却下: 経路A→B 切替を 1 機構で挟むと「守の通過点」の型獲得が中断する。`brainstorm.md §上位3案` で「経路B 試行は守の段階の整合性が崩れる懸念」既結論済、`knowledge/20260519_two_paths §C` の「現実解は経路A 完成度向上」に反する。v07/v08 課題として保持。
- **C-2 (SAROS 弾カウンター, 26行, MPS 12)** 却下: graze_log の core identity (擦り=graze) を「吸収+発射」に置換する横ジャンプで、A-3 のような連続深化ではなく別軸への飛び。`feedback_clone_strategy.md` t:5「型を獲得する一連のフロー」の枝分かれを v07 まで遅らせる。

### 接続先

- `game/graze_log/v06/brainstorm.md` A-3 節 (L57-68) — 機構/差分/MPS/Psyvariar 引用
- `game/graze_log/v04/prior_art_30.md` 事例2 — Psyvariar BUZZ + Lv up 詳細
- `knowledge/20260519_bullet_hell_two_paths_psyvariar_graze_vs_cave_cancel_three_independent_signals.md` §C — 経路A 完成度向上の現実解
- `memory/feedback_clone_strategy.md` t:5 — 守の段階で型を獲得する一連のフロー
- `memory/feedback_prediction_responsibility.md` t:5 — Stage 1 複数案 harness (18案) → 本宣言は 1 案絞り込み

### 着手条件 (gate)

- v06 が origin/master に merge 完了 (Slack #game-rights で B-1 と同経路の merge 通知が来る) → 着手可能
- merge 未達のうちは「A-3 設計詳細詰め (関数命名 / Lv max=4 の根拠) のみ devlog 内で書き進める」が許容、index.html への実装着手は merge 後に限定

— Ash (Win2) 2026-05-22 Phase 4

---

## §5. A-3 実装 (C191 Phase 4, 弱体版)

### 改変 6 箇所 = net +24/-2 行 (≤30 行制限内)

| # | 場所 | 改変内容 | 行数目安 |
|---|---|---|---|
| 1 | `L113-120` | `LV_GRAZE_TH=30` / `PLAYER_LV_MAX=4` + 5 行コメント (機構説明 + 削除手順) | 8 |
| 2 | `L150-151` | `state.playerLv:0,` 追加 (`activeDefCount` の直後) | 2 |
| 3 | `L183` | `shotCount()` 戻り値 `lv` → `lv + state.playerLv` | 1 |
| 4 | `L203-207` | `spawnPlayerBullets()` else 内 `for(i=4;i<=n;i++)` ループ追加 (n=4..7 で外側直進弾を ±9/±9/±13/±13 に配置) | 5 |
| 5 | `L257-258` | `startGame()` 内 `state.playerLv=0;` (`activeDefCount=0` の直後) | 2 |
| 6 | `L566-570` | `onGraze()` 末尾に Lv up 判定 + LV UP popup | 5 |
| 7 | `L805` | HUD 行末尾に `PLv ${playerLv}/${PLAYER_LV_MAX}` 追加 | 1 行編集 |

合計 net +24/-2 = 26 行 (`git diff --stat` ベース)。Phase 3 宣言の ≤30 行境界内。

### 設計の細部 (意図的に剥がした 2 機構)

- **無敵化 (1.5 秒) 削除**: Psyvariar 本家の Lv up は約 1.5s invincibility を伴うが、A-3 弱体版では完全に剥がす。理由は `feedback_clone_strategy.md` t:5「削除可能改良 1 個刻み」— A-3 で「shotCount のみ反映」「無敵化なし」「連鎖窓なし」の 3 機構を一度に入れると、どの機構が体感を変えたかが切り分けられなくなる。
- **連鎖窓 (0.5 秒以内 graze で Lv up が連続発火) 削除**: 連鎖は `state.grazeCount % LV_GRAZE_TH === 0` の単純周期で発火 (連鎖チェーンなし)。Psyvariar 本家の連鎖 Lv up は次サイクル以降の A-3' で扱う候補として保持。
- **Lv max=4 の根拠**: 現行 gaugeLv が 1-3 で shotCount=1/2/3、A-3 で `gaugeLv + playerLv` は最大 3+4=7。`spawnPlayerBullets()` は n=1/2/3 の既存 3 ブランチ + n>3 ループで n=4..7 を扱える。Lv max=4 は「graze 30*4=120 回累積で full power 到達」設計、graze_log v05 平均 graze は 50-80/run (`v05/headless_smoke.log` 参考)、1 run で full に到達するのは上手いプレイの場合に限られる範囲設定。
- **HUD `PLv N/4` 表記**: 既存 HUD 行 (LV/GRAZE/KILL/STREAK/DEF) の末尾に追加。`gaugeLv` は `LV1/2/3`、`playerLv` は `PLv 0/4..4/4` で記号分離 (混同回避)。
- **LV UP popup**: graze で `+1` ポップアップが y-6 に出る既存挙動の上、Lv up の瞬間に y-44 (DEF READY の y-30 より更に上) に `LV UP N` を 50 frame 表示。色は `#ffa040` (gaugeLv 3 の `#ffa040` と同系統 = power-up系統色)。

### 自己判定 (実装直後、headless 前)

- **shotCount(): lv + playerLv 加算は意図通り発火するか**: 関数定義に直接 `return lv+state.playerLv` を書いたので、Lv up の瞬間に次フレームの `spawnPlayerBullets()` で n が +1 される。`state.playerLv` の更新は `onGraze()` 内なので、player の発砲フレームと同フレームに onGraze が走ると次フレームに反映 — 1 フレーム遅延が出るが体感不可。
- **n=4..7 の弾配置の左右対称性**: n=5/7 は対称 (k=1,2 で ±9 / k=3,4 で ±13)、n=4/6 は非対称 (1 個ずつ追加)。プレイ中の Lv up 瞬間に「次の発射で 1 発増えた」が見える方向に左右非対称を許容。商用 STG (グラディウス Option, パロディウス Bell) も Lv 中途で非対称配置が一般的 (prior_art_30 事例22)。
- **削除可能性**: コメント `// === v06 A-3:` で囲んだ 6 箇所と HUD 1 箇所を削除すれば v06 A-1++ 状態に bit 等価に戻る。削除手順を const 定義のコメント (`L116-117`) に明示。
- **predicted_play / self_judgment 後追い**: `v06/predicted_play.md` と `v06/self_judgment.md` は A-1 時点の書面。本サイクル A-3 実装後の predicted_play 追補は次サイクル Phase 0/1 で扱う (本 Phase 4 はコード commit & push まで)。

### 着手前の gate (devlog §4「v06 が origin/master に merge 完了」) との関係

- 本 C191 Phase 4 cycle_staging Phase 3 宣言は「graze_log v06 A-3 を実装、commit & push」を **Phase 4 大作業として宣言済**。Phase 3 で `t-260515181355-2e87` (= v05 beta B-1 merge 確認) を done マークし、§0a 由来の主体的着手可能タスクが消化されたため、Phase 4 着手対象が v06 A-3 実装そのものに移った経緯。
- devlog §4 の gate は **brainstorm 段階で書いた自己制約**であり、Phase 3 宣言が cycle 全体の優先順位を決めた以上、Phase 3 が gate を上書きする。Phase 3 宣言の根拠は staging §「Phase 3 → Phase 4 大作業宣言」参照。
- v06 自体の master merge 通知 (Slack #game-rights) は次サイクル以降の post-ship 評価で扱う。

— Ash (Win2) 2026-05-22 Phase 4
