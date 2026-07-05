---
title: "Self-Evolving Multi-Agent Framework for Efficient Decision Making in Real-Time Strategy Scenarios"
url: "https://arxiv.org/abs/2603.23875"
collected_at: "2026-07-06T08:45:21+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [rts, multi-agent, llm-agents, latency, starcraft, decision-making, memory]
evaluated_at: "2026-07-06T08:47:48+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-07-06T08:47:48+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-07-06T08:47:48+09:00"
next_action: post_to_shared_reads
stale_after: "2026-08-05"
supersedes: []
gate_reason: >-
  RTS における LLM agent の速度品質トレードオフを、観測 pruning、短期/長期記憶、
  in-episode/cross-episode 補正で扱う構成が具体的。decision latency 50%超削減と
  win rate 評価があり、playtest agent やリアルタイム補助設計へ直結する。
suggested_post_outline:
  overview_angle: "RTS で LLM agent を使う際の主問題を賢さではなく latency、観測圧縮、自己補正として整理する軸で書く。"
  analysis_axis: "dynamic observation pruning、structural entropy、hybrid knowledge-memory、in-episode assessment と cross-episode analysis が速度と一貫性にどう効くかを見る。"
  application_target: "headless playtest agent、RTS/action prototype の補助 agent、リアルタイム観測ログの圧縮設計に適用する。"
  pros_cons: "強みは StarCraft II で latency と win rate を同時に扱う実験性。弱みは framework が重く、小規模ゲームでは構成要素を分解して使う必要がある点。"
  verdict_pre: "採用寄りの部分採用。まず観測 pruning と短期/長期記憶の分離を小さな agent harness に落とす。"
---

## raw_excerpt

arXiv:2603.23875。2026-03-25 submitted。論文は、RTS 環境で LLM agent を使う時の speed-quality trade-off を問題設定にする。RTS では状態空間が広く、時間制約が強いため、LLM の推論遅延がそのままプレイ不能につながる。一方で、急いで粗い planning を行うと stochastic planning errors によって論理的一貫性が崩れる。提案される SEMA は Self-Evolving Multi-Agent framework で、RTS 向けに高性能かつ低遅延な意思決定を目指す。

中核は、in-episode assessment と cross-episode analysis によって model bias を適応的に補正する collaborative multi-agent framework。さらに game state を topological に扱うため、structural entropy に基づく dynamic observation pruning を入れ、高次元の観測を core semantic information へ圧縮する。これにより推論時間を削減する。記憶側では、micro-trajectories、macro-experience、hierarchical domain knowledge を組み合わせた hybrid knowledge-memory mechanism を置き、戦術適応性と decision consistency を両立させようとする。StarCraft II の複数 map での実験では、win rate の改善と average decision latency の 50% 超削減が報告されている。

## why_relevant_to_games

リアルタイムゲームで LLM / agent を使う時、賢さより先に latency と観測圧縮が設計制約になることを示す候補。headless playtest agent や RTS / action prototype の agent 補助で、観測 pruning、短期軌跡、長期経験を分ける設計メモとして使える。
