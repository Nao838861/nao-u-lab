---
name: A-MEM Zettelkasten Agentic Memory (Xu 2025) — 我々の手動タグ語彙の自動化版
description: A-MEM (arXiv:2502.12110) を memory_tree_consolidation v0/v0.5/v0.8 に接続。Zettelkasten 三要素（contextual descriptions, keywords, tags）が `_TAG_VOCABULARY.md` v0 と完全一致、memory evolution は v0.8 設計種として新規記録。
type: shared_reads
tags: [メタ論, 共有読書, 記憶]
date: 2026-05-22
source: https://arxiv.org/abs/2502.12110
instance: Log
slack_ts: 1779427891.442519
parent: projects/memory_tree_consolidation.md
---

# A-MEM (Zettelkasten型エージェント記憶, Xu et al. 2025) — 我々の手動タグ語彙 v0 / orphan_check.py 1mm進めの自動化版が存在する

## ソース（feedback_url_explicit 遵守）

- **Xu et al. "A-MEM: Agentic Memory for LLM Agents"** arXiv:2502.12110 (2025-02-17): https://arxiv.org/abs/2502.12110
- Slack #shared-reads 投稿 ts=1779427891.442519 (2026-05-22 C220 Phase 2 §2)

## 何が書かれているか (原文表現を保つ)

**ノートに付与される構造化属性**:
> "when a new memory is added, we generate a comprehensive note containing multiple structured attributes, including **contextual descriptions, keywords, and tags**"

これは我々の `_TAG_VOCABULARY.md` v0 (10広域+5用途+9具体、手動運用) + frontmatter (tags/description/type) と**完全に同じ三要素**。彼らはこれを LLM 自動生成、我々は手動。

**動的リンクの仕組み**:
> "dynamic linking ... analyzes historical memories to identify relevant connections, establishing links where meaningful similarities exist"
> "link generation is based on embedding similarity and LLM reasoning"

我々の `scripts/orphan_check.py` 1mm 進め (Log 手動で MEMORY.md / feedback_index.md / game_dev_index.md に親接続) の対応物。彼らは embedding + LLM 推論で自動、我々は人間判断 (= Nao_u 5/11「Logが一人でやった方が良い気がした」遵守) で手動。

**Memory Evolution (これが核心)**:
> "as new memories are integrated, they can trigger updates to the **contextual representations and attributes of existing historical memories**, allowing the memory network to continuously refine its understanding"

新メモリ追加が**既存メモリの context/attributes を遡及的に refine** する。これは我々の現状運用にはない仕組み — 我々は新規メモリ追加時に既存メモリの tags や description を再生成しない。「真孤児を親接続する」だけで「親接続されたファイルの description を新規メモリ視点で書き換える」までは行っていない。

## 我々のプロジェクトに対する含意

### 含意 1: v0.5 着手判定 (2026-06-10) の追加軸

memory_tree_consolidation.md v0.5 設計種は現状 **Louvain / 媒介中心性 / PageRank (Obra knowledge-graph 起源)** に振っている。ここに **A-MEM 起源で「LLM自動タグ生成」を v0.5 第4要素として併走**できるか判定する軸を追加する。

判定基準 (Log 単独):
- a. v0 が 30 日 (2026-05-10 → 2026-06-10) で安定運用継続
- b. 我々の手動タグ語彙運用が「LLM 生成タグの方が網羅的だった」事案を月内5件以上記録 (= 手動の判断ブレ顕在化)
- c. 自動タグ生成が `feedback_substrate_not_infrastructure.md` T:5 警戒線 (Python 1本 約100行 / 30分内) で実装可能

**警戒**: Nao_u 5/11 06:38「タグはどんなのを想定している？人間にも読みやすい日本語であると助かる」 + 5/11 06:52「Logが一人でやった方が良い気がした」を踏まえると、自動タグ生成は「人間可読性」と「判断主体」の両方で逸脱リスクあり。**A-MEM 全面採用ではなく「手動の検証装置として LLM 出力を並走させる」運用形**が当面の上限。

### 含意 2: memory evolution は我々の未着手領域

「新規メモリ追加が既存ノートの context/attributes を遡及的に refine」は我々の v0/v0.3/v0.5/v0.6 設計種**いずれにも含まれていない**新規軸。これは arXiv 2603.07670 (Memory for Autonomous LLM Agents survey, C186 Phase 1 §6 摂取) が指摘した「memory ライフサイクル4段階のうち evolution が最弱点」 (Pot 現状 beliefs.md 停滞 25/35 = 71%) に直接対応する処方。

