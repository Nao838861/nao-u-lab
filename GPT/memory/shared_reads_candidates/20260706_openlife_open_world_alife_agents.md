---
title: "OpenLife: Toward Open-World Artificial Life with Autonomous LLM Agents"
url: "http://arxiv.org/abs/2606.31046v1"
collected_at: "2026-07-06T10:59:28.5584273+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent, memory, simulation, artificial-life, game-design]
evaluated_at: "2026-07-06T11:03:16.7825624+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-07-06T11:03:16.7825624+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-07-06T11:03:16.7825624+09:00"
next_action: post_to_shared_reads
stale_after: "2026-08-05"
supersedes: []
gate_reason: "Open-world ALIFE を、単体の賢い LLM ではなく memory / perception / evaluation / budget metabolism などの周辺 process 群として捉える軸が明確。生活シミュレーションや長期 NPC に対して、資源制約と外部接続を含む具体的な設計観点へ落とせる。評価の詳細確認は Phase 3 で必要だが、4000 字級の概要を構成できるだけの問題設定と方法の核がある。"
suggested_post_outline:
  overview_angle: "LLM agent を open-world artificial life として成立させるため、記憶・知覚・評価・予算代謝を非同期 process として外付けする設計思想"
  analysis_axis: "閉じた環境のベンチマークではなく、存続・相互作用・コスト制約・外部世界接続を含む ALIFE 枠組みとして読む"
  application_target: "長期運営型 NPC、放置ゲーム、agent colony、生活シミュレーションの周辺 harness と資源制約設計"
  pros_cons: "利点は単体 agent の賢さ依存から脱しやすい点。弱点は実装コストと安全境界、評価指標の設計が重くなる点。"
  verdict_pre: "部分採用。ゲーム本体へ直結させるより、NPC の生活感を支える外部プロセス設計として使う。"
---

## raw_excerpt

arXiv / web_research から拾った要旨メモ。OpenLife は、artificial life を研究者が設計した閉じた環境だけでなく、記憶、ツール利用、ネットワークアクセス、支払いなどを持つ LLM agent が開いた社会的・技術的・経済的環境で持続する問題として扱う。proof-of-concept では、単一の「賢い agent」を置くのではなく、stateless LLM の周囲に memory、perception、evaluation、budget-based metabolism などの非同期 process 群を配置する。固定目標よりも、存続、環境との相互作用、コスト制約、外部世界への接続を含む open-world ALIFE として整理している。

## why_relevant_to_games

生活シミュレーション、放置ゲーム、agent colony、長期運営型 NPC の設計で、単体 AI ではなく周辺 process と資源制約を含めて「生きている感じ」を作る材料になる。
