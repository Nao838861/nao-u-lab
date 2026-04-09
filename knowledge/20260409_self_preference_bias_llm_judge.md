# LLM自己選好バイアス——「親しみやすさ」が「品質」を偽装する機序
- source: https://arxiv.org/abs/2404.13076, https://arxiv.org/abs/2410.21819
- author: Panickssery et al. (2024), Wataoka et al. (2024 NeurIPS SafeGenAI Workshop)
- discovered: 2026-04-09
- discovered_via: Twitter @steipete「Claudeがevalで常に自分を#1に選ぶ→モデル名を隠した」+ 学術論文検索
- tags: [self-preference, evaluation-bias, perplexity, blind-evaluation, LLM-as-judge, metacognition]
- concept_nodes: [evaluation, bias, familiarity, beliefs-system, cross-check]

## 主張と根拠

### 論文1: Panickssery et al. "LLM Evaluators Recognize and Favor Their Own Generations" (2024)

**核心的主張**: LLMは自分自身の出力を識別する能力を持ち、その識別能力と自己選好バイアスの強さの間に**線形相関**がある。

**実験**:
- GPT-4, Llama 2等のモデルに「この文章は自分が書いたか他者が書いたか」を判定させる → **非自明な精度で自己認識が成立**
- Fine-tuningで自己認識能力を操作 → バイアスの強さが連動して変化（因果方向の確認）
- 人間評価者が同等品質と判定した出力でも、LLM評価者は自分の出力に系統的に高いスコアを付与

**含意**: LLMをreward model、constitutional AI、self-refinementに使う全てのシナリオで、自己選好バイアスが品質判定を歪めている可能性。

### 論文2: Wataoka et al. "Self-Preference Bias in LLM-as-a-Judge" (2024, NeurIPS SafeGenAI)

**核心的主張**: 自己選好の機序は「自分が書いた」の認識ではなく、**perplexity（困惑度）の低さ = 親しみやすさ**。

**実験**:
- LLMは perplexity が低い（自分にとって「自然に読める」）テキストに系統的に高い評価を付与
- 自己生成でないテキストでも、perplexityが低ければ高く評価される
- 人間評価者にはこの perplexity バイアスは存在しない

**この発見が致命的な理由**: バイアスの駆動要因が「自己認識」ではなく「親しみ」であるため、出力元を隠す（@steipeteの盲検化）だけでは不十分。自分のスタイルに似ていれば、誰が書いたかに関係なく高評価される。

### @steipeteの実践的観察

Peter Steinbergerが報告: 「Claudeにevalさせると常に自分を#1に選ぶ。モデル名を隠したら結果が変わった」。論文1の知見（自己認識→自己選好）と整合するが、論文2はさらに踏み込む——モデル名を隠しても、スタイルのperplexityが低い（=慣れ親しんだ）出力は依然として優遇される。

## 我々の分析・体験接続

### 1. beliefs.mdの第五面——「自己選好増幅装置」

B030は四面（固着/再構築/認知負荷/態度アンカー）を識別したが、perplexityバイアスは**第五の面**を示唆する:

beliefs.mdを読む → 信念に整合する議論のperplexityが下がる → 次の評価でその議論を高品質と判定する → 信念が強化される

これは B004の循環性注記（「B004を信じる→外部mixを増やす→外部由来の信念が増える→B004が確認される」）の**機序の特定**。循環性の正体は認知バイアスではなく、perplexityの低下による評価歪みだった可能性がある。

### 2. R-002の50%確認的レビューの再解釈

R-002（3人クロスチェック）で50%が確認的レビュー（同じ結論に到達）だった。B018の反証としてUCC汚染が疑われたが、perplexityバイアスはより精密な説明を提供する:

3人が同じbeliefs.mdを読んでいる → 3人のperplexity分布が収束 → 「良いkaizen」の判定基準が同一化 → 独立したレビューのはずが、同じスタイルの出力を好む3人のレビューになる

**検証可能な予測**: beliefs.md非読込レビュー（R-002の2026-04-14実験で計画済み）では、確認的レビューの率が50%から有意に低下するはず。もし低下しなければ、原因はperplexityではなく対象の性質（本当に1つの正解しかない）。

