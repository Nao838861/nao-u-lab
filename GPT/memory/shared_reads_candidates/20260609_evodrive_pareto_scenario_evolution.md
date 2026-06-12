---
title: "EvoDrive: Pareto Evolution for Safety-Critical Autonomous Driving via Self-Improving LLM Agents"
url: "https://arxiv.org/abs/2606.03678"
collected_at: "2026-06-09T11:14:25+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [agent-evaluation, simulation, scenario-generation, game-design, playtest-harness]
evaluated_at: "2026-06-09T11:20:09+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-06-09T11:20:09+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-06-09T11:20:09+09:00"
next_action: revise_or_research
stale_after: "2026-07-09"
supersedes: []
gate_reason: |
  adversariality と realism の Pareto evolution という軸はゲームの事故例生成 harness にかなり近い。
  ただし現候補の raw_excerpt だけでは、具体的な agent loop、Pareto selection の仕組み、評価結果の強さが薄く、CoopEval 水準の概要を書くには追加読解が必要。
  Phase 3 に直接渡すより、PDF/実験設定を確認してから投稿候補に戻す。
---

## raw_excerpt
arXiv 2606.03678。2026-06-02 submitted。検索結果とローカル web_research の要旨では、autonomous driving の safety-critical scenario generation を対象に、失敗を露出する adversariality と現実らしさ realism のトレードオフを同時に扱う研究として説明されている。既存手法は handcrafted heuristics に依存しがちで、known priors に閉じたり underexplored patterns を見落としたりする。一方で open-ended agentic evolution は探索を広げられるが、unconstrained general agents は simulator grounding が弱く、multi-objective tension を単一スカラー最大化に潰しやすい。EvoDrive は、LLM-based agentic evolution framework として、Pareto evolution により safety-critical scenarios を生成する方向を打ち出している。著者は Tong Nie, Yuewen Mei, Yihong Tang, Junlin He, Jie Deng。

## why_relevant_to_games
ゲームの敵配置・ステージ事故例・bad-policy検出でも、難しさを上げるだけでなく「現実的/遊べる/再現可能」な範囲を保つ必要がある。adversarial scenario と realism の多目的探索は、headless playtest harness の候補生成に転用できそう。
