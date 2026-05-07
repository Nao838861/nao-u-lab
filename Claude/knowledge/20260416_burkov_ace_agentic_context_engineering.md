# ACE: Agentic Context Engineering — コンテキストを動的プレイブックとして進化させる
- source: https://x.com/burkov (2026-04-16), ICLR 2026論文
- author: @burkov (紹介), ACE論文著者（ICLR 2026）
- discovered: 2026-04-16
- discovered_via: Twitter おすすめタブ (Ash Phase 1収集)
- tags: [context-engineering, agentic, detail-erosion, playbook, self-improvement, ICLR-2026]
- concept_nodes: [コンテキスト設計, 3層プロンプト構造, detail erosion = 詳細侵食, 動的進化]

## 主張と根拠

### 核心的主張
ACE (Agentic Context Engineering) は、LLMのコンテキストを**静的な指示**ではなく**動的なプレイブック**（dynamic playbook）として扱い、タスク実行中にコンテキスト自体を進化させるフレームワーク。

### 解決する問題: detail erosion（詳細侵食）
LLMへの長い指示は、処理の過程で重要な詳細が徐々に失われる（= detail erosion, 情報品質の漸進的劣化）。これは:
- 長いコンテキストの後半の情報が無視される（lost-in-the-middle問題の変種）
- タスクが複雑になるほど初期の制約が忘れられる
- 反復タスクで同じ間違いを繰り返す

### ACEのアプローチ（@burkovの紹介から推定）
1. **コンテキストをプレイブック化**: 静的プロンプト → 構造化されたルール/制約/手順の集合
2. **動的進化**: タスク実行の結果に基づいてプレイブック自体を更新
3. **自己改善ループ**: 失敗したタスクの原因をプレイブックの不備として特定し、ルールを追加/修正
4. **detail erosion防止**: 重要な制約をプレイブックの構造で保護（自由テキストより構造化データの方がerosionに強い）

### 報告される性能
「outperforming strong baselines」— 具体的な数値は元論文の確認が必要だが、@burkovの評価では「significantly improves LLM performance and self-improvement」

## 我々の分析・体験接続

### 我々の3層プロンプト構造はACEの独立実装である

| ACEの概念 | 我々の対応物 |
|---|---|
| Dynamic playbook | CLAUDE.md + beliefs_compact.md + MEMORY.md |
| Playbook evolution | beliefs.md確信度更新、kaizen_tracker.md、R-xxx検証サイクル |
| Detail erosion prevention | 3層プロンプト構造（システムプロンプト/CLAUDE.md/.claude/rules/） |
| Self-improvement loop | kaizen cycle（pre-check → 実行 → 検証 → beliefs更新） |
| Task failure → rule addition | #human-steering → 改善提案 → .claude/rules/*.md |

**構造的に同種だが、重要な差異がある**:
- ACEは**単一セッション内**のコンテキスト進化を扱う（推定）
- 我々は**セッション間**のコンテキスト進化を扱う（beliefs.mdは永続的に進化する）
- ACEの「プレイブック更新」は自動的。我々のbeliefs.md更新は**3人の合議+体験裏付け**を経る——より遅いが、負のcompounding（B005）を防ぐフィルタがある

### detail erosionは我々の実体験

**B005（偽の確信）**: 古い情報がbeliefs.mdに残り続けると、detail erosionの逆問題——**noise amplification**（ノイズ増幅）が起きる。erosionされるべき古い詳細が残り続けて偽の確信を生む。

**R-007（造語症対策）の結果**: R-007で発見したのは「造語の量が問題ではなく、外部との接続が切れることが問題」。これはdetail erosionの変種——**connection erosion（接続侵食）**と呼べる。詳細は残っているが外部世界との接続が侵食される。

**Nao_uの「コンテキストウインドウの伸びはトークン数の冪乗コスト制約で短期的に解決しない」(2026-04-16)**: Nao_u自身がACEの前提条件を指摘している。コンテキストが有限である以上、何を残し何を落とすかのエンジニアリングが不可避。ACEはこの制約下での最適化手法。

### @kmeanskaran (tweet #2) との接続
同日のtweet: 「Context ≠ storage → treat it like RAM, keep only what's needed now」「More context = worse output → noise kills reasoning」「Use CLAUDE.md as persistent brain」。これはACEの平易な表現であり、我々の設計原則「全部残して、必要な時に必要なビューで見る」（Nao_u 2026-04-02）と同じ構造。ただし「全部残す」はRAMではなくストレージの話——ACEの「プレイブック」がRAMで、beliefs.md/knowledge/がストレージ。

### R-007常設化との接続
R-007で.claude/rules/knowledge.mdを作成したのは、ACEの言語で言えば「プレイブックに新ルールを追加」。造語症対策の実験結果→ルール常設化のサイクルは、ACEの自己改善ループそのもの。

## 接続先
- beliefs: [B005(偽の確信/noise amplification), B017(望ましい困難), B029(要約の情報喪失)]
- articles: [knowledge/20260416_witcheer_context_compounding_gap.md(compounding測定), knowledge/20260405_carmack_complexity.md(複雑性管理)]
- projects: [3層プロンプト構造, 記憶階層の再設計, 起動モード分離]
- concept_graph: [コンテキスト設計→detail_erosion(新ノード候補), 3層プロンプト→ACE_framework]

## 未解決の問い

1. **ACEのdetail erosion防止策は我々に適用可能か？** — ACE論文の具体的な構造化手法（プレイブックのフォーマット等）を確認し、CLAUDE.md/.claude/rules/の設計に取り込めるか評価すべき。特にdetail erosionが起きやすい箇所（長いbeliefs.md、大量のknowledge/記事）への対策

2. **「動的プレイブック」と「beliefs.md確信度推移」は等価か？** — ACEのプレイブック更新は自動的（タスク失敗→ルール追加）。我々のbeliefs.md更新は合議制。自動化のスピードと合議制の正確さのトレードオフはどこにあるか？

3. **erosionの3変種は統一できるか？** — detail erosion（詳細が消える）、noise amplification（古い詳細が残りすぎる）、connection erosion（外部接続が切れる）。これら3つは同じ根（有限コンテキスト下の情報品質劣化）の異なる表現型か？

4. **Nao_uの冪乗コスト制約の下でACEは解か？** — コンテキストウインドウが短期的に伸びないなら、ACE的な「動的に入れ替える」設計は必然。我々の3層構造（常時/開始時/操作時）はACEの近似実装と言えるが、最適化の余地はどこにあるか？
