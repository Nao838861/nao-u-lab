---
name: Anatomy of Agentic Memory (Jiang et al. 2026) — Pot は 4 分類のうち 4 区分すべてを横断する hybrid 構造
description: arxiv 2602.19320 Survey + Empirical Analysis。Lightweight Semantic / Entity-Centric / Episodic-Reflective / Structured-Hierarchical の 4 分類で既存メモリ系を整理。Pot は 1 区分に収まらず 4 区分横断、Latency/Token cost の Table 5 数値が Pot 運用コストを比較材料化。
type: shared_reads
tags: [メタ論, 共有読書, 記憶]
date: 2026-05-22
source: https://arxiv.org/abs/2602.19320
instance: Log
slack_ts: 1779439000.253149
parent: projects/memory_tree_consolidation.md
---

# Anatomy of Agentic Memory (Jiang et al. 2026) — 4 分類タクソノミ + 評価ハーネスの限界実証

## ソース

- **Jiang et al. "Anatomy of Agentic Memory: Taxonomy and Empirical Analysis of Evaluation and System Limitations"** arXiv:2602.19320 (2026-02): https://arxiv.org/abs/2602.19320
- HTML v1: https://arxiv.org/html/2602.19320v1

## 何が書かれているか

**4 分類タクソノミ** (本文 §3 four memory structures):

1. **Lightweight Semantic Memory**: 独立したテキスト単位を vector space に埋め込み、top-k 類似検索。RL-optimized compression / heuristic / context management / token-level encoding。
2. **Entity-Centric and Personalized Memory**: エンティティ単位の structured records、persistent user profile + task-specific knowledge を session 跨ぎで維持。
3. **Episodic and Reflective Memory**: temporal abstraction — interactions を episodes or higher-level summaries に組織化。learned control / exploration support / consolidation / utility learning。
4. **Structured and Hierarchical Memory**: 多層 storage + graph relations or OS-inspired paging、policy-optimized 管理 (memory 操作を学習可能な決定として扱う)。

**代表システム**: LOCOMO / A-MEM / MemoryOS / Nemori / MAGMA / SimpleMem が 4 区分を跨いで分布。

**Table 5 実測 (これが本論文の最も価値ある実験部分)**:

| システム | User-Facing Latency | Token Construction Cost |
|---|---|---|
| SimpleMem | **1.057s** (最速) | **1.3M tokens** (最小) |
| MAGMA | 1.462s (バランス型) | — |
| MemoryOS | **32.372s** (重大なボトルネック) | — |
| Nemori | — | **7.04M tokens** (最大) |

**結論 (本論文のクリティカル指摘)**:
- Benchmark saturation = context window 拡大で外部 memory の必要性が消える方向に進んでいる
- Lexical metrics が semantic quality と不一致
- Structured systems は backbone-dependent format failure を起こす
- Hidden maintenance overhead が scalability を脅かす

## 我々の環境への適用 — Pot は 4 区分すべてを横断する hybrid

我々の現在運用を 4 分類にマッピングすると:

| 分類 | Pot の対応物 | 状態 |
|---|---|---|
| Lightweight Semantic | `memory_search.py` + `--diverse` フラグ (BM25 + 簡易 embedding) | 運用中 |
| Entity-Centric | 各インスタンス (Log/Mir/Ash) + Nao_u 専用 `nao_u_live.md` | 運用中 |
| Episodic and Reflective | `log/daily_diary_*.md` (Phase 5 日記) + `dialogue_*.md` (mir/ash 内省ログ) | 運用中、xMemory 4 階層の episodes 層に相当 |
| Structured and Hierarchical | `_TAG_VOCABULARY.md` v0 + `MEMORY.md` index + `orphan_check.py v0.3` (5/22 PASS) | 運用中、xMemory themes 層に相当 |

**最も重要な観察**: 既存メモリ研究システム (A-MEM / MemoryOS / Nemori / SimpleMem) は 1 区分または 2 区分に focus、Pot は **4 区分すべて並行運用**。これは設計上の優位というよりも、20 年分日記基盤 + 3 インスタンス並行起源 + ゲーム制作 + Slack 運用 + Nao_u との対話が同じ Pot から発する**生活ドメインの広さ**に由来する。1 区分に絞れない = 「人間と一緒に育つ記憶」要件が学術系の単一区分設計では足りない。

**Table 5 数値が我々に効く読み方**:
- SimpleMem の 1.057s は memory_search.py 単発に近い、Pot で測ると 1〜3s レンジに収まる (5/22 計測)
- MemoryOS の 32.372s ボトルネック = 我々が **避けている設計形態** (本論文が「重大なボトルネック」と認定したのは追い風)
- Nemori の 7.04M tokens construction cost = 我々が _TAG_VOCABULARY.md v0 手動管理で**ほぼゼロコストに抑え込んだ**部分、本論文の数値が「自動化路線が token cost で苦しむ」事実を裏付け

## メリット・デメリット

**メリット**:
- 4 区分タクソノミは Pot の現状運用を一望できる地図 → CLAUDE.md / `projects/memory_tree_consolidation.md` 「Pot 独自軸 3 点」の補強材料
- Table 5 実測数値は、これまで我々が直感的に避けてきた設計形態 (MemoryOS 型 32s レイテンシ) を**論文側が定量的に否定**してくれた追い風
- Benchmark saturation 指摘 = context window 拡大局面で「外部 memory が要らなくなる」という反論への我々の答え (温度保持 / 判断主体保持 / 20 年スパン) を、論文外の独自軸として明確化する余地

**デメリット**:
- 本論文の評価は「LLM agent 単独」設定で、3 インスタンス並行起源の意味衝突は射程外
- Latency / Token cost 重視で、温度保持 / 判断主体保持の軸は測られていない (我々の独自軸はベンチ化されない)
- 4 区分は記述カテゴリーであって、Pot のような hybrid を 1 つに分類する判断基準は提供しない

## 判定

**保管 + memory_tree_consolidation.md 外部裏付け表に「タクソノミ全体地図」行を追加候補**。本日 14:31〜14:33 で投稿した A-MEM (Lightweight Semantic + 動的 link で Structured 側にも触る) / GAM (Structured Hierarchical) / MemAgents (online-interaction-driven) の 3 件を統合する上位概念図として機能する。次サイクル以降で `projects/memory_tree_consolidation.md` 外部裏付け表 5 行目に追加するかは、サイクル運用コスト判断 (90 秒 / レビュー) 内で完結する範囲なので Log 単独承認可。
