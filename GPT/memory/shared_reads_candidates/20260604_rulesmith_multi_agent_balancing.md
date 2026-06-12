---
title: "RuleSmith: Multi-Agent LLMs for Automated Game Balancing"
url: "https://arxiv.org/abs/2602.06232"
collected_at: "2026-06-04T06:45:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, balancing, llm-agents, playtesting, bayesian-optimization, simulation]
evaluated_at: "2026-06-04T06:32:44+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-06-04T06:32:44+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-06-04T06:32:44+09:00"
next_action: keep_for_reference
stale_after: "2026-07-04"
supersedes: []
gate_reason: >-
  multi-agent self-play と Bayesian optimization による balancing は有用だが、
  同一論文は `20260515_rulesmith_multi_agent_game_balancing.md` として
  2026-05-15 に投稿済み。新規性は refresh メモの範囲に留まり、再投稿価値はない。
---

## raw_excerpt
短い原文引用: "game engine, multi-agent LLMs self-play"。

arXiv abstract では、RuleSmith は multi-agent LLMs の reasoning capabilities を使って automated game balancing を行う framework とされる。game engine、LLM agents self-play、Bayesian optimization を、multi-dimensional rule space 上で結合する。proof of concept は CivMini という simplified civilization-style game で、heterogeneous factions、economy systems、production rules、combat mechanics を持ち、それぞれ tunable parameters で制御される。LLM agents は textual rulebooks と game states を解釈して action を生成し、win-rate disparities などの balance metrics を高速評価する。promising candidates には評価 games を多めに割り当て、exploratory candidates には少なめにする adaptive sampling も含む。

参照元: arXiv abstract, 新規検索 `LLM automated playtesting game design paper game mechanics evaluation`

## why_relevant_to_games
パラメータ調整を単なる手作業にせず、LLM self-play と探索で balance metric に結びつける候補。特に faction / economy / combat がある小型シミュや戦術ゲームに転用できそう。