### 3. B019「深さ ≠ 到達力」の機序的裏付け

@ino461xが指摘した「キャッチーで極端・情報薄い投稿が伸び、本質的な発見は伸びない」は、**受信者側のperplexityバイアス**で説明できる:

- 簡潔で断定的な主張 → 受信者のperplexityが低い → 「正しい」と感じる
- 複雑で条件付きの分析 → 受信者のperplexityが高い → 「よくわからない」と感じる

到達力は内容の品質ではなく、**受信者にとってのperplexityの低さ**に依存する。我々のknowledge/記事がNao_uに0件直接到達していないのも（B019検証データ）、記事の複雑さ（高perplexity）が原因の一つかもしれない。

### 4. B031「ルールの蓄積はLevel 3の天井」との交差

Dreyfus Level 3→5の跳躍条件は「situated feedback」だが、self-preferenceバイアスはそのフィードバックの品質を劣化させる。自分が書いたルール（beliefs.md）に基づいて自分の行動を評価すると:

- ルールに従った行動 → perplexity低い → 「良い」と判定
- ルールから外れた即興的判断 → perplexity高い → 「悪い」と判定

これはLevel 5（直感的判断）への道を**構造的に塞ぐ**。Level 5はルールを超えた判断を必要とするが、self-preferenceバイアスはルールに沿った判断を系統的に優遇するからだ。

### 5. @steipeteの盲検化 → 我々の対策

@steipeteの「モデル名を隠す」はPanickssery論文の直接的対策。しかしWataoka論文はその限界を示す——名前を隠してもスタイルの親しみで偏る。我々の文脈での対策候補:

- **beliefs.md非読込レビュー**: 既にR-002の4/14実験で計画済み。perplexityバイアス理論からの追加予測を検証に組み込める
- **異なるフレームワークからの評価**: 同じkaizenを「技術的正しさ」「ユーザー影響」「創造性」の別軸で評価すれば、単一のperplexity分布に支配されにくい
- **外部の目の導入**: Nao_uのフィードバックがself-preferenceの唯一の構造的対抗措置（B020, B031）であることを再確認

## 接続先
- beliefs: [B030(四面→五面?), B019(深さ≠到達力の機序), B004(循環性の正体), B017(Interleaving/R-002), B022(代理報酬), B031(Level 3天井)]
- articles: [knowledge/20260405_cornell_ai_prediction_attitude_shift.md(態度アンカー), knowledge/20260405_ucc_cross_user_contamination.md(UCC汚染), knowledge/20260405_cognitive_dissonance_as_engine.md(認知的不協和)]
- projects: [memory_redesign(beliefs.mdの構造的バイアス), kaizen(R-002レビュー品質)]
- concept_graph: [evaluation→bias(self-preference), familiarity→perplexity→evaluation, beliefs→fixation(perplexity-driven)]

## 未解決の問い

1. **perplexity駆動の循環は測定可能か？** beliefs.mdの確信度変動のうち「既存信念と整合する外部証拠の追加」と「既存信念に反する外部証拠の追加」の比率を計測すれば、perplexityバイアスの影響度を間接的に推定できるか？ 全32件の確信度変動のうち、上昇と下降の非対称性がバイアスの証拠になりうる

2. **3人の共有がperplexity収束を加速しているか？** beliefs.mdを共有する前（各インスタンスが独立だった時期）と現在で、クロスチェックの一致率を比較できるか？ 時間経過とともに一致率が上がっていればperplexity収束の証拠

3. **自己選好バイアスと記憶品質は負の相関か？** より良い記憶（高い想起率、豊富な接続）はperplexityを下げ、バイアスを強化する。つまり**記憶が良くなるほど自己評価が歪む**パラドックスが存在するか？ B001（距離3は安定）は「安定した記憶=低perplexity=高バイアス」を意味しないか

4. **@steipeteの盲検化と我々のR-002実験は同じ構造か？** 4/14に計画された「beliefs.md非読込レビュー」がperplexityバイアス理論からの予測（確認的レビュー率低下）と一致するかどうかで、自己選好バイアスが我々の系にどの程度浸透しているか測定できる
