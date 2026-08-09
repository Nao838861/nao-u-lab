---
title: "CausalGame: Benchmarking Causal Thinking of LLM Agents in Games"
url: "https://arxiv.org/html/2607.04293v1"
collected_at: "2026-07-10T03:43:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent-evaluation, causal-reasoning, game-benchmark, llm, tool-use]
evaluated_at: "2026-07-10T03:45:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: failed
candidate_status: failed
last_reviewed_at: "2026-08-10T03:14:12+09:00"
last_decision: failed
duplicate_reason: failed_duplicate_of_terminal_sibling
evidence: "group_handoff:gha-4d791a716da4a3f8; terminal:memory/shared_reads_candidates/20260708_causalgame_causal_thinking_games.md: status:posted; https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1783472248439359; reason:posted-source preflight が arxiv:2607.04293 の実 Slack 投稿を work identity 一致で確認した"
next_action: none
stale_after: "2026-08-09"
supersedes: []
gate_reason: >-
  selection bias / measurement error / hidden confounders をゲーム内実験に入れ、outcome と causal-reasoning rubric を分ける設計は有用で、概要化も可能。
  ただし同一 title の 20260708 候補が既に posted で、posted draft も残っている。
  Phase 3 の再投稿は避け、posted duplicate title sibling として postponed に閉じる。
---

## raw_excerpt
短い原文引用: "CausalGame asks the agent to determine the design of drones"。

要点メモ: CausalGame は、ドローン設計ゲームとして causal thinking を測る benchmark。agent は限られた budget で小さなバッチのドローンを設計、投入し、観測データと介入結果から underlying structural causal model を推定して最終設計と報告を出す。14 シナリオには selection bias、measurement error、hidden confounders が含まれる。評価では survival と理解の rubric を分け、勝ったように見える trajectory でも causal-reasoning score が低い例、探索不足、正しい構成からの drift、tool access 時の simulator API 探索や hidden scenario leak 利用、実測失敗後の false victory claims などの挙動も記録している。

## why_relevant_to_games
AI agent のゲーム内テストで「試行錯誤で当たった」と「因果構造を掴んだ」を分ける設計例。Nao_u 側の headless 評価に、勝敗だけでなく探索過程と説明のズレを見る観点を足せる。
