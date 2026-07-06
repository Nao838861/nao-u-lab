---
title: "WorldMemArena: Evaluating Multimodal Agent Memory Through Action-World Interaction"
url: "https://arxiv.org/abs/2605.29341v2"
collected_at: "2026-07-06T13:29:26+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent-memory, evaluation, multimodal-agents, game-testing, harness]
evaluated_at: "2026-07-06T13:36:25+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-07-06T13:36:25+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-07-06T13:36:25+09:00"
next_action: post_to_shared_reads
stale_after: "2026-08-05"
supersedes: []
gate_reason: >-
  長時間 multimodal agent memory を「記憶する・保守する・取り出す・使う」の段階に分けて診断する枠組みが明確。
  ゲーム制作では NPC 記憶や長時間 playtest agent の失敗箇所を終端スコアではなく lifecycle log で切り分ける評価軸として使える。
suggested_post_outline:
  overview_angle: "Action-World Interaction Loop と 4-stage memory lifecycle を中心に、静的 recall benchmark から実世界相互作用中の記憶診断へ移る話として書く。"
  analysis_axis: "gold memory point、update、distractor、evidence chain によって、書けたのに使えない記憶や視覚証拠の利用失敗をどう局所化するか。"
  application_target: "長時間プレイする AI tester、NPC 記憶、agent harness の memory ログ設計。最終勝敗ではなく memory write / maintenance / retrieval / use のどこで壊れたかを見る。"
  pros_cons: "メリットは診断可能性と multimodal evidence の扱い。デメリットは harness memory のコストと、評価環境が実制作ゲームの曖昧な目的にそのまま合うとは限らない点。"
  verdict_pre: "採用。memory 評価 harness の観点として優先度が高い。"
---

## raw_excerpt
arXiv abstract excerpt:

Multimodal large language models are increasingly deployed as long-horizon agents, where memory must do more than recall: it must track an evolving world, revise what has gone stale, and surface the right evidence at decision time. Existing benchmarks measure recall over static dialogue, collapse memory into a single end-of-task accuracy, and reduce visual observations to captions, leaving us unable to localize failures to writing, maintenance, retrieval, or use.

The paper formulates multimodal agent memory as an Action-World Interaction Loop with an observable four-stage lifecycle, and instantiates it in WorldMemArena: 400 multi-session multimodal tasks spanning Lifelong Evolution and Agentic Execution, annotated with gold memory points, updates, distractors, and evidence chains for stage-level diagnosis. Reported results include that better memory writing and storage do not guarantee better performance, visual evidence remains hard to use, systems are unstable across domains, and harness memory is flexible but costly and less reliable.

## why_relevant_to_games
長時間プレイする AI テスターや NPC 記憶の評価で、単なる最終スコアではなく「書く・保守する・取り出す・使う」のどこで壊れたかを分けてログ設計する候補になる。