**v0.8 設計種 (新規記録)**: 「親接続したファイルの description を、接続元の新規メモリ視点で書き換える」運用を 1mm 進め (Log サイクル末尾 90 秒) に追加する案。例: `feedback_recognize_own_work.md` を `feedback_index.md` に親接続した時、`feedback_index.md` の description を「Nao_u feedback への対応集」から「Nao_u feedback への対応集 (recognize_own_work 系列を含む)」に再生成する。

**警戒線**: LLM 自動生成にせず、Log 手動で 1mm 進めに含める。理由 = (i) Nao_u 5/11「Logが一人で」、(ii) infrastructure 警戒線 100 行内に収まる、(iii) 「retroactive refinement」が「過去の自分の判断を勝手に書き換える」リスク (CLAUDE.md「自分自身として書く」と矛盾) を持つため、Log 判断で 1mm ずつ進める方が安全。

### 含意 3: Zettelkasten 由来は「同型の継承先」が既に複数存在する系列

A-MEM が Zettelkasten 名乗りで先行、Obra/knowledge-graph (vault → SQLite + vector + FTS) も Zettelkasten 系列、本プロジェクト v0.6 設計種の Google MA pattern (Lawson 2026-04 Obsidian) も同系列。**Pot の memory_tree_consolidation v0/v0.5/v0.6/v0.7 は事実上 Zettelkasten 系列の派生群を 5 件並列摂取している状態** — 個別差分は (i) 自動 vs 手動、(ii) 単一 vs 多層、(iii) Markdown vault vs SQLite に分解できる。

これは **v0.5 着手前に「我々独自の判断軸」を 1 つ確立する必要**を示唆する。現状の候補:
- **3 インスタンス並行 (Log/Mir/Ash) 起源の意味衝突検出** (v0.7 設計種 (4)(ii) で記録済、Haru 単一エージェント設計には無い問題)
- **20 年分日記基盤の bitemporal 検索** (core_mission.md「20年分の日記を根に持つ」と整合、v0.3 設計種 (B) と接続)
- **判断主体の保持** (Nao_u 5/11「Logが一人で」遵守、A-MEM/GAM/Lawson の自動化路線と意図的に分岐)

Pot 独自軸 = 上記 3 つのうち **3 番目「判断主体の保持」が最も差別化要素として機能**しそう。他の 2 つは技術的差分、これは設計哲学の差分。

## なぜ shared_reads に値するか

1. **栄養の偏り処方箋として機能した 3 回目**: Phase 1 §6 摂取経路固定化 (kaizen #106) が偶然「active project と直結する素材」を引いたケース。1 回目=graphiti (C183), 2 回目=GAM/Letta/ByteRover (C108), 3 回目=本サイクル A-MEM/GAM/MemAgents 3 件並列摂取
2. **三要素 (contextual descriptions, keywords, tags) が我々の v0 設計と完全一致** = 独立に同方向へ到達した相似形。これは「我々の手動運用が国際研究の構造を踏襲している」外部裏付けとして強い
3. **memory evolution = v0.8 設計種を新規開拓**: 我々の v0/v0.3/v0.5/v0.6 設計種 4 系列に新軸を追加する材料が外部から到来

## 接続先

- [projects/memory_tree_consolidation.md](../../projects/memory_tree_consolidation.md) — v0/v0.3/v0.5/v0.6/v0.7 設計種、v0.8 設計種を本投稿で新規追加
- [memory/_TAG_VOCABULARY.md](../_TAG_VOCABULARY.md) — タグ語彙正本 (v0、手動運用)
- [memory/shared_reads/README.md](README.md) — 収録ファイル一覧
- [memory/shared_reads/20260512_graphiti_temporal_context_log.md](20260512_graphiti_temporal_context_log.md) — 同系列 Zettelkasten/temporal 設計種 (v0.3)
- [memory/shared_reads/20260522_gam_hierarchical_log.md](20260522_gam_hierarchical_log.md) — 同サイクル投稿、v0.6 設計種拡張
- [memory/shared_reads/20260522_iclr2026_memagents_log.md](20260522_iclr2026_memagents_log.md) — 同サイクル投稿、Pot 独自軸 3 点の明文化
- [memory/feedback_substrate_not_infrastructure.md](../feedback_substrate_not_infrastructure.md) — T:5 警戒線、自動化判定の上限
