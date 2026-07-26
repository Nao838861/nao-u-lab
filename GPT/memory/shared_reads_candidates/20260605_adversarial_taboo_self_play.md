---
title: "Self-playing Adversarial Language Game Enhances LLM Reasoning"
url: "https://arxiv.org/abs/2404.10642"
collected_at: "2026-06-05T15:29:54+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [llm, self-play, adversarial-game, evaluation, reasoning]
evaluated_at: "2026-07-26T16:53:28+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-26T16:53:28+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-07-26T16:53:28+09:00"
next_action: keep_for_reference
stale_after: "2026-08-25"
supersedes: []
gate_reason: |
  hidden target word と adversarial self-play の問題設定は明確だが、RL 手順、benchmark 内訳、比較結果、失敗条件が候補本文にない。
  ゲーム制作への接続も「意図を読む probe」という着想段階で、約4000字に展開すると reasoning 一般論へ流れるため投稿候補から外す。
---

## raw_excerpt
arXiv の概要では、Adversarial Taboo は attacker と defender の 2 player adversarial language game として説明されている。target word は attacker だけが知っており、attacker は defender に target word を無意識に言わせることを狙う。一方 defender は attacker の発話から target word を推測しつつ、その語を口にしないようにする。両者が勝つには target word に関する知識だけでなく、情報が一部隠された会話で推論し、表現する能力が必要になる。著者らは open-source LLM に attacker と defender を self-play させ、game outcomes に基づく reinforcement learning を行うことで、広範な reasoning benchmarks で性能改善が見られたと報告している。反復的な self-play でも reasoning abilities が継続的に促進される、とされている。

## why_relevant_to_games
「相手が何を狙っているか」を読むゲーム設計、LLM テストプレイ、記憶 recall や候補判定の adversarial probe の題材として使える。
