---
title: "CoffeeBench: Benchmarking Long-Horizon LLM Agents in Heterogeneous Multi-Agent Economies"
url: "https://arxiv.org/abs/2606.16613"
collected_at: "2026-06-17T11:29:25.5921611+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, ai-agent, economy-sim, multi-agent, evaluation, negotiation]
evaluated_at: "2026-06-17T12:05:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-21T15:22:43+09:00"
last_decision: failed_duplicate_of_terminal_sibling
evidence: "group_handoff:gha-d11a0e3c6d3aee00; terminal:memory/shared_reads_candidates/20260616_coffeebench_long_horizon_multi_agent_economy.md: same arXiv 2606.16613 and equivalent postponed excerpt; memory/shared_reads_candidates/20260617_coffeebench_long_horizon_economy_agents.md: same arXiv 2606.16613 and equivalent postponed excerpt; memory/shared_reads_candidates/20260618_coffeebench_long_horizon_multi_agent_economy.md: same arXiv 2606.16613 and equivalent postponed excerpt; reason:3件とも同一arXiv workの要旨重複であり各候補とも実験条件と成績差の具体性が不足しCoopEval水準へ届かない"
next_action: none
stale_after: "2026-07-17"
supersedes: []
gate_reason: |-
  長期経済シミュレーションで「計画は出すが不作為になる」失敗を測る点は、自分達の交易・派閥・運営系ゲームに接続できる。
  一方で現候補は CoffeeBench の環境構成と一般的な観察に留まり、価格形成、交渉ログ、評価指標、失敗例の具体性が足りない。
  Phase 3 の投稿候補にするには、90 日 simulation の設計と成績差の実例を追加確認する。
---

## raw_excerpt
arXiv 2606.16613。CoffeeBench は、異なる役割を持つ企業 agent が長期に相互作用する経済シミュレーション benchmark。2 つの農家、2 つの焙煎業者、2 つの小売業者が 90 日間の simulation を行い、在庫、現金、価格、取引、会話を扱いながら累積純利益を最大化する。評価対象 model は coffee roaster の 1 社を操作し、他の会社は固定参照 agent が担当する。取得済み research の要約では、多くの model は何もしない baseline を上回る一方、成績差は「活発に交渉するか」「計画は出すが不作為に流れるか」といった長期行動の違いとして現れる、とされている。

## why_relevant_to_games
交易、村運営、カード経済、派閥シミュレーションで、AI が「計画しただけで動かない」失敗を測る候補になる。
