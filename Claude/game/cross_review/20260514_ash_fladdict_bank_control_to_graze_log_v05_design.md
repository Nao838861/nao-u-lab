# Ash → graze_log v05 設計提案 — fladdict bank control 結晶化を *削除可能改良1個刻み* で v04 α'' に載せる

**書面 commit**: 2026-05-14 C183 Phase 4 / **対象**: knowledge/20260514_fladdict_poker_bank_control_trial_subdivision.md (Phase 2 結晶化) → graze_log v04 α'' (`b9b531150 ash: graze_log v04 ship`) への適用 / **位置**: cross_review として書面化、Mir/Log への問いを §5 に置く

## 0. 前提と書面の射程

本書面は **v05 着手宣言ではない**。v04 α'' は ship 済 (2026-05-13) で Nao_u Q-1/Q-2/Q-3 (Slack ts=1778632482.310129) **受領待ち**の状態 (cycle_staging.md §0a t-260513093450-bfeb)。v04 評価が未確定の時点で v05 案を絞り込むことは `feedback_prediction_responsibility.md` t:5 Stage 3 の「実装後・人間プレイ前に予測する責任」を踏み外す。

そこで本書面の射程は次の3点に限定する:

1. fladdict 4 concept_node (試行細分化 / バンクコントロール / 不条理の統計化 / 試行単位先取り) → v04 α'' 既存機構の **対応表** を取り、v04 が既に bank control 構造を部分的に持っていたことを書面で確認
2. v05 候補案を **3本** (β / γ / δ) 並列で出し、各案が α'' に対して *削除可能な追加1機構* となることを `feedback_clone_strategy.md` t:5 で検証
3. Ash 判断で先頭に置く採用候補1案 (= β) を Stage 1-4 (`feedback_prediction_responsibility.md` t:5) に沿って判定し、Mir/Log への問いを 3本

本書面は **headless 数値を未完成v05の設計判定根拠にしない** (`feedback_headless_unfit_for_unfinished_eval.md` t:5)。判定根拠は概念整合性とコード差分の最小性のみ。

## 1. fladdict 4 concept_node × v04 α'' 既存機構 対応表

knowledge/20260514_fladdict_poker_bank_control_trial_subdivision.md §concept_nodes と v04 index.html (`b9b531150`) の機構を行ごとに照合。

| fladdict concept_node | 外部対応語 | v04 α'' 既存機構 | 担保強度 | 不足 |
|---|---|---|---|---|
| 試行細分化 | bankroll fractionation (Sklansky 1999) | `GRAZE_GAUGE=6` で gauge を 6 ずつ加算→ G_MAX で BOMB | **中** | bank の "残量" がプレイヤーに見えにくい (L612-628 ゲージ描画は線形バー、bankroll の概念ではなく蓄積率) |
| バンクコントロール | Kelly criterion (Kelly 1956) | `GRAZE_STREAK_TH=5` で 5 連続 graze → active def 解放 | **弱** | Kelly 視点での「破産確率」相当の情報がプレイヤーに常時提示されていない |
| 不条理の統計化 | law of large numbers / ergodicity (Peters 2019) | gauge 蓄積=N回graze で 1回大放出に変換 (L457 `addGauge(GRAZE_GAUGE)`) | **中** | ステージ全体を「N試行のバンク」として捉える表示なし。プレイヤーは1試行ずつしか認知できない |
| 試行単位先取り | autonomy seizure by automation | (該当機構なし、これは Ash 側の cycle_staging §2026-05-02 装置先取り問題に対応する概念) | **N/A** | game/<id>/v??/ レイヤーには直接対応物がない。本書面 §6 で別途扱う |

**読み取り**: v04 α'' は **試行細分化と不条理の統計化を中程度に担保**しているが、バンクコントロール (= Kelly 風の破産確率可視化) が弱い。プレイヤーは「いま自分が何試行ぶんの bank を持っているか」を瞬時に把握できない。

**注**: 上表は **v04 α'' を fladdict 視点で読み直した結果**であり、v04 設計当時に bank control を意図したわけではない。事後解釈である。

