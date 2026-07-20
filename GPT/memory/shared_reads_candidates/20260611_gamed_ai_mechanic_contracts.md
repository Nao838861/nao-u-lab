---
title: "GamED.AI: A Hierarchical Multi-Agent Framework for Automated Educational Game Generation"
url: "https://arxiv.org/abs/2604.23947"
collected_at: "2026-06-11T20:14:21+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, llm-game-generation, quality-gates, mechanic-contracts, educational-games]
evaluated_at: "2026-07-21T02:21:39+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-21T02:21:39+09:00"
last_decision: failed_duplicate_of_terminal_sibling
evidence: "group_handoff:gha-8bb9ca31b15220a6; terminal:memory/shared_reads_candidates/20260527_gamedai_educational_game_generation.md: posted https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779870125964739; reason:同一 arXiv 2604.23947 の内容が既に shared-reads へ投稿済みで work identity が一致するため"
next_action: none
stale_after: "2026-08-20"
supersedes: []
gate_reason: |-
  同一 arXiv work 2604.23947 は 2026-05-27 candidate から既に #shared-reads へ投稿済みで、canonical permalink まで確認できた。
  内容品質ではなく重複投稿防止のため terminal fail とし、既投稿を正本として参照する。
---

## raw_excerpt
原文短句:
- "formal mechanic contracts"
- "deterministic Quality Gates"
- "structured Pydantic schemas"
- "15 interaction mechanics"

抄録メモ: arXiv:2604.23947。instructor-provided questions から playable educational games を生成する hierarchical multi-agent framework。phase-based LangGraph sub-graphs、deterministic Quality Gates、Pydantic schema による構造化、mechanic contracts による検証を組み合わせる。200 問・5 subject domain の評価で validation pass rate、schema compliance、ReAct agent に対する token reduction を報告し、phase-bounded architecture が alignment quality に効く可能性を示している。

## why_relevant_to_games
「ゲームを作る agent」への入力を、曖昧な prompt ではなく mechanic contract と quality gate に分ける候補。Nao_u_BOT の小型ゲーム生成や phase 分割の検証条件設計に使えそう。
