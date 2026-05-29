---
title: "Agent Island: A Saturation- and Contamination-Resistant Benchmark from Multiagent Games"
url: https://arxiv.org/abs/2605.04312
collected_at: 2026-05-29T12:30:22+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [multi-agent, game-design, benchmark, cooperation, persuasion, llm-agents]
evaluated_at: 2026-05-29T12:37:16+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
candidate_status: ready_to_post
stale_after: "2026-06-28"
supersedes: []
gate_reason: |-
  saturation / contamination に強い multi-agent game benchmark という問題設定、協力・対立・説得を含む環境、Bayesian Plackett-Luce による ranking、ログ分析までの重要要素が抽出できる。
  Nao_u_BOT の社会心理・交渉・NPC 相互作用ゲームで、ログ設計と行動バイアス評価に具体的に使えるため、Phase 3 投稿水準の概要を書ける。
suggested_post_outline:
  overview_angle: "Agent Island を、LLM 評価論文ではなく「multi-agent ゲームを評価装置として設計する」事例として書く。"
  analysis_axis: "固定タスク飽和への対抗、multi-agent game の動的相互作用、勝敗 ranking と行動ログ分析を分けて整理する。"
  application_target: "社会心理・交渉・NPC 相互作用プロトタイプで、プレイログから協力、裏切り、説得、同盟形成の偏りを後から読める設計。"
  pros_cons: "利点は静的ベンチより汚染に強く、ゲームログが設計知見に戻ること。懸念は winner-take-all 評価が面白さや役割演技を単純化する点。"
  verdict_pre: "部分採用"
---

## raw_excerpt
短い原文断片: "cooperation, conflict, and persuasion" / "winner-take-all game"

arXiv 検索結果から拾った候補。Agent Island は、固定タスクの benchmark が saturation と contamination を起こしやすい問題に対して、multi-agent game を使う動的 benchmark を提案している。language-model agents が協力、対立、説得を含む multiplayer simulation environment で競い、固定問題集ではなく相手 agent との相互作用で能力差を出す構成。skill ranking には Bayesian Plackett-Luce model を使い、公開 game logs を behavior analysis に使えるとしている。

ゲーム制作文脈では、単に「LLM の強さを測る」よりも、ゲームログをどう設計すると agent の協力、裏切り、説得、投票、同陣営バイアスのようなふるまいが後から分析可能になるか、という素材として拾う。対戦/交渉/隠し役職/社会推理系 prototype のログ設計候補にもなる。

## why_relevant_to_games
multi-agent ゲームで saturation しにくい評価を作る候補。Nao_u_BOT の将来の社会推理・交渉・NPC 相互作用ゲームで、ログから行動傾向を分析する設計に使えそう。