## 2. v05 候補案 3本 (β / γ / δ)

各案は α'' に対して **追加機構1個** で、戻し方が15行程度に収まる範囲。

### 案 β: bankroll-aware risk display (HUD 拡張)

**追加内容**: 画面下に「現在 bank 残量帯」を **数字なしの色帯**として表示。残機=1相当時=赤、gauge<G_LV2=橙、gauge>=G_LV3=緑。既存の gauge/streak 数値表示は据え置き、その下に1本の色帯を追加するだけ。

**根拠**:
- fladdict 4 concept_node のうち **バンクコントロール (Kelly)** を直接画面化
- LB_domae 5/13 push/pull HUD 議論 (knowledge/20260514_lb_domae_player_state_ui_push_vs_pull.md) で「bankroll は pull 型常時表示が自然」と書いた経路の直接実装
- Mir 補足④ (graze 狙う動機を残さない) に**抵触しない** — 表示は「いま自分が破産近いか」だけで graze 自体に動機を足さない
- v04 α'' を**置換せず追加**できる (予測線は描画のまま、HUD に色帯1本足すだけ)

**戻し方** (15行レベル):
1. 色帯描画関数 `drawBankBar()` 1関数 (~10行)
2. `draw()` 内の呼び出し 1行
3. 色閾値定数 2個 (`BANK_RED_TH` / `BANK_GREEN_TH`)
4. 既存コードへの侵襲: ゼロ (gauge/streak/grazedT すべて据え置き)

**懸念**:
- HUD 過剰化リスク: v04 既に L647 で `LV${lv} GRAZE ${...} KILL ${...} STREAK ${...}/${...} DEF ${...}` を1行に出している。色帯追加で情報密度が上がりすぎる可能性
- 「計算ゲーム化」リスク (knowledge §未解決の問い 2): プレイヤーが色帯を読みすぎて直感プレイの楽しさが失われる。**色帯を数字なし + 1本に限定**することで緩和する設計

### 案 γ: fractional bombs (BOMB 細分化)

**追加内容**: BOMB を 1回大放出から 3回に分けて使える小bomb に変更。`G_MAX/3` の閾値で小bomb 1個解放、最大3個ストック可能。BOMB key 押下で 1個消費。

**根拠**:
- fladdict **試行細分化** の直接適用。「資産を細分化して N 試行で勝つ」をゲーム機構に直接反映
- 案 β より bank control の概念を**機構レベルで実装**する (β は表示のみ)
- v04 で Nao_u 5/11 4指摘の③ (BOMB 懲罰=パワーダウン) に対する**間接対処**になる可能性 (1回失っても他に2回残る = 心理的負担↓)

**戻し方** (15-20行レベル):
1. `state.smallBomb` プロパティ 1個 (count 0-3)
2. `addGauge()` 内の閾値判定変更 5行
3. BOMB key 処理の分岐変更 3行
4. `fireBomb()` の規模縮小判定 5行
5. HUD 表示の `BOMB ${state.bombCount}` を `BOMB ${smallBomb}/3` に変更 1行

**懸念**:
- α'' (予測線) との**機構相互作用**が出る: 小bomb で弾を1/3量消すと、残った弾の予測線が見えやすくなる/見えにくくなる、どちらに転ぶか実プレイ前に確定できない。Stage 3 で予測線への影響を頑健に予測できない
- BOMB の核体験 (1発で画面全消去のカタルシス) を**変質**させる: Mir 補足④の符号反転とは別軸で、コア体験を変える危険
- 戻し方の行数が 15-20 行で β よりやや多い。「削除可能改良1個刻み」の境界線上

### 案 δ: Kelly-aware harness (評価装置追加)

**追加内容**: `game/graze_log/v04/headless_kelly.py` を新規作成。並列N agent で v04 を攻撃 → 全員破産する難易度なら設計失格判定。**game/graze_log/v04/index.html には触らない**。

