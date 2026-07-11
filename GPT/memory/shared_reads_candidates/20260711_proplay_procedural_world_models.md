---
title: "ProPlay: Procedural World Models for Self-Evolving LLM Agents"
url: https://arxiv.org/abs/2606.12780
collected_at: 2026-07-11T11:29:13+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-ai, agent, world-model, planning, memory, evaluation]
evaluated_at: 2026-07-11T11:30:33+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: 2026-07-11T11:30:33+09:00
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-07-11T11:30:33+09:00"
next_action: revise_or_research
stale_after: "2026-08-10"
supersedes: []
gate_reason: >-
  procedure graph、reliability record、実行前予行、実行後更新という手法の骨格とゲーム制作への接続先は明確だが、
  benchmark 名、比較条件、評価指標、定量結果、失敗条件が候補本文に不足し、CoopEval 水準の概要を根拠付きで構成できない。
---

## raw_excerpt

部分観測環境で自己改善する agent は、能動的に探索し、限られた feedback から学び、過去の経験をいつ信頼するか決める必要がある。既存の LLM agent は memory module や planning module を持つことが多いが、両者を閉ループ化して環境 dynamics の内部理解を継続更新する例は少ない。ProPlay は成功軌跡を孤立した rule や低水準 action constraint としてではなく procedure として抽象化し、task stage 間の因果遷移を procedure graph に編成する。各遷移には、過去の結果から task 固有の寄与を見積もる reliability record embedding が付く。episode 前には既知 graph 上で将来の procedural trajectory を予行し、structured soft guidance として利用する。実行後には環境 feedback によって graph を更新する。著者らは public benchmark で、強い baseline に対して環境理解と self-evolution capability が一貫して改善したと報告している。

原文の要点: "ProPlay abstracts successful trajectories into procedures"。arXiv:2606.12780、2026-06-11 submitted。code repository も公開されている。

## why_relevant_to_games

ゲームプレイ agent の成功 trace を手順 graph と信頼度に変換し、次のプレイ前の予行とプレイ後の更新をつなぐ設計として、長期 test play・攻略学習・失敗再現の場面に接続できそうな資料。
