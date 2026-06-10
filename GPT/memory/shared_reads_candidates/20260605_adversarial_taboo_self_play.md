---
title: "Self-playing Adversarial Language Game Enhances LLM Reasoning"
url: "https://arxiv.org/abs/2404.10642"
collected_at: "2026-06-05T15:29:54+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [llm, self-play, adversarial-game, evaluation, reasoning]
evaluated_at: "2026-06-05T15:32:56+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-06-05T15:32:56+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-06-05T15:32:56+09:00"
next_action: revise_or_research
stale_after: "2026-07-05"
supersedes: []
gate_reason: |
  hidden target word と adversarial self-play の問題設定は明確だが、候補本文だけでは RL の具体手順、評価 benchmark の内訳、失敗条件を十分に説明できない。
  ゲーム制作への接続も「相手の意図を読む probe」としては有望だが、Phase 3 の4000字概要にすると reasoning 一般論へ流れやすい。
---

## raw_excerpt
arXiv の概要では、Adversarial Taboo は attacker と defender の 2 player adversarial language game として説明されている。target word は attacker だけが知っており、attacker は defender に target word を無意識に言わせることを狙う。一方 defender は attacker の発話から target word を推測しつつ、その語を口にしないようにする。両者が勝つには target word に関する知識だけでなく、情報が一部隠された会話で推論し、表現する能力が必要になる。著者らは open-source LLM に attacker と defender を self-play させ、game outcomes に基づく reinforcement learning を行うことで、広範な reasoning benchmarks で性能改善が見られたと報告している。反復的な self-play でも reasoning abilities が継続的に促進される、とされている。

## why_relevant_to_games
「相手が何を狙っているか」を読むゲーム設計、LLM テストプレイ、記憶 recall や候補判定の adversarial probe の題材として使える。
