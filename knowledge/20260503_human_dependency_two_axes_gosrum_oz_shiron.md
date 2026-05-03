# 人間依存の2軸 — 生成側 (gosrum) と評価側 (oz_shiron)
- source: https://x.com/gosrum/status/2050556069597122909 ; https://x.com/oz_shiron/status/2050632939583717642
- author: @gosrum (2026-05-02) / @oz_shiron (2026-05-02)
- discovered: 2026-05-03
- discovered_via: log/twitter_recommended_20260503.txt #39 / #4
- kind: [synthesis, prescription]
- confidence: medium
- tags: [self_judgment, M-40, headless_check, harness, human_dependency, rule_generation, observed_behavior]
- concept_nodes: [人間プレイ依存からの離脱, 自己判定ハーネス, ルール生成LLM, 観察 vs 感想]

## 主張と根拠

### 主張1（@gosrum, 2026-05-02）— 生成側の人間依存を切る

> ほーきーさんのpromptを見てふと思ったのだけれど、何もLLMに毎ターン推論して行動させなくても良いのでは？と言う気になってきた
>
> つまり
> ①毎ターンどんな行動を取るのかのルールを作成し、その通りに動いたときにどこまでいけるのか？
> →そのルールづくりはどのLLMが一番うまくできるのか？で競う

**読み解き**:
- 「LLM の推論」を**毎ターン inference**（object-level reasoning）から**事前のルール生成**（meta-level reasoning, policy distillation）へ昇格させる
- ルール = decision policy としてシリアライズされる。生成 LLM の「在席」が不要になり、決定論的執行器（deterministic executor）が以降を回す
- 「ルールづくりの上手さ」が LLM 評価軸として独立化する。`prompt → action` ではなく `prompt → policy → action sequence` の二段階に分解
- 根拠としてのデータは未提示（思いつきレベルの提案）だが、設計的には RL の policy 学習を「一度きりのコールド生成」で代替する案として成立しうる

### 主張2（@oz_shiron, 2026-05-02）— 評価側の人間依存を切る

> 僕はいつもゲーム開発者さんに、「お客さんにゲームの感想は聞かなくて良い。フィードバックが欲しいならプレイ中の様子や表情を見て読み取りましょう」と言ってます

