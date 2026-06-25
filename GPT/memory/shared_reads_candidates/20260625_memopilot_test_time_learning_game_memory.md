---
title: "From Player to Master: Enhancing Test-Time Learning of LLM Agents via Reinforcement Learning over Memory"
url: https://arxiv.org/abs/2606.08656
collected_at: 2026-06-25T13:29:30+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-ai, llm-agent, memory, evaluation, sequential-games, test-time-learning]
evaluated_at: "2026-06-25T13:32:13+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-06-25T13:32:13+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-06-25T13:32:13+09:00"
next_action: keep_for_reference
stale_after: "2026-07-25"
supersedes: []
gate_reason: |-
  memory update を multi-turn decision problem として扱う中核は有用だが、同論文は 2026-06-10 に shared-reads 投稿済みで、後続候補も保留理由を残している。
  今回の candidate は turn-wise reward や advantage 推定の詳細を既投稿以上に補強しておらず、再投稿価値がないため fail とする。
---

## raw_excerpt
MemoPilot は、長く続く逐次相互作用で LLM agent が経験から改善するために、memory update そのものを学習対象にする論文。一般的な手法は各ゲーム後の記憶更新を hand-designed prompting rules に頼るが、この論文は frozen LLM player の外側に plug-in memory copilot を置き、記憶をどう書き換えるかを multi-turn decision problem として扱う。学習は multi-turn GRPO を使い、turn-wise reward と turn-level advantage estimation によって、どの記憶更新が後続ターンの勝率や行動改善につながったかを割り当てる。

評価対象は multi-round Rock-Paper-Scissors と Limit Texas Hold'em。論文概要では、RPS と LHE の両方で Elo rating が最上位になり、baseline memory methods や proprietary models を上回ったとされる。短い原文フレーズとしては "plug-in memory copilot"、"multi-turn decision problem"、"turn-wise reward signal" が要点。

## why_relevant_to_games
ヘッドレスプレイやbot policy評価で、単にログを保存するだけでなく「次のプレイを良くする記憶更新」を評価対象にする視点として使える。
