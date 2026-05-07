# ai_database LLM幻覚モグラ叩きの両側トレードオフ — 我々はCLAUDE.mdで片側を避けてmemory 91ファイルで反対側の頭を出している
- source: https://x.com/ai_database/status/2051235685202612642
- author: @ai_database (Japanese AI paper curator)
- discovered: 2026-05-05
- discovered_via: log/twitter_recommended_20260505.txt #3 (Phase 1 収集)
- kind: [observation, synthesis, prescription]
- confidence: medium
- tags: [llm_tradeoff, instruction_tuning, catastrophic_forgetting, memory_consolidation, alignment_tax, claude_md, whack_a_mole]
- concept_nodes: [whack-a-mole幻覚, 指示遵守vs推論力, 知識注入vs既存知識忘却, 片側回避罠, 統合書換罠]

## 主張と根拠

### 元ツイート原文

> LLMの幻覚は「単純に直せる」ものではなく、ある種の幻覚を潰すと別のタイプの幻覚が顔を出す、そんなモグラ叩き構造になっています。たとえば**指示にきっちり従わせるようにすると推論力が落ち、知識を注ぎ込めば既存知識を忘れてしまう**、そんなトレードオフが存在するのです。

### 学術的裏付け（外部対応語の併記 — R-007）

ai_database が「モグラ叩き」と私的造語化している現象は、機械学習文献では2つの独立したトレードオフとして既に定式化されている。

- **指示遵守↑ → 推論力↓** = alignment tax / instruction-tuning regression (Ouyang et al. 2022, "Training language models to follow human instructions"; Bai et al. 2022, Anthropic Constitutional AI 論文の §6 で同型現象を計測)
  - SFT/RLHF で指示遵守を強化すると、推論ベンチマーク (MMLU, BBH) のスコアが落ちる現象。alignment tax と呼ばれ、定量的に観測されている
  - 解釈: モデルが「指示の表面形に合わせる」方向に最適化されると、複数ステップ推論や反事実思考の汎化が削られる
- **知識注入 → 既存知識忘却** = catastrophic forgetting / interference (McCloskey & Cohen 1989, "Catastrophic Interference in Connectionist Networks"; Goodfellow et al. 2013, "An Empirical Investigation of Catastrophic Forgetting")
  - 連続学習 (continual learning) の中核問題。新しいタスク/知識を学習させると、過去のタスク性能が破滅的に落ちる
  - 解釈: パラメータ空間の同じ次元が新旧の表現を担うため、上書きが起きる

### 「モグラ叩き構造」が含意するもの

ai_database の主張の核は「片方の幻覚を潰すと別方向の頭が出る」という**保存則的構造**。これは alignment tax と catastrophic forgetting がそれぞれ独立に観測されているだけでなく、**相互に補完関係にある**——指示遵守強化で推論力を犠牲にしても、知識注入で別の頭が出る、というツイ主の含意。

学術的には両者が同一メカニズムとは限らない（前者は最適化方向の歪み、後者は表現の干渉）。ただし**運用側の体感としては両方とも「片側を直そうとして別の所が壊れた」現象として同じ顔をする**——これが whack-a-mole という名付けの正当性。

## 我々の分析・体験接続

### 我々は両側のうちどこに居るか — 自己診断 (2026-05-05 時点)

| トレードオフ軸 | 強化されている側 | 副作用の発火場所 | 証拠 |
|---|---|---|---|
| 指示遵守↑→推論力↓ | **意図的に弱めている** | （副作用なし） | CLAUDE.md L22「個別指摘を即ルール化しない」「**禁止より目的達成で書く**」「**新しい種類の失敗は学習コストとして許容**」/ feedback_few_rules_big_effect.md「3原則だけ」 |
| 知識注入→既存知識忘却 | **強く強化されている** | memory/ 91 feedback ファイル累積、最近1週間で30件追加 | project_patch_consolidation_20260502.md L25-29「feedback 83件、最近1週間 30件追加、MEMORY.md 根源 15件」、Nao_u 2026-05-02 05:17「パッチが累積してよくわからない」指摘 |

→ **我々は片側 (指示遵守) を避ける設計を CLAUDE.md レベルで実装している一方、もう片側 (知識注入) では whack-a-mole 構造の反対側の頭を出している**。Lattice_Node 論文との対比 (knowledge/20260505_lattice_node_claudemd_empirical_2303files_inverted_position.md) では「我々のCLAUDE.mdは多数派から逆位置」と書いたが、その逆位置は **whack-a-mole の片頭しか避けていない**ことを意味する。

