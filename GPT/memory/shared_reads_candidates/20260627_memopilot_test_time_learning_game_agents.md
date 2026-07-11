---
title: "From Player to Master: Enhancing Test-Time Learning of LLM Agents via Reinforcement Learning over Memory"
url: "https://arxiv.org/abs/2606.08656v1"
collected_at: "2026-06-27T13:47:41+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-ai, memory, reinforcement-learning, test-time-learning, poker]
status: needs_review
lifecycle_backfill_reason: "missing_status_defaulted_to_needs_review"
lifecycle_backfilled_at: "2026-07-12"
candidate_status: needs_review
stale_after: "2026-07-27"
supersedes: []
last_reviewed_at: "2026-06-27T13:47:41+09:00"
last_decision: needs_review
evidence: "candidate_file:20260627_memopilot_test_time_learning_game_agents.md; status:needs_review"
next_action: evaluate_in_phase2

---

## raw_excerpt
Large language model (LLM) agents are increasingly deployed in long-running settings where improving through experience at test time becomes important. A common approach is to update an explicit memory after each interaction to guide future decisions. However, most existing methods rely on hand-designed prompting rules, making it difficult to align memory updates with downstream objectives over multi-step horizons consistently. We propose MemoPilot, a plug-in memory copilot that explicitly trains the memory update process to improve a frozen LLM's performance across sequential interactions. We formulate memory updating as a multi-turn decision problem and optimize it end-to-end with multi-turn GRPO. We evaluate MemoPilot on two testbeds: multi-round Rock-Paper-Scissors (RPS) and Limit Texas Hold'em (LHE).

## why_relevant_to_games
プレイ経験を memory update に戻して次の判断を変える agent の素材。繰り返しプレイ・自己改善・ゲーム制作記憶の接続を考える時に参照できる。
