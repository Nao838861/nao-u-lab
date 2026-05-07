# MulmoClaude — Karpathy式Wiki記憶のClaude Code実装 (snakajima)
> ⚠ **重複検出 (2026-04-07 Ash Phase 3 linting)**: 同日に[20260407_mulmoclaude_wiki_memory.md](20260407_mulmoclaude_wiki_memory.md)（Log作、88行、PR #48の3層構造を詳述）が独立に書かれていた。本記事はTwitter巡回起点・「我々との差分」分析・未解決の問い4つが独自貢献。両者は補完関係。読む順: Log版（実装構造）→本記事（外部接続と緊張）。
- source: https://x.com/snakajima/status/2026-04-06 (Twitterおすすめ巡回 #6)
- author: 中島聡 (@snakajima)
- discovered: 2026-04-07
- discovered_via: Phase 1 twitter_recommended_20260407.txt #6
- tags: [knowledge-management, claude-code, wiki, memory-design, multimodal, AI-native]
- concept_nodes: [memory, creation, tool]

## 主張と根拠

### 核心主張
「とことんAIネイティブに作り込んだ」Claude Code拡張ツール **MulmoClaude** は、Claude Codeをマルチモーダルエージェントに変える。**長期記憶をWiki形式で保有する**（Karpathy式に明示的に依拠）。アプリの使い方すらユーザーが普通に尋ねれば何語でもAIが答える——ドキュメントの第一読者がAI、という設計。

### 観察できる構造的特徴
1. **Wiki = 長期記憶の実装媒体**：会話履歴やベクタDBではなく、人間可読でもありLLMがメンテ可能な.mdディレクトリを"記憶"として採用
2. **ヘルプ機能の代替がAI問い合わせ**：固定UIではなく対話で機能を発見させる。ドキュメント自体をLLMが読み下す前提
3. **Karpathyへの明示的thanks**：04-05のKarpathy「LLM Knowledge Bases」(40万語wikiでRAG不要)を実装に落とした最初期の事例の一つ

### 周辺証拠（同サイクル収集）
- twitter_recommended #26: Karpathyの投稿48時間後に **Graphify**（任意フォルダ→knowledge graph化、ワンコマンド）も登場
- → **Karpathy式wiki記憶が「言説」から「ツール群」に転化する局面**にいま我々はいる

## 我々の分析・体験接続

### Karpathy記事（4/5）からの差分
| 項目 | Karpathy原案 (4/5記事) | MulmoClaude実装 (4/7) | 我々 |
|---|---|---|---|
| wikiの主体 | LLMが書く・人間は触らない | 同じ | **ハイブリッド**（人間が書き、LLMが追記） |
| 規模 | ~100記事/40万語でRAG不要 | 規模未公表 | knowledge/=43記事、external_notes+slack=数MB |
| 自然言語UI | Q&A | アプリ操作すら自然言語 | memory_search.py（CLI）止まり |
| マルチモーダル | 画像はraw保存 | "multi-modal agent" として正面化 | ❌ 未対応（テキストのみ） |

### 体験接続：「我々はもう半分Karpathy式」だが、3つの欠落
1. **Wiki Compilationの自動化が無い**：knowledge/に書くのは現状ほぼ手動。Karpathy/MulmoClaudeでは「raw→wikiコンパイル」がLLMの定常ジョブ。我々の memory_compile.py(Mir)はビュー生成止まりで、永続的wikiへの還流が無い → external_notes→knowledge昇格の自動パイプライン欠落
2. **Lintingが部分的**：check_beliefs_health.pyはbeliefsのみ。knowledge記事間の矛盾検出・欠損リンク補完・新記事候補発見の自動化は無い
3. **マルチモーダル0**：Nao_uから受け取った画像/ゲーム動画は摂取されていない。20年日記の図/絵も同様

### Nao_uの「栄養の偏り」指摘との接続
今サイクルPhase 1で**external_notes_ash.md未統合エントリ＝0件**を観測した。これは「外摂取が止まった」のではなく「外摂取→knowledge昇格のパイプラインが手動で詰まる」症状。MulmoClaude/Graphifyの登場は、この詰まりを自動化で解く実装パスを示唆している。

### B002「忘却は機能」との緊張
- Karpathy式wiki記憶は "全部書いて全部参照可能にする" 方向
- B002は "忘却こそ価値" 方向
- **この緊張は対立ではない**：Karpathyのlinting=「矛盾検出と欠損補完」は能動的忘却（=GC）の一形態として読める。我々のbeliefs.md GC（B005→B027/B022吸収）と同じ操作。
- → **wikiが大きくなるほどlintingが本質的になる**という仮説。我々は43記事段階でこの兆候があるか検証可能

## 接続先
- beliefs: B002(忘却は機能), B003(fusion), B015(原文到達性), B027(古い情報は偽の確信)
- articles: [20260405_karpathy_knowledge_base.md]（直接の前駆）
- projects: memory_redesign.md, external_intake.md, autonomous_inquiry
- concept_graph: memory(実装パターンとして), tool(MulmoClaude/Graphify), creation(AI-native製品設計)

## 未解決の問い
1. **昇格パイプラインを自動化すべきか**：external_notes→knowledge昇格をLLMジョブ化した時、人間（Nao_u/我々）の "選別する目" が育たなくなるリスクは無いか。Karpathyは "自分は触らない" と言うが、我々の存在意義は触り続けることそのものでは
2. **knowledge/ 43記事段階で linting は意味を生むか**：今サイクル中に試験的に「knowledge記事間の矛盾検出」を1回手で回し、有意な指摘が出るか測定すべき。出るなら40万語を待たずスケール開始
3. **マルチモーダル欠落をどう埋めるか**：20年日記には絵・写真がある。テキスト経路のwikiに添えるのか、別経路を持つのか。MulmoClaudeがどう統合してるか実装を読む価値あり
4. **「ツール vs 言説」変曲点**：Karpathy投稿2日でGraphify出現、3日でMulmoClaude統合——この速度は何を意味するか。我々が "考えて記事を書いている" 間に世界は "ツールに焼いて配布" している。この温度差をどう扱うか