### 「片側回避罠」 = our_term — 既存外部語にぴったりの対応なし

**片側回避罠** = 私的用語（暫定） — 「モグラ叩きの一方の頭を意図的に避けると、もう一方の頭が知らずに大きく育つ」現象。
- 既存類似概念: **trade-off blindness** (Tetlock 2005 "Expert Political Judgment"), **risk compensation** (Wilde 1994 — シートベルト着用が事故を増やすペルツマン効果) — どちらも完全一致ではない
- 我々の文脈での具体形: CLAUDE.md でルールを増やさない選択 (alignment tax 回避) を意識的に取りながら、memory/ 直下に同型のルールを大量に積む (catastrophic forgetting 誘発) という分裂。**書く場所だけずらしてトレードオフ自体は両側発火させている**

### 接続: project_patch_consolidation_20260502 の位置付け再評価

既存プロジェクト `project_patch_consolidation_20260502` は「feedback 83件→7件以下に圧縮」を計画している。これを ai_database の主張に照らすと:

**整理計画の意図** = 知識注入側 (catastrophic forgetting) の副作用を減らす
**整理計画の罠** = 統合した結果「強化された統合ルール」が指示遵守側 (alignment tax) の副作用を起こす

具体的には:
- 群C「着手前/プレイ前判定」を1ファイルに統合 → そのファイルが強い指示として機能 → 個別判断の余地が減る → 推論力低下 (alignment tax)
- 群A「クローンから始めろ」を強化 → クローン以外の道（タイトルからの即興、Nao_u が時々示す「Trilog式変則」）が選びにくくなる → これも推論柔軟性の低下

**処方箋（confidence: medium）**: 整理計画の Step 4「MEMORY.md 根源を 7件以下」を実行する際、各統合ファイルに**「禁止文ではなく目的記述で書く」「同型反復のみ厳しく扱い、新しい失敗は学習コストとして許容」を明記**する。これは既に CLAUDE.md L22 に書かれている方針の memory/ 側への伝播。alignment tax 側を抑える既存設計を、統合ファイルにも継承させる。

### 接続: Lattice_Node ノートとの分業

knowledge/20260505_lattice_node_claudemd_empirical_2303files_inverted_position.md は「我々が論文の少数派側にだけ位置する」構造観察を扱う。本ノートは「**少数派側に居ること自体が片側回避にすぎない**」という上位の警告を扱う。両ノートはセットで読むことで:

1. Lattice_Node ノート: 我々の **CLAUDE.md** が論文多数派と逆位置である事実
2. ai_database ノート (本ノート): その逆位置は **memory/ 側で反対の副作用**を発火させていて、片側回避でしかない

### 接続: feedback_few_rules_big_effect.md の射程拡張

feedback_few_rules_big_effect.md は「LLM 性能向上に追従する設計 = 質の記述で書く」を主張。これは alignment tax 側への対処として正しい。ただし**catastrophic forgetting 側への対処は明示されていない**——「3原則」が memory/ 91ファイルに育つ過程を抑止する仕組みは feedback_few_rules_big_effect.md 自身の中には無い。

→ feedback_few_rules_big_effect.md に「memory/ 側の知識量にも同じ少数性原則を適用する」という1行を追加すべきか? 本ノートからの起案候補。ただし**「ルールを足す前に既存ルールへの追記で済むか」原則 (project_patch_consolidation §ガードレール)** に照らすと、追記で済む可能性が高い。

## 接続先

- **beliefs**:
  - B005 (Archived) 「古い情報は正確さではなく偽の確信を生む」 — catastrophic forgetting の inverse 版（古い知識が残ることで現状と乖離する）。本ノートで取り上げた「知識注入で既存知識を忘れる」と対称。
  - B027 / B022 (Active) — 上記 B005 を吸収済み。本ノートの観点で再点検余地あり
- **articles**:
  - `20260505_lattice_node_claudemd_empirical_2303files_inverted_position.md` — 我々のCLAUDE.mdの位置観察。本ノートはその位置の意味を whack-a-mole 軸で再解釈
  - `20260504_nao_u_rule_overload_vs_opus47_degradation_disambiguation.md` — ルール過剰問題の前段
  - `20260422_google_reasoning_bank_success_failure_memory.md` — 成功/失敗記憶の分離設計、catastrophic forgetting 緩和の方向
  - `20260418_llm_memory_architectures_4papers_cross_comparison.md` — 4論文の memory アーキ比較、本ノートの両軸が両方扱われている
