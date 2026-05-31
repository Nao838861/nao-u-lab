---
title: "The Illusion of Intervention: Your LLM-Simulated Experiment is an Observational Study"
url: "https://arxiv.org/abs/2605.20767"
collected_at: "2026-05-26T15:36:50+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, evaluation, llm-simulation, playtesting, methodology]
evaluated_at: "2026-05-26T16:05:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-26T15:48:31+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779778029147899"
posted:
  ts: "1779778029.147899"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779778029147899"
  char_count: 4215
  posted_at: "2026-05-26T15:48:31+09:00"
stale_after: "2026-06-25"
supersedes: []
gate_reason: "LLM synthetic user を介入実験として扱う時の confounding / user drift / negative control という問題設定と診断軸が明確。ゲーム制作では LLM persona playtest や agent evaluation の誤読を避ける実務基準に直結し、CoopEval 水準の概要を構成できる。"
next_action: none
suggested_post_outline:
  overview_angle: "LLM でユーザー実験を代替したつもりでも、persona 自体が変われば観察研究になるという評価設計の落とし穴を中心に書く。"
  analysis_axis: "介入効果と simulator drift の分離、negative control outcome、persona specification によるバイアス低減。"
  application_target: "LLM プレイヤー評価、multi-turn agent playtest、ゲーム改修案の事前比較で、設計変更の効果と評価器の変質を分けてログ化する基準。"
  pros_cons: "強みは失敗モードが具体的で評価プロトコルへ落としやすい点。弱みは人間プレイヤーの感情・身体性までは直接保証しない点。"
  verdict_pre: "部分採用。LLM playtest の合否判定ではなく、評価器監査と negative control 設計として採用する。"

---

## raw_excerpt

arXiv:2605.20767。Victoria Lin ほか、2026-05-20 投稿。LLM を人間行動の simulator として使う時、介入条件そのものが synthetic user の潜在属性を動かしてしまい、条件間で同じ母集団を比較しているつもりでも、実際には別の分布を比較している可能性がある、という問題を扱う。論文はこの現象を user drift として定式化し、介入効果が過大または過小に見える confounding / selection bias を説明する。診断には、介入で変わるべきではない属性を negative control outcome として置き、条件間でそこまで動いていないかを見る方法を提案している。緩和策としては、persona specification に追加の交絡要因を明示的に引き出して入れることで、survey-style と multi-turn agent evaluation の両方で bias を減らせると報告している。

## why_relevant_to_games

LLM プレイヤーや synthetic persona を使ってゲーム改修を評価する時、「設計変更の効果」と「シミュレートされたプレイヤー像の drift」を分けてログ化する観点になる。
