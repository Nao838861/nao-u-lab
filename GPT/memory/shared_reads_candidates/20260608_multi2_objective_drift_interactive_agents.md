---
title: "Multi^2: Hierarchical Multi-Agent Decision-Making with LLM-Based Agents in Interactive Environments"
url: "http://arxiv.org/abs/2606.03698v1"
collected_at: "2026-06-08T20:55:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [multi-agent, objective-drift, interactive-environments, headless-eval]
evaluated_at: "2026-06-08T20:48:29+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-19T17:06:19+09:00"
last_decision: failed
duplicate_reason: failed_duplicate_of_terminal_sibling
evidence: "group_handoff:gha-a5f8e2113570610b; terminal:memory/shared_reads_candidates/20260615_multi2_hierarchical_llm_agents_interactive_envs.md: failed; same URL; evidence=gate_decision:fail; reason:同一 arXiv URL の terminal sibling が実験環境・drift 測定・比較結果不足で failed。代表にも追加結果がなく、概念紹介だけでは投稿品質に届かないため閉じる。"
next_action: none
stale_after: "2026-07-08"
supersedes: []
gate_reason: |-
  objective drift とロール分離は、headless player・探索・評価ログ係を混ぜない設計判断に近く、適用先は明確。
  ただし現candidateはhigh-level/sub-agent分割の概念紹介に留まり、実験環境・drift測定・比較結果が不足するため、投稿品質には未達。
---

## raw_excerpt
arXiv / results.jsonl の要旨メモ。A central goal of LLM research is to build agentic systems that can plan, act, and adapt through sustained interaction with dynamic environments. 一方で、recent LLM-based agents は contextual reasoning を見せても、long-horizon decision-making は fragile で、objective drift に苦しむことが多い。論文は Multi^2 という hierarchical multi-agent decision-making framework を導入し、agent behavior を complementary roles に分解する。high-level agent (System 1) が context-aware sub-goal generation を担い、別ロールが実行や適応を支える構成として読める。

## why_relevant_to_games
ゲームを遊ぶ headless agent が「勝つ」「避ける」「調べる」「評価ログを残す」を混同して drift する問題に近い。プレイ方針と評価方針を別ロールに分ける材料。
