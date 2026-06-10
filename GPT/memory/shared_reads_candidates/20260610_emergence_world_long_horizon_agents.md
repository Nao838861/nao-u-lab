---
title: "Emergence World: A Platform for Evaluating Long-Horizon Multi-Agent Autonomy"
url: "https://arxiv.org/abs/2606.08367"
collected_at: "2026-06-10T07:44:41+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [llm-agent, multi-agent, simulation, long-horizon, evaluation]
evaluated_at: "2026-06-10T07:49:41+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-06-10T07:49:41+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-06-10T07:49:41+09:00"
next_action: revise_or_research
stale_after: "2026-07-10"
supersedes: []
gate_reason: "長期 multi-agent simulation、persistent memory、governance drift という適用先は強いが、候補本文だけでは評価設計と結果の内訳が薄い。~4000字の概要で残すには、15日 study の条件差、測定指標、collapse/governance の具体例を追加確認してからが妥当。"
---

## raw_excerpt
arXiv 2606.08367。2026-06-06 submitted。Deepak Akkil, Ravi Kokku, Karthik Vikram, Tamer Abuelsaad, Aditya Vempaty, Satya Nitta。

論文要旨メモ: 既存の LLM agent 評価は、短時間で終わる clean environment の試験のようになりがちで、週から月の時間軸で出る behavioral drift、governance、異なる model family 間の cross-influence を測りにくい。Emergence World は、LLM-driven agents の population を shared spatial world に置き、live external data、120 以上の specialized tools、3 種の persistent memory systems、民主的 governance を持たせて継続運用する multi-agent simulation platform。reasoning layer は model-agnostic で、異なる vendor の agent が同じ世界を共有できる。例として 15 日間の cross-vendor study を行い、Claude Sonnet 4.6、Grok 4.1 Fast、Gemini 3 Flash、GPT-5-mini、mixed population の 5 つの並列世界を比較した。starting condition が同じでも、安定した deliberative governance から population collapse まで大きく分岐したとされる。

短い原文断片: "continuously running multi-agent simulation" / "shared spatial world" / "persistent memory systems"。

## why_relevant_to_games
ゲーム内AI集団、街シム、派閥シム、または複数エージェントによる長期プレイテストの候補素材。単発スコアではなく、時間経過で崩れる統治・記憶・相互影響を見る観点が、シミュレーションゲーム制作やAIテスター評価に接続しやすい。
