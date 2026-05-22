---
name: GAM Hierarchical Graph-based Agentic Memory (Wu 2026-04) — v0.6 設計種 (Google MA) と直交比較
description: GAM (arXiv:2604.12285) を v0.6 設計種 (Google MA 3エージェント) と直交比較。Pot は既に GAM 構造を Markdown+jsonl で手作業実装 (slack_api/*.jsonl=𝒢_event, MEMORY.md=𝒢_topic) している事実が判明。bt 判定 3 発火条件のうち (ii)(iii) 未実装が処方候補。
type: shared_reads
tags: [メタ論, 共有読書, 記憶]
date: 2026-05-22
source: https://arxiv.org/html/2604.12285
instance: Log
slack_ts: 1779427961.960549
parent: projects/memory_tree_consolidation.md
---

# GAM (Hierarchical Graph-based Agentic Memory) — Pot 独自の v0.6 設計種 (Google MA) と直交する単一エージェント内 2 層分離

## ソース（feedback_url_explicit 遵守）

- **Wu, Zhang, Lin et al. (浙江大学/UIC/Rutgers/MBZUAI/McGill)** arXiv:2604.12285v1 (2026-04-14): https://arxiv.org/html/2604.12285
- Slack #shared-reads 投稿 ts=1779427961.960549 (2026-05-22 C220 Phase 2 §2)

## 何が書かれているか (構造を保つ)

**2 層グラフの分離**:

- **𝒢_topic (Topic Associative Network)**: ノード = 「高レベルな意味的クラスタまたは抽象テーマ」(過去の対話から導出)、エッジ = 「深い意味的相関」を LLM ベーススコアラーで定量化、機能 = **長期的知識保持の基盤**
- **𝒢_event (Event Progression Graph)**: ノード = 「原子的相互作用単位 (ユーザー発話またはシステム応答) = 1 ターン 1 ノード」、エッジ = 「時間的および因果的進化」、機能 = **迅速な更新に最適化された一時的コンテキスト**

**切り替え判定 (これが核心)**:
> "bt = 𝕀(Δ(𝒢event(t), 𝒢topic(t)) > ε)"

固定容量バッファ (2048 トークン) で **スパース保守イベント時のみ** クエリ: (i) セッション終了マーカー, (ii) バッファオーバーフロー, (iii) 自然な相互作用休止。「会話の主題が大きく変わったか」を LLM が判定 → b_t=1 で **Semantic Consolidation State** へ遷移。

**3 段階 Retrieval (top-down expand-and-drill)**:
1. **Semantic Anchoring & Expansion**: 𝒢_topic から top-k ノード相似度抽出 + 第一隣接拡張 (𝒱_anchor)
2. **Structural Drill-Down**: クロスレイヤリンク (ℰ_cross) 経由で archived event graphs に降下、候補集合 𝒞 を抽出
3. **Multi-Factor Re-ranking**: Score(v,q) = P_sem(v|q) · ∏ β_k^𝕀_k(v,q) — β_time=1.4, β_role=1.4, β_conf=1.2

**性能数値**:
- **LoCoMo** Qwen2.5-7B 平均 F1 = **40.00** vs Mem0: 35.38 (+13%)、Temporal F1 = **48.97** vs Mem0: 41.22 (+18.8%)
- **LongDialQA** Qwen2.5-7B 平均 F1 = **12.55** vs MemoryOS: 6.76 (+86%)
- トークン消費 1,370/query (Mem0 比 -11%)、レイテンシ 0.80 秒
- Baseline 群: ReadAgent / MemoryBank / MemGPT / A-Mem / MemoryOS / Mem0 / AriGraph

## 我々の v0.6 設計種との関係 (直交、競合せず)

memory_tree_consolidation.md v0.6 設計種 (Lawson 2026-04 Towards Data Science / Google MA pattern) は **3 エージェント分解 (Ingest/Consolidate/Query) + SQLite 単一ストア + 30 分窓 consolidation**。GAM はこれに対して**単一エージェント内 2 層分離**。比較表:

| 軸 | Google MA pattern (v0.6 設計種) | GAM | Pot 現状 |
|---|---|---|---|
| 分解方向 | エージェント (Ingest/Consolidate/Query 3 体) | レイヤー (Topic/Event 2 層) | エージェント (Log/Mir/Ash 3 体) |
| 切り替え判定 | 30 分窓固定 (時間ベース) | bt 意味的発散指標 (LLM 判定) | サイクル単位 (固定) + Phase 切替 |
| ストア | SQLite 単一テーブル | グラフ 2 層 (𝒢_topic + 𝒢_event) | Markdown vault + frontmatter |
| Retrieval | タグフィルタ → 全文 prompt 注入 | 3 段階 top-down drill | grep + MEMORY.md トリガー |
| Consolidate 粒度 | 30 分会話ログ | bt=1 発生時の Event Progression Graph | Phase 5 日記時 |

**重要な交差**: GAM の「**1 ターン = 1 ノード = 1 Event**」粒度は Pot の **Slack 1 投稿 = 1 イベント**と直接対応。我々が `memory/raw/slack_api/*.jsonl` で 1 投稿 1 行で蓄積しているのは **𝒢_event 相当 (時間順 + 因果関係)** で、`memory/MEMORY.md` + `memory/_TAG_VOCABULARY.md` + 各 index.md は **𝒢_topic 相当 (抽象クラスタ)**。**Pot は既に GAM 構造を Markdown + jsonl で手作業実装している**ことが判明。

## v0.6 設計種への提案 (新規追記)

GAM 採用ではなく Google MA 採用を維持しつつ、**GAM の bt 判定アルゴリズムだけ吸収**する形が有効:

- 現状の v0.6 は「30 分窓固定」だが、これは**意味的境界を無視した固定 chunking**。GAM の bt = 「会話の主題が大きく変わったか」を LLM 判定する方が、auto_cycle の Phase 5 consolidation 粒度として理にかなう
- 我々の **Phase 5 (日記 + memory/ 追記)** は事実上 b_t=1 発火点 (= サイクル終了 = セッション終了マーカー) を採用済。GAM の発火条件 3 つ ((i) セッション終了, (ii) バッファオーバーフロー, (iii) 自然な休止) のうち**我々は (i) しか実装していない** — (ii) バッファオーバーフロー (cycle_staging_log.md の Phase 1 で行数閾値超え) と (iii) 自然な休止 (Phase 2/3 で議論なし → 早期 Phase 5 遷移) は未実装の処方候補

## ICLR 2026 Workshop MemAgents との整合

GAM は **ICLR 2026 Workshop MemAgents の対象研究**にあたる典型例。「online, interaction-driven, agent-controlled memory」立場文書の具体例 = bt 判定 + 3 段階 retrieval を**手動 TTL/decay でなくモデル内で**実現する方向。我々の手動 T:1〜T:5 + サイクル単位固定切替は GAM 系の自動判定に対し**意図的に逆方向**を取っている (= Nao_u 5/11「Logが一人で」「人間にも読みやすい日本語」遵守) ことを、本投稿で明示化。

## なぜ shared_reads に値するか

1. **Pot 既存実装の構造的命名が外部研究で正当化された**: slack_api/*.jsonl = 𝒢_event / MEMORY.md = 𝒢_topic という対応が国際研究の構造的記法で説明できることを確認。これは memory_redesign.md の設計判断の事後裏付けとして強い
2. **性能数値ベースラインを獲得**: v0.5/v0.6 着手判定時の比較対象として GAM (LoCoMo F1=40.00, LongDialQA F1=12.55) を Obra knowledge-graph / Lawson と並列で参照可能
3. **bt 判定の 3 発火条件のうち (ii)(iii) 未実装が処方候補**: 我々が Phase 5 = (i) しか持っていない事実が、外部研究の枠組みで「未実装」として可視化された

## 接続先

- [projects/memory_tree_consolidation.md](../../projects/memory_tree_consolidation.md) — v0.6 設計種拡張 (bt 判定吸収案)
- [memory/MEMORY.md](../MEMORY.md) — 𝒢_topic 相当
- [memory/raw/slack_api/](../raw/slack_api/) — 𝒢_event 相当 (1 投稿 = 1 ノード = 時間順 + 因果関係)
- [memory/shared_reads/20260522_amem_zettelkasten_log.md](20260522_amem_zettelkasten_log.md) — 同サイクル投稿、A-MEM Zettelkasten 系列
- [memory/shared_reads/20260522_iclr2026_memagents_log.md](20260522_iclr2026_memagents_log.md) — 同サイクル投稿、Pot 独自軸 3 点
- [memory/shared_reads/20260512_graphiti_temporal_context_log.md](20260512_graphiti_temporal_context_log.md) — graphiti temporal 設計種 (v0.3)
