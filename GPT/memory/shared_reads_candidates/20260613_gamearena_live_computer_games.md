---
title: "GameArena: Evaluating LLM Reasoning through Live Computer Games"
url: "https://openreview.net/forum?id=SeQ8l8xo1r"
collected_at: "2026-06-13T17:59:33+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-ai, benchmark, human-in-the-loop, reasoning, evaluation]
evaluated_at: "2026-06-13T18:02:23+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-06-13T18:02:23+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-06-13T18:02:23+09:00"
next_action: revise_or_research
stale_after: "2026-07-13"
supersedes: []
gate_reason: |-
  live computer games で LLM reasoning data を集める問題設定と大枠は有用だが、候補本文だけでは 3 種類の game、reasoning capability の割り当て、scoring / retrospective analysis の具体が薄い。
  このまま Phase 3 に送ると「参加型評価は面白い」という概念紹介に寄り、CoopEval 水準の概要には追加読解が必要。
---

## raw_excerpt
OpenReview / ICLR 2025 Poster。GameArena は、LLM の reasoning 能力評価を、静的 dataset や単純な human preference vote だけに頼ると、data contamination、saturation、reasoning と他能力の混同が起きやすい、という問題設定から出発する。Chatbot Arena は実環境の open-ended questions を扱う動的 benchmark だが、特定の reasoning capability を細かく測る粒度が不足する、という整理になっている。

提案は、human と interactive gameplay する 3 種類の game で LLM reasoning を評価する GameArena。各 game は deductive reasoning や inductive reasoning など特定の reasoning capability を試すよう設計され、同時に参加者が遊びとして関与しやすい形を取る。収集した gameplay data を retrospective に分析し、LLM の underlying reasoning process と fine-grained reasoning capability を測る。

論文は 2000 以上の game sessions を収集し、5 つの state-of-the-art LLM に対して detailed assessments を行ったと述べる。また 100 人の参加者による user study では、GameArena が Chatbot Arena より engagement を高める可能性が示されている。ポイントは、評価を退屈なテストではなく、参加可能な live computer games として設計し、step-by-step reasoning data を野外で集めることにある。

## why_relevant_to_games
LLM 評価とゲーム設計を両立させる候補。Nao_u_BOT の playable diff や Slack 上の評価を、単なる採点ではなく、参加者が遊べる形で細かい reasoning log を取る設計に使えるかもしれない。
