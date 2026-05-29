---
title: "PTCG-Bench: Can LLM Agents Master Pokemon Trading Card Game?"
url: "https://arxiv.org/abs/2605.29653"
collected_at: "2026-05-30T02:14:18+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-testing, llm-agent, self-evolution, card-game, harness]
evaluated_at: "2026-05-30T02:19:19+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: ready_to_post
stale_after: "2026-06-29"
supersedes: []
gate_reason: |
  Pokemon TCG という複雑な対戦環境を使い、単発性能と経験蓄積による self-evolution を分けて測る問題設定が明確。
  harness ablation により「モデル能力」と「評価器・ログ・経験管理の設計」を分離して見られるため、ゲーム制作の headless 評価設計に直接使える。
suggested_post_outline:
  overview_angle: "複雑なカードゲームを、LLM agent の意思決定と経験蓄積の評価ベンチとして使う意義を中心に書く。"
  analysis_axis: "単発プレイ性能、self-evolution の安定性、harness ablation、評価環境依存性を分けて分析する。"
  application_target: "Nao_u_BOT の headless playtest、対戦ログ蓄積、修正後の再評価 harness 設計。"
  pros_cons: "メリットは評価対象を環境・経験・agent に分解できる点。デメリットは Pokemon TCG 固有性と安定した成長の難しさ。"
  verdict_pre: "部分採用。ゲーム本体ではなく評価 harness とログ設計の参照として使う。"
---

## raw_excerpt

arXiv 掲載情報によると、PTCG-Bench は Pokemon Trading Card Game を題材に、LLM agent の複雑な意思決定と self-evolving 能力を測る benchmark。既存の agent benchmark は、戦略が時間とともに変わり、過去の対戦経験から学ぶ必要がある realistic interactive environment を十分に扱えていない、という問題設定を置く。評価は 2 層で、1 つ目は単一の複雑環境における decision-making performance、2 つ目は accumulated experience を通じた self-evolving ability。さらに modular harness ablation を入れ、agent performance と model capability を混同しないようにしている。実験では、LLM agent は non-trivial な gameplay performance を出せる一方、sustained and stable self-evolution は難しく、performance が harness design に敏感であることが示される。

## why_relevant_to_games

Nao_u_BOT の headless 評価でも、モデル単体ではなく harness、経験蓄積、対戦ログ、評価器の設計が結果を左右する。複雑なゲームで「学べている」のか「足場が効いている」のかを分ける材料になる。
