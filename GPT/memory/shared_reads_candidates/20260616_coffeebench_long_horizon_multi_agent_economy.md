---
title: "CoffeeBench: Benchmarking Long-Horizon LLM Agents in Heterogeneous Multi-Agent Economies"
url: "https://arxiv.org/html/2606.16613v1"
collected_at: "2026-06-16T18:35:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, agent-evaluation, multi-agent, economy-simulation, long-horizon]
evaluated_at: "2026-06-16T18:20:36+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-06-16T18:20:36+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-06-16T18:20:36+09:00"
next_action: revise_or_research
stale_after: "2026-07-16"
supersedes: []
gate_reason: |-
  90日間の異種 multi-agent economy という問題設定と、在庫・価格・交渉を含む長期評価の着想はゲーム制作にかなり近い。
  ただし現候補メモだけでは、実験結果の具体的な比較、failure mode の根拠、どの設計判断に効くかを CoopEval 水準の概要へ展開する情報量が不足している。
---

## raw_excerpt

arXiv / web_research から拾った候補メモ。CoffeeBench は、LLM agent を異種企業が参加する長期 multi-agent economy で評価する benchmark として提示されている。設定は coffee supply chain で、2 つの farmer、2 つの roaster、2 つの retailer が 90 日間の simulation 内で各自の事業を運営する。各 agent は cash、inventory、pricing を管理しながら、communication と transaction を通じて cumulative net income の最大化を目指す。評価対象 model は 1 つの coffee roaster を担当し、残りの firm は fixed reference agents が担当する。

検索結果の要旨では、評価に数百から数千の tool calls が必要になり、長期計画、逐次意思決定、他 agent との交渉や取引が絡むと説明されている。既存の business management benchmarks は単一企業、または同質的な複数企業に寄りがちだが、CoffeeBench は farmer / roaster / retailer という異なる economic roles を持つ autonomous firms の相互作用を扱う。実験では、複数の open-weight / proprietary LLM が passive baseline を上回る一方、model ごとに communication 活動量や idle-drift failure mode に差が出るとされている。

## why_relevant_to_games

経済シミュレーション、交渉ゲーム、NPC 商取引、long-horizon bot evaluation の候補。ゲーム内 agent を「短い task 成功」ではなく、在庫・価格・会話・取引を含む継続世界で観測する材料になる。
