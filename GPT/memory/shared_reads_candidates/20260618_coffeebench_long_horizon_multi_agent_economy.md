---
title: "CoffeeBench: Benchmarking Long-Horizon LLM Agents in Heterogeneous Multi-Agent Economies"
url: "https://arxiv.org/abs/2606.16613"
collected_at: "2026-06-18T23:59:22+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, agent-evaluation, simulation, multi-agent, economy]
evaluated_at: "2026-06-19T00:02:05+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-21T15:22:43+09:00"
last_decision: failed
duplicate_reason: failed_duplicate_of_terminal_sibling
evidence: "group_handoff:gha-d11a0e3c6d3aee00; terminal:memory/shared_reads_candidates/20260616_coffeebench_long_horizon_multi_agent_economy.md: same arXiv 2606.16613 and equivalent postponed excerpt; memory/shared_reads_candidates/20260617_coffeebench_long_horizon_economy_agents.md: same arXiv 2606.16613 and equivalent postponed excerpt; memory/shared_reads_candidates/20260618_coffeebench_long_horizon_multi_agent_economy.md: same arXiv 2606.16613 and equivalent postponed excerpt; reason:3件とも同一arXiv workの要旨重複であり各候補とも実験条件と成績差の具体性が不足しCoopEval水準へ届かない"
next_action: none
stale_after: "2026-07-19"
supersedes: []
gate_reason: |-
  90日スパンの multi-agent economy、在庫・価格・交渉を含む長期評価という問題設定はゲーム制作に近い。
  ただし今回の candidate は Phase 1 の短い要旨に留まり、評価結果、失敗例、ゲーム内経済やNPC商取引へ移す具体軸が既存の 20260616/20260617 保留候補より厚くなっていない。
  CoopEval 水準の約4000字概要を書くには本文から実験条件と行動差分を補う必要がある。
---

## raw_excerpt
原文の短い核: "a 90-day simulation" / "communication and transactions"。

論文は、LLM agent を単発のパズルではなく、複数企業が在庫、現金、価格、取引先との交渉を抱えながら長期に動く経済シミュレーションで測る benchmark として CoffeeBench を提示している。構成は farmer / roaster / retailer からなる heterogeneous firms で、評価対象 agent は coffee roaster を担当し、他の企業は固定 reference agent が操作する。対象 agent は累積純利益を最大化するため、日々の調達、販売、価格付け、在庫管理、相手とのやり取りを続ける。raw web research では 2026-06-15 公開の arXiv:2606.16613 として検出済み。

## why_relevant_to_games
長期運営シム、交易、資源管理、NPC 経済の評価に使えそう。ゲーム内 agent を「1手の賢さ」ではなく、数十ターン後の在庫・信用・価格形成まで見る候補。
