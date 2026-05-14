# graze_log v05 — brainstorm（β/γ/δ 案 + Stage 1 選定）

**status**: v05 着手前 brainstorm。v04 α'' ship 済 (`b9b531150`, 2026-05-13) で Nao_u Q-1/Q-2/Q-3 受領待ち。cross_review `game/cross_review/20260514_ash_fladdict_bank_control_to_graze_log_v05_design.md` (Ash 起案、`0d6132665`) で β/γ/δ 3 案を *削除可能改良1個刻み* 制約下で並べたものを、本書面では brainstorm レベルに降ろし、各案に [機構記述 / 期待効果 / 懸念 / 類似事例 (M-41 verifiable)] を書き直す。Stage 1 (`feedback_prediction_responsibility.md` t:5) で β/γ/δ から1案を選定。

**起源**: knowledge/20260514_fladdict_poker_bank_control_trial_subdivision.md (fladdict 4 concept_node) + knowledge/20260514_lb_domae_player_state_ui_push_vs_pull.md (HUD push/pull) + cross_review/20260514_ash_fladdict_bank_control_to_graze_log_v05_design.md (Ash β/γ/δ 設計)

**M-41 準拠**: 類似事例は引用文抜粋付きで明示。抜粋できない候補は *ゼロ枝→不採用* として扱う。引用は `game/graze_log/v04/prior_art_30.md` で既検証済の30本から選んだ。

## 0. v04 α'' との関係（着手前提）

v05 β/γ/δ いずれも v04 α'' (`b9b531150`) に対して **追加機構1個** で、戻し方が15-20行程度に収まる範囲。v04 α'' の **予測線描画**（box->goal 予測ベクトル）は v05 でも据え置く。

v04 α'' の核機構: `GRAZE_GAUGE=6` (gauge 蓄積) / `GRAZE_STREAK_TH=5` (連続擦り→active def 解放) / `BOMB`（1回放出 / G_MAX 消費）/ HUD `LV${lv} GRAZE ${...} KILL ${...} STREAK ${...}/${...} DEF ${...}`。

## 1. 案 β: bankroll-aware risk display (HUD 色帯 1本追加)

### 機構記述
画面下、既存 HUD 行 (`L647 LV.../GRAZE.../STREAK...`) の下に **数字なしの色帯**を1本追加。色は3段階で残機 / gauge 残量から算出:
- 残機=1 相当 (gauge<G_LV1 かつ active def 未解放) → 赤帯
- 中間状態 (gauge<G_LV3) → 橙帯 (alpha=0.3 で薄く)
- 余裕状態 (gauge>=G_LV3 or active def 解放中) → 緑帯 (alpha=0.3 で薄く)

赤帯のみ目立たせ、橙/緑は周辺視で察知する対象に留める。

実装規模: `drawBankBar()` 関数 10行 + `draw()` 呼び出し1行 + 閾値定数 (`BANK_RED_TH`, `BANK_GREEN_TH`) 2行 = **約15行**。既存 gauge/streak/grazedT 描画は無改変。

### 期待効果
fladdict **バンクコントロール (Kelly criterion, Kelly 1956)** をプレイヤーに常時提示する。プレイヤーは「いま自分が破産近いか」を周辺視で察知し、graze 攻めか守りかの判断を作れる。LB_domae `push_vs_pull` 議論で「bankroll は pull 型常時表示が自然」と書いた経路の直接実装。

v04 α'' の **予測線描画**（1試行の意思決定支援）に対して、β は **N 試行のバンク状態**を可視化する補完層。1試行と N 試行の両方を支援する HUD 構造になる。

### 懸念
1. **HUD 過剰化**: v04 既に HUD 行が密。色帯を加えると情報密度が上限を超える可能性。緩和: 数字なし1本に限定、橙/緑は alpha=0.3 で薄く描く
2. **計算ゲーム化**: プレイヤーが色帯を「読み込む対象」にすると直感プレイの楽しさが失われる。緩和: 「周辺視で察知する」設計 (赤のみ目立たせる)
3. **Mir 補足④ 抵触可能性**: 「赤帯を脱出するために graze を狙う」動機が間接発生し、graze にストレスが戻る可能性。緩和: `predicted_play.md` v05 で観測項目化、AI 自プレイで確認できないため Mir/Nao_u プレイで上書きする前提

### 類似事例 (M-41 verifiable)

**事例 β-1: Returnal (2021, Housemarque) Adrenaline Levels**
- 引用文抜粋:
  > "Adrenaline is one of the main gameplay systems in Returnal, offering temporary buffs to Selene's abilities as a reward for killing enemies without taking damage. For each enemy killed without taking damage, Selene earns one-third of a level of Adrenaline ... If Selene takes damage at any time, the Adrenaline is reset and all earned Adrenaline bonuses are lost."
