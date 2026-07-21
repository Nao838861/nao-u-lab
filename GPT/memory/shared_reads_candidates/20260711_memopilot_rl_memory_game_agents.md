---
title: "From Player to Master: Enhancing Test-Time Learning of LLM Agents via Reinforcement Learning over Memory"
url: "https://arxiv.org/abs/2606.08656"
collected_at: "2026-07-11T16:55:00+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [llm-agents, game-playing, memory, reinforcement-learning, evaluation]
evaluated_at: "2026-07-11T17:05:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-20T06:07:02+09:00"
last_decision: failed
duplicate_reason: failed_duplicate_of_terminal_sibling
evidence: "group_handoff:gha-5f0a1ccaece64e4a; terminal:memory/shared_reads_candidates/20260610_memopilot_test_time_learning_memory.md: posted https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781045833863959; reason:posted-source index confirms the same arXiv work was already posted so all open siblings are duplicate candidates"
next_action: none
stale_after: "2026-08-10"
supersedes: []
gate_reason: |-
  同一 title・同一 arXiv URL の sibling が 2026-06-10 に #shared-reads 投稿済みであり、Phase 3 の再投稿対象にしない。
  terminal-title preflight により本文の新規品質評価は行わず、重複候補として閉じる。
---

## raw_excerpt

長期運用される LLM agent では、対話や試行のたびに明示的 memory を更新して、その後の意思決定を改善する方法が一般的になっている。一方、従来の memory 更新は人手で設計した prompt rule に依存することが多く、複数 turn の先にある目的へ更新内容を一貫して結び付けにくい。著者らは、固定された player LLM の外側で memory 更新を担う plug-in copilot「MemoPilot」を提案する。memory 更新を multi-turn decision problem として定式化し、multi-turn GRPO で end-to-end に最適化する。学習では turn-wise reward と、rollout 間で計算する context-independent な turn-level advantage estimation を導入し、長い相互作用における credit assignment の粒度と安定性を高める。

評価環境は multi-round Rock-Paper-Scissors と Limit Texas Hold'em。どちらも、相手の過去行動を読みながら次の戦略へ反映する必要がある。MemoPilot は frozen player の test-time learning を改善し、Elo は LHE で 1762、RPS で 1590。比較対象の memory method と proprietary model（DeepSeek-V3.2 を含む）を上回り、両ゲームで首位になったと報告される。論文は ICML 2026 採択。

## why_relevant_to_games

反復プレイから agent が何を記録し、次局の戦略へどう反映するかを、固定 prompt ではなく長期報酬で学習する事例。AI playtester の学習ログ設計や、対戦相手へ適応する NPC の評価に接続できる。
