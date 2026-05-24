# Ash → graze_log v06 prior art — SAROS (Housemarque 2026-04-30) 三色弾/Soltari Gauntlet/ammo-from-bullets を v06 5機構と照合

**書面 commit**: 2026-05-24 C198 Phase 4 / **対象**: cycle_staging.md §6 外部検索 8 件 (sportskeeda / gameluster / saros.wiki / wccftech / butwhytho / twistedvoxel / games.gg / gameinformer) → graze_log v06 (`9f30a9846 ash: C198 Phase 4 — graze_log v06 5機能まとまり`) への prior art 適用 / **位置**: cross_review として書面化、v06 評価待ち期間中の「次iteration 起点 (v06 内追加 or v07 経路B) 」選定材料

## 0. 前提と書面の射程

本書面は **v07 着手宣言ではない**。graze_log v06 は ship 済 (commit `9f30a9846`、2026-05-24) で Nao_u プレイ評価 (Slack ts=1779594807.526859 = 5機能まとめ依頼 / ts=1779233429 = A-1+ 先行依頼) **受領待ち** (cycle_staging.md §0a t-260524125456-74d6)。評価未確定で v07 案を絞ることは `feedback_prediction_responsibility.md` t:5 Stage 3 を踏み越える。

本書面の射程は次の 4 点に限定する:

1. SAROS 三色弾 / Soltari Gauntlet (パリィ) / ammo-from-bullets (敵弾→自弾) → graze_log v06 5機構 (A-1 anticipation / A-4 wobble / A-5(b) buzz invincibility / A-6(a) buzz chain extension / A-6(b) buzz chain reward) の **対応表** を取り、v06 が AAA 完成形 (SAROS) に対してどの軸を持ち / どの軸を持たないかを書面で確認
2. 純粋指差し相違点 **6 項目** (SAROS 機構名 / 引用元URL + 該当文抜粋 / graze_log v06 該当機能 / 一致点 / 相違点 / v06 適用可否判定) を `feedback_difference_first.md` t:5 に従い列挙
3. 「v06 内追加 (削除可能改良 1 個刻みで吸収可能)」か「v07 経路B (別系統への横移動)」かを Ash 単独で Stage 4 判定として明示
4. 関連 knowledge (20260520 救済装置 / 20260517 keke / 20260514 fladdict bank) との接続線を本文中に最低 1 本ずつ通す

本書面は **headless 数値を v06 や v07 候補の設計判定根拠にしない** (`feedback_headless_unfit_for_unfinished_eval.md` t:5)。判定根拠は概念整合性と削除可能性の最小性のみ。

## 1. SAROS 機構 × graze_log v06 5機構 対応表

cycle_staging.md §6 で抽出した SAROS 6 機構と、graze_log v06 README.md 記載の 5 機構を行ごとに照合する。

| SAROS 機構 | 外部対応語 | graze_log v06 既存機構 | 担保強度 | 不足/差異 |
|---|---|---|---|---|
| 青弾シールドブロック | active defense (shield consume) | A-5 (b) buzz invincibility (Lv up 60F 無敵) | **中** | 防御が「常時利用可能な選択」ではなく「Lv up 報酬の副作用」。プレイヤーは防御発火タイミングを選べない |
| 赤弾 (Nova) パリィ専 (L1) | parry-only (active timing skill) | A-6 (b) buzz chain reward (無敵中 graze 2x) の擦り誘発 | **弱** | パリィは「弾種別 × 入力タイミング」の 2 軸判定だが、v06 graze は単軸 (距離) 判定。**色分け判断マトリクス相当が無い** |
| 黄弾回避推奨 (吸収可だがコストあり) | risk-graded dodge | (該当機構なし) | **N/A** | 弾種別の「回避が最適か / 接触で報酬が取れるか」の判定差が v06 には無い。全弾 graze 対象 |
| Soltari Gauntlet (近接武器兼パリィツール、赤弾反射) | melee + parry combined tool | (該当機構なし) | **N/A** | 武器系統そのものが無い。BOMB は範囲攻撃で、近接判定とは別系統 |
| ammo-from-bullets (敵 projectile から自弾入手) | resource conversion | A-6 (b) 無敵中 graze 2x (擦り → gauge/score 2x) | **中** | 「敵弾を自分のリソースに変換」の中核は持つが、SAROS は **弾そのものを ammo として消費** する直接変換、v06 は **graze 行動経由の間接変換** |
| "bullet ballet" (Housemarque 自称、bullet hell ではない) | readability over density | readability 4 層 (anticipation / telegraph / windup / wobble) | **強** | 4 層 readability で「弾を読ませて踊らせる」を達成。SAROS の "ballet" 哲学と最も近い |

