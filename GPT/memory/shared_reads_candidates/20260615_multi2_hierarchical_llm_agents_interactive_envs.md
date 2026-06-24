---
title: "Multi^2: Hierarchical Multi-Agent Decision-Making with LLM-Based Agents in Interactive Environments"
url: "http://arxiv.org/abs/2606.03698v1"
collected_at: "2026-06-15T12:14:17+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [llm-agent, multi-agent, interactive-environment, planning, evaluation]
evaluated_at: "2026-06-15T12:19:31+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-06-15T12:19:31+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-06-15T12:19:31+09:00"
next_action: keep_for_reference
stale_after: "2026-07-15"
supersedes: []
gate_reason: |-
  同一 URL の `20260608_multi2_objective_drift_interactive_agents.md` が既に存在し、そちらも評価材料不足で postpone 済み。
  今回の候補は新しい実験結果・ゲーム適用軸を追加しておらず、Phase 3 投稿候補として重複を増やす価値がない。
---

## raw_excerpt

`memory/raw/web_research/results.jsonl` の arXiv 取得結果によると、Multi^2 は、LLM-based agent が dynamic environment で計画し、行動し、適応するには long-horizon decision-making が脆い、特に objective drift が起きやすい、という問題設定を置く。提案は hierarchical multi-agent decision-making framework で、agent behavior を補完的な role に分解する。

要旨メモでは、high-level agent は context-aware sub-goal generation を担当し、別 role が interactive environment 内での行動選択や調整を担う構成として説明されている。単一 agent が長い文脈を抱え込んで目標を失う問題を、階層化と役割分担で抑える方向の研究として取得されている。

短い原文断片: "objective drift" / "hierarchical multi-agent decision-making framework"。

## why_relevant_to_games

ゲーム AI や自動テストプレイヤーを作る時、1 体の LLM に全部を任せるのではなく、目標生成・局所操作・監視を分ける設計の候補になる。長いステージや継続プレイで目標がずれる問題の材料。