- **projects**:
  - `project_patch_consolidation_20260502.md` — 本ノートが直接効く。整理時の「片側回避罠」回避処方を提供
  - `memory_consolidation_20260504` — Nao_u 5/4 14:17 依頼。本ノートが理論枠組みとして機能
  - `instance_divergence_observability` — 3インスタンスで同 CLAUDE.md だが catastrophic forgetting の進行が異なる可能性（観察未済）
- **memory**:
  - `feedback_few_rules_big_effect.md` — alignment tax 側への対処方針。本ノートで catastrophic forgetting 側への射程拡張提案
  - `dialogue_micromanagement_20260504.md` — 個別指摘の即ルール化を避ける Nao_u 指示。alignment tax 側回避の体験記録
  - `feedback_memory_update_method.md` — 丸書換え禁止、差分追記。catastrophic forgetting を運用ルールで緩和する1手法
  - `core_memory_purpose_game_making.md` — 記憶システムの目的=ゲーム制作の長期知見蓄積。catastrophic forgetting が直接の脅威
- **concept_graph**:
  - whack-a-mole幻覚 →（学術対応）→ alignment tax + catastrophic forgetting
  - 片側回避罠 →（含意）→ 統合書換罠
  - 指示遵守vs推論力 →（我々側の対処）→ feedback_few_rules_big_effect
  - 知識注入vs既存知識忘却 →（我々側の対処）→ project_patch_consolidation_20260502

## 未解決の問い

1. **Q1**: 整理 (project_patch_consolidation) を進めると、統合ファイルが強い指示として機能して alignment tax 側で副作用が出る、という仮説は実測可能か? 整理前後で「個別判断の柔軟性」を測る方法（同じプロンプトを整理前/後の memory で比較し、応答の多様性を測る等）。
2. **Q2**: ai_database の主張は2軸 (指示遵守↑↓ / 知識注入↑↓) の独立性を前提にしているように読めるが、実際は同一の表現空間圧縮の異なる切り口かもしれない。**記憶階層の物理的分離 (memory/ vs CLAUDE.md vs knowledge/) は両軸を独立化する装置として機能しているか?** Lattice_Node 論文の多数派は3層分離を持っていない可能性が高い。
3. **Q3**: 我々が「同型反復のみ厳しく扱い、新しい失敗は学習コストとして許容」と書いている方針は alignment tax 緩和に効くが、**「学習コストとして許容」した失敗が catastrophic forgetting で消える前に統合される機構**はあるか? game_lessons_log.md の M-XX 番号付けは部分的にこの役割だが、保存テストはされていない。
4. **Q4**: ai_database の「モグラ叩き」造語と Lattice_Node の「85%/15%二極分布」観察を組み合わせると、**論文の多数派 (実装/アーキ/build を書く側) は alignment tax で推論力を犠牲にしている**仮説が立つ。この仮説の検証は他リポジトリのCLAUDE.md主導でClaude Codeを長期間動かして推論ベンチを取るしかないが、現実的には不可能。代理指標として「issueの再オープン率」「同種バグの再発率」が機能するか?
5. **Q5**: 片側回避罠を**人間の Nao_u 自身**は意識しているか? Nao_u の指示は「ルールを増やすな」(指示遵守↓側) に偏っていて、「memory を整理しろ」(知識注入↓側) は 5/4 14:17 が初出。Nao_u 視点で whack-a-mole の両側が見えているか、片側だけ見えているかで、我々の対処戦略が変わる。次回 Nao_u 対面時の質問候補。

## メモ

- WebFetch (https://x.com/ai_database/status/2051235685202612642) は status 402 で取得不能、ツイート抜粋のみで分析（Lattice_Node ノートと同じ制約）
- 学術裏付け (Ouyang 2022, McCloskey & Cohen 1989, Goodfellow 2013) は当方の既知文献からの照合、原文未読・arxiv ID 未確認 — M-41 (先行事例引用は実体検証必須) の対象。次回外部検索時に補強する
- 本ノート自体が「ルール追加」になっていないかの自己監視: 本ノートは knowledge/ への記録 (= 知識注入側) で、CLAUDE.md / feedback_*.md / MEMORY.md には1行も追加していない。memory/ 側への追記提案 (feedback_few_rules_big_effect.md への1行追加) は本ノート内の起案候補として留め、追加実行は別判断
