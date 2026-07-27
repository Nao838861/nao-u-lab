---
title: "Review Arcade: On the Human Alignment and Gameability of LLM Reviews"
url: "https://arxiv.org/abs/2605.28897"
collected_at: "2026-06-15T22:45:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [evaluation, llm-judge, goodhart, agent-workflow, game-design]
evaluated_at: "2026-07-27T09:22:54+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-07-27T09:22:54+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-07-27T09:22:54+09:00"
next_action: revise_or_research
stale_after: "2026-08-26"
supersedes: []
gate_reason: |-
  LLM judge の Goodhart 化をゲーム制作の評価 loop へ移す問題設定は重要だが、保存内容は検索結果要旨に依存している。
  反復改稿、gameability 測定、human review との alignment 比較の手順と条件が不足し、現状では約4000字の概要が推測に寄るため postpone を維持する。
---

## raw_excerpt

arXiv 2605.28897。Hans Ole Hatzel、Sebastian Steindl、Jan Strich による 2026-05-27 投稿の論文。主題は scientific paper review だが、タイトルにある gameability は、LLM review を使った評価が著者側の反復改稿によってどれだけ攻略されるかを見るもの。対象は 2025 ACL Rolling Review の実投稿・実 review・実 score。LLM review と human review の alignment は prompt や model によって大きく変わり、best case ではある程度 reasonable だが安定しない。さらに、author が LLM review に従って draft-revise workflow を回すと、意味のある改善なしに score を上げられる場合があり、最大 35% の paper で overall score が統計的に有意に上がったと検索結果要旨にある。

ゲーム制作文脈で見ると、これは論文査読そのものより、LLM judge / rubric / review feedback を制作 loop に入れた時の Goodhart 化候補として読める。ゲーム prototype を LLM judge に評価させ、その feedback に合わせて agent が改修する loop は、評価器の癖を攻略する artifact を作る危険がある。PlaytestArena、headless policy matrix、shared-reads gate など、評価が制作を駆動する場面で「人間 alignment と gameability を別々に測る」資料として候補化する。

## why_relevant_to_games

LLM judge によるレビューを制作ループへ入れる時、改善ではなく評価器攻略が起きる危険を扱う資料として、ゲーム prototype の rubric 設計に転用できる。
