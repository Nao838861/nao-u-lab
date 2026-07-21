---
title: "AGI Maze as a Benchmark Framework for World-Modeling Agents"
url: "https://arxiv.org/pdf/2607.00627"
collected_at: "2026-07-10T03:43:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent-evaluation, world-model, maze, memory, game-benchmark]
evaluated_at: "2026-07-10T03:45:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-07-10T03:45:00+09:00"
last_decision: postponed
duplicate_reason: postponed_duplicate
evidence: "duplicate of posted candidates: memory/shared_reads_candidates/20260706_agi_maze_world_modeling_agents.md; permalink https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1783322184028869"
next_action: none
stale_after: "2026-08-09"
supersedes: []
gate_reason: >-
  部分観測 maze、world state representation、working memory baseline、step budget の失敗分析は、ゲーム制作の headless probe に接続できる。
  しかし同一 title の 20260706 候補が既に posted で、mixed duplicate queue も terminal posted sibling を示している。
  新規の Phase 3 投稿には回さず、posted duplicate title sibling として postponed にする。
---

## raw_excerpt
短い原文引用: "world models are about state and representation, not only about rules"。

要点メモ: AGI Maze は、LLM agent が部分観測の迷路で持続的な世界状態表現を作れるかを見る軽量ベンチマーク。論文は、通常の LLM は静的な次トークン予測器であり、履歴テキストや RAG だけでは「何が世界で真か」を安定して操作できる表現になりにくい、という問題設定から始めている。迷路は低次元だが、局所ルール推定ではなく、未観測状態、記憶、地図、長期探索を必要にする。初期評価では vanilla LLM は小さな迷路でも内部表現が不安定で、メッセージ履歴を作業記憶として使う baseline でも人間に十分な step budget 内で安定解決するには足りないとしている。

## why_relevant_to_games
ヘッドレスプレイ評価で「ルールを知っている」だけでなく「状態を表現して使えているか」を分けて測る材料。迷路や探索ゲームの agent テスト設計に直接使えそう。
