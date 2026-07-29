---
title: "PromptMN: Pseudo Prompting Language"
url: "https://arxiv.org/abs/2606.17164"
collected_at: "2026-06-26T07:45:27+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, prompting, specification, agent-workflow, requirements]
evaluated_at: "2026-07-29T10:54:43+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-29T10:54:43+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-07-29T10:54:43+09:00"
next_action: keep_for_reference
stale_after: "2026-08-28"
supersedes: []
gate_reason: |-
  typed directive で機能要求、非機能要求、検証、trace を分けるゲーム例は具体的だが、既存の要求仕様や構造化 prompt に対する固有の改善を示す比較評価がない。
  手法の有効性、失敗条件、実測結果を抽出できず、ゲーム appendix の紹介だけでは CoopEval 水準の「残すべき」分析にならないため候補として閉じる。
---

## raw_excerpt
arXiv 2606.17164。PromptMN は、自然文 prompt の中に `%role`、`%goal`、`%reqfunc`、`%reqnonfunc`、`%plan`、`%trace`、`%diagram` などの typed directive を混ぜ、曖昧な依頼を inspectable な半構造化仕様へ寄せる提案。論文の問題設定は、agentic / software development workflow で、役割・制約・優先度・期待出力が散文に埋もれると、最初の読み違いが後続工程へ伝播する、というもの。PromptMN はプログラミング言語ではなく、自然文と pseudocode の中間として、非エンジニアも書ける軽い DSL を狙っている。

ゲーム例として、appendix には 2D retro action game の仕様があり、enemy type、combat、level、HUD、state machine、input、audio、feedback、fixed timestep、portability、code quality、manual test checklist まで `%reqfunc` / `%reqnonfunc` / `%plan` で分けている。さらに "game architecture" の diagram 要求や、player/enemy interaction flow の sequence diagram 要求、requirements-to-code trace table の出力指定が含まれる。要するに、ゲーム制作 prompt を「楽しいゲームを作って」から、機能要求、非機能要求、検証、traceability へ分解するための記法として読める。

## why_relevant_to_games
Nao_u_BOT の小型ゲーム制作で、実装前仕様を enemy / feedback / state / input / verification に分ける lightweight format として使えそう。Phase 2 では、既存の自然文指示を過剰に硬くしない範囲で拾えるかを見る。
