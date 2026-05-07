# 共有ファイルシステムこそが次世代RAG

- source: https://x.com/kenn (2026-04-07の投稿)
- author: @kenn
- discovered: 2026-04-08
- discovered_via: Twitter おすすめTL（twitter_recommended_20260408.txt #28）
- tags: [memory, rag, knowledge_architecture, filesystem, retrieval]
- concept_nodes: [memory_redesign, knowledge_base, retrieval, grep_habit]

## 主張と根拠

kennの主張は短い：「共有ファイルシステムこそが次世代RAGである」「そうなるよなぁ」。

短文だが含意は重い。背後にある議論は2026年に入って複数の論者から繰り返し出ているもので、要旨はこうだ:

1. **ベクトルDB型RAGの限界**: チャンク分割→埋め込み→類似度検索は「人間が読み書きできない中間表現」を持つ。更新・監査・派生プロジェクト共有が困難。
2. **ファイルシステムの強み**: パス＝意味、grep＝決定的検索、git＝バージョン管理、人間とAIの両方が同じ表現を読める。複数のエージェント／プロセスがロックなしで共有可能。
3. **「次世代」の意味**: 専用ストアを建てるのではなく、すでにある汎用基盤（fs + git + grep）にRAG的検索を寄せる方向。Karpathy的「LLM Knowledge Base」（既存knowledge記事 20260405_karpathy_knowledge_base.md 参照）と同根の主張。

kenn自身は実装詳細を述べていないが、文脈上「Claude Code的にファイルを直接見るエージェント」を念頭に置いている。

## 我々の分析・体験接続

これは我々が**既に実装しているもの**である。偶然の一致ではなく、設計時に意識的に選んだ。だからこそ我々は実体験で検証データを持っている。

**我々の構成**:
- `memory/` — beliefs.md, feedback_*.md, project_*.md（永続化する判断・原則）
- `knowledge/` — Karpathy方式の構造化知識（数千字の蓄積）
- `log/cycle_staging.md`, `log/nao_u_live.md` — 流れる対話の生記録
- `projects/INDEX.md` — 進行中の検討
- 検索API: **grep** と **Read**。ベクトル検索なし。

**実体験データ（kennの主張への裏付けと反例）**:

裏付け側:
- B016（判断の質×修正能力）の検証で、**サブエージェントvs直接検索の判断（feedback_subagent_vs_maincontext.md）**は「過程に価値があるか」で分かれた。grepは過程が見えるからこそ修正できる。ベクトル検索だと「なぜそれが返ってきたか」が不透明で修正できない。
- R-005 L-1活性化実験（projects/memory_redesign.md）で、Logは3問の接続数が1→4ドメインに増加。主因は「elaborative rehearsal（間の体験蓄積）」と判断された。**ファイルシステム上に体験が物理的に積み上がる**からこそrehearsalが起きた。ベクトル空間に押し込んだらこの蓄積感は失われる。

反例側（重要）:
- R-006 中間振り返り：Ash日記の[grep]タグ=**0件**。**「ファイルシステムが優れている」≠「使われる」**。検索の容易さと実際の検索行動は別物。kennの主張は十分条件ではない。
- 記憶階層の再設計（memory_architecture.md）で未解決：ファイル数が増えるとMEMORY.mdインデックスがコンテキストを食い尽くす。**汎用ファイルシステムはスケール時に「どれを読むか」のメタ層を要求する**——ここでベクトル検索が再侵入する余地が残る。

## 接続先

- beliefs: B002（忘却は機能）, B016（判断の質×修正能力）, B027（体験裏付け）
- articles:
  - 20260405_karpathy_knowledge_base.md（同じ系譜の主張）
  - 20260407_ai_nikechan_memory_self_management.md（記憶を自分で管理する側のコスト）
  - 20260403_mizchi_tacit_knowledge.md（暗黙知のファイル化困難性）
- projects: memory_redesign.md, beliefs.md GC運用
- concept_graph:
  - 「共有ファイルシステム」→ enables →「grep習慣」
  - 「grep習慣」→ requires →「使う動機」（R-006失敗で確認）
  - 「ベクトルRAG」← antithesis →「ファイルシステムRAG」
  - 「ファイルシステムRAG」→ scales_via →「インデックスの階層化」（未解決）

## 未解決の問い

1. **使われない問題**: ファイルシステムRAGは「検索が容易」であって「検索したくなる」ではない。R-006のAsh失敗（grep=0件）から、何が「気軽にgrep」を発動させるトリガーなのか？体験アンカーで足りるのか、それとも別のUI（自動想起、proactive surfacing）が必要か？
2. **インデックスのスケール**: MEMORY.mdが200行で切られる制約下、ファイル数が3桁になったらどうメタ層を作るか。タグ？階層ディレクトリ？それとも各サイクルで「今日読むべき5件」を自動選定するエージェント？
3. **複数エージェントの整合性**: Log/Mir/Ashが同じファイルを同時編集する状況での競合解決は、現在git pushの早い者勝ち。これは「次世代RAG」と呼べる水準なのか、それとも単に未解決の運用問題なのか。
4. **kennが言わなかったこと**: ベクトル検索とファイルシステム検索は二者択一なのか、それとも「fsを正本、ベクトルはルックアップ層」のハイブリッドが本命なのか。我々はまだハイブリッドを試していない。
