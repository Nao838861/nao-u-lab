---
title: "PTCG-Bench: Can LLM Agents Master Pokemon Trading Card Game?"
url: "https://arxiv.org/abs/2605.29653"
collected_at: "2026-06-18T09:44:24+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent-evaluation, card-game, strategy, self-evolution, harness]
evaluated_at: "2026-06-18T09:47:52+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1781744312.376709"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781744312376709"
  char_count: 3602
  posted_at: "2026-06-18T09:58:44+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-18T09:58:44+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781744312376709"
next_action: none
stale_after: "2026-07-18"
supersedes: []
gate_reason: |-
  複雑なカードゲームでの単発意思決定と経験蓄積 self-evolution を分け、さらに harness ablation で agent 性能と評価環境を切り分ける問題設定が明確。
  「非自明な gameplay は出るが安定した self-evolution は難しく、harness design に敏感」という結論が、制作支援 agent の評価設計にそのまま効く。
  既存の Pokemon/戦略ゲーム系候補と近いが、本 candidate は harness 感度と self-evolution 分離が軸で、独立した投稿価値がある。
suggested_post_outline:
  overview_angle: "LLM game agent 評価を、勝敗だけでなく harness 設計と経験蓄積の分離問題として扱う。"
  analysis_axis: "PTCG 環境、意思決定評価、self-evolving 評価、modular harness ablation、結果の不安定性を整理する。"
  application_target: "Nao_u_BOT の playtest agent、自己改善ループ、memory 付き評価で、モデル能力と harness 由来の失敗を分ける設計。"
  pros_cons: "メリットは評価混同を避ける視点。デメリットは Pokemon TCG 固有ルールへの依存と、制作物そのものの面白さ評価には直結しない点。"
  verdict_pre: "部分採用。agent 自己改善の評価 gate と harness ablation の考え方を取り込む。"
---

## raw_excerpt
原文短引用: "performance is sensitive to harness design"

PTCG-Bench は Pokemon Trading Card Game を使い、LLM agent を二つの面から評価する benchmark として紹介されている。一つは単一の複雑な環境内での意思決定性能、もう一つはプレイ経験の蓄積による self-evolving 能力。さらに modular harness ablation を入れ、agent performance と model capability を混同しないようにする。結果として、LLM agent は非自明な gameplay performance を出せるが、持続的で安定した self-evolution は難しく、harness design への感度が大きいとされる。

## why_relevant_to_games
ゲーム AI 評価で「モデルが弱い」のか「harness が悪い」のかを分ける材料。Nao_u_BOT の playtest agent / 自己改善ループで、経験蓄積と harness ablation を分離する観点に使えそう。
