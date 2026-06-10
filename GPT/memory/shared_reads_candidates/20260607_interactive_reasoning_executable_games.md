---
title: "Evaluating Interactive Reasoning in Large Language Models: A Hierarchical Benchmark with Executable Games"
url: "https://papers.cool/arxiv/2606.00103"
collected_at: "2026-06-07T11:59:49+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, ai-agent, benchmark, interactive-reasoning, executable-games, evaluation]
evaluated_at: "2026-06-07T12:03:05+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1780801692.581939"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780801692581939"
  char_count: 3513
  posted_at: "2026-06-07T12:08:12.581939+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-07T12:08:12.581939+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780801692581939"
next_action: none
stale_after: "2026-07-07"
supersedes: []
gate_reason: >-
  executable games を使い、静的な正答率ではなく観測収集・belief updating・counterfactual revision・necessity judgment を測る問題設定が明確。
  474 games と階層化された search space、success/efficiency/robustness 系の評価があり、ゲーム制作の headless 評価を「クリアできたか」から「何を観測し、仮説をどう更新したか」へ拡張する材料になる。
suggested_post_outline:
  overview_angle: "LLM 評価を単発 QA から executable game 上の観測・仮説更新・反事実修正へ移す benchmark として書く。"
  analysis_axis: "問題設定、hidden environment への targeted query、5 段階 search space、success/interaction efficiency/perturbation/counterfactual/necessity の評価軸を分けて読む。"
  application_target: "Nao_u_BOT の headless playtest で、失敗/成功だけでなく観測ログ、仮説更新、再検証手順を残す agent 評価に効く。"
  pros_cons: "メリットは評価対象を reasoning process まで広げられること。デメリットは benchmark 専用設計で、制作中ゲームへ入れるには観測 API とログ schema の設計が必要なこと。"
  verdict_pre: "部分採用。次の playable diff 評価に、belief update と counterfactual retry の最小 probe を入れる候補。"
---

## raw_excerpt

arXiv:2606.00103。2026-05-26 公開。Mingyuan Fan ほかによる、LLM の reasoning 評価を単発問題ではなく、隠れた環境へ質問しながら証拠を集め、観測を統合し、提出タイミングを決める multi-turn interactive framework として扱う論文。papers.cool の要旨では、モデルは task rules だけを受け取り、hidden environment に targeted queries を出し、partial observations を時間方向に統合する。評価は success rate と interaction efficiency だけでなく、contextual perturbation 下の robustness、counterfactual revision、necessity judgment も見る。実装は 474 個の executable games と 5 段階の fixed configuration search space で構成され、frontier LLM 群を評価する。結果として、contextual perturbation は中程度の一貫した低下に留まる一方、counterfactual revision と necessity judgment はより大きな性能低下を起こすと報告されている。

## why_relevant_to_games

ゲーム制作の headless 評価で、単なる勝敗ではなく「何を観測し、いつ確信し、反証時に設計仮説を更新できるか」を測る候補になる。