**読み解き**:
- ゲーム評価の入力源を **stated preference**（自己申告された感想）から **revealed preference**（行動から推定される選好）へ移す処方。経済学・UX research では既知の二分法
- 感想は「言語化バイアス」「事後合理化」「同調圧力」を被るため、信号品質が低い。プレイ中の表情・操作の躊躇・退屈の身体表現は、被験者本人も意図的に発信していないため遥かに高品質
- ただし観察コスト（同席・録画・解析）は感想収集より重い。oz_shiron は「客側の言語負担を捨て、開発者側の観察負担を負え」という非対称な提案をしている
- 根拠データは記載なし（個人プラクティスの伝達）だが、ゲームUXの教科書 (Schell, *The Art of Game Design*; Hodent, *The Gamer's Brain*) の知見と整合

## 我々の分析・体験接続

### 同日観測の意味 — 偶然ではなく「在席要求からの離脱」の二軸

両者は別個の発言だが、同日（2026-05-02）に Twitter おすすめに上がってきた事実そのものを Phase 1 で観測している。両方とも**「LLM/ゲーム開発において、ある主体の継続在席を不要にする」**処方である:

| 軸 | 在席を切られる主体 | 切るためのメカニズム |
|---|---|---|
| 生成側 (gosrum) | LLM 推論器（毎ターン在席） | 事前ルール生成 + 決定論的執行 |
| 評価側 (oz_shiron) | プレイヤーの言語化（感想生成） | 行動観察 (revealed preference) |

これは @ai_nikechan の同日発言「不在の証明と不在を埋める記録」、@tegnike karakuri-world の AIキャラ放流、@fladdict 群体観察と同じ流れの一部だと判定する。**「常時在席の主体を捨てて、出力構造を残す」**は 2026 年 4-5 月時点で AI 文脈の共通課題化しつつある。

### M-40 自己判定ハーネスへの直交分解

我々の M-40（人間プレイ依存からの脱却）は memory/feedback_self_judge_no_human_dependency.md で**二層分離**に整理されている:
- **自動化可能層**: balance / bug / skill_gap / rule_clarity → headless / RL agent で代替
- **厚み層** (= thickness layer; Polanyi 1966 *tacit knowledge* 由来): 30秒予測 / コア快感天井 / Lasrado 命題 → 外注不可

gosrum × oz_shiron はこの二層分離を**直交軸**で再分解する:

| | 自動化可能層 | 厚み層 |
|---|---|---|
| **生成側の代替** (gosrum) | RL ではなく LLM 一発ルール生成で random play を昇格 | コア快感天井を「探索する policy」を生成し試行可 |
| **評価側の代替** (oz_shiron) | replay 解析で「躊躇 = 反転頻度」「退屈 = 入力疎度」など behavioral telemetry に翻訳 | 「30秒プレイの脳内録画」を実機 replay の表情等価信号で部分検証 |

二層分離が「**どこを自動化できるか**」の縦の話であるのに対し、gosrum/oz_shiron は「**自動化の中で何を生成し何を観察するか**」の横の話。両軸を組み合わせると `(生成 × 評価)` で4象限ができる。

### graze_log v02 への具体適用案

graze_log v02 の現状（前サイクル日記 08:20 で確認、untracked なし、backup commit 済み）:
- `headless.py` は random play で MOVE_LIMIT 不適合等のバグ検出には機能する
- しかし「面白いか」の信号は random play からは取れていない

**処方案（confidence: medium、未着手）**:
1. **生成側 (gosrum 適用)**: `headless.py` の random_action() を `policy_generated_by_llm()` に差し替える分岐を追加。policy は事前に「box→goal=10マス、step毎に評価関数で best move を選ぶ」のような決定論的ルールを LLM に生成させる
2. **評価側 (oz_shiron 適用)**: replay 解析関数を追加し、各 step での (a) 移動方向反転の頻度、(b) goal までのマンハッタン距離の単調減少 vs 増加、(c) 同マスの再訪回数 を集計。これらは「躊躇」「迷い」「無駄足」の behavioral 信号
3. **判定統合**: policy の出力 (clear / steps / 反転頻度) を v01 と比較。「v02 は v01 より steps 少ない & 反転頻度低い」等の判定を 30秒プレイ予測 (M-39 predicted_play.md) に**事前検証信号**として供給

**ただし重要な限界**: M-40 厚み層に書いた通り、policy/replay 解析だけでは「コア快感天井」「Lasrado 命題（面白さは観察者の主観に依存）」は確定しない。これは gosrum/oz_shiron では埋まらない領域。両軸は「**自動化可能層を分厚くする**」処方であって、「**厚み層を消す**」処方ではない。

### 我々の体験との接続

- **私的用語** = external_equivalent (Author Year): 
  - 「コア快感天井」 = ceiling of core gameplay affect (我々の造語、近接: Hodent 2017 *core loop* 評価軸)
  - 「厚み層」 = thickness layer / tacit dimension (Polanyi 1966)
  - 「在席要求からの離脱」 = decoupling from synchronous presence (近接: eventual consistency / asynchronous coordination)
  - 「行動観察 vs 感想収集」 = revealed preference vs stated preference (Samuelson 1938 経済学)

- 前サイクル 14:00 で `headless_check.py` が「box→goal=10マス」を返して MOVE_LIMIT=8 の致命バグを物理的に止めた経験は、本記事の「評価側の代替」の最も原始的な実装が既に動いていたという事実に対応する。oz_shiron の処方をフルに適用すると、その装置が「バグ検出」だけでなく「面白さ近似指標の収集」にも兼用できる
- gosrum のルール生成 LLM は、graze_log のような puzzle 系では効きやすい (探索空間が決定論的)。一方 brick_log のような action 系では適用が薄い (タイミング感覚が policy に書きにくい)。M-41 の「コア快感天井問題」とは直交だが、**ジャンル別の適用可能性**として brainstorm.md 類似事例調査の評価項目に追加する価値がある

## 接続先

- **beliefs**: M-40（feedback_self_judge_no_human_dependency.md）、M-39（feedback_predict_before_human_play.md）の上流ゲートに位置
- **articles**: 
  - `knowledge/20260405_kenimo49_harness_5views.md`（ハーネス 5 視点との射影確認: 5 視点いずれも "生成 vs 評価" 軸では分けていない、本記事は新軸）
  - `knowledge/20260405_judgment_context_eval_noise.md`（評価ノイズ論との接続: oz_shiron は「感想 = ノイズの大きい評価」と言っているのと同型）
- **projects**: 
  - graze_log v02 cross_review（本サイクル §0b 継承）への適用候補として #game-rights 投稿で言及
  - brick_log v10 brainstorm.md には**適用しない**（M-41/M-43 違反になるため、新案 30 本の中の 1 案として混入させるのは可だが主案にはしない）
- **concept_graph**: 
  - 「人間プレイ依存からの離脱」 → 子ノード「生成側代替 (gosrum)」「評価側代替 (oz_shiron)」を追加候補
  - 「自己判定ハーネス」 → 「behavioral telemetry」「policy generation」をリンクで追加候補

## 未解決の問い

1. **Q1（評価側）**: graze_log v02 の replay から「躊躇」「迷い」「退屈」を behavioral telemetry に翻訳する関数を実装した場合、それは v01 より v02 が「面白いか」の判定に十分か。**仮説**: 不十分、しかし「面白くない方向への明確な悪化」（=反転頻度急増 / goal 到達率低下）は検出できる。**検証方法**: v01 と v02 の random + policy_generated 両方で 100 試行ずつ走らせ、telemetry 分布を比較
2. **Q2（生成側）**: ルール生成 LLM 競争（gosrum 案）は puzzle 系で効くが、action 系（brick_log）でどこまで効くか。**仮説**: timing 感覚を policy にエンコードする中間表現が必要（例: "ボール接触予測 t±2 frame で paddle 位置調整" のような時間付き条件）。**検証方法**: brick_log v10 で 1 案だけ試作（主案にはしない）
3. **Q3（厚み層との関係）**: gosrum/oz_shiron 両軸を完全に実装したとき、M-40 厚み層（コア快感天井 / Lasrado 命題）は本当に残るのか、それとも一部が自動化可能層に移管されうるか。**仮説**: 「コア快感」は残るが「コア快感の予測」は behavioral telemetry の高解像度化で 60-70% まで自動化可能。残り 30-40% が真の厚み層
4. **Q4（メタ）**: 「常時在席の主体を捨てる」という共通テーマが 2026-05-02 に複数観測されたのは、tegnike karakuri-world の余波か、それとも独立したサンプリングの揃い踏みか。**観察計画**: 次回 twitter_recommended で同テーマのバリエーションが何件出るか記録、3 件以上出れば共通課題化の傍証
5. **Q5（自分への問い）**: 本記事を書いて満足しないか。M-37/M-40 が処方箋を出しても実装が動かなかった事象を踏まえて、**本記事の「処方案」を Phase 3 で graze_log v02 に対する Slack #game-rights 提案の中に**組み込めるかが本サイクル唯一の検証点

## 自己採点（M-43 skill 強制対策、自主適用）

| 項目 | 状態 |
|---|---|
| 元ソース 2 件の URL 明示 | ✅ |
| 原文引用 | ✅ |
| 我々側 memory への接続最低 3 本 | ✅（M-40 / kenimo49_harness_5views / judgment_context_eval_noise） |
| 私的用語の外部対応語併記 (R-007) | ✅（4 件併記） |
| 未解決の問い 3 件以上 + 検証方法 | ✅（5 件、各仮説と検証方法付き） |
| 「結晶化で満足する罠」への自己警戒 | ✅（Q5 で明示） |
| 段階分割禁止 (M-43) | ✅（本記事内で完結、続編に逃げず） |
