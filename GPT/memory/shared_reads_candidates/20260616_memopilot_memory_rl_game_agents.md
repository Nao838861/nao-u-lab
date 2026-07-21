---
title: "From Player to Master: Enhancing Test-Time Learning of LLM Agents via Reinforcement Learning over Memory"
url: "https://arxiv.org/abs/2606.08656"
collected_at: "2026-06-16T04:14:27.9360357+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-ai, llm-agent, memory, reinforcement-learning, test-time-learning, evaluation]
evaluated_at: "2026-06-16T04:19:57+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-20T06:07:02+09:00"
last_decision: failed
duplicate_reason: failed_duplicate_of_terminal_sibling
evidence: "group_handoff:gha-5f0a1ccaece64e4a; terminal:memory/shared_reads_candidates/20260610_memopilot_test_time_learning_memory.md: posted https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781045833863959; reason:posted-source index confirms the same arXiv work was already posted so all open siblings are duplicate candidates"
next_action: none
stale_after: "2026-07-16"
supersedes: []
gate_reason: |
  memory update を multi-turn RL として扱う中核は重要だが、現候補メモだけでは reward 設計、turn-level advantage、評価比較の詳細が薄く、4000字概要で説得力を出すには追加確認が必要。
  ゲーム制作への適用も bot / evaluator の学習管理に寄っており、Phase 3 の shared-reads 投稿としては AutoBG や RogueAI より直接性が弱い。
---

## raw_excerpt
arXiv / web_research から拾った要旨メモ。論文は、長く続く環境で LLM agent が test time に経験から改善する必要が増えている一方、既存の明示 memory update は手書き prompt rule に依存し、多段の下流目的へ一貫して合わせにくい、という問題設定から始まる。MemoPilot は、frozen LLM player の横に差し込む plug-in memory copilot として、interaction 後に記憶をどう更新するか自体を multi-turn decision problem として扱い、multi-turn GRPO で end-to-end に最適化する。訓練レシピは turn-wise reward signal と context-independent, turn-level advantage estimation を導入し、multi-turn rollout 内の credit assignment を細かく安定させる。評価は multi-round Rock-Paper-Scissors と Limit Texas Hold'em で行われ、MemoPilot を差し込むことで frozen player の test-time learning が強い baseline memory methods や proprietary models を上回り、LHE と RPS の Elo で上位を報告している。

## why_relevant_to_games
ゲーム内 bot / evaluator を「一回の成功率」ではなく、失敗後の memory update が次試行に効くかで見る材料になる。Nao_u_BOT の記憶システムにも、プレイログから何を残すと再挑戦が改善するかという観点で接続できる。
