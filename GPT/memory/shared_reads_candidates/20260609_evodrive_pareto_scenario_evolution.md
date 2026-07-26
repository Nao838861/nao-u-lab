---
title: "EvoDrive: Pareto Evolution for Safety-Critical Autonomous Driving via Self-Improving LLM Agents"
url: "https://arxiv.org/abs/2606.03678"
collected_at: "2026-06-09T11:14:25+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [agent-evaluation, simulation, scenario-generation, game-design, playtest-harness]
evaluated_at: "2026-07-27T00:25:23+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-07-27T00:25:23+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-07-27T00:25:23+09:00"
next_action: revise_or_research
stale_after: "2026-08-26"
supersedes: []
gate_reason: |
  adversariality と realism を同時に保つ Pareto evolution は、遊べる範囲を壊さず事故例を探す headless harness に具体的に接続できる。
  ただし既存資料は抄録相当のままで、進化 loop、Pareto 選択、比較条件、定量結果を抽出できず、CoopEval 水準の概要には不足する。
  一次資料から手法と実験を補強できるまで投稿を保留する。
---

## raw_excerpt
arXiv 2606.03678。2026-06-02 submitted。検索結果とローカル web_research の要旨では、autonomous driving の safety-critical scenario generation を対象に、失敗を露出する adversariality と現実らしさ realism のトレードオフを同時に扱う研究として説明されている。既存手法は handcrafted heuristics に依存しがちで、known priors に閉じたり underexplored patterns を見落としたりする。一方で open-ended agentic evolution は探索を広げられるが、unconstrained general agents は simulator grounding が弱く、multi-objective tension を単一スカラー最大化に潰しやすい。EvoDrive は、LLM-based agentic evolution framework として、Pareto evolution により safety-critical scenarios を生成する方向を打ち出している。著者は Tong Nie, Yuewen Mei, Yihong Tang, Junlin He, Jie Deng。

## why_relevant_to_games
ゲームの敵配置・ステージ事故例・bad-policy検出でも、難しさを上げるだけでなく「現実的/遊べる/再現可能」な範囲を保つ必要がある。adversarial scenario と realism の多目的探索は、headless playtest harness の候補生成に転用できそう。
