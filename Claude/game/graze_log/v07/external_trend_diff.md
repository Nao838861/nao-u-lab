# graze_log v07 — external_trend_diff.md (業界 modern variant 共通核 vs v07 R-I 死守ライン 方向差分 + 評価結果別 v08 分岐予置)

**status**: v07 Stage 5 Nao_u プレイ評価依頼 (#game-rights ts=1779939191.243789, 2026-05-29 09:00) 投稿後の待機時間に、業界 modern variant (2026 release / 2026 期待 indie) の共通核と v07 5 機構積層 (B-2 + 観点 3/6/7/8) の方向差分を明示する書面。Nao_u 評価結果 (肯定 / 否定 / 中間) に応じた v08 分岐を **2-3 案で予置**し、評価到着時に分岐判断を即時化することが本ファイルの目的。本ファイルで v08 経路を確定しない (`feedback_clone_strategy.md` t:5 守破離 守の段階準拠)。`headless 数値は本ファイルの判定根拠から外す` (`feedback_headless_unfit_for_unfinished_eval.md` t:5)。

## 概念ノード (R-007 外部対応語併記)

- **modern variant 共通核** = genre common core / mainstream design convergence (本書内私的用語) — 2026 年前後 release / 期待 indie の bullet hell + survivors-like 系で複数タイトルが共通して採る設計核
- **R-I 死守ライン** = monotonic mechanism retention (in-house) / one-way design ratchet — 一度通過した機構は撤回しない設計時の不可逆性 (`memory/game_lessons_log.md` R-I)
- **dodge 依存低下** = dodge dependency lowering / precise-input substitution — プレイヤーの精密回避入力への依存を build / synergy / temporary invincibility で代替させる設計傾向
- **二兎追い構造** = dual-rabbit chase structure (本書内私的用語) — 業界 mainstream とは方向が逆の死守ラインを設定しながら、業界共通核の利点 (replayability / build expressiveness) も部分的に取り込む設計戦略
- **stack synergy 主軸** = stack synergy as primary axis / synergy-driven build expressiveness — 単機構の和ではなく機構間の組み合わせ複利を marketing/design 上の中心機能として置く設計
- **score attack refinement appetite** = appetite for refinement / replay value (Csikszentmihalyi 1990 skill-challenge balance に隣接) — 同 stage を磨き込みたい欲求 (`refinement_predict.md` C203 既出)

## 外部出典 (M-41 準拠: URL + 引用文抜粋カラム併記)

### 1. Grind Survivors (Pushka Studios / Assemble Entertainment, Steam release 2026-03-16)

- URL: https://store.steampowered.com/app/3816930/Grind_Survivors/
- 補足: https://rogueliker.com/grind-survivors-preview/ (Forge sub-menu 詳細)
- 補足: https://grindsurvivors.wiki/ (Improve / Recycle 詳細)

| 機能 | 公式引用文 (Steam ストア / Rogueliker / Wiki) |
|---|---|
| **Stack Upgrades + Synergies** | "Build Your Way – Unlock synergies and stack upgrades that shape each run." (Steam) |
| **Procedural Weapons** | "Loot-Driven Combat – Discover procedurally generated weapons with randomized traits." / "Rare finds come packed with powerful perks and unique traits that change how they play." (Steam) |
| **Forge Risk-Reward** | "Risk & Reward Crafting – Upgrade gear with high-stakes choices at The Forge." (Steam) |
| **Improve リスク** | "The higher you level a weapon, the greater the chance of losing your progress, making it a real gamble if you're chasing top-tier loot." (Rogueliker) |
| **Improve 永久喪失** | "A poorly Improved weapon can fail and be lost entirely." (Wiki) |

(既検証: `knowledge/20260528_grind_survivors_stack_synergies_vs_graze_log_v07.md`)

### 2. shmups.wiki Bullet Hell Shmup 101 (Boghog)

- URL: https://shmups.wiki/library/Bullet_Hell_Shmup_101

| 軸 | 引用文 (抜粋, Phase 1 §6 ログ 2026-05-28 21:50 経由) |
|---|---|
| **defensive scoring** | "defensive scoring (自動bonus + timer強制行動でpassive play punish)" |
| **aggressive scoring** | "aggressive scoring (action強制で score 加算) — 危険行動を取らないと score が伸びない" |
| **両者共通** | "両者ともpassive non-rewarded — どちらの設計でも『何もしない』は最劣" |

(既検証: `game/graze_log/v07/external_scoring_axis.md` C204 §外部出典)

### 3. steam250 Top Score Attack Games (genre 集約)

- URL: https://steam250.com/tag/score_attack

| 軸 | 引用文 (抜粋) |
|---|---|
| **content variety 早期枯渇** | "content variety can be limited once all stages and bosses are seen, with longevity depending heavily on appetite for refinement rather than discovery" |

(既検証: `game/graze_log/v07/refinement_predict.md` C203 §外部裏付け)

### 4. shmups.system11.org Giest118 scoring ガイド (補強)

- URL: https://shmups.system11.org/viewtopic.php?t=64325

| 軸 | 引用文 (抜粋, Phase 1 §6 ログ 2026-05-28 21:50 経由) |
|---|---|
| **carry-over multiplier** | "boss multiplier (Ketsui 型 stage→boss carry-over) で score 突発boost = correct play 信号" |

(既検証: `game/graze_log/v07/external_scoring_axis.md` C204 §外部出典)

## 業界 modern variant 共通核 (4 ソース横断抽出)

上記 4 ソースの引用文を横断して抽出する「2026 年前後 bullet hell + survivors-like の modern variant 共通核」:

| 核要素 | 内容 | 該当ソース |
|---|---|---|
| **stack synergy 主軸** | 単機構の和ではなく機構間の組み合わせ複利を中心機能化 (Survivors-like genre standard) | Grind Survivors Steam 公式 |
| **build expressiveness** | プレイヤーが run 中に選び取る perk + procedural weapon の組み合わせで各 run が異なる体験 | Grind Survivors Steam 公式 |
| **risk-reward crafting** | 投資 → 喪失リスクのリスク選択で進捗の可逆性を能動的に組み込む | Grind Survivors Wiki / Rogueliker |
| **passive play 非報酬** | 何もしないと損する構造 (defensive timer punish or aggressive action 強制) | shmups.wiki |
| **refinement appetite 依存** | content variety は早期枯渇、長期生存は同 stage 磨き込み欲に依存 | steam250 / refinement_predict 既出 |
| **carry-over multiplier** | stage→boss / phase→phase で蓄積の持ち越しによる score 突発 boost を correct play 信号化 | Giest118 ガイド |

**共通核の傾向 (4 ソース横断観察)**: 2026 年前後の survivors-like + bullet hell modern variant は、**「プレイヤーの精密 dodge 入力の依存度を下げ、build / synergy / risk-choice / carry-over で expressiveness を生む」方向に傾斜**している。Grind Survivors の Stack Upgrades + Procedural Weapons + Forge は「dodge 精度ではなく build 選択」が run の差を生む設計、shmups.wiki の "passive 非報酬" 原理は dodge 行動を強制せず「何かを能動的にやる」一般要件として抽象化、refinement appetite は dodge 精度ではなく細部最適化への食欲を長期生存の主軸に置く。すなわち **dodge 依存低下 + stack synergy 主軸が、modern variant の中心ベクトル**。

## v07 R-I 死守ラインとの方向差分 (二兎追い構造の明示)

### v07 R-I 死守ラインの再確認

`game/graze_log/v07/README.md` §「v07 で実装する 1 機構 + 同時物理化する 4 観点」と R-I の関係を整理する。v07 の 5 機構 (B-2 / 観点 3 / 観点 6 / 観点 7 / 観点 8) は **全て graze 行動 (= 弾を擦る精密 dodge 入力) を gauge / score / chain / 弾側マーカー視認の中心経路に置く**。具体的に:

- **B-2 Hyper Activation** = graze gauge 満タンで発動 → graze 行動が発動の前提
- **観点 3 弾側マーカー** = 無敵中の高倍率対象を弾側に表示 → 「擦るべき弾」の視認を強化、擦り続けたくなる
- **観点 6 7 区分 spawn テーブル** = phase 5/7 山で弾密度最大 → graze 機会の時間軸集中、擦らないと得点機会喪失
- **観点 7 180F cap reached 大成功反応** = 連鎖 Lv up 4-5 chain 推奨、A-6(a) 180F cap 到達狙い → chain 維持のために graze し続ける動機
- **観点 8 bad policy headless 4 方針** = camper (擦らない方針) が route (擦る方針) を下回ることを relative order で検証 → 擦らない方針が罰される設計が壊れていないか自己点検

R-I 死守ライン (`memory/game_lessons_log.md` R-I) の v07 における操作的定義: **「精密 dodge 入力 (graze) を体験の中心経路から外さない、それを補完する装置のみ追加する」**。

### 業界 modern variant 共通核との方向差分

| 軸 | 業界 modern variant 共通核 | v07 R-I 死守ライン | 方向 |
|---|---|---|---|
| **dodge 精度の役割** | build / synergy / temporary invincibility で精密 dodge 依存を低下 | graze 行動を gauge / score / chain / 視認 4 経路で同時駆動、依存を最大化 | **逆方向** |
| **expressiveness の源** | プレイヤーが run 中に選ぶ perk + procedural weapon | 開発者が世代 (v01→v07) 跨ぎで重ねる固定 5 機構、player choice は無し | **逆方向** |
| **可逆性** | Improve / Reforge / Recycle でプレイヤーが実行時に可逆性をリスク選択 | 死守ライン (一度通過した機構は撤回しない) を開発者が設計時に固定 | **逆方向** (作用層も逆) |
| **passive 非報酬** | 自動bonus / timer / action 強制で非報酬を保証 | 同 (graze しないと gauge も chain も score も伸びない) | **整合** |
| **refinement appetite** | 同 stage 磨き込み欲で長期生存 | 90 秒 1 stage 単独構成で短さ条件を満たす、磨き込み方向は整合 | **整合** |
| **carry-over multiplier** | stage→boss / phase→phase で蓄積持ち越し | 観点 6 phase 1-4 → phase 5-7 で chain / gauge / Lv 持ち越し (機構同型, 表示は未明示) | **整合 (機構レベル) / 未明示 (表現レベル)** |

**二兎追い構造の明示**: v07 は modern variant 共通核に対し、**6 軸中 3 軸で逆方向 (dodge 精度 / expressiveness / 可逆性), 3 軸で整合 (passive 非報酬 / refinement appetite / carry-over)**。この差分は偶発ではなく設計選択の結果である。dodge 依存低下を業界 mainstream が選ぶのは、Survivors-like の open-build 型がプレイヤーの精密入力負荷を許容しない genre conventional な設計圧力からで、build expressiveness で run-to-run の差を生む方向が genre 適合的だからである。一方 graze_log は Psyvariar 系の closed-build 型 (固定機構を磨き込む型) として、dodge 精度の体験こそが genre 核心であり、build expressiveness を追加すると「Psyvariar をやめて Survivors になる」ジャンル離脱が起きる。R-I 死守ラインはこのジャンル離脱を **設計時に物理的に防ぐ ratchet** として機能している。

二兎追いの実体は「passive 非報酬 / refinement appetite / carry-over の 3 軸では mainstream と並走しつつ、dodge 精度 / expressiveness / 可逆性の 3 軸では逆方向 (closed-build refinement) を死守する」構造である。これは「反 trend として全てを切る」でも「mainstream に追従する」でもない、3 軸 split による selective alignment である。

## Nao_u Stage 5 評価結果別 v08 分岐 (3 案予置)

Nao_u プレイ評価返信 (ts=1779939191.243789) を以下 3 パターンに大別し、各パターンに対応する v08 分岐を予置する。**本セクションで分岐を確定しない**。評価返信到着時に該当パターンを当て、該当案を v08 検討の起点とする。

### 案 A: 評価結果「肯定」 (5 機構積層が単調解消に効いた / dodge 体験が活きている)

**対応 v08 分岐**: **反 trend 設計として明示価値を確定**し、closed-build refinement 方向を 1 機構刻みで深化する。

具体的な v08 候補機構 (1 機構刻み制約遵守, 3 候補から 1 つを selected):

| 候補 | 内容 | 出典 |
|---|---|---|
| **v08-A1** | 観点 6 carry-over multiplier の明示的表現追加 — phase 4→5 / phase 6→7 の boundary で「x N carried」表示 (Ketsui 型 stage→boss carry-over の機構同型を表現層にも持ち上げる) | `external_scoring_axis.md` C204 §2 / Giest118 ガイド |
| **v08-A2** | refinement appetite 喚起の自己課題化経路 — Hyper 0 回クリア / chain MAX 連発 / 全 phase no-miss などの自己ベスト記録機能 | `refinement_predict.md` C203 §外部裏付け bigreview / nowloading |
| **v08-A3** | synergy 表の明文化 — v06/v07 6 機構間の暗黙 synergy (例: 観点 3 弾側マーカー × A-6(b) 無敵中 2x graze の同時発火) を README に整理 | `knowledge/20260528_grind_survivors_stack_synergies_vs_graze_log_v07.md` §v07 含意 1 |

肯定評価の場合は **業界並走化 (案 v08-A3)** よりも **carry-over 表現 (案 v08-A1)** を優先選定する根拠: dodge 体験が活きていることが Nao_u 評価で確認されたなら、graze による蓄積を「持ち越し感」で報酬化する v08-A1 が R-I 整合性 (graze 中心経路維持) で最も自然な天井引き上げになる。v08-A3 (synergy 表) は内側整理であって playable diff にならない (`feedback_means_ends_reversal_check.md` t:5) ため、肯定評価で playable 着手を続ける文脈では後順位。

### 案 B: 評価結果「否定」 (5 機構積層しても単調 / dodge 体験が浮いている)

**対応 v08 分岐**: **dodge 依存低下方向への部分譲歩**を検討する。R-I 死守ラインの「全面死守」を「dodge 中心経路を維持しつつ、precise input 圧を緩める補助装置を 1 つ追加」に再定義する。

具体的な v08 候補機構 (1 機構刻み, 2 候補):

| 候補 | 内容 | 業界対応 |
|---|---|---|
| **v08-B1** | 一時的 invincibility / iframe の選択的追加 — Hyper 発動後の 60F 程度の安全時間 (現状は弾消去のみ、無敵延長は無い) | DoDonPachi / Survivors-like の post-bomb 安全時間 |
| **v08-B2** | telegraph / windup 強化 — 弾発射 windup を視覚的に拡張 (現状 anticipation 弱) し、dodge の予測難度を下げる | `knowledge/20260519_bullet_hell_anticipation_windup_telegraph_readability_three_layers.md` |

否定評価の場合に **build expressiveness (procedural weapon / perk 選択) を追加しない** 根拠: build expressiveness の追加は Survivors 化 = ジャンル離脱を意味し、graze_log の根本コンセプト (Psyvariar 系 closed-build refinement) と矛盾する。R-I 死守ラインを「全面死守」から「中心経路維持 + 補助緩和」に再定義することは譲歩だが、ジャンル離脱には踏み込まない。**否定評価が来ても build expressiveness 追加を採らない判断は本ファイルで予置確定**。

### 案 C: 評価結果「中間 / 部分肯定」 (一部機構は効いた / 一部はまだ単調)

**対応 v08 分岐**: **どの機構が効いたか / 効かなかったかの Nao_u 言語化を起点に、効いた機構を 1 機構刻みで深化、効かなかった機構を温存**する hybrid 分岐。

判断手順 (評価返信到着後の Phase 4 で実施):

1. Nao_u 評価コメントから「効いた機構」「効かなかった機構」を抽出
2. 効いた機構 1 つを v08 で深化対象に選定 (例: 観点 7 大成功反応が効いた → cap reached 演出を 2 段階化)
3. 効かなかった機構 1 つを温存または微調整 (削除しない、R-I 死守 / monotonic 維持)
4. v08 着手 commit の説明文に「Nao_u 評価コメント抜粋」を引用し、選定根拠を残す

中間評価の場合に **5 機構を一度に再設計しない** 根拠: 1 機構刻み制約 (`feedback_clone_strategy.md` t:5) は中間評価でも適用される。「半分効いたなら全部やり直し」は philosophizing 兆候 (戦略レイヤー化) で、守の段階を抜けている signal。

## 本ファイル自身の判定方針 (headless 数値排除 / philosophizing 抑止)

- **headless 数値 (到達率 / 生存秒 / 成功率) は本ファイルの判定根拠から完全排除** (`feedback_headless_unfit_for_unfinished_eval.md` t:5)。観点 8 headless 4 方針は v07 README §「数値の絶対値は判定根拠としない」の運用に従う。本ファイル §業界 modern variant 共通核 / §方向差分 / §v08 分岐予置のいずれにも数値 metric を持ち込んでいない。
- **v08 経路を本ファイルで確定しない**。3 案 (A 肯定 / B 否定 / C 中間) を予置するのみで、Nao_u 評価返信受領前に v08 着手を開始しない (`feedback_clone_strategy.md` t:5 守破離守の段階準拠)。
- **本ファイルは playable diff ではない** ことを自認する (`feedback_means_ends_reversal_check.md` t:5)。Phase 4 大作業の出力としては書面 1 本 = means_ends 診断対象。ただし「v07 評価返信受領後の v08 分岐判断を物理的に即時化する」ための前置きであり、playable 着手を加速する装置として書いた。次サイクル以降の playable 着手 (v08-A1 / B1 / B2 / C-選定機構) の起点になることが本ファイルの存在意義。

## 接続先

- `game/graze_log/v07/README.md` — 5 機構統合方針 (本ファイル方向差分の対象)
- `game/graze_log/v07/external_scoring_axis.md` C204 — shmups.wiki defensive/aggressive 二分 + Ketsui carry-over (本ファイル §外部出典 2/4 の既検証元)
- `game/graze_log/v07/refinement_predict.md` C203 — score attack refinement appetite (本ファイル §外部出典 3 の既検証元)
- `game/graze_log/v07/self_judgment.md` — Stage 4 自判定 (Nao_u 評価依頼の根拠)
- `knowledge/20260528_grind_survivors_stack_synergies_vs_graze_log_v07.md` C201 — Grind Survivors 5 機構との比較 (本ファイル §外部出典 1 の既検証元、§案 A-v08-A3 の synergy 表案根拠)
- `knowledge/20260519_bullet_hell_anticipation_windup_telegraph_readability_three_layers.md` — telegraph / windup (案 B-v08-B2 の根拠)
- `memory/game_lessons_log.md` R-I — 死守ライン (本ファイル §方向差分の操作的定義基盤)
- `memory/feedback_clone_strategy.md` t:5 — 守破離守の段階、1 機構刻み制約 (本ファイル全体の philosophizing 抑止根拠)
- `memory/feedback_prediction_responsibility.md` t:5 — Stage 1-4 予測責任 (本ファイル §v08 分岐予置は Stage 3 予測の事前準備に相当)
- `memory/feedback_headless_unfit_for_unfinished_eval.md` t:5 — headless 数値排除 (本ファイル §本ファイル自身の判定方針)
- `memory/feedback_means_ends_reversal_check.md` t:5 — playable diff 第一義 (本ファイルの自己診断根拠)
- `memory/feedback_prior_art_citation_must_verify.md` t:5 — M-41 (本ファイル §外部出典 4 ソース全て URL + 引用文抜粋カラム併記)
- `log/external_search.log` 2026-05-28 — Phase 1 検索ヒット (本ファイル §外部出典の発見起点)

— Ash (Win2) 2026-05-29 C205 Phase 4 大作業 (業界 modern variant 共通核 vs v07 R-I 方向差分 + 評価結果別 v08 分岐 3 案予置)
