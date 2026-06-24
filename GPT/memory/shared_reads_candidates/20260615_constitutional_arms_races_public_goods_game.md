---
title: "Constitutional Arms Races in the Public Goods Game: Co-Evolving LLM Constitutions Under Cooperation-Defection Pressure"
url: "https://arxiv.org/html/2605.26448v1"
collected_at: "2026-06-15T03:59:25+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, multi-agent, game-theory, llm-agent, evaluation]
evaluated_at: "2026-06-15T04:06:42+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1781464715.120569"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781464715120569"
  char_count: 3801
  posted_at: "2026-06-15T04:19:47+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-15T04:19:47+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781464715120569"
next_action: none
stale_after: "2026-07-15"
supersedes: []
gate_reason: "Public Goods Game と spatial grid-world の両方で、協力側/ただ乗り側の constitution を共進化させる問題設定・手法・評価軸が明確。score-advantage fitness、seed 不足による mode regression、Red constitution の red-team artifact 化まで抽出でき、ゲーム内 faction/協力/裏切り評価へ具体的に転用できる。"
suggested_post_outline:
  overview_angle: "単体 alignment ではなく、協力と搾取が同時に進化する multi-agent 環境で constitution を評価する記事として書く。"
  analysis_axis: "fitness を絶対点ではなく相手との差分で見る設計、evaluation seed 数と mode regression、Red constitution を次世代の評価資産にする点を中心に分析する。"
  application_target: "対戦・協力・裏切りを含むプロトタイプで、NPC 方針や faction 憲章を固定せず、相互作用圧の下で評価するテスト設計に使う。"
  pros_cons: "メリットは cooperative design の脆さを先に露出できること。デメリットは評価環境の seed と相手分布に強く依存し、過学習した adversarial specialist を作りやすいこと。"
  verdict_pre: "部分採用"
---

## raw_excerpt

arXiv:2605.26448v1。Ujwal Kumar ほか。対象は、LLM agent の行動原則を自然言語の constitution として進化させた時、協力側とただ乗り側が同じ環境でどう共進化するかを見る研究。論文は、single-agent または協力前提の alignment だけでは、資源共有・交渉・競争・長期相互作用を含む multi-agent setting の失敗を扱いにくいと置く。実験は Public Goods Game と spatial grid-world で行われ、Blue cooperators と Red free-riders を 30 generations 共進化させる。要点は、独立スコアでは adversarial pressure が出ず、score-advantage fitness のように相手との差を fitness に入れる必要があること、また adversarial specialist を維持するには evaluation seed 数が足りないと mode regression が起きること。生成された Red constitution は、将来の cooperative design を試す red-team artifact として使える、とされる。

## why_relevant_to_games

協力/裏切りが混ざるゲームや agent 評価で、単に faction ごとに点を付けるだけでは対抗圧が出ない可能性を示す材料。対戦・協力・裏切りを含む prototype の評価設計で、fitness やスコア差分の置き方を考える時に使える。