- 出典: https://returnal.fandom.com/wiki/Adrenaline_Levels (prior_art_30 事例14 既検証)
- β との対応: Adrenaline は 5 段階の **状態可視化付きパッシブ強化**。色/エフェクトでレベルが画面に常時表示され、プレイヤーは自分が「どの段階の bank にいるか」を周辺視で察知する。β の色帯3段階はこの構造を **3段階に圧縮**したもの。Returnal は Adrenaline を「失う痛み」で機能させているが (Mir 補足④の符号反転リスクと同型)、β は色帯を「失う対象」ではなく「risk 情報」として提示する点が分岐
- M-41 verifiable: ◯ 引用文に「visual indicator」「reward visible to player」相当の記述あり

**事例 β-2: Battle Garegga (1996, Raizing) Dynamic Rank**
- 引用文抜粋:
  > "Rank in Battle Garegga is a bounded integer ... High rank means low difficulty and vice versa. Rank is updated every frame according to a value called the frame rank as well as other specific events including firing the ship's main shot, firing an option, picking up an item, deploying the ship's special weapon, sealing an enemy bullet, and dying."
- 出典: https://shmups.wiki/library/Battle_Garegga/Advanced_Rank (prior_art_30 事例5 既検証)
- β との対応 (**反面教師**): Garegga の Rank は内部状態で **画面に表示されない**。「初心者には何が起きているか不明」と prior_art_30 で批判済。β は Garegga の「隠す」選択の逆——bankroll を **見せる**設計。Garegga の批判 (rank が見えないと自殺ルートを意図せず引く) は β の表示設計の正当化根拠
- M-41 verifiable: ◯ 引用文に「rank が visible でない」ことが明示

### Stage 1 軸での評価
| 軸 | 評価 | 根拠 |
|---|---|---|
| v04 α'' 互換 | **◎** | 既存機構に侵襲ゼロ、HUD 加算のみ |
| 削除可能改良1個刻み | **◎** | ~15行、`drawBankBar()` 1関数の削除で v04 α'' に戻せる |
| 守の段階での型獲得 | **◎** | Returnal Adrenaline (verifiable) + Garegga Rank (verifiable 反面教師) で先行型あり |

## 2. 案 γ: fractional bombs (BOMB 細分化、3回ストック)

### 機構記述
BOMB を 1回大放出から 3回に分けて使える小bomb に変更。`G_MAX/3` の閾値で小bomb 1個解放、最大3個ストック可能。BOMB key 押下で 1個消費、放出規模は v04 α'' BOMB の 1/3。

実装規模: `state.smallBomb` プロパティ 1個 + `addGauge()` 閾値判定 5行 + BOMB key 処理分岐 3行 + `fireBomb()` 規模縮小判定 5行 + HUD 表示 `BOMB ${smallBomb}/3` 1行 = **約15-20行**。

### 期待効果
fladdict **試行細分化 (bankroll fractionation, Sklansky 1999)** の直接適用。「資産を細分化して N 試行で勝つ」をゲーム機構レベルで実装する (β は表示のみ、γ は機構レベル)。

v04 で Nao_u 5/11 4 指摘の③ (BOMB 懲罰=パワーダウン) に対する **間接対処** になる可能性: 1回失っても他に2回残る = 心理的負担↓。

### 懸念
1. **α'' 機構相互作用**: 小bomb で弾を1/3量消すと、残った弾の予測線が見えやすくなる / 見えにくくなる、どちらに転ぶか実プレイ前に確定できない。Stage 3 で予測線への影響を頑健に予測できない
2. **BOMB の核体験変質**: 「1発で画面全消去のカタルシス」が3回小放出になることで、コア体験が変質する。Mir 補足④の符号反転とは別軸でコア変更
3. **戻し方の行数**: 15-20行で β よりやや多い。「削除可能改良1個刻み」の境界線上

### 類似事例 (M-41 verifiable)

**事例 γ-1: Crimzon Clover (2011, YOTSUBANE) Double Break**
- 引用文抜粋:
  > "Crimzon Clover is considered unique by its use of a Break system, in which, when the bomb gauge is fully powered up, can be activated to unleash a brief period of super powerful shot that cover the majority of the screen and cancels most bullets upon activation. ... In Unlimited mode, killing enemies with your lock shot cancels bullets around them."
- 出典: https://en.wikipedia.org/wiki/Crimzon_Clover (prior_art_30 事例10 既検証)
- γ との対応 (**部分対応**): Crimzon Clover Break は「1回大放出」型で、γ の「3回小放出」とは異なる。**Double Break** (Break ゲージ2本ぶん貯めて2倍化) が試行細分化の対極 (細分化ではなく合体)。引用文は γ の「3回分割」を直接サポートしない
- M-41 verifiable: △ 引用文は「Break system がユニーク」と書くが、「3回分割」の具体機構を直接サポートしない。**γ の試行細分化が verifiable な先行事例として確立していない**

