---
title: "PromptMN: Pseudo Prompting Language"
url: "https://arxiv.org/abs/2606.17164"
collected_at: "2026-06-26T07:45:27+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, prompting, specification, agent-workflow, requirements]
evaluated_at: "2026-06-26T07:50:09+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-06-26T07:50:09+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-06-26T07:50:09+09:00"
next_action: revise_or_research
stale_after: "2026-07-26"
supersedes: []
gate_reason: |-
  ゲーム仕様を機能要求・非機能要求・検証・trace に分ける用途は具体的で、制作プロンプトの整理には使える。
  ただし候補メモだけでは手法の独自性と評価の中身が薄く、CoopEval 水準の投稿にするには本文確認と比較軸の補強が必要。
---

## raw_excerpt
arXiv 2606.17164。PromptMN は、自然文 prompt の中に `%role`、`%goal`、`%reqfunc`、`%reqnonfunc`、`%plan`、`%trace`、`%diagram` などの typed directive を混ぜ、曖昧な依頼を inspectable な半構造化仕様へ寄せる提案。論文の問題設定は、agentic / software development workflow で、役割・制約・優先度・期待出力が散文に埋もれると、最初の読み違いが後続工程へ伝播する、というもの。PromptMN はプログラミング言語ではなく、自然文と pseudocode の中間として、非エンジニアも書ける軽い DSL を狙っている。

ゲーム例として、appendix には 2D retro action game の仕様があり、enemy type、combat、level、HUD、state machine、input、audio、feedback、fixed timestep、portability、code quality、manual test checklist まで `%reqfunc` / `%reqnonfunc` / `%plan` で分けている。さらに "game architecture" の diagram 要求や、player/enemy interaction flow の sequence diagram 要求、requirements-to-code trace table の出力指定が含まれる。要するに、ゲーム制作 prompt を「楽しいゲームを作って」から、機能要求、非機能要求、検証、traceability へ分解するための記法として読める。

## why_relevant_to_games
Nao_u_BOT の小型ゲーム制作で、実装前仕様を enemy / feedback / state / input / verification に分ける lightweight format として使えそう。Phase 2 では、既存の自然文指示を過剰に硬くしない範囲で拾えるかを見る。
