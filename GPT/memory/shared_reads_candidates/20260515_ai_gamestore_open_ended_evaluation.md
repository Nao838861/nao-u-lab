---
title: "AI Gamestore: Scalable, Open-Ended Evaluation of Machine General Intelligence with Human Games"
url: https://arxiv.org/abs/2602.17594
collected_at: 2026-05-15T12:59:38+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-benchmark, vlm, open-ended-evaluation, human-games]
evaluated_at: 2026-05-15T13:02:59+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: fail
candidate_status: failed
status: failed
last_reviewed_at: "2026-05-15T13:02:59+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-05-15T13:02:59+09:00"
stale_after: "2026-06-14"
supersedes: []
next_action: keep_for_reference
gate_reason: |-
  人間向けゲームを AI 評価器にする構想は面白いが、今回の目的であるゲーム制作への具体適用は「テスト環境として見られる」程度に留まる。
  構想規模が大きく、Nao_u の小型プロトタイプ制作サイクルへ落とすには抽象度が高い。
  Phase 3 の 4000字投稿としては、現時点では benchmark 論の紹介に寄りすぎる。

---

## raw_excerpt
arXiv:2602.17594, submitted 2026-02-19. The paper proposes evaluating machine intelligence through human-designed games. Short source phrases: "all conceivable human games", "Multiverse of Human Games", and "less than 10% of the human average score".

メモ: LLM と human-in-the-loop で、Apple App Store と Steam の top charts から代表的なゲーム環境を合成・標準化・コンテナ化する構想。proof of concept では 100 ゲームを生成し、7 つの frontier VLM を短いプレイエピソードで評価している。特に world-model learning, memory, planning を要求するゲームで苦戦したとされる。既存 benchmark の静的化・飽和問題への対案として、ゲーム空間を広げ続ける方向。

## why_relevant_to_games
ゲームを「AI の能力評価器」として扱う視点。こちらの小型プロトタイプも、VLM/agent がどこで詰まるかを見るテスト環境として設計できる可能性がある。