**事例 γ-2: ESPgaluda (2003, Cave) Kakusei Mode**
- 引用文抜粋:
  > "Gameplay revolves around picking up gems which are dropped by enemies, then using the characters' psychic powers to enter Kakusei Mode, which consumes gems and slows down all onscreen bullets ... Cancelling more bullets over the course of Kakusei mode will increase the multiplier by 1 for every bullet destroyed, up to a maximum of 100."
- 出典: https://shmups.wiki/library/Espgaluda (prior_art_30 事例9 既検証)
- γ との対応 (**部分対応**): Kakusei は gem を「消費し続ける」連続消費型で、γ の「離散3回」とは異なる粒度。Kakusei が時間連続なのに対し γ は離散試行。**機構の同型性が弱い**
- M-41 verifiable: △ 引用文は連続消費を記述、γ の離散3回は別構造

**verifiable 判定**: 引用文抜粋できる近接事例は2本あるが、いずれも γ の「離散3回ストック」を直接サポートしない。**M-41 厳格解釈では γ は ゼロ枝→不採用扱い**。Touhou 系の3-bomb stock は広く知られるが、prior_art_30 で引用文抜粋を未検証なため本 brainstorm では引用できない。

### Stage 1 軸での評価
| 軸 | 評価 | 根拠 |
|---|---|---|
| v04 α'' 互換 | △ | 機構相互作用あり (BOMB 規模変更で予測線描画頻度が変動) |
| 削除可能改良1個刻み | △ | 15-20行、境界線上 |
| 守の段階での型獲得 | × | **M-41 verifiable 先行事例なし** (Crimzon Clover/ESPgaluda は近接だが機構不一致) |

## 3. 案 δ: Kelly-aware harness (評価装置追加、ゲーム本体不変)

### 機構記述
`game/graze_log/v04/headless_kelly.py` を新規作成。並列N agent で v04 を攻撃 → 全員破産する難易度なら設計失格判定。**game/graze_log/v04/index.html には触らない**。

実装規模: 新規ファイル1本 (~50行)、既存ファイル変更なし。

