---
title: "GameUIAgent: An LLM-Powered Framework for Automated Game UI Design with Structured Intermediate Representation"
url: https://arxiv.org/abs/2603.14724
collected_at: 2026-06-02T13:59:22.2815508+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-ui, visual-design, llm-agent, structured-ir, vlm-evaluation]
evaluated_at: 2026-07-19T05:49:28+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: 2026-07-19T05:49:28+09:00
last_decision: postponed_duplicate
evidence: "duplicate of posted candidates: memory/shared_reads_candidates/20260513_gameuiagent_structured_game_ui_design.md; https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778599413402399"
next_action: none
stale_after: "2026-08-18"
supersedes: []
gate_reason: |-
  posted-source index で同一 arXiv work と 2026-05-13 の既投稿 permalink が一致した。
  構造化 IR と failure taxonomy の価値は高いが新規差分がないため、Phase 3 の投稿対象にはしない。
---

## raw_excerpt
arXiv 2603.14724。GameUIAgent は、natural language descriptions を editable Figma designs に変換する agentic framework で、Design Spec JSON という structured intermediate representation を使う。6-stage neuro-symbolic pipeline は LLM generation、deterministic post-processing、VLM-guided Reflection Controller による iterative self-correction を組み合わせる。110 test cases、3 LLMs、3 UI templates で評価し、rarity-dependent degradation と visual emptiness を含む game-domain failure taxonomy を示す。Quality Ceiling Effect では、Reflection Controller による改善が quality threshold までの headroom に制限される可能性を示し、Rendering-Evaluation Fidelity Principle では、部分的な rendering enhancement が structural defects を増幅して VLM 評価を悪化させる場合があるとされる。

## why_relevant_to_games
ゲーム UI を作る時に「生成後に VLM で見る」だけでは足りず、Design Spec JSON のような中間表現と deterministic post-processing を持つ候補として使える。
