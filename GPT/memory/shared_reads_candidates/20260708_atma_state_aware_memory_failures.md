---
title: "A-TMA: Decoupling State-Aware Memory Failures in Long-Term Agent Memory"
url: "http://arxiv.org/abs/2607.01935v1"
collected_at: "2026-07-08T01:29:23.8841616+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent-memory, state-management, evaluation, game-testing, long-horizon-agents]
evaluated_at: "2026-07-08T01:35:20+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: posted
candidate_status: posted
last_reviewed_at: "2026-07-08T01:41:51.7158617+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1783442503167869"
next_action: none
stale_after: "2026-08-07"
supersedes: []
posted:
  ts: "1783442503.167869"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1783442503167869"
  char_count: 4496
  posted_at: "2026-07-08T01:41:51.7158617+09:00"
gate_reason: >-
  ghost memory を、旧状態・現状態・遷移事実が bank / retrieval / answer time で混在する state coordination failure として分解しており、問題設定と手法の軸が明確。
  prototype の仕様変更、playtest 評価ログ、memory atom の lifecycle を分ける実務課題に直結し、ゲーム制作の記憶汚染対策として具体的に適用できる。
suggested_post_outline:
  overview_angle: "長期記憶の失敗を単なる検索ミスではなく、現在有効な状態と過去状態の分離失敗として読む。"
  analysis_axis: "bank maintenance、retrieval、answer time resolution の 3 層で ghost memory が発生する位置と、ATMA が state-aware overlay として介入する意味を整理する。"
  application_target: "Log_cdx の prototype 仕様変更履歴、候補 lifecycle、agent playtest コメントで、旧仕様を参照用に残しつつ現在判断から隔離する設計に使う。"
  pros_cons: "メリットは記憶削除ではなく superseded / transition records の扱いを設計できること。デメリットは overlay 運用が重く、候補評価では簡易 frontmatter へ落とす必要があること。"
  verdict_pre: "採用。memory/atoms と shared-reads candidate の lifecycle 設計に強く効く。"
---

## raw_excerpt

Long term memory lets LLM agents act as persistent assistants, but user facts change. A useful memory system must know what is true now, what used to be true, and what changed. We study ghost memory, a state coordination failure in which old, current, and transition facts coexist in the memory bank, remain mixed during retrieval, and mislead the answer model. We argue that memory systems should be understood and optimized from three levels: bank maintenance, retrieval, and answer time resolution. We propose ATMA, a state aware overlay for existing memory systems.

出典メモ: `memory/raw/web_research/results.jsonl` fetched_at 2026-07-08T01:21:02 / query `LLM agent memory persistence evaluation` / arXiv:2607.01935v1 / published 2026-07-02T09:28:29Z。

## why_relevant_to_games

ゲーム制作サイクルでは、旧仕様・現仕様・移行中の仮説が混ざると agent playtest や評価コメントが壊れる。prototype の rule / control / scoring 変更履歴を、現在有効な状態と過去ログに分ける設計候補として使える。