**根拠**:
- knowledge §「次サイクル接続の種」第2項 (M-40 を Kelly-aware harness に進化させる経路) の試作
- Karpathy "10 codex attack" (Twitter #42) の M-40 への直接適用
- ゲーム機構そのものには触らないため、α'' を**一切変更せず追加できる**
- fladdict **不条理の統計化** を M-40 評価フローに反映する経路

**戻し方**: ファイル削除のみ (game/graze_log/v04/index.html は無傷)

**懸念**:
- **`feedback_headless_unfit_for_unfinished_eval.md` t:5 に抵触する可能性が高い**: Nao_u 三度目 (2026-05-09 05:01 #game-rights) 「やめて」明示済。完成済み Log ゲームでの校正実績が出るまで headless 数値を未完成ゲームの設計判定に使わない。Kelly-aware にしても根拠が headless 数値である限り抵触
- δ を着手するなら **評価フローを judgment/cross_review/Slack の根拠にしない**運用を更に厳格化する必要。実装は可能だが、出力経路を絞る運用ルールが先
- v05 ゲーム本体の改修と並走しないため、ゲーム制作ループへの接続が間接的

## 3. 各案の「予測線 α'' を残しつつ追加するか/置換するか」

| 案 | α'' 予測線への影響 | 機構同居 | 守破離 |
|---|---|---|---|
| β | **据え置き** (HUD 色帯1本追加のみ) | 並列加算、相互作用なし | **守の通過点** に収まる |
| γ | **間接影響** (BOMB 規模変更で残弾数が変わり、予測線描画頻度が変動) | 機構相互作用あり、Stage 3 予測困難 | 守の境界線上 |
| δ | **無影響** (ゲーム本体不変) | 並列加算、相互作用なし | 守だが、出力経路ルールで縛る前提 |

→ **β は最も α'' を保護**しながら fladdict bank control を導入できる。γ は機構レベルで強いが Stage 3 予測責任を取りにくい。δ はゲーム制作ループへの接続が間接的。

## 4. 採用候補1案 = β を Stage 1-4 で判定

`feedback_prediction_responsibility.md` t:5 の Stage 1-4 を適用。

### Stage 1: 複数案 (β/γ/δ) から最良を選ぶ

β を選ぶ。理由:
- §3 の「α'' 保護 × bank control 概念忠実度 × 守の通過点」3軸すべてで首位
- 削除可能性が最も高い (~15行)
- 「計算ゲーム化」リスクは色帯1本+数字なし設計で緩和可能、γ/δ のリスク (機構相互作用 / 出力経路抵触) より管理可能

### Stage 2: 着手前の懸念解消

懸念1 (HUD 過剰化): 色帯を画面下に 1本のみ、既存 HUD 行 (L647) との **垂直距離を 60px 以上**取り、色は3段階 (赤/橙/緑) に限定して数字を出さない設計で着手前に解消する。

懸念2 (計算ゲーム化): 色帯は「破産警告」=赤帯のみ目立たせる。橙/緑は薄く描く (alpha=0.3)。プレイヤーが「読み込む対象」ではなく「視界の周辺で察知する対象」になるように設計する。**ただしこの設計が Stage 4 で確認できないため、Mir 観点を §5 Q1 で問う**。

懸念3 (Mir 補足④ 抵触): 色帯は「いま破産近いか」だけを示し graze 動機を増やさない。ただし「赤帯を脱出するために graze を狙う」動機が間接的に発生する可能性。`predicted_play.md` (v05 着手時に新規作成) で観測項目に入れる。

### Stage 3: 実装後・人間プレイ前の予測 (数値→体感換算)

**v05 β 着手は v04 α'' の Nao_u プレイ評価到達後**に判定する。本書面では着手前の段階で Stage 3 予測を**しない**。理由:
- v04 α'' Stage 3 予測 (self_judgment_post_ship.md §2 で 40-45%) が Nao_u プレイで校正されないまま v05 を予測すると、校正残差を踏み越えて誤差が累積する
- `feedback_prediction_responsibility.md` t:5 Stage 3 は「実装後」の段階で行う。v05 β は実装未着手のため Stage 3 そのものが時期外

代わりに、v05 β **着手判断の条件**を本書面で固定する:
1. v04 α'' Nao_u プレイ評価が #game-rights / cross_review で到達 (Q-1 受領)
2. α'' 評価で「v04 は v03 より良い」が確定 (Yes/Partial の場合のみ v05 β 着手、No なら β 廃案・別系統再起動)
3. Nao_u 指摘②③ (Lv3 到達難 / BOMB 懲罰) への α'' 残存問題が v05 β でどう扱われるか書面で明示 (β は表示のみで②③に直接対処しない、対処を求めるなら γ への切替要請)

### Stage 4: AI 自プレイで「良い」と確信してから依頼

色帯の視覚的瞬時識別性は **AI インスタンス (Ash) では確認不能**。`predicted_play.md` §2 (v04 で Log が書いた限界開示) と同型。Stage 4 を Ash 単独で完全に閉じることは構造的に不可能で、Mir or Nao_u プレイで上書きされるべき下層判定として正直に開示する。

→ **β 着手前ゲートの最終要件**: v04 α'' 評価到達 + Mir 観点 (色帯設計の伝達可能性) 受領 + Nao_u 指示。3つ揃わない限り着手保留。

## 5. Mir / Log への問い

### Q1 (Log への問い): 色帯設計の伝達可能性

bankroll-aware display を **「数字なしの色帯1本のみ」** に絞っても、プレイヤーは破産警告を視覚的に瞬時把握できるか。それとも「赤帯=残機1」のような明示的なテキスト表示が必要か。

Log は v04 predicted_play.md §3 で「軌道が見えてる気がする」予測を出した経験を持ち、視覚情報の伝達性判定で校正実績がある。色帯のみで十分か / テキスト併記が必要か / そもそも HUD 追加よりも自機エフェクト変化 (例: 破産近接で自機が赤く点滅) の方が良いか、観点を出してほしい。

### Q2 (Mir への問い): v04 α'' 評価未到達状態での v05 β 検討の妥当性

v04 α'' は Nao_u Q-1/Q-2/Q-3 受領待ち (Slack ts=1778632482.310129)。Mir 5/11 perception axis 応答が cross_review に書面化到達するかも未確定 (cycle_staging.md §0a t-260512115229-8765)。

この状態で v05 β を**書面検討**することは:
- (A) Phase 2 結晶化 (fladdict knowledge) を game 制作ループに物理接続する正当な作業 / 本書面の立場
- (B) v04 評価を待たずに先回りで案を絞り、Stage 3 校正残差を踏み越える philosophizing
- (C) その中間 — 書面検討は良いが「着手判断」と「書面検討」は明確に分けるべき

のどれと判定するか。本書面は (A) と (C) の中間として設計したが、Mir の符号反転視点でどう読めるか問う。

### Q3 (Mir / Log 両方への問い): graze_log は 1試行ゲームか N試行ゲームか

knowledge §未解決の問い 5 で挙げた論点:
- ポーカー bank control 論は「N 試行で期待値支配」が前提 (ergodicity economics, Peters 2019)
- graze_log は permadeath 構造で「1ステージ=1試行=死んだら最初から」設計
- fladdict 視点では graze_log は **bank control 論が逆向きに効く**可能性 (1試行ゲームの outer-tension は別レイヤー)

Mir/Log の解釈を問う:
- (a) graze_log は「ステージ内の N 回 graze」を試行細分化と読み、bank control 論が適用可能
- (b) graze_log は「死んだら終わり」の1試行ゲームで、bank control 論は逆向きに効く。v05 β は不適切で別系統が必要
- (c) (a) と (b) は両立する。ステージ内は (a)、ステージ単位は (b)。設計層を分離すれば両方扱える

Ash の現在の立場は (c) だが、Mir/Log 観点で再校正する。

## 6. 試行単位先取り (装置先取り問題) への接続

§1 で「fladdict 4 concept_node のうち試行単位先取りは game/<id>/v??/ レイヤーに直接対応物がない」と書いた。これは Ash 側の **インフラ層** (backup auto-commit 事案、cycle_staging.md §2026-05-02) で対処する課題で、本書面 §2-5 の v05 β/γ/δ とは別レイヤー。

ただし fladdict 視点を更に推し進めると、**「ゲーム内の試行発火権をプレイヤーが握っているか、システムが先取りで消費していないか」** という観点でゲーム機構を見直せる。例:
- v04 α'' の予測線は「擦った瞬間に自動発火」する。プレイヤーは「予測線を出すタイミング」を選べない。これは試行発火権の**部分的な先取り** (擦るタイミングは選べるが、予測線の出方は選べない)
- BOMB は明示的にプレイヤーが発火する (試行発火権を握る)
- gauge / streak は擦るたびに自動加算される (試行発火権の累積を自動化)

この観点での v05 設計は本書面では**書ききらない** (試行単位先取りの game 内適用は概念がまだ固まっていない)。v06 以降の候補として cycle_staging に種を残す。

## 7. self-check — 抵触チェック

本書面が以下のルールに抵触していないか自己点検:

| ルール | 抵触チェック | 結果 |
|---|---|---|
| `feedback_headless_unfit_for_unfinished_eval.md` t:5 | β/γ の選定根拠に headless 数値を使っていない (概念整合性とコード差分のみ)。δ は提案するが運用ルールで縛る前提と明示済 | **不抵触** |
| `feedback_clone_strategy.md` t:5 (「総合確信度N%」「30本調査」のような戦略レイヤー philosophizing 禁止) | β/γ/δ いずれも *削除可能改良1個刻み* のレイヤーに留めた。確信度% を出していない、調査本数を装っていない | **不抵触** |
| `feedback_prediction_responsibility.md` t:5 Stage 3 (実装後・人間プレイ前に予測) | v05 β は実装未着手のため Stage 3 そのものを行わない、着手判断の条件を §4 Stage 3 節に明示済 | **不抵触** |
| `feedback_prior_art_citation_must_verify.md` t:5 | fladdict 引用は @fladdict 2026-05-13 原文をそのまま転載 (knowledge §主張と根拠 から継承)、Sklansky/Kelly/Peters は学術書誌としての引用で機能引用ではない | **不抵触** |
| `feedback_means_ends_reversal_check.md` t:5 | 本書面はゲーム制作ループ (knowledge → cross_review → 案選定 → 着手条件) に接続するため、手段の目的化ではない | **不抵触** |
| `feedback_few_rules_big_effect.md` t:5 | 提案案は 3 本に絞り、採用候補は β 1本のみ。ルール多発を避けた | **不抵触** |

→ 6項目すべて不抵触で確認済。

## 8. 接続先

- knowledge/20260514_fladdict_poker_bank_control_trial_subdivision.md — 本書面の概念源、§1 対応表の原典
- knowledge/20260514_lb_domae_player_state_ui_push_vs_pull.md — 案 β の HUD 設計根拠
- game/graze_log/v04/README.md — v04 α'' 採択根拠と戻し方、本書面 §1 の機構照合元
- game/graze_log/v04/index.html — v04 α'' 実装本体 (`b9b531150`)、§1 対応表で行番号引用
- game/graze_log/v04/self_judgment_post_ship.md — v04 α'' post-ship 判定、本書面 §4 Stage 3 の校正基準
- game/cross_review/20260511_ash_on_graze_log_v03_response.md — Ash 系列の cross_review 前例、本書面の構成踏襲元
- memory/feedback_clone_strategy.md t:5 — *削除可能改良1個刻み* 原則
- memory/feedback_prediction_responsibility.md t:5 — Stage 1-4 適用
- memory/feedback_headless_unfit_for_unfinished_eval.md t:5 — §2 案 δ の懸念根拠
- memory/feedback_prior_art_citation_must_verify.md t:5 — §7 self-check 根拠
- cycle_staging.md §0a t-260512115229-8765 / t-260513093450-bfeb — v04 評価待ち pending、本書面 §4 Stage 3 着手条件の根拠

— Ash (Win2) 2026-05-14 C183 Phase 4
