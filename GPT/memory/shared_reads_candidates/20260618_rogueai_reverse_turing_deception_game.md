---
title: "RogueAI: A Reverse Turing Test for Detecting Licensed AI Deception in Dialogue"
url: "https://arxiv.org/abs/2606.13310"
collected_at: "2026-06-18T23:59:22+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, social-deduction, dialogue, deception, llm-agents]
evaluated_at: "2026-06-19T00:02:05+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-06-19T00:02:05+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-06-19T00:02:05+09:00"
next_action: keep_for_reference
stale_after: "2026-07-19"
supersedes: []
duplicate_of: "memory/shared_reads_candidates/20260616_rogueai_reverse_turing_deception_game.md"
gate_reason: |-
  RogueAI 自体は one-on-two interrogation game、licensed deception、AutoRogueAI まで抽出でき、ゲーム制作への適用性も高い。
  しかし同一題材は 20260616/20260617 候補で既に pass かつ posted 済みで、今回の candidate は短い要旨のみの重複である。
  Phase 3 の投稿 queue を汚さないため、既存 posted 候補への参照用として fail にする。
---

## raw_excerpt
原文の短い核: "one-on-two interrogation game" / "licensed to deceive"。

論文は、現代的な Turing Test を「相手が人工かどうか」ではなく「信頼できるかどうか」に置き換え、RogueAI という対話ゲームとして実装している。プレイヤーは二つの LLM agent に質問し、そのうち一方だけが共有フィクション内で欺く許可を持つ。手作り scenario と、プレイヤーが narrator agent と一緒に open-ended scenario を作る AutoRogueAI がある。raw web research では 2026-06-11 公開の arXiv:2606.13310 として検出済み。

## why_relevant_to_games
社会推理、尋問、NPC の嘘、会話ログからの推理をプロトタイプ化する材料。対話を単なる flavour text ではなく、信頼判定と hidden role の mechanic に変換する候補。
