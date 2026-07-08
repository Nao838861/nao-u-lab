---
title: "CausalGame: Benchmarking Causal Thinking of LLM Agents in Games"
url: "https://arxiv.org/abs/2607.04293"
collected_at: "2026-07-08T09:44:17+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, agent-evaluation, causal-reasoning, interactive-games, scientific-discovery]
evaluated_at: "2026-07-08T09:48:56+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1783472248.439359"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1783472248439359"
  char_count: 3596
  posted_at: "2026-07-08T09:57:54+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-07-08T09:57:54+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1783472248439359"
next_action: none
stale_after: "2026-08-07"
supersedes: []
gate_reason: >-
  causal thinking を interactive games で測るという問題設定、selection bias / measurement error / hidden confounder を明示的に入れる着想、実験設計、4 scenario、20 LLM agents の結果まで抽出できる。
  自作ゲームの headless playtest を「成功率」だけでなく、仮説、観測、介入、説明 report で評価する probe に直結し、CoopEval 水準の概要に展開できる。
suggested_post_outline:
  overview_angle: "AI Scientist agent 評価を、因果推論を要する interactive game として設計する benchmark として読む"
  analysis_axis: "相関と因果の切り分け、selection bias / measurement error / hidden confounder の仕込み、survival score と causal-reasoning rubric の乖離"
  application_target: "Log_cdx の自作ゲーム playtest 評価を、単なるクリア率ではなく観測設計と因果説明の probe に拡張する"
  pros_cons: "長所は評価対象の失敗理由を因果推論の型で分解できる点。短所は benchmark 色が強く、個別ゲームへの移植にはシナリオ設計コストがかかる点。"
  verdict_pre: "部分採用"
---

## raw_excerpt

arXiv:2607.04293。2026-07-05 submitted。CausalGame は、AI Scientist agent に必要な causal thinking を、interactive games で測る benchmark として提示されている。問題設定は、科学的発見では観測から因果関係を見つけ、相関と因果を区別し、selection bias、measurement error、hidden confounder を疑う能力が必要だが、既存 benchmark はこれらを明示的に入れていない、というもの。

原文の短い核: "selection bias, measurement error, and hidden confounders"。

ゲーム内では LLM agent が実験プロトコルを能動的に設計し、観測データを集め、最終解と explanation report を出す。14 scenario が用意され、30 LLM agents の評価では best model でも analytical optima 78-85% に対して 68.0% survival、causal-reasoning rubric で credit を得た session は 5-7% とされる。ゲームを、単なる score task ではなく、仮説を立て、偏った観測を疑い、介入を選ぶ実験場として使う候補。

## why_relevant_to_games

自作ゲームの headless playtest を「成功率」だけでなく、原因推定・介入設計・bias の見落としを測る probe に変える時の候補になる。
