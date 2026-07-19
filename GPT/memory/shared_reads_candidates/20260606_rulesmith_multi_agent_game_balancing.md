---
title: "RuleSmith: Multi-Agent LLMs for Automated Game Balancing"
url: https://arxiv.org/abs/2602.06232
collected_at: 2026-06-06T20:14:37+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-ai, balancing, multi-agent, simulation, playtesting]
evaluated_at: 2026-06-06T20:17:29+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: postpone
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-19T17:06:18+09:00"
last_decision: failed_duplicate_of_terminal_sibling
evidence: "group_handoff:gha-51c30c4f27de93fe; terminal:memory/shared_reads_candidates/20260515_rulesmith_multi_agent_game_balancing.md: posted; https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778803710961519; posted_source_url_match; reason:posted-source index が arXiv:2602.06232 の実 Slack 投稿を canonical URL/work 一致で確認したため、同一内容の open siblings を閉じる。"
next_action: none
stale_after: "2026-07-06"
supersedes: []
postpone_reason: "Phase 3 review found an existing #shared-reads post for the same URL/content; avoid duplicate posting."
gate_reason: |-
  manual tuning依存のゲームバランス調整を、multi-agent self-playとBayesian optimizationへ分解している。
  CivMiniのfaction / economy / combatという複数要素のある環境で、win-rate disparitiesなどの指標と解釈可能なrule adjustmentを扱う点が具体的。
  小規模プロトタイプの敵・資源・進行パラメータ調整に適用しやすく、4000字級の分析に耐える。
suggested_post_outline:
  overview_angle: "LLMをゲームデザイナーではなく、self-playで偏りを発見する測定器として使う話として書く"
  analysis_axis: "LLM agents、balance metrics、Bayesian optimization、interpretable rule adjustmentsの接続を分析する"
  application_target: "faction差、敵パターン差、economy差が出るプロトタイプの自動バランス探索"
  pros_cons: "利点は反復測定と調整理由の可視化。弱点はCivMini依存、LLM playerの癖、面白さと公平性のズレ"
  verdict_pre: "部分採用"
---

## raw_excerpt
arXiv:2602.06232。2026-02-05 submitted。ゲームバランス調整を、manual tuning と expert intuition に頼る反復作業として置き、multi-agent LLM self-play と Bayesian optimization を game engine に接続する framework として RuleSmith を提案。実証対象は CivMini という simplified civilization-style game。heterogeneous factions、economy systems、production rules、combat mechanics を持ち、tunable parameters で支配される。

短い原文断片: "multi-agent LLMs self-play" / "Bayesian optimization" / "interpretable rule adjustments"。

収集メモ: LLM agents は textual rulebooks と game states を読んで action を生成し、win-rate disparities などの balance metrics を評価する。探索では promising candidates に多めの evaluation games を割り当て、exploratory candidates には少なめにする adaptive sampling を使う。

## why_relevant_to_games
小規模プロトタイプのパラメータ調整を、単発の感想ではなく self-play + metric + 解釈可能な rule adjustment に落とす候補。特に faction / enemy pattern / economy 的な複数要素ゲームで使えそう。