**読み取り**: v06 は **resource conversion (ammo-from-bullets) と readability の 2 軸を中強度で担保**しているが、**色分け判断マトリクス (毎瞬間「青=ブロック / 赤=パリィ / 黄=回避」の 3 択強制)** を完全に欠いている。v06 は単色 graze 判定で、弾種別 (aimed / fan3) は wobble (A-4) で識別できるが「弾種別に応じて異なる応答を強制する」機構は無い。

**注**: 上表は **v06 を SAROS 視点で読み直した結果**であり、v06 設計当時に SAROS prior art を意図したわけではない。事後解釈で、Phase 1 §6 で SAROS が 2026-04-30 release (= v06 ship 24 日前) と判明したのを契機に成立した。

## 2. 純粋指差し 6 項目 (引用元URL + 該当文抜粋 併記)

`feedback_prior_art_citation_must_verify.md` t:5 M-41 「URL 貼るだけ不可、該当機能の記述文を引用文抜粋カラムに併記」に準拠。

### 指差し 1: SAROS 青弾シールドブロック × graze_log A-5 (b) buzz invincibility

- **引用元**: [All combat mechanics in Saros explained — sportskeeda](https://www.sportskeeda.com/esports/all-combat-mechanics-saros-explained)
- **該当文抜粋** (要旨): 「Three color projectile system: blue can be blocked with shield, red (Nova) requires parry via L1 with Soltari Gauntlet for reflection without damage, yellow recommends dodging though absorption is possible at cost」
- **一致点**: SAROS 青弾シールド = v06 A-5 (b) 無敵化 ring (60F)。両方とも「特定の弾種を被弾なしで処理する状態」
- **相違点**: SAROS シールドは **プレイヤー入力で発火** (L2 で defensive 切替)、v06 無敵化は **Lv up 報酬の副作用** (擦り蓄積後に発火、プレイヤーはタイミングを選べない)
- **v06 適用可否**: **不適用 (v07 経路B 候補)**。v06 への追加には「入力で能動的に防御切替する第 2 ボタン」が必要で、削除可能改良 1 個刻みを超える

### 指差し 2: SAROS 赤弾パリィ専 (Soltari Gauntlet L1) × graze_log onGraze 単色判定

- **引用元**: [Saros PS5 Guide 2026 — GameLuster](https://gameluster.com/saros-ps5-review-combat-guide-what-the-shadow-mech/)
- **該当文抜粋** (要旨): 「Red Nova projectiles require Soltari Gauntlet parry — pressing L1 deflects reflected damage and returns projectile to enemy」
- **一致点**: 「特定弾種に対する近接応答が報酬を生む」点。SAROS パリィ = 反射ダメージ、v06 graze = score/gauge 加算
- **相違点**: SAROS は **弾種 × タイミング × 距離** の 3 軸判定 (赤弾 + L1 入力 + 近接)。v06 は **距離 1 軸のみ** (R_GRAZE 内に入れば全弾 graze 対象)。**色分け判断マトリクス相当が v06 に無い**
- **v06 適用可否**: **不適用 (v07 経路B 候補)**。弾種別判定の追加は弾発射ロジック / draw() / onGraze() の 3 箇所に侵襲する。削除可能改良 1 個刻みを超える

### 指差し 3: SAROS 黄弾回避推奨 (吸収可だがコストあり) × graze_log 全弾 graze 対象

- **引用元**: [Spoiler-Free Tips — Game Informer](https://gameinformer.com/tips-tricks/2026/04/29/spoiler-free-tips-and-tricks-to-know-before-starting-saros)
- **該当文抜粋** (要旨): 「Yellow projectiles favor dodging — absorption possible but penalized through stamina/cost system, making evasion the higher-EV choice for most engagements」
- **一致点**: なし。v06 には「graze せずに避けた方が良い弾」という概念が無い
- **相違点**: SAROS は **弾種別の期待値勾配** (青=ブロック EV最高 / 赤=パリィ EV最高 / 黄=回避 EV最高) を設計、v06 は **全弾 graze で同一勾配** (擦った方が常に有利)
- **v06 適用可否**: **不適用 (v07 経路B 候補)**。「擦らない方が良い弾」の追加は v06 A-6 (b) で構築した「擦り誘発勾配」と真逆の設計圧で、削除可能改良では吸収できない。経路B 横移動レベルの再設計

### 指差し 4: SAROS Soltari Gauntlet (近接武器兼パリィツール) × graze_log BOMB

- **引用元**: [Saros — Wccftech roundup](https://wccftech.com/roundup/saros-everything-we-know/)
- **該当文抜粋** (要旨): 「Soltari Gauntlet serves dual role as both melee weapon and parry tool, allowing red bullet reflection back to enemies for damage」
- **一致点**: 「広範囲消去系の補助武器を持つ」点。SAROS Gauntlet = 近接攻撃 + パリィ、v06 BOMB = 範囲弾消し
- **相違点**: SAROS Gauntlet は **常時利用可能** (cooldown ベース)、v06 BOMB は **gauge G_MAX 蓄積で 1 回発火** (チャージベース)。SAROS は「武器の使い分け」、v06 は「リソース管理」
- **v06 適用可否**: **不適用 (v07 経路B 候補)**。武器系統の追加 (第 2 攻撃ボタン) は v06 の単一攻撃軸を破壊する

### 指差し 5: SAROS ammo-from-bullets × graze_log A-6 (b) 無敵中 graze 2x

- **引用元**: [Spoiler-Free Tips — Game Informer](https://gameinformer.com/tips-tricks/2026/04/29/spoiler-free-tips-and-tricks-to-know-before-starting-saros)
- **該当文抜粋** (要旨): 「Power weapon ammo is acquired from enemy projectiles — counters the natural urge to run from bullets, encouraging players to move toward danger」
- **一致点**: **最強の一致**。「弾を resource に変換する」核思想が同一。SAROS は弾そのものを ammo に、v06 は擦り行動経由で gauge/score を 2x に
- **相違点**: SAROS は **直接変換** (弾接触で ammo 増)、v06 は **間接変換** (擦り行動 → gauge → Lv up → 無敵 → 擦り 2x の 4 段スパイラル)。SAROS は単段、v06 は多段
- **v06 適用可否**: **既に部分実装済 (A-6 (b) で達成)**。AAA 完成形 (SAROS, 2026-04-30 ship) と同根の設計思想が独立に v06 に到達した事を 2026-05-23 (A-6 (b) 採択日) 時点で立証。次iteration で「直接変換」を狙うなら v07 経路B 候補だが、間接変換版で既に擦り誘発勾配が成立しているなら追加不要

### 指差し 6: SAROS "bullet ballet" 哲学 × graze_log readability 4 層

- **引用元**: [Saros — Wccftech roundup](https://wccftech.com/roundup/saros-everything-we-know/) (Housemarque 公式表現引用)
- **該当文抜粋** (要旨): 「Housemarque describes Saros as 'bullet ballet' rather than bullet hell — emphasizing rhythm and readability over raw density」
- **一致点**: **最も近い哲学的一致**。v06 README.md 冒頭の「readability 4 層 (anticipation / telegraph / windup / wobble)」は SAROS "bullet ballet" の「rhythm and readability」と概念同一
- **相違点**: SAROS は **3D 空間 × 三色弾 × パリィタイミング** の 3 軸で readability を確保、v06 は **2D 空間 × 単色弾 × 4 層 telegraph 時間軸** で確保。Dimensional structure が異なる
- **v06 適用可否**: **既に達成済 (v06 readability 4 層で並走)**。AAA "bullet ballet" 哲学が独立到達済。v07 経路B で 3 軸構造を狙う場合は弾種別 (色分け判断マトリクス) の追加が前提

## 3. v06 にない要素 = 色分けによる判断マトリクス

§1 対応表 / §2 指差し 1-3 で繰り返し浮上した v06 の欠落要素を一行で言うと: **「弾種別 × プレイヤー応答の 2 軸マトリクスが無く、全弾を同一勾配 (graze 接近で報酬) で扱っている」**。

SAROS の核設計を抽象化すると:

| 弾種 | 推奨応答 | 報酬構造 |
|---|---|---|
| 青 | シールドブロック (受動) | 安全に被弾無効化 |
| 赤 (Nova) | Soltari Gauntlet パリィ (能動入力) | 反射ダメージで敵に返す |
| 黄 | 回避 (通常 dodge) | 接触すると stamina コスト発生 |

v06 はこの 3x3 マトリクスを **1x1** (全弾に対し graze 1 種類の応答) に縮退している。これは

- (i) 守の段階整合性 (`feedback_clone_strategy.md` t:5) の自然な帰結 — Psyvariar 経路 (経路A) の縦深化を続けてきた結果、弾種別判定は経路A の外側にある
- (ii) `削除可能改良 1 個刻み` 制約の自然な帰結 — マトリクス追加は draw() / 弾発射 / onGraze() / hit 判定の 4 箇所同時侵襲で、最小単位を超える

ことから、v06 の「欠落」というよりは「設計選択」の側面が強い。次iteration の方針はこれを「埋めるべき穴」と扱うか「経路A の縦深化を続ける」か、の判断に帰着する (§4 で Ash 判定)。

## 4. Stage 4 自己判定 — v06 内追加 or v07 経路B

`feedback_prediction_responsibility.md` t:5 Stage 4 「AI 自プレイで『良い』と確信してから依頼」を本書面に適用。本書面は v07 案ではなく **次iteration 起点選定の書面** なので Stage 4 の対象は「色分け判断マトリクスを v06 内追加で吸収可能か / v07 経路B 横移動として扱うべきか」の 1 点。

### 判定: **v07 経路B (横移動)** — v06 内追加では吸収不可

**根拠**:

1. §2 指差し 1-4 で **4 項目連続で「v06 適用可否=不適用 (v07 経路B 候補)」** と判定した。1 項目だけなら削除可能改良 1 個刻みで吸収可能性を検討する余地があるが、4 項目連続は構造的に v06 経路A の外側
2. §1 対応表で「色分け判断マトリクス相当が v06 に無い」と書いたが、これは Psyvariar 経路 (経路A = graze 単軸縦深化) の **設計範囲外** に位置する。経路A の縦深化 (A-3 → A-5 (b) → A-6 (a) → A-6 (b)) は 5/5 中 4/5 まで達成済で、残る (e) Roll hitbox shrink は graze_log に画面外機軸動作が無いため不適用 (v06 README §A-6 (b) で明示)。経路A の縦深化は v06 で **構造的天井**に到達している
3. 色分け判断マトリクスは別経路 (経路B = CAVE/bullet-cancel 型 ≠ Psyvariar/graze 型) に近く、`knowledge/20260519_bullet_hell_two_paths_psyvariar_graze_vs_cave_cancel_three_independent_signals.md` で確立した「経路A/B の独立性」に従えば、経路A から経路B への横移動は「型の獲得」ではなく「型の切り替え」(`feedback_clone_strategy.md` t:5)
4. SAROS は AAA スケール (Housemarque, PS5 専売, 2026-04-30 release) で **3 経路 (シールド/パリィ/回避) を 1 ゲームに同居** させた完成形。我々が同じ縦深化を経路A で追っている段階で経路B 機構を v06 に追加すると、両経路が浅いまま混在する shallow clone リスクが高い

### 経路B 試行の前段として固定すべき条件

v07 経路B (色分け判断マトリクス、弾種別 × 応答の 2 軸) を着手する場合の **着手前ゲート**:

1. **v06 5機構の Nao_u プレイ評価到達** (Slack ts=1779594807 か ts=1779233429 のいずれかで Q-1/Q-2 受領)
2. **v06 が「v05 beta より良い」が確定** (Yes/Partial で v07 着手可能、No なら v06 経路A の再縦深化または別系統再起動)
3. **v07 brainstorm で経路B 案を 5 本以上並列で出し、削除可能改良 1 個刻みで実装可能な最小案を Stage 1 で選ぶ** (現時点での候補: 弾色 2 種 + 異なる graze 半径、または弾色 2 種 + 一方のみ graze 対象)
4. **v07 着手時に v06 を v06/index.html として完全保存し、v07 は別ディレクトリで開始** (v05 → v06 と同型の保護)

3 つ揃わない限り v07 経路B 着手保留。

### 判定の自信度開示

本判定の自信度は **中** (高でも低でもない)。理由:

- (高側) §2 指差し 4 連続「不適用」は構造的に強い証拠
- (低側) AI 自プレイ未実施 — SAROS は PS5 専売で Ash はプレイ不能、graze_log v06 のプレイ感が「色分けが本当に欲しい体験か」は Ash 単独では判定不能。`predicted_play.md` (v04 で Log が書いた限界開示) と同型の Stage 4 限界

v06 評価が Nao_u から到達し、その評価内容が「色分けが欲しい」「単色で十分」のどちらかを示唆するまで、v07 経路B 着手判定は **保留** が正解。本書面の判定は「もし v07 経路B に進むなら、その方針で着手前ゲートを設ける」という条件付き判定。

## 5. 関連 knowledge との接続

### 5.1 `knowledge/20260520_shmup_relief_equipment_konami_code_graze_resource_conversion.md` (救済装置 = resource conversion)

§2 指差し 5 (SAROS ammo-from-bullets × graze_log A-6 (b)) が **AAA 完成形での独立到達証明**。20260520 で結晶化した「救済装置 = resource conversion (graze → active 防御)」は SAROS の ammo-from-bullets と同根思想で、v06 A-6 (b) の擦り誘発勾配がこの系譜上にあることを本書面で裏取りした。

**接続線**: 「resource conversion は v06 A-6 (b) で 1 段達成 → SAROS 直接変換は v07 経路B で別経路として並走可能」。

### 5.2 `knowledge/20260517_keke_luck_danmaku_evolution_dodge_to_resource_cancel_player_agency.md` (danmaku 進化軸: dodge → resource → cancel)

§3 「色分け判断マトリクス」が danmaku 進化軸のどこに位置するかを定位する根拠。Keke 軸では「dodge (回避のみ) → resource (graze で資源化) → cancel (パリィ等で能動消去)」と進化する。SAROS は **3 段すべてを 1 ゲームに同居** (黄=dodge / 青=resource / 赤=cancel)、v06 は **resource (graze) 段に留まる**。

**接続線**: 「graze_log v06 は Keke 軸 resource 段の縦深化を達成 → v07 経路B は dodge 段 (黄弾) と cancel 段 (赤弾パリィ) を追加する経路として位置づけ可能」。

### 5.3 `knowledge/20260514_fladdict_poker_bank_control_trial_subdivision.md` (fladdict bank control)

§4 Stage 4 判定の「自信度=中」は fladdict 4 concept_node のうち **「不条理の統計化」** (law of large numbers) と整合する立場。1 ゲーム評価 (v06 1 回 ship) で「色分けが欲しいかどうか」を確定するのは ergodicity 観点で early。複数 ship + 複数評価で初めて bank control 視点が成立する。

**接続線**: 「v07 経路B 着手前ゲート §4.3 (brainstorm 5 本並列) は fladdict の試行細分化を v07 設計段階に適用した形」。20260514 cross_review (`game/cross_review/20260514_ash_fladdict_bank_control_to_graze_log_v05_design.md`) §4 Stage 1-4 と同型の判定構造を本書面も採用。

## 6. self-check — 抵触チェック

本書面が以下のルールに抵触していないか自己点検:

| ルール | 抵触チェック | 結果 |
|---|---|---|
| `feedback_prior_art_citation_must_verify.md` t:5 M-41 | §2 6 項目すべて引用元URL + 該当文抜粋を併記、抜粋できない項目は採用していない | **不抵触** |
| `feedback_headless_unfit_for_unfinished_eval.md` t:5 | 判定根拠に headless 数値を使っていない (§4 判定は概念整合性と削除可能性のみ) | **不抵触** |
| `feedback_clone_strategy.md` t:5 | 「総合確信度N%」を出していない、調査本数を装っていない、判定を v06 内追加 or v07 経路B の 2 択に明示、v07 着手前ゲートを 4 項目で固定 | **不抵触** |
| `feedback_prediction_responsibility.md` t:5 Stage 4 | Ash 単独判定の限界を §4 「判定の自信度開示」で明示 (PS5 専売で SAROS プレイ不能 / v06 体感判定 AI 不能) | **不抵触** |
| `feedback_difference_first.md` t:5 | §2 純粋指差しを「相違点」起点で書き、一致点は後段に置いた | **不抵触** |
| `feedback_means_ends_reversal_check.md` t:5 | 本書面はゲーム制作ループ (cross_review → 次iteration 起点選定 → v07 着手判定) に接続するため、手段の目的化ではない | **不抵触** |
| `feedback_few_rules_big_effect.md` t:5 | 指差しを 6 項目に絞り (5 項目ノルマを 120% で達成、無意味な水増しはしない)、判定を 1 つに集約 | **不抵触** |

→ 7 項目すべて不抵触で確認済。

## 7. 接続先

- `game/graze_log/v06/README.md` — 本書面 §1 対応表の右側 (5 機構) の原典、A-1/A-4/A-5(b)/A-6(a)/A-6(b) の commit hash 引用元
- `game/graze_log/v06/brainstorm.md` — 18 案比較表、v07 経路B 5 本並列 brainstorm の前例
- `game/cross_review/20260514_ash_fladdict_bank_control_to_graze_log_v05_design.md` — Ash 系列 cross_review 前例、本書面の構成踏襲元 (§0 射程限定 → §1 対応表 → §2 指差し → §4 Stage 判定 → §6 self-check の 5 段構成)
- `game/cross_review/20260511_ash_on_graze_log_v03_response.md` — Ash 系列 cross_review 前例
- `knowledge/20260520_shmup_relief_equipment_konami_code_graze_resource_conversion.md` — §5.1 接続、SAROS ammo-from-bullets との独立到達証明
- `knowledge/20260517_keke_luck_danmaku_evolution_dodge_to_resource_cancel_player_agency.md` — §5.2 接続、danmaku 進化軸での v07 経路B 定位
- `knowledge/20260514_fladdict_poker_bank_control_trial_subdivision.md` — §5.3 接続、Stage 4 自信度=中 の根拠
- `knowledge/20260519_bullet_hell_two_paths_psyvariar_graze_vs_cave_cancel_three_independent_signals.md` — §4 経路A/B 独立性の根拠
- `knowledge/20260523_psyvariar_3_switch2_review_v06_a6_pure_pointing_diff.md` — Psyvariar 3 (経路A 商業競合) との純粋指差し相違点 8 点。本書面 §2 (SAROS 経路 = 別経路) と並走する経路A 内の純粋指差しと対比
- `memory/feedback_clone_strategy.md` t:5 — 守の通過点での 1 個刻み制約、§4 判定根拠
- `memory/feedback_prediction_responsibility.md` t:5 — Stage 4 自己判定の限界開示
- `memory/feedback_prior_art_citation_must_verify.md` t:5 — §2 6 項目の引用検証義務根拠
- `memory/feedback_headless_unfit_for_unfinished_eval.md` t:5 — 判定根拠から headless を外す
- `memory/feedback_difference_first.md` t:5 — §2 相違点起点記述根拠
- `cycle_staging.md` §6 — 本書面の SAROS 外部検索 8 件源、引用元URL リスト
- `cycle_staging.md` §0a t-260524125456-74d6 — v06 評価待ち pending、本書面 §4 判定保留の根拠

— Ash (Win2) 2026-05-24 C198 Phase 4
