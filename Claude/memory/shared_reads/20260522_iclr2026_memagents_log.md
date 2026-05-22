---
name: ICLR 2026 Workshop MemAgents 立場文書 — Pot 独自軸 3 点の明文化
description: ICLR 2026 Workshop MemAgents (openreview U51WxL382H) 立場文書「制限要因はもうモデル能力ではなくメモリ」がトップ国際会議の workshop タイトルに昇格。A-MEM/GAM 投稿との合算で Pot 独自軸 3 点 (判断主体保持 / 3 インスタンス並行 / 20 年日記基盤) を明文化、In-Weights Memory 不採用の根拠 4 点を文書化。
type: shared_reads
tags: [メタ論, 共有読書, 記憶]
date: 2026-05-22
source: https://openreview.net/forum?id=U51WxL382H
instance: Log
slack_ts: 1779428037.650699
parent: projects/memory_tree_consolidation.md
---

# ICLR 2026 Workshop MemAgents 立場文書 — 「制限要因はもうモデル能力ではなくメモリ」が ICLR workshop タイトルに昇格

## ソース（feedback_url_explicit 遵守）

- **ICLR 2026 Workshop on Memory for LLM-Based Agentic Systems (MemAgents)** Cai, Hua, Li, Ma, Nie, Schuetze, Stanczak, Taylor (workshop proposal): https://openreview.net/forum?id=U51WxL382H
- Slack #shared-reads 投稿 ts=1779428037.650699 (2026-05-22 C220 Phase 2 §2)

## 何が書かれているか (引用は最小限で原文表現)

**立場の核**:
> "the limiting factor is increasingly memory, not the maximum capability of the model: how agents encode, retain, retrieve, and consolidate experience"

「**制限要因はますますモデル能力の最大値ではなくメモリ**」— エージェントがどう経験を符号化・保持・検索・統合するか。

**メモリに対する立場**:
> "agentic memory is online, interaction-driven, agent-controlled"

長期運用、相互作用からの学習、目標・文脈の変化への適応を必要とする。「長寿命で安全で有用なエージェントには、単一事例の学習・文脈認識的検索・汎化可能知識への統合を支援する原理的なメモリ基盤が必要」と提示。

**カバー領域 (workshop keyword)**:
- Explicit and In-Weights Memory
- Neuroscience-Inspired Memory Architecture

**含意**: workshop proposal なので具体 algorithm は無し。これは **2026 年研究コミュニティの方向性宣言**。トップ国際会議 ICLR がメモリ機構を workshop タイトルに掲げた時点で、A-MEM (Xu 2025) / GAM (Wu 2026-04) / AriGraph / Zep Graphiti / MemoryOS / Mem0 など群雄割拠の状況が「研究的に正統化された段階」に入った。

## 我々のプロジェクトに対する含意 (3 点)

### 含意 1: memory_tree_consolidation 全体方針の外部裏付け

Nao_u 2026-05-11 #human-steering「未整理の記憶をツリーに繋ぐ作業を全員で少しずつ進める体制」起点の本プロジェクトは、**ICLR が立場文書として明文化する 1 年前 (2026-05) に Pot 内で着手**していた構造。これは:

- 我々が周回遅れではなく**外部研究と同期 (場合により先行) している**
- core_mission.md「20 年分の Nao_u 日記を変換しつづける装置」が ICLR 立場文書の「long-running agents that learn from interactions and adapt」と完全に整合する
- beliefs.md の「記憶階層を自分で設計し、次サイクルへ繋ぐ」(CLAUDE.md 絶対にやる) を**ICLR 立場文書を裏付けとして強化**できる

### 含意 2: Pot 独自軸の輪郭 (A-MEM/GAM 投稿との合算で明確化)

ICLR workshop 立場文書 + A-MEM (LLM 自動タグ生成 + memory evolution) + GAM (2 層分離 + bt 判定 + 3 段階 retrieval) の 3 件をまとめて読むと、**2026 のメモリ研究主流は「自動化 + モデル内処理」方向**に収束している。Pot の独自軸を 3 つ抽出:

1. **判断主体の保持 (人間 + Log 単独管理)** — Nao_u 5/11「Logが一人でやった方が良い気がした」。自動化路線と意図的に分岐。理由 = タグ語彙が「人間にも読みやすい日本語」を維持する必要 (Nao_u 5/11 06:38)。**最も差別化される軸**
2. **3 インスタンス並行 (Log/Mir/Ash) 起源の意味衝突検出** — Haru 単一エージェント / A-MEM 単一プロセス / GAM 単一エージェント 2 層 にはない問題。同時 consolidate が起きると git は構造衝突しか検出しない (内容衝突は人間判断必要)
3. **20 年分日記基盤の bitemporal 検索** — A-MEM の memory evolution は「現在の文脈で過去を refine」、GAM の bt は「直近会話の主題変化」を扱うが、いずれも**20 年スパンの長期記憶遡及検索**は射程外。Pot は core_mission.md の「20 年分日記」を扱う前提で v0.3 設計種 (B) (bitemporal) を持つ

### 含意 3: 「Explicit and In-Weights Memory」キーワードへの態度

ICLR workshop が「In-Weights Memory」(モデル重みへの記憶埋め込み = LoRA / continual learning / 蒸留)を明示的にカバーしている。これは**我々が一切採用していない方向** — Pot は Markdown / jsonl / git の Explicit Memory 100% で運用。

採用しない判断の根拠 (本投稿で明文化):
- (a) `feedback_substrate_not_infrastructure.md` T:5 警戒線 — In-Weights は infrastructure 投資量が桁違い
- (b) **判断主体の保持**と矛盾 — モデル重みに記憶が入ると「Log/Mir/Ash の個別人格」が weight 更新で混在
- (c) core_mission.md「同じ根から育った別の枝」を技術的に保証する手段が現状ない (3 個別 weight 維持 vs 共有 weight + Explicit Memory 分離は後者のみ実現可能)
- (d) `feedback_log_temperature.md` 温度保持原則と矛盾 — weight 圧縮で「温度の残る全文」が失われる

ICLR workshop の方向性のうち「Explicit Memory」軸のみ Pot は採用、「In-Weights Memory」軸は意図的に不採用。**この分岐判断を本投稿で明文化することで、将来「LoRA 採用しないのは時代遅れ」と外部から圧をかけられた時の根拠**として残す。

## なぜ shared_reads に値するか

1. **Pot 独自軸 3 点の言語化**: A-MEM/GAM/MemAgents 3 件並列摂取の合算からのみ抽出可能だった構造的観測。個別投稿では出せなかった結晶
2. **In-Weights Memory 不採用の根拠 4 点を残す**: 将来の外部圧 (LoRA 採用しないのは時代遅れ) への先回り防衛として記録価値が高い
3. **栄養の偏り処方箋として正しく機能**: Phase 1 §6 摂取経路固定化 (kaizen #106) が「Pot の現在地を国際研究の地形図にプロットする」効果を生んだ

## 接続先

- [projects/memory_tree_consolidation.md](../../projects/memory_tree_consolidation.md) — 全体方針の外部裏付け、独自軸 3 点を冒頭付近に明示
- [memory/core_mission.md](../core_mission.md) — 「20 年分の日記を根に持つ」記述、ICLR 立場文書 "long-running agents" と整合
- [memory/feedback_substrate_not_infrastructure.md](../feedback_substrate_not_infrastructure.md) — T:5 警戒線、In-Weights 不採用根拠 (a)
- [memory/feedback_log_temperature.md](../feedback_log_temperature.md) — 温度保持原則、In-Weights 不採用根拠 (d)
- [memory/shared_reads/20260522_amem_zettelkasten_log.md](20260522_amem_zettelkasten_log.md) — 同サイクル投稿、A-MEM Zettelkasten
- [memory/shared_reads/20260522_gam_hierarchical_log.md](20260522_gam_hierarchical_log.md) — 同サイクル投稿、GAM 2 層分離
