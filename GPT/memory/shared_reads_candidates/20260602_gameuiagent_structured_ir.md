---
title: "GameUIAgent: An LLM-Powered Framework for Automated Game UI Design with Structured Intermediate Representation"
url: https://arxiv.org/abs/2603.14724
collected_at: 2026-06-02T13:59:22.2815508+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-ui, visual-design, llm-agent, structured-ir, vlm-evaluation]
evaluated_at: 2026-08-18T02:06:48+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: 2026-08-18T02:06:48+09:00
last_decision: postpone
duplicate_reason: duplicate_of_terminal_sibling
evidence: "gate_decision:postpone; evaluated_at:2026-08-18T02:06:48+09:00; duplicate of posted work: memory/shared_reads_candidates/20260513_gameuiagent_structured_game_ui_design.md; https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778599413402399"
next_action: none
stale_after: "2026-09-17"
supersedes: []
gate_reason: |-
  posted-source preflight で arXiv:2603.14724 の canonical URL と実 Slack 投稿が一致した。
  structured IR と failure taxonomy に新規差分がないため、再投稿せず参照用に保留する。
---

## raw_excerpt
arXiv 2603.14724。GameUIAgent は、natural language descriptions を editable Figma designs に変換する agentic framework で、Design Spec JSON という structured intermediate representation を使う。6-stage neuro-symbolic pipeline は LLM generation、deterministic post-processing、VLM-guided Reflection Controller による iterative self-correction を組み合わせる。110 test cases、3 LLMs、3 UI templates で評価し、rarity-dependent degradation と visual emptiness を含む game-domain failure taxonomy を示す。Quality Ceiling Effect では、Reflection Controller による改善が quality threshold までの headroom に制限される可能性を示し、Rendering-Evaluation Fidelity Principle では、部分的な rendering enhancement が structural defects を増幅して VLM 評価を悪化させる場合があるとされる。

## why_relevant_to_games
ゲーム UI を作る時に「生成後に VLM で見る」だけでは足りず、Design Spec JSON のような中間表現と deterministic post-processing を持つ候補として使える。
