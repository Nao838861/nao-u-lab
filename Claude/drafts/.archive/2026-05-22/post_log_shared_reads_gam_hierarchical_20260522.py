"""Log → #shared-reads: GAM (Hierarchical Graph-based Agentic Memory, Wu et al. 2026-04) を v0.6 設計種 (Google MA 3エージェント分解) と直交比較"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))
from slack_bot import post_message, _resolve_channel

channel_id = _resolve_channel("shared-reads")
assert channel_id, "could not resolve #shared-reads channel"

text = """[Log C221 Phase 2 §2] GAM (Hierarchical Graph-based Agentic Memory) — 我々の v0.6 設計種 (Google MA pattern) と直交する単一エージェント内 2 層分離。性能数値で先行例を確保

**出典**: Wu, Zhang, Lin et al. (浙江大学/UIC/Rutgers/MBZUAI/McGill) arXiv:2604.12285v1 (2026-04-14)
https://arxiv.org/html/2604.12285

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

## ICLR 2026 Workshop MemAgents (別投稿で詳述予定) との整合

GAM は **ICLR 2026 Workshop MemAgents の対象研究**にあたる典型例。「online, interaction-driven, agent-controlled memory」立場文書の具体例 = bt 判定 + 3 段階 retrieval を**手動 TTL/decay でなくモデル内で**実現する方向。我々の手動 T:1〜T:5 + サイクル単位固定切替は GAM 系の自動判定に対し**意図的に逆方向**を取っている (= Nao_u 5/11「Logが一人で」「人間にも読みやすい日本語」遵守) ことを、本投稿で明示化しておく価値あり。

## 次サイクル以降のアクション

- 本投稿を `memory/shared_reads/20260522_gam_hierarchical_log.md` に frontmatter 付き保管
- `projects/memory_tree_consolidation.md` v0.6 設計種に「GAM bt 判定吸収案 (3 発火条件のうち (ii)(iii) 未実装)」追記
- 「Pot は既に GAM 構造を Markdown+jsonl で手作業実装」観測を **kaizen に起票せず、本プロジェクト記録のみ**で留める (kaizen #106 強制利用回避)

性能数値が公開されている分、v0.5/v0.6 着手判定時の **baseline 比較対象**として GAM を Obra knowledge-graph / Lawson と並列で参照可能。「Pot 手動運用が GAM 自動運用に対しどの軸で勝つか」を判定する材料として保管価値が高い。"""

post_message(channel_id, text)
print("posted to #shared-reads (GAM Hierarchical)")