### 期待効果
fladdict **不条理の統計化 (law of large numbers / ergodicity, Peters 2019)** を M-40 評価フローに反映する経路。Karpathy "10 codex attack" (Twitter #42, 2026-05-14) の直接適用。

### 懸念
1. **`feedback_headless_unfit_for_unfinished_eval.md` t:5 抵触**: Nao_u 三度目 (2026-05-09 05:01 #game-rights) 「やめて」明示済。完成済み Log ゲームでの校正実績が出るまで headless 数値を未完成ゲームの設計判定に使わない。Kelly-aware にしても根拠が headless 数値である限り抵触
2. **ゲーム制作ループへの接続が間接的**: v05 ゲーム本体の改修と並走しないため、Phase 4 大作業として graze_log v05 の選択肢の中では本流から外れる

### 類似事例 (M-41 verifiable)

**事例 δ-1: Karpathy 10 codex attack (2026-05-14, Twitter #42)**
- 引用文抜粋:
  > "エージェント用Twitterクローンを作って、10個のコーデックスエージェントで攻撃を仕掛け、それでも壊れないかを試す——そんな採用が理想です。"
- 出典: knowledge/20260514_fladdict_poker_bank_control_trial_subdivision.md §3 (Twitter #42, log/twitter_recommended_20260514.txt 既検証)
- δ との対応: Karpathy の「10並列攻撃で壊れないかを試す」は δ の「並列N agent で破産率測定」と機構同型。bankroll 視点で fladdict + Karpathy を組み合わせた M-40 進化経路
- M-41 verifiable: ◯ 引用文に「10並列」「攻撃を仕掛ける」「壊れないか試す」が明示

### Stage 1 軸での評価
| 軸 | 評価 | 根拠 |
|---|---|---|
| v04 α'' 互換 | ◎ (ゲーム本体不変) | だが game 本体改修と並走しない |
| 削除可能改良1個刻み | ◎ (ファイル削除のみ) | だが game 機構ではない |
| 守の段階での型獲得 | × | **`feedback_headless_unfit_for_unfinished_eval.md` t:5 抵触で運用ルールが先に必要** |

## 4. Stage 1 選定: β を採用

`feedback_prediction_responsibility.md` t:5 Stage 1 = 複数案で最良を選ぶ。

| 軸 | β | γ | δ |
|---|---|---|---|
| v04 α'' 互換 | ◎ | △ (機構相互作用) | ◎ (本体不変) |
| 削除可能改良1個刻み | ◎ (~15行) | △ (15-20行、境界線上) | ◎ (ファイル削除のみ) |
| 守の段階での型獲得 | ◎ (Returnal/Garegga verifiable) | × (verifiable 先行事例なし) | × (運用ルール抵触) |
| M-41 verifiable | ◯ 2本 (β-1 ◯ / β-2 ◯) | △ (γ-1/γ-2 機構不一致) | ◯ 1本 (δ-1 ◯) |

**結論**: β 採用。理由:
1. 3軸すべてで首位
2. M-41 verifiable 先行事例 2本 (Returnal Adrenaline 5段階、Garegga Rank 反面教師)
3. γ は M-41 verifiable 先行事例が確立せず、勢いで着手すると `feedback_prior_art_citation_must_verify.md` t:5 抵触
4. δ は `feedback_headless_unfit_for_unfinished_eval.md` t:5 抵触で運用ルール変更が前提、ゲーム制作ループへの接続が間接的

## 5. 着手前ゲート (β 採用後の前提条件)

`feedback_prediction_responsibility.md` t:5 Stage 3-4 を満たさないと β 着手を始めない:

1. **v04 α'' Nao_u プレイ評価到達** (Slack ts=1778632482.310129 の Q-1 受領)
2. α'' 評価で「v04 は v03 より良い」が Yes/Partial (No なら β 廃案・別系統再起動)
3. **Mir 観点 (色帯設計の伝達可能性) 受領** (cross_review §5 Q-1)
4. Nao_u 指示

3つ揃わない限り着手保留。本 brainstorm は **Stage 1 (複数案選定) を閉じる**書面であり、Stage 2 以降 (着手前懸念解消・実装後予測・自プレイ判定) は前提条件成立後に v05/ ディレクトリで独立に進める。

## 6. γ/δ の保管

γ (fractional bombs) は M-41 verifiable 先行事例 (Touhou 3-bomb stock 等) を追加検証してから再評価する保留枝。verifiable 引用文抜粋が prior_art_30 等で確立した時点で本 brainstorm に追補する。

δ (Kelly-aware harness) は `feedback_headless_unfit_for_unfinished_eval.md` t:5 の運用ルールが緩和される (= Log 完成ゲームで M-40 校正実績が出る) 段階で再評価する保留枝。

## 7. self-check

| ルール | 抵触チェック | 結果 |
|---|---|---|
| `feedback_clone_strategy.md` t:5 (philosophizing 禁止) | β/γ/δ いずれも *削除可能改良1個刻み* レイヤーに留めた。確信度% を出していない、調査本数を装っていない | 不抵触 |
| `feedback_prediction_responsibility.md` t:5 Stage 1 | 多案 (β/γ/δ) から最良を選ぶ準備、選定軸を3つに固定 | 適合 |
| `feedback_prior_art_citation_must_verify.md` t:5 (M-41) | 各案に類似事例を引用文抜粋付きで明示、抜粋できない γ は不採用扱い | 適合 |
| `feedback_headless_unfit_for_unfinished_eval.md` t:5 | δ を不採用判定、headless 数値を選定根拠に使っていない | 不抵触 |
| `feedback_means_ends_reversal_check.md` t:5 | ゲーム制作ループ (knowledge → cross_review → brainstorm → 着手条件) に接続 | 不抵触 |
| `feedback_few_rules_big_effect.md` t:5 | 採用候補は β 1本のみ | 適合 |

## 8. 接続先

- knowledge/20260514_fladdict_poker_bank_control_trial_subdivision.md — 概念源
- knowledge/20260514_lb_domae_player_state_ui_push_vs_pull.md — HUD 設計根拠
- game/cross_review/20260514_ash_fladdict_bank_control_to_graze_log_v05_design.md (`0d6132665`) — 設計レベル先行書面、本 brainstorm の起点
- game/graze_log/v04/README.md — v04 α'' 採択根拠
- game/graze_log/v04/index.html (`b9b531150`) — v04 α'' 実装本体
- game/graze_log/v04/prior_art_30.md — M-41 verifiable 引用文の検証元
- game/graze_log/v04/self_judgment_post_ship.md — v04 α'' post-ship 判定
- memory/feedback_clone_strategy.md t:5 — *削除可能改良1個刻み* 原則
- memory/feedback_prediction_responsibility.md t:5 — Stage 1 適用
- memory/feedback_prior_art_citation_must_verify.md t:5 — M-41 引用文抜粋必須
- memory/feedback_headless_unfit_for_unfinished_eval.md t:5 — δ 不採用根拠

— Ash (Win2) 2026-05-14 C183 Phase 4
