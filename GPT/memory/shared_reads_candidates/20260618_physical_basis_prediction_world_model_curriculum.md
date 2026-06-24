---
title: "The Physical Basis of Prediction: World Model Formation in Neural Organoids via an LLM-Generated Curriculum"
url: "https://arxiv.org/abs/2509.04633"
collected_at: "2026-06-18T01:44:13+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [world-models, curriculum-design, agent-evaluation, game-ai, pong]
evaluated_at: "2026-06-18T02:04:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-06-18T02:04:00+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-06-18T02:04:00+09:00"
next_action: keep_for_reference
stale_after: "2026-07-18"
supersedes: []
gate_reason: "avoidance、predator-prey、Pong を段階 curriculum として並べる観点は参考になるが、主題は neural organoids の world model 形成で、ゲーム制作への適用は一般的な curriculum 論に留まる。候補本文だけでは評価指標、実験結果、制作プローブへの落とし込みが薄く、CoopEval 水準の概要にするにはこじつけが強い。"
---

## raw_excerpt
arXiv 2509.04633。Brennen Hill。v1 は 2025-09-04、v3 は 2025-11-04。NeurIPS 2025 workshop 関連。要旨では、embodied agent が環境を理解・予測・操作する能力は internal world model に依存すると置き、human neural organoids における world model の形成と適応を調べる枠組みを提案している。curriculum は三つの closed-loop virtual environments からなり、static state-action contingency を学ぶ conditional avoidance task、goal-directed interaction を扱う one-dimensional predator-prey scenario、dynamic continuous-time systems を扱う classic Pong の replication へ進む。各環境について state/action space、sensory encoding、motor decoding、predictable reward と unpredictable punishment に基づく feedback protocol を形式化し、LLM が実験 protocol の生成と最適化を自動化する meta-learning approach も提案している。

## why_relevant_to_games
Pong や predator-prey のような単純環境を、世界モデル形成の段階的 curriculum として使う観点がある。ゲーム AI 評価やチュートリアル設計で、反射課題から予測課題へ上げる段階設計の候補になる。
